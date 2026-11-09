/**
 * Módulo do Agente de IA: Curadoria e Remodelação de Conteúdo Público
 */
class NewsCuratorAgent {
  constructor() {
    // Prompt do sistema que instrui a IA como processar o conteúdo bruto
    this.systemPrompt = `
      Você é um jornalista sênior e analista político do portal 'Voz Verídica'.
      Sua tarefa é receber matérias públicas, comunicados ou rascunhos brutos e remodelá-los:
      1. Extraia apenas os fatos verificáveis e o contexto central.
      2. Reescreva em um tom analítico, crítico, direto e sem sensacionalismo.
      3. Crie um título chamativo, um resumo conciso e o corpo da matéria reescrito.
      4. Atribua a categoria correta (Política, Economia, Sociedade ou Opinião).
    `;
  }

  /**
   * Modela e reescreve o conteúdo bruto recebido
   * @param {Object} rawData - { tituloBruto, textoBruto, fonte }
   */
  async processAndRewrite(rawData) {
    // Simulação do processamento da IA (Aqui você conecta a chave da OpenAI, Gemini ou Anthropic API)
    console.log(`[AGENTE IA] Processando matéria da fonte: ${rawData.fonte}`);

    // Exemplo de transformação simulada com base no conteúdo
    const categoria = rawData.categoria || "Política";
    const tituloRemodelado = `ANÁLISE: ${rawData.tituloBruto.replace(/(urgente|bomba|confira)/gi, '').trim()}`;
    const resumoRemodelado = `Análise crítica sobre os desdobramentos de: ${rawData.textoBruto.substring(0, 120)}...`;

    const textoRemodelado = `
      O cenário atual aponta para desdobramentos relevantes no setor de ${categoria.toLowerCase()}.
      Conforme dados apurados na matéria original (${rawData.fonte}), os fatos centrais demonstram:

      ${rawData.textoBruto}

      ---
      Análise Voz Verídica: O impacto dessa medida reflete a importância da transparência pública e do acompanhamento contínuo pelas instituições sociais.
    `.trim();

    return {
      id: Date.now(),
      categoria: categoria,
      titulo: tituloRemodelado,
      resumo: resumoRemodelado,
      conteudo: textoRemodelado,
      autor: "Agente IA / Redação Voz Verídica",
      fonteOriginal: rawData.fonte,
      data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      imagem: rawData.imagem || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      destaque: false
    };
  }
}

module.exports = new NewsCuratorAgent();
