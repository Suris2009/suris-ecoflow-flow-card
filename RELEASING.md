# Releasing

1. Update the version in `package.json`, the JS header and `VERSION`, and `CHANGELOG.md`.
2. Run `npm test` and commit the tested source to `main`.
3. Run the **Release** workflow on `main` with the exact package version, or push a matching `vX.Y.Z` tag.
4. Verify the published release includes `suris-ecoflow-flow-card.js` and the SHA256 checksum.

The workflow validates the version and flow model before publishing. HACS downloads the single JS asset. Configuration remains in the user's dashboard.
