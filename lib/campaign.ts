/**
 * Fonte única de verdade dos dados da campanha.
 *
 * Tudo que o jurídico precisa preencher antes do protocolo na SPA/MF está
 * aqui — e só aqui. Nenhum texto de prêmio, data, limite ou número de
 * certificado deve ser escrito direto num componente: se estiver em dois
 * lugares, um dia os dois vão divergir, e divergência entre a LP e o
 * regulamento protocolado é problema de conformidade, não de código.
 *
 * Campos marcados com PENDENTE renderizam um placeholder visível na tela,
 * de propósito: é melhor a página gritar "falta preencher" do que publicar
 * uma data inventada.
 */

export const PENDENTE = "[A CONFIRMAR]" as const;

export const campaign = {
  nome: "Promoção Futi",
  marcas: {
    promotora: "Biscoitê",
    embaixador: "Neymar Jr.",
  },

  /** Certificado de Autorização emitido pela SPA/MF. */
  certificado: {
    /** Preencher com o nº do CA assim que emitido. Ex.: "04.123456/2026". */
    numero: null as string | null,
    /** URL do PDF do CA hospedado. Obrigatório exibir na LP após a emissão. */
    pdf: null as string | null,
  },

  /** Vigência da participação. Formato ISO (AAAA-MM-DD) ou null. */
  vigencia: {
    inicio: null as string | null,
    fim: null as string | null,
  },

  /** Data da apuração, com base na extração da Loteria Federal. */
  apuracao: {
    data: null as string | null,
    /** Extração da Loteria Federal usada como base do sorteio. */
    baseLoteriaFederal: true,
  },

  premios: {
    /** Prêmio principal, já definido no briefing. */
    itensAutografados: {
      quantidade: 50,
      descricao: "camiseta oficial autografada pelo Neymar Jr.",
      /** Valor unitário declarado no protocolo. */
      valorUnitario: null as number | null,
    },
    /**
     * O briefing trata o encontro como "possível". Enquanto não estiver no
     * CA, ele NÃO pode ser anunciado como prêmio — a LP mostra como
     * "em estudo", sem promessa. Virar `true` só depois da autorização.
     */
    encontro: {
      confirmado: false,
      descricao: "encontro com o Neymar Jr.",
    },
  },

  regras: {
    idadeMinima: 18,
    /** Teto de números da sorte por CPF em toda a campanha. */
    maxNumerosPorCpf: 200,
    /** Uma nota fiscal só pode ser cadastrada uma vez, por qualquer CPF. */
    notaFiscalUnica: true,
    /** Prazo para cadastrar a nota após a compra, em dias. */
    prazoCadastroNotaDias: 30,
  },

  documentos: {
    regulamento: "/regulamento",
    privacidade: "/politica-de-privacidade",
    termos: "/termos-de-uso",
  },

  contato: {
    email: "promocaofuti@biscoite.com.br",
    /** Canal de atendimento ao consumidor exigido no regulamento. */
    sacTelefone: PENDENTE,
  },

  legal: {
    lei: "Lei nº 5.768/1971",
    decreto: "Decreto nº 70.951/1972",
    orgao: "Secretaria de Prêmios e Apostas (SPA/MF)",
  },
} as const;

/** Formata uma data ISO para pt-BR, ou devolve o placeholder. */
export function formatDate(iso: string | null): string {
  if (!iso) return PENDENTE;
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

/** Texto do rodapé legal, montado a partir do que já está preenchido. */
export function legalFooterText(): string {
  const ca = campaign.certificado.numero
    ? `Certificado de Autorização SPA/MF nº ${campaign.certificado.numero}.`
    : "Certificado de Autorização SPA/MF: aguardando emissão.";

  return `${ca} Promoção comercial regida pela ${campaign.legal.lei} e pelo ${campaign.legal.decreto}, sob regulação da ${campaign.legal.orgao}. Participação exclusiva para pessoas físicas maiores de ${campaign.regras.idadeMinima} anos residentes no Brasil, mediante compra de produtos participantes. Imagens meramente ilustrativas.`;
}
