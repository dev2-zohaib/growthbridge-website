import { describe, expect, it, vi } from 'vitest';
import { submitContactForm, validateContactForm } from '../src/main.js';

describe('validateContactForm', () => {
  it('returns errors for invalid fields', () => {
    const errors = validateContactForm({ name: 'A', email: 'bad', company: '', service: '', message: 'short' });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.company).toBeTruthy();
    expect(errors.service).toBeTruthy();
    expect(errors.message).toBeTruthy();
  });

  it('returns no errors for a valid payload', () => {
    const errors = validateContactForm({
      name: 'Jamie Rivera',
      email: 'jamie@example.com',
      company: 'GrowthBridge Prospect',
      service: 'Performance Marketing',
      message: 'We need better reporting, lead generation, and CRM automation support.',
    });
    expect(errors).toEqual({});
  });
});

describe('submitContactForm', () => {
  it('posts JSON to the configured endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ success: true }) });
    const payload = { name: 'Alex', email: 'alex@example.com', company: 'Acme', service: 'Technical Consulting', message: 'Need analytics help and a scalable site.' };
    const result = await submitContactForm(payload, fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/contact');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(payload);
    expect(result).toEqual({ success: true });
  });

  it('throws when the network response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    await expect(submitContactForm({ name: 'A' }, fetchMock)).rejects.toThrow(/Unable to submit/);
  });
});
