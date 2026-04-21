# GrowthBridge Website

A complete responsive marketing website for **GrowthBridge**, a digital-first marketing and technology services company focused on measurable ROI, integrated execution, and modern credibility.

## What is included

- Responsive landing page with:
  - Hero section and value proposition
  - Services section covering performance marketing, analytics/reporting dashboards, content marketing/brand positioning, marketing automation/CRM integrations, and technical consulting
  - About / why GrowthBridge section
  - Process section
  - Benefits section
  - Calls to action
  - Contact section with working client-side form UX
- Accessible semantic HTML and polished modern styling
- Mobile navigation behavior
- Contact form validation, loading state, success/error handling, and configurable submission workflow
- Lightweight automated tests using Node's built-in tooling
- Social preview SVG asset

## Project structure

```text
.
├── README.md
├── index.html
├── package.json
├── assets
│   ├── css
│   │   └── styles.css
│   ├── images
│   │   └── og-growthbridge.svg
│   └── js
│       ├── config.js
│       ├── contact.js
│       └── main.js
└── tests
    ├── contact.test.js
    ├── main.test.js
    └── run-tests.js
```

## Local setup

### Option 1: simple static server

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

### Option 2: npm scripts

```bash
npm install
npm test
npm start
```

> No runtime dependencies are required. `npm install` will simply create a lockfile if desired.

## Contact form workflow

The site ships with a complete usable front-end submission workflow.

### Default behavior

The form uses a **mock submission handler** by default so it works in demos and local testing without a backend.

Configuration lives in:

- `assets/js/config.js`

Default config:

```js
window.GROWTHBRIDGE_CONFIG = {
  submissionMode: 'mock',
  submissionEndpoint: '',
  requestTimeoutMs: 8000
};
```

### Connect to a live endpoint

1. Replace the config with your real endpoint:

```js
window.GROWTHBRIDGE_CONFIG = {
  submissionMode: 'api',
  submissionEndpoint: 'https://your-domain.com/api/contact',
  requestTimeoutMs: 8000
};
```

2. Ensure your endpoint accepts a JSON `POST` body with this shape:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Acme",
  "service": "Analytics & dashboards",
  "message": "We need help improving attribution and reporting."
}
```

3. Return an HTTP `2xx` response for success. The front end will show a success state and reset the form.
4. Return a non-`2xx` response to trigger the error state.

## Validation behavior

Client-side validation checks:

- name is required
- email must be valid
- company is required
- service interest is required
- message must be at least 20 characters

## Testing

Run:

```bash
npm test
```

Tests cover:

- contact form validation logic
- mock submission success path
- presence of key content and responsive CSS markers

## Browser support notes

The site uses standards-based HTML, CSS, and vanilla JavaScript designed to work across current Chrome, Edge, Firefox, and Safari versions. Layouts rely on broadly supported CSS Grid/Flexbox patterns and avoid framework-specific runtime dependencies.
