const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const agent = require('./agent');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);
const dvOdontoUrl = process.env.DV_ODONTO_URL || 'https://github.com/davicarmomacarau-ux/DV-Odonto';

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '32kb' }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Limite de consultas atingido. Tente novamente em alguns minutos.' }
}));
app.use(express.static(PUBLIC_DIR, { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));

app.get('/api/config', (req, res) => {
  res.json({ dvOdontoUrl });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', aiConfigured: Boolean(process.env.GROQ_API_KEY) });
});

app.get('/api/news', async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 180) : 'Brasil notícias';
    const results = await agent.searchNews(query);
    res.json({ success: true, data: results, query, updatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message || 'Não foi possível buscar notícias agora.' });
  }
});

app.post('/api/research', async (req, res) => {
  try {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim().slice(0, 300) : '';
    if (query.length < 3) {
      return res.status(400).json({ success: false, error: 'Digite um tema com pelo menos 3 caracteres.' });
    }

    const result = await agent.research(query);
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('[PESQUISA]', error.message);
    return res.status(error.statusCode || 502).json({ success: false, error: error.message || 'A pesquisa falhou. Tente novamente.' });
  }
});

app.use('/api', (req, res) => res.status(404).json({ success: false, error: 'Recurso não encontrado.' }));
app.get('*', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  res.status(error.status || 500).json({ success: false, error: 'Não foi possível processar a solicitação.' });
});

app.listen(PORT, () => {
  console.log(`[SERVIDOR] Voz Verídica disponível na porta ${PORT}`);
  console.log(`[IA] ${process.env.GROQ_API_KEY ? 'Groq configurada' : 'Sem chave de IA; busca de notícias continua disponível'}`);
});
