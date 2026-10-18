#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const API_BASE = "https://www.googleapis.com/webmasters/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REQUIRED_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_SITE_URL = "https://ekbatan.tech/";
const DAYS_BACK = 28;
const FINAL_DATA_LAG_DAYS = 3;
const ROW_LIMIT = 25_000;

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function getDateRange(now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  end.setUTCDate(end.getUTCDate() - FINAL_DATA_LAG_DAYS);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (DAYS_BACK - 1));
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

export function toCsv(rows = []) {
  if (rows.length === 0) return "keys,clicks,impressions,ctr,position\n";
  const headers = ["keys", "clicks", "impressions", "ctr", "position"];
  const quote = (value) => {
    const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
    return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => quote(header === "keys" ? row.keys : row[header])).join(",")),
  ].join("\n") + "\n";
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error("Missing required GitHub secret/environment variable: " + name);
  return value;
}

async function parseResponse(response, context) {
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { error: { message: text.slice(0, 500) } };
  }
  if (!response.ok) {
    const message = body?.error?.message || response.statusText || "Unknown API error";
    throw new Error(context + " failed (HTTP " + response.status + "): " + message);
  }
  return body;
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: requiredEnv("GSC_CLIENT_ID"),
    client_secret: requiredEnv("GSC_CLIENT_SECRET"),
    refresh_token: requiredEnv("GSC_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(30_000),
  });
  const result = await parseResponse(response, "OAuth token refresh");
  if (!result.access_token) throw new Error("OAuth token refresh returned no access token.");
  return result.access_token;
}

async function apiGet(path, accessToken) {
  const response = await fetch(API_BASE + path, {
    headers: { authorization: "Bearer " + accessToken, accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  return parseResponse(response, "Search Console API request");
}

async function queryRows(siteUrl, accessToken, dateRange, dimensions) {
  const allRows = [];
  for (let startRow = 0; ; startRow += ROW_LIMIT) {
    const response = await fetch(
      API_BASE + "/sites/" + encodeURIComponent(siteUrl) + "/searchAnalytics/query",
      {
        method: "POST",
        headers: {
          authorization: "Bearer " + accessToken,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          ...dateRange,
          dimensions,
          type: "web",
          aggregationType: "auto",
          rowLimit: ROW_LIMIT,
          startRow,
        }),
        signal: AbortSignal.timeout(60_000),
      },
    );
    const result = await parseResponse(response, "Search Analytics query (" + dimensions.join(",") + ")");
    const rows = Array.isArray(result.rows) ? result.rows : [];
    allRows.push(...rows);
    if (rows.length < ROW_LIMIT) break;
  }
  return allRows;
}

function summarize(rows) {
  return rows.reduce(
    (total, row) => ({
      clicks: total.clicks + Number(row.clicks || 0),
      impressions: total.impressions + Number(row.impressions || 0),
    }),
    { clicks: 0, impressions: 0 },
  );
}

async function main() {
  const siteUrl = process.env.GSC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  const accessToken = await getAccessToken();

  const sitesResponse = await apiGet("/sites", accessToken);
  const sites = Array.isArray(sitesResponse.siteEntry) ? sitesResponse.siteEntry : [];
  const site = sites.find((entry) => entry.siteUrl === siteUrl);
  if (!site) {
    const available = sites.map((entry) => entry.siteUrl).join(", ") || "(no properties returned)";
    throw new Error(
      'The OAuth account cannot access the configured property "' + siteUrl + '". ' +
      "Set GSC_SITE_URL to an exact property URL returned by Search Console. Available properties: " + available,
    );
  }

  const dateRange = getDateRange();
  const datasets = {
    by_date: ["date"],
    by_page: ["page"],
    by_query: ["query"],
    by_country: ["country"],
    by_device: ["device"],
  };
  const outputDir = join(process.cwd(), "artifacts", "gsc-" + dateRange.endDate);
  await mkdir(outputDir, { recursive: true });

  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    dateRange,
    source: "Google Search Console Search Analytics API",
    requestedScope: REQUIRED_SCOPE,
    notes: [
      "The report covers " + dateRange.startDate + " through " + dateRange.endDate + ".",
      "The end date is " + FINAL_DATA_LAG_DAYS + " days behind today to reduce partial-data effects.",
      "Search Analytics API results can be sampled/limited to top rows and may not contain every query.",
    ],
    datasets: {},
  };

  for (const [name, dimensions] of Object.entries(datasets)) {
    const rows = await queryRows(siteUrl, accessToken, dateRange, dimensions);
    report.datasets[name] = { dimensions, rowCount: rows.length, rows };
    await writeFile(join(outputDir, name + ".csv"), toCsv(rows), "utf8");
    process.stdout.write("Exported " + name + ": " + rows.length + " rows\n");
  }

  const dailyRows = report.datasets.by_date.rows;
  const totals = summarize(dailyRows);
  report.summary = {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.impressions ? totals.clicks / totals.impressions : 0,
    averagePosition: dailyRows.length
      ? dailyRows.reduce((sum, row) => sum + Number(row.position || 0) * Number(row.impressions || 0), 0) /
        Math.max(totals.impressions, 1)
      : 0,
  };
  await writeFile(join(outputDir, "report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const markdown = [
      "## Google Search Console export",
      "",
      "- **Property:** " + siteUrl,
      "- **Date range:** " + dateRange.startDate + " → " + dateRange.endDate,
      "- **Clicks:** " + totals.clicks.toLocaleString("en-US"),
      "- **Impressions:** " + totals.impressions.toLocaleString("en-US"),
      "- **CTR:** " + (report.summary.ctr * 100).toFixed(2) + "%",
      "- **Impression-weighted average position:** " + report.summary.averagePosition.toFixed(2),
      "",
      "### Export row counts",
      ...Object.entries(report.datasets).map(([name, dataset]) => "- " + name + ": " + dataset.rowCount.toLocaleString("en-US")),
      "",
      "Download the workflow artifact for CSV files and the complete JSON report. Search query rows are not printed in workflow logs.",
      "",
    ].join("\n");
    await writeFile(summaryPath, markdown, { encoding: "utf8", flag: "a" });
  }

  process.stdout.write("Report written to " + outputDir + "\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    // Do not print environment variables, request headers, or tokens.
    process.stderr.write("GSC export failed: " + error.message + "\n");
    process.exitCode = 1;
  });
}
