# Lozo Proxy 🐻

CORS proxy that sits between Lozo Studio (GitHub Pages) and the ElevenLabs API.

## Why this exists
GitHub Pages serves files over HTTPS but browsers block direct API calls to
ElevenLabs from a different origin (CORS error). This proxy relays all requests
server-side where CORS doesn't apply.

---

## Deploy to Railway (Free tier — recommended)

1. Create account at https://railway.app
2. Click **New Project → Deploy from GitHub repo**
3. Push these 3 files to a new GitHub repo named `lozo-proxy`
4. Railway auto-detects Node.js and deploys
5. Go to your project → **Settings → Networking → Generate Domain**
6. Copy the domain, e.g. `https://lozo-proxy-production.up.railway.app`

---

## Deploy to Render (Alternative free tier)

1. Create account at https://render.com
2. Click **New → Web Service → Connect GitHub repo**
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Deploy → copy your `.onrender.com` URL

---

## Update LozoStudio.html

After deploying, find this line in LozoStudio.html:

```js
const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';
```

Replace with your proxy URL:

```js
const ELEVENLABS_BASE = 'https://YOUR-PROXY-URL.up.railway.app/elevenlabs';
```

That's it — all ElevenLabs calls route through the proxy automatically.

---

## How it works

```
Phone Browser → lozo-proxy/elevenlabs/voices → api.elevenlabs.io/v1/voices
                (no CORS issue)                  (server-to-server)
```

The proxy forwards your `xi-api-key` header from the browser to ElevenLabs,
so your API key stays in your browser's IndexedDB — never hardcoded in the proxy.
