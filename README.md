# GrowthBridge Website

A modern, responsive multi-page marketing website for **GrowthBridge**, a digital-first marketing and technology solutions provider focused on analytics-driven growth, measurable ROI, stronger visibility, lead generation, and scalable digital infrastructure.

## Stack

- Vite for lightweight local development and builds
- Vanilla HTML, CSS, and JavaScript for easy maintenance and expansion
- Vitest for unit testing

## Features

- Responsive homepage with hero, value proposition, services, proof/results, CTA, and company overview
- Dedicated pages for Services, Case Studies, Blog, and Contact
- Three sample blog posts and three realistic sample case studies
- SEO-friendly metadata, semantic structure, `robots.txt`, and `sitemap.xml`
- Production-ready frontend contact form pattern with validation, success/error states, and clear backend integration notes
- Clean, maintainable file structure suitable for expansion

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
.
├── blog/
│   ├── content-positioning-for-saas.html
│   ├── crm-automation-hand-off.html
│   └── marketing-roi-dashboards.html
├── src/
│   └── main.js
├── tests/
│   └── contact-form.test.js
├── blog.html
├── case-studies.html
├── contact.html
├── index.html
├── services.html
├── sitemap.xml
├── robots.txt
├── styles.css
├── vite.config.js
└── README.md
```

## Contact Form Integration

The contact form currently uses a frontend-only integration pattern.

- Validation and UI states live in `src/main.js`
- The backend/API integration point is the `FORM_ENDPOINT` constant in `src/main.js`
- Replace `https://example.com/api/contact` with your deployed endpoint
- Ensure your backend accepts `POST` JSON with the following fields:
  - `name`
  - `email`
  - `company`
  - `service`
  - `message`

Recommended backend behavior:

1. Validate and sanitize incoming fields
2. Return a `2xx` response with JSON on success
3. Return a non-2xx response on failure so the UI can show the error state
4. Add rate limiting, spam protection, and logging in production

## Customization Notes

- Update placeholder canonical URLs in the HTML files after deployment
- Replace sample case studies and blog content with live company material as needed
- Adjust colors in `styles.css` to match a final brand system
- Expand `src/main.js` if you later add analytics, CMS, or API integrations

## Engineering Notes

- Semantic headings and accessible navigation are included
- The mobile menu is JavaScript-enhanced but works with clean markup
- Tests cover validation logic and form submission behavior
- Assets are intentionally lightweight for good frontend performance
