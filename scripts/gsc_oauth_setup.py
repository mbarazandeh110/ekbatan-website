#!/usr/bin/env python3
"""One-time local OAuth 2.0 consent flow for Google Search Console.

Use a Google OAuth Desktop app client JSON file. Never commit that file.
The script prints only the refresh token needed for the GitHub Actions secret.
"""
from __future__ import annotations

import argparse
import json
import secrets
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"


def post_form(url: str, data: dict[str, str]) -> dict:
    request = urllib.request.Request(
        url,
        data=urllib.parse.urlencode(data).encode("utf-8"),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Google OAuth token endpoint returned HTTP {exc.code}.") from None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--client-file", required=True, help="Path to downloaded OAuth Desktop app client JSON.")
    args = parser.parse_args()
    try:
        client_doc = json.loads(Path(args.client_file).expanduser().read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        raise SystemExit("Could not read a valid OAuth client JSON file.") from None

    client = client_doc.get("installed")
    if not isinstance(client, dict):
        raise SystemExit("Expected OAuth client type 'Desktop app' (JSON has no 'installed' object).")
    client_id, client_secret = client.get("client_id"), client.get("client_secret")
    if not client_id or not client_secret:
        raise SystemExit("OAuth client JSON is missing client_id or client_secret.")

    state = secrets.token_urlsafe(24)
    callback = {}

    class CallbackHandler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            if parsed.path != "/oauth2callback" or params.get("state", [""])[0] != state:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Invalid OAuth callback. You may close this window.")
                return
            callback["error"] = params.get("error", [""])[0]
            callback["code"] = params.get("code", [""])[0]
            self.send_response(200 if callback.get("code") else 400)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                b"Authorization received. You may close this browser window."
                if callback.get("code")
                else b"Authorization failed. You may close this browser window."
            )

        def log_message(self, format: str, *args: object) -> None:
            return

    server = HTTPServer(("127.0.0.1", 0), CallbackHandler)
    server.timeout = 180
    redirect_uri = f"http://127.0.0.1:{server.server_port}/oauth2callback"
    auth_url = AUTH_ENDPOINT + "?" + urllib.parse.urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    })
    print("Opening Google consent. Sign in with the account that can access the ekbatan.tech property.")
    if not webbrowser.open(auth_url):
        print(f"Open this URL manually:\n{auth_url}")
    try:
        server.handle_request()
    finally:
        server.server_close()
    if callback.get("error") or not callback.get("code"):
        raise SystemExit("Google authorization was not completed. Run the script again.")

    tokens = post_form(TOKEN_ENDPOINT, {
        "code": callback["code"],
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    })
    refresh_token = tokens.get("refresh_token")
    if not refresh_token:
        raise SystemExit("Google did not return a refresh token. Revoke prior consent and repeat authorization.")
    print("\nCopy this value directly into the GitHub Actions secret GSC_REFRESH_TOKEN.")
    print("Do not paste it into chat, an issue, a commit, or a log.\n")
    print(refresh_token)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
