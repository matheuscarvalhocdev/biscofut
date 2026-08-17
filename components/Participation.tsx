"use client";

import { useMemo, useState, type FormEvent } from "react";
import Headline from "./Headline";
import { Checkbox, Field, Input } from "./ui/Field";
import { campaign } from "@/lib/campaign";
import { PROMO_STATUS, transactionsAllowed, type PromoStatus } from "@/lib/promoStatus";
import {
  ageOn,
  formatCPF,
  formatPhone,
  isValidCPF,
  isValidEmail,
  isValidFullName,
  isValidPhone,
} from "@/lib/masks";
import {
  CHAVE_LENGTH,
  UPLOAD_RULES,
  formatChaveAcesso,
  isValidChaveAcesso,
  onlyDigits,
  parseChaveAcesso,
  validateUpload,
} from "@/lib/notaFiscal";
import {
  aplicarTeto,
  calcularNumeros,
  produtosElegiveis,
} from "@/lib/numeroDaSorte";

/**
 * Fluxo de participação em três passos.
 *
 * A divisão em passos é deliberada, e é o argumento central do desenho: o
 * consumidor está com o cupom na mão e o celular na outra. Pedir dez campos
 * numa tela só é a forma mais eficiente de perder a participação no meio.
 *
 *   1. Quem é você        — nome, CPF, nascimento, e-mail, telefone + aceites
 *   2. Qual foi a compra  — chave de acesso da nota, produtos, foto do cupom
 *   3. Seus números       — confirmação e números da sorte emitidos
 *
 * Cada passo valida ao avançar, não ao enviar: o erro aparece a três campos
 * de distância de onde foi cometido, não a dez.
 */

type Step = 1 | 2 | 3;
type Errors = Record<string, string>;

type Emissao = {
  numeros: string[];
  acumulado: number;
  restante: number;
  excedente: number;
};

