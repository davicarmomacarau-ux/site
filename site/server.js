const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const agent = require('./agent');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const dvOdontoUrl = process.env.DV_ODONTO_URL || 'https://github.com/davicarmomacarau-ux/DV-Odonto';
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000;

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(express.json({ limit: '16kb' }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Limite de consultas atingido. Tente novamente em alguns minutos.' }
}));
app.use(express.static(PUBLIC_DIR, { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));

function signSession(expiresAt) {
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function hasAdminSession(req) {
  const token = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('vv_admin='))?.slice('vv_admin='.length);
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest();
  let received;
  try { received = Buffer.from(signature, 'base64url'); } catch { return false; }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(data.expiresAt) && data.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  if (!hasAdminSession(req)) return res.status(401).json({ success: false, error: 'Acesso administrativo requer autenticação.' });
  next();
}

function safeEqualText(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Muitas tentativas de acesso. Aguarde 15 minutos.' }
});

app.get('/api/config', (req, res) => res.json({ dvOdontoUrl }));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', aiConfigured: Boolean(process.env.GROQ_API_KEY) }));

app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return res.status(503).json({ success: false, error: 'A área administrativa ainda não foi configurada pelo responsável do servidor.' });
  }
  const username = typeof req.body?.username === 'string' ? req.body.username : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const validUsername = safeEqualText(username, process.env.ADMIN_USERNAME);
  const validPassword = safeEqualText(password, process.env.ADMIN_PASSWORD);
  if (!validUsername || !validPassword) {
    return res.status(401).json({ success: false, error: 'Usuário ou senha incorretos.' });
  }
  const token = signSession(Date.now() + SESSION_MAX_AGE);
  res.cookie('vv_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });
  return res.json({ success: true });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  res.clearCookie('vv_admin', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ success: true });
});

app.get('/api/admin/status', requireAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    success: true,
    serverTime: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
    aiConfigured: Boolean(process.env.GROQ_API_KEY),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    dvOdontoUrl
  });
});

app.get('/admin', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(PUBLIC_DIR, hasAdminSession(req) ? 'admin.html' : 'admin-login.html'));
});

app.get('/api/news', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 180) : 'Brasil notícias';
  if (query.length < 2) return res.status(400).json({ success: false, error: 'Digite um tema para buscar.' });
  try {
    const data = await agent.searchNews(query);
    res.json({ success: true, data, query, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[NOTÍCIAS]', error.message);
    res.status(502).json({ success: false, error: 'A busca de notícias está indisponível agora. Tente novamente.' });
  }
});

app.post('/api/research', async (req, res) => {
  const query = typeof req.body?.query === 'string' ? req.body.query.trim().slice(0, 300) : '';
  if (query.length < 3) return res.status(400).json({ success: false, error: 'Digite um tema com pelo menos 3 caracteres.' });
  try {
    res.json({ success: true, ...await agent.research(query) });
  } catch (error) {
    console.error('[PESQUISA]', error.message);
    res.status(error.statusCode || 502).json({ success: false, error: error.message || 'A pesquisa falhou. Tente novamente.' });
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
  console.log(`[IA] ${process.env.GROQ_API_KEY ? 'Groq configurada' : 'Sem chave; pesquisa de notícias funciona sem síntese IA'}`);
  console.log(`[ADMIN] ${process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET ? 'Autenticação configurada' : 'Configure ADMIN_USERNAME, ADMIN_PASSWORD e ADMIN_SESSION_SECRET para habilitar /admin'}`);
});
