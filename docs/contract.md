# Contract and implementation notes

Snapshot retrieved on 2026-11-09 from https://test.printapi.nl/v2/openapi/v2.json, linked by https://test.printapi.nl/v2/swagger/index.html.

- OpenAPI version: 3.1.1
- API info version: 1.0.0, with v2 in the server URL
- Operations: 14
- Component schemas: 59
- SHA-256 of the vendored document: `9e6ce0cf49387bd03e721fae965379809754316899c7b456b2c7d84e1bf7f9db`

## Source boundaries

All documented operations have public methods and request-serialization tests. JSON is used for request and response representations; XML alternatives are intentionally omitted. All three raw upload media types and multipart uploads are supported. The SDK does not add webhook management, endpoints or idempotency behavior absent from this contract.

The OAuth security scheme names the client-credentials grant, scopes and a relative token URL of `v2/oauth?version=2`. The SDK resolves the exchange as `/v2/oauth?version=2`, avoiding a duplicated v2 prefix. Form fields and test/live hosts are corroborated by PrintAPI's own [PHP client source](https://github.com/printapi/printapi-php/blob/master/src/Client.php). The token-response interface is handwritten because OAuth is not included among the contract paths. Successful token responses are checked for a nonempty access token, Bearer token type if present, and a finite nonnegative expiry if present.

The contract preserves some unusual shapes: numbers may be strings, required input fields may permit null, and many response properties are optional. Generated types retain those definitions. The client does not silently strengthen them or convert their values. Detailed product lists are narrowed when includeDetails is a literal true.

The orders and products list schemas expose count, offset, limit and results. Iterators treat count as the total matching count and advance by the actual result length. They stop on an empty page and reject non-advancing offsets. Test this behavior with your account before relying on it for large exports.

## Verification limits

Transport tests use injected fetch responses. ESM/CommonJS execution and NodeNext/bundler TypeScript consumers are checked against an installed npm tarball. No credentials were available or required, so OAuth acceptance, account-specific products, server pagination and order fulfillment have not been verified against a credentialed sandbox. No live orders were sent. Packed-package installation, ESM/CommonJS execution, OAuth and multipart uploads are also tested with Bun 1.4.4. Browser use is disabled by default; Deno, Workers and React Native are not claimed as tested platforms.

A snapshot can match the current published contract, but cannot guarantee future service changes or undocumented behavior. Run `npm run spec:check` to compare with upstream, or update the snapshot and regenerate types together. The scheduled CI workflow checks weekly.
