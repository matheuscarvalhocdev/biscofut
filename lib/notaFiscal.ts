/**
 * Validação da nota fiscal — a "validação de compra" exigida pelo briefing.
 *
 * A escolha de design aqui importa para o protocolo na SPA: em vez de pedir
 * ao consumidor que digite número, série, CNPJ, data e valor separadamente
 * (cinco campos, cinco chances de errar), pedimos **uma coisa só**: a chave
 * de acesso de 44 dígitos, impressa em todo DANFE/NFC-e e legível pelo
 * QR Code do cupom.
 *
 * Isso funciona porque a chave não é um identificador opaco — ela é
 * estruturada. Dos 44 dígitos dá para extrair, sem nenhuma consulta externa,
 * o CNPJ do emitente, o mês/ano da emissão, a série e o número da nota. E o
 * 44º dígito é um verificador módulo 11, então uma chave digitada errado é
 * rejeitada na hora, no navegador.
 *
 * Layout dos 44 dígitos (padrão SEFAZ):
 *   cUF(2) AAMM(4) CNPJ(14) mod(2) serie(3) nNF(9) tpEmis(1) cNF(8) cDV(1)
 *
 * Importante: isto valida a *forma* da chave. Confirmar que a nota existe,
 * que é de um estabelecimento participante e que contém produto elegível é
 * responsabilidade do backend (consulta SEFAZ ou conferência do cupom
 * enviado). O front-end só evita que erro de digitação chegue ao servidor.
 */

export const CHAVE_LENGTH = 44;

/** Agrupa em blocos de 4 para a digitação ficar conferível a olho. */
export function formatChaveAcesso(value: string): string {
  const digits = onlyDigits(value).slice(0, CHAVE_LENGTH);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Dígito verificador da chave: módulo 11 com pesos ciclando de 2 a 9,
 * da direita para a esquerda sobre os 43 primeiros dígitos.
 */
export function chaveCheckDigit(first43: string): number {
  let sum = 0;
  let weight = 2;

  for (let i = first43.length - 1; i >= 0; i--) {
    sum += Number(first43[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  const dv = 11 - (sum % 11);
  return dv >= 10 ? 0 : dv;
}

export function isValidChaveAcesso(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== CHAVE_LENGTH) return false;
  // Uma chave só de zeros passaria no módulo 11; barra explicitamente.
  if (/^0+$/.test(digits)) return false;

  return chaveCheckDigit(digits.slice(0, 43)) === Number(digits[43]);
}

export type ChaveAcesso = {
  uf: string;
  /** Ano/mês de emissão, já em AAAA-MM. */
  emissao: string;
  cnpjEmitente: string;
  modelo: string;
  serie: string;
  numero: string;
};

/** Quebra a chave nos campos que o backend precisa registrar. */
export function parseChaveAcesso(value: string): ChaveAcesso | null {
  const d = onlyDigits(value);
  if (!isValidChaveAcesso(d)) return null;

  const aa = d.slice(2, 4);
  const mm = d.slice(4, 6);

  return {
    uf: UF_BY_CODE[d.slice(0, 2)] ?? d.slice(0, 2),
    emissao: `20${aa}-${mm}`,
    cnpjEmitente: formatCNPJ(d.slice(6, 20)),
    modelo: d.slice(20, 22),
    serie: d.slice(22, 25),
    numero: String(Number(d.slice(25, 34))),
  };
}

export function formatCNPJ(digits: string): string {
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

/**
 * A nota precisa ser recente: o briefing prevê janela de cadastro, e aceitar
 * cupom de dois anos atrás abriria a promoção para compras feitas antes da
 * vigência. Compara só ano/mês porque é o que a chave carrega.
 */
export function isEmissaoDentroDaJanela(
  chave: ChaveAcesso,
  vigenciaInicio: string | null,
  hoje: Date
): boolean {
  const atual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  if (chave.emissao > atual) return false; // nota "do futuro"
  if (vigenciaInicio && chave.emissao < vigenciaInicio.slice(0, 7)) return false;
  return true;
}

const UF_BY_CODE: Record<string, string> = {
  "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA", "16": "AP",
  "17": "TO", "21": "MA", "22": "PI", "23": "CE", "24": "RN", "25": "PB",
  "26": "PE", "27": "AL", "28": "SE", "29": "BA", "31": "MG", "32": "ES",
  "33": "RJ", "35": "SP", "41": "PR", "42": "SC", "43": "RS", "50": "MS",
  "51": "MT", "52": "GO", "53": "DF",
};

/** Regras do upload do cupom — espelhadas no servidor. */
export const UPLOAD_RULES = {
  accept: ["image/jpeg", "image/png", "application/pdf"],
  acceptAttr: "image/jpeg,image/png,application/pdf",
  maxBytes: 5 * 1024 * 1024,
  maxLabel: "5 MB",
};

export function validateUpload(file: File): string | null {
  if (!UPLOAD_RULES.accept.includes(file.type)) {
    return "Envie o cupom em JPG, PNG ou PDF.";
  }
  if (file.size > UPLOAD_RULES.maxBytes) {
    return `Arquivo muito grande — o limite é ${UPLOAD_RULES.maxLabel}.`;
  }
  return null;
}
