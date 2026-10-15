# Prompt Fixer — Vibe Coding MVP

A small, dependency-free Node.js web app that turns rough coding requests into structured prompts. It supports Build, Debug, and Improve workflows and lets users choose a coding tool.

## Run locally

Requires Node.js 18+.

```bash
node server.js
```

Open http://localhost:3000.

Without an API key, the interface works in local preview mode and builds a structured prompt from a template. To enable AI-powered rewriting, set an OpenAI API key on the server:

**macOS/Linux**
```bash
export OPENAI_API_KEY="your-key"
node server.js
```

**Windows PowerShell**
```powershell
$env:OPENAI_API_KEY="your-key"
node server.js
```

Optional: set `OPENAI_MODEL` to another model available to your account. Default: `gpt-4.1-mini`.

## Deploy

Deploy this folder to a Node.js host that supports environment variables. Set `OPENAI_API_KEY` in the host's secret/environment settings; never put it in frontend code or commit it to source control. The server uses Node's built-in HTTP server and `fetch`, so no npm dependencies are required.

## MVP scope

- Build / Debug / Improve modes
- Tool selection: Lovable, Bolt.new, Cursor, Replit, Claude Code, other
- Concise, balanced, and detailed outputs
- Copy-to-clipboard
- Local template fallback when no API key is configured
- Server-side AI API call when configured

## Before taking payments or handling real customer data

Add privacy disclosures, rate limiting, abuse protection, usage limits, analytics with consent where required, robust error monitoring, and a privacy policy. Test output quality with target users before adding paid features. This MVP does not include user accounts, billing, saved history, or autonomous customer acquisition.
