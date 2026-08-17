import { NextResponse } from "next/server";
import { campaign } from "@/lib/campaign";
import { transactionsAllowed } from "@/lib/promoStatus";
import { ageOn, isValidCPF, isValidEmail, isValidFullName, isValidPhone } from "@/lib/masks";
import {
  isEmissaoDentroDaJanela,
  isValidChaveAcesso,
  onlyDigits,
  parseChaveAcesso,
} from "@/lib/notaFiscal";
import {
  aplicarTeto,
  calcularNumeros,
  formatNumeroDaSorte,
  produtosElegiveis,
  type ItemCompra,
} from "@/lib/numeroDaSorte";

/**
 * Registro de participação — cadastro + validação de nota + emissão dos
 * números da sorte.
 *
 * Por que revalidar tudo aqui, se o formulário já validou? Porque o
 * formulário é sugestão e o servidor é a autoridade. Qualquer pessoa pode
 * chamar este endpoint direto, sem passar pela tela. Numa promoção
 * autorizada pela SPA, aceitar um cadastro que o regulamento proíbe não é
 * bug de UX — é descumprimento do que foi protocolado.
 *
 * ⚠️  PERSISTÊNCIA É UM STUB. O `store` abaixo é um Map em memória: ele morre
 *     a cada reinício e não é compartilhado entre instâncias. Serve para
 *     demonstrar o fluxo completo e provar que as regras funcionam. O que
 *     precisa entrar no lugar, antes de ir ao ar, está em FLUXO.md §6 —
 *     resumindo: banco com UNIQUE em (chave_acesso), UNIQUE em
 *     (numero_da_sorte) e emissão dos números dentro de uma transação, senão
 *     dois pedidos simultâneos recebem o mesmo número.
 */

type Payload = {
  participante?: {
    nome?: string;
    cpf?: string;
    nascimento?: string;
    email?: string;
    telefone?: string;
  };
  consentimentos?: {
    regulamento?: boolean;
    privacidade?: boolean;
    comunicacoes?: boolean;
  };
  nota?: {
    chaveAcesso?: string;
    itens?: ItemCompra[];
    /** Chave do cupom no object storage, devolvida pelo upload assinado. */
    cupomKey?: string | null;
  };
};

type FieldError = { campo: string; mensagem: string };

// --- stub de persistência ---------------------------------------------------
const store = {
  /** chave de acesso já usada -> CPF que a cadastrou */
  notas: new Map<string, string>(),
  /** CPF -> números já acumulados */
  acumulado: new Map<string, number>(),
  /** próximo sequencial da série */
  proximoSequencial: 1,
};
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // Primeiro portão, antes de olhar o corpo: sem CA registrado, não existe
  // participação válida — nem para gravar, nem para responder.
  if (!transactionsAllowed()) {
    return NextResponse.json(
      {
        ok: false,
        mensagem:
          "A promoção ainda não está autorizada. O cadastro será liberado após a emissão do Certificado de Autorização pela SPA/MF.",
      },
      { status: 503 }
    );
  }

  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, mensagem: "Requisição inválida." },
      { status: 400 }
    );
  }

  const erros: FieldError[] = [
    ...validarParticipante(body.participante),
    ...validarConsentimentos(body.consentimentos),
    ...validarNota(body.nota),
  ];

  if (erros.length > 0) {
    return NextResponse.json({ ok: false, erros }, { status: 422 });
  }

  const cpf = onlyDigits(body.participante!.cpf!);
  const chave = onlyDigits(body.nota!.chaveAcesso!);
  const itens = body.nota!.itens!;

  // Nota já cadastrada — por este CPF ou por outro.
  if (campaign.regras.notaFiscalUnica && store.notas.has(chave)) {
    const mesmoDono = store.notas.get(chave) === cpf;
    return NextResponse.json(
      {
        ok: false,
        erros: [
          {
            campo: "chaveAcesso",
            mensagem: mesmoDono
              ? "Você já cadastrou esta nota fiscal."
              : "Esta nota fiscal já foi utilizada em outra participação.",
          },
        ],
      },
      { status: 409 }
    );
  }

  const solicitados = calcularNumeros(itens);
  const jaAcumulados = store.acumulado.get(cpf) ?? 0;
  const { concedidos, excedente, restanteApos } = aplicarTeto(solicitados, jaAcumulados);

  if (concedidos === 0) {
    return NextResponse.json(
      {
        ok: false,
        erros: [
          {
            campo: "itens",
            mensagem: `Você já atingiu o limite de ${campaign.regras.maxNumerosPorCpf} números da sorte por CPF.`,
          },
        ],
      },
      { status: 409 }
    );
  }

  // Numa implementação real, daqui até o commit é UMA transação. Emitir os
  // números fora de transação é o caminho mais curto para número duplicado.
  const numeros: string[] = [];
  for (let i = 0; i < concedidos; i++) {
    numeros.push(formatNumeroDaSorte(store.proximoSequencial++));
  }
  store.notas.set(chave, cpf);
  store.acumulado.set(cpf, jaAcumulados + concedidos);

  return NextResponse.json({
    ok: true,
    numeros,
    acumulado: jaAcumulados + concedidos,
    restante: restanteApos,
    excedente,
    nota: parseChaveAcesso(chave),
    aviso:
      excedente > 0
        ? `${excedente} número(s) não foram concedidos por causa do limite de ${campaign.regras.maxNumerosPorCpf} por CPF.`
        : null,
  });
}

