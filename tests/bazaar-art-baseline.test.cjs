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
