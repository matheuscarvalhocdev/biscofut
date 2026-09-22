import Image from "next/image";
import Link from "next/link";
import Headline from "./Headline";
import { produtosElegiveis } from "@/lib/numeroDaSorte";

export default function EligibleProducts() {
  return (
    <section id="produtos" className="border-t border-line bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="eyebrow">Produtos participantes</p>
        <Headline
          lead="Quanto maior o produto,"
          emphasis="mais números da sorte você recebe."
          className="mt-4 max-w-2xl text-3xl sm:text-4xl"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtosElegiveis.map((produto) => (
            <Link
              key={produto.sku}
              href={`/produtos/${produto.slug}`}
              className="card group flex flex-col items-start gap-5 p-6 transition-colors hover:bg-sky/15 sm:flex-row sm:items-center sm:gap-7 sm:p-8"
            >
              <Image
                src={produto.imagem}
                alt={`Embalagem do produto ${produto.nome}`}
                width={produto.imagemLargura}
                height={produto.imagemAltura}
                className="h-24 w-auto shrink-0 sm:h-28"
              />
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black uppercase tracking-headline">
                  {produto.nome}
                  <span
                    aria-hidden="true"
                    className="text-steel transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
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
            </Link>
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
