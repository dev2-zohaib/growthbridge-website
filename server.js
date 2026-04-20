const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const VIEWS_DIR = path.join(ROOT, 'views');
const DATA_DIR = path.join(ROOT, 'data');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function ensureFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
}

ensureDir(DATA_DIR);
ensureDir(BLOG_DIR);
ensureFile(path.join(DATA_DIR, 'contacts.json'), []);
ensureFile(path.join(DATA_DIR, 'bookings.json'), []);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(text = '') {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.socket.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch {
          reject(new Error('Invalid JSON body'));
        }
      } else {
        const params = new URLSearchParams(body);
        resolve(Object.fromEntries(params.entries()));
      }
    });
  });
}

function send(res, statusCode, data, contentType = 'text/html; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(data);
}

function sendJson(res, statusCode, data) {
  send(res, statusCode, JSON.stringify(data, null, 2), 'application/json; charset=utf-8');
}

function readView(name) {
  return fs.readFileSync(path.join(VIEWS_DIR, name), 'utf-8');
}

function layout({ title, description, body }) {
  const template = readView('layout.html');
  return template
    .replace(/{{title}}/g, escapeHtml(title))
    .replace(/{{description}}/g, escapeHtml(description))
    .replace(/{{body}}/g, body);
}

function getAvailableSlots() {
  return [
    '2026-04-22 10:00',
    '2026-04-22 14:00',
    '2026-04-23 11:00',
    '2026-04-23 15:00',
    '2026-04-24 09:30',
    '2026-04-24 13:30'
  ];
}

function markdownToHtml(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('### ')) return `<h3>${escapeHtml(trimmed.slice(4))}</h3>`;
      if (trimmed.startsWith('## ')) return `<h2>${escapeHtml(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith('# ')) return `<h1>${escapeHtml(trimmed.slice(2))}</h1>`;
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').map(line => `<li>${escapeHtml(line.replace(/^-\s*/, ''))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${escapeHtml(trimmed)}</p>`;
    })
    .join('');
}

function parseFrontMatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: fileContent };
  const metaLines = match[1].split('\n');
  const meta = {};
  for (const line of metaLines) {
    const [key, ...rest] = line.split(':');
    meta[key.trim()] = rest.join(':').trim();
  }
  return { meta, body: match[2].trim() };
}

function getBlogPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { meta, body } = parseFrontMatter(raw);
    return {
      slug: meta.slug || file.replace(/\.md$/, ''),
      title: meta.title || 'Untitled Post',
      date: meta.date || '',
      excerpt: meta.excerpt || '',
      tags: (meta.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
      body
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getNav() {
  return `
    <header class="site-header">
      <div class="container nav">
        <a class="logo" href="/">GrowthBridge</a>
        <nav>
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/about">About</a>
          <a href="/booking">Book</a>
          <a href="/blog">Blog</a>
          <a class="button button-small" href="/contact">Contact</a>
        </nav>
      </div>
    </header>
  `;
}

function getFooter() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h3>GrowthBridge</h3>
          <p>Digital-first marketing and technology services for startups, SaaS teams, e-commerce brands, and regional service businesses.</p>
        </div>
        <div>
          <h4>Focus Areas</h4>
          <ul>
            <li>Performance marketing</li>
            <li>Content marketing</li>
            <li>Analytics and reporting</li>
            <li>Marketing automation</li>
          </ul>
        </div>
        <div>
          <h4>Calls to action</h4>
          <p><a href="/booking">Book a discovery call</a></p>
          <p><a href="/contact">Request a growth audit</a></p>
        </div>
      </div>
    </footer>
  `;
}

function renderPage({ title, description, content }) {
  return layout({ title, description, body: `${getNav()}<main>${content}</main>${getFooter()}` });
}

