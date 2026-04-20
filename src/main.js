const FORM_ENDPOINT = 'https://example.com/api/contact';

function initializeSite() {
  if (typeof document === 'undefined') return;

  const page = document.body?.dataset?.page;
  const href = `/${page === 'home' ? 'index' : page}.html`;
  const currentNavLink = document.querySelector(`.site-nav a[href="${href}"]`);
  if (currentNavLink) currentNavLink.classList.add('is-active');

  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('is-open');
    });
  }

  const form = document.querySelector('#contact-form');
  if (!form) return;

  const status = document.querySelector('#form-status');
  const setStatus = (message, type = '') => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const errors = validateContactForm(values);

    form.querySelectorAll('[data-error-for]').forEach((node) => { node.textContent = ''; });
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, message]) => {
        const target = form.querySelector(`[data-error-for="${field}"]`);
        if (target) target.textContent = message;
      });
      setStatus('Please correct the highlighted fields.', 'is-error');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }
    setStatus('');

    try {
      await submitContactForm(values);
      form.reset();
      setStatus('Thanks — your inquiry has been captured. Connect a backend endpoint in src/main.js to enable live submissions.', 'is-success');
    } catch (error) {
      setStatus(error.message, 'is-error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send inquiry';
      }
    }
  });
}

export function validateContactForm(values) {
  const errors = {};
  if (!values.name || values.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!values.company || values.company.trim().length < 2) errors.company = 'Please enter your company name.';
  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Please enter a valid work email.';
  if (!values.service) errors.service = 'Please choose a service.';
  if (!values.message || values.message.trim().length < 20) errors.message = 'Please share at least 20 characters about your goals.';
  return errors;
}

export async function submitContactForm(payload, fetchImpl = fetch) {
  const response = await fetchImpl(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Unable to submit your inquiry right now. Please try again later.');
  }

  return response.json().catch(() => ({ success: true }));
}

initializeSite();
