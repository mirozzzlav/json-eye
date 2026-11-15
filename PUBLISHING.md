# Publishing react-json-eye

## Prepare the release

Use Node.js `^20.19.0 || >=22.12.0` and npm. From the package root:

```sh
npm ci
npm pack
```

The `prepack` hook runs lint, rendering tests, a clean production build and a
smoke test that imports the public exports and renders the compiled components
without Vite. A failing check stops packing. Do not disable lifecycle scripts
when preparing a release.

For version 1.1.0 the result is `react-json-eye-1.1.0.tgz`. Check its contents:

```sh
tar -tzf react-json-eye-1.1.0.tgz
npm publish ./react-json-eye-1.1.0.tgz --dry-run --registry=https://registry.npmjs.org/
```

The archive should contain only `package.json`, `README.md`, `LICENSE`,
`CHANGELOG.md`, `PUBLISHING.md` and `dist/json-eye.js`. It must not include source,
tests, node_modules, local application files or credentials. The `files` allowlist
controls the archive; npm also includes package metadata, README and LICENSE.

In a separate React application, install the exact archive and check its UI:

```sh
npm install /absolute/path/to/react-json-eye-1.1.0.tgz @emotion/react
```

Check JSON rendering, section backgrounds and icons, photo/link placeholders,
collapse controls and print output. The automated checks use React 18; test a
React 19 consumer separately when validating that peer version. React and Emotion
must be provided by the consumer. No source JSX transformation or CSS import
should be needed for this package.

## Publish the verified archive

Confirm the intended npm account and the package's ownership/version before publishing:

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm view react-json-eye name version maintainers --registry=https://registry.npmjs.org/
```

If `npm view` returns E404, the package may not exist yet; this does not reserve
the name. If it already exists, the logged-in account must have publishing rights,
and the version being released must be unused. Availability and account access
are checked against the registry at release time, not by the local build.

When ready to publish publicly, run:

```sh
npm publish ./react-json-eye-1.1.0.tgz --access public --registry=https://registry.npmjs.org/
npm view react-json-eye@1.1.0 version dist.integrity --registry=https://registry.npmjs.org/
```

Complete npm's authentication/2FA prompts as required. Publish the verified archive
so the uploaded contents match the reviewed artifact. `--dry-run` does not publish
or establish publishing rights.

## Subsequent releases

Update `CHANGELOG.md`, bump the version in both `package.json` and
`package-lock.json` (for example `npm version patch --no-git-tag-version`), then
repeat the checks with the new archive filename. Never reuse a published version.

References: [npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/),
[npm lifecycle scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/),
[npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/).
