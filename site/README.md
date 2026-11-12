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

## Área administrativa privada

Acesse `/admin`. Configure no ambiente do servidor `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET`. O usuário sugerido é `davi`; defina uma senha forte, longa, exclusiva e não divulgada em chats. Nunca grave credenciais reais no Git ou em arquivos públicos. O segredo de sessão deve ser um valor aleatório longo e separado da senha.

A sessão usa cookie HttpOnly, SameSite=Strict e expira em oito horas. Tentativas de login são limitadas. Em produção, publique somente com HTTPS; os cookies serão marcados como Secure quando `NODE_ENV=production`. O painel mostra apenas indicadores de configuração e não expõe segredos. Sem as variáveis obrigatórias, o login permanece desabilitado. Se perder o acesso, ajuste as variáveis e reinicie o servidor.

## Pesquisa e IA

- A busca de notícias usa o RSS público do Google Notícias e pode funcionar sem chave de IA.
- Para a síntese automatizada, configure `GROQ_API_KEY` no ambiente do servidor. Nunca coloque essa chave no HTML ou no navegador.
- É possível configurar `GROQ_MODEL` e `DV_ODONTO_URL` no ambiente.
- A aplicação oferece atalhos para pesquisar diretamente no Google, Bing e DuckDuckGo. A seleção de região afeta somente os parâmetros de busca; não altera IP e não é VPN, proxy ou ferramenta para contornar bloqueios.
- Cotas e termos de serviços externos podem mudar. A síntese é auxiliar, pode conter erros e não substitui verificação editorial.

## Link do DV Odonto

Por padrão, o botão aponta para `https://github.com/davicarmomacarau-ux/DV-Odonto`. Esse repositório está privado; só pessoas autorizadas terão acesso. Configure `DV_ODONTO_URL` para apontar para uma página pública do software quando estiver disponível.

## Publicação e domínio

Não é possível registrar ou atribuir um domínio sem escolher um nome disponível, ter acesso a um registrador e configurar a hospedagem/DNS. Publique a pasta `site` em um host compatível com Node.js, defina as variáveis de ambiente no painel seguro do host e associe um domínio que você já possui. O provedor informará os registros DNS necessários; ative HTTPS. Preço e disponibilidade do domínio/hospedagem dependem dos fornecedores.

## API

- `GET /api/health` — estado do servidor e indicação se a chave IA está configurada.
- `GET /api/news?q=tema` — notícias recentes encontradas.
- `POST /api/research` com `{ "query": "tema" }` — matérias e síntese opcional.
- `GET /api/config` — URL do DV Odonto.
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/status` — endpoints da área restrita.
