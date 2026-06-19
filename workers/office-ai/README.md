# Office AI Worker

This Worker is the intended Cloudflare Workers AI endpoint for the office chat.

Route:
`POST /api/office-chat`

Required binding:
`AI`

Local development after Cloudflare setup:

```bash
cd workers/office-ai
npx wrangler dev
```

Deploy:

```bash
cd workers/office-ai
npx wrangler deploy
```

After deployment, set the frontend variable:

```bash
VITE_OFFICE_AI_ENDPOINT=https://your-worker.example.workers.dev/api/office-chat
```

The frontend will use a local fallback when this endpoint is unavailable, so UI work can continue without Cloudflare credentials.
