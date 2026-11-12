const RSS_URL = 'https://news.google.com/rss/search';
const RSS_HEADERS = { 'User-Agent': 'VozVeridica/1.0 (news research)' };
const AI_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const AI_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .trim();
}

function tagValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function extractSource(title) {
  const match = title.match(/\s-\s([^\-]+)$/);
  return match ? match[1].trim() : 'Google Notícias';
}

async function searchNews(query) {
  const url = new URL(RSS_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'pt-BR');
  url.searchParams.set('gl', 'BR');
  url.searchParams.set('ceid', 'BR:pt-419');

  const response = await fetch(url, {
    headers: RSS_HEADERS,
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error('A fonte de notícias está temporariamente indisponível.');

  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 8).map(([_, item]) => {
    const title = tagValue(item, 'title');
    const link = tagValue(item, 'link');
    const publishedAt = tagValue(item, 'pubDate');
    const description = tagValue(item, 'description').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      title,
      link,
      source: extractSource(title),
      publishedAt,
      description: description.slice(0, 500)
    };
  }).filter((item) => item.title && /^https?:\/\//i.test(item.link));

  return items;
}

async function summarizeWithAI(query, articles) {
  if (!process.env.GROQ_API_KEY) return null;

  const context = articles.map((item, index) =>
    `[${index + 1}] ${item.title}\nFonte: ${item.source}\nData: ${item.publishedAt}\nDescrição publicada: ${item.description}\nURL: ${item.link}`
  ).join('\n\n');

  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de pesquisa jornalística em português do Brasil. Resuma somente o que está sustentado pelas fontes fornecidas. Separe fatos relatados de contexto ou incerteza; não invente detalhes, datas ou citações. Cite as matérias usando [1], [2] etc. Se as fontes divergem ou faltam dados, diga isso claramente. Não escreva a matéria como se a redação tivesse verificado os fatos independentemente.'
        },
        { role: 'user', content: `Tema: ${query}\n\nMatérias atuais encontradas:\n${context}\n\nProduza: um resumo conciso, pontos principais e limitações/questões a verificar. Use citações [n].` }
      ]
    }),
    signal: AbortSignal.timeout(25000)
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('[IA Groq]', response.status, detail.slice(0, 400));
    throw new Error(response.status === 429
      ? 'A cota gratuita da IA está ocupada. Aguarde um pouco e tente de novo.'
      : 'A IA não respondeu. A busca de notícias está disponível; tente novamente mais tarde.');
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || null;
}

async function research(query) {
  const articles = await searchNews(query);
  if (!articles.length) {
    return { query, summary: 'Não encontramos matérias recentes para esse tema. Experimente outros termos.', aiUsed: false, sources: [] };
  }

  const summary = await summarizeWithAI(query, articles);
  if (summary) return { query, summary, aiUsed: true, sources: articles };

  const headlines = articles.slice(0, 5).map((article, index) => `${index + 1}. ${article.title} (${article.source})`).join('\n');
  return {
    query,
    summary: `A IA ainda não foi configurada. Aqui estão as manchetes recentes encontradas:\n\n${headlines}\n\nConfigure GROQ_API_KEY no ambiente do servidor para gerar uma síntese com IA.`,
    aiUsed: false,
    sources: articles
  };
}

module.exports = { searchNews, research };
