# Postman Lite

A lightweight browser-based API Testing Platform designed to run simply without heavy frameworks or databases.

## Features Completed in Commit 1
- **Project Scaffold:** Clean folder structure separating `frontend` and `backend`.
- **Backend Foundation:** Express server setup with CORS, JSON parsing, and environment variables.
- **Proxy Route:** A `/proxy` endpoint ready to forward requests, calculate response time, and measure response size.
- **Frontend Skeleton:** Basic HTML, CSS reset, and an initialized JavaScript file.
- **Note:** The UI features (request builder, tabs, collections) will be implemented in later commits.

## Technologies Used
- **Frontend:** HTML, CSS, Vanilla JavaScript.
- **Backend:** Node.js, Express.js.
- **Storage:** LocalStorage (will be integrated in future commits).

## Installation

1. Clone the repository.
2. Navigate into the backend directory:
   ```bash
   cd backend
   ```
3. Install backend dependencies:
   ```bash
   npm install
   ```
4. Create an environment file:
   Copy `.env.example` to `.env` and set the `PORT` if needed.
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

## How to Run the Backend
Navigate to the `backend/` directory and run:
```bash
npm start
```
The server will run on the port specified in your `.env` file (default 5000).

## How to Run the Frontend
Since the frontend uses basic HTML, CSS, and JS, you can simply open `frontend/index.html` directly in your web browser. Alternatively, use a tool like VS Code Live Server.

## Project Architecture
The project is split into a static frontend client and a Node/Express proxy backend. The backend proxy is strictly needed to bypass CORS restrictions that modern browsers enforce when making direct fetch requests to third-party APIs.
