const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getAvailableSlots,
  validateContact,
  validateBooking,
  validatePost,
  slugify,
  parseFrontMatter,
  markdownToHtml
} = require('../server');

test('getAvailableSlots returns multiple slots', () => {
  const slots = getAvailableSlots();
  assert.equal(Array.isArray(slots), true);
  assert.equal(slots.length >= 4, true);
});

test('validateContact accepts valid contact data', () => {
  const errors = validateContact({
    name: 'Alex Founder',
    email: 'alex@example.com',
    company: 'Growth Co',
    businessType: 'Startup',
    message: 'We need help improving visibility and lead quality.'
  });
  assert.deepEqual(errors, []);
});

test('validateContact rejects invalid data', () => {
  const errors = validateContact({ name: 'A', email: 'bad', company: '', businessType: '', message: 'short' });
  assert.equal(errors.length >= 4, true);
});

test('validateBooking rejects invalid slot', () => {
  const errors = validateBooking({ name: 'Taylor', email: 'taylor@example.com', company: 'Example', slot: '2026-05-01 09:00' });
  assert.equal(errors.includes('Selected slot is invalid.'), true);
});

test('validatePost requires sufficient content', () => {
  const errors = validatePost({ title: 'Post', date: '', excerpt: 'short', tags: '', body: 'tiny' });
  assert.equal(errors.length >= 4, true);
});

test('slugify converts title to URL-safe slug', () => {
  assert.equal(slugify('Marketing ROI Dashboard 101!'), 'marketing-roi-dashboard-101');
});

test('parseFrontMatter extracts metadata and body', () => {
  const parsed = parseFrontMatter('---\ntitle: Sample\nslug: sample\n---\n\n# Heading');
  assert.equal(parsed.meta.title, 'Sample');
  assert.equal(parsed.body, '# Heading');
});

test('markdownToHtml converts headings and paragraphs', () => {
  const html = markdownToHtml('# Title\n\nParagraph text');
  assert.equal(html.includes('<h1>Title</h1>'), true);
  assert.equal(html.includes('<p>Paragraph text</p>'), true);
});
