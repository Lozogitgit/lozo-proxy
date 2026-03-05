const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── ELEVENLABS ROUTES ────────────────────────────────────────────────────────

// GET /elevenlabs/voices
app.get('/elevenlabs/voices', async (req, res) => {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /elevenlabs/text-to-speech/:voiceId
app.post('/elevenlabs/text-to-speech/:voiceId', async (req, res) => {
  try {
    const { voiceId } = req.params;
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );
    const buffer = await response.buffer();
    res.status(response.status)
       .set('Content-Type', 'audio/mpeg')
       .send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /elevenlabs/sound-generation
app.post('/elevenlabs/sound-generation', async (req, res) => {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const buffer = await response.buffer();
    res.status(response.status)
       .set('Content-Type', 'audio/mpeg')
       .send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ANTHROPIC ROUTES ─────────────────────────────────────────────────────────

// POST /anthropic/messages
app.post('/anthropic/messages', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Lozo Proxy is running'));

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