export default function Participation() {
  // Em desenvolvimento é possível pré-visualizar os dois estados da página.
  // Em produção o status vem do backend e este seletor não existe.
  const [previewStatus, setPreviewStatus] = useState<PromoStatus>(PROMO_STATUS);
  const isDev = process.env.NODE_ENV !== "production";
  const aberto = isDev
    ? previewStatus === "ACTIVE"
    : transactionsAllowed(previewStatus);

  return (
    <section id="participar" className="border-t border-line bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="eyebrow">Participar</p>
        <Headline
          lead="Cadastre sua nota e"
          emphasis="receba seus números."
          className="mt-4 max-w-2xl text-3xl sm:text-4xl"
        />

        {isDev && (
          <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-line bg-white p-1 text-xs">
            <span className="px-3 font-black uppercase tracking-label text-ink/40">
              Prévia
            </span>
            {(["PRE_LAUNCH", "ACTIVE"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setPreviewStatus(status)}
                aria-pressed={previewStatus === status}
                className={`rounded-full px-4 py-2 font-medium transition-colors ${
                  previewStatus === status
                    ? "bg-navy text-white"
                    : "text-ink/55 hover:text-navy"
                }`}
              >
                {status === "PRE_LAUNCH" ? "Antes do CA" : "Depois do CA"}
              </button>
            ))}
          </div>
        )}

        <div className="mt-12">
          {aberto ? <ParticipationForm /> : <PreLaunchNotice />}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Estado pré-autorização                                                     */
/* -------------------------------------------------------------------------- */

function PreLaunchNotice() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErro("Digite um e-mail válido.");
      return;
    }
    setErro("");
    setEnviado(true);
  }

  return (
    <div className="card mx-auto max-w-2xl p-8 sm:p-12">
      <h3 className="text-xl font-black uppercase tracking-headline">
        O cadastro abre depois da autorização
      </h3>
      <p className="mt-4 leading-relaxed text-ink/70">
        Esta é uma promoção comercial regida pela {campaign.legal.lei} e pelo{" "}
        {campaign.legal.decreto}. Ela não pode começar antes da autorização
        prévia da {campaign.legal.orgao} — por isso o formulário de
        participação está desligado, e não apenas escondido.
      </p>
      <p className="mt-4 leading-relaxed text-ink/70">
        Deixe seu e-mail para ser avisado no dia em que o cadastro abrir.
        Isso <strong className="font-black text-navy">não é</strong> uma
        inscrição na promoção e não gera número da sorte.
      </p>

      {enviado ? (
        <p className="mt-8 rounded-xl bg-sky px-5 py-4 text-sm font-medium text-navy">
          Pronto — avisaremos assim que o cadastro abrir.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row" noValidate>
          <div className="flex-1">
            <label htmlFor="aviso-email" className="sr-only">
              Seu e-mail
            </label>
            <Input
              id="aviso-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              error={erro}
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Quero ser avisado
          </button>
        </form>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Formulário                                                                 */
/* -------------------------------------------------------------------------- */

const stepLabels = ["Seus dados", "Sua nota fiscal", "Seus números"];

function ParticipationForm() {
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [emissao, setEmissao] = useState<Emissao | null>(null);

  const [dados, setDados] = useState({
    nome: "",
    cpf: "",
    nascimento: "",
    email: "",
    telefone: "",
  });
  const [aceites, setAceites] = useState({
    regulamento: false,
    privacidade: false,
    comunicacoes: false,
  });
  const [nota, setNota] = useState({ chaveAcesso: "", cupom: null as File | null });
  const [quantidades, setQuantidades] = useState<Record<string, number>>(
    Object.fromEntries(produtosElegiveis.map((p) => [p.sku, 0]))
  );

  const itens = useMemo(
    () =>
      Object.entries(quantidades)
        .filter(([, quantidade]) => quantidade > 0)
        .map(([sku, quantidade]) => ({ sku, quantidade })),
    [quantidades]
  );

  const numerosPrevistos = calcularNumeros(itens);
  const chaveInfo = parseChaveAcesso(nota.chaveAcesso);

  function validarPasso1(): Errors {
    const e: Errors = {};
    if (!isValidFullName(dados.nome)) e.nome = "Informe seu nome completo.";
    if (!isValidCPF(dados.cpf)) e.cpf = "CPF inválido.";
    if (!isValidEmail(dados.email)) e.email = "E-mail inválido.";
    if (!isValidPhone(dados.telefone)) e.telefone = "Telefone inválido — inclua o DDD.";

    const idade = ageOn(dados.nascimento, new Date());
    if (!dados.nascimento || Number.isNaN(idade)) {
      e.nascimento = "Informe sua data de nascimento.";
    } else if (idade < campaign.regras.idadeMinima) {
      e.nascimento = `A promoção é restrita a maiores de ${campaign.regras.idadeMinima} anos.`;
    }

    if (!aceites.regulamento) e.regulamento = "É necessário aceitar o regulamento.";
    if (!aceites.privacidade)
      e.privacidade = "É necessário concordar com o tratamento dos dados.";
    return e;
  }

  function validarPasso2(): Errors {
    const e: Errors = {};
    const digitos = onlyDigits(nota.chaveAcesso);
    if (digitos.length !== CHAVE_LENGTH) {
      e.chaveAcesso = `A chave tem ${CHAVE_LENGTH} dígitos — você digitou ${digitos.length}.`;
    } else if (!isValidChaveAcesso(digitos)) {
      e.chaveAcesso = "Chave inválida. Confira os dígitos: algum saiu trocado.";
    }
    if (itens.length === 0) e.itens = "Informe pelo menos um produto da nota.";
    if (!nota.cupom) e.cupom = "Anexe a foto ou o PDF do cupom.";
    return e;
  }

  function avancar() {
    const e = validarPasso1();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep(2);
      setErroGeral("");
    }
  }

  async function enviar(event: FormEvent) {
    event.preventDefault();
    const e = validarPasso2();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setEnviando(true);
    setErroGeral("");

    try {
      const response = await fetch("/api/participacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participante: dados,
          consentimentos: aceites,
          nota: {
            chaveAcesso: onlyDigits(nota.chaveAcesso),
            itens,
            // Em produção o arquivo vai direto para o object storage por URL
            // assinada, e o que chega aqui é a chave devolvida pelo upload —
            // o servidor da aplicação nunca recebe o binário. Ver FLUXO.md §5.
            cupomKey: nota.cupom ? `upload-pendente/${nota.cupom.name}` : null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.erros)) {
          const mapeados: Errors = {};
          for (const erro of data.erros) mapeados[erro.campo] = erro.mensagem;
          setErrors(mapeados);
          // Erro de dado pessoal volta para o passo onde ele foi digitado.
          if (["nome", "cpf", "nascimento", "email", "telefone"].some((k) => k in mapeados)) {
            setStep(1);
          }
        } else {
          setErroGeral(data.mensagem ?? "Não foi possível registrar sua participação.");
        }
        return;
      }

      setEmissao({
        numeros: data.numeros,
        acumulado: data.acumulado,
        restante: data.restante,
        excedente: data.excedente,
      });
      setStep(3);
    } catch {
      setErroGeral("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      <div className="card p-6 sm:p-10">
        <Stepper current={step} />

        {erroGeral && (
          <p role="alert" className="mt-7 rounded-xl bg-alert/8 px-5 py-4 text-sm font-medium text-alert">
            {erroGeral}
          </p>
        )}

        {step === 1 && (
          <form
            className="mt-8 space-y-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              avancar();
            }}
          >
            <Field id="nome" label="Nome completo" error={errors.nome}>
              <Input
                id="nome"
                autoComplete="name"
                value={dados.nome}
                error={errors.nome}
                onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                placeholder="Como está no seu documento"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="cpf"
                label="CPF"
                error={errors.cpf}
                hint="Usado para identificar sua participação e o limite por pessoa."
              >
                <Input
                  id="cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={14}
                  value={dados.cpf}
                  error={errors.cpf}
                  hasHint
                  onChange={(e) => setDados({ ...dados, cpf: formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                />
              </Field>

              <Field id="nascimento" label="Data de nascimento" error={errors.nascimento}>
                <Input
                  id="nascimento"
                  type="date"
                  autoComplete="bday"
                  value={dados.nascimento}
                  error={errors.nascimento}
                  onChange={(e) => setDados({ ...dados, nascimento: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="email" label="E-mail" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={dados.email}
                  error={errors.email}
                  onChange={(e) => setDados({ ...dados, email: e.target.value })}
                  placeholder="seuemail@exemplo.com"
                />
              </Field>

              <Field id="telefone" label="Telefone com DDD" error={errors.telefone}>
                <Input
                  id="telefone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={15}
                  value={dados.telefone}
                  error={errors.telefone}
                  onChange={(e) => setDados({ ...dados, telefone: formatPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                />
              </Field>
            </div>

            <div className="space-y-4 border-t border-line pt-6">
              <Checkbox
                id="aceite-regulamento"
                checked={aceites.regulamento}
                onChange={(v) => setAceites({ ...aceites, regulamento: v })}
                error={errors.regulamento}
              >
                Li e aceito o{" "}
                <a
                  href={campaign.documentos.regulamento}
                  target="_blank"
                  rel="noreferrer"
                  className="font-black text-navy underline underline-offset-2"
                >
                  regulamento da promoção
                </a>{" "}
                e os{" "}
                <a
                  href={campaign.documentos.termos}
                  target="_blank"
                  rel="noreferrer"
                  className="font-black text-navy underline underline-offset-2"
                >
                  termos de uso
                </a>
                .
              </Checkbox>

              <Checkbox
                id="aceite-privacidade"
                checked={aceites.privacidade}
                onChange={(v) => setAceites({ ...aceites, privacidade: v })}
                error={errors.privacidade}
              >
                Concordo com o tratamento dos meus dados para participar da
                promoção, conforme a{" "}
                <a
                  href={campaign.documentos.privacidade}
                  target="_blank"
                  rel="noreferrer"
                  className="font-black text-navy underline underline-offset-2"
                >
                  Política de Privacidade
                </a>
                .
              </Checkbox>

              {/* Opt-in de marketing é separado e opcional de propósito: sob a
                  LGPD, não pode ser condição para participar. */}
              <Checkbox
                id="aceite-comunicacoes"
                checked={aceites.comunicacoes}
                onChange={(v) => setAceites({ ...aceites, comunicacoes: v })}
              >
                <span className="text-ink/60">
                  (Opcional) Quero receber novidades e ofertas da Biscoitê.
                </span>
              </Checkbox>
            </div>

            <button type="submit" className="btn-primary w-full">
              Continuar
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" noValidate onSubmit={enviar}>
            <Field
              id="chave"
              label="Chave de acesso da nota fiscal"
              error={errors.chaveAcesso}
              hint="São 44 dígitos, impressos no rodapé do cupom, ao lado do QR Code."
            >
              <Input
                id="chave"
                inputMode="numeric"
                autoComplete="off"
                value={formatChaveAcesso(nota.chaveAcesso)}
                error={errors.chaveAcesso}
                hasHint
                onChange={(e) => setNota({ ...nota, chaveAcesso: e.target.value })}
                placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
                className="font-mono tracking-wide"
              />
            </Field>

            {/* Devolver os dados extraídos da chave transforma 44 dígitos numa
                conferência de um segundo: o participante reconhece a loja e a
                data, ou percebe na hora que digitou a nota errada. */}
            {chaveInfo && (
              <dl className="grid gap-x-6 gap-y-4 rounded-xl bg-sky/45 p-5 sm:grid-cols-2">
                <p className="col-span-full text-[11px] font-black uppercase tracking-label text-navy">
                  Confirmado a partir da chave
                </p>
                <Read term="CNPJ do estabelecimento" value={chaveInfo.cnpjEmitente} />
                <Read term="Emissão" value={formatEmissao(chaveInfo.emissao)} />
                <Read term="Nota nº" value={`${chaveInfo.numero} / série ${chaveInfo.serie}`} />
                <Read term="UF" value={chaveInfo.uf} />
              </dl>
            )}

            <fieldset>
              <legend className="mb-3 text-[11px] font-black uppercase tracking-label text-steel">
                Produtos participantes nesta nota
              </legend>
              <div className="space-y-3">
                {produtosElegiveis.map((produto) => (
                  <div
                    key={produto.sku}
                    className="flex items-center gap-4 rounded-xl border border-line px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-ink">{produto.nome}</p>
                      <p className="text-xs text-ink/55">
                        {produto.numerosPorUnidade} números por unidade
                      </p>
                    </div>
                    <QuantityStepper
                      label={produto.nome}
                      value={quantidades[produto.sku]}
                      onChange={(v) =>
                        setQuantidades({ ...quantidades, [produto.sku]: v })
                      }
                    />
                  </div>
                ))}
              </div>
              {errors.itens && (
                <p role="alert" className="mt-2 text-xs font-medium text-alert">
                  {errors.itens}
                </p>
              )}
            </fieldset>

            <Field
              id="cupom"
              label="Foto ou PDF do cupom"
              error={errors.cupom}
              hint={`JPG, PNG ou PDF, até ${UPLOAD_RULES.maxLabel}. Precisa mostrar a chave de acesso e os produtos.`}
            >
              <input
                id="cupom"
                type="file"
                accept={UPLOAD_RULES.acceptAttr}
                aria-invalid={errors.cupom ? true : undefined}
                aria-describedby={errors.cupom ? "cupom-error" : "cupom-hint"}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  const erro = file ? validateUpload(file) : null;
                  setNota({ ...nota, cupom: erro ? null : file });
                  setErrors({ ...errors, cupom: erro ?? "" });
                }}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-label file:text-white"
              />
            </Field>

            {numerosPrevistos > 0 && (
              <p className="rounded-xl bg-navy px-5 py-4 text-sm font-medium text-white">
                Esta nota vale{" "}
                <strong className="font-black">{numerosPrevistos} números da sorte</strong>
                , sujeitos à validação.
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary sm:w-auto"
              >
                Voltar
              </button>
              <button type="submit" disabled={enviando} className="btn-primary flex-1">
                {enviando ? "Validando…" : "Gerar meus números"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && emissao && (
          <Confirmation emissao={emissao} onNovaNota={() => {
            setNota({ chaveAcesso: "", cupom: null });
            setQuantidades(Object.fromEntries(produtosElegiveis.map((p) => [p.sku, 0])));
            setErrors({});
            setEmissao(null);
            setStep(2);
          }} />
        )}
      </div>

      <SidePanel
        numerosPrevistos={numerosPrevistos}
        acumulado={emissao?.acumulado ?? 0}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Confirmation({
  emissao,
  onNovaNota,
}: {
  emissao: Emissao;
  onNovaNota: () => void;
}) {
  return (
    <div className="mt-8">
      <p className="text-[11px] font-black uppercase tracking-label text-steel">
        Participação registrada
      </p>
      <h3 className="mt-3 text-2xl font-black uppercase tracking-headline">
        {emissao.numeros.length === 1
          ? "Seu número da sorte"
          : `Seus ${emissao.numeros.length} números da sorte`}
      </h3>

      <ul className="mt-6 flex flex-wrap gap-2">
        {emissao.numeros.map((numero) => (
          <li
            key={numero}
            className="rounded-lg bg-navy px-3.5 py-2 font-mono text-sm font-black tracking-wider text-white"
          >
            {numero}
          </li>
        ))}
      </ul>

      {emissao.excedente > 0 && (
        <p className="mt-5 rounded-xl bg-alert/8 px-5 py-4 text-sm font-medium text-alert">
          {emissao.excedente} número(s) não foram concedidos: você atingiu o
          limite de {campaign.regras.maxNumerosPorCpf} números por CPF.
        </p>
      )}

      <p className="mt-6 leading-relaxed text-ink/70">
        Enviamos a confirmação por e-mail. Guarde a nota fiscal original — ela
        pode ser exigida na entrega do prêmio, como prevê o regulamento.
      </p>

      <dl className="mt-7 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
        <Read term="Total acumulado no seu CPF" value={`${emissao.acumulado} números`} />
        <Read term="Ainda pode acumular" value={`${emissao.restante} números`} />
      </dl>

      <button type="button" onClick={onNovaNota} className="btn-primary mt-8 w-full">
        Cadastrar outra nota
      </button>
    </div>
  );
}

function SidePanel({
  numerosPrevistos,
  acumulado,
}: {
  numerosPrevistos: number;
  acumulado: number;
}) {
  const teto = campaign.regras.maxNumerosPorCpf;
  const { restanteApos } = aplicarTeto(0, acumulado);
  const percentual = Math.min(100, Math.round((acumulado / teto) * 100));

  return (
    <aside className="rounded-2xl bg-ink p-7 text-white sm:p-8">
      <p className="text-[11px] font-black uppercase tracking-label text-sky">
        Sua participação
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 p-4">
          <dd className="text-3xl font-black leading-none">{acumulado}</dd>
          <dt className="mt-2 text-xs text-white/55">números emitidos</dt>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <dd className="text-3xl font-black leading-none text-sky">
            {numerosPrevistos}
          </dd>
          <dt className="mt-2 text-xs text-white/55">nesta nota</dt>
        </div>
      </dl>

      <div className="mt-4 rounded-xl bg-white/5 p-4">
        <p className="text-xs text-white/55">Limite por CPF</p>
        <div
          className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/15"
          role="progressbar"
          aria-valuenow={acumulado}
          aria-valuemin={0}
          aria-valuemax={teto}
          aria-label="Números da sorte acumulados no limite por CPF"
        >
          <div className="h-full rounded-full bg-sky" style={{ width: `${percentual}%` }} />
        </div>
        <p className="mt-2 text-xs text-white/45">
          {acumulado} de {teto} — restam {restanteApos}
        </p>
      </div>

      <ul className="mt-7 space-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
        <li>Uma nota fiscal vale uma única participação.</li>
        <li>
          Cadastre em até {campaign.regras.prazoCadastroNotaDias} dias após a
          compra.
        </li>
        <li>Guarde o cupom original até o fim da promoção.</li>
      </ul>

      <p className="mt-7 text-xs leading-relaxed text-white/40">
        Ambiente de demonstração: a persistência definitiva entra com o
        backend. Ver FLUXO.md.
      </p>
    </aside>
  );
}

/* --- auxiliares ----------------------------------------------------------- */

function Stepper({ current }: { current: Step }) {
  return (
    <ol className="flex items-center gap-3" aria-label="Etapas do cadastro">
      {stepLabels.map((label, index) => {
        const n = (index + 1) as Step;
        const state = n === current ? "atual" : n < current ? "concluida" : "pendente";

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                  state === "pendente"
                    ? "bg-line text-ink/40"
                    : "bg-navy text-white"
                }`}
                aria-current={state === "atual" ? "step" : undefined}
              >
                {state === "concluida" ? "✓" : n}
              </span>
              <span
                className={`mt-2 block truncate text-[11px] font-black uppercase tracking-label ${
                  state === "pendente" ? "text-ink/35" : "text-navy"
                }`}
              >
                {label}
              </span>
            </div>
            {index < stepLabels.length - 1 && (
              <span className="h-px flex-1 bg-line" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Contador de quantidade — botões grandes, porque isso é preenchido no celular. */
function QuantityStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        aria-label={`Remover uma unidade de ${label}`}
        className="h-9 w-9 rounded-full border border-line text-lg font-black text-navy transition-colors hover:border-navy disabled:text-ink/25 disabled:hover:border-line"
      >
        −
      </button>
      <span aria-live="polite" className="w-9 text-center text-sm font-black text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, value + 1))}
        aria-label={`Adicionar uma unidade de ${label}`}
        className="h-9 w-9 rounded-full border border-line text-lg font-black text-navy transition-colors hover:border-navy"
      >
        +
      </button>
    </div>
  );
}

function Read({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-black uppercase tracking-label text-steel">
        {term}
      </dt>
      <dd className="mt-1 text-sm font-black text-ink">{value}</dd>
    </div>
  );
}

function formatEmissao(aaaaMm: string): string {
  const [year, month] = aaaaMm.split("-");
  return `${month}/${year}`;
}

