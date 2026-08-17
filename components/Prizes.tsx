import Headline from "./Headline";
import { campaign, PENDENTE } from "@/lib/campaign";

export default function Prizes() {
  const { itensAutografados } = campaign.premios;

  return (
    <section id="premios" className="border-t border-line bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="eyebrow">Prêmios</p>
        <Headline
          lead="São 50 chances de levar algo"
          emphasis="assinado pela mão dele."
          className="mt-4 max-w-2xl text-3xl sm:text-4xl"
        />

        <div className="mt-14">
          <article className="card p-8 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-full bg-sky px-3.5 py-1.5 text-[10px] font-black uppercase tracking-label text-navy">
                Prêmio principal
              </span>
              <span className="text-5xl font-black leading-none text-navy sm:text-6xl">
                {itensAutografados.quantidade}
              </span>
            </div>

            <h3 className="mt-7 text-2xl font-black uppercase leading-tight tracking-headline">
              Camiseta oficial autografada pelo Neymar Jr.
            </h3>
            <p className="mt-4 max-w-prose leading-relaxed text-ink/70">
              Cinquenta unidades, cada uma assinada individualmente e entregue
              com certificado de autenticidade. Um item por contemplado.
            </p>

            <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-line pt-7 sm:grid-cols-2">
              <Spec term="Quantidade" value={`${itensAutografados.quantidade} unidades`} />
              <Spec
                term="Valor unitário declarado"
                value={
                  itensAutografados.valorUnitario
                    ? itensAutografados.valorUnitario.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : PENDENTE
                }
              />
              <Spec term="Forma de apuração" value="Extração da Loteria Federal" />
              <Spec term="Entrega" value="Frete por conta da promotora, em todo o Brasil" />
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}

function Spec({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-black uppercase tracking-label text-steel">
        {term}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink/80">{value}</dd>
    </div>
  );
}
