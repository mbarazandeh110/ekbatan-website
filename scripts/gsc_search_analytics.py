#!/usr/bin/env python3
"""Fetch a bounded, read-only Google Search Console Search Analytics report."""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path
from typing import Any

TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
API_BASE = "https://www.googleapis.com/webmasters/v3"
SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"


class GSCError(RuntimeError):
    """A safe-to-display Google Search Console API error."""


def date_window(today: date | None = None, days: int = 28, lag_days: int = 3) -> tuple[str, str]:
    if days < 1 or lag_days < 0:
        raise ValueError("days must be >= 1 and lag_days must be >= 0")
    end = (today or date.today()) - timedelta(days=lag_days)
    start = end - timedelta(days=days - 1)
    return start.isoformat(), end.isoformat()


def _request_json(url: str, *, data: bytes | None = None, headers: dict[str, str] | None = None) -> dict[str, Any]:
    request = urllib.request.Request(
        url, data=data, headers=headers or {}, method="POST" if data else "GET"
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            raise GSCError(
                f"Google API returned HTTP {exc.code}. Check OAuth consent, refresh token, "
                "Search Console property access, and API enablement."
            ) from None
        raise GSCError(f"Google API request failed with HTTP {exc.code}.") from None
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        raise GSCError("Could not reach Google API or parse its response.") from None


def refresh_access_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    body = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }).encode("utf-8")
    payload = _request_json(
        TOKEN_ENDPOINT,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    token = payload.get("access_token")
    if not token:
        raise GSCError("Google OAuth did not return an access token. Re-authorize the OAuth client.")
    return token


def query_search_analytics(
    access_token: str,
    site_url: str,
    start_date: str,
    end_date: str,
    dimensions: list[str],
    row_limit: int = 25000,
) -> list[dict[str, Any]]:
    encoded_site = urllib.parse.quote(site_url, safe="")
    url = f"{API_BASE}/sites/{encoded_site}/searchAnalytics/query"
    body = json.dumps({
        "startDate": start_date,
        "endDate": end_date,
        "type": "web",
        "dataState": "final",
        "dimensions": dimensions,
        "rowLimit": row_limit,
    }).encode("utf-8")
    payload = _request_json(
        url,
        data=body,
        headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
    )
    rows = []
    for row in payload.get("rows", []):
        record = {key: value for key, value in zip(dimensions, row.get("keys", []))}
        record.update({
            "clicks": row.get("clicks", 0),
            "impressions": row.get("impressions", 0),
            "ctr": row.get("ctr", 0.0),
            "position": row.get("position", 0.0),
        })
        rows.append(record)
    return rows


def write_csv(path: Path, rows: list[dict[str, Any]], columns: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", default="gsc-report")
    parser.add_argument("--days", type=int, default=28)
    parser.add_argument("--lag-days", type=int, default=3)
    parser.add_argument("--site-url", default=os.getenv("GSC_SITE_URL"))
    args = parser.parse_args()

    config = {
        "GSC_OAUTH_CLIENT_ID": os.getenv("GSC_OAUTH_CLIENT_ID", ""),
        "GSC_OAUTH_CLIENT_SECRET": os.getenv("GSC_OAUTH_CLIENT_SECRET", ""),
        "GSC_REFRESH_TOKEN": os.getenv("GSC_REFRESH_TOKEN", ""),
        "GSC_SITE_URL or --site-url": args.site_url or "",
    }
    missing = [name for name, value in config.items() if not value]
    if missing:
        print("Missing required configuration: " + ", ".join(missing), file=sys.stderr)
        return 2

    start_date, end_date = date_window(days=args.days, lag_days=args.lag_days)
    try:
        token = refresh_access_token(
            config["GSC_OAUTH_CLIENT_ID"],
            config["GSC_OAUTH_CLIENT_SECRET"],
            config["GSC_REFRESH_TOKEN"],
        )
        daily = query_search_analytics(token, args.site_url, start_date, end_date, ["date"])
        queries = query_search_analytics(token, args.site_url, start_date, end_date, ["query"])
        pages = query_search_analytics(token, args.site_url, start_date, end_date, ["page"])
        query_pages = query_search_analytics(
            token, args.site_url, start_date, end_date, ["query", "page"], row_limit=10000
        )
    except GSCError as exc:
        print(f"GSC report failed: {exc}", file=sys.stderr)
        return 1

    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    report = {
        "property": args.site_url,
        "search_type": "web",
        "start_date": start_date,
        "end_date": end_date,
        "scope": SCOPE,
        "notes": [
            "Search Analytics API returns top rows and may omit anonymized or low-volume queries.",
            "Average position is an aggregate metric; interpret it with clicks, impressions, and CTR.",
        ],
        "daily": daily,
        "top_queries": queries,
        "top_pages": pages,
        "top_query_pages": query_pages,
    }
    (output / "summary.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    metrics = ["clicks", "impressions", "ctr", "position"]
    write_csv(output / "daily.csv", daily, ["date", *metrics])
    write_csv(output / "top_queries.csv", queries, ["query", *metrics])
    write_csv(output / "top_pages.csv", pages, ["page", *metrics])
    write_csv(output / "top_query_pages.csv", query_pages, ["query", "page", *metrics])
    print(f"GSC API success: {start_date} through {end_date}; report files written to {output}.")
    print("Report rows and search queries are intentionally not printed to workflow logs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
