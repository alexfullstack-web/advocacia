// Agente de licença — Alex Sousa Tech Gestão (contrato v1).
// Roda NO SERVIDOR do projeto do cliente (backend Node ou middleware da Vercel). Nunca no
// navegador: a chave de integração é secreta.
//
// Política (docs/LICENCIAMENTO.md):
// 1. Resposta do Gestão é guardada pelo tempo que ele indicar (cacheTtlSeconds).
// 2. Só uma resposta autenticada do Gestão dizendo "allowed: false" bloqueia o acesso.
// 3. Falha de rede, tempo esgotado, erro 5xx, 429 ou credencial recusada NUNCA bloqueiam:
//    vale a última decisão conhecida. Sem nenhuma decisão conhecida, o acesso fica liberado.
// 4. Passado o prazo de tolerância sem falar com o Gestão (offlineToleranceHours), a última
//    decisão continua valendo, marcada como "stale", com aviso no log a cada nova tentativa.
// 5. Depois de uma falha, nova tentativa só depois de alguns segundos (não martela a API).
// Sem dependências: usa fetch e AbortController (Node 18+ e runtimes da Vercel).

export const AGENT_VERSION = '1.0.0';

const memoryStore = () => {
  let state = null;
  return { get: async () => state, set: async (s) => { state = s; } };
};

export function createLicenseAgent({
  apiUrl,
  installationKey,
  secret,
  fetch: fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  timeoutMs = 4000,
  retryAfterErrorMs = 30_000,
  store = memoryStore(),
  logger = console,
  hostname,
  maxCacheSeconds, // opcional: encurta o cache indicado pelo Gestão (nunca aumenta)
} = {}) {
  const configured = Boolean(apiUrl && installationKey && secret);
  if (!configured) {
    logger.error?.('[licença] Agente sem configuração (URL, instalação ou chave). O acesso fica LIBERADO até configurar.');
  }
  const endpoint = configured ? `${String(apiUrl).replace(/\/+$/, '')}/licensing/check` : null;
  let inflight = null;

  const decision = (result, source, extra = {}) => ({
    allowed: result.allowed === true,
    status: result.status,
    reason: result.reason ?? null,
    checkedAt: result.checkedAt ?? null,
    source,
    stale: false,
    ...extra,
  });

  function offline(state, why) {
    if (!state?.result) {
      return { allowed: true, status: 'UNKNOWN', reason: null, checkedAt: null, source: 'offline-unknown', stale: true, error: why };
    }
    const toleranceMs = (state.result.offlineToleranceHours ?? 72) * 3600 * 1000;
    const age = now() - state.fetchedAt;
    const stale = age > toleranceMs;
    if (stale) {
      logger.warn?.(`[licença] Sem confirmação do Gestão há ${Math.round(age / 3600000)} h (${why}). Mantendo a última situação: ${state.result.status}.`);
    }
    return decision(state.result, stale ? 'offline-stale' : 'offline-cache', { stale, error: why });
  }

  async function fetchLicense(state) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'X-Installation-Key': installationKey,
          'Content-Type': 'application/json',
          'User-Agent': `ast-license-agent/${AGENT_VERSION}`,
        },
        body: JSON.stringify({ agentVersion: AGENT_VERSION, ...(hostname && { hostname }) }),
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!res.ok) {
        if (res.status === 401) logger.error?.('[licença] O Gestão recusou a credencial. Confira a chave de integração desta instalação.');
        throw new Error(`HTTP ${res.status}`);
      }
      const body = await res.json();
      if (body?.version !== 1 || typeof body.allowed !== 'boolean' || !body.status) throw new Error('resposta fora do contrato v1');
      const next = { result: body, fetchedAt: now(), lastErrorAt: null };
      await store.set(next);
      if (!body.allowed) logger.warn?.(`[licença] Acesso bloqueado pelo Gestão: ${body.status}${body.reason ? ` (${body.reason})` : ''}.`);
      return decision(body, 'live');
    } catch (err) {
      const why = err?.name === 'AbortError' ? 'tempo esgotado' : err?.message || 'falha de rede';
      await store.set({ ...(state ?? {}), lastErrorAt: now() });
      return offline(state, why);
    } finally {
      clearTimeout(timer);
    }
  }

  async function check() {
    if (!configured) return { allowed: true, status: 'UNCONFIGURED', reason: null, checkedAt: null, source: 'unconfigured', stale: true };
    let state = null;
    try {
      state = await store.get();
    } catch {
      state = null;
    }
    const ttl = Math.min(state?.result?.cacheTtlSeconds ?? 300, maxCacheSeconds ?? Infinity);
    if (state?.result && now() - state.fetchedAt < ttl * 1000) {
      return decision(state.result, 'cache');
    }
    if (state?.lastErrorAt && now() - state.lastErrorAt < retryAfterErrorMs) {
      return offline(state, 'aguardando nova tentativa');
    }
    if (!inflight) inflight = fetchLicense(state).finally(() => { inflight = null; });
    return inflight;
  }

  return { check, version: AGENT_VERSION };
}
