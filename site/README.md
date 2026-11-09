# Voz Verídica — Portal de Jornalismo Livre (Full-Stack)

Node.js (Express) + Agente de IA de Curadoria/Reescrita + Front-end Tailwind + suporte a PostgreSQL.

## Estrutura

```
voz-veridica/
├── package.json
├── server.js          # Servidor HTTP & API REST (PostgreSQL ou memória)
├── agent.js           # Agente de IA de curadoria/reescrita
├── public/index.html  # Front-end integrado à API
├── .env.example       # Variáveis de ambiente
├── .gitignore
└── README.md
```

## Como rodar

```powershell
copy .env.example .env
# (opcional) configure DATABASE_URL no .env para usar PostgreSQL
npm install
npm start
```

Acesse http://localhost:3000

## Banco de Dados (PostgreSQL)

- Se `DATABASE_URL` estiver definido no `.env`, o servidor cria o schema automaticamente (tabelas: news, products, orders, newsletter, donations) e popula dados iniciais.
- Se não estiver definido, usa armazenamento em memória (ideal para testes locais).

### Instalar PostgreSQL localmente (Windows)

1. Baixe em https://www.postgresql.org/download/windows/ (ou use winget: `winget install PostgreSQL.PostgreSQL`).
2. Crie o banco: `createdb vozveridica` (ou via pgAdmin).
3. Defina no `.env`: `DATABASE_URL=postgres://usuario:senha@localhost:5432/vozveridica`
4. Rode `npm start` — o schema é criado automaticamente.

## API

- `GET /api/news` — lista de notícias.
- `POST /api/agent/ingest` — processa via Agente de IA e publica.
- `POST /api/newsletter` — `{ email }`.
- `POST /api/donate` — `{ amount }` retorna chave PIX.
- `GET /api/products` — lista do marketplace.
- `POST /api/checkout` — `{ items }` cria pedido e retorna PIX.

## Agente de IA

`agent.js` expõe `NewsCuratorAgent.processAndRewrite(rawData)`. Substitua a simulação por chamada real a OpenAI/Gemini/Anthropic usando `systemPrompt` e sua `API_KEY`.
