# Voz Verídica

Site jornalístico responsivo em tema escuro, com pesquisa de notícias atuais por tema, links para buscadores gerais, fontes originais e síntese opcional por IA.

## Executar localmente

Requer Node.js 18 ou superior.

```bash
cd site
npm install
cp .env.example .env
npm start
```

Acesse `http://localhost:3000`.

## IA e pesquisa

- A busca de notícias usa o RSS público do Google Notícias e pode funcionar sem chave de IA.
- Para a síntese automatizada, configure `GROQ_API_KEY` no ambiente do servidor. Nunca coloque essa chave no HTML ou no navegador.
- É possível configurar `GROQ_MODEL` e `DV_ODONTO_URL` no ambiente.
- A disponibilidade, as cotas e os termos de uso de serviços externos podem mudar. A aplicação não finge gerar síntese por IA quando ela não está configurada.
- A página também oferece atalhos para pesquisar diretamente no Google, Bing e DuckDuckGo. Esses links abrem os sites externos no navegador; o site não fornece VPN, proxy nem contorno de bloqueios geográficos.

## Link do DV Odonto

Por padrão, o botão aponta para `https://github.com/davicarmomacarau-ux/DV-Odonto`. Esse repositório está privado; só pessoas autorizadas terão acesso. Configure `DV_ODONTO_URL` para apontar para uma página pública do software quando estiver disponível.

## Publicar e configurar domínio

Não é possível registrar ou atribuir um domínio sem escolher um nome disponível, ter acesso a um registrador e configurar a hospedagem/DNS. O projeto está preparado para rodar como aplicação Node.js: publique a pasta `site` em um host compatível, adicione as variáveis de ambiente no painel do host e associe um domínio que você já possui. O provedor de hospedagem fornecerá os registros DNS necessários; ative HTTPS e defina `GROQ_API_KEY` e `DV_ODONTO_URL` no ambiente seguro do servidor.

Domínio personalizado e hospedagem não são garantidamente gratuitos: preço, disponibilidade, certificados e limites dependem do registrador e do host escolhidos. Verifique a disponibilidade e os custos antes de comprar.

## Variáveis de ambiente

Consulte `.env.example`. `GROQ_API_KEY` é opcional para a pesquisa e necessária para gerar síntese por IA.

## API

- `GET /api/health` — estado do servidor e indicação se a chave da IA está configurada.
- `GET /api/news?q=tema` — notícias recentes encontradas.
- `POST /api/research` com `{ "query": "tema" }` — matérias e síntese opcional.
- `GET /api/config` — URL do DV Odonto.

A síntese automática pode conter erros e não substitui verificação editorial. Consulte e cite as fontes originais ao reutilizar conteúdo.
