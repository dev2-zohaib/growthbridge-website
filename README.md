# GrowthBridge Website

A responsive multi-page marketing website for **GrowthBridge Marketing & Technology Solutions** built with plain HTML, CSS, and JavaScript.

## Features

- Multi-page responsive site: Home, About, Services, Case Studies, Blog, Contact
- Reusable header/footer injected with JavaScript
- JSON-driven blog listing and article rendering
- Accessible markup with semantic HTML, labels, skip link, and clear navigation states
- SEO basics: page titles, descriptions, Open Graph, Twitter metadata, and alt-friendly imagery
- Configurable front-end contact form endpoint with validation and graceful error handling
- Postman collection for testing the contact submission flow
- Lightweight front-end unit tests for validation and blog rendering helpers

## Project Structure

```text
.
├── about.html
├── assets
│   ├── css
│   │   └── styles.css
│   ├── images
│   │   └── og-growthbridge.svg
│   └── js
│       ├── blog.js
│       ├── config.js
│       ├── contact.js
│       └── site.js
├── blog-post.html
├── blog.html
├── case-studies.html
├── contact.html
├── data
│   └── blog-posts.json
├── index.html
├── package.json
├── postman
│   ├── GrowthBridge-Contact-API.postman_collection.json
│   └── API-Testing-Guide.md
├── services.html
└── tests
    ├── blog.test.js
    ├── contact.test.js
    └── run-tests.js
```

## Run Locally

Because the blog uses `fetch()` to load a JSON file, run the site from a local server rather than opening HTML files directly.

### Option 1: Python

```bash
python3 -m http.server 8080
```

Open: `http://localhost:8080`

### Option 2: Node static server

```bash
npx serve .
```

## Contact Form Configuration

Update the endpoint in `assets/js/config.js`:

```js
window.GROWTHBRIDGE_CONFIG = {
  contactEndpoint: 'https://postman-echo.com/post',
  blogDataPath: 'data/blog-posts.json',
  companyName: 'GrowthBridge Marketing & Technology Solutions'
};
```

### Expected Request Shape

The contact form sends a JSON `POST` body with:

- `name`
- `email`
- `company`
- `businessType`
- `budget`
- `goal`
- `message`
- `consent`
- `submittedAt`

If the endpoint is unavailable, the UI shows a helpful fallback message explaining how to test with the included Postman collection.

## Blog Content Management

Edit `data/blog-posts.json` to add or update posts.

Each post object includes:

- `slug`
- `title`
- `excerpt`
- `date`
- `readingTime`
- `category`
- `intro`
- `sections[]`

The listing page (`blog.html`) and article template (`blog-post.html`) automatically render from this file.

## Testing

Run the lightweight test suite with:

```bash
node tests/run-tests.js
```

The tests cover:

- Contact form validation rules
- Basic rendering expectations for blog data

## Postman Testing

See:

- `postman/GrowthBridge-Contact-API.postman_collection.json`
- `postman/API-Testing-Guide.md`

## Future Integration Notes

This project is intentionally front-end first and backend-ready. The contact form endpoint is configurable so the site can be connected to:

- a CRM webhook
- a custom API
- a serverless function
- a mock service for QA and demos
