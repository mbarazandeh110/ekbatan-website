#!/usr/bin/env node
import { createServer } from 'node:http';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { mkdir, writeFile, chmod } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_PATH = resolve(process.env.GSC_TOKEN_FILE || '.secrets/gsc-token.json');
const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();

if (!clientId) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID. Create an OAuth client of type Desktop app in Google Cloud Console and export its client ID.');
  process.exit(1);
}

const base64url = (buffer) => buffer.toString('base64url');
const verifier = base64url(randomBytes(48));
const challenge = base64url(createHash('sha256').update(verifier).digest());
const state = base64url(randomBytes(32));

let callbackResolve;
let callbackReject;
const callbackResult = new Promise((resolvePromise, rejectPromise) => {
  callbackResolve = resolvePromise;
  callbackReject = rejectPromise;
});

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (url.pathname !== '/oauth2callback') {
    res.writeHead(404).end('Not found');
    return;
  }

  const receivedState = url.searchParams.get('state') || '';
  const expected = Buffer.from(state);
  const actual = Buffer.from(receivedState);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' }).end('OAuth state validation failed. You can close this window.');
    callbackReject(new Error('OAuth state validation failed.'));
    return;
  }

  const error = url.searchParams.get('error');
  if (error) {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' }).end('Google authorization was not completed. You can close this window.');
    callbackReject(new Error(`Google authorization failed: ${error}`));
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400).end('Missing authorization code.');
    callbackReject(new Error('Google did not return an authorization code.'));
    return;
  }

  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    .end('<!doctype html><html><body><h2>Google authorization received</h2><p>You can close this tab and return to the terminal.</p></body></html>');
  callbackResolve(code);
});

await new Promise((resolvePromise, rejectPromise) => {
  server.once('error', rejectPromise);
  server.listen(0, '127.0.0.1', resolvePromise);
});

const address = server.address();
if (!address || typeof address === 'string') throw new Error('Could not determine local OAuth callback port.');
const redirectUri = `http://localhost:${address.port}/oauth2callback`;
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
for (const [key, value] of Object.entries({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'consent',
  state,
  code_challenge: challenge,
  code_challenge_method: 'S256',
})) authUrl.searchParams.set(key, value);

console.log('Open this URL in a browser and authorize the Google account that has access to ekbatan.tech:');
console.log(authUrl.toString());
console.log('\nWaiting for the OAuth callback on loopback (no public callback server is used)…');

let timeout;
try {
  const code = await Promise.race([
    callbackResult,
    new Promise((_, rejectPromise) => {
      timeout = setTimeout(() => rejectPromise(new Error('Timed out waiting for Google OAuth callback after 5 minutes.')), 5 * 60 * 1000);
      timeout.unref?.();
    }),
  ]);

  const form = new URLSearchParams({
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: verifier,
  });
  if (clientSecret) form.set('client_secret', clientSecret);

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(`Token exchange failed (${tokenResponse.status}): ${tokens.error_description || tokens.error || 'Google returned an error'}`);
  if (!tokens.refresh_token) {
    throw new Error('Google did not return a refresh token. Re-run authorization and approve consent; do not copy access tokens into GitHub Secrets.');
  }

  await mkdir(dirname(TOKEN_PATH), { recursive: true, mode: 0o700 });
  await writeFile(TOKEN_PATH, JSON.stringify({
    client_id: clientId,
    refresh_token: tokens.refresh_token,
    scope: tokens.scope || SCOPE,
    created_at: new Date().toISOString(),
  }, null, 2) + '\n', { mode: 0o600 });
  await chmod(dirname(TOKEN_PATH), 0o700);
  await chmod(TOKEN_PATH, 0o600);

  console.log(`\nOAuth authorization succeeded. Credentials saved with owner-only permissions to: ${TOKEN_PATH}`);
  console.log('The refresh token was not printed. Keep this file out of Git; copy its refresh_token value to the GitHub Actions secret GSC_REFRESH_TOKEN using GitHub Settings.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'OAuth setup failed.');
  process.exitCode = 1;
} finally {
  if (timeout) clearTimeout(timeout);
  server.close();
}
