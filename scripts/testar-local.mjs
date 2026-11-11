// Teste local do controle de licença, sem a Vercel: serve a pasta public/ e passa cada página
// pelo MESMO middleware.js que roda na Vercel. Uso:
//   1. Copie .env.example para .env e preencha as 3 variáveis (a API do Gestão pode ser local).
//   2. npm install && npm run testar
//   3. Abra http://localhost:3000. Suspenda/reative a licença no Gestão e recarregue a página
//      (a suspensão chega em até 5 minutos, a reativação em até 1 minuto, por causa do cache).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import middleware, { config } from '../middleware.js';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
// Mesmo filtro do config.matcher (o padrão também é uma expressão regular válida).
const matcher = new RegExp(`^${config.matcher[0]}$`);

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (matcher.test(url.pathname)) {
    const out = await middleware(new Request(url));
    if (!out.headers.get('x-middleware-next')) {
      res.writeHead(out.status, Object.fromEntries(out.headers));
      res.end(await out.text());
      console.log(`${url.pathname} → ${out.status} (bloqueado pela licença)`);
      return;
    }
  }
  const path = normalize(join(root, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
  if (!path.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('Não encontrado');
  }
}).listen(port, () => console.log(`Site em http://localhost:${port} (licença: ${process.env.AST_INSTALLATION_KEY || 'NÃO CONFIGURADA'})`));
