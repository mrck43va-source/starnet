'use strict';

const FEATURE_ENV = 'SKYNET_SAMPLE_READONLY';
const FIXED_ALLOWLIST = Object.freeze([]);

function enabled(env) {
  env = env || {};
  return /^(1|true|yes|on)$/i.test(String(env[FEATURE_ENV] || '').trim());
}

function allowlist() {
  return FIXED_ALLOWLIST.slice();
}

function attenuate(resolved) {
  const allow = new Set(FIXED_ALLOWLIST);
  const src = resolved || {};
  const approvalRules = {};
  const networkCaps = {};
  for (const name of FIXED_ALLOWLIST) {
    if (src.approvalRules && src.approvalRules[name]) approvalRules[name] = src.approvalRules[name];
    if (src.networkCaps && Object.prototype.hasOwnProperty.call(src.networkCaps, name)) {
      networkCaps[name] = src.networkCaps[name];
    }
  }
  return Object.assign({}, src, {
    tools: (src.tools || []).filter(name => allow.has(name)),
    deferred: [],
    grants: (src.grants || []).filter(grant => grant && allow.has(grant.tool)),
    approvalRules,
    networkCaps
  });
}

function classifyTool(tool) {
  if (!tool || !tool.name || !tool.scope) return 'unknown';
  if (tool.network === true || (tool.capability && /^mcp:/.test(String(tool.capability)))) return 'network';
  if (tool.scope === 'read') return 'read-only';
  if (tool.scope === 'write' || tool.scope === 'execute') return 'mutation';
  return 'unknown';
}

module.exports = {
  FEATURE_ENV,
  FIXED_ALLOWLIST,
  enabled,
  allowlist,
  attenuate,
  classifyTool
};
