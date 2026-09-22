/**
 * As 23 cartas colecionáveis do Futi Card.
 *
 * Nome, raridade e atributos das primeiras 22 vieram direto da arte final
 * enviada pelo time de design. A 23ª ainda está em produção — fica marcada
 * como pendente até chegar.
 *
 * As 22 imagens ficam em public/images/cards/carta-01.jpg ... carta-22.jpg.
 * São conversões dos PNGs originais (redimensionadas para no máximo 1000px
 * no maior lado, recomprimidas como JPEG qualidade 85) — os PNGs enviados
 * pelo design tinham ~2-3 MB cada (55 MB ao todo), pesados demais pra web;
 * as versões aqui ficam por volta de 150-200 KB sem perda visível, já que a
 * carta nunca é exibida acima de ~320px no leque (ver CardFan.tsx). Quando a
 * 23ª chegar, repetir o mesmo processo antes de salvar.
 */

export type RaridadeCarta = "normal" | "premium" | "golden";

export type Atributos = {
  velocidade: number;
  chute: number;
  habilidade: number;
  energia: number;
};

export type Carta = {
  numero: number;
  nome: string;
  raridade: RaridadeCarta;
  /** `null` só na 23ª carta, ainda em produção. */
  atributos: Atributos | null;
  imagem: string;
  pendente?: boolean;
};

function numeroCarta(n: number): string {
  return String(n).padStart(2, "0");
}

function imagemCarta(n: number): string {
  return `/images/cards/carta-${numeroCarta(n)}.jpg`;
}

/** As 8 cartas Golden — efeito dourado, a raridade mais alta do jogo. */
const GOLDEN: [string, Atributos][] = [
  ["Puskas", { velocidade: 98, chute: 100, habilidade: 100, energia: 95 }],
  ["Skill", { velocidade: 97, chute: 93, habilidade: 100, energia: 94 }],
  ["Drible", { velocidade: 97, chute: 97, habilidade: 100, energia: 94 }],
  ["Ultimate", { velocidade: 99, chute: 100, habilidade: 100, energia: 98 }],
  ["Experiência Sênior", { velocidade: 84, chute: 92, habilidade: 95, energia: 84 }],
  ["Habilidade Suprema", { velocidade: 91, chute: 94, habilidade: 99, energia: 87 }],
  ["Mata Mata", { velocidade: 91, chute: 94, habilidade: 99, energia: 87 }],
  // Master Supreme: nota 100 em tudo, como manda a regra — só 1 por partida.
  ["Master Supreme", { velocidade: 100, chute: 100, habilidade: 100, energia: 100 }],
];

/** As 8 cartas Premium — efeito holográfico. */
const PREMIUM: [string, Atributos][] = [
  ["Goleador", { velocidade: 95, chute: 88, habilidade: 95, energia: 81 }],
  ["Líder e Craque", { velocidade: 90, chute: 94, habilidade: 96, energia: 84 }],
  ["Maestro do Time", { velocidade: 83, chute: 91, habilidade: 95, energia: 83 }],
  ["Speed Skill", { velocidade: 100, chute: 93, habilidade: 92, energia: 88 }],
  ["Novo Ídolo", { velocidade: 90, chute: 80, habilidade: 92, energia: 88 }],
  ["Ícone da Bola", { velocidade: 85, chute: 93, habilidade: 96, energia: 86 }],
  ["Domínio da Alegria", { velocidade: 92, chute: 90, habilidade: 97, energia: 89 }],
  ["Caneta Aura", { velocidade: 92, chute: 91, habilidade: 98, energia: 86 }],
];

/** As 6 cartas Normal — sem efeito especial, a base do time. */
const NORMAL: [string, Atributos][] = [
  ["Driblador", { velocidade: 93, chute: 92, habilidade: 97, energia: 88 }],
  ["Drible Raiz", { velocidade: 94, chute: 82, habilidade: 96, energia: 90 }],
  ["Finalização Mortal", { velocidade: 93, chute: 92, habilidade: 97, energia: 88 }],
  ["Ousadia em Campo", { velocidade: 89, chute: 92, habilidade: 96, energia: 91 }],
  ["Craque Campeão", { velocidade: 90, chute: 95, habilidade: 97, energia: 90 }],
  ["Velocidade e Habilidade", { velocidade: 96, chute: 85, habilidade: 94, energia: 92 }],
];

const RECEBIDAS: (readonly [string, RaridadeCarta, Atributos])[] = [
  ...GOLDEN.map(([nome, atributos]) => [nome, "golden", atributos] as const),
  ...PREMIUM.map(([nome, atributos]) => [nome, "premium", atributos] as const),
  ...NORMAL.map(([nome, atributos]) => [nome, "normal", atributos] as const),
];

export const cartas: Carta[] = [
  ...RECEBIDAS.map(([nome, raridade, atributos], i) => ({
    numero: i + 1,
    nome,
    raridade,
    atributos,
    imagem: imagemCarta(i + 1),
  })),
  {
    numero: 23,
    nome: "Carta 23",
    raridade: "golden",
    atributos: null,
    imagem: imagemCarta(23),
    pendente: true,
  },
];
