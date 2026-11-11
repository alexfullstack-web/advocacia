// Página mostrada ao visitante quando a licença bloqueia o acesso.
// Texto neutro de propósito: não expõe motivo (pagamento, contrato) para quem visita o site.
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function suspendedPage({
  title = 'Site temporariamente indisponível',
  message = 'O acesso a este site está pausado no momento. Se você é o responsável por ele, entre em contato com o suporte.',
} = {}) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escape(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #f4f6f9; color: #1d2733; }
  main { max-width: 32rem; padding: 2rem; text-align: center; }
  h1 { font-size: 1.5rem; margin: 0 0 .75rem; }
  p { margin: 0; color: #4a5768; }
  @media (prefers-color-scheme: dark) { body { background: #0b1220; color: #e6ebf2; } p { color: #a9b4c3; } }
</style>
</head>
<body><main><h1>${escape(title)}</h1><p>${escape(message)}</p></main></body>
</html>`;
}

export const SUSPENDED_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'Retry-After': '300',
  'X-Robots-Tag': 'noindex',
};
