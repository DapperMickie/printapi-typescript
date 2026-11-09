import type { paths, CancellationRequestIn, CheckoutIn, CouponIn, OrderIn, ShipmentIn, ProductListOut, ProductWithDetailsListOut } from './schema.js';
import { Transport, validateNumber } from './transport.js';
import type { APIPromise, RequestOptions } from './transport.js';

type JSONResponse<P extends keyof paths, M extends keyof paths[P], S extends number> =
  paths[P][M] extends { responses: infer R } ? S extends keyof R ? R[S] extends { content: { 'application/json': infer T } } ? T : never : never : never;
export type OrderListParams = NonNullable<paths['/orders']['get']['parameters']['query']>;
export type ProductListParams = NonNullable<paths['/products']['get']['parameters']['query']>;
export type StatusSyncParams = NonNullable<paths['/sync/statuses']['get']['parameters']['query']>;
export type UploadMediaType = 'application/pdf' | 'image/png' | 'image/jpeg';
export type UploadInput = { file: Blob; filename?: string } | { body: Blob | ArrayBuffer | Uint8Array; contentType: UploadMediaType };

function segment(value: string): string {
  if (!value || value === '.' || value === '..') throw new TypeError('Path identifiers must be non-empty and cannot be dot segments');
  return encodeURIComponent(value);
}

/** Offset pagination follows server-reported offsets and page sizes, including server-side limit caps. */
async function* paginate<T, P extends { offset?: number | string; limit?: number | string }>(
  load: (params: P, options?: RequestOptions) => PromiseLike<{ results: T[]; offset?: number | string; limit?: number | string; count?: number | string }>,
  params: P,
  options?: RequestOptions,
): AsyncGenerator<T, void, unknown> {
  let offset = Number(params.offset ?? 0);
  validateNumber(offset, 'offset', true);
  if (params.limit !== undefined) {
    const limit = Number(params.limit);
    validateNumber(limit, 'limit', true);
    if (limit === 0) throw new TypeError('Iterator limit must be positive');
  }
  for (;;) {
    const page = await load({ ...params, offset }, options);
    if (!Array.isArray(page.results)) throw new TypeError('Invalid page: results must be an array');
    if (!page.results.length) return;
    yield* page.results;
    const current = Number(page.offset ?? offset);
    const next = current + page.results.length;
    if (!Number.isSafeInteger(next) || next <= offset) throw new TypeError('Pagination did not advance');
    // count is the total result count, not the number of items on this page.
    if (page.count !== undefined && next >= Number(page.count)) return;
    offset = next;
  }
}

