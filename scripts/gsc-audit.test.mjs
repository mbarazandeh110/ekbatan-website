import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('audit fails closed when OAuth secrets are missing',()=>{
 const env={...process.env};delete env.GSC_CLIENT_ID;delete env.GSC_CLIENT_SECRET;delete env.GSC_REFRESH_TOKEN;
 const r=spawnSync(process.execPath,['scripts/gsc-audit.mjs'],{cwd:process.cwd(),env,encoding:'utf8'});
 assert.notEqual(r.status,0);
 assert.match(r.stderr,/Missing required environment variable: GSC_CLIENT_ID/);
 assert.doesNotMatch(r.stdout+r.stderr,/refresh_token=|client_secret=/);
});
