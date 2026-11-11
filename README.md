# Valença Moraes Advocacia — site institucional

HTML, CSS e JavaScript puros, sem build. O site fica em `public/`. Na Vercel, o acesso é controlado pela licença do **Alex Sousa Tech Gestão** (veja "Controle de licença" abaixo).

## Estrutura

```
public/index.html       página única com SEO (meta, Open Graph, JSON-LD LegalService)
public/css/style.css    tokens de cor/tipografia no :root, componentes e responsivo
public/js/main.js       slides do hero, partículas, reveal, contadores, parallax,
                        tilt 3D, carrossel, validação e envio via WhatsApp
public/assets/img/      imagens em WebP já otimizadas (~620 KB no total)
middleware.js           controle de licença (roda no servidor da Vercel, antes das páginas)
license-agent/          agente de licença do Gestão (consulta, cache e tolerância)
scripts/testar-local.mjs  teste local do controle de licença, sem a Vercel
```

## O que trocar antes de publicar

- **Nome, OAB e contatos**: "Valença Moraes", números de OAB, telefone `(98) 3221-4400`, WhatsApp `5598991234400`, e-mail e endereço são fictícios. Busque e substitua em `index.html` e `js/main.js` (número do WhatsApp).
- **Fotos da equipe**: os cards usam retrato provisório. Coloque as fotos em `assets/img/` e troque o bloco `.member__placeholder` por `<img src="assets/img/equipe-nome.webp" alt="Nome do advogado">`.
- **Depoimentos e números**: são ilustrativos. Use apenas dados reais e autorizados.
- **Formulário**: sem backend, ele valida os campos e monta a mensagem para o WhatsApp. Para receber por e-mail, troque o trecho indicado em `js/main.js` por um `fetch()` para sua API (ex.: endpoint Node/Express com Nodemailer) ou um serviço como Formspree.
- **Domínio**: ajuste `canonical`, `og:image` e `url` no JSON-LD.

## Publicidade na advocacia

O Provimento 205/2021 da OAB restringe publicidade com promessa de resultado e caráter mercantil. Antes de publicar, confirme com o escritório se depoimentos, percentuais de satisfação e a frase "alcançar os melhores resultados" estão de acordo com a orientação da seccional.

## Acessibilidade e desempenho

- `prefers-reduced-motion` desativa slides automáticos, partículas e parallax.
- Foco visível, link "Pular para o conteúdo", `aria-*` no menu, carrossel e formulário.
- Imagens do hero carregam sob demanda, partículas pausam fora da tela.

## Controle de licença (Alex Sousa Tech Gestão)

O site consulta a licença desta instalação no Gestão antes de entregar cada página. Arquivos estáticos (CSS, JS, imagens) não passam pela verificação.

- **Licença ativa**: o site funciona normalmente.
- **Suspensa, expirada ou revogada no Gestão**: o visitante vê "Site temporariamente indisponível" (HTTP 503), sem o motivo. Nenhum arquivo é apagado.
- **API do Gestão fora do ar**: o site continua com a última situação conhecida e nunca cai por falha da API.
- **Tempo para valer**: a suspensão chega em até 5 minutos e a reativação em até 1 minuto.

### Publicar na Vercel

1. No Gestão, em **Hospedagens → Nova instalação**, cadastre o site como hospedagem **externa**. Copie as credenciais: elas aparecem uma única vez.
2. Na Vercel, importe este projeto com o framework **Other** e sem comando de build. A pasta `public/` é publicada.
3. Em *Settings → Environment Variables*, ambiente **Production**, cadastre **sem** prefixo `VITE_` ou `NEXT_PUBLIC_`:

```
AST_LICENSE_API_URL=https://<API do Gestão>/api/v1
AST_INSTALLATION_KEY=inst_...
AST_LICENSE_SECRET=ast_lic_...
```

4. Faça o deploy e abra o site. No Gestão, a instalação passa a mostrar **Ativada** e a última verificação.

A API do Gestão precisa estar publicada (Render, por exemplo). A Vercel não consegue acessar `localhost`. Se a API não for alcançável, o site fica no ar, mas a licença nunca é ativada nem suspensa.

### Testar no computador, antes do deploy

```bash
npm install
cp .env.example .env      # preencha as 3 variáveis (aqui a API pode ser http://localhost:3333/api/v1)
npm run testar            # http://localhost:3000
```

O teste usa o mesmo `middleware.js` da Vercel. Depois de suspender ou reativar no Gestão, reinicie o `npm run testar` para não esperar o cache.
