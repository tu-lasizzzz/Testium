# Postman Lite

A lightweight browser-based API Testing Platform designed to run simply without heavy frameworks or databases.

## Features Completed in Commit 2
- **HTTP Request Builder:** Built the main UI for constructing API requests.
- **Request Bar:** Clean interface to select HTTP methods (GET, POST, PUT, PATCH, DELETE, QUERY), enter the destination URL, and hit Send.
- **Dynamic Query Parameters:** A functional "Params" tab allows adding, removing, and managing query parameters. These are automatically encoded and serialized into the request URL.
- **Request Validation:** Basic frontend validation prevents sending requests with empty or badly formatted URLs.
- **Backend Integration:** The Send button constructs the full URL and payload and successfully dispatches a request to the `/proxy` backend endpoint. Responses are currently logged directly to the browser console.

*(Previously completed in Commit 1)*
- **Project Scaffold:** Clean folder structure separating `frontend` and `backend`.
- **Backend Foundation:** Express proxy server to bypass CORS.

## Technologies Used
- **Frontend:** HTML, CSS, Vanilla JavaScript.
- **Backend:** Node.js, Express.js.
- **Storage:** LocalStorage (will be integrated in future commits).

## Installation & Setup

1. Clone the repository.
2. Navigate into the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create an environment file:
   ```bash
   cp .env.example .env
   ```

## Folder Structure

```text
postman-lite/
│
├── backend/
│   ├── routes/
│   │   └── proxy.js
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
│
├── README.md
└── .gitignore
```

## How to Test Commit 2

1. **Start the backend proxy server:**
   ```bash
   cd backend
   npm start
   ```
   (Ensure it's running on port 5000)

2. **Open the frontend client:**
   Open `frontend/index.html` directly in your web browser.

3. **Test the Request Builder:**
   - Select a method from the dropdown (e.g., `GET`).
   - Enter a base URL (e.g., `https://dummyjson.com/products`).
   - Open the **Params** tab and click **Add Parameter**.
   - Input some parameters (e.g., Key: `limit`, Value: `10` | Key: `skip`, Value: `20`).
   - Press **Send**.
   - **Open your browser's Developer Tools (Console)** to see the resulting URL and the formatted response payload returning from the proxy server.
   
*(Note: Response Viewer UI, Headers, and Body tabs are placeholders and planned for the next commits).*
