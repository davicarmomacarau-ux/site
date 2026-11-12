<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0b0f19">
  <meta name="description" content="Voz Verídica: jornalismo independente, notícias, análises e apoio à redação.">
  <title>Voz Verídica | Jornalismo livre e análise crítica</title>
  <style>
    :root {
      --bg: #0b0f19;
      --bg-strong: #070b12;
      --panel: #121b2a;
      --panel-2: #0f1726;
      --card: #162235;
      --line: rgba(148, 163, 184, 0.22);
      --text: #edf2ff;
      --muted: #a8b4c7;
      --red: #ef4444;
      --red-strong: #dc2626;
      --gold: #f6c453;
      --green: #34d399;
      --blue: #60a5fa;
      --shadow: 0 18px 34px rgba(2, 6, 23, 0.42);
      --radius: 18px;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: radial-gradient(circle at top, rgba(59,130,246,0.10), transparent 26%), var(--bg);
      color: var(--text);
      font: 16px/1.7 "Segoe UI", Arial, sans-serif;
    }

    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }
    button, input, textarea, select { font: inherit; }

    .wrap {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
    }

    .header {
      position: sticky;
      top: 0;
      z-index: 30;
      backdrop-filter: blur(12px);
      background: rgba(11, 15, 25, 0.8);
      border-bottom: 1px solid var(--line);
    }

    .header-inner {
      min-height: 78px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    .brand-mark {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--red), var(--gold));
      box-shadow: 0 0 18px rgba(239, 68, 68, 0.75);
    }

    .brand small {
      display: block;
      color: var(--muted);
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 22px;
      color: var(--muted);
      font-weight: 600;
    }

    .nav a:hover { color: var(--text); }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 999px;
      padding: 12px 18px;
      font-weight: 700;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--red), var(--red-strong));
      color: white;
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
    }

    .btn-primary:hover { transform: translateY(-1px); }

    .btn-ghost {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--line);
      color: var(--text);
    }

    .btn-ghost:hover { background: rgba(255,255,255,0.08); }

    .cart-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-left: 6px;
      background: rgba(255,255,255,0.08);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 8px 12px;
      font-weight: 700;
    }

    .hero {
      padding: 42px 0 14px;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: minmax(290px, 0.82fr) minmax(0, 1.7fr);
      gap: 22px;
      align-items: stretch;
    }

    .panel, .card, .feature, .story {
      background: linear-gradient(180deg, rgba(22,34,53,0.94), rgba(13,20,31,0.94));
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .panel {
      padding: 24px;
    }

    .panel h2 { margin: 0 0 8px; font-size: clamp(1.5rem, 2vw, 2rem); }
    .panel p { margin: 0 0 18px; color: var(--muted); }

    .stack {
      display: grid;
      gap: 12px;
    }

    .field {
      width: 100%;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.02);
      color: var(--text);
      padding: 12px 14px;
      outline: none;
    }

    .field::placeholder { color: #8ba0bd; }

    textarea.field { min-height: 110px; resize: vertical; }

    .muted { color: var(--muted); }
    .status {
      min-height: 24px;
      font-size: 0.95rem;
      color: var(--muted);
      margin-top: 8px;
    }

    .feature {
      position: relative;
      overflow: hidden;
      min-height: 430px;
      background-image: linear-gradient(135deg, rgba(11,15,25,0.15), rgba(11,15,25,0.8)), url('https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1600&q=80');
      background-size: cover;
      background-position: center;
      padding: 28px;
      display: flex;
      align-items: end;
    }

    .feature-content {
      max-width: 720px;
      padding: 26px 22px 10px 0;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(239,68,68,0.14);
      border: 1px solid rgba(239,68,68,0.32);
      color: #ffd7d7;
      border-radius: 999px;
      padding: 7px 12px;
      font-size: 0.79rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .feature h1 {
      margin: 18px 0 14px;
      font-size: clamp(2.1rem, 4vw, 4rem);
      line-height: 0.98;
      letter-spacing: -0.06em;
    }

    .feature p {
      max-width: 620px;
      color: #e5ecf7;
      font-size: 1.06rem;
      margin: 0;
    }

    .content { padding: 32px 0 12px; }
    .section-head {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
    }

    .section-label {
      display: inline-block;
      color: var(--gold);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .section-head h2 {
      margin: 0;
      font-size: clamp(1.9rem, 3vw, 2.8rem);
      letter-spacing: -0.04em;
    }

    .section-head p {
      margin: 8px 0 0;
      color: var(--muted);
    }

    .news-grid, .products-grid, .video-grid {
      display: grid;
      gap: 18px;
    }

    .news-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .story {
      overflow: hidden;
      min-height: 100%;
    }

    .story-visual {
      height: 200px;
      background-size: cover;
      background-position: center;
      border-bottom: 1px solid var(--line);
    }

    .story-body {
      padding: 18px 18px 20px;
    }

    .story-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      color: var(--muted);
      font-size: 0.8rem;
      margin-bottom: 10px;
    }

    .story-category {
      background: rgba(96,165,250,0.12);
      color: #bfd9ff;
      border: 1px solid rgba(96,165,250,0.28);
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 0.73rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .story h3 {
      margin: 0 0 10px;
      font-size: 1.4rem;
      line-height: 1.25;
    }

    .story p {
      margin: 0 0 14px;
      color: var(--muted);
      font-size: 0.97rem;
    }

    .story-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      color: var(--muted);
      font-size: 0.78rem;
      border-top: 1px solid var(--line);
      padding-top: 12px;
    }

    .donor-panel {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 22px;
      align-items: start;
    }

    .support-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px;
      align-items: start;
    }

    .support-form {
      display: grid;
      gap: 12px;
    }

    .split {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .donation-list {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }

    .amount-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--line);
      cursor: pointer;
      color: var(--text);
      font-weight: 700;
    }

    .products-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .product-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .product-card img {
      height: 210px;
      object-fit: cover;
    }

    .product-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 10px;
      padding: 18px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: max-content;
      background: rgba(52,211,153,0.12);
      color: #c8fff0;
      border: 1px solid rgba(52,211,153,0.25);
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .product-body h3 {
      margin: 0;
      font-size: 1.35rem;
    }

    .price {
      color: var(--gold);
      font-size: 1.45rem;
      font-weight: 800;
    }

    .cart-list {
      display: grid;
      gap: 10px;
      margin: 14px 0 18px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: rgba(255,255,255,0.02);
    }

    .footer {
      padding: 34px 0 48px;
      color: var(--muted);
      border-top: 1px solid var(--line);
      margin-top: 18px;
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 22px;
      flex-wrap: wrap;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(2,6,23,0.7);
      z-index: 40;
      display: none;
    }

    .overlay.open { display: block; }

    .drawer {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: min(420px, 100%);
      background: var(--panel);
      border-left: 1px solid var(--line);
      transform: translateX(100%);
      transition: transform 0.24s ease;
      z-index: 41;
      padding: 22px;
    }

    .drawer.open { transform: translateX(0); }

    .drawer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
    }

    .close-btn {
      background: transparent;
      border: 1px solid var(--line);
      color: var(--text);
      width: 38px;
      height: 38px;
      border-radius: 12px;
      font-size: 1.3rem;
      cursor: pointer;
    }

    .tiny { font-size: 0.82rem; }

    @media (max-width: 980px) {
      .nav { display: none; }
      .hero-grid, .support-grid, .donor-panel { grid-template-columns: 1fr; }
      .news-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 620px) {
      .news-grid, .products-grid, .split { grid-template-columns: 1fr; }
      .header-inner { min-height: 70px; }
      .feature { min-height: 360px; }
      .feature h1 { font-size: 2.4rem; }
      .btn { width: 100%; }
      .header-actions { width: 100%; }
      .header-actions .btn { flex: 1; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="wrap header-inner">
      <a class="brand" href="#inicio" aria-label="Voz Verídica, início">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>
          <strong>VOZ VERÍDICA</strong>
          <small>Jornalismo livre</small>
        </span>
      </a>

      <nav class="nav" aria-label="Navegação principal">
        <a href="#noticias">Notícias</a>
        <a href="#loja">Loja</a>
        <a href="#apoie">Apoie</a>
        <a href="#contato">Contato</a>
      </nav>

      <div class="header-actions">
        <button class="btn btn-ghost" id="cart-btn" type="button">
          Carrinho <span class="cart-pill" id="cart-count">0</span>
        </button>
        <a class="btn btn-primary" href="#apoie">Apoie</a>
      </div>
    </div>
  </header>

  <main id="inicio">
    <section class="hero">
      <div class="wrap hero-grid">
        <aside class="panel" aria-labelledby="agent-title">
          <h2 id="agent-title">Agente editorial</h2>
          <p>Transforme um rascunho em uma matéria pronta para publicar, com contexto e tom jornalístico.</p>

          <form id="agent-form" class="stack">
            <input class="field" id="raw-title" type="text" placeholder="Título bruto da notícia" required>
            <input class="field" id="raw-source" type="text" placeholder="Fonte (opcional)">
            <select class="field" id="raw-category">
              <option value="Política">Política</option>
              <option value="Economia">Economia</option>
              <option value="Sociedade">Sociedade</option>
              <option value="Opinião">Opinião</option>
            </select>
            <textarea class="field" id="raw-text" placeholder="Texto bruto ou material para reescrita" required></textarea>
            <label class="tiny muted"><input type="checkbox" id="raw-featured"> Marcar como matéria em destaque</label>
            <button class="btn btn-primary" type="submit">Gerar matéria</button>
          </form>
          <div id="agent-status" class="status" aria-live="polite"></div>
        </aside>

        <article class="feature" aria-label="Em destaque">
          <div class="feature-content">
            <span class="tag">Em destaque</span>
            <h1>Jornalismo com contexto, clareza e responsabilidade.</h1>
            <p>Reportagens, análises e debates que ajudam o leitor a entender o que acontece e por que isso importa.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="content wrap" id="noticias">
      <div class="section-head">
        <div>
          <span class="section-label">Informação com contexto</span>
          <h2>Em destaque agora</h2>
        </div>
      </div>
      <div id="news-grid" class="news-grid" aria-live="polite"></div>
    </section>

    <section class="content wrap" id="loja">
      <div class="section-head">
        <div>
          <span class="section-label">Apoie a redação</span>
          <h2>Loja do jornalismo livre</h2>
        </div>
      </div>
      <div id="products-grid" class="products-grid"></div>
    </section>

    <section class="content wrap" id="apoie">
      <div class="section-head">
        <div>
          <span class="section-label">Apoie o projeto</span>
          <h2>Fortaleça a informação independente</h2>
        </div>
      </div>

      <div class="donor-panel">
        <div class="panel">
          <h3>Doações</h3>
          <p>Seu apoio ajuda a manter a redação, a investigação e a produção editorial.</p>

          <div class="donation-list">
            <button class="amount-chip" data-amount="20" type="button">R$ 20</button>
            <button class="amount-chip" data-amount="50" type="button">R$ 50</button>
            <button class="amount-chip" data-amount="100" type="button">R$ 100</button>
            <button class="amount-chip" data-amount="250" type="button">R$ 250</button>
          </div>

          <form id="donation-form" class="support-form" style="margin-top:18px;">
            <input class="field" id="donation-amount" type="number" min="10" step="1" placeholder="Outro valor em reais" required>
            <button class="btn btn-primary" type="submit">Quero apoiar</button>
          </form>
          <div id="donation-status" class="status" aria-live="polite"></div>
        </div>

        <div class="panel">
          <h3>Newsletter</h3>
          <p>Receba os principais destaques, análises e lançamentos da redação.</p>
          <form id="newsletter-form" class="support-form">
            <input class="field" id="newsletter-email" type="email" placeholder="Seu e-mail" required>
            <button class="btn btn-primary" type="submit">Inscrever-se</button>
          </form>
          <div id="newsletter-status" class="status" aria-live="polite"></div>
        </div>
      </div>
    </section>

    <section class="content wrap" id="contato">
      <div class="support-grid">
        <div class="panel">
          <h3>Fale com a redação</h3>
          <p>Envie uma mensagem, crítica, sugestão ou pauta.</p>
          <form id="contact-form" class="support-form">
            <div class="split">
              <input class="field" id="contact-name" type="text" placeholder="Seu nome" required>
              <input class="field" id="contact-email" type="email" placeholder="Seu e-mail" required>
            </div>
            <textarea class="field" id="contact-message" placeholder="Mensagem" required></textarea>
            <button class="btn btn-primary" type="submit">Enviar mensagem</button>
          </form>
          <div id="contact-status" class="status" aria-live="polite"></div>
        </div>

        <div class="panel">
          <h3>Nosso compromisso</h3>
          <p>Produzimos conteúdo com foco em transparência, contexto e cidadania.</p>
          <ul class="muted" style="padding-left: 18px; margin: 0;">
            <li>Verificação de fatos e fontes</li>
            <li>Contexto para leitura crítica</li>
            <li>Jornalismo independente e responsável</li>
          </ul>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap footer-inner">
      <div>
        <strong>Voz Verídica © 2026</strong><br>
        Compromisso com transparência, contexto e democracia.
      </div>
      <div class="nav" aria-label="Links do rodapé">
        <a href="#noticias">Notícias</a>
        <a href="#loja">Loja</a>
        <a href="#apoie">Apoie</a>
      </div>
    </div>
  </footer>

  <div id="cart-overlay" class="overlay" aria-hidden="true"></div>
  <aside id="cart-drawer" class="drawer" aria-label="Seu carrinho" aria-hidden="true">
    <div class="drawer-head">
      <h2>Seu carrinho</h2>
      <button id="cart-close" class="close-btn" type="button" aria-label="Fechar carrinho">×</button>
    </div>
    <div id="cart-items" class="cart-list"></div>
    <div class="tiny muted">Subtotal: <strong id="cart-total">R$ 0,00</strong></div>
    <button class="btn btn-primary" id="checkout-btn" type="button" style="width: 100%; margin-top: 18px;">Finalizar compra</button>
    <div id="checkout-status" class="status" aria-live="polite"></div>
  </aside>

  <script>
    const cart = new Map();
    const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);

    function renderCart() {
      const items = [...cart.values()];
      const count = items.reduce((sum, item) => sum + item.qty, 0);
      const total = items.reduce((sum, item) => sum + Number(item.preco) * item.qty, 0);

      document.getElementById('cart-count').textContent = String(count);
      document.getElementById('cart-total').textContent = money(total);

      const cartItems = document.getElementById('cart-items');
      if (!items.length) {
        cartItems.innerHTML = '<div class="tiny muted">Seu carrinho está vazio.</div>';
        return;
      }

      cartItems.innerHTML = items.map((item) => `
        <div class="cart-item">
          <div>
            <strong>${item.nome}</strong><br>
            <span class="tiny muted">${item.qty} x ${money(item.preco)}</span>
          </div>
          <strong>${money(Number(item.preco) * item.qty)}</strong>
        </div>
      `).join('');
    }

    function openCart() {
      document.getElementById('cart-overlay').classList.add('open');
      document.getElementById('cart-drawer').classList.add('open');
      document.getElementById('cart-drawer').setAttribute('aria-hidden', 'false');
    }

    function closeCart() {
      document.getElementById('cart-overlay').classList.remove('open');
      document.getElementById('cart-drawer').classList.remove('open');
      document.getElementById('cart-drawer').setAttribute('aria-hidden', 'true');
    }

    async function loadNews() {
      const grid = document.getElementById('news-grid');
      try {
        const response = await fetch('/api/news');
        const payload = await response.json();
        if (!response.ok || !Array.isArray(payload.data)) {
          throw new Error(payload.error || 'Erro ao carregar notícias.');
        }

        const featured = payload.data.filter((item) => item.destaque).slice(0, 1);
        const rest = payload.data.filter((item) => !item.destaque);
        const news = [...featured, ...rest].slice(0, 6);

        grid.innerHTML = news.map((item) => `
          <article class="story">
            <div class="story-visual" style="background-image:url('${item.imagem || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80'}');"></div>
            <div class="story-body">
              <div class="story-meta">
                <span class="story-category">${item.categoria || 'Política'}</span>
                <span>${item.data || 'Hoje'}</span>
              </div>
              <h3>${item.titulo || 'Nova matéria'}</h3>
              <p>${item.resumo || item.conteudo || 'Leia o texto completo.'}</p>
              <div class="story-footer">
                <span>${item.autor || 'Redação'}</span>
                <span>${item.tempoLeitura || '5 min'}</span>
              </div>
            </div>
          </article>
        `).join('');
      } catch (error) {
        grid.innerHTML = `<div class="panel"><p>${error.message}</p></div>`;
      }
    }

    async function loadProducts() {
      const grid = document.getElementById('products-grid');
      try {
        const response = await fetch('/api/products');
        const payload = await response.json();
        if (!response.ok || !Array.isArray(payload.data)) {
          throw new Error(payload.error || 'Erro ao carregar loja.');
        }

        grid.innerHTML = payload.data.map((product) => `
          <article class="product-card card">
            <img src="${product.imagem || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}" alt="${product.nome}">
            <div class="product-body">
              <span class="badge">${product.badge || 'Produto'}</span>
              <h3>${product.nome}</h3>
              <p class="muted">${product.descricao}</p>
              <div class="story-footer">
                <span class="price">${money(product.preco)}</span>
                <button class="btn btn-primary add-to-cart" data-id="${product.id}" data-name="${product.nome}" data-price="${product.preco}" type="button">Adicionar</button>
              </div>
            </div>
          </article>
        `).join('');

        document.querySelectorAll('.add-to-cart').forEach((button) => {
          button.addEventListener('click', () => {
            const { id, name, price } = button.dataset;
            const item = cart.get(String(id)) || { id: Number(id), nome: name, preco: Number(price), qty: 0 };
            item.qty += 1;
            cart.set(String(id), item);
            renderCart();
            openCart();
          });
        });
      } catch (error) {
        grid.innerHTML = `<div class="panel"><p>${error.message}</p></div>`;
      }
    }

    async function submitJson(url, data, statusEl) {
      statusEl.textContent = 'Enviando...';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const payload = await response.json();
      const message = payload.message || payload.error || 'Operação concluída.';
      statusEl.textContent = response.ok ? message : payload.error || message;
      statusEl.style.color = response.ok ? '#34d399' : '#fca5a5';
      return response.ok;
    }

    document.getElementById('cart-btn').addEventListener('click', openCart);
    document.getElementById('cart-close').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);

    document.getElementById('checkout-btn').addEventListener('click', async () => {
      const status = document.getElementById('checkout-status');
      if (!cart.size) {
        status.textContent = 'Seu carrinho está vazio.';
        status.style.color = '#fca5a5';
        return;
      }

      const items = [...cart.values()].map(({ id, qty }) => ({ id, qty }));
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      const payload = await response.json();
      status.textContent = payload.message || payload.error || 'Pedido enviado.';
      status.style.color = response.ok ? '#34d399' : '#fca5a5';

      if (response.ok) {
        cart.clear();
        renderCart();
      }
    });

    document.getElementById('agent-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = document.getElementById('agent-status');
      const payload = {
        tituloBruto: document.getElementById('raw-title').value,
        textoBruto: document.getElementById('raw-text').value,
        fonte: document.getElementById('raw-source').value,
        categoria: document.getElementById('raw-category').value,
        imagem: '',
        destaque: document.getElementById('raw-featured').checked
      };

      const response = await fetch('/api/agent/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      status.textContent = data.message || data.error || 'Operação realizada.';
      status.style.color = response.ok ? '#34d399' : '#fca5a5';

      if (response.ok) {
        document.getElementById('agent-form').reset();
        loadNews();
      }
    });

    document.getElementById('newsletter-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('newsletter-email').value.trim();
      const success = await submitJson('/api/newsletter', { email }, document.getElementById('newsletter-status'));
      if (success) {
        document.getElementById('newsletter-form').reset();
      }
    });

    document.getElementById('donation-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const amount = document.getElementById('donation-amount').value;
      const success = await submitJson('/api/donate', { amount }, document.getElementById('donation-status'));
      if (success) {
        document.getElementById('donation-form').reset();
      }
    });

    document.querySelectorAll('.amount-chip').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('donation-amount').value = button.dataset.amount;
      });
    });

    document.getElementById('contact-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        nome: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        mensagem: document.getElementById('contact-message').value
      };
      const success = await submitJson('/api/contact', payload, document.getElementById('contact-status'));
      if (success) {
        document.getElementById('contact-form').reset();
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      loadNews();
      loadProducts();
      renderCart();
    });
  </script>
</body>
</html>
