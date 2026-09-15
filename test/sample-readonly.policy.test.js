'use strict';
const A = require('node:assert/strict');
const Sample = require('../sidecar/capability/sample-readonly.js');

A.equal(Sample.enabled({}), false, 'feature defaults OFF');
A.equal(Sample.enabled({ SKYNET_SAMPLE_READONLY: '1' }), true, 'explicit enable works');
A.deepEqual(Sample.allowlist(), [], 'sample model allowlist starts empty');

const src = {
  tools: ['fs.read', 'fs.write', 'notebook.read', 'tool.search', 'mcp:notion.read'],
  deferred: ['browser.navigate', 'shell.exec'],
  grants: [{ tool: 'fs.read' }, { tool: 'fs.write' }],
  approvalRules: { 'fs.read': {}, 'fs.write': {} },
  networkCaps: { 'fs.read': false, 'fs.write': false }
};
const out = Sample.attenuate(src);
A.deepEqual(out.tools, [], 'all model-callable tools removed');
A.deepEqual(out.deferred, [], 'all deferred tools removed');
A.deepEqual(out.grants, [], 'all grants removed');
A.deepEqual(out.approvalRules, {}, 'approval rules cannot re-expand sample');
A.deepEqual(out.networkCaps, {}, 'network capability map removed');
console.log('sample-readonly policy: PASS');
