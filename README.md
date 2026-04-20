# GrowthBridge Website

A simple modern marketing website for **GrowthBridge**, a digital-first marketing and technology services company serving startups, e-commerce brands, SaaS companies, and regional service businesses.

The project includes:
- Responsive homepage and supporting pages
- Working contact form with server-side validation and local file persistence
- Basic booking system with available slots, persistence, and double-booking protection
- Blog section with a lightweight file-based CMS workflow using Markdown
- Seeded blog posts aligned to GrowthBridge's audience and services
- Automated tests for validation logic and content helpers

## Tech Stack

- Node.js built-in `http` server
- HTML template rendering with simple server-side functions
- Plain CSS for styling
- JSON files for contact and booking persistence
- Markdown files for blog content and CMS workflow
- Node test runner for automated tests

## Project Structure

```text
.
├── content/
│   └── blog/
│       ├── automation-for-service-businesses.md
│       ├── fix-inconsistent-lead-generation.md
│       └── roi-dashboard-marketing.md
├── data/
│   ├── bookings.json
│   └── contacts.json
├── public/
│   └── assets/
│       └── styles.css
├── tests/
│   └── server.test.js
├── views/
│   └── layout.html
├── package.json
├── server.js
└── README.md
```

## Run Locally

### Requirements
- Node.js 18+ recommended

### Commands

```bash
npm install
npm start
```

For auto-reload during development:

```bash
npm run dev
```

The site will run at:

```text
http://localhost:3000
```

### Environment Variables

No environment variables are required.

Optional:
- `PORT` to override the default port `3000`

Example:

```bash
PORT=4000 npm start
```

## Available Pages and Routes

### Site Pages
- `/` - Homepage
- `/services` - Service overview
- `/about` - Company overview
- `/contact` - Contact form
- `/booking` - Booking system
- `/blog` - Blog index
- `/blog/:slug` - Individual blog post page
- `/admin/blog` - Simple CMS form to create blog posts locally

### Data / Utility Endpoints
- `/api/slots` - JSON list of booking slots and availability
- `/api/contacts` - Stored contact submissions
- `/api/bookings` - Stored booking submissions

## Contact Form

The contact form submits to `POST /contact` and is implemented entirely in project-native code.

Behavior:
- Validates name, email, company, business type, and message length
- Stores submissions in `data/contacts.json`
- Returns clear success and error states in the UI

## Booking System

The booking system is available at `/booking`.

Behavior:
- Displays predefined available strategy call slots
- Accepts booking requests using `POST /booking`
- Stores bookings in `data/bookings.json`
- Prevents double-booking by rejecting requests for an already reserved slot
- Exposes availability via `/api/slots`

## Blog and Basic CMS Workflow

The blog is powered by Markdown files in `content/blog`.

Each post uses front matter:

```md
---
title: Example Post
slug: example-post
date: 2026-04-20
excerpt: Short summary for listings.
tags: analytics, growth
---

# Example Post

Write your content in Markdown.
```

### Add or Edit Content

You have two simple options:

1. **Direct file editing**
   - Create or edit `.md` files inside `content/blog/`
   - Update the front matter fields
   - Restart the server if needed

2. **Local admin form**
   - Visit `/admin/blog`
   - Submit a new post
   - The app will create a new Markdown file in `content/blog/`

This is a lightweight local CMS workflow intended for easy handoff and content management without external services.

## Testing

Run tests with:

```bash
npm test
```

The automated tests cover:
- Contact validation
- Booking validation
- Post validation
- Slot generation
- Slug creation
- Markdown/front matter parsing helpers

## Manual Verification Checklist

After starting the app locally:

1. Open `/` and verify the responsive homepage sections render correctly.
2. Open `/services` and `/about` to verify supporting content.
3. Submit the contact form at `/contact` and confirm the entry is saved in `data/contacts.json`.
4. Open `/booking`, reserve a slot, and verify it appears in `data/bookings.json`.
5. Try booking the same slot again and confirm the app blocks double-booking.
6. Open `/blog` and verify the seeded posts are listed.
7. Open an individual post route such as `/blog/fix-inconsistent-lead-generation`.
8. Visit `/admin/blog`, create a post, and verify a new Markdown file appears in `content/blog/`.
9. Run `npm test` and confirm all tests pass.

## Handoff Notes

- All persistence is local-file based for simplicity and portability.
- The project is intentionally lightweight and easy to understand.
- If GrowthBridge later wants production hosting, this codebase can be extended with authentication, database storage, and deployment configuration.
