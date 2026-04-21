(function () {
  const config = window.GROWTHBRIDGE_CONFIG || {};
  const form = document.getElementById('contact-form');
  const statusElement = document.getElementById('form-status');
  const submitButton = document.getElementById('submit-button');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function validateFormData(formData) {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Please enter your name.';
    if (!validateEmail(formData.email)) errors.email = 'Please enter a valid email address.';
    if (!formData.company.trim()) errors.company = 'Please enter your company name.';
    if (!formData.service.trim()) errors.service = 'Please select a service interest.';
    if (formData.message.trim().length < 20) errors.message = 'Please enter at least 20 characters so we have enough context.';

    return { isValid: Object.keys(errors).length === 0, errors };
  }

  function setFieldError(name, message) {
    const field = form.querySelector(`[name="${name}"]`)?.closest('.field');
    const errorElement = form.querySelector(`[data-error-for="${name}"]`);
    if (field) field.classList.toggle('invalid', Boolean(message));
    if (errorElement) errorElement.textContent = message || '';
  }

  function setStatus(message, type) {
    statusElement.textContent = message;
    statusElement.className = 'form-status' + (type ? ` ${type}` : '');
  }

  function collectFormData() {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  }

  function mockSubmit(payload) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if ((payload.message || '').toLowerCase().includes('fail')) {
          reject(new Error('Mock submission failed. Update the message and try again.'));
          return;
        }
        resolve({ ok: true, id: `mock-${Date.now()}` });
      }, 900);
    });
  }

  async function submitToEndpoint(payload) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), Number(config.requestTimeoutMs || 8000));

    try {
      const response = await fetch(config.submissionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('The submission endpoint returned an error.');
      }

      return await response.json().catch(() => ({ ok: true }));
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = collectFormData();
    const validation = validateFormData(payload);

    ['name', 'email', 'company', 'service', 'message'].forEach((field) => setFieldError(field, validation.errors[field] || ''));

    if (!validation.isValid) {
      setStatus('Please fix the highlighted fields and try again.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    setStatus('Submitting your inquiry...', '');

    try {
      if (config.submissionMode === 'api' && config.submissionEndpoint) {
        await submitToEndpoint(payload);
      } else {
        await mockSubmit(payload);
      }
      form.reset();
      setStatus('Thanks — your inquiry has been captured. GrowthBridge will follow up shortly.', 'success');
    } catch (error) {
      setStatus(error.message || 'Something went wrong while sending your inquiry.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send inquiry';
    }
  }

  if (form && statusElement && submitButton) {
    form.addEventListener('submit', handleSubmit);
  }

  window.GrowthBridgeContact = {
    validateEmail,
    validateFormData,
    mockSubmit
  };
})();
