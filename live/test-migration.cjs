#!/usr/bin/env node
// Dependency-free migration contract tests; no production data or network calls.
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('live/index.html','utf8');
const tests=[
 ['HTML shell',()=>{assert.match(html,/<!doctype html>/i);assert.match(html,/<\/html>\s*$/i)}],
 ['HOLLO keys',()=>{assert.match(html,/hollo_333_direct_connect_v1/);assert.match(html,/333_identity_handoff_v1/)}],
 ['Browser data identifiers',()=>{assert.match(html,/bazaar_live_frontend_v1/);assert.match(html,/bazaar_live_media_v1/)}],
 ['Network handoff route',()=>assert.match(html,/\/333\.github\.io\/app\/HOLLO_333_direct_connect_index\.html#enroll/)],
 ['333 PWA manifest',()=>assert.match(html,/\/333\.github\.io\/manifest\.webmanifest/)],
 ['Single storage handler',()=>assert.equal((html.match(/window\.addEventListener\(['"]storage['"]/g)||[]).length,1)],
 ['Cross-tab post ID diff',()=>assert.match(html,/previousIds=new Set\(state\.posts\.map\(post=>post\.id\)\)/)],
 ['HOLLO storage updates',()=>assert.match(html,/event\.key===HOLLO_STORAGE_KEY\|\|event\.key===IDENTITY_HANDOFF_KEY/)],
 ['Import validation',()=>assert.match(html,/Invalid or duplicate media/)],
 ['Atomic media transaction',()=>{assert.match(html,/db\.transaction\('media','readwrite'\)/);assert.match(html,/tx\.onabort/)}],
 ['No destructive legacy import',()=>assert.doesNotMatch(html,/await MediaDB\.clear\(\);for\(const item/)],
 ['No relative sibling links',()=>assert.doesNotMatch(html,/(?:href|src)=["']\.\.?\//)]
];
let failed=0;for(const [name,fn] of tests){try{fn();console.log('PASS '+name)}catch(e){failed++;console.error('FAIL '+name+': '+e.message)}}
console.log(tests.length-failed+'/'+tests.length+' static contract tests passed');
if(failed)process.exitCode=1;
