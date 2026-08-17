/**
 * Lockup de co-branding: Biscoitê | NEYMAR JR.
 *
 * O board fecha com as duas marcas lado a lado, separadas por um filete
 * vertical, em peso visual equivalente. Isso é contrato entre as partes, não
 * decisão de layout — por isso vive num componente só, e não solto em cada
 * seção. Não redimensionar uma marca sem a outra.
 *
 * ⚠️  As duas assinaturas abaixo são aproximações tipográficas. Substituir
 *     pelos SVGs oficiais (a "Biscoitê" é uma caligrafia com script e cedilha;
 *     o "NEYMAR JR." tem o monograma NJ à esquerda).
 */

export default function BrandLockup({
  className = "",
  tone = "navy",
}: {
  className?: string;
  /** "navy" para fundo claro, "light" para fundo escuro. */
  tone?: "navy" | "light";
}) {
  const color = tone === "light" ? "text-white" : "text-navy";
  const rule = tone === "light" ? "bg-white/35" : "bg-navy/25";

  return (
    <div className={`flex items-center gap-4 ${color} ${className}`}>
      <span className="font-black italic tracking-tight text-[1.15em] leading-none">
        Biscoitê
      </span>

      <span className={`h-[1.4em] w-px shrink-0 ${rule}`} aria-hidden="true" />

      <span className="flex items-center gap-2 leading-none">
        <NjMonogram className="h-[1.3em] w-auto" />
        <span className="text-[0.8em] font-black uppercase tracking-label">
          Neymar Jr.
        </span>
      </span>
    </div>
  );
}

/** Monograma NJ — traço contínuo, como no board. */
function NjMonogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 52" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 46V10a4 4 0 0 1 7-2.6l14 20V6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M27 26v14a6 6 0 0 1-11 3.4"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
