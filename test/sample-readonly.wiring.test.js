'use strict';
const A = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const index = fs.readFileSync(path.join(__dirname, '../sidecar/index.js'), 'utf8');
const registry = fs.readFileSync(path.join(__dirname, '../sidecar/tools/registry.js'), 'utf8');

A.ok(index.includes("o.sampleReadonlyToken === SAMPLE_READONLY_TOKEN"), 'host-minted token required');
A.ok(index.includes("if (sampleReadonly) resolved = SampleReadonly.attenuate(resolved);"), 'pre-model attenuation');
A.ok(index.includes("sampleReadonly: sampleReadonly, sampleReadonlyAllow:"), 'dispatch context guard');
A.ok(index.includes("isTask: false, reflect: false, taskKey: null"), 'sample persistence controls');
A.ok(index.includes("const sys = sampleReadonly"), 'sample prompt bypasses normal context enrichment');
A.ok(index.includes("!internal && !sampleReadonly"), 'sample suppresses memory/journey reuse');
A.ok(registry.includes("if (ctx.sampleReadonly)"), 'central dispatcher guard');
A.ok(registry.includes("'sample-readonly'"), 'dispatcher denial is explicit');
console.log('sample-readonly wiring: PASS');
