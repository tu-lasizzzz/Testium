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

### Collections & Folders
- Create named collections to organize requests
- Create folders and sub-folders inside collections (up to 2 levels of nesting)
- Save the current request builder state into any collection or folder
- Load any saved request back into the builder with one click
- Rename or delete collections and folders
- Delete individual saved requests
- Expand/collapse collections and folders in the sidebar

### Request Duplication
- Duplicate any saved request with one click (📋 button)
- Automatically named "Copy of [original name]"
- The duplicate is independent — edit it without affecting the original

### Request History
- Automatically records the last 20 requests sent
- Each entry shows HTTP method, URL, and relative timestamp
- Click any history item to restore the method and URL into the builder
- Clear all history with one click

### Environment Variables
- Create reusable key-value variables (e.g., `BASE_URL = https://dummyjson.com`)
- Use `{{VARIABLE_NAME}}` placeholders in URL, headers, JSON body, raw text body, form data, and URL-encoded fields
- Variables are resolved at send time — missing variables keep their `{{placeholder}}` unchanged

### Request Chaining
- After each successful response, the JSON body is stored in memory
- Use `{{response.path.to.value}}` to reference values from the last response in your next request
- Supports nested properties via dot notation (e.g., `{{response.user.id}}`)
- The **Response Variables** panel shows all available paths and values
- Click any variable to copy the placeholder to your clipboard

### Response Search & Filtering
- Search bar above the response body lets you search for any text
- Matching results are highlighted with a yellow `<mark>`
- A match count badge shows how many results were found
- Works for both JSON and plain text responses

### WebSocket Testing
- Enter a WebSocket URL (`ws://` or `wss://`) and connect
- Send and receive messages in real-time
- Messages are displayed with timestamps and direction indicators (▲ sent, ▼ received)
- Connection status indicator (Connected / Disconnected / Error)
- Handles connection errors and unexpected disconnects gracefully

### Dark Mode
- Toggle between Light and Dark themes with one click
- Theme preference is saved to localStorage and applied automatically on page load
- All UI components remain fully readable in both modes

### Export Collections
- One-click export of all collections as a downloadable JSON file
- Includes collection names, folders, all saved requests, and export metadata

---

## Technologies Used

- **Frontend:** HTML, CSS (with CSS Custom Properties), Vanilla JavaScript
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
│   │   └── style.css          # All styles (light + dark themes via CSS variables)
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

## Request Flow

```
User fills builder → Clicks "Send"
       ↓
replaceVariables() resolves {{VAR}} and {{response.*}} placeholders
       ↓
Validation (URL format, JSON syntax)
       ↓
addHistoryItem() saves method + URL to localStorage
       ↓
Frontend POSTs to http://localhost:5000/proxy
       ↓
Express proxy forwards request to target URL
       ↓
Proxy returns {status, statusText, headers, body, time, size}
       ↓
renderResponseUI() displays results + stores response for chaining
```

---

## localStorage Keys

| Key                    | Structure |
|------------------------|-----------|
| `collections`          | Array of `{ id, name, requests: [...], folders: [{ id, name, requests, folders }] }` |
| `requestHistory`       | Array of `{ id, method, url, timestamp }` (max 20) |
| `environmentVariables` | Array of `{ key, value }` |
| `theme`                | `"light"` or `"dark"` |

---

## Testing Guide

### Request Chaining
1. Send GET to `https://jsonplaceholder.typicode.com/posts/1`.
2. See the **Response Variables** panel show available paths.
3. Click `{{response.userId}}` to copy it.
4. In the URL, type `https://jsonplaceholder.typicode.com/users/{{response.userId}}`.
5. Send — it resolves to `/users/1` and returns the user data.

### WebSocket Testing
1. Enter `wss://echo.websocket.events` and click **Connect**.
2. Observe the status change to **Connected**.
3. Type a message and click **Send** — see it echoed back.
4. Click **Disconnect** — observe graceful disconnect.

### Response Search
1. Send any request that returns JSON.
2. Type a keyword in the search bar above the response body.
3. Verify matches are highlighted in yellow with a count badge.

### Dark Mode
1. Click **🌙 Dark Mode** in the header.
2. Verify all UI elements switch to dark theme.
3. Refresh the page — verify the theme persists.

### Collection Folders
1. Create a collection → click 📁+ to add a folder.
2. Expand the folder → click 📁+ inside to add a sub-folder.
3. Save a request into a folder using the folder dropdown in the save modal.

### Request Duplication
1. Save a request to a collection.
2. Hover over it → click 📋 (duplicate).
3. Verify "Copy of [name]" appears below the original.

---

## Future Improvements

- Import collections from JSON files
- Drag-and-drop to reorder requests and move between folders
- Multiple environment profiles (dev, staging, production)
- Response body diff comparison
- Keyboard shortcuts for common actions
- Request pre-scripts and test scripts
- GraphQL query support