function homePage() {
  return renderPage({
    title: 'GrowthBridge | Marketing and Technology Services',
    description: 'GrowthBridge helps brands solve inconsistent lead generation and low digital visibility with analytics-driven marketing execution.',
    content: `
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <p class="eyebrow">Performance-led digital growth</p>
            <h1>Turn inconsistent lead generation into measurable growth.</h1>
            <p class="lead">GrowthBridge helps startups, e-commerce brands, SaaS companies, and regional service businesses improve digital visibility, generate stronger demand, and prove ROI through analytics-driven execution.</p>
            <div class="actions">
              <a class="button" href="/booking">Book a strategy call</a>
              <a class="button button-secondary" href="/services">Explore services</a>
            </div>
          </div>
          <div class="hero-card">
            <h2>What GrowthBridge solves</h2>
            <ul>
              <li>Unpredictable lead flow and weak funnel performance</li>
              <li>Low organic and paid visibility in competitive markets</li>
              <li>Disconnected analytics and unclear ROI</li>
              <li>Manual marketing operations that slow scale</li>
            </ul>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <h2>Services built for modern growth teams</h2>
          <div class="cards">
            <article class="card"><h3>Performance marketing</h3><p>Paid search, paid social, landing page optimization, and budget allocation focused on measurable returns.</p></article>
            <article class="card"><h3>Content marketing</h3><p>Thoughtful content systems that improve discoverability, educate buyers, and support full-funnel conversion.</p></article>
            <article class="card"><h3>Analytics-driven execution</h3><p>Tracking, attribution, dashboards, and insight loops that connect channel activity to revenue outcomes.</p></article>
            <article class="card"><h3>Marketing automation</h3><p>Email workflows, lead nurturing, and automation foundations that reduce manual work and accelerate follow-up.</p></article>
          </div>
        </div>
      </section>
      <section class="section muted">
        <div class="container">
          <h2>Who we support</h2>
          <div class="cards">
            <article class="card"><h3>Startups</h3><p>Launch faster with a practical growth stack, messaging clarity, and early pipeline momentum.</p></article>
            <article class="card"><h3>E-commerce brands</h3><p>Improve acquisition efficiency, repeat purchase performance, and reporting across channels.</p></article>
            <article class="card"><h3>SaaS companies</h3><p>Support demand generation with performance campaigns, lifecycle content, and marketing automation.</p></article>
            <article class="card"><h3>Regional service businesses</h3><p>Increase local visibility, capture more qualified leads, and build repeatable digital growth.</p></article>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container split">
          <div>
            <h2>Simple process, accountable outcomes</h2>
            <ol>
              <li>Audit channels, analytics, funnel performance, and positioning.</li>
              <li>Prioritize opportunities tied to measurable business outcomes.</li>
              <li>Launch campaigns, content, and automations with clear reporting.</li>
              <li>Iterate using data to improve efficiency and revenue contribution.</li>
            </ol>
          </div>
          <div class="cta-panel">
            <h3>Ready to improve visibility and ROI?</h3>
            <p>Start with a discovery session to review your goals, current bottlenecks, and near-term growth opportunities.</p>
            <a class="button" href="/contact">Request a growth audit</a>
          </div>
        </div>
      </section>
    `
  });
}

function servicesPage() {
  return renderPage({
    title: 'Services | GrowthBridge',
    description: 'Performance marketing, content marketing, analytics, and automation services from GrowthBridge.',
    content: `
      <section class="page-hero"><div class="container"><h1>Services</h1><p>GrowthBridge combines strategy, execution, analytics, and technology to help teams grow with confidence.</p></div></section>
      <section class="section"><div class="container stack">
        <article class="feature"><h2>Performance marketing</h2><p>Campaign planning, creative testing, keyword strategy, retargeting, and conversion optimization designed to improve marketing efficiency and reduce waste.</p></article>
        <article class="feature"><h2>Content marketing</h2><p>Editorial planning, SEO-informed content, case studies, landing pages, and lead magnets that improve visibility and support decision-making.</p></article>
        <article class="feature"><h2>Analytics and reporting</h2><p>Measurement setup, event tracking, dashboarding, attribution alignment, and weekly insight reviews to make performance transparent.</p></article>
        <article class="feature"><h2>Marketing automation</h2><p>Lifecycle journeys, lead scoring, CRM handoff logic, and nurture programs that turn interest into qualified pipeline.</p></article>
      </div></section>
    `
  });
}

