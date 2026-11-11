// Controle de licença do Alex Sousa Tech Gestão (hospedagem externa na Vercel).
// Roda no servidor da Vercel antes de cada PÁGINA; arquivos estáticos (CSS, JS, imagens) passam direto.
// Variáveis em Settings → Environment Variables (Production), SEM prefixo VITE_ / NEXT_PUBLIC_:
//   AST_LICENSE_API_URL, AST_INSTALLATION_KEY, AST_LICENSE_SECRET
// Regra: só uma resposta do Gestão dizendo "bloqueado" tira o site do ar. Se a API do Gestão
// cair ou demorar, o site continua no ar com a última situação conhecida.
import { next } from '@vercel/functions';
import { createLicenseAgent } from './license-agent/license-agent.mjs';
import { SUSPENDED_HEADERS, suspendedPage } from './license-agent/suspended-page.mjs';

const agent = createLicenseAgent({
  apiUrl: process.env.AST_LICENSE_API_URL,
  installationKey: process.env.AST_INSTALLATION_KEY,
  secret: process.env.AST_LICENSE_SECRET,
  hostname: 'valencamoraes.adv.br',
});

export const config = {
  matcher: ['/((?!assets/|css/|js/|favicon|robots\\.txt|sitemap\\.xml|.*\\.(?:js|css|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|map|txt|xml)$).*)'],
};

export default async function middleware() {
  let d;
  try {
    d = await agent.check();
  } catch {
    return next(); // erro no agente nunca derruba o site
  }
  if (d.allowed) return next();
  return new Response(suspendedPage(), { status: 503, headers: SUSPENDED_HEADERS });
}
