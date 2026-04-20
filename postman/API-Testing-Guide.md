# API Testing Guide

## Default Mock Endpoint

The site is configured to submit to:

`https://postman-echo.com/post`

## Test in Postman

1. Import `GrowthBridge-Contact-API.postman_collection.json`.
2. Confirm the `contact_endpoint` variable is set to your desired endpoint.
3. Send the request and inspect the echoed JSON body.
4. If you have a real backend, update both the Postman variable and `assets/js/config.js`.

## Browser Testing

1. Run a local static server.
2. Open `contact.html`.
3. Submit valid form data.
4. Verify success or fallback behavior in the status area.

## Expected JSON Fields

- `name`
- `email`
- `company`
- `businessType`
- `budget`
- `goal`
- `message`
- `consent`
- `submittedAt`
