/* Boot-level proof that v0.11.1 imports the legacy cron store exactly once. */
'use strict';
const A = require('./_assert.js');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cronStore = require('../sidecar/cron-store.js');
const { bootToken } = require('./_httpToken.js');

const HOST = '127.0.0.1';
const INDEX = path.resolve(__dirname, '..', 'sidecar', 'index.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function boot(port, workspaces, attemptsLeft = 20) {
  return new Promise((resolve, reject) => {
    const appSandbox = path.join(workspaces, '_appdata');
    const child = spawn(process.execPath, [INDEX], {
      env: Object.assign({}, process.env, {
        SKYNET_PORT: String(port), SKYNET_WORKSPACES: workspaces, SKYNET_DEV: '1',
        LOCALAPPDATA: appSandbox, APPDATA: appSandbox, XDG_DATA_HOME: appSandbox
      }),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let out = '', settled = false;
    const onData = d => {
      out += d.toString();
      if (!settled && out.includes('http://' + HOST + ':' + port)) {
        settled = true; resolve({ child, port });
      }
      if (!settled && /already in use/i.test(out)) {
        settled = true;
        try { child.kill(); } catch (_) {}
        if (attemptsLeft > 0) resolve(boot(port + 1, workspaces, attemptsLeft - 1));
        else reject(new Error('no free port'));
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', e => {
      if (!settled) { settled = true; reject(e); }
    });
    setTimeout(() => {
      if (!settled) {
        settled = true;
        try { child.kill(); } catch (_) {}
        reject(new Error('boot timeout; output:\n' + out));
      }
    }, 9000);
  });
}

(async () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'sk-cron-migrate-'));
  const legacyPath = path.join(ws, 'cron.jobs.json');
  const runtimePath = path.join(ws, 'cron.jobs.runtime.json');
  const legacyJob = cronStore.makeJob({
    name: 'Legacy brief',
    prompt: 'legacy migration proof',
    schedule: { kind: 'daily', at: '08:00' },
    agentId: 'agent',
    provider: 'codex'
  }, { id: 'legacy-job', now: 1700000000000 });

  fs.writeFileSync(
    legacyPath,
    JSON.stringify(cronStore.toEnvelope([legacyJob])),
    'utf8'
  );

  let booted = await boot(8960 + (process.pid % 40), ws);
  let child = booted.child;
  let port = booted.port;
  let token = await bootToken('http://' + HOST + ':' + port, 'http://' + HOST + ':' + port);

  const getCron = async () => {
    const r = await fetch('http://' + HOST + ':' + port + '/api/cron', {
      headers: { 'X-StarNet-Token': token }
    });
    return { status: r.status, body: await r.json() };
  };
  try {
    let snap = await getCron();
    A.eq(snap.status, 200, 'cron API boots from the legacy store');
    A.eq(snap.body.jobs.length, 1, 'legacy job count preserved');
    A.eq(snap.body.jobs[0].id, 'legacy-job', 'legacy job identity preserved');
    A.ok(fs.existsSync(runtimePath), 'new runtime cron store created');
    A.ok(fs.existsSync(legacyPath), 'legacy cron store preserved as evidence');

    const runtimeEnv = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
    A.eq(runtimeEnv.jobs.length, 1, 'runtime store contains the migrated job');
    A.eq(runtimeEnv.jobs[0].id, 'legacy-job', 'runtime store preserves job id');

    try { child.kill(); } catch (_) {}
    await sleep(200);
    fs.writeFileSync(legacyPath, '{corrupt legacy after migration', 'utf8');

    booted = await boot(port + 100, ws);
    child = booted.child;
    port = booted.port;
    token = await bootToken('http://' + HOST + ':' + port, 'http://' + HOST + ':' + port);
    snap = await getCron();
    A.eq(snap.status, 200, 'second boot reads the runtime store');
    A.eq(snap.body.jobs.length, 1, 'runtime store survives legacy corruption');
    A.eq(snap.body.jobs[0].id, 'legacy-job', 'runtime store stays authoritative after migration');
  } finally {
    try { child.kill(); } catch (_) {}
    await sleep(150);
    try { fs.rmSync(ws, { recursive: true, force: true }); } catch (_) {}
  }

  A.report('cron.legacy-migration.test');
})().catch(e => {
  console.log('FAIL: cron.legacy-migration.test threw — ' + (e && e.stack || e));
  process.exit(1);
});
