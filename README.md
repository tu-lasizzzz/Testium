# Postman Lite

A lightweight browser-based API Testing Platform designed to run simply without heavy frameworks or databases.

## Features Completed in Commit 3
- **Headers Management:** Dynamic key-value UI for creating request headers. Empty fields are safely ignored.
- **Request Body Editor:** Support for `JSON` (with pre-flight validation), `Raw Text`, `Form Data`, and `x-www-form-urlencoded`. The interface dynamically switches to show the appropriate editor based on selection.
- **Authentication:** Dedicated Auth tab to easily configure `Bearer Token`, `Basic Auth`, or `API Key`. Auth headers are automatically generated and injected into the request.

*(Previously completed)*
- **HTTP Request Builder:** Construct requests with method and URL, manage query params, validation.
- **Project Scaffold:** Express proxy server to bypass CORS.

## Technologies Used
- **Frontend:** HTML, CSS, Vanilla JavaScript.
- **Backend:** Node.js, Express.js.

## Installation & Setup

1. Clone the repository.
2. Navigate into the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Set up environment:
   ```bash
   cp .env.example .env
   ```

## How to Test Commit 3

1. **Start the backend proxy server:**
   ```bash
   cd backend
   npm start
   ```

2. **Open the frontend client:**
   Open `frontend/index.html` directly in your web browser.

3. **Test the New Features:**
   - **Headers:** Go to the *Headers* tab, click "Add Header", and add `Accept` = `application/json`.
   - **Authentication:** Go to the *Auth* tab, select "Bearer Token", and enter a token.
   - **Body:** Change Method to `POST`. Go to the *Body* tab. Select `JSON`, type `{"test": 123}`, and try to break the JSON syntax (it will block the request). Change to `Form Data` and add some fields.
   - Press **Send**.
   - **Open your browser's Developer Tools (Console)** to see the resulting URL, Headers (including the merged Auth), and payload being processed through the proxy!

*(Note: Response Viewer UI is planned for the next commit).*