function validarParticipante(p: Payload["participante"]): FieldError[] {
  const erros: FieldError[] = [];
  if (!p) return [{ campo: "participante", mensagem: "Dados do participante ausentes." }];

  if (!isValidFullName(p.nome ?? "")) {
    erros.push({ campo: "nome", mensagem: "Informe seu nome completo." });
  }
  if (!isValidCPF(p.cpf ?? "")) {
    erros.push({ campo: "cpf", mensagem: "CPF inválido." });
  }
  if (!isValidEmail(p.email ?? "")) {
    erros.push({ campo: "email", mensagem: "E-mail inválido." });
  }
  if (!isValidPhone(p.telefone ?? "")) {
    erros.push({ campo: "telefone", mensagem: "Telefone inválido — inclua o DDD." });
  }

  const idade = ageOn(p.nascimento ?? "", new Date());
  if (Number.isNaN(idade)) {
    erros.push({ campo: "nascimento", mensagem: "Informe sua data de nascimento." });
  } else if (idade < campaign.regras.idadeMinima) {
    erros.push({
      campo: "nascimento",
      mensagem: `A participação é restrita a maiores de ${campaign.regras.idadeMinima} anos.`,
    });
  }

  return erros;
}

function validarConsentimentos(c: Payload["consentimentos"]): FieldError[] {
  const erros: FieldError[] = [];
  if (!c?.regulamento) {
    erros.push({ campo: "regulamento", mensagem: "É necessário aceitar o regulamento." });
  }
  if (!c?.privacidade) {
    erros.push({
      campo: "privacidade",
      mensagem: "É necessário concordar com o tratamento dos dados para participar.",
    });
  }
  // `comunicacoes` é opcional de propósito: sob a LGPD, consentimento para
  // marketing tem que ser separado e não pode ser condição de participação.
  return erros;
}

function validarNota(n: Payload["nota"]): FieldError[] {
  const erros: FieldError[] = [];
  if (!n) return [{ campo: "nota", mensagem: "Dados da nota fiscal ausentes." }];

  if (!isValidChaveAcesso(n.chaveAcesso ?? "")) {
    erros.push({
      campo: "chaveAcesso",
      mensagem: "Chave de acesso inválida — confira os 44 dígitos do cupom.",
    });
  } else {
    const chave = parseChaveAcesso(n.chaveAcesso!)!;
    if (!isEmissaoDentroDaJanela(chave, campaign.vigencia.inicio, new Date())) {
      erros.push({
        campo: "chaveAcesso",
        mensagem: "A data de emissão desta nota está fora do período da promoção.",
      });
    }
  }

  const itens = n.itens ?? [];
  const skusValidos = new Set(produtosElegiveis.map((p) => p.sku));
  const temItemValido = itens.some(
    (item) => skusValidos.has(item.sku) && item.quantidade > 0
  );
  if (!temItemValido) {
    erros.push({
      campo: "itens",
      mensagem: "Informe pelo menos um produto participante da nota.",
    });
  }

  if (!n.cupomKey) {
    erros.push({
      campo: "cupom",
      mensagem: "Anexe a imagem da nota fiscal ou do cupom.",
    });
  }

  return erros;
}
