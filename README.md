# Testium

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
- **Status Badge:** Color-coded by status class (2xx green, 3xx blue, 4xx amber, 5xx red)
- **Timing & Size:** Response time in ms and payload size
- **Pretty Tab:** Auto-detects and pretty-prints JSON
- **Headers Tab:** Key-value display of response headers
- **Copy Response:** One-click copy to clipboard
- **Search & Highlight:** Find text in response body with match count

### Collections & Folders
- Create named collections to organize requests
- Create folders and sub-folders (up to 2 levels)
- Save the current request builder state into any collection or folder
- Load saved requests with one click
- Rename or delete collections and folders
- Request duplication with 📋 button

### Request History
- Automatically records the last 20 requests
- Each entry shows HTTP method, URL, and relative timestamp
- Click any history item to restore into the builder
- Clear all history with one click

### Environment Variables
- Create reusable key-value variables
- Use `{{VARIABLE_NAME}}` placeholders in URL, headers, and body
- Variables resolved at send time

### Request Chaining
- JSON response stored in memory after each request
- Use `{{response.path.to.value}}` in the next request
- Response Variables panel shows all available paths
- Click to copy placeholder to clipboard

### WebSocket Testing
- Enter WebSocket URL and connect/disconnect
- Send and receive messages in real-time
- Timestamped message log with direction indicators

### Dark Mode
- Toggle between Light and Dark themes
- Theme preference persisted in localStorage
- Professional neutral dark tones (not pure black)

### Quick Start Guide & Beginner Workflow
- Built-in Quick Start Guide accessible via Help button.
- Clean, beginner-friendly explanations of HTTP methods, headers, authentication, and variables.
- "Welcome Card" for first-time users guiding them to resources.
- Easy to close and reopen, keeping UI clean.

### Free APIs Hub
- Built-in hub of recommended public APIs for beginners to practice testing.
- Click "Use Example" to automatically populate the request builder without sending.
- Includes [FreeAPI](https://freeapi.app/) as a highly recommended resource for practicing with public APIs (Mock data for users, products, weather, auth, etc.).
- Includes other great free APIs like DummyJSON, JSONPlaceholder, ReqRes, and PokéAPI.
- "Beginner Tips" section helps new developers learn best practices.

### Quick Examples
- Pre-built example chips (GET /products, GET /users/1, POST /products/add, DELETE /products/1)
- Click to auto-populate the request builder
- POST examples also set JSON body and switch to Body tab

### Toast Notifications
- Lightweight toast messages for all actions
- Types: success (✓), error (✕), info (ℹ), warning (⚠)
- Auto-dismiss after 3 seconds with slide animation
- Replaces all `alert()` dialogs

### Export Collections
- One-click export as downloadable JSON file

---

## Design

- **Typography:** Inter (Google Fonts)
- **Icons:** Lucide icon font
- **Color Palette:** #2563EB primary, #16A34A success, #F59E0B warning, #DC2626 error
- **Dark Mode:** Slate-based neutral dark (#0F172A → #1E293B → #334155)
- **Animations:** Subtle fade-in, slide-in for panels, toast slide transitions
- **Layout:** Fixed header + sidebar + main workspace + optional manual panel

---

## Technologies

- **Frontend:** HTML, CSS (Custom Properties + Inter font), Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Storage:** Browser localStorage (no database)
- **Icons:** Lucide (CDN)

---

## Project Structure

```
testium/
├── backend/
│   ├── routes/
│   │   └── proxy.js
│   ├── utils/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── .gitignore
└── README.md
```

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd testium
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
   Open `frontend/index.html` in your browser.

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send Message (WebSocket) | Enter |
| Close Modal | Click outside |

---

## Request Flow

```
User fills builder → Clicks "Send"
       ↓
replaceVariables() resolves {{VAR}} and {{response.*}}
       ↓
Validation (URL format, JSON syntax)
       ↓
addHistoryItem() saves to localStorage
       ↓
Frontend POSTs to http://localhost:5000/proxy
       ↓
Express proxy forwards to target URL
       ↓
Proxy returns {status, statusText, headers, body, time, size}
       ↓
renderResponseUI() displays results + toast notification
       ↓
lastResponseData stored for chaining
```

---

## localStorage Keys

| Key | Structure |
|-----|-----------|
| `collections` | `[{ id, name, requests: [...], folders: [{ id, name, requests, folders }] }]` |
| `requestHistory` | `[{ id, method, url, timestamp }]` (max 20) |
| `environmentVariables` | `[{ key, value }]` |
| `theme` | `"light"` or `"dark"` |
| `manualDismissed` | `true` or `false` |

---

## Testing Guide

### Quick Examples
1. Click any example chip below the URL bar (e.g., "GET /products").
2. Verify the method and URL populate automatically.
3. For POST examples, verify the JSON body is set and the Body tab is active.
4. Click Send to execute.

### Toast Notifications
1. Save a request → verify "Request saved" toast appears.
2. Export collections → verify "Collections exported" toast.
3. Save env vars → verify "Environment variables saved" toast.
4. All toasts auto-dismiss after 3 seconds.

### Manual Panel
1. Click "Manual" in the header → verify side panel opens.
2. Verify the 7-step getting started guide is visible.
3. Click ✕ to close → verify panel closes.
4. Click "View Manual" in the sidebar → verify panel reopens.

### Dark Mode
1. Click the dark mode button in the header.
2. Verify the icon changes from moon to sun.
3. Verify all UI elements are readable.
4. Refresh → verify theme persists.

### Copy Response
1. Send any request.
2. Click "Copy" button in the response header bar.
3. Paste in a text editor → verify the full response body is copied.

### Response Search
1. Send a request that returns JSON.
2. Click "Search" in the response header bar.
3. Type a keyword → verify highlights and match count appear.
4. Click ✕ to clear.

---

## Future Improvements

- Import collections from JSON files
- Drag-and-drop to reorder requests
- Multiple environment profiles
- Response body diff comparison
- Keyboard shortcuts for common actions
- GraphQL query support
