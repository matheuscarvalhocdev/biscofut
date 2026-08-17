import { campaign } from "./campaign";

/**
 * Geração de números da sorte.
 *
 * Regra do briefing: "a cada compra validada, o sistema deve gerar um número
 * da sorte". Aqui isso é modelado como peso por produto — produtos maiores
 * dão mais números —, porque é assim que o regulamento vai declarar.
 *
 * Duas coisas que o front-end NÃO faz, e não deve fazer:
 *
 * 1. Emitir o número. A série é sequencial e única na campanha inteira;
 *    dois navegadores pedindo ao mesmo tempo emitiriam o mesmo número. Só o
 *    banco, com unicidade transacional, pode atribuir. As funções aqui
 *    calculam *quantos* números a compra rende e formatam para exibição.
 * 2. Sortear. A apuração é vinculada à extração da Loteria Federal, como
 *    manda o Decreto 70.951/72 — não é `Math.random()`. Ver sorteio() abaixo.
 */

export type ProdutoElegivel = {
  sku: string;
  nome: string;
  descricao: string;
  /** Números da sorte concedidos por unidade comprada. */
  numerosPorUnidade: number;
  imagem: string;
  imagemLargura: number;
  imagemAltura: number;
};

/**
 * Pesos preliminares — precisam bater exatamente com o regulamento
 * protocolado. Alterar aqui e no regulamento ao mesmo tempo, nunca só aqui.
 */
export const produtosElegiveis: ProdutoElegivel[] = [
  {
    sku: "FUTI-COL",
    nome: "Futi Collection",
    descricao:
      "Blind box com bonequinho colecionável, biscoitos temáticos e bolinha de brinde.",
    numerosPorUnidade: 3,
    imagem: "/images/futi-collection-box.png",
    imagemLargura: 180,
    imagemAltura: 293,
  },
  {
    sku: "FUTI-ARE",
    nome: "Futi Arena",
    descricao:
      "O set completo: 2 bonequinhos, 2 bolinhas, mini campo e kit de acessórios.",
    numerosPorUnidade: 5,
    imagem: "/images/futi-arena-box.png",
    imagemLargura: 300,
    imagemAltura: 295,
  },
];

export type ItemCompra = { sku: string; quantidade: number };

/** Quantos números a nota rende, antes do teto por CPF. */
export function calcularNumeros(itens: ItemCompra[]): number {
  return itens.reduce((total, item) => {
    const produto = produtosElegiveis.find((p) => p.sku === item.sku);
    if (!produto) return total;
    return total + produto.numerosPorUnidade * Math.max(0, item.quantidade);
  }, 0);
}

/**
 * Aplica o teto por CPF. Devolve o que será concedido e o que foi cortado —
 * o participante tem que ver o corte na tela, não descobrir depois.
 */
export function aplicarTeto(
  numerosSolicitados: number,
  jaAcumulados: number
): { concedidos: number; excedente: number; restanteApos: number } {
  const teto = campaign.regras.maxNumerosPorCpf;
  const espaco = Math.max(0, teto - jaAcumulados);
  const concedidos = Math.min(numerosSolicitados, espaco);

  return {
    concedidos,
    excedente: numerosSolicitados - concedidos,
    restanteApos: teto - jaAcumulados - concedidos,
  };
}

/** Formato de exibição do número da sorte: 6 dígitos, com zeros à esquerda. */
export function formatNumeroDaSorte(sequencial: number): string {
  return String(sequencial).padStart(6, "0");
}

/**
 * Apuração — documentado aqui porque o fluxo precisa constar no protocolo.
 *
 * O número contemplado NÃO é aleatório: ele é derivado dos prêmios da
 * extração da Loteria Federal da data de apuração, pela regra clássica de
 * composição (unidade→dezena de milhar de cada um dos 5 prêmios). Se o
 * número resultante não tiver sido distribuído, aplica-se a regra de
 * aproximação declarada no regulamento (número imediatamente superior e,
 * na falta, imediatamente inferior).
 *
 * Implementação real fica no backend, com os resultados oficiais como
 * entrada auditável. A assinatura abaixo existe para fixar o contrato.
 */
export function numeroContempladoPorLoteriaFederal(
  premios: [string, string, string, string, string]
): string {
  // Um dígito de cada prêmio, do 1º ao 5º, lendo a unidade de cada um.
  return premios.map((premio) => premio.replace(/\D/g, "").slice(-1)).join("");
}
