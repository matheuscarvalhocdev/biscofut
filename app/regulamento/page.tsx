import type { Metadata } from "next";
import LegalPage, { Bullets, Clause } from "@/components/LegalPage";
import { campaign, formatDate, PENDENTE } from "@/lib/campaign";
import { produtosElegiveis } from "@/lib/numeroDaSorte";

export const metadata: Metadata = {
  title: "Regulamento | Promoção Futi",
  description:
    "Regulamento da promoção comercial Futi — Biscoitê × Neymar Jr., regida pela Lei nº 5.768/1971.",
};

export default function Regulamento() {
  const { itensAutografados } = campaign.premios;

  return (
    <LegalPage
      title="Regulamento da promoção"
      updatedAt={null}
      intro={`Promoção comercial de distribuição gratuita de prêmios mediante compra de produtos, regida pela ${campaign.legal.lei} e pelo ${campaign.legal.decreto}.`}
    >
      <Clause n="1" title="Da promotora e da autorização">
        <p>
          A promoção é realizada por <strong>{campaign.marcas.promotora}</strong>{" "}
          (CNPJ {PENDENTE}), doravante “promotora”, e conta com a participação
          de {campaign.marcas.embaixador} na condição de embaixador da campanha.
        </p>
        <p>
          A promoção depende de autorização prévia da{" "}
          {campaign.legal.orgao} e{" "}
          <strong>
            {campaign.certificado.numero
              ? `está autorizada sob o Certificado de Autorização nº ${campaign.certificado.numero}`
              : "não poderá ser iniciada antes da emissão do respectivo Certificado de Autorização"}
          </strong>
          .
        </p>
      </Clause>

      <Clause n="2" title="Do período de participação">
        <Bullets
          items={[
            <>
              Início: <strong>{formatDate(campaign.vigencia.inicio)}</strong>
            </>,
            <>
              Encerramento: <strong>{formatDate(campaign.vigencia.fim)}</strong>
            </>,
            <>
              Apuração: <strong>{formatDate(campaign.apuracao.data)}</strong>
            </>,
            <>
              As notas fiscais devem ser cadastradas em até{" "}
              {campaign.regras.prazoCadastroNotaDias} dias da data de compra e
              sempre dentro do período de participação.
            </>,
          ]}
        />
      </Clause>

      <Clause n="3" title="De quem pode participar">
        <Bullets
          items={[
            `Pessoas físicas maiores de ${campaign.regras.idadeMinima} anos, residentes e domiciliadas no Brasil, com CPF válido e regular.`,
            "É vedada a participação de pessoas jurídicas.",
            "É vedada a participação de sócios, administradores e empregados da promotora e das empresas envolvidas na operação da promoção, bem como de seus parentes até segundo grau.",
            "Cada participante responde pela veracidade dos dados informados; dados falsos ou de terceiros implicam desclassificação.",
          ]}
        />
      </Clause>

      <Clause n="4" title="Dos produtos participantes">
        <p>Participam da promoção os seguintes produtos:</p>
        <Bullets
          items={produtosElegiveis.map((produto) => (
            <>
              <strong>{produto.nome}</strong> — concede{" "}
              {produto.numerosPorUnidade} número(s) da sorte por unidade
              adquirida.
            </>
          ))}
        />
        <p>
          Não geram participação: produtos fora desta lista, compras canceladas
          ou estornadas e notas fiscais emitidas fora do período de
          participação.
        </p>
      </Clause>

      <Clause n="5" title="Da forma de participação">
        <p>Para participar, o interessado deverá, cumulativamente:</p>
        <Bullets
          items={[
            "Adquirir, no período de participação, ao menos um dos produtos participantes;",
            "Cadastrar-se no site oficial da promoção informando nome completo, CPF, data de nascimento, e-mail e telefone;",
            "Aceitar este regulamento e a Política de Privacidade;",
            "Informar a chave de acesso de 44 dígitos da nota fiscal ou do cupom fiscal da compra, indicar os produtos participantes adquiridos e anexar imagem legível do documento fiscal.",
          ]}
        />
        <p>
          Após a validação do documento fiscal, o sistema atribuirá ao
          participante os números da sorte correspondentes, que serão exibidos
          na área do participante e enviados por e-mail.
        </p>
      </Clause>

      <Clause n="6" title="Da validação da nota fiscal">
        <Bullets
          items={[
            "Cada documento fiscal poderá ser cadastrado uma única vez em toda a promoção, por um único CPF.",
            "A promotora verificará a validade da chave de acesso, a data de emissão, o estabelecimento emitente e a presença de produto participante.",
            "Documentos ilegíveis, adulterados, duplicados ou cuja chave de acesso não seja válida serão recusados, sem geração de números da sorte.",
            "O participante deve guardar o documento fiscal original até o encerramento da promoção; ele poderá ser exigido como condição para a entrega do prêmio.",
          ]}
        />
      </Clause>

      <Clause n="7" title="Dos números da sorte e do limite por CPF">
        <Bullets
          items={[
            "Os números da sorte são compostos por 6 dígitos e atribuídos em série sequencial e única.",
            <>
              Cada CPF poderá acumular, no máximo,{" "}
              <strong>{campaign.regras.maxNumerosPorCpf} números da sorte</strong>{" "}
              durante toda a promoção. Atingido o limite, novos cadastros de
              nota não geram números adicionais.
            </>,
            "Os números da sorte são pessoais, intransferíveis e não podem ser comercializados.",
          ]}
        />
      </Clause>

      <Clause n="8" title="Dos prêmios">
        <Bullets
          items={[
            <>
              <strong>
                {itensAutografados.quantidade} (cinquenta){" "}
                {itensAutografados.descricao}
              </strong>
              , sendo um prêmio por contemplado. Valor unitário declarado:{" "}
              {itensAutografados.valorUnitario
                ? itensAutografados.valorUnitario.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : PENDENTE}
              .
            </>,
            "Os prêmios são pessoais e intransferíveis, não podendo ser convertidos em dinheiro nem substituídos por outro bem.",
            !campaign.premios.encontro.confirmado
              ? "Eventual encontro com o embaixador da campanha não integra os prêmios desta promoção e somente poderá ser oferecido se constar expressamente do Certificado de Autorização."
              : `Inclui, ainda, ${campaign.premios.encontro.descricao}, nas condições descritas no Certificado de Autorização.`,
          ]}
        />
      </Clause>

      <Clause n="9" title="Da apuração">
        <p>
          A apuração será realizada em {formatDate(campaign.apuracao.data)}, com
          base nos números sorteados na extração da Loteria Federal do Brasil da
          data correspondente — ou, na falta desta, da primeira extração
          subsequente.
        </p>
        <p>
          O número contemplado será composto pela leitura dos algarismos dos
          prêmios da extração, na ordem e na regra descritas neste
          regulamento. Não havendo número da sorte distribuído coincidente com
          o resultado apurado, será contemplado o número imediatamente superior
          e, na sua ausência, o imediatamente inferior.
        </p>
      </Clause>

      <Clause n="10" title="Da divulgação e da entrega">
        <Bullets
          items={[
            "Os contemplados serão comunicados por e-mail e telefone em até 10 (dez) dias da apuração, e a lista será divulgada no site oficial da promoção.",
            "A entrega ocorrerá em até 30 (trinta) dias da data da apuração, sem qualquer ônus para o contemplado, no endereço por ele informado no Brasil.",
            "A entrega está condicionada à conferência dos dados cadastrais, à apresentação de documento de identificação com foto e, quando solicitado, do documento fiscal original.",
            "O prêmio não reclamado no prazo de 180 (cento e oitenta) dias contados da apuração caducará, e o valor correspondente será recolhido ao Tesouro Nacional como renda da União.",
          ]}
        />
      </Clause>

      <Clause n="11" title="Do tratamento de dados pessoais">
        <p>
          Os dados pessoais coletados são tratados exclusivamente para as
          finalidades desta promoção, conforme a Lei nº 13.709/2018 (LGPD) e a{" "}
          <a
            href={campaign.documentos.privacidade}
            className="font-black text-navy underline underline-offset-2"
          >
            Política de Privacidade
          </a>{" "}
          da campanha.
        </p>
      </Clause>

      <Clause n="12" title="Das disposições gerais">
        <Bullets
          items={[
            "A participação é gratuita quanto à inscrição, e voluntária; implica aceitação integral deste regulamento.",
            "A promotora poderá desclassificar, a qualquer tempo, participante que utilizar meio fraudulento, automatizado ou de má-fé para obter vantagem.",
            "Dúvidas e reclamações podem ser encaminhadas a " + campaign.contato.email + ".",
            <>
              Este regulamento poderá ser consultado a qualquer momento no site
              oficial da promoção. Em caso de divergência entre este documento e
              qualquer material publicitário, prevalece o regulamento
              protocolado na {campaign.legal.orgao}.
            </>,
          ]}
        />
      </Clause>
    </LegalPage>
  );
}
