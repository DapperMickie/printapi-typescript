# PrintAPI v2 SDK architecture research

Checked 2026-11-09 against current official documentation. Recommendations below are design decisions, not verified PrintAPI behavior. This research does not establish PrintAPI's endpoint inventory, authentication scheme, pagination, error envelope, or idempotency guarantees. Confirm those against the authoritative v2 contract before implementation.

## Patterns worth adopting

- OpenAI generates its SDK from OpenAPI and exposes resource methods such as `client.responses.create`. Its current README lists Node 22 as the minimum and disables browser use by default. This supports a generated contract with a small, task-oriented client. [OpenAI Node](https://github.com/openai/openai-node#readme)
- Anthropic uses global fetch with an injectable replacement, client and request options, and typed errors. Its documented retry defaults include connection failures, 408, 409, 429 and 5xx, with two retries. Adopt the configuration pattern, but define a narrower retry policy for physical order fulfillment. [Anthropic TypeScript documentation](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript)
- Stripe provides resource methods, per-request configuration and exponential network retries with idempotency keys where appropriate. Its current README also documents a connection-reset retry exception even with normal retries disabled. PrintAPI should make zero mean zero for mutations. [Stripe Node](https://github.com/stripe/stripe-node#network-retries)

## Transport and runtime support

Use one small native-fetch transport shared by all resources. Inject `fetch` through the constructor for tests, proxies and platform-specific networking. Use Web APIs such as `Headers`, `URL`, `AbortController`, `FormData` and `Blob`; avoid Axios, bundled fetch polyfills and Node-only imports in the core. The tradeoff is that older runtimes need application-provided compatibility. Anthropic documents the same global/injected-fetch model. [Fetch customization](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript#customizing-the-fetch-client)

Proposed support policy: Node 22+ while non-EOL, with CI on supported Node 22, 24 and 26; Deno 2, Bun 1 and Cloudflare Workers only after package-level smoke tests pass. Pin tested versions in CI and publish the matrix. Do not imply that fetch availability alone proves runtime support. Anthropic's broader runtime list is useful precedent, not a compatibility guarantee for this SDK. [Anthropic requirements](https://github.com/anthropics/anthropic-sdk-typescript#requirements)

Treat this as a server SDK. Reject browser initialization by default with an explicit opt-in only if required; secret PrintAPI credentials belong behind an application backend. Do not claim React Native support without tests. Keep environment-variable loading guarded and optional, with explicit constructor credentials taking precedence.

## Contract and resource methods

Vendor a versioned authoritative OpenAPI document, recording origin, retrieval date and checksum. Pin the generator and commit generated output. Generate wire types with `openapi-typescript`, which supports OpenAPI 3.0/3.1 and emits runtime-free types. Keep transport, retries and ergonomic resource wrappers handwritten initially. Full client generation reduces repetitive code but requires maintaining generator templates and reviewing their runtime behavior. [Generator documentation](https://openapi-ts.dev/introduction)

Build an operation coverage manifest from every path and HTTP method. Every documented operation must have a public resource method and a serialization test. Proposed naming is `client.orders.create(params, options)` and `client.orders.retrieve(id, options)`; actual methods and resource groups must follow the contract. Avoid inventing endpoints. Preserve wire field names, nullability, numeric units, enum values and date strings. Separate request types from response types. Provide explicit page results; add async iteration only when pagination and termination rules are verified.

Generated types do not validate JSON at runtime. Validate SDK configuration and essential protocol structure; preserve unknown response fields. Full schema validation adds size and can reject additive server changes, so make it an optional future capability. Never coerce money, dates or order statuses silently.

## Authentication and request configuration

Support an explicit credential or async credential provider, plus a guarded environment fallback if the actual auth scheme permits it. Implement exactly the documented PrintAPI header or token exchange. Do not assume Bearer auth. Cache expiring tokens per client, refresh with single-flight coordination, and never replay order creation on 401 unless replay safety is established.

Use immutable client defaults with per-request `signal`, `timeoutMs`, retry limit and documented idempotency option. Expose a controlled base URL for sandbox/testing. Resolve SDK-owned relative paths against it; reject cross-origin redirects for authenticated requests. Redact authorization, tokens, order personal data and bodies from default logs. Keep SDK/version and request ID metadata available without logging payloads.

## Cancellation, deadlines and safe retries

Use `AbortSignal` for caller cancellation and compose it with a timeout controller. Proposed default: a 30-second total operation deadline covering attempts, backoff and response consumption, overridable per request. Clean up timers/listeners on all exits. Abort retry sleeps immediately. Distinguish caller cancellation from deadline expiry. This differs intentionally from OpenAI's documented ten-minute request timeout and automatic timeout retries, which can lengthen total waits. [OpenAI configuration](https://github.com/openai/openai-node/blob/main/docs/configuration.md#retries-and-timeouts)

- For read operations, allow two retries on transient connection failures, 408, 429 and selected 5xx. Use bounded exponential backoff with jitter, honor valid `Retry-After` within the remaining deadline, and release response bodies before retrying. Do not retry 409 generically; it may describe a business conflict.
- For order creation and other mutations, default to zero retries, including network resets and timeouts. A lost response can mean the server already accepted the order. Surface the uncertain outcome and the identifiers needed for reconciliation; cancellation does not undo a server operation.
- Enable mutation retries only after PrintAPI documents server-side deduplication, key scope, retention, parameter-mismatch behavior and retryable outcomes. A custom header alone provides no guarantee. Stripe's API explicitly defines these semantics, including different v1/v2 behavior; none transfers automatically to PrintAPI. [Stripe idempotency contract](https://docs.stripe.com/api/idempotent_requests)
- If supported, accept a caller-persisted key and reuse identical serialized bytes and the same key across every attempt. Callers must reuse it after process restarts or uncertain results. A new random key per SDK invocation cannot deduplicate separate invocations. Never replay a consumed stream unless the caller supplies a replay factory. Do not promise exactly-once fulfillment.

## Errors and response access

Export `PrintAPIError` with HTTP subclasses for authentication, permission, validation, not-found, conflict, rate-limit and server failures, plus separate connection, timeout, cancellation and malformed-response errors. Preserve status, service code, request ID, safe response headers, structured field errors and cause. Keep unrecognized/non-JSON error bodies bounded and redact them from default messages. OpenAI exposes typed API/connection errors, request IDs and raw response access as useful precedent. [OpenAI error handling](https://github.com/openai/openai-node#handling-errors)

Keep `await resource.method()` returning domain data. Offer an explicit response-metadata variant returning `{ data, response, requestId }` without consuming a response body twice. Handle 204, JSON, binary downloads and uploads according to each operation's media types. Do not treat every successful response as JSON.

## Packaging, tests and release CI

Publish compiled ESM and CJS with matching ESM/CJS declarations and conditional `exports`; put the `types` condition first within each branch. Prefer a named `PrintAPI` export to avoid default-export interop ambiguity. Expose only documented entry points. Dual builds cost more tests and can produce distinct class identities if both are loaded, so avoid global state and document mixed-loader `instanceof` limits. [Node package exports](https://nodejs.org/api/packages.html#conditional-exports)

Use strict TypeScript, declaration emission, type-only imports and explicit `.js` relative specifiers. Check Node-compatible module resolution, rather than relying solely on bundler resolution. Start with TypeScript 5.0 as the consumer floor and verify declarations against that version and current stable. Keep generator/compiler requirements separate from consumer requirements. Prefer unbundled builds unless a bundler solves a demonstrated need. [TypeScript library guidance](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html#im-writing-a-library)

Recommended verification gates:

- Deterministic injected-fetch tests for path/query encoding, auth precedence, JSON/multipart/binary serialization, errors and metadata. Use fake clocks for retry/deadline tests. Prove an ambiguous order failure sends exactly one request by default; prove any permitted retry preserves key and body.
- Test cancellation before dispatch, during fetch/body consumption and during backoff; test malformed JSON, 204, non-JSON failures, `Retry-After`, exhausted deadlines and non-replayable bodies.
- CI runs clean install, lint, strict typecheck, generator drift/operation coverage checks, unit tests and build. Install the packed artifact in separate ESM/CJS and TypeScript NodeNext/bundler fixture projects, plus claimed runtime smoke tests. Test public imports rather than source aliases.
- Use a `files` allowlist, license, README, changelog and source/declaration maps only if their source files are shipped. Inspect `npm pack --dry-run` and test the actual tarball to catch missing declarations and accidental secrets. [npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/)
- Keep credentialed sandbox tests opt-in and use a non-fulfilling workflow for order tests. Release immutable versioned artifacts after checks, using npm trusted publishing through OIDC with minimal workflow permissions. Public-package provenance is automatic when npm's documented conditions apply. [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)

Before declaring the SDK complete, resolve the authoritative contract, all operation mappings, auth lifecycle, pagination, upload/download formats, order reconciliation and server idempotency policy. These are release requirements, not assumptions the SDK should hide.
