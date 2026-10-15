const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC = __dirname;
const MAX_BODY = 100_000;

function send(res, status, data, type='application/json; charset=utf-8') {
  res.writeHead(status, {'Content-Type': type, 'X-Content-Type-Options':'nosniff'});
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/fix') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > MAX_BODY) req.destroy(); });
    req.on('end', async () => {
      try {
        const input = JSON.parse(body);
        const prompt = String(input.prompt || '').trim();
        const tool = String(input.tool || 'coding agent').slice(0,100);
        const mode = String(input.mode || 'feature');
        const detail = String(input.detail || 'balanced');
        if (!prompt) return send(res, 400, {error:'Please enter a prompt.'});
        if (!process.env.OPENAI_API_KEY) return send(res, 503, {error:'AI key not configured.'});
        const task = ({feature:'build a new feature',bug:'debug and fix an error',improve:'improve an existing app'})[mode] || 'complete a coding task';
        const length = detail === 'concise' ? 'Keep it concise.' : detail === 'detailed' ? 'Be detailed and include explicit acceptance criteria and testing steps.' : 'Make it clear and actionable without unnecessary length.';
        const instructions = `You are Prompt Fixer, a specialist prompt engineer for beginner vibe coders. Rewrite the user's rough request into a ready-to-paste prompt for ${tool}. Task type: ${task}. Preserve the user's intent and do not invent product requirements. Structure the result with objective, context/assumptions if needed, implementation or debugging steps, constraints, and testable success criteria. Tell the coding tool to inspect relevant existing code first, make minimal targeted changes, preserve unrelated functionality, and report tests honestly. For debugging, do not invent a root cause; ask for missing error logs/code when essential. ${length} Output only the finished prompt, with clear headings.`;
        const response = await fetch('https://api.openai.com/v1/responses', {
          method:'POST',
          headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
          body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini',instructions,input:prompt})
        });
        const data = await response.json();
        if (!response.ok) {
          console.error('OpenAI API error:', response.status, JSON.stringify(data).slice(0,1000));
          return send(res, 502, {error:'The AI service could not complete this request. Check server configuration and try again.'});
        }
        const output = (data.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('\n').trim();
        if (!output) return send(res, 502, {error:'The AI service returned an empty result.'});
        send(res, 200, {prompt:output, note:'AI-powered prompt generated.'});
      } catch (e) {
        console.error('Request error:', e.message);
        send(res, 500, {error:'Unable to process this request.'});
      }
    });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, {error:'Method not allowed'});
  const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  const target = pathname === '/' ? path.join(PUBLIC, 'index.html') : path.join(PUBLIC, pathname.replace(/^\/+/, ''));
  if (!target.startsWith(PUBLIC)) return send(res, 403, {error:'Forbidden'});
  fs.readFile(target, (err, content) => {
    if (err) return send(res, 404, {error:'Not found'});
    const ext = path.extname(target);
    const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
    send(res, 200, content, types[ext] || 'application/octet-stream');
  });
});
server.listen(PORT, () => console.log(`Prompt Fixer running at http://localhost:${PORT}`));
