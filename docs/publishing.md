# Publishing printapi-sdk

The package is MIT licensed and publishes compiled JavaScript with ESM/CommonJS declarations. Consumers do not need TypeScript or build tools to install it. One public npm package can be installed with npm, pnpm, Yarn or Bun.

## First npm publication

The package name is `printapi-sdk`. An npm registry lookup returned 404 on 2026-11-09; this does not reserve the name. The first publish requires an npm account authorized to create this package. Use an interactive npm login or a short-lived granular publishing token with the permissions required by your account's two-factor-authentication settings. Never commit tokens or a credential-bearing .npmrc.

```sh
npm ci
npm run check
npm login
npm publish --access public
```

The prepack hook runs verification before upload. Test the published artifact in a clean project and verify its version:

```sh
npm view printapi-sdk version
npm install printapi-sdk
```

## Subsequent releases without a stored npm token

After the first publication, configure a GitHub Actions trusted publisher in the npm package settings:

- Owner: `DapperMickie`
- Repository: `printapi-typescript`
- Workflow: `publish.yml`
- Allowed action: direct publication with `npm publish`

The workflow uses GitHub-hosted runners, Node 24, a pinned npm CLI and an OIDC token. No repository npm secret is needed. See [npm's trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/) for account setup, allowed actions and automatic provenance requirements.

Bump the package version, update CHANGELOG.md, run checks, and push the changes to main. Run the Publish to npm workflow manually in GitHub Actions. The workflow publishes main and does not trigger on ordinary pushes. npm versions are immutable, so increase the version for each release.

## Release tarball installation

An SDK tarball can also be attached to a public GitHub release and installed directly by URL. This is useful before the npm account is connected:

```sh
npm install https://github.com/DapperMickie/printapi-typescript/releases/download/v0.1.0/printapi-sdk-0.1.0.tgz
pnpm add https://github.com/DapperMickie/printapi-typescript/releases/download/v0.1.0/printapi-sdk-0.1.0.tgz
yarn add https://github.com/DapperMickie/printapi-typescript/releases/download/v0.1.0/printapi-sdk-0.1.0.tgz
bun add https://github.com/DapperMickie/printapi-typescript/releases/download/v0.1.0/printapi-sdk-0.1.0.tgz
```

This installs the same prebuilt package. Installing the source repository by Git URL is not a supported distribution method because it does not contain the compiled dist directory.

## Compatibility checks

CI tests packed-package installation with npm, pnpm 12.18.0, Yarn Classic 1.22.22 and Bun 1.4.4. The Bun check also runs the SDK with the Bun runtime. All checks exercise ESM/CommonJS loading, OAuth coordination, multipart uploads, and TypeScript NodeNext/bundler declarations. The SDK itself has no runtime dependencies or dependency-install lifecycle hooks. Contributor tooling is installed with npm ci.
