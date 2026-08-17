/**
 * Logotipo "futï".
 *
 * ⚠️  PONTO DE TROCA — substituir pelo SVG oficial antes de publicar.
 *     Basta trocar o conteúdo de <svg> por ele; a API do componente
 *     (className, currentColor) já está pronta.
 *
 * O board da campanha define esse estilo como exclusivo da palavra "futi" —
 * nenhuma outra palavra usa. E não é fonte, é lettering: letras geométricas
 * de terminais arredondados desenhadas com linhas concêntricas.
 *
 * A reprodução aqui usa uma máscara com faixas alternadas: o mesmo esqueleto
 * de traço é desenhado várias vezes com espessuras decrescentes, alternando
 * visível/invisível, o que produz o inline de 3 linhas. Vale a máscara em vez
 * de traços brancos empilhados porque assim os vãos ficam de fato
 * transparentes — o logotipo pode sentar em fundo claro ou escuro e herda
 * currentColor.
 */

const STEM = {
  f: "M96 182 L96 76 Q96 46 128 46",
  fBar: "M66 100 L146 100",
  u: "M192 92 L192 150 A30 30 0 0 0 252 150 L252 92",
  t: "M300 56 L300 150 Q300 180 330 180 Q350 180 358 168",
  tBar: "M272 100 L344 100",
  i: "M404 92 L404 182",
};

/** Faixas do inline: [espessura, visível?] de fora para dentro. */
const BANDS: Array<[number, boolean]> = [
  [40, true],
  [31, false],
  [22, true],
  [13, false],
  [5, true],
];

export default function FutiWordmark({
  className = "",
  title = "futi",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 470 210"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
    >
      <defs>
        <mask id="futi-inline" maskUnits="userSpaceOnUse" x="0" y="0" width="470" height="210">
          {BANDS.map(([width, visible]) => (
            <g
              key={width}
              stroke={visible ? "#fff" : "#000"}
              strokeWidth={width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <path d={STEM.f} />
              <path d={STEM.fBar} />
              <path d={STEM.u} />
              <path d={STEM.t} />
              <path d={STEM.tBar} />
              <path d={STEM.i} />
            </g>
          ))}
          {/* Trema do "ï" — pontos cheios: em 18px de diâmetro o inline
              viraria borrão, então aqui a linha é sólida de propósito. */}
          <circle cx="387" cy="54" r="11" fill="#fff" />
          <circle cx="421" cy="54" r="11" fill="#fff" />
        </mask>
      </defs>

      <rect
        x="0"
        y="0"
        width="470"
        height="210"
        fill="currentColor"
        mask="url(#futi-inline)"
      />
    </svg>
  );
}
