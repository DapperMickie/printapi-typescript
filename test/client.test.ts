import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { PrintAPI, APIError, AuthenticationError, BadRequestError, ConflictError, ConnectionError, InternalServerError, InvalidResponseError, NotFoundError, PermissionDeniedError, RateLimitError, RequestAbortedError, TimeoutError } from '../src/index.js';
import type { Fetch, OrderIn } from '../src/index.js';

const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), { status, headers });
function setup(handler: (url: URL, init: RequestInit) => Response | Promise<Response> = () => json({})) {
  const fetch = vi.fn<Fetch>(async (input, init) => handler(new URL(String(input)), init!));
  return { fetch, client: new PrintAPI({ accessToken: 'token', fetch, maxRetries: 0 }) };
}
afterEach(() => vi.useRealTimers());

// This inventory is exercised against the real public methods, then compared with the vendored contract.
const operations: [string, string, (c: PrintAPI) => PromiseLike<unknown>, unknown?][] = [
  ['POST', '/checkout/{code}', c => c.checkout.setup('id', { returnUrl: 'https://example.com' }), { returnUrl: 'https://example.com' }],
  ['GET', '/checkout/{code}', c => c.checkout.retrieve('id')],
  ['POST', '/coupons/quote', c => c.coupons.quote({ code: 'coupon' }), { code: 'coupon' }],
  ['GET', '/orders/{id}', c => c.orders.retrieve('id')],
  ['GET', '/orders', c => c.orders.list()],
  ['POST', '/orders', c => c.orders.create({ items: [] }), { items: [] }],
  ['GET', '/orders/{id}/status', c => c.orders.status('id')],
  ['POST', '/orders/{id}/cancellation', c => c.orders.cancel('id', { reason: 'test' }), { reason: 'test' }],
  ['GET', '/orders/{id}/cancellation', c => c.orders.cancellation('id')],
  ['GET', '/products', c => c.products.list()],
  ['GET', '/products/{id}', c => c.products.retrieve('id')],
  ['POST', '/shipping/quote', c => c.shipping.quote({ country: 'NL' }), { country: 'NL' }],
  ['GET', '/sync/statuses', c => c.sync.statuses()],
  ['POST', '/files/{code}', c => c.files.upload('id', { body: new Uint8Array([1]), contentType: 'application/pdf' })],
];
describe('complete operation coverage', () => {
  it('matches every operation in the current OpenAPI document', () => {
    const spec = JSON.parse(readFileSync(new URL('../openapi/printapi-v2.json', import.meta.url), 'utf8'));
    const documented = Object.entries(spec.paths).flatMap(([path, item]) => Object.keys(item as object).filter(m => ['get','post','put','patch','delete','head','options','trace'].includes(m)).map(m => `${m.toUpperCase()} ${path}`));
    expect(operations.map(([m,p]) => `${m} ${p}`).sort()).toEqual(documented.sort());
  });
  it.each(operations)('%s %s serializes the public resource call', async (method, template, call, body) => {
    const { fetch, client } = setup((url, init) => {
      expect(url.origin).toBe('https://test.printapi.nl');
      expect(url.pathname).toBe('/v2' + template.replace(/\{[^}]+\}/g, 'id'));
      expect(init.method).toBe(method);
      const headers = new Headers(init.headers);
      expect(headers.get('authorization')).toBe('Bearer token');
      expect(headers.get('accept')).toBe('application/json');
      expect(init.redirect).toBe('error');
      if (body !== undefined) {
        expect(JSON.parse(init.body as string)).toEqual(body);
        expect(headers.get('content-type')).toBe('application/json');
      }
      return json({ result: 'ok' });
    });
    expect(await call(client)).toEqual({ result: 'ok' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('serialization and metadata', () => {
  it('encodes path and query values, preserving false and zero', async () => {
    const { client, fetch } = setup();
    await client.orders.retrieve('a/b ?#');
    expect(String(fetch.mock.calls[0]![0])).toBe('https://test.printapi.nl/v2/orders/a%2Fb%20%3F%23');
    await client.products.list({ offset: 0, limit: '5', includeDetails: false });
    const url = new URL(String(fetch.mock.calls[1]![0]));
    expect(Object.fromEntries(url.searchParams)).toEqual({ offset: '0', limit: '5', includeDetails: 'false' });
    await client.sync.statuses({ since: '2026-11-09T12:00:00+01:00' });
    expect(new URL(String(fetch.mock.calls[2]![0])).searchParams.get('since')).toBe('2026-11-09T12:00:00+01:00');
  });
  it('preserves nullable request bodies and omits optional bodies', async () => {
    const { client, fetch } = setup();
    await client.orders.cancel('id', null);
    await client.checkout.setup('id');
    expect(fetch.mock.calls[0]![1]!.body).toBe('null');
    expect(fetch.mock.calls[1]![1]!.body).toBeUndefined();
  });
  it('returns metadata and data with one request', async () => {
    const { client, fetch } = setup(() => json({ results: [] }, 200, { 'x-request-id': 'req-1' }));
    const promise = client.products.list();
    const [data, result] = await Promise.all([promise, promise.withResponse()]);
    expect(data).toEqual(result.data);
    expect(result.requestId).toBe('req-1');
    expect(result.response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await promise.then(x => x.results.length)).toBe(0);
  });
  it('uploads actual multipart bytes without setting a boundary header', async () => {
    const { client } = setup(async (_url, init) => {
      expect(new Headers(init.headers).get('content-type')).toBeNull();
      const file = (init.body as FormData).get('file') as File;
      expect(file.name).toBe('print.pdf');
      expect(await file.text()).toBe('print bytes');
      return json({ fileName: 'print.pdf' });
    });
    await client.files.upload('upload-code', { file: new Blob(['print bytes']), filename: 'print.pdf' }, { headers: { 'content-type': 'incorrect' } });
  });
  it.each(['application/pdf', 'image/png', 'image/jpeg'] as const)('uploads raw %s bytes including typed array views', async contentType => {
    const bytes = new Uint8Array([0, 10, 20, 0]).subarray(1, 3);
    const { client } = setup(async (_url, init) => {
      expect(new Headers(init.headers).get('content-type')).toBe(contentType);
      expect([...new Uint8Array(await (init.body as Blob).arrayBuffer())]).toEqual([10,20]);
      return json({});
    });
    await client.files.upload('code', { body: bytes, contentType });
  });
  it('supports custom base URL, fetch and request headers', async () => {
    const fetch = vi.fn<Fetch>(async (input, init) => {
      expect(String(input)).toBe('https://example.com/api/orders');
      expect(new Headers(init?.headers).get('x-trace')).toBe('request');
      return json({ results: [] });
    });
    const client = new PrintAPI({ accessToken: async () => 'dynamic', baseURL: 'https://example.com/api/', fetch, headers: { 'x-trace': 'default' } });
    await client.orders.list({}, { headers: { 'x-trace': 'request' } });
  });
});

describe('authentication', () => {
  it('exchanges form credentials once across concurrent requests, caches until expiry', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn<Fetch>(async (input, init) => {
      if (String(input).includes('/oauth')) {
        expect(String(input)).toBe('https://test.printapi.nl/v2/oauth?version=2');
        expect(new Headers(init?.headers).get('authorization')).toBeNull();
        expect(new Headers(init?.headers).get('content-type')).toBe('application/x-www-form-urlencoded');
        expect(Object.fromEntries(init?.body as URLSearchParams)).toEqual({ grant_type: 'client_credentials', client_id: 'id&', client_secret: 'secret +', scope: 'orders:browse products:browse' });
        return json({ access_token: 'exchanged', expires_in: 60, token_type: 'Bearer' });
      }
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer exchanged');
      return json({});
    });
    const client = new PrintAPI({ credentials: { clientId: 'id&', clientSecret: 'secret +', scopes: ['orders:browse', 'products:browse'] }, fetch });
    await Promise.all([client.products.list(), client.orders.list()]);
    expect(fetch).toHaveBeenCalledTimes(3);
    await client.products.list();
    expect(fetch).toHaveBeenCalledTimes(4);
    await vi.advanceTimersByTimeAsync(55_000);
    await client.products.list();
    expect(fetch).toHaveBeenCalledTimes(6);
    client.clearToken();
    await client.products.list();
    expect(fetch).toHaveBeenCalledTimes(8);
  });
  it('recovers from a failed token exchange and validates protocol data', async () => {
    const fetch = vi.fn<Fetch>().mockResolvedValueOnce(json({ access_token: '' })).mockResolvedValueOnce(json({ access_token: 'ok' })).mockResolvedValue(json({}));
    const client = new PrintAPI({ credentials: { clientId: 'id', clientSecret: 'secret' }, fetch });
    await expect(client.products.list()).rejects.toBeInstanceOf(InvalidResponseError);
    await client.products.list();
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('does not replay order creation or token exchange after a 401', async () => {
    const { client, fetch } = setup(() => json({ message: 'expired' }, 401));
    await expect(client.orders.create({ items: [] })).rejects.toBeInstanceOf(AuthenticationError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('failures and retries', () => {
  it.each([[400, BadRequestError], [401, AuthenticationError], [403, PermissionDeniedError], [404, NotFoundError], [409, ConflictError], [422, BadRequestError], [429, RateLimitError], [500, InternalServerError], [418, APIError]] as const)('maps HTTP %s to a typed error', async (status, Type) => {
    const body = { message: 'service error', hint: 'check input', fields: [{ key: 'items', errors: ['required'] }] };
    const { client } = setup(() => json(body, status, { 'x-request-id': 'req' }));
    try { await client.products.list(); throw new Error('Expected rejection'); }
    catch (error) {
      expect(error).toBeInstanceOf(Type);
      expect((error as APIError).status).toBe(status);
      expect((error as APIError).body).toEqual(body);
      expect((error as APIError).requestId).toBe('req');
    }
  });
  it('preserves non-JSON error responses and rejects malformed successful responses', async () => {
    const { client, fetch } = setup(() => new Response('<html>proxy error</html>', { status: 502 }));
    await expect(client.products.list()).rejects.toMatchObject({ status: 502, body: '<html>proxy error</html>' });
    fetch.mockResolvedValue(new Response('broken'));
    await expect(client.products.list()).rejects.toBeInstanceOf(InvalidResponseError);
    fetch.mockResolvedValue(new Response(null));
    await expect(client.products.list()).rejects.toBeInstanceOf(InvalidResponseError);
  });
  it('retries GET transient HTTP failures and honors Retry-After', async () => {
    vi.useFakeTimers();
    const { client, fetch } = setup();
    fetch.mockResolvedValueOnce(json({}, 429, { 'retry-after': '2' })).mockResolvedValueOnce(json({}, 503, { 'retry-after': '0' })).mockResolvedValue(json({ results: [] }));
    const promise = client.products.list({}, { maxRetries: 2 });
    await vi.advanceTimersByTimeAsync(1999);
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2);
    await expect(promise).resolves.toEqual({ results: [] });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('bounds GET connection retries', async () => {
    vi.useFakeTimers();
    const { client, fetch } = setup();
    fetch.mockRejectedValue(new TypeError('network'));
    const result = expect(client.orders.list({}, { maxRetries: 2 })).rejects.toBeInstanceOf(ConnectionError);
    await vi.runAllTimersAsync();
    await result;
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it.each([429, 500, 503])('never retries a POST after HTTP %s even with maxRetries set', async status => {
    const { client, fetch } = setup(() => json({}, status));
    await expect(client.orders.create({ items: [] }, { maxRetries: 10 })).rejects.toBeInstanceOf(APIError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('never retries an ambiguous order network failure', async () => {
    const { client, fetch } = setup();
    fetch.mockRejectedValue(new TypeError('connection reset after send'));
    await expect(client.orders.create({ items: [] }, { maxRetries: 10 })).rejects.toBeInstanceOf(ConnectionError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('does not retry business conflicts', async () => {
    const { client, fetch } = setup(() => json({}, 409));
    await expect(client.orders.list({}, { maxRetries: 2 })).rejects.toBeInstanceOf(ConflictError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('cancellation and total deadlines', () => {
  it('does not dispatch an already aborted request', async () => {
    const { client, fetch } = setup();
    await expect(client.products.list({}, { signal: AbortSignal.abort('stop') })).rejects.toBeInstanceOf(RequestAbortedError);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('times out even when injected fetch ignores signals', async () => {
    vi.useFakeTimers();
    const { client } = setup(() => new Promise(() => {}));
    const result = expect(client.orders.create({ items: [] }, { timeoutMs: 20 })).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(20);
    await result;
  });
  it('cancels during backoff without sending another attempt', async () => {
    const { client, fetch } = setup(() => json({}, 429, { 'retry-after': '60' }));
    const controller = new AbortController();
    const promise = client.products.list({}, { maxRetries: 2, signal: controller.signal });
    await new Promise(resolve => setTimeout(resolve, 5));
    controller.abort();
    await expect(promise).rejects.toBeInstanceOf(RequestAbortedError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('includes body consumption in the deadline', async () => {
    vi.useFakeTimers();
    const { client } = setup(() => new Response(new ReadableStream({ start() {} })));
    const result = expect(client.products.list({}, { timeoutMs: 20 })).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(20);
    await result;
  });
  it('includes an async token provider in the deadline', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn<Fetch>();
    const client = new PrintAPI({ accessToken: () => new Promise(() => {}), fetch });
    const result = expect(client.products.list({}, { timeoutMs: 20 })).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(20);
    await result;
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('pagination and configuration', () => {
  it('uses returned items to advance across server-capped pages', async () => {
    const { client, fetch } = setup(url => {
      const offset = Number(url.searchParams.get('offset'));
      return json({ offset: String(offset), count: '3', limit: '2', results: offset === 0 ? [{ id: 'a' }, { id: 'b' }] : [{ id: 'c' }] });
    });
    const result = [];
    for await (const product of client.products.iterate({ limit: 50, includeDetails: true })) result.push(product.id);
    expect(result).toEqual(['a', 'b', 'c']);
    expect(new URL(String(fetch.mock.calls[1]![0])).searchParams.get('offset')).toBe('2');
  });
  it('stops on an empty page without count metadata', async () => {
    const { client, fetch } = setup(() => json({ results: [] }));
    const items = [];
    for await (const item of client.orders.iterate()) items.push(item);
    expect(items).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('rejects invalid URL, credentials, deadlines and path identifiers', async () => {
    expect(() => new PrintAPI({ accessToken: 't', baseURL: 'file:///tmp' })).toThrow(TypeError);
    expect(() => new PrintAPI({ accessToken: 't', baseURL: 'https://user:pass@example.com' })).toThrow(TypeError);
    expect(() => new PrintAPI({ accessToken: '' })).toThrow(TypeError);
    expect(() => new PrintAPI({ accessToken: 't', timeoutMs: -1 })).toThrow(TypeError);
    const { client } = setup();
    expect(() => client.orders.retrieve('..')).toThrow(TypeError);
    await expect(client.orders.list({}, { maxRetries: -1 })).rejects.toThrow(TypeError);
  });
});

// Type assertions compile with the rest of the tests.
async function typeAssertions(client: PrintAPI) {
  const detailed = await client.products.list({ includeDetails: true });
  detailed.results[0]?.files;
  const basic = await client.products.list();
  // @ts-expect-error Basic list entries have no file requirements.
  basic.results[0]?.files;
  // @ts-expect-error Order items are required by the wire contract.
  const invalid: OrderIn = {};
  void invalid;
  // @ts-expect-error Country is a contract enum.
  client.shipping.quote({ country: 'INVALID' });
}
void typeAssertions;

describe('shared authentication and response failures', () => {
  it('cancelling one caller does not cancel a shared OAuth exchange', async () => {
    let release!: (value: Response) => void;
    const tokenResponse = new Promise<Response>(resolve => { release = resolve; });
    const fetch = vi.fn<Fetch>(async input => String(input).includes('/oauth') ? tokenResponse : json({ results: [] }));
    const client = new PrintAPI({ credentials: { clientId: 'id', clientSecret: 'secret' }, fetch });
    const controller = new AbortController();
    const first = client.products.list({}, { signal: controller.signal });
    const second = client.products.list();
    const firstResult = expect(first).rejects.toBeInstanceOf(RequestAbortedError);
    controller.abort();
    await firstResult;
    release(json({ access_token: 'token', expires_in: 60 }));
    await expect(second).resolves.toEqual({ results: [] });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('metadata-only callers can handle failures without an unhandled data promise', async () => {
    const { client } = setup(() => json({ message: 'missing' }, 404));
    await expect(client.orders.retrieve('missing').withResponse()).rejects.toBeInstanceOf(NotFoundError);
  });
  it('cancels an in-flight fetch and exposes the caller reason', async () => {
    const { client, fetch } = setup(() => new Promise(() => {}));
    const controller = new AbortController();
    const promise = client.orders.list({}, { signal: controller.signal });
    // Dispatch happens after the asynchronous access-token lookup.
    await Promise.resolve();
    await Promise.resolve();
    controller.abort('user cancelled');
    await expect(promise).rejects.toMatchObject({ name: 'RequestAbortedError', cause: 'user cancelled' });
    expect(fetch.mock.calls.length).toBeLessThanOrEqual(1);
  });
  it('rejects unsupported OAuth token types as protocol failures', async () => {
    const fetch = vi.fn<Fetch>().mockResolvedValue(json({ access_token: 'token', token_type: 42 }));
    const client = new PrintAPI({ credentials: { clientId: 'id', clientSecret: 'secret' }, fetch });
    await expect(client.products.list()).rejects.toBeInstanceOf(InvalidResponseError);
  });
});
