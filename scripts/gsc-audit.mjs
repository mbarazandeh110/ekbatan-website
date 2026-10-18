#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const TOKEN_FILE = resolve(process.env.GSC_TOKEN_FILE || '.secrets/gsc-token.json');
const API_BASE = 'https://www.googleapis.com/webmasters/v3';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const TARGET_HOST = 'ekbatan.tech';

async function loadCredentials() {
  let local = {};
  if (!process.env.GSC_REFRESH_TOKEN || !process.env.GOOGLE_OAUTH_CLIENT_ID) {
    try {
      local = JSON.parse(await readFile(TOKEN_FILE, 'utf8'));
    } catch {
      // CI should use environment secrets; local runs use the file created by gsc:auth.
    }
  }
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || local.client_id;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GSC_REFRESH_TOKEN || local.refresh_token;
  if (!clientId || !refreshToken) {
    throw new Error('GSC OAuth credentials are missing. Run npm run gsc:auth locally, or configure GOOGLE_OAUTH_CLIENT_ID and GSC_REFRESH_TOKEN as GitHub Actions secrets.');
  }
  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken({ clientId, clientSecret, refreshToken }) {
  const form = new URLSearchParams({
    client_id: clientId,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  if (clientSecret) form.set('client_secret', clientSecret);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) {
    const reason = body.error_description || body.error || `HTTP ${response.status}`;
    throw new Error(`Google OAuth token refresh failed: ${reason}. Re-authorize if the refresh token was revoked or expired.`);
  }
  return body.access_token;
}

async function apiRequest(url, accessToken, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = body.error?.message || body.error_description || `HTTP ${response.status}`;
    throw new Error(`Search Console API request failed (${response.status}): ${reason}`);
  }
  return body;
}

function chooseProperty(entries) {
  const configured = process.env.GSC_SITE_URL?.trim();
  if (configured) {
    const exact = entries.find((entry) => entry.siteUrl === configured);
    if (exact) return exact;
    throw new Error(`GSC_SITE_URL="${configured}" is not accessible to this Google account. Matching ekbatan.tech properties: ${entries.filter((e) => e.siteUrl.toLowerCase().includes(TARGET_HOST)).map((e) => e.siteUrl).join(', ') || '(none)'}`);
  }
  const matching = entries.filter((entry) => {
    const site = entry.siteUrl.toLowerCase();
    return site === `sc-domain:${TARGET_HOST}` || site.includes(TARGET_HOST);
  });
  return matching.find((entry) => entry.siteUrl === `sc-domain:${TARGET_HOST}`)
    || matching.find((entry) => entry.siteUrl === `https://${TARGET_HOST}/`)
    || (matching.length === 1 ? matching[0] : null);
}

function dateString(date) {
  return date.toISOString().slice(0, 10);
}

function reportSummary(rows) {
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const weightedPosition = rows.reduce((sum, row) => sum + (row.position || 0) * (row.impressions || 0), 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    averagePosition: impressions ? weightedPosition / impressions : null,
    daysWithData: rows.length,
  };
}

const credentials = await loadCredentials();
const accessToken = await getAccessToken(credentials);
const siteList = await apiRequest(`${API_BASE}/sites`, accessToken);
const entries = siteList.siteEntry || [];
const property = chooseProperty(entries);
if (!property) {
  const visible = entries.filter((entry) => entry.siteUrl.toLowerCase().includes(TARGET_HOST));
  if (!visible.length) {
    throw new Error('No Search Console property for ekbatan.tech is visible to the authorized Google account. Add/verify the property in Search Console and grant this account access.');
  }
  throw new Error(`More than one ekbatan.tech property is visible. Set GSC_SITE_URL to the exact siteUrl value: ${visible.map((entry) => entry.siteUrl).join(', ')}`);
}
if (property.permissionLevel === 'siteUnverifiedUser') {
  throw new Error(`The account has no verified read access to ${property.siteUrl}. Verify the property or grant this account access in Search Console.`);
}

const end = new Date();
end.setUTCDate(end.getUTCDate() - 3); // Search Console data typically settles with a 2–3 day lag.
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - 27);
const range = { startDate: dateString(start), endDate: dateString(end) };
const analytics = await apiRequest(
  `${API_BASE}/sites/${encodeURIComponent(property.siteUrl)}/searchAnalytics/query`,
  accessToken,
  {
    method: 'POST',
    body: JSON.stringify({
      ...range,
      dimensions: ['date'],
      type: 'web',
      aggregationType: 'auto',
      rowLimit: 25000,
      dataState: 'final',
    }),
  },
);
const rows = (analytics.rows || []).map((row) => ({
  date: row.keys?.[0],
  clicks: row.clicks || 0,
  impressions: row.impressions || 0,
  ctr: row.ctr || 0,
  position: row.position || 0,
}));
const report = {
  generatedAt: new Date().toISOString(),
  property: property.siteUrl,
  permissionLevel: property.permissionLevel || 'unknown',
  range,
  summary: reportSummary(rows),
  daily: rows,
  note: 'Read-only Search Console API report. Search Analytics may omit anonymized queries and low-volume rows; daily totals are not guaranteed to equal all UI totals.',
};

const json = JSON.stringify(report, null, 2);
console.log(json);
if (process.env.GITHUB_STEP_SUMMARY) {
  const pct = (report.summary.ctr * 100).toFixed(2);
  const position = report.summary.averagePosition == null ? 'N/A' : report.summary.averagePosition.toFixed(2);
  const markdown = [
    '## Google Search Console — ekbatan.tech',
    '',
    `- **Property:** ${report.property}`,
    `- **Access:** ${report.permissionLevel} (OAuth read-only)`,
    `- **Range:** ${range.startDate} to ${range.endDate}`,
    `- **Clicks:** ${report.summary.clicks}`,
    `- **Impressions:** ${report.summary.impressions}`,
    `- **CTR:** ${pct}%`,
    `- **Average position:** ${position}`,
    `- **Days returned:** ${report.summary.daysWithData}`,
    '',
    'This report uses the official Search Console Search Analytics API. Search Console data commonly lags by 2–3 days.',
  ].join('\n');
  await writeFile(process.env.GITHUB_STEP_SUMMARY, markdown + '\n', { flag: 'a' });
}
