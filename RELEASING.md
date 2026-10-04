# Releasing

1. Update the version in `package.json`, the JS header and `VERSION`, and `CHANGELOG.md`.
2. Run `npm test` and commit the tested source to `main`.
3. Run the **Release** workflow on `main` with the exact package version, or push a matching `vX.Y.Z` / `vX.Y.Z-beta.N` tag.
4. For a beta, verify the release is marked **Pre-release** and does not replace the latest stable release. The workflow applies `--prerelease --latest=false` automatically for `-beta.N` versions.
5. For a stable release, verify it is marked **Latest**, has no **Pre-release** badge, and is available as the normal HACS update.
6. Verify the published release includes `suris-ecoflow-flow-card.js` and the SHA256 checksum.

The workflow validates the version and flow model before publishing. HACS downloads the single JS asset. Configuration remains in the user's dashboard.
