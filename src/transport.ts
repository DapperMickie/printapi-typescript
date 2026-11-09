import { APIError, ConnectionError, InvalidResponseError, RequestAbortedError, TimeoutError, apiError } from './errors.js';

export type Fetch = typeof globalThis.fetch;
export interface RequestOptions {
  /** Total deadline in milliseconds, including authentication, backoff and response parsing. */
  timeoutMs?: number;
  signal?: AbortSignal;
  /** Retries for GET only. POST operations always send at most once. */
  maxRetries?: number;
  headers?: HeadersInit;
}
export interface ResponseResult<T> {
  data: T;
  /** Body has already been consumed. Use data for the parsed response. */
  response: Response;
  requestId: string | undefined;
}
/** A normal promise with opt-in HTTP metadata. Both views share one network request. */
export class APIPromise<T> extends Promise<T> {
  static override get [Symbol.species](): PromiseConstructor { return Promise; }
  private readonly result: Promise<ResponseResult<T>>;
  constructor(result: Promise<ResponseResult<T>>) {
    super((resolve, reject) => { result.then(value => resolve(value.data), reject); });
    this.result = result;
  }
  withResponse(): Promise<ResponseResult<T>> {
    // A metadata-only caller handles failure on result instead of the data promise.
    void this.catch(() => {});
    return this.result;
  }
}
export interface TransportOptions {
  baseURL: string;
  fetch?: Fetch;
  timeoutMs?: number;
  maxRetries?: number;
  headers?: HeadersInit;
}
export type TokenProvider = (signal: AbortSignal) => Promise<string>;
export interface WireRequest {
  method: 'GET' | 'POST';
  path: string;
  query?: object | undefined;
  json?: unknown;
  body?: BodyInit | undefined;
  contentType?: string | undefined;
}
export function validateNumber(value: number, name: string, integer = false): void {
  if (!Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) {
    throw new TypeError(`${name} must be a finite non-negative ${integer ? 'integer' : 'number'}`);
  }
}
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const timer = setTimeout(done, ms);
    function done() { signal.removeEventListener('abort', aborted); resolve(); }
    function aborted() { clearTimeout(timer); signal.removeEventListener('abort', aborted); reject(signal.reason); }
    signal.addEventListener('abort', aborted, { once: true });
  });
}
/** Also enforces deadlines for credential providers or injected fetch implementations that ignore signals. */
function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const aborted = () => reject(signal.reason);
    if (signal.aborted) aborted();
    else signal.addEventListener('abort', aborted, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', aborted));
  });
}
function retryDelay(response: Response | undefined, attempt: number): number {
  const header = response?.headers.get('retry-after');
  if (header) {
    const seconds = Number(header);
    const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now();
    if (Number.isFinite(delay) && delay >= 0) return Math.min(delay, 2_147_483_647);
  }
  return Math.min(500 * 2 ** attempt, 8000) * (0.75 + Math.random() * 0.25);
}
const retryStatuses = new Set([408, 429, 500, 502, 503, 504]);

export class Transport {
  readonly baseURL: string;
  readonly fetch: Fetch;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly headers: Headers;
  constructor(options: TransportOptions, private readonly token?: TokenProvider) {
    const url = new URL(options.baseURL);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new TypeError('baseURL must use HTTP or HTTPS');
    if (url.username || url.password || url.search || url.hash) throw new TypeError('baseURL must not contain credentials, query or fragment');
    this.baseURL = url.toString().replace(/\/$/, '');
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.maxRetries = options.maxRetries ?? 2;
    validateNumber(this.timeoutMs, 'timeoutMs');
    if (this.timeoutMs === 0 || this.timeoutMs > 2_147_483_647) throw new TypeError('timeoutMs must be between 0 and 2147483647, exclusive of 0');
    validateNumber(this.maxRetries, 'maxRetries', true);
    this.headers = new Headers(options.headers);
  }
  request<T>(request: WireRequest, options: RequestOptions = {}, authenticate = true): APIPromise<T> {
    return new APIPromise(this.perform<T>(request, options, authenticate));
  }
  private async perform<T>(request: WireRequest, options: RequestOptions, authenticate: boolean): Promise<ResponseResult<T>> {
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    validateNumber(timeoutMs, 'timeoutMs');
    if (timeoutMs === 0 || timeoutMs > 2_147_483_647) throw new TypeError('timeoutMs must be between 0 and 2147483647, exclusive of 0');
    validateNumber(maxRetries, 'maxRetries', true);
    const controller = new AbortController();
    const signal = controller.signal;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    const onAbort = () => controller.abort(options.signal?.reason);
    if (options.signal?.aborted) onAbort();
    else options.signal?.addEventListener('abort', onAbort, { once: true });
    try {
      signal.throwIfAborted();
      const url = new URL(this.baseURL + request.path);
      for (const [key, value] of Object.entries(request.query ?? {})) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
      }
      const headers = new Headers(this.headers);
      new Headers(options.headers).forEach((value, key) => headers.set(key, value));
      headers.set('Accept', 'application/json');
      if (authenticate && this.token) {
        const token = await abortable(this.token(signal), signal);
        if (typeof token !== 'string' || !token) throw new TypeError('Access token must be a non-empty string');
        headers.set('Authorization', `Bearer ${token}`);
      }
      let body = request.body;
      if (request.json !== undefined) { body = JSON.stringify(request.json); headers.set('Content-Type', 'application/json'); }
      else if (request.contentType) headers.set('Content-Type', request.contentType);
      else if (body instanceof FormData) headers.delete('Content-Type');
      for (let attempt = 0; ; attempt++) {
        let response: Response;
        try {
          response = await abortable(this.fetch(url, { method: request.method, headers, ...(body === undefined ? {} : { body }), signal, redirect: 'error' }), signal);
        } catch (cause) {
          if (signal.aborted) throw cause;
          if (request.method === 'GET' && attempt < maxRetries) { await sleep(retryDelay(undefined, attempt), signal); continue; }
          throw new ConnectionError('Could not reach PrintAPI', { cause });
        }
        if (request.method === 'GET' && attempt < maxRetries && retryStatuses.has(response.status)) {
          await abortable(response.body?.cancel() ?? Promise.resolve(), signal);
          await sleep(retryDelay(response, attempt), signal);
          continue;
        }
        let text: string;
        try { text = await abortable(response.text(), signal); }
        catch (cause) { throw new ConnectionError('Could not read PrintAPI response', { cause }); }
        let data: unknown;
        try { data = text ? JSON.parse(text) : undefined; }
        catch (cause) {
          if (!response.ok) throw apiError(response, text);
          throw new InvalidResponseError(`PrintAPI returned invalid JSON with HTTP ${response.status}`, { cause });
        }
        if (!response.ok) throw apiError(response, data);
        if (data === undefined && response.status !== 204 && response.status !== 205) throw new InvalidResponseError('PrintAPI returned an empty JSON response');
        return { data: data as T, response, requestId: response.headers.get('x-request-id') ?? response.headers.get('request-id') ?? undefined };
      }
    } catch (cause) {
      if (timedOut) throw new TimeoutError(`PrintAPI request exceeded ${timeoutMs}ms`, { cause });
      if (options.signal?.aborted) throw new RequestAbortedError('PrintAPI request was aborted', { cause: options.signal.reason });
      if (cause instanceof APIError) throw cause;
      throw cause;
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
    }
  }
}
