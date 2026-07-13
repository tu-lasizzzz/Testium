# Postman Lite

A lightweight browser-based API Testing Platform designed to run simply without heavy frameworks or databases.

## Features Completed in Commit 4
- **Response Viewer UI:** A dedicated section displaying status code, response time, and payload size using easy-to-read badges.
- **Response Body Tab:** Automatically detects JSON payloads and pretty-prints them. Plain text formatting and line breaks are fully preserved. Handles empty responses gracefully.
- **Response Headers Tab:** Displays a scrollable, clean key-value layout of all headers returned by the target server.
- **Loading State:** Introduces a non-blocking UI spinner overlay and disables the send button while processing to prevent duplicate submissions.
- **Error Handling:** Network errors, timeouts, invalid domains, and empty responses are now elegantly displayed in the Response Viewer UI instead of raw JavaScript logs.

*(Previously completed)*
- **Headers & Body Config:** Full support for `JSON`, `Raw Text`, `Form Data`, and `x-www-form-urlencoded`.
- **Authentication:** `Bearer Token`, `Basic Auth`, and `API Key` generation.
- **HTTP Request Builder:** Dynamic query params, method selection, input validation.
- **Project Scaffold:** Express proxy server.

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

## How to Test Commit 4

1. **Start the backend proxy server:**
   ```bash
   cd backend
   npm start
   ```

2. **Open the frontend client:**
   Open `frontend/index.html` directly in your web browser.

3. **Test Request Execution:**
   - Run a `GET` request to `https://jsonplaceholder.typicode.com/posts/1`.
   - Observe the loading spinner overlay appear.
   - Wait for the **Response Viewer** to render. You will see a `200 OK` green badge, the time, and size. 
   - View the **Body Tab**: The JSON data is beautifully formatted with syntax structure.
   - View the **Headers Tab**: Scroll through the mapped server headers cleanly.
   - Break the URL (e.g., `https://this-site-is-offline-999.com`) and hit send to observe the clean Error UI state mappings!

*(Note: Collections, environment variables, and request history are planned for future commits).*
