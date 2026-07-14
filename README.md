# Postman Lite

A lightweight browser-based API Testing Platform designed to run simply without heavy frameworks or databases. All data is persisted using **localStorage**.

---

## Features

### Core Request Builder
- **HTTP Methods:** GET, POST, PUT, PATCH, DELETE, QUERY
- **Query Parameters:** Dynamic key-value editor
- **Authentication:** Bearer Token, Basic Auth, API Key
- **Headers:** Custom header management
- **Request Body:** JSON, Raw Text, Form Data, x-www-form-urlencoded

### Response Viewer
- **Status Badge:** Color-coded status code display (green for 2xx, red for errors)
- **Timing & Size:** Response time in ms and payload size
- **Body Tab:** Auto-detects and pretty-prints JSON, preserves raw text
- **Headers Tab:** Scrollable key-value display of response headers
- **Loading State:** Spinner overlay with disabled send button

### Collections (Commit 5)
- Create named collections to organize requests
- Save the current request builder state (method, URL, params, headers, auth, body) into a collection
- Load any saved request back into the builder with one click
- Rename or delete collections
- Delete individual saved requests
- Expand/collapse collections in the sidebar

### Request History (Commit 5)
- Automatically records the last 20 requests sent
- Each entry shows HTTP method, URL, and relative timestamp
- Click any history item to restore the method and URL into the builder
- Clear all history with one click

### Environment Variables (Commit 5)
- Create reusable key-value variables (e.g., `BASE_URL = https://dummyjson.com`)
- Use `{{VARIABLE_NAME}}` placeholders in URL, headers, JSON body, raw text body, form data, and URL-encoded fields
- Variables are resolved at send time — missing variables keep their `{{placeholder}}` unchanged
- Manage variables through a dedicated modal

### Export Collections (Commit 5)
- One-click export of all collections as a downloadable JSON file
- Includes collection names, all saved requests, and export metadata
- Uses native browser download (Blob + anchor element) — no external libraries

---

## Technologies Used

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Storage:** Browser localStorage (no database)

---

## Project Structure

```
lite-postman/
├── backend/
│   ├── routes/
│   │   └── proxy.js          # Express proxy route
│   ├── utils/                 # Utility modules
│   ├── .env.example           # Environment template
│   ├── .gitignore
│   ├── package.json
│   └── server.js              # Express server entry point
├── frontend/
│   ├── css/
│   │   └── style.css          # All application styles
│   ├── js/
│   │   └── app.js             # All frontend logic
│   └── index.html             # Main HTML page
├── .gitignore
└── README.md
```

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd lite-postman
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

4. **Start the backend proxy server:**
   ```bash
   npm start
   ```

5. **Open the frontend:**
   Open `frontend/index.html` directly in your web browser.

---

## How to Test (Commit 5)

### Collections
1. Click **+ New** in the sidebar to create a collection (e.g., "My APIs").
2. Enter a URL like `https://jsonplaceholder.typicode.com/posts/1` and select GET.
3. Click **💾 Save** → give the request a name → select the collection → Save.
4. Click the collection name in the sidebar to expand it.
5. Click a saved request to load it back into the builder.
6. Use ✏ to rename a collection, 🗑 to delete it, or ✕ to delete a single request.

### Request History
1. Send any request using the Send button.
2. Observe the request appear in the **History** section of the sidebar.
3. Click any history item to restore its method and URL.
4. Click **Clear** to remove all history.
5. Send more than 20 requests and verify that only the 20 most recent are kept.

### Environment Variables
1. Click **⚙ Environment Variables** in the header.
2. Add a variable: Key = `BASE_URL`, Value = `https://jsonplaceholder.typicode.com`.
3. Click **Save Variables**.
4. In the URL input, type `{{BASE_URL}}/posts/1`.
5. Click **Send** — the variable is resolved and the request is sent to the full URL.

### Export Collections
1. Create at least one collection with saved requests.
2. Click **⬇ Export** in the sidebar.
3. A JSON file downloads automatically.
4. Open the file and verify it contains your collection names and saved requests.

---

## Request Flow

1. User fills in the request builder (method, URL, headers, auth, body).
2. User clicks **Send**.
3. `{{VAR}}` placeholders are replaced with environment variable values.
4. The request is validated (URL format, JSON syntax).
5. The request is added to history (capped at 20 items).
6. The frontend sends a POST to `http://localhost:5000/proxy` with the request details.
7. The Express proxy server forwards the request to the target URL.
8. The proxy returns the response (status, headers, body, time, size) as JSON.
9. The frontend renders the response in the Response Viewer.

---

## localStorage Keys

| Key                    | Structure                                                                 |
|------------------------|---------------------------------------------------------------------------|
| `collections`          | Array of `{ id, name, requests: [{ id, name, method, url, params, headers, auth, body }] }` |
| `requestHistory`       | Array of `{ id, method, url, timestamp }` (max 20)                       |
| `environmentVariables` | Array of `{ key, value }`                                                |

---

## Future Improvements

- Import collections from JSON files
- Request chaining (use response values in subsequent requests)
- WebSocket testing support
- Response body search and filtering
- Dark mode toggle
- Collection folders and sub-folders
- Request duplication within collections
