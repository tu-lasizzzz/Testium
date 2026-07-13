const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { method, url, headers, body } = req.body;

  // 1. Validate Input
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
  const requestMethod = method ? method.toUpperCase() : 'GET';

  if (!validMethods.includes(requestMethod)) {
    return res.status(400).json({ error: `Unsupported method: ${requestMethod}` });
  }

  try {
    const startTime = Date.now();

    // 2. Prepare fetch options
    const fetchOptions = {
      method: requestMethod,
      headers: headers || {},
    };

    // Only attach body if the HTTP method allows it
    if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // 3. Forward the request (using native fetch available in Node.js 18+)
    const response = await fetch(url, fetchOptions);
    
    // 4. Calculate request time
    const endTime = Date.now();
    const time = `${endTime - startTime} ms`;

    // 5. Calculate response size
    const responseBuffer = await response.arrayBuffer();
    const sizeInBytes = responseBuffer.byteLength;
    
    let size;
    if (sizeInBytes < 1024) {
      size = `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      size = `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      size = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    // Parse response body (try JSON first, fallback to plain text)
    const textDecoder = new TextDecoder('utf-8');
    const responseText = textDecoder.decode(responseBuffer);
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch (e) {
      responseBody = responseText; // If it's not valid JSON, return as string
    }

    // Extract headers
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 6. Return standard format
    res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: time,
      size: size
    });

  } catch (error) {
    // Handle invalid URLs, network failures, timeouts, etc.
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    });
  }
});

module.exports = router;
