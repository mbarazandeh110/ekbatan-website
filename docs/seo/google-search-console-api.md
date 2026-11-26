# Google Search Console API (OAuth 2.0)

This integration reads Search Analytics data for ekbatan.tech using Google's official API. It does not use GSC Wizard, change Search Console settings, submit sitemaps, or modify indexing. The OAuth scope is read-only: `https://www.googleapis.com/auth/webmasters.readonly`.

## 1. Create OAuth credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project and enable **Google Search Console API**.
3. Configure the OAuth consent screen. If the app remains in **Testing**, add the Google account used for Search Console as a test user. Google may issue refresh tokens that expire under testing-mode rules; configure consent status and publishing in accordance with Google's current requirements.
4. Create an OAuth client ID of type **Desktop app** and download its JSON file to a trusted local machine. Do not add the file to this repository.
5. Confirm the Google account used for consent has at least read access to the exact Search Console property.

Official references:
- [Search Console API overview](https://developers.google.com/webmaster-tools)
- [Search Analytics query API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [OAuth 2.0 for installed applications](https://developers.google.com/identity/protocols/oauth2/native-app)

## 2. Generate a refresh token locally

Use Python 3.10+ on a trusted computer. The script uses a local loopback callback and does not write tokens to disk.

```bash
python3 scripts/gsc_oauth_setup.py --client-file ~/Downloads/client_secret_DESKTOP.json
```

Sign in with the Google account that has Search Console access and approve the read-only permission. The script prints a refresh token once. Copy it directly into GitHub Actions secrets; never send it through chat, email, a GitHub issue, or a commit. If Google does not return a refresh token, revoke the app's prior grant in your Google Account and repeat consent.

## 3. Add GitHub Actions secrets

In the repository, open **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Secret | Value |
| --- | --- |
| `GSC_OAUTH_CLIENT_ID` | `client_id` from the downloaded OAuth client JSON |
| `GSC_OAUTH_CLIENT_SECRET` | `client_secret` from the downloaded OAuth client JSON |
| `GSC_REFRESH_TOKEN` | Refresh token printed by the local setup script |
| `GSC_SITE_URL` | The exact property identifier as registered in Search Console |

For `GSC_SITE_URL`, copy exactly one property identifier from Search Console:
- Domain property: `sc-domain:ekbatan.tech`
- URL-prefix property: `https://ekbatan.tech/` (or the exact www property if that is what you own)

Do not guess which property exists. Secrets are not committed to git; do not use repository variables for credentials.

## 4. Run and verify

After this pull request is merged and the four secrets are set:

1. Open **Actions → Google Search Console report → Run workflow**.
2. Inspect the run result. A successful run confirms that the API fetched the requested date range without printing queries or report rows to logs.
3. To inspect a report locally, set the four environment variables in your shell and run:

```bash
python3 -m unittest discover -s tests -p 'test_gsc_search_analytics.py' -v
python3 scripts/gsc_search_analytics.py --output-dir ./gsc-report
```

The report includes daily totals, top queries, top pages, and query/page pairs for the last 28 complete days, excluding the latest 3 days to reduce partial-data effects. Search Analytics API results are bounded and may omit anonymized or low-volume queries.

## Privacy and operations

- This repository is public. The workflow deliberately does **not** upload report artifacts for a public repository, because search queries and page-level metrics should not be exposed publicly. Run the script locally to inspect reports, or move reporting to a private repository before enabling artifacts.
- The workflow has `contents: read` only, does not need a GitHub token with write access, and does not commit reports.
- The scheduled workflow runs daily at 05:00 UTC (08:30 Asia/Tehran).
- If the Google OAuth consent screen is in Testing, refresh-token lifetime may be limited. For durable automation, configure consent status and publishing in accordance with Google's current requirements.
- To revoke access, remove the OAuth grant from Google Account security settings and delete the four GitHub Actions secrets.
