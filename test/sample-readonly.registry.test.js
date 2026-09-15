'use strict';
const A = require('node:assert/strict');
const { makeRegistry } = require('../sidecar/tools/registry.js');

(async () => {
  const reg = makeRegistry();
  let calls = 0;
  const deniedNames = [
    'fs.write', 'notebook.write', 'shell.exec', 'browser.navigate', 'web_search',
    'mcp:notion.read', 'message.send', 'computer.use', 'team.dispatch',
    'todo.write', 'tool.search'
  ];
  for (const name of deniedNames) reg.register({
    name, description: 'tripwire ' + name,
    schema: { type: 'object', properties: {}, additionalProperties: false },
    scope: 'execute', capability: 'test', requiresConsent: false,
    run: async () => { calls++; return 'SIDE EFFECT'; }
  });

  const ctx = { sampleReadonly: true, sampleReadonlyAllow: [] };
  for (const name of deniedNames) {
    const out = await reg.dispatch({ name, args: {} }, ctx);
    A.equal(out.isError, true, name + ' denied');
    A.equal(out.summary, 'sample-readonly', name + ' uses sample guard');
  }
  A.equal(calls, 0, 'all tripwires remain at zero calls');

  const unknown = await reg.dispatch({ name: 'future.unknown.tool', args: {} }, ctx);
  A.equal(unknown.isError, true);
  A.equal(unknown.summary, 'sample-readonly', 'unknown/new tools fail closed');
  A.equal(calls, 0);
  console.log('sample-readonly registry/adversarial guard: PASS');
})().catch(e => { console.error(e); process.exit(1); });
