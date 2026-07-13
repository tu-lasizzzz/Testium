const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { method, url, headers, body, bodyType } = req.body;

  // 1. Validate Input
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'QUERY'];
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

    // 3. Attach body if the HTTP method allows it
    if (!['GET', 'HEAD'].includes(requestMethod) && body) {
      if (bodyType === 'form-data' && typeof body === 'object') {
        const formData = new FormData();
        for (const key in body) {
          formData.append(key, body[key]);
        }
        fetchOptions.body = formData;
        
        // Remove Content-Type header if user provided it, let fetch set boundary automatically
        const cTypeKey = Object.keys(fetchOptions.headers).find(k => k.toLowerCase() === 'content-type');
        if (cTypeKey && fetchOptions.headers[cTypeKey].includes('multipart/form-data')) {
            delete fetchOptions.headers[cTypeKey];
        }
      } else {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
    }

    // 4. Forward the request
    const response = await fetch(url, fetchOptions);
    
    // 5. Calculate request time
    const endTime = Date.now();
    const time = `${endTime - startTime} ms`;

    // 6. Calculate response size
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

    // Parse response body
    const textDecoder = new TextDecoder('utf-8');
    const responseText = textDecoder.decode(responseBuffer);
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch (e) {
      responseBody = responseText;
    }

    // Extract headers
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 7. Return standard format
    res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: time,
      size: size
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    });
  }
});

module.exports = router;
