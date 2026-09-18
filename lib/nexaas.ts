import { createHmac, timingSafeEqual } from "crypto";

/**
 * Contrato do webhook de pedidos da Nexaas (a plataforma de vendas da loja).
 *
 * ⚠️  FORMATO A CONFIRMAR. Nunca vimos a documentação real do webhook da
 *     Nexaas — o formato abaixo é uma suposição razoável (padrão de
 *     e-commerce: id do pedido, status, dados do cliente, itens por SKU) só
 *     para fixar o contrato e destravar o resto do fluxo. Antes de ligar
 *     isto de verdade:
 *       1. Confirmar com a Nexaas o nome do evento de "pedido pago", o
 *          formato exato do payload e o nome do header de assinatura.
 *       2. Ajustar `NexaasWebhookEvent` e `extrairPedidoPago` abaixo.
 *       3. Preencher `NEXAAS_SKU_PARA_PRODUTO` com os SKUs reais cadastrados
 *          na loja Nexaas (hoje são placeholders = os nossos próprios SKUs).
 */

export type NexaasWebhookEvent = {
  event: string;
  data: {
    /** Id do pedido na Nexaas — usado como referência para não duplicar números. */
    id: string;
    /** Esperado: "paid" / "approved" (a confirmar o valor exato com a Nexaas). */
    status: string;
    customer: {
      name?: string | null;
      email?: string | null;
      /** CPF do comprador, com ou sem máscara. */
      document?: string | null;
    };
    items: Array<{
      sku: string;
      quantity: number;
    }>;
  };
};

export const NEXAAS_STATUS_PAGO = ["paid", "approved"];

/**
 * De: SKU cadastrado na loja Nexaas. Para: SKU usado em produtosElegiveis
 * (lib/numeroDaSorte.ts). Placeholder — substituir pelos SKUs reais da loja
 * assim que o time comercial confirmar.
 */
export const NEXAAS_SKU_PARA_PRODUTO: Record<string, string> = {
  "FUTI-CARD": "FUTI-CARD",
  "FUTI-COL": "FUTI-COL",
  "FUTI-ARE": "FUTI-ARE",
};

/**
 * Verifica a assinatura HMAC do webhook. Nome do header e algoritmo também
 * são suposição (padrão: HMAC-SHA256 do corpo cru, em hex) — confirmar com a
 * Nexaas antes de ir ao ar.
 */
export function verificarAssinaturaNexaas(corpoCru: string, assinaturaRecebida: string | null): boolean {
  const segredo = process.env.NEXAAS_WEBHOOK_SECRET;

  if (!segredo) {
    // Sem segredo configurado: aceita em desenvolvimento (para dar para
    // testar sem credencial real) e recusa em produção, para nunca aceitar
    // um webhook não verificado por engano.
    return process.env.NODE_ENV !== "production";
  }

  if (!assinaturaRecebida) return false;

  const esperada = createHmac("sha256", segredo).update(corpoCru).digest("hex");
  const bufferEsperado = Buffer.from(esperada, "utf8");
  const bufferRecebido = Buffer.from(assinaturaRecebida, "utf8");

  if (bufferEsperado.length !== bufferRecebido.length) return false;
  return timingSafeEqual(bufferEsperado, bufferRecebido);
}