export class Orders {
  constructor(private readonly transport: Transport) {}
  /** Get a single order by ID. */
  retrieve(id: string, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/orders/{id}', 'get', 200>>({ method: 'GET', path: `/orders/${segment(id)}` }, options);
  }
  /** Get orders, newest first. */
  list(query: OrderListParams = {}, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/orders', 'get', 200>>({ method: 'GET', path: '/orders', query }, options);
  }
  /** Place an order. Never automatically retried. A timeout does not mean the order was rejected. */
  create(body: OrderIn, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/orders', 'post', 201>>({ method: 'POST', path: '/orders', json: body }, options);
  }
  status(id: string, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/orders/{id}/status', 'get', 200>>({ method: 'GET', path: `/orders/${segment(id)}/status` }, options);
  }
  /** Request cancellation; inspect the returned status to learn whether it was accepted. */
  cancel(id: string, body?: CancellationRequestIn | null, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/orders/{id}/cancellation', 'post', 200>>({ method: 'POST', path: `/orders/${segment(id)}/cancellation`, json: body }, options);
  }
  cancellation(id: string, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/orders/{id}/cancellation', 'get', 200>>({ method: 'GET', path: `/orders/${segment(id)}/cancellation` }, options);
  }
  iterate(params: OrderListParams = {}, options?: RequestOptions) {
    return paginate((query, opts) => this.list(query, opts), params, options);
  }
}
export class Products {
  constructor(private readonly transport: Transport) {}
  retrieve(id: string, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/products/{id}', 'get', 200>>({ method: 'GET', path: `/products/${segment(id)}` }, options);
  }
  list(query: ProductListParams & { includeDetails: true }, options?: RequestOptions): APIPromise<ProductWithDetailsListOut>;
  list(query?: ProductListParams & { includeDetails?: false }, options?: RequestOptions): APIPromise<ProductListOut>;
  list(query: ProductListParams, options?: RequestOptions): APIPromise<ProductListOut | ProductWithDetailsListOut>;
  list(query: ProductListParams = {}, options?: RequestOptions): APIPromise<ProductListOut | ProductWithDetailsListOut> {
    return this.transport.request({ method: 'GET', path: '/products', query }, options);
  }
  iterate(params: ProductListParams & { includeDetails: true }, options?: RequestOptions): AsyncGenerator<ProductWithDetailsListOut['results'][number], void, unknown>;
  iterate(params?: ProductListParams & { includeDetails?: false }, options?: RequestOptions): AsyncGenerator<ProductListOut['results'][number], void, unknown>;
  iterate(params: ProductListParams, options?: RequestOptions): AsyncGenerator<ProductListOut['results'][number] | ProductWithDetailsListOut['results'][number], void, unknown>;
  iterate(params: ProductListParams = {}, options?: RequestOptions) {
    return paginate<ProductListOut['results'][number] | ProductWithDetailsListOut['results'][number], ProductListParams>((query, opts) => this.list(query, opts), params, options);
  }
}
export class Checkout {
  constructor(private readonly transport: Transport) {}
  setup(code: string, body?: CheckoutIn | null, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/checkout/{code}', 'post', 201>>({ method: 'POST', path: `/checkout/${segment(code)}`, json: body }, options);
  }
  retrieve(code: string, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/checkout/{code}', 'get', 200>>({ method: 'GET', path: `/checkout/${segment(code)}` }, options);
  }
}
export class Coupons {
  constructor(private readonly transport: Transport) {}
  quote(body: CouponIn, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/coupons/quote', 'post', 200>>({ method: 'POST', path: '/coupons/quote', json: body }, options);
  }
}
export class Shipping {
  constructor(private readonly transport: Transport) {}
  quote(body: ShipmentIn, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/shipping/quote', 'post', 200>>({ method: 'POST', path: '/shipping/quote', json: body }, options);
  }
}
export class Sync {
  constructor(private readonly transport: Transport) {}
  /** since is inclusive, at most seven days ago. Dates stay in the API's wire format. */
  statuses(query: StatusSyncParams = {}, options?: RequestOptions) {
    return this.transport.request<JSONResponse<'/sync/statuses', 'get', 200>>({ method: 'GET', path: '/sync/statuses', query }, options);
  }
}
export class Files {
  constructor(private readonly transport: Transport) {}
  /** Upload using the upload code supplied by the API. Supports multipart or raw PDF/PNG/JPEG. */
  upload(code: string, input: UploadInput, options?: RequestOptions) {
    const path = `/files/${segment(code)}`;
    if ('file' in input) {
      const body = new FormData();
      body.set('file', input.file, input.filename ?? 'upload');
      return this.transport.request<JSONResponse<'/files/{code}', 'post', 200>>({ method: 'POST', path, body }, options);
    }
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(input.contentType)) throw new TypeError('Unsupported upload content type');
    // Copy typed arrays to an ArrayBuffer-backed Blob, including Node Buffer views.
    const body = input.body instanceof Uint8Array ? new Blob([new Uint8Array(input.body)]) : input.body;
    return this.transport.request<JSONResponse<'/files/{code}', 'post', 200>>({ method: 'POST', path, body, contentType: input.contentType }, options);
  }
}
