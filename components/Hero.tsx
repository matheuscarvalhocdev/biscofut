import Image from "next/image";
import FutiWordmark from "./FutiWordmark";
import Headline from "./Headline";
import { campaign, formatDate } from "@/lib/campaign";
import { transactionsAllowed } from "@/lib/promoStatus";

export default function Hero() {
  const aberto = transactionsAllowed();
  const { quantidade, descricao } = campaign.premios.itensAutografados;

  return (
    <section id="conteudo" className="bg-paper pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-floatUp">
          <p className="eyebrow">
            Promoção comercial · Biscoitê × Neymar Jr.
          </p>

          {/* A divisão Medium / Black é literalmente a do board. */}
          <Headline
            as="h1"
            lead="Concorra a uma camiseta"
            emphasis="autografada pelo Neymar Jr."
            className="mt-5 text-[2.1rem] sm:text-5xl lg:text-[3.4rem]"
          />

          <p className="mt-7 max-w-prose text-lg leading-relaxed text-ink/75">
            São <strong className="font-black text-navy">{quantidade} itens</strong>{" "}
            autografados em jogo. Compre qualquer produto{" "}
            <FutiWordmark className="mx-0.5 inline-block h-[0.95em] w-auto translate-y-[0.1em] text-navy" />
            , cadastre a nota fiscal e receba seus números da sorte.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#participar" className="btn-primary">
              {aberto ? "Cadastrar minha nota" : "Como vai funcionar"}
            </a>
            <a href="#premios" className="btn-secondary">
              Ver os prêmios
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-7">
            <Stat term="Itens autografados" value={String(quantidade)} />
            <Stat term="Início" value={formatDate(campaign.vigencia.inicio)} />
            <Stat term="Apuração" value={formatDate(campaign.apuracao.data)} />
          </dl>
        </div>

        <figure className="relative mx-auto w-full max-w-sm">
          <div className="overflow-hidden rounded-2xl bg-ink">
            <Image
              src="/images/neymar-hero.png"
              alt="Neymar Jr. em campo com o uniforme da seleção brasileira"
              width={243}
              height={300}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <figcaption className="mt-3 text-xs leading-relaxed text-ink/50">
            Imagem meramente ilustrativa. O prêmio é {descricao}, conforme
            descrito no regulamento.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Stat({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-black uppercase tracking-label text-steel">
        {term}
      </dt>
      <dd className="mt-1.5 text-xl font-black text-navy">{value}</dd>
    </div>
  );
}
