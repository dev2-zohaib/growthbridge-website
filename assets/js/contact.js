function setStatus(message, isError = false) {
  const status = document.getElementById('form-status');
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? '#ff9aa2' : 'var(--accent-2)';
}

function clearErrors(form) {
  form.querySelectorAll('.error-text').forEach((node) => node.remove());
  form.querySelectorAll('.input-error').forEach((node) => node.classList.remove('input-error'));
}

function showFieldError(field, message) {
  field.classList.add('input-error');
  const error = document.createElement('div');
  error.className = 'error-text';
  error.textContent = message;
  field.parentElement.appendChild(error);
}

function validateContactForm(form) {
  clearErrors(form);
  let valid = true;
  const rules = [
    { id: 'name', test: (v) => v.trim().length >= 2, message: 'Please enter your full name.' },
    { id: 'email', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'Please enter a valid email address.' },
    { id: 'company', test: (v) => v.trim().length >= 2, message: 'Please enter your company name.' },
    { id: 'businessType', test: (v) => v.trim() !== '', message: 'Please choose a business type.' },
    { id: 'budget', test: (v) => v.trim() !== '', message: 'Please choose a budget range.' },
    { id: 'goal', test: (v) => v.trim() !== '', message: 'Please choose a primary goal.' },
    { id: 'message', test: (v) => v.trim().length >= 20, message: 'Please provide at least 20 characters about your project.' }
  ];

  rules.forEach((rule) => {
    const field = form.querySelector(`#${rule.id}`);
    if (!rule.test(field.value)) {
      valid = false;
      showFieldError(field, rule.message);
    }
  });

  const consent = form.querySelector('#consent');
  if (!consent.checked) {
    valid = false;
    showFieldError(consent, 'You must consent before submitting.');
  }

  return valid;
}

async function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  setStatus('');
  if (!validateContactForm(form)) {
    setStatus('Please correct the highlighted fields and try again.', true);
    return;
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.submittedAt = new Date().toISOString();

  try {
    setStatus('Submitting your inquiry...');
    const response = await fetch(window.GROWTHBRIDGE_CONFIG.contactEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    await response.json().catch(() => ({}));
    form.reset();
    clearErrors(form);
    setStatus('Thanks — your inquiry was submitted successfully.');
  } catch (error) {
    setStatus('Submission could not be completed. Update the endpoint configuration or test with the provided Postman collection.', true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', handleContactSubmit);
});
