const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// Allow all origins (your GitHub Pages site)
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/json', limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Lozo Proxy running 🐻', version: '1.1.0' });
});

// ── Proxy all /elevenlabs/* → https://api.elevenlabs.io/v1/* ──────────────────
app.all('/elevenlabs/*', async (req, res) => {
  const path = req.params[0]; // everything after /elevenlabs/
  const targetUrl = `https://api.elevenlabs.io/v1/${path}`;

  // Forward query params
  const queryString = new URLSearchParams(req.query).toString();
  const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  // Build headers — forward xi-api-key from client
  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
  };
  if (req.headers['xi-api-key']) {
    headers['xi-api-key'] = req.headers['xi-api-key'];
  }

  try {
    const options = {
      method: req.method,
      headers,
    };

    // Attach body for POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const upstream = await fetch(fullUrl, options);

    // Pass response headers back
    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);

    // Stream binary (audio) or JSON back
    if (contentType.includes('audio') || contentType.includes('octet-stream')) {
      const buffer = await upstream.buffer();
      res.send(buffer);
    } else {
      const text = await upstream.text();
      res.send(text);
    }
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
});

// ── Proxy all /anthropic/* → https://api.anthropic.com/v1/* ──────────────────
app.all('/anthropic/*', async (req, res) => {
  const path = req.params[0]; // everything after /anthropic/
  const targetUrl = `https://api.anthropic.com/v1/${path}`;

  const queryString = new URLSearchParams(req.query).toString();
  const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY || '',
    'anthropic-version': '2023-06-01',
  };

  try {
    const options = {
      method: req.method,
      headers,
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const upstream = await fetch(fullUrl, options);
    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    const text = await upstream.text();
    res.send(text);
  } catch (err) {
    console.error('Anthropic proxy error:', err.message);
    res.status(500).json({ error: 'Anthropic proxy failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🐻 Lozo Proxy listening on port ${PORT}`);
});


