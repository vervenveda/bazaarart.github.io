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


test('All 50 mediums have six original, fully documented studio weeks',()=>{
  const paths=[
    'apps/curriculum/mediums-01-10.json',
    'apps/curriculum/mediums-11-20.json',
    'apps/curriculum/mediums-21-30.json',
    'apps/curriculum/mediums-31-40.json',
    'apps/curriculum/mediums-41-50.json'
  ];
  const all=[];
  paths.forEach((file,index)=>{
    const parsed=JSON.parse(read(file));
    assert.equal(parsed.schema,'bazaar-art-medium-curriculum-v2');
    assert.equal(parsed.startIndex,index*10);
    assert.equal(parsed.courses.length,10);
    all.push(...parsed.courses);
  });
  const source=read('apps/art-education.html');
  const names=JSON.parse(source.match(/const MEDIUMS = (\[[^\n]+\]);/)[1]).map(c=>c.name);
  assert.equal(names.length,50);
  assert.deepEqual(all.map(c=>c[0]),names,'Course order cannot change (legacy progress IDs depend on indices)');
  const authored=new Set(), evidence=new Set();
  for(const course of all){
    assert.equal(course[1].length,6,'A medium must have exactly 6 weeks: '+course[0]);
    for(const [week,parts] of course[1].entries()){
      assert.equal(parts.length,4,course[0]+' week '+(week+1)+' requires title, demo, practice and evidence');
      assert.ok(typeof parts[0]==='string'&&parts[0].length>=9,'Week requires a meaningful title');
      for(const field of parts.slice(1))assert.ok(typeof field==='string'&&field.length>=25,'Incomplete authored instruction, practice or evidence');
      assert.ok(parts[1].length>=35&&parts[2].length>=30&&parts[3].length>=25,'Thin lesson content: '+course[0]+' week '+(week+1));
      assert.ok(!authored.has(parts[2]),'Studio assignment duplicated: '+parts[2]);
      authored.add(parts[2]);evidence.add(parts[3]);
    }
  }
  assert.equal(authored.size,300);
  assert.ok(evidence.size>=290,'Each week should specify unique portfolio evidence');
});

test('Both standalone portal pages embed the complete authored syllabus with stable progress keys',()=>{
  const sources=['apps/art-education.html','apps/Class_art_education_portal_index.html'].map(read);
  assert.equal(sources[0],sources[1],'Both public URLs must remain exactly in sync');
  const canonical=[
    'apps/curriculum/mediums-01-10.json',
    'apps/curriculum/mediums-11-20.json',
    'apps/curriculum/mediums-21-30.json',
    'apps/curriculum/mediums-31-40.json',
    'apps/curriculum/mediums-41-50.json'
  ].flatMap(file=>JSON.parse(read(file)).courses);
  for(const s of sources){
    const match=s.match(/const STUDIO_COURSES_V2 = (\[[^\n]+\]);/);
    assert.ok(match,'Missing offline-embedded complete curriculum');
    assert.deepEqual(JSON.parse(match[1]),canonical,'Inline courses drifted from authored source documents');
    for(const phrase of [
      'Instructor demonstration:', 'Guided studio assignment:', 'Portfolio evidence:',
      'Reflection prompt:', 'Studio quality checklist', 'I completed and documented this week (self-reported)',
      'data-check=', 'state.checks', 'function makePlan(m)', 'entry[0]!==m.name'
    ])assert.ok(s.includes(phrase),'Missing pedagogical or backward-compatibility feature: '+phrase);
    assert.ok(!s.includes('>Mark 6 Weeks</button>'),'One-click whole-course self-certification should not appear');
    assert.ok(!s.includes('const isDigital = m.cat'),'Old shared template must not run instead of authored lessons');
  }
});