function aboutPage() {
  return renderPage({
    title: 'About | GrowthBridge',
    description: 'About GrowthBridge and how the company supports client growth with marketing and technology services.',
    content: `
      <section class="page-hero"><div class="container"><h1>About GrowthBridge</h1><p>GrowthBridge is a digital-first marketing and technology services company built to help ambitious businesses grow through practical, measurable execution.</p></div></section>
      <section class="section"><div class="container split">
        <div>
          <h2>Our point of view</h2>
          <p>Too many teams struggle with low visibility, inconsistent lead generation, and reporting that does not translate into decisions. GrowthBridge closes that gap by aligning messaging, campaigns, analytics, and automation around business outcomes.</p>
          <p>We focus on practical systems that are easy to understand, maintain, and improve over time.</p>
        </div>
        <div>
          <h2>What clients value</h2>
          <ul>
            <li>Clear growth priorities instead of channel guesswork</li>
            <li>Reliable reporting tied to ROI and funnel outcomes</li>
            <li>Fast implementation with clean handoff documentation</li>
            <li>Modern digital strategy grounded in execution</li>
          </ul>
        </div>
      </div></section>
    `
  });
}

function contactPage(message = '', errors = []) {
  return renderPage({
    title: 'Contact | GrowthBridge',
    description: 'Contact GrowthBridge to request a growth audit or discuss marketing support.',
    content: `
      <section class="page-hero"><div class="container"><h1>Contact GrowthBridge</h1><p>Tell us about your growth goals, marketing challenges, and what success looks like.</p></div></section>
      <section class="section"><div class="container form-wrap">
        ${message ? `<div class="notice success">${escapeHtml(message)}</div>` : ''}
        ${errors.length ? `<div class="notice error"><ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul></div>` : ''}
        <form method="POST" action="/contact" class="form-card">
          <label>Name<input name="name" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Company<input name="company" required /></label>
          <label>Business type
            <select name="businessType" required>
              <option value="">Select one</option>
              <option>Startup</option>
              <option>E-commerce brand</option>
              <option>SaaS company</option>
              <option>Regional service business</option>
            </select>
          </label>
          <label>Message<textarea name="message" rows="6" required placeholder="Share your lead generation and visibility goals."></textarea></label>
          <button class="button" type="submit">Send inquiry</button>
        </form>
      </div></section>
    `
  });
}

function bookingPage(message = '', errors = []) {
  const bookings = readJson(path.join(DATA_DIR, 'bookings.json'));
  const bookedSlots = new Set(bookings.map(item => item.slot));
  const slots = getAvailableSlots();
  return renderPage({
    title: 'Book a Call | GrowthBridge',
    description: 'Book a GrowthBridge strategy call using the simple booking system.',
    content: `
      <section class="page-hero"><div class="container"><h1>Book a strategy call</h1><p>Choose an available slot to discuss your goals, current performance, and next best actions.</p></div></section>
      <section class="section"><div class="container split align-start">
        <div>
          <h2>Available slots</h2>
          <ul class="slot-list">
            ${slots.map(slot => `<li class="${bookedSlots.has(slot) ? 'slot booked' : 'slot'}">${escapeHtml(slot)} ${bookedSlots.has(slot) ? '<span>Booked</span>' : '<span>Available</span>'}</li>`).join('')}
          </ul>
        </div>
        <div class="form-wrap">
          ${message ? `<div class="notice success">${escapeHtml(message)}</div>` : ''}
          ${errors.length ? `<div class="notice error"><ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul></div>` : ''}
          <form method="POST" action="/booking" class="form-card">
            <label>Name<input name="name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Company<input name="company" required /></label>
            <label>Select a slot
              <select name="slot" required>
                <option value="">Choose a time</option>
                ${slots.filter(slot => !bookedSlots.has(slot)).map(slot => `<option value="${escapeHtml(slot)}">${escapeHtml(slot)}</option>`).join('')}
              </select>
            </label>
            <label>Notes<textarea name="notes" rows="5" placeholder="Share context for the call."></textarea></label>
            <button class="button" type="submit">Request booking</button>
          </form>
        </div>
      </div></section>
    `
  });
}

