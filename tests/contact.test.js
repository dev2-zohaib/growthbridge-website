const vm = require('vm');
const fs = require('fs');
const assert = require('assert');

const code = fs.readFileSync('assets/js/contact.js', 'utf8');
const sandbox = {
  document: {
    addEventListener: () => {},
    createElement: () => ({ className: '', textContent: '' })
  },
  window: {},
  console,
  FormData,
  fetch: async () => ({ ok: true, json: async () => ({}) })
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

function createField(value = '') {
  return {
    value,
    checked: false,
    classList: { add() {}, remove() {} },
    parentElement: { appendChild() {} }
  };
}

function createForm(valid = true) {
  const fields = {
    '#name': createField(valid ? 'Jane Doe' : ''),
    '#email': createField(valid ? 'jane@example.com' : 'bad-email'),
    '#company': createField(valid ? 'GrowthBridge Client' : ''),
    '#businessType': createField(valid ? 'SaaS' : ''),
    '#budget': createField(valid ? '$5,000-$10,000' : ''),
    '#goal': createField(valid ? 'Generate more leads' : ''),
    '#message': createField(valid ? 'We need a stronger growth engine for our pipeline.' : 'short'),
    '#consent': { checked: valid, classList: { add() {}, remove() {} }, parentElement: { appendChild() {} } }
  };
  return {
    querySelector: (selector) => fields[selector],
    querySelectorAll: () => []
  };
}

assert.strictEqual(sandbox.validateContactForm(createForm(true)), true, 'Expected valid form to pass');
assert.strictEqual(sandbox.validateContactForm(createForm(false)), false, 'Expected invalid form to fail');
