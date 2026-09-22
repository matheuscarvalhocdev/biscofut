import type { ReactNode } from "react";
import { Bullets, Clause } from "./LegalPage";

/**
 * Regras do Futi Card, transcritas do manual enviado pelo time de produto.
 *
 * ⚠️  "Manual sujeito a ajustes conforme finalização da arte e do naming
 *     oficial da linha de produtos" — nota do próprio manual, mantida no
 *     rodapé. Atualizar este arquivo quando a versão final chegar.
 */
export default function FutiCardRules() {
  return (
    <div className="legal-body">
      <Clause n="1" title="Prepare-se para o duelo!">
        <p>
          Chegou a hora de entrar em campo com o Futi Card! Dentro de cada
          pacote de biscoito, um card surpresa te espera — e são 23 cards
          incríveis do Neymar Jr. pra você caçar e colecionar. Craques
          lendários, jogadas históricas, momentos de gênio... cada card conta
          um pedaço da carreira do camisa 10!
        </p>
        <p>
          Já colecionou? Então chama a galera, monta seu baralho e prepara o
          grito de gol: na hora do duelo, só o card mais forte sobrevive!
        </p>
      </Clause>

      <Clause n="2" title="Conheça seus craques">
        <p>
          Cada card do Futi Card tem uma raridade (o quão poderoso ele é) e 4
          atributos que mostram a força do jogador em campo.
        </p>

        <Subtitulo>As 3 raridades</Subtitulo>
        <Tabela
          colunas={["Raridade", "Como reconhecer"]}
          linhas={[
            [
              <strong className="text-amber-600">Golden</strong>,
              "Efeito dourado — os cards lendários, os mais raros e mais fortes de todos!",
            ],
            [
              <strong className="text-navy">Premium</strong>,
              "Efeito holográfico — cards fortes, difíceis de achar.",
            ],
            ["Normal", "Sem efeito especial — a base do seu time."],
          ]}
        />

        <Callout>
          Golden vence Premium e Normal. Premium vence Normal. Não importa o
          atributo — quem tem a raridade mais alta vence a batalha!
        </Callout>

        <p>
          Achar um card Golden é sorte de campeão — e ele praticamente
          garante a vitória da rodada!
        </p>

        <Subtitulo>Os 4 atributos</Subtitulo>
        <Tabela
          colunas={["Ícone", "Atributo"]}
          linhas={[
            ["⚡", "Velocidade"],
            ["⚽", "Chute"],
            ["🎯", "Habilidade"],
            ["🔋", "Energia"],
          ]}
        />
        <p>
          Esses números só entram em ação quando dois craques da mesma
          raridade se encaram — é aí que o atributo certo pode decidir tudo!
        </p>
      </Clause>

      <Clause n="3" title="Montando seu time (preparação)">
        <Bullets
          items={[
            "O ideal é jogar com a coleção completa: os 23 cards. Quanto mais completa a coleção, mais opções e emoção no duelo.",
            "Só pode haver 1 card Master Supreme por partida. Ele tem nota 100 em todos os atributos — se houvesse dois no mesmo jogo, não seria possível desempatar um contra o outro. Se você tiver mais de um, guarde os extras para outra partida.",
            "Se os cards forem reunidos entre amigos, pode acontecer de haver cards repetidos. Isso não atrapalha o jogo.",
            "Dica dos criadores: para manter o equilíbrio, recomendamos no máximo 2 cópias de cada card (com exceção do Master Supreme, que é sempre único). É apenas uma sugestão — vocês podem combinar como preferirem.",
            "Embaralhe todos os cards e distribua igualmente entre os jogadores. Cada jogador forma sua pilha, virada para baixo, à sua frente.",
          ]}
        />
        <p>
          <strong>Número de jogadores:</strong> de 2 a 6.
        </p>
      </Clause>

      <Clause n="4" title="Como jogar">
        <Subtitulo>Quem começa a rodada</Subtitulo>
        <Bullets
          items={[
            "Na primeira rodada da partida, sorteiem quem começa (por exemplo, par ou ímpar, ou o jogador mais novo).",
            "Nas rodadas seguintes, quem venceu a rodada anterior começa a próxima.",
          ]}
        />

        <Subtitulo>A rodada</Subtitulo>
        <ListaNumerada
          items={[
            "O jogador que está começando a rodada olha o card do topo da própria pilha (sem mostrar aos outros) e escolhe um atributo — Velocidade, Chute, Habilidade ou Energia — que será usado na comparação. Ele anuncia esse atributo em voz alta.",
            "Todos os jogadores revelam, ao mesmo tempo, o card do topo da própria pilha.",
            <>
              Primeiro, compare a raridade dos cards revelados:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Se apenas um jogador revelou o card de maior raridade, ele
                  vence a rodada automaticamente — não é preciso comparar o
                  atributo escolhido.
                </li>
                <li className="italic text-ink/60">
                  Exemplo: um jogador revela um card Golden, os outros
                  revelam Premium ou Normal — o Golden vence.
                </li>
              </ul>
            </>,
            <>
              Se dois ou mais jogadores empataram na raridade mais alta da
              rodada (por exemplo, dois jogadores revelam cards Golden ao
              mesmo tempo), use o atributo escolhido no passo 1 para
              desempatar:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Vence a rodada quem tiver o número mais alto nesse
                  atributo, entre os cards empatados.
                </li>
              </ul>
            </>,
            "O vencedor da rodada recolhe todos os cards da mesa e os coloca no fundo da própria pilha.",
            "Quem venceu a rodada inicia a próxima, escolhendo um novo atributo.",
            "O jogo continua dessa forma, rodada após rodada.",
          ]}
        />
      </Clause>

      <Clause n="5" title="Empates">
        <p>
          Alguns cards têm atributos idênticos, então mesmo comparando o
          atributo escolhido pode haver empate. Isso também acontece quando
          dois jogadores revelam cópias do mesmo card (caso o baralho tenha
          repetições) — nesse caso, todos os atributos são iguais, qualquer
          atributo escolhido resultaria em empate. A forma de resolver é
          sempre a mesma:
        </p>
        <ListaNumerada
          items={[
            "Os cards empatados ficam juntos, formando um monte na mesa.",
            "Um dos jogadores empatados (o que está mais próximo de quem começou a rodada, no sentido horário) escolhe um novo atributo, olhando o próprio card do topo da pilha.",
            "Os jogadores empatados revelam o próximo card da própria pilha.",
            "Compare a raridade e, se necessário, o novo atributo escolhido, seguindo as mesmas regras da seção 4.",
            "Quem vencer essa nova comparação leva todos os cards acumulados no monte.",
          ]}
        />
        <p className="italic text-ink/60">
          Exemplo: dois jogadores revelam o card &ldquo;Goleador&rdquo; ao
          mesmo tempo. Como é o mesmo card dos dois lados, o resultado é
          sempre empate, não importa o atributo escolhido. Os dois cards vão
          para o monte, e cada um dos dois jogadores revela o próximo card da
          pilha para desempatar.
        </p>
      </Clause>

      <Clause n="6" title="Fim de jogo">
        <p>Antes de começar a partida, combinem qual dos dois formatos vão jogar:</p>
        <Bullets
          items={[
            <>
              <strong>Modo Clássico:</strong> o jogo termina quando um
              jogador fica com todos os cards. Ele é o campeão.
            </>,
            <>
              <strong>Modo Rápido:</strong> combinem um número fixo de
              rodadas (por exemplo, 20). Ao final, vence quem tiver mais
              cards na pilha.
            </>,
          ]}
        />
        <p>Um jogador que ficar sem cards sai da partida.</p>
      </Clause>

      <Clause n="7" title="Resumo rápido">
        <ListaNumerada
          items={[
            "Quem começa a rodada escolhe o atributo (Velocidade, Chute, Habilidade ou Energia) antes de todos revelarem seus cards.",
            "Golden sempre ganha de Premium e Normal.",
            "Premium sempre ganha de Normal.",
            "O atributo escolhido só é usado para desempatar cards da mesma raridade.",
            "Só pode haver 1 Master Supreme por partida.",
            "Quem vence a rodada leva todos os cards da mesa e começa a próxima rodada.",
          ]}
        />
      </Clause>

      <p className="mt-11 text-xs italic leading-relaxed text-ink/45">
        Manual sujeito a ajustes conforme finalização da arte e do naming
        oficial da linha de produtos.
      </p>
    </div>
  );
}

function Subtitulo({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 font-black uppercase tracking-label text-navy">
      {children}
    </p>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-amber-500/50 bg-amber-400/10 px-5 py-4 text-sm font-medium leading-relaxed text-ink/80">
      🏆 {children}
    </p>
  );
}

function Tabela({ colunas, linhas }: { colunas: [string, string]; linhas: [ReactNode, ReactNode][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[22rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {colunas.map((coluna) => (
              <th
                key={coluna}
                className="py-2 pr-4 text-[10px] font-black uppercase tracking-label text-steel"
              >
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, index) => (
            <tr key={index} className="border-b border-line/60 last:border-0">
              {linha.map((celula, i) => (
                <td key={i} className="py-2.5 pr-4 align-top text-ink/75">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListaNumerada({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="w-5 shrink-0 font-black text-steel">{index + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}
