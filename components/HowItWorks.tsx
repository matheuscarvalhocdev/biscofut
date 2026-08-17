import Headline from "./Headline";
import { campaign } from "@/lib/campaign";

/**
 * Os quatro passos da mecânica "Compre e Concorra".
 *
 * Esta seção não é só marketing: o protocolo na SPA exige a descrição do
 * fluxo de cadastro e validação da LP. O texto aqui e o de FLUXO.md descrevem
 * o mesmo caminho, de propósito — o que o consumidor lê é o que foi
 * protocolado.
 */
const steps = [
  {
    n: "01",
    title: "Compre um produto participante",
    body: "Qualquer produto da linha Futi, em loja física ou no e-commerce. Guarde a nota fiscal ou o cupom — é ela que vale a participação.",
  },
  {
    n: "02",
    title: "Cadastre-se com seus dados",
    body: "Nome completo, CPF, e-mail e telefone. Uma vez só: nas próximas notas você entra com CPF e e-mail.",
  },
  {
    n: "03",
    title: "Informe a nota fiscal",
    body: "Digite a chave de acesso de 44 dígitos (está no rodapé do cupom, junto ao QR Code) e anexe a foto. A validação confirma emissor, data e produto.",
  },
  {
    n: "04",
    title: "Receba seus números da sorte",
    body: "Nota validada, os números aparecem na hora na sua área e chegam por e-mail. Produtos maiores valem mais números.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="como-participar"
      className="border-t border-line bg-paper py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="eyebrow">Como participar</p>
        <Headline
          lead="Comprou, cadastrou a nota,"
          emphasis="está concorrendo."
          className="mt-4 max-w-2xl text-3xl sm:text-4xl"
        />

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.n} className="bg-white p-7">
              <span className="text-3xl font-black leading-none text-sky-light">
                {step.n}
              </span>
              <h3 className="mt-5 text-base font-black uppercase leading-snug tracking-headline">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-7 max-w-prose text-sm leading-relaxed text-ink/60">
          A nota precisa ser cadastrada em até{" "}
          {campaign.regras.prazoCadastroNotaDias} dias da compra, e cada nota
          vale uma única vez. Cada CPF acumula no máximo{" "}
          {campaign.regras.maxNumerosPorCpf} números durante toda a promoção.
        </p>
      </div>
    </section>
  );
}
