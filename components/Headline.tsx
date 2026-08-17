/**
 * Chamada da campanha, no formato do board.
 *
 * O board mostra a regra explicitamente: "CONCORRA A UMA CAMISETA" em Noka
 * Medium, "AUTOGRAFADA PELO NEYMAR JR." em Noka Black — mesmo tamanho, mesma
 * cor, mesma caixa-alta. A ênfase vem só do peso.
 *
 * Encapsular isso evita o erro mais provável ao longo da campanha: alguém
 * grifar a ênfase com outra cor. Aqui não tem essa opção.
 */
export default function Headline({
  lead,
  emphasis,
  as: Tag = "h2",
  className = "",
}: {
  /** Primeira parte, em Medium. */
  lead: string;
  /** Segunda parte, em Black. */
  emphasis: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
}) {
  return (
    <Tag
      className={`font-medium uppercase leading-[1.08] tracking-headline text-navy text-balance ${className}`}
    >
      {lead}{" "}
      <strong className="font-black">{emphasis}</strong>
    </Tag>
  );
}
