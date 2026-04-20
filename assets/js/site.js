const includes = {
  header: () => `
    <div class="container nav-shell">
      <a class="brand" href="index.html" aria-label="GrowthBridge home">
        <span class="brand-mark" aria-hidden="true">GB</span>
        <span>GrowthBridge</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>
      <nav aria-label="Primary navigation">
        <ul id="primary-nav" class="nav-links">
          <li><a href="index.html" data-nav="home">Home</a></li>
          <li><a href="about.html" data-nav="about">About</a></li>
          <li><a href="services.html" data-nav="services">Services</a></li>
          <li><a href="case-studies.html" data-nav="case-studies">Case Studies</a></li>
          <li><a href="blog.html" data-nav="blog">Blog</a></li>
          <li><a href="contact.html" data-nav="contact">Contact</a></li>
        </ul>
      </nav>
    </div>`,
  footer: () => `
    <div class="container footer-shell">
      <div>
        <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">GB</span><span>GrowthBridge</span></a>
        <p class="footer-note">GrowthBridge Marketing & Technology Solutions helps startups, SaaS companies, e-commerce brands, and service businesses build measurable digital growth systems.</p>
      </div>
      <div>
        <p><strong>Explore</strong></p>
        <div class="footer-links">
          <a href="about.html">About</a>
          <a href="services.html">Services</a>
          <a href="case-studies.html">Case Studies</a>
          <a href="blog.html">Blog</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>
    </div>`
};

function mountIncludes() {
  document.querySelectorAll('[data-include]').forEach((node) => {
    const key = node.dataset.include;
    if (includes[key]) node.innerHTML = includes[key]();
  });
}

function setActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
  });
}

function enableMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  mountIncludes();
  setActiveNav();
  enableMobileNav();
});
