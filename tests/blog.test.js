const fs = require('fs');
const assert = require('assert');

const posts = JSON.parse(fs.readFileSync('data/blog-posts.json', 'utf8'));
assert.ok(Array.isArray(posts), 'Blog data should be an array');
assert.ok(posts.length >= 3, 'There should be at least three starter posts');
posts.forEach((post) => {
  assert.ok(post.slug, 'Each post should have a slug');
  assert.ok(post.title, 'Each post should have a title');
  assert.ok(Array.isArray(post.sections), 'Each post should have sections');
});
