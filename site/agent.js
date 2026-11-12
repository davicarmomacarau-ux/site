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
const DATABASE_URL = process.env.DATABASE_URL;
const PUBLIC_DIR = path.join(__dirname, 'public');

const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultOrigins.join(',')).split(',').map((item) => item.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-origin' }
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origem não permitida pelo CORS.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Muitas requisições em pouco tempo. Tente novamente mais tarde.' }
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(express.static(PUBLIC_DIR));

function sanitizeText(value, maxLength = 2000) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

let usePg = false;
let pool = null;
const mem = {
  news: [
    {
      id: 1,
      categoria: 'Política',
      titulo: 'A nova transparência exige fiscalização constante das emendas parlamentares',
      resumo: 'Debate sobre mecanismos de rastreio, regulação e acompanhamento de recursos públicos em áreas sensíveis.',
      autor: 'Redação Voz Verídica',
      data: '2026-11-09',
      tempoLeitura: '6 min',
      imagem: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
      destaque: true,
      fonteOriginal: 'Agência Pública',
      conteudo: 'A discussão sobre o uso de verbas públicas voltou ao centro do debate nacional. A questão central é como garantir rastreabilidade, fiscalização e responsabilização dos repasses públicos em setores estratégicos. A análise aponta para a necessidade de mecanismos mais rigorosos de transparência, acompanhamento e prestação de contas.'
    },
    {
      id: 2,
      categoria: 'Economia',
      titulo: 'O impacto das novas regras de crédito em pequenos negócios',
      resumo: 'Empreendedores veem oportunidades e desafios diante das mudanças em linhas de financiamento e acesso ao capital.',
      autor: 'Equipe de Economia',
      data: '2026-11-08',
      tempoLeitura: '5 min',
      imagem: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      destaque: false,
      fonteOriginal: 'Portal de Negócios',
      conteudo: 'Pequenas empresas continuam buscando alternativas de crédito para sustentar expansão e capital de giro. A tendência é que a análise de risco e a educação financeira se tornem parte central das decisões financeiras no setor.'
    },
    {
      id: 3,
      categoria: 'Sociedade',
      titulo: 'Tecnologia e educação pública: o que muda na rotina das escolas',
      resumo: 'A digitalização de conteúdos e serviços se torna parte de uma discussão mais ampla sobre inclusão e qualidade de ensino.',
      autor: 'Redação',
      data: '2026-11-07',
      tempoLeitura: '4 min',
      imagem: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
      destaque: false,
      fonteOriginal: 'Jornal da Cidade',
      conteudo: 'A presença de ferramentas digitais nas escolas vem com desafios de infraestrutura, formação docente e acesso. Em paralelo, é necessário avaliar se a tecnologia amplia oportunidades ou reforça desigualdades existentes.'
    }
  ],
  products: [
    { id: 1, nome: 'Assinatura VIP', descricao: 'Acesso exclusivo a análises, bastidores da redação e reportagens antecipadas.', preco: 29.9, imagem: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', badge: 'Premium' },
    { id: 2, nome: 'Camiseta Oficial', descricao: 'Peça premium com algodão sustentável e estampa minimalista.', preco: 79.9, imagem: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d6d7?auto=format&fit=crop&w=1200&q=80', badge: 'Coleção' },
    { id: 3, nome: 'E-book de Reportagens', descricao: 'Coletânea digital com os principais temas investigativos do portal.', preco: 49.9, imagem: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', badge: 'Digital' }
  ],
  orders: [],
  newsletter: [],
  donations: [],
  contacts: []
};

if (DATABASE_URL) {
  try {
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    usePg = true;
    console.log('[DB] PostgreSQL configurado.');
  } catch (error) {
    console.warn('[DB] Falha ao inicializar PostgreSQL, usando memória:', error.message);
    usePg = false;
  }
} else {
  console.log('[DB] DATABASE_URL não definido — usando armazenamento em memória.');
}

async function initSchema() {
  if (!usePg || !pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      categoria VARCHAR(60) NOT NULL,
      titulo TEXT NOT NULL,
      resumo TEXT,
      autor VARCHAR(120),
      data VARCHAR(40),
      tempo_leitura VARCHAR(20),
      imagem TEXT,
      destaque BOOLEAN DEFAULT FALSE,
      fonte_original VARCHAR(200),
      conteudo TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      descricao TEXT,
      preco NUMERIC(10,2) NOT NULL,
      imagem TEXT,
      badge VARCHAR(60)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      items JSONB NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      status VARCHAR(40) DEFAULT 'pendente_pix',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS newsletter (
      id SERIAL PRIMARY KEY,
      email VARCHAR(200) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      amount NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      email VARCHAR(200) NOT NULL,
      mensagem TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const productCount = await pool.query('SELECT COUNT(*)::int AS c FROM products');
  if (Number(productCount.rows[0].c) === 0) {
    for (const product of mem.products) {
      await pool.query(
        'INSERT INTO products (id, nome, descricao, preco, imagem, badge) VALUES ($1,$2,$3,$4,$5,$6)',
        [product.id, product.nome, product.descricao, product.preco, product.imagem, product.badge]
      );
    }
    await pool.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
  }

  const newsCount = await pool.query('SELECT COUNT(*)::int AS c FROM news');
  if (Number(newsCount.rows[0].c) === 0) {
    for (const item of mem.news) {
      await pool.query(
        'INSERT INTO news (categoria, titulo, resumo, autor, data, tempo_leitura, imagem, destaque, fonte_original, conteudo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [item.categoria, item.titulo, item.resumo, item.autor, item.data, item.tempoLeitura || item.tempo_leitura || '5 min', item.imagem, item.destaque, item.fonteOriginal, item.conteudo]
      );
    }
  }

  console.log('[DB] Schema pronto.');
}

function rowToNews(row) {
  return {
    id: row.id,
    categoria: row.categoria,
    titulo: row.titulo,
    resumo: row.resumo,
    autor: row.autor,
    data: row.data,
    tempoLeitura: row.tempo_leitura,
    imagem: row.imagem,
    destaque: Boolean(row.destaque),
    fonteOriginal: row.fonte_original,
    conteudo: row.conteudo
  };
}

async function getNews() {
  if (usePg && pool) {
    const { rows } = await pool.query('SELECT * FROM news ORDER BY id DESC');
    return rows.map(rowToNews);
  }

  return [...mem.news].sort((a, b) => b.id - a.id);
}

async function getProducts() {
  if (usePg && pool) {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
    return rows.map((row) => ({
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      preco: Number(row.preco),
      imagem: row.imagem,
      badge: row.badge
    }));
  }

  return mem.products;
}

async function addNews(article) {
  const cleanArticle = {
    id: article.id || Date.now(),
    categoria: sanitizeText(article.categoria || 'Política', 60),
    titulo: sanitizeText(article.titulo || 'Nova publicação', 180),
    resumo: sanitizeText(article.resumo || '', 600),
    autor: sanitizeText(article.autor || 'Redação Voz Verídica', 120),
    data: sanitizeText(article.data || new Date().toISOString().slice(0, 10), 40),
    tempoLeitura: sanitizeText(article.tempoLeitura || '5 min', 20),
    imagem: sanitizeText(article.imagem || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80', 500),
    destaque: Boolean(article.destaque),
    fonteOriginal: sanitizeText(article.fonteOriginal || 'Agência Pública', 200),
    conteudo: sanitizeText(article.conteudo || '', 5000)
  };

  if (usePg && pool) {
    const { rows } = await pool.query(
      'INSERT INTO news (categoria, titulo, resumo, autor, data, tempo_leitura, imagem, destaque, fonte_original, conteudo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [cleanArticle.categoria, cleanArticle.titulo, cleanArticle.resumo, cleanArticle.autor, cleanArticle.data, cleanArticle.tempoLeitura, cleanArticle.imagem, cleanArticle.destaque, cleanArticle.fonteOriginal, cleanArticle.conteudo]
    );
    return rowToNews(rows[0]);
  }

  mem.news.unshift(cleanArticle);
  return cleanArticle;
}

async function clearFeaturedNews() {
  if (usePg && pool) {
    await pool.query('UPDATE news SET destaque = FALSE');
    return;
  }

  mem.news.forEach((item) => {
    item.destaque = false;
  });
}

async function addOrder(items, total) {
  if (usePg && pool) {
    const { rows } = await pool.query('INSERT INTO orders (items, total) VALUES ($1, $2) RETURNING id', [JSON.stringify(items), Number(total).toFixed(2)]);
    return rows[0].id;
  }

  const id = Date.now();
  mem.orders.push({ id, items, total, status: 'pendente_pix', created_at: new Date() });
  return id;
}

async function addNewsletter(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    throw new Error('E-mail inválido.');
  }

  if (usePg && pool) {
    const existing = await pool.query('SELECT 1 FROM newsletter WHERE email = $1 LIMIT 1', [cleanEmail]);
    if (existing.rows.length > 0) {
      throw new Error('Este e-mail já está cadastrado.');
    }
    await pool.query('INSERT INTO newsletter (email) VALUES ($1)', [cleanEmail]);
    return;
  }

  if (mem.newsletter.some((entry) => String(entry.email).toLowerCase() === cleanEmail)) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  mem.newsletter.push({ email: cleanEmail, created_at: new Date() });
}

async function addDonation(amount) {
  const numericAmount = Number(amount);
  if (!isPositiveNumber(numericAmount)) {
    throw new Error('Valor da doação inválido.');
  }

  if (numericAmount < 10) {
    throw new Error('O valor mínimo da doação é R$ 10,00.');
  }

  if (usePg && pool) {
    await pool.query('INSERT INTO donations (amount) VALUES ($1)', [numericAmount]);
    return;
  }

  mem.donations.push({ amount: numericAmount, created_at: new Date() });
}

async function addContact(name, email, message) {
  const cleanName = sanitizeText(name, 120);
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanMessage = sanitizeText(message, 2000);

  if (!cleanName || !isValidEmail(cleanEmail) || !cleanMessage) {
    throw new Error('Nome, e-mail e mensagem são obrigatórios.');
  }

  if (usePg && pool) {
    await pool.query('INSERT INTO contacts (nome, email, mensagem) VALUES ($1,$2,$3)', [cleanName, cleanEmail, cleanMessage]);
    return;
  }

  mem.contacts.push({ nome: cleanName, email: cleanEmail, mensagem: cleanMessage, created_at: new Date() });
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', mode: usePg ? 'postgresql' : 'memory' });
});

app.get('/api/news', async (req, res) => {
  try {
    res.json({ success: true, data: await getNews() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    res.json({ success: true, data: await getProducts() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/agent/ingest', async (req, res) => {
  try {
    const { tituloBruto, textoBruto, fonte, categoria, imagem, destaque } = req.body;
    const title = sanitizeText(tituloBruto || '', 180);
    const content = sanitizeText(textoBruto || '', 5000);

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Título e texto bruto são obrigatórios.' });
    }

    const processedArticle = await agent.processAndRewrite({
      tituloBruto: title,
      textoBruto: content,
      fonte: sanitizeText(fonte || 'Agência Pública', 200),
      categoria: sanitizeText(categoria || 'Política', 60),
      imagem: sanitizeText(imagem || '', 500)
    });

    if (destaque) {
      await clearFeaturedNews();
      processedArticle.destaque = true;
    } else {
      processedArticle.destaque = false;
    }

    processedArticle.tempoLeitura = '6 min';
    const saved = await addNews(processedArticle);

    return res.json({
      success: true,
      message: 'Conteúdo reescrito e publicado com sucesso.',
      article: saved
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    await addNewsletter(email);
    return res.json({ success: true, message: 'E-mail inscrito com sucesso!' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { nome, email, mensagem } = req.body;
    await addContact(nome, email, mensagem);
    return res.json({ success: true, message: 'Mensagem enviada com sucesso! Em breve responderemos.' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/donate', async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);
    if (!isPositiveNumber(numericAmount)) {
      return res.status(400).json({ success: false, error: 'Informe um valor válido para a doação.' });
    }

    await addDonation(numericAmount);
    return res.json({
      success: true,
      pixKey: '00020126360014BR.GOV.BCB.PIX0114vozveridica@pix.com520400005303986540530.005802BR5915Voz Veridica Media6009FORTALEZA62070503***6304E2CA',
      message: `Obrigado por apoiar o projeto. Doação de R$ ${numericAmount.toFixed(2)} registrada com sucesso.`
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Carrinho vazio.' });
    }

    const products = await getProducts();
    const total = items.reduce((sum, item) => {
      const product = products.find((entry) => Number(entry.id) === Number(item.id));
      if (!product) return sum;
      return sum + Number(product.preco) * (Number(item.qty) || 1);
    }, 0);

    const orderId = await addOrder(items, total);
    return res.json({
      success: true,
      orderId,
      total: Number(total.toFixed(2)),
      pixKey: '00020126360014BR.GOV.BCB.PIX0114vozveridica@pix.com520400005303986540530.005802BR5915Voz Veridica Media6009FORTALEZA62070503***6304E2CA',
      message: 'Pedido confirmado. Utilize o PIX para concluir a compra.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Recurso não encontrado.' });
  }
  return next();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

async function startServer() {
  try {
    await initSchema();
    app.listen(PORT, () => {
      console.log(`[SERVIDOR] Voz Verídica rodando na porta ${PORT}`);
      console.log(`[DB] Modo: ${usePg ? 'PostgreSQL' : 'memória'}`);
    });
  } catch (error) {
    console.error('[DB] Erro ao inicializar banco:', error.message);
    app.listen(PORT, () => {
      console.log(`[SERVIDOR] Voz Verídica rodando na porta ${PORT} em modo de emergência.`);
    });
  }
}

startServer();

module.exports = { app, startServer };
