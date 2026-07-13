const express = require('express');
const cors = require('cors');
require('dotenv').config();

const proxyRoute = require('./routes/proxy');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests from our frontend
app.use(express.json()); // Enable JSON parsing for incoming requests

// Mount Routes
app.use('/proxy', proxyRoute);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
