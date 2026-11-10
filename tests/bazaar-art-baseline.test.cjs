#!/usr/bin/env node
/* Bazaar Art source regression baseline.
 * Read-only: uses tracked public source; never opens browsers, writes data,
 * contacts services, or processes personal artwork or student records.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));

function manifest(name) {
  const home = read('index.html');
  const match = home.match(new RegExp('(?:^|\\n)const ' + name + '=(\\[[^\\r\\n]*\\]);'));
  assert.ok(match, 'Missing public directory registry: ' + name);
  return JSON.parse(match[1]);
}

test('Bazaar Art landing page and visitor routes are preserved', () => {
  for (const file of [
    'index.html', 'README.md', 'SECURITY.md', 'academy/index.html',
    'apps/Photo_Album_Studio/index.html',
    'apps/Photo_Album_Studio/README.md',
    'apps/photo_album_index.html',
    'apps/Class_art_education_portal_index.html',
    'apps/art-education.html',
    'apps/art_tool_Sagaen™_art_studio_index.html'
  ]) assert.ok(exists(file), 'Missing existing route: ' + file);
});

test('Every locally listed application points to a real in-repository file', () => {
  const apps = manifest('apps');
  assert.ok(apps.length >= 43, 'Public directory unexpectedly lost applications');
  const ids = new Set();
  const routes = new Set();
  for (const app of apps) {
    assert.equal(typeof app.id, 'string');
    assert.equal(typeof app.path, 'string');
    assert.ok(!ids.has(app.id), 'Duplicate app identifier: ' + app.id);
    ids.add(app.id);
    assert.ok(!routes.has(app.path), 'Duplicate app route: ' + app.path);
    routes.add(app.path);
    assert.ok(!app.path.startsWith('/'), 'Absolute local route: ' + app.path);
    assert.ok(!app.path.includes('..'), 'Path traversal: ' + app.path);
    assert.ok(!/^[a-z]+:/i.test(app.path), 'External URL in local registry: ' + app.path);
    assert.ok(exists(app.path), 'Directory destination not found: ' + app.path);
  }
  for (const id of ['sagaen', 'art-education', 'photo-album', 'art-hall']) {
    assert.ok(ids.has(id), 'Missing key creative doorway: ' + id);
  }
});

test('333 social feed and independent gallery remain linked destinations', () => {
  const connected = manifest('connectedStudios');
  const networks = manifest('networks');
  assert.ok(connected.some(x => x.id === 'network-bazaar-live' && x.source === '333 Network'));
  assert.ok(networks.some(x => x.title === 'My Art Gallery'));
  for (const entry of connected) {
    assert.match(entry.url, /^https:\/\//, 'Connected studio must be HTTPS');
  }
});

test('Studio Shelf and selected theme retain legacy browser storage keys', () => {
  const home = read('index.html');
  assert.ok(home.includes('bazaarArtStudioShelfV3'), 'Studio Shelf storage key changed');
  assert.ok(home.includes('THEME_KEY'), 'Existing visual theme persistence disappeared');
});

test('50-medium learning portal preserves progress, portfolio and call records', () => {
  for (const file of [
    'apps/Class_art_education_portal_index.html', 'apps/art-education.html'
  ]) {
    const content = read(file);
    assert.ok(content.includes("const storeKey = 'sovereignArtEducationPortal.v1'"), file + ': storage key changed');
    assert.ok(content.includes("storeKey+'.portfolio'"), file + ': portfolio storage changed');
    assert.ok(content.includes("storeKey+'.calls'"), file + ': calls storage changed');
    for (const id of ['exportProgressBtn', 'downloadPortfolioBtn', 'exportPortfolioBtn', 'downloadCallsBtn']) {
      assert.ok(content.includes('id="' + id + '"'), file + ': export control missing: ' + id);
    }
    assert.ok(content.includes('const MEDIUMS = ['), file + ': curriculum registry missing');
    assert.ok(content.includes('function certificateHTML()'), file + ': printable completion record missing');
  }
});

test('Photo Album Studio preserves primary store, fallback and legacy import', () => {
  const studio = read('apps/Photo_Album_Studio/index.html');
  for (const key of [
    'photo_album_studio_db_v1', 'photo_album_studio_fallback_v1',
    'photo_album_studio_ui_theme_v1', 'sovereign_album_v3'
  ]) assert.ok(studio.includes(key), 'Album record migration key missing: ' + key);
  for (const feature of ['indexedDB.open(', 'function exportAlbumHtml(', 'function importPayload(',
    'id="exportJsonButton"', 'id="exportHtmlButton"', 'id="exportAllButton"',
    'id="legacyImportButton"']) {
    assert.ok(studio.includes(feature), 'Album recovery feature missing: ' + feature);
  }
});

test('Art 101 Week 01 through Week 26 existing lesson routes remain intact', () => {
  const groups = [
    [1, [1]], [2, [2, 3, 4]], [3, [5, 6, 7]],
    [4, [8, 9, 10]], [5, [11, 12, 13]],
    [6, [14, 15, 16]], [7, [17, 18, 19]],
    [8, [20, 21, 22]], [9, [23, 24, 25]], [10, [26]]
  ];
  for (const [unit, weeks] of groups) {
    const folder = 'academy/grade-9/unit-' + String(unit).padStart(2, '0');
    assert.ok(exists(folder + '/index.html'), 'Missing unit overview: ' + folder);
    for (const week of weeks) {
      const lesson = folder + '/week-' + String(week).padStart(2, '0') + '/index.html';
      assert.ok(exists(lesson), 'Missing existing lesson: ' + lesson);
    }
  }
  for (const grade of [10, 11, 12]) {
    assert.ok(exists('academy/grade-' + grade + '/unit-01/week-01/index.html'),
      'Missing higher-grade original lesson: ' + grade);
  }
});

test('Formative practice cannot substitute for authenticated progression', () => {
  const quiz = read('academy/shared/formative-assessment-v1.js');
  const gate = read('academy/shared/progression-gate-v1.js');
  const week1 = read('academy/grade-9/unit-01/week-01/index.html');
  assert.ok(quiz.includes('score>=80'), 'Formative reference threshold unexpectedly changed');
  assert.ok(gate.includes('response.authorized===true'), 'Gate authorization check missing');
  assert.ok(gate.includes('response.identityVerified===true'), 'Identity gate missing');
  assert.ok(gate.includes('response.evidenceApproved===true'), 'Studio evidence gate missing');
  assert.ok(week1.includes('progression-gate-v1.js'), 'Original Week 01 gate disconnected');
});

test('No destructive bulk browser-store wipe was added to core creative tools', () => {
  for (const file of [
    'index.html', 'apps/art-education.html',
    'apps/Class_art_education_portal_index.html',
    'apps/Photo_Album_Studio/index.html'
  ]) {
    const content = read(file);
    assert.doesNotMatch(content, /\blocalStorage\.clear\s*\(/, file + ': broad localStorage wipe');
    assert.doesNotMatch(content, /\bindexedDB\.deleteDatabase\s*\(/, file + ': database deletion');
  }
});


test('Education Portal standalone inline scripts compile in both maintained URLs', () => {
  const vm = require('node:vm');
  for (const file of ['apps/art-education.html', 'apps/Class_art_education_portal_index.html']) {
    const html=read(file);
    const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
      .filter(match=>!/\bsrc\s*=/.test(match[1]))
      .map(match=>match[2]).filter(Boolean);
    assert.ok(inline.length>=1, file+': missing offline-capable script');
    for (const script of inline) assert.doesNotThrow(()=>new vm.Script(script,{filename:file}), file+': invalid JavaScript');
  }
});

test('Both education portal URLs share equivalent content without drift', () => {
  const a=read('apps/art-education.html').trim();
  const b=read('apps/Class_art_education_portal_index.html').trim();
  assert.equal(a,b,'Portal aliases must remain behaviorally identical');
});

test('Art Education Portfolio keeps original data while migrating to IndexedDB', () => {
  for(const file of ['apps/art-education.html','apps/Class_art_education_portal_index.html']){
    const src=read(file);
    for(const field of [
      'sovereign_art_education_portfolio_v2',
      'indexedDB.open(DB_NAME,1)',
      'function initializePortfolioStorage()',
      'function readPortfolioDb(db)',
      'function writePortfolioDb(db,artworks)',
      "localStorage.getItem(storeKey+'.portfolio')",
      'const MAX_IMAGE_BYTES = 25 * 1024 * 1024;',
      'function prepareArtworkFile(file)',
      'function savePortfolioSilent()',
    ]) assert.ok(src.includes(field),file+': missing persistence requirement '+field);
    assert.doesNotMatch(src,/localStorage\.removeItem\s*\(\s*storeKey\s*\+\s*['"]\.portfolio['"]/,file+': legacy artwork erased');
    assert.ok(src.includes('storageMessage('),'Storage errors should be surfaced');
  }
});

test('Complete Backup has explicit merge-only import and original exports remain',()=>{
  for(const file of ['apps/art-education.html','apps/Class_art_education_portal_index.html']){
    const src=read(file);
    for(const field of [
      'id="fullBackupBtn"','id="importBackupBtn"','id="importBackupFile"',
      "schema:'bazaar-art-education-bundle-v2'",
      'function fullBackupPayload()',
      'function downloadFullBackup()',
      'async function importEducationBackup(file)',
      'function safeBackupArt(item)',
      'function safeBackupProgress(data)',
      'function safeBackupCalls(rows)',
      "kind='Legacy portfolio'",
      "kind='Legacy progress'",
      'nextArt=portfolio.slice()',
      'nextCalls=callRows.slice()',
      'Existing records will NOT be deleted',
      'MAX_BACKUP_BYTES',
      'MAX_ARTWORKS',
      "download('artist-portfolio-backup.json'",
      "download('art-education-progress.json'"
    ]) assert.ok(src.includes(field),file+': backup contract missing '+field);
  }
});


test('Personal studio certificate is distinguished from Academy credentials',()=>{
  for(const file of ['apps/art-education.html','apps/Class_art_education_portal_index.html']){
    const src=read(file);
    for(const marker of [
      'Personal Studio Learning Certificate',
      'Studio Progress Summary',
      'Personal Certificate of Studio Learning',
      'SELF-REPORTED STUDIO RECORD',
      'NOT AN ACADEMY-ISSUED CREDENTIAL',
      "function certificateCourse(focus)",
      "function certificateEligibility()",
      "function renderCertificateFocusOptions()",
      "function certificateHTML()",
      "certificateHTML(){",
      "if(!generateCert().ready)return null;",
      "status.done+' of '+status.total",
      "status.reasons.join(' ')",
      "id=\"certEligibility\"",
      "id=\"certReflection\"",
      "id=\"certHonesty\"",
      "id=\"certPrintBtn\" disabled",
      "id=\"downloadCertBtn\" disabled",
      "option.value='medium:'+i",
      "personal-studio-learning-record.html"
    ])assert.ok(src.includes(marker),file+' missing certificate guard '+marker);
    assert.ok(!src.includes('<h2>Certificate of Completion</h2>'),file+' may not claim unverified completion at rest');
    assert.doesNotMatch(src,/id="certPrintBtn"[^>]*onclick="window\.print\(\)"/);
  }
});

test('Certificate rules check exact canonical course keys and not arbitrary counts',()=>{
  const src=read('apps/art-education.html');
  const fn=src.slice(src.indexOf('function certificateCourse(focus){'),src.indexOf('function renderSources(){'));
  for(const item of [
    "Array.from({length:MEDIUMS.length}",
    "PROFESSIONAL.flatMap(",
    "portfolioKeys=PORTFOLIO.map(",
    "callKeys=CALLS.map(",
    "key.startsWith('m.')",
    "===true).length",
    "done<course.keys.length",
    "portfolio.length===0",
    "callRows.length===0",
    "reflection.length<40",
    "certHonesty",
    "document.createElement('option')"
  ])assert.ok(fn.includes(item),'Missing course-specific requirement: '+item);
  assert.ok(fn.includes("completed?'Personal Certificate of Studio Learning':'Studio Progress Summary'"));
  assert.ok(!fn.includes('localStorage.setItem('),'Certificate selection must not modify learning records');
});

test('Both certificate preview and standalone certificate avoid external authority claims',()=>{
  const html=read('apps/art-education.html');
  const source=html.slice(html.indexOf('function certificateHTML(){'),html.indexOf('function renderSources(){'));
  assert.ok(source.includes('if(!generateCert().ready)return null'));
  assert.ok(source.includes("$('#certificateOutput').outerHTML"),'Export must serialize the guarded preview and disclaimer');
  assert.ok(!source.includes('https://'),'Standalone certificate should not require external resources');
});
