# Voz Verídica

Portal jornalístico em tema escuro, com pesquisa de notícias recentes na web, síntese assistida por IA e links para conferência das fontes. O servidor usa Google Notícias RSS para localizar matérias e Groq para a síntese em linguagem natural.

## Rodar localmente

Requer Node.js 18 ou superior.

```bash
npm install
cp .env.example .env
npm start
```

Abra http://localhost:3000.

## Configurar a IA gratuita

1. Crie uma chave de API na plataforma Groq (a disponibilidade e os limites do plano gratuito dependem dos termos atuais do provedor).
2. Defina `GROQ_API_KEY` no ambiente do servidor; nunca coloque a chave no HTML ou no navegador.
3. Opcionalmente ajuste `GROQ_MODEL`, `DV_ODONTO_URL`, `PORT` e `ALLOWED_ORIGINS`.

Sem chave da Groq, a busca de notícias recentes ainda funciona e a página mostra manchetes e links; não apresentará síntese gerada por IA. A aplicação não finge que a IA está ligada.

## Recursos e limites

- Pesquisa de notícias atuais por tema usando Google Notícias RSS.
- Síntese com citações numeradas das matérias recuperadas, via API Groq.
- Links das fontes originais e aviso para conferir as matérias completas.
- Limite de requisições para reduzir abuso da API.
- Link configurável para o DV Odonto.
- Tema responsivo escuro, sem bibliotecas de frontend pagas.

A aplicação e as bibliotecas podem ser executadas sem custo de licença; provedores externos podem impor cotas, exigir cadastro, alterar limites ou ficar indisponíveis. O serviço de busca depende da disponibilidade do RSS do Google Notícias. Conteúdo de terceiros permanece sujeito aos direitos e termos das respectivas fontes. A síntese é auxiliar, pode conter erros e não deve ser republicada sem revisão editorial.

## Link do DV Odonto

Por padrão, o site aponta para `https://github.com/davicarmomacarau-ux/DV-Odonto`. Esse repositório está privado, então visitantes sem permissão não poderão acessá-lo. Para apresentar o sistema publicamente, configure `DV_ODONTO_URL` com o endereço público correto do aplicativo.

## API

- `GET /api/health` — status do serviço e informação se a chave da IA está configurada.
- `GET /api/news?q=tema` — lista matérias recentes relacionadas ao tema.
- `POST /api/research` com `{ "query": "tema" }` — matérias com uma síntese opcional da IA.
- `GET /api/config` — URL pública configurada para o DV Odonto.
