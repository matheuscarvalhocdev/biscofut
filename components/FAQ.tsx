import Headline from "./Headline";
import { campaign, formatDate } from "@/lib/campaign";

const faq = [
  {
    q: "Preciso comprar para participar?",
    a: `Sim. Esta é uma promoção do tipo "compre e concorra": a participação depende da compra de um produto participante e do cadastro da nota fiscal correspondente.`,
  },
  {
    q: "Onde encontro a chave de acesso da nota?",
    a: "São 44 dígitos impressos no rodapé do cupom fiscal ou do DANFE, geralmente ao lado do QR Code. Em compras online, ela aparece no e-mail da nota fiscal eletrônica.",
  },
  {
    q: "Posso cadastrar a mesma nota duas vezes?",
    a: "Não. Cada nota fiscal vale uma única participação, mesmo que contenha vários produtos participantes — nesse caso os números são somados no cadastro único da nota.",
  },
  {
    q: "Quantos números da sorte posso acumular?",
    a: `Até ${campaign.regras.maxNumerosPorCpf} números por CPF durante toda a promoção. Ao atingir o limite, novas notas não geram números adicionais.`,
  },
  {
    q: "Tenho prazo para cadastrar a nota?",
    a: `Sim: até ${campaign.regras.prazoCadastroNotaDias} dias após a data da compra, e sempre dentro do período de participação da promoção.`,
  },
  {
    q: "Como é feito o sorteio?",
    a: `Pela extração da Loteria Federal da data de apuração (${formatDate(
      campaign.apuracao.data
    )}), com a regra de composição dos números descrita no regulamento. Não há sorteio interno nem escolha manual de ganhadores.`,
  },
  {
    q: "Preciso guardar a nota fiscal original?",
    a: "Sim, até o fim da promoção. Se você for contemplado, a nota original pode ser exigida como comprovação antes da entrega do prêmio.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="border-t border-line bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Dúvidas</p>
          <Headline
            lead="O que mais"
            emphasis="perguntam."
            className="mt-4 text-3xl sm:text-4xl"
          />
          <p className="mt-6 leading-relaxed text-ink/70">
            Não achou sua dúvida? Escreva para{" "}
            <a
              href={`mailto:${campaign.contato.email}`}
              className="font-black text-navy underline underline-offset-2"
            >
              {campaign.contato.email}
            </a>
            . Em caso de divergência, o regulamento protocolado prevalece sobre
            esta página.
          </p>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer items-start justify-between gap-5 text-base font-black text-navy [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-steel transition-transform group-open:rotate-45"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 2v12M2 8h12" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-prose pr-4 text-sm leading-relaxed text-ink/70 sm:pr-10">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