function blogListPage() {
  const posts = getBlogPosts();
  return renderPage({
    title: 'Blog | GrowthBridge',
    description: 'GrowthBridge insights on visibility, performance marketing, analytics, and automation.',
    content: `
      <section class="page-hero"><div class="container"><h1>GrowthBridge Blog</h1><p>Practical insights for teams improving demand generation, digital visibility, and marketing performance.</p></div></section>
      <section class="section"><div class="container cards">
        ${posts.map(post => `
          <article class="card blog-card">
            <p class="meta">${escapeHtml(post.date)} · ${escapeHtml(post.tags.join(', '))}</p>
            <h2><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h2>
            <p>${escapeHtml(post.excerpt)}</p>
            <a href="/blog/${escapeHtml(post.slug)}">Read post</a>
          </article>
        `).join('')}
      </div></section>
    `
  });
}

function blogPostPage(slug) {
  const post = getBlogPosts().find(item => item.slug === slug);
  if (!post) return notFoundPage();
  return renderPage({
    title: `${post.title} | GrowthBridge Blog`,
    description: post.excerpt,
    content: `
      <section class="page-hero"><div class="container"><p class="eyebrow">Blog</p><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.date)} · ${escapeHtml(post.tags.join(', '))}</p></div></section>
      <section class="section"><div class="container article">${markdownToHtml(post.body)}</div></section>
    `
  });
}

function adminPage(message = '', errors = []) {
  return renderPage({
    title: 'Blog CMS | GrowthBridge',
    description: 'Simple file-based CMS workflow for creating GrowthBridge blog posts.',
    content: `
      <section class="page-hero"><div class="container"><h1>Simple blog CMS</h1><p>Create a new post using the admin form. Content is stored as Markdown files in the repository.</p></div></section>
      <section class="section"><div class="container split align-start">
        <div>
          <h2>Content workflow</h2>
          <p>This lightweight CMS writes Markdown files into <code>content/blog</code>. It is intended for local-first editing and simple content handoff.</p>
          <p>For production-grade auth, integrate a proper CMS later. For this project, the workflow is intentionally simple and documented in the README.</p>
        </div>
        <div class="form-wrap">
          ${message ? `<div class="notice success">${escapeHtml(message)}</div>` : ''}
          ${errors.length ? `<div class="notice error"><ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul></div>` : ''}
          <form method="POST" action="/admin/blog" class="form-card">
            <label>Title<input name="title" required /></label>
            <label>Date<input name="date" type="date" required /></label>
            <label>Excerpt<textarea name="excerpt" rows="3" required></textarea></label>
            <label>Tags<input name="tags" placeholder="analytics, roi, growth" required /></label>
            <label>Body<textarea name="body" rows="12" required placeholder="# Heading\n\nWrite in Markdown."></textarea></label>
            <button class="button" type="submit">Create post</button>
          </form>
        </div>
      </div></section>
    `
  });
}

