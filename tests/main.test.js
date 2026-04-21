const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(function run() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'styles.css'), 'utf8');

  assert.match(html, /<title>GrowthBridge \| Marketing \+ Technology for Measurable Growth<\/title>/);
  assert.match(html, /id="contact-form"/);
  assert.match(html, /Performance marketing/);
  assert.match(html, /Analytics & reporting dashboards/);
  assert.match(css, /@media \(max-width: 720px\)/);
})();
