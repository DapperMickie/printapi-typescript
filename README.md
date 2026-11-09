# PrintAPI TypeScript SDK

A server-side TypeScript SDK for [PrintAPI v2](https://test.printapi.nl/v2/swagger/index.html). Covers all **14 operations and 59 component schemas** in the OpenAPI document retrieved on 2026-11-09. This is an independent SDK, not an official PrintAPI package.

Native fetch, no runtime dependencies, generated wire types, resource methods, ESM and CommonJS builds. Requires Node.js 22.18 or newer. CI targets Node 22, 24 and 26, and Bun 1.4.4. Package installation is also checked with pnpm and Yarn Classic. Other fetch-based runtimes may work but are not currently verified.

## Install and run

Install the prebuilt release with your preferred package manager:

```sh
npm install https://github.com/DapperMickie/printapi-typescript/releases/download/v0.1.0/printapi-sdk-0.1.0.tgz
pnpm add https://github.com/DapperMickie/printapi-typescript/releases/download/v0.1.0/printapi-sdk-0.1.0.tgz
yarn add https://github.com/DapperMickie/printapi-typescript/releases/download/v0.1.0/printapi-sdk-0.1.0.tgz
bun add https://github.com/DapperMickie/printapi-typescript/releases/download/v0.1.0/printapi-sdk-0.1.0.tgz
```

The npm registry publication is pending npm account authentication. Once published there, the shorter commands will be `npm install printapi-sdk`, `pnpm add printapi-sdk`, `yarn add printapi-sdk`, and `bun add printapi-sdk`. See [publishing](docs/publishing.md) for the release workflow.

To build from source:

```sh
npm ci
npm run check
npm pack
# In your application:
npm install /path/to/printapi-sdk-0.1.0.tgz
```

```ts
import { PrintAPI } from 'printapi-sdk';

const client = new PrintAPI({
  environment: 'test', // default; use 'live' explicitly for real fulfillment
  credentials: {
    clientId: process.env.PRINTAPI_CLIENT_ID!,
    clientSecret: process.env.PRINTAPI_CLIENT_SECRET!,
  },
});

const products = await client.products.list({ includeDetails: true, limit: 10 });
console.log(products.results);

const order = await client.orders.create({
  id: 'your-persisted-order-id',
  items: [{
    productId: 'your-product-id',
    quantity: 1,
    files: { content: 'https://example.com/print.pdf' },
  }],
  shipping: {
    address: {
      name: 'Example Customer',
      line1: 'Osloweg 75',
      postCode: '9700 GE',
      city: 'Groningen',
      country: 'NL',
    },
  },
});
console.log(order.id);
```

Product IDs, file keys and requirements depend on your account's products. Retrieve a product to inspect its options and file requirements before placing an order. The generated types preserve the contract's nullable inputs; TypeScript does not enforce the API's business validation, length limits or required shipping details.

CommonJS is supported with `const { PrintAPI } = require('printapi-sdk')`.

## Every operation

| SDK method | HTTP endpoint |
| --- | --- |
| `orders.list(params?, options?)` | `GET /orders` |
| `orders.iterate(params?, options?)` | Async iterator over order list pages |
| `orders.retrieve(id, options?)` | `GET /orders/{id}` |
| `orders.create(body, options?)` | `POST /orders` |
| `orders.status(id, options?)` | `GET /orders/{id}/status` |
| `orders.cancel(id, body?, options?)` | `POST /orders/{id}/cancellation` |
| `orders.cancellation(id, options?)` | `GET /orders/{id}/cancellation` |
| `products.list(params?, options?)` | `GET /products` |
| `products.iterate(params?, options?)` | Async iterator over product list pages |
| `products.retrieve(id, options?)` | `GET /products/{id}` |
| `checkout.setup(code, body?, options?)` | `POST /checkout/{code}` |
| `checkout.retrieve(code, options?)` | `GET /checkout/{code}` |
| `coupons.quote(body, options?)` | `POST /coupons/quote` |
| `shipping.quote(body, options?)` | `POST /shipping/quote` |
| `sync.statuses(params?, options?)` | `GET /sync/statuses` |
| `files.upload(code, input, options?)` | `POST /files/{code}` |
| `createToken(credentials, options?)` | OAuth helper, `POST /oauth?version=2` |

List parameters are `offset` and `limit`; products also support `includeDetails`. `products.list({ includeDetails: true })` returns detailed product types. `sync.statuses({ since })` accepts the service's date string, inclusive and at most seven days old. Cancellation requests accept `{ reason }`; requesting cancellation does not guarantee acceptance.

All component types, `paths`, `operations` and `components` are exported as TypeScript types. The original contract is exported as `printapi-sdk/openapi`. JSON is the SDK's wire format; XML representations of the same operations are not exposed.

## Authentication

Use client credentials for automatic OAuth client-credentials exchanges, single-flight coordination, and token refresh before the supplied expiry. Optional `credentials.scopes` restricts requested permissions. Tokens without `expires_in` are not cached beyond an in-flight exchange. Call `client.clearToken()` to forget a cached token. A 401 is surfaced without replaying the request.

Existing tokens and external token management work too:

```ts
const client = new PrintAPI({ accessToken: 'your-access-token' });
const dynamic = new PrintAPI({ accessToken: async () => getTokenFromYourServer() });
```

Credentials are explicit. The SDK does not read environment variables or log request data. Keep credentials in your backend. Browser initialization requires `dangerouslyAllowBrowser: true`; this option does not protect secrets. OAuth exchanges use their own client deadline so cancelling one caller does not interrupt another caller sharing the exchange.

## Uploads

Use the upload code returned for an order file. Multipart uploads let fetch choose the boundary:

```ts
await client.files.upload(uploadCode, {
  file: new Blob([pdfBytes], { type: 'application/pdf' }),
  filename: 'print.pdf',
});

await client.files.upload(uploadCode, {
  body: pdfBytes, // Blob, ArrayBuffer, Uint8Array or Node Buffer
  contentType: 'application/pdf', // also image/png and image/jpeg
});
```

File streams are not accepted. Use a Blob or byte buffer; uploads are never automatically replayed.

## Pagination, deadlines and HTTP metadata

```ts
for await (const product of client.products.iterate({ includeDetails: true })) {
  console.log(product.id, product.files);
}

const controller = new AbortController();
const { data, response, requestId } = await client.orders
  .list({ limit: 20 }, { signal: controller.signal, timeoutMs: 15_000 })
  .withResponse();
console.log(data.results, response.status, requestId);
```

`list()` returns one page. `iterate()` fetches pages lazily and advances by the returned item count, allowing the server to cap the requested limit. It stops at the total `count` or an empty page. Concurrent inserts can shift offset pagination, so this is not a consistent snapshot.

Resource methods return an `APIPromise<T>` that works with `await`, `.then()` and `.catch()`. `.withResponse()` shares the same request and returns parsed data plus the consumed Response and optional request ID. Wire dates remain strings; numeric fields remain `number | string` where the contract permits both. The SDK does not coerce money or validate complete response schemas at runtime.

The default total deadline is 30 seconds, including authentication, retry delays and body consumption. Override `timeoutMs`, `maxRetries` or `headers` at client or request level. `signal` is a request option. `baseURL` and `fetch` are injectable for testing or custom networking. Redirects fail instead of forwarding credentials.

GET requests retry connection failures and HTTP 408, 429, 500, 502, 503 and 504 up to two times by default, with exponential backoff and jitter. Valid `Retry-After` values take precedence, subject to the total deadline. Set `maxRetries: 0` to disable them. Response-body read failures are surfaced without retry.

**POST requests never retry automatically**, even if `maxRetries` is set. A timeout or lost response during order creation can mean PrintAPI accepted the order. Persist your own order ID before sending, then retrieve that ID to reconcile an uncertain result. Do not blindly create another order. Aborting a request does not cancel fulfillment. No undocumented idempotency header is added.

## Errors

```ts
import { APIError, TimeoutError } from 'printapi-sdk';

try {
  await client.orders.retrieve('order-id');
} catch (error) {
  if (error instanceof APIError) {
    console.error(error.status, error.requestId, error.body);
  } else if (error instanceof TimeoutError) {
    console.error('Request deadline exceeded');
  } else {
    throw error;
  }
}
```

HTTP errors extend `APIError`: `BadRequestError`, `AuthenticationError`, `PermissionDeniedError`, `NotFoundError`, `ConflictError`, `RateLimitError`, and `InternalServerError`. They preserve status, headers, parsed API body and request ID. Inspect `body` for the service's message, hint, help URL and field errors. Unknown HTTP statuses use `APIError`.

Transport failures use `ConnectionError`, `TimeoutError`, `RequestAbortedError` or `InvalidResponseError`. All extend `PrintAPIError`. Non-JSON error bodies are preserved as text and are not copied into the fallback error message. Error bodies can contain personal data; decide what to log in your application. Avoid mixing ESM and CommonJS class instances in `instanceof` checks.

## Development and maintenance

```sh
npm run spec:check       # Compare the vendored contract with the live Swagger contract
npm run spec:update      # Download the current contract
npm run generate         # Regenerate all wire types
npm run check            # Drift check, strict types, tests, build, packed-consumer tests
```

Generated output is committed and reproducible with the locked dependencies. Weekly CI checks for upstream specification changes. Adding an endpoint upstream causes the operation-coverage test to fail until a resource method and serialization test are added. Review schema changes before release.

See [architecture research](docs/architecture-research.md) for source-linked decisions and [contract notes](docs/contract.md) for scope and verification limits. The compiler is pinned to TypeScript 5.9.3 because the current generator declares TypeScript 5.x peer support. Generated consumer declarations are tested with this compiler. Build tools run only in development.

Licensed under [MIT](LICENSE). No credentialed PrintAPI calls or live orders were made during verification.