function notFoundPage() {
  return renderPage({
    title: 'Page Not Found | GrowthBridge',
    description: 'The page you requested could not be found.',
    content: `<section class="page-hero"><div class="container"><h1>Page not found</h1><p>The page you requested does not exist. Return to the <a href="/">homepage</a>.</p></div></section>`
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

function validateContact(data) {
  const errors = [];
  if (!data.name || data.name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!validateEmail(data.email)) errors.push('A valid email is required.');
  if (!data.company || data.company.trim().length < 2) errors.push('Company is required.');
  if (!data.businessType) errors.push('Business type is required.');
  if (!data.message || data.message.trim().length < 10) errors.push('Message must be at least 10 characters.');
  return errors;
}

function validateBooking(data) {
  const errors = [];
  if (!data.name || data.name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!validateEmail(data.email)) errors.push('A valid email is required.');
  if (!data.company || data.company.trim().length < 2) errors.push('Company is required.');
  if (!data.slot) errors.push('Please select an available slot.');
  if (data.slot && !getAvailableSlots().includes(data.slot)) errors.push('Selected slot is invalid.');
  return errors;
}

function validatePost(data) {
  const errors = [];
  if (!data.title || data.title.trim().length < 5) errors.push('Title must be at least 5 characters.');
  if (!data.date) errors.push('Date is required.');
  if (!data.excerpt || data.excerpt.trim().length < 10) errors.push('Excerpt must be at least 10 characters.');
  if (!data.tags || data.tags.trim().length < 3) errors.push('Tags are required.');
  if (!data.body || data.body.trim().length < 20) errors.push('Body must be at least 20 characters.');
  return errors;
}

function serveStatic(reqPath, res) {
  const filePath = path.join(PUBLIC_DIR, reqPath.replace('/assets/', 'assets/'));
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
    send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    return;
  }
  const ext = path.extname(filePath);
  const contentTypeMap = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  };
  send(res, 200, fs.readFileSync(filePath), contentTypeMap[ext] || 'application/octet-stream');
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  try {
    if (pathname.startsWith('/assets/')) return serveStatic(pathname, res);

    if (req.method === 'GET' && pathname === '/') return send(res, 200, homePage());
    if (req.method === 'GET' && pathname === '/services') return send(res, 200, servicesPage());
    if (req.method === 'GET' && pathname === '/about') return send(res, 200, aboutPage());
    if (req.method === 'GET' && pathname === '/contact') return send(res, 200, contactPage());
    if (req.method === 'GET' && pathname === '/booking') return send(res, 200, bookingPage());
    if (req.method === 'GET' && pathname === '/blog') return send(res, 200, blogListPage());
    if (req.method === 'GET' && pathname === '/admin/blog') return send(res, 200, adminPage());
    if (req.method === 'GET' && pathname === '/api/slots') {
      const bookings = readJson(path.join(DATA_DIR, 'bookings.json'));
      const bookedSlots = new Set(bookings.map(item => item.slot));
      const slots = getAvailableSlots().map(slot => ({ slot, available: !bookedSlots.has(slot) }));
      return sendJson(res, 200, { slots });
    }
    if (req.method === 'GET' && pathname === '/api/contacts') return sendJson(res, 200, { contacts: readJson(path.join(DATA_DIR, 'contacts.json')) });
    if (req.method === 'GET' && pathname === '/api/bookings') return sendJson(res, 200, { bookings: readJson(path.join(DATA_DIR, 'bookings.json')) });

    if (req.method === 'GET' && pathname.startsWith('/blog/')) {
      const slug = pathname.replace('/blog/', '');
      return send(res, 200, blogPostPage(slug));
    }

    if (req.method === 'POST' && pathname === '/contact') {
      const data = await parseBody(req);
      const errors = validateContact(data);
      if (errors.length) return send(res, 400, contactPage('', errors));
      const contactsPath = path.join(DATA_DIR, 'contacts.json');
      const contacts = readJson(contactsPath);
      contacts.push({ ...data, createdAt: new Date().toISOString() });
      writeJson(contactsPath, contacts);
      return send(res, 200, contactPage('Thanks! Your message has been received. We will follow up shortly.'));
    }

    if (req.method === 'POST' && pathname === '/booking') {
      const data = await parseBody(req);
      const errors = validateBooking(data);
      const bookingsPath = path.join(DATA_DIR, 'bookings.json');
      const bookings = readJson(bookingsPath);
      if (bookings.some(item => item.slot === data.slot)) errors.push('That slot was just booked. Please choose another time.');
      if (errors.length) return send(res, 400, bookingPage('', errors));
      bookings.push({ ...data, createdAt: new Date().toISOString() });
      writeJson(bookingsPath, bookings);
      return send(res, 200, bookingPage(`Your booking request for ${data.slot} has been confirmed.`));
    }

    if (req.method === 'POST' && pathname === '/admin/blog') {
      const data = await parseBody(req);
      const errors = validatePost(data);
      if (errors.length) return send(res, 400, adminPage('', errors));
      const slug = slugify(data.title);
      const filePath = path.join(BLOG_DIR, `${slug}.md`);
      const markdown = `---\ntitle: ${data.title}\nslug: ${slug}\ndate: ${data.date}\nexcerpt: ${data.excerpt}\ntags: ${data.tags}\n---\n\n${data.body.trim()}\n`;
      fs.writeFileSync(filePath, markdown);
      return send(res, 200, adminPage(`Post '${data.title}' created successfully.`));
    }

    send(res, 404, notFoundPage());
  } catch (error) {
    send(res, 500, renderPage({
      title: 'Server Error | GrowthBridge',
      description: 'An internal server error occurred.',
      content: `<section class="page-hero"><div class="container"><h1>Something went wrong</h1><p>${escapeHtml(error.message)}</p></div></section>`
    }));
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`GrowthBridge site running at http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  getAvailableSlots,
  validateContact,
  validateBooking,
  validatePost,
  slugify,
  parseFrontMatter,
  markdownToHtml
};
