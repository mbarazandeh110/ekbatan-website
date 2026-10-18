# Direct Google Search Console API (OAuth 2.0)

This repository can read Search Console directly; GSC Wizard is not required. The integration is read-only and uses Google's official Search Console API with the narrow scope:

`https://www.googleapis.com/auth/webmasters.readonly`

It reports the property access level and daily web-search clicks, impressions, CTR, and average position for the last 28 settled days. Search Console data commonly lags by 2–3 days.

## 1. Create Google OAuth credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project, then enable **Google Search Console API**.
3. Configure the OAuth consent screen. For a personal/internal workflow, keep the audience and test users as restrictive as appropriate.
4. Create an OAuth client ID with application type **Desktop app**.
5. Do not commit the downloaded client file or any token. The local setup script only needs the client ID and, if your credential flow provides one, the client secret.

## 2. Authorize locally

Use Node.js 22.12+ (the site already requires it). In a terminal from the repository root:

```bash
export GOOGLE_OAUTH_CLIENT_ID='your-client-id.apps.googleusercontent.com'
# Optional for clients that provide/use a client secret:
read -s GOOGLE_OAUTH_CLIENT_SECRET
export GOOGLE_OAUTH_CLIENT_SECRET
npm run gsc:auth
```

Open the URL printed by the script and sign in with the Google account that has access to the `ekbatan.tech` Search Console property. Approve the read-only scope. The script receives the OAuth callback only on loopback, validates OAuth state, uses PKCE, and saves the refresh token to `.secrets/gsc-token.json` with owner-only file permissions. The token is never printed.

Run a real read-only test:

```bash
npm run gsc:audit
```

The command lists the account's accessible properties, selects the `ekbatan.tech` domain property if present (otherwise its exact URL-prefix property), and queries the last 28 settled days. If multiple matching properties exist, set `GSC_SITE_URL` to the exact `siteUrl` reported in the error message and rerun. If no matching property appears, grant the authorized Google account access to the verified property in Search Console.

## 3. Enable the daily GitHub Actions report

In GitHub, open **Settings → Secrets and variables → Actions → New repository secret** and add:

- `GOOGLE_OAUTH_CLIENT_ID`: OAuth client ID.
- `GSC_REFRESH_TOKEN`: the `refresh_token` value from the local file `.secrets/gsc-token.json`.

If your OAuth client requires a client secret to refresh tokens, also add `GOOGLE_OAUTH_CLIENT_SECRET`. Do not paste tokens into issues, pull requests, chat, workflow logs, or repository files. Do not use an access token as the refresh-token secret.

Optional repository variable:
- `GSC_SITE_URL`: exact Search Console `siteUrl` if you need to select a specific property; otherwise the script prefers `sc-domain:ekbatan.tech`.

The workflow `.github/workflows/gsc-audit.yml` runs daily at 04:30 UTC (08:00 Asia/Tehran) and supports manual dispatch. It is intentionally read-only, has only `contents: read` permission, publishes a short job summary, and uploads the metrics JSON as a workflow artifact. If the secrets are not configured yet, the scheduled workflow exits with a setup reminder rather than exposing or fabricating data.

## Security notes

- OAuth scope is read-only; no sitemap submission or property mutation is performed.
- The refresh token is stored locally outside tracked files and should be treated as a password.
- The workflow never echoes credentials. Rotate/revoke the token in Google Account security settings if it is exposed.
- A refresh token may stop working if revoked or if OAuth consent is configured in Testing; for a durable unattended setup, review the consent-screen publishing status and Google's token policies.
- This integration does not bypass Search Console property permissions: the Google account must already have access to the site.
