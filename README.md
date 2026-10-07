# Valença Moraes Advocacia — site institucional

HTML, CSS e JavaScript puros. Sem build, sem dependências. Abra `index.html` ou publique a pasta em qualquer hospedagem estática (Vercel, Netlify, Hostinger etc.).

## Estrutura

```
index.html          página única com SEO (meta, Open Graph, JSON-LD LegalService)
css/style.css       tokens de cor/tipografia no :root, componentes e responsivo
js/main.js          slides do hero, partículas, reveal, contadores, parallax,
                    tilt 3D, carrossel, validação e envio via WhatsApp
assets/img/         imagens em WebP já otimizadas (~620 KB no total)
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
