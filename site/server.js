require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const agent = require('./agent');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let usePg = false;
let pool = null;
const mem = {
  news: [{ id: 1, categoria: 'Política', titulo: 'Orçamento Secreto e os Desafios da Transparência nas Emendas', resumo: 'Um raio-x detalhado sobre o fluxo de verbas públicas e as manobras legislativas no Congresso Nacional.', autor: 'Redação Voz Verídica', data: '10:30', tempoLeitura: '8 min', imagem: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80', destaque: true, fonteOriginal: null, conteudo: null }],
  products: [
    { id: 1, nome: 'Assinatura VIP — Clube de Membros', descricao: 'Acesso a podcasts exclusivos, bastidores da redação e análises aprofundadas antes da publicação.', preco: 29.90, imagem: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80', badge: 'VIP' },
    { id: 2, nome: "Camiseta Oficial 'Voz Verídica'", descricao: 'Algodão sustentável, estampa minimalista. Vista a causa do jornalismo independente.', preco: 79.90, imagem: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', badge: 'Moda' },
    { id: 3, nome: 'Livro / E-book da Redação', descricao: 'Coletânea das grandes reportagens investigativas do portal em formato digital e impresso.', preco: 49.90, imagem: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', badge: 'Literatura' }
  ],
  orders: [], newsletter: [], donations: []
};

if (DATABASE_URL) {
  try {
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    usePg = true;
    console.log('[DB] PostgreSQL configurado.');
  } catch (e) {
    console.warn('[DB] Falha ao inicializar pg, usando memória:', e.message);
    usePg = false;
  }
} else {
  console.log('[DB] DATABASE_URL não definido — usando armazenamento em memória.');
}
async function initSchema() {
  if (!usePg) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS news (id SERIAL PRIMARY KEY, categoria VARCHAR(60) NOT NULL, titulo TEXT NOT NULL, resumo TEXT, autor VARCHAR(120), data VARCHAR(40), tempo_leitura VARCHAR(20), imagem TEXT, destaque BOOLEAN DEFAULT FALSE, fonte_original TEXT, conteudo TEXT, created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, nome VARCHAR(120) NOT NULL, descricao TEXT, preco NUMERIC(10,2) NOT NULL, imagem TEXT, badge VARCHAR(40));
    CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, items JSONB NOT NULL, total NUMERIC(10,2) NOT NULL, status VARCHAR(40) DEFAULT 'pendente_pix', created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS newsletter (id SERIAL PRIMARY KEY, email VARCHAR(200) NOT NULL, created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS donations (id SERIAL PRIMARY KEY, amount NUMERIC(10,2) NOT NULL, created_at TIMESTAMP DEFAULT NOW());
  `);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM products');
  if (rows[0].c === 0) {
    for (const p of mem.products) {
      await pool.query('INSERT INTO products (id, nome, descricao, preco, imagem, badge) VALUES ($1,$2,$3,$4,$5,$6)', [p.id, p.nome, p.descricao, p.preco, p.imagem, p.badge]);
    }
    await pool.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
  }
  const n = await pool.query('SELECT COUNT(*)::int AS c FROM news');
  if (n.rows[0].c === 0) {
    const seed = mem.news[0];
    await pool.query('INSERT INTO news (categoria, titulo, resumo, autor, data, tempo_leitura, imagem, destaque) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [seed.categoria, seed.titulo, seed.resumo, seed.autor, seed.data, seed.tempoLeitura, seed.imagem, seed.destaque]);
  }
  console.log('[DB] Schema pronto.');
}
function rowToNews(r) { return { id: r.id, categoria: r.categoria, titulo: r.titulo, resumo: r.resumo, autor: r.autor, data: r.data, tempoLeitura: r.tempo_leitura, imagem: r.imagem, destaque: r.destaque, fonteOriginal: r.fonte_original, conteudo: r.conteudo }; }

async function getNews() {
  if (usePg) { const { rows } = await pool.query('SELECT * FROM news ORDER BY id DESC'); return rows.map(rowToNews); }
  return [...mem.news].sort((a, b) => b.id - a.id);
}
async function addNews(article) {
  if (usePg) {
    const { rows } = await pool.query('INSERT INTO news (categoria, titulo, resumo, autor, data, tempo_leitura, imagem, destaque, fonte_original, conteudo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [article.categoria, article.titulo, article.resumo, article.autor, article.data, article.tempoLeitura, article.imagem, article.destaque, article.fonteOriginal, article.conteudo]);
    return rowToNews(rows[0]);
  }
  mem.news.unshift(article);
  return article;
}
async function clearDestaque() {
  if (usePg) await pool.query('UPDATE news SET destaque = FALSE');
  else mem.news.forEach(n => n.destaque = false);
}
async function getProducts() {
  if (usePg) { const { rows } = await pool.query('SELECT * FROM products ORDER BY id'); return rows.map(r => ({ id: r.id, nome: r.nome, descricao: r.descricao, preco: Number(r.preco), imagem: r.imagem, badge: r.badge })); }
  return mem.products;
}
async function addOrder(items, total) {
  if (usePg) { const { rows } = await pool.query('INSERT INTO orders (items, total) VALUES ($1,$2) RETURNING id', [JSON.stringify(items), total]); return rows[0].id; }
  const id = Date.now(); mem.orders.push({ id, items, total, status: 'pendente_pix', data: new Date() }); return id;
}
async function addNewsletter(email) {
  if (usePg) await pool.query('INSERT INTO newsletter (email) VALUES ($1)', [email]);
  else mem.newsletter.push({ email, data: new Date() });
}
async function addDonation(amount) {
  if (usePg) await pool.query('INSERT INTO donations (amount) VALUES ($1)', [amount]);
  else mem.donations.push({ amount, data: new Date() });
}

// --- ROTAS DA API ---
app.get('/api/news', async (req, res) => {
  try { res.json({ success: true, data: await getNews() }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/agent/ingest', async (req, res) => {
  try {
    const { tituloBruto, textoBruto, fonte, categoria, imagem, destaque } = req.body;
    if (!tituloBruto || !textoBruto) return res.status(400).json({ success: false, error: 'Título e texto bruto são obrigatórios.' });
    const processedArticle = await agent.processAndRewrite({ tituloBruto, textoBruto, fonte: fonte || 'Agência Pública', categoria: categoria || 'Política', imagem });
    if (destaque) { await clearDestaque(); processedArticle.destaque = true; } else { processedArticle.destaque = false; }
    processedArticle.tempoLeitura = '6 min';
    const saved = await addNews(processedArticle);
    res.json({ success: true, message: 'Conteúdo reescrito e publicado pelo Agente de IA com sucesso!', article: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });
  await addNewsletter(email);
  res.json({ success: true, message: 'E-mail inscrito com sucesso!' });
});

app.post('/api/donate', async (req, res) => {
  const { amount } = req.body;
  await addDonation(amount);
  res.json({ success: true, pixKey: '00020126360014BR.GOV.BCB.PIX0114vozveridica@pix.com520400005303986540530.005802BR5915Voz Veridica Media6009FORTALEZA62070503***6304E2CA', message: `Chave PIX gerada com sucesso para R$ ${amount},00.` });
});

app.get('/api/products', async (req, res) => {
  try { res.json({ success: true, data: await getProducts() }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, error: 'Carrinho vazio.' });
    const products = await getProducts();
    const total = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + (product ? product.preco * (item.qty || 1) : 0);
    }, 0);
    const orderId = await addOrder(items, Number(total.toFixed(2)));
    res.json({ success: true, orderId, total: Number(total.toFixed(2)), pixKey: '00020126360014BR.GOV.BCB.PIX0114vozveridica@pix.com520400005303986540530.005802BR5915Voz Veridica Media6009FORTALEZA62070503***6304E2CA', message: `Pedido #${orderId} criado. Total R$ ${total.toFixed(2)}. Pague via PIX.` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// Inicializa schema (se PG) e sobe servidor
initSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`[SERVIDOR] Voz Verídica rodando na porta ${PORT}`);
    console.log(`[DB] Modo: ${usePg ? 'PostgreSQL' : 'memória'}`);
    console.log(`[AGENTE IA] Pronto para processar e remodelar reportagens.`);
  });
}).catch(err => {
  console.error('[DB] Erro ao inicializar schema:', err.message);
  app.listen(PORT, () => { console.log(`[SERVIDOR] Voz Verídica rodando na porta ${PORT} (sem DB)`); });
});

