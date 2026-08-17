import Image from "next/image";
import Headline from "./Headline";
import { produtosElegiveis } from "@/lib/numeroDaSorte";

export default function EligibleProducts() {
  return (
    <section id="produtos" className="border-t border-line bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="eyebrow">Produtos participantes</p>
        <Headline
          lead="Cada produto vale"
          emphasis="uma quantidade de números."
          className="mt-4 max-w-2xl text-3xl sm:text-4xl"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {produtosElegiveis.map((produto) => (
            <article
              key={produto.sku}
              className="card flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:gap-7 sm:p-8"
            >
              <Image
                src={produto.imagem}
                alt={`Embalagem do produto ${produto.nome}`}
                width={produto.imagemLargura}
                height={produto.imagemAltura}
                className="h-24 w-auto shrink-0 sm:h-28"
              />
              <div>
                <h3 className="text-lg font-black uppercase tracking-headline">
                  {produto.nome}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {produto.descricao}
                </p>
                <p className="mt-4 inline-flex items-baseline gap-1.5 rounded-full bg-sky px-3.5 py-1.5 text-navy">
                  <span className="text-base font-black">
                    {produto.numerosPorUnidade}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-label">
                    números / unidade
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink/50">
          Pesos preliminares. Os valores finais são os declarados no
          regulamento protocolado na SPA/MF e prevalecem sobre esta página.
        </p>
      </div>
    </section>
  );
}
