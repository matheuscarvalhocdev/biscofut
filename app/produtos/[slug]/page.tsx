import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import CardFan from "@/components/CardFan";
import FutiCardRules from "@/components/FutiCardRules";
import FutiWordmark from "@/components/FutiWordmark";
import { campaign } from "@/lib/campaign";
import { cartas } from "@/lib/futiCards";
import { produtosElegiveis } from "@/lib/numeroDaSorte";

/**
 * Página de detalhe de um produto participante — /produtos/[slug].
 *
 * O Futi Card ganha seções extras (o leque com as 23 cartas e o manual de
 * regras do jogo); os demais produtos mostram só a ficha padrão. Ver
 * components/CardFan.tsx e components/FutiCardRules.tsx.
 */

export function generateStaticParams() {
  return produtosElegiveis.map((produto) => ({ slug: produto.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const produto = produtosElegiveis.find((p) => p.slug === params.slug);
  if (!produto) return {};

  return {
    title: `${produto.nome} | ${campaign.nome}`,
    description: produto.descricao,
  };
}

export default function ProdutoPagina({ params }: { params: { slug: string } }) {
  const produto = produtosElegiveis.find((p) => p.slug === params.slug);
  if (!produto) notFound();

  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Voltar para a promoção">
            <BrandLockup className="text-sm" />
            <span className="hidden h-7 w-px bg-navy/20 sm:block" aria-hidden="true" />
            <FutiWordmark className="hidden h-5 w-auto sm:block" />
          </Link>
          <Link
            href="/#produtos"
            className="ml-auto text-[11px] font-black uppercase tracking-label text-steel transition-colors hover:text-navy"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow">Produtos participantes</p>
        <h1 className="mt-4 text-3xl font-black uppercase leading-tight tracking-headline sm:text-4xl">
          {produto.nome}
        </h1>

        <div className="mt-9 flex flex-col items-start gap-7 sm:flex-row sm:items-center">
          <Image
            src={produto.imagem}
            alt={`Embalagem do produto ${produto.nome}`}
            width={produto.imagemLargura}
            height={produto.imagemAltura}
            className="h-32 w-auto shrink-0"
          />
          <div>
            <p className="max-w-prose leading-relaxed text-ink/75">{produto.descricao}</p>
            <p className="mt-4 inline-flex items-baseline gap-1.5 rounded-full bg-sky px-3.5 py-1.5 text-navy">
              <span className="text-base font-black">{produto.numerosPorUnidade}</span>
              <span className="text-[10px] font-black uppercase tracking-label">
                números da sorte / unidade
              </span>
            </p>
          </div>
        </div>

        {produto.slug === "futi-card" && (
          <>
            <section className="mt-16">
              <h2 className="text-xl font-black uppercase tracking-headline">
                As 23 cartas
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink/70">
                Arraste para o lado (ou use as setas ← →) para folhear a coleção.
              </p>
              <div className="mt-8">
                <CardFan cartas={cartas} />
              </div>
            </section>

            <section className="mt-16 border-t border-line pt-12">
              <h2 className="text-xl font-black uppercase tracking-headline">
                Regras do jogo
              </h2>
              <div className="mt-8">
                <FutiCardRules />
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
