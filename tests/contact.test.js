const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadContactModule() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'contact.js'), 'utf8');
  const sandbox = {
    window: { setTimeout, clearTimeout },
    document: { getElementById: () => null },
    FormData: class {},
    fetch: async () => ({ ok: true, json: async () => ({ ok: true }) }),
    console
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.GrowthBridgeContact;
}

(async function run() {
  const contact = loadContactModule();

  assert.equal(contact.validateEmail('team@growthbridge.co'), true);
  assert.equal(contact.validateEmail('not-an-email'), false);

  const invalid = contact.validateFormData({ name: '', email: 'bad', company: '', service: '', message: 'short' });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.company);
  assert.ok(invalid.errors.service);
  assert.ok(invalid.errors.message);

  const valid = contact.validateFormData({
    name: 'Taylor',
    email: 'taylor@example.com',
    company: 'Northwind',
    service: 'Technical consulting',
    message: 'We need analytics cleanup and CRM automation support this quarter.'
  });
  assert.equal(valid.isValid, true);

  const result = await contact.mockSubmit({ message: 'Normal inquiry payload for demo testing.' });
  assert.equal(result.ok, true);
})();
