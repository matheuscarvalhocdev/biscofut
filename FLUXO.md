# Fluxo de cadastro e validação — Promoção Futi

Documento técnico do fluxo implementado nesta landing page.

O briefing registra que o protocolo na SPA/MF exige, entre outros itens, **a
descrição detalhada do fluxo de cadastro e validação na Landing Page** e
**print/descrição visual da mesma**. Este arquivo é a fonte para essa parte da
documentação: o que está aqui descreve exatamente o que o código faz.

---

## 1. Arquitetura em uma tela

```
┌─────────────────────────────────────────────────────────────────────┐
│  LANDING PAGE (Next.js App Router)                                  │
│                                                                     │
│  /                    seções institucionais + fluxo de participação │
│  /regulamento         documento legal (rota própria)                │
│  /politica-privacidade                                              │
│  /termos-de-uso                                                     │
│                                                                     │
│  Interruptor mestre: lib/promoStatus.ts                             │
│    PRE_LAUNCH ──> página institucional, ZERO transação              │
│    ACTIVE     ──> fluxo completo (só com nº de CA registrado)        │
└────────────────────────────┬────────────────────────────────────────┘
                             │  POST /api/participacao
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  VALIDAÇÃO NO SERVIDOR (app/api/participacao/route.ts)              │
│                                                                     │
│  0. autorização  ── sem CA registrado -> 503, nada é gravado        │
│  1. participante ── nome, CPF (dígito verificador), idade ≥ 18,      │
│                     e-mail, telefone com DDD                        │
│  2. consentimentos ── regulamento + privacidade obrigatórios;        │
│                       marketing separado e opcional (LGPD)           │
│  3. nota fiscal  ── chave de 44 dígitos + DV módulo 11,              │
│                     emissão dentro da vigência,                      │
│                     produto participante, imagem anexada             │
│  4. unicidade    ── chave já usada? -> 409                           │
│  5. teto por CPF ── aplica limite, informa excedente                 │
│  6. emissão      ── série sequencial única (EM TRANSAÇÃO)            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Os dois estados da página, e por que existem

A dependência legal do briefing — "a campanha não pode ser iniciada sem
autorização prévia da SPA" — não é satisfeita escondendo o botão. Se o
endpoint existe e responde, a campanha começou.

Por isso `transactionsAllowed()` exige **duas** condições:

```ts
status === "ACTIVE" && campaign.certificado.numero !== null
```

O número do CA funciona como a chave física do interruptor: alguém que mude a
variável de ambiente por engano não liga a promoção. E o endpoint revalida a
mesma regra antes de olhar o corpo da requisição — a interface não é a
fronteira de segurança.

| | PRE_LAUNCH | ACTIVE |
| --- | --- | --- |
| Seções institucionais | visíveis | visíveis |
| Formulário de cadastro | **não renderiza** | completo |
| `POST /api/participacao` | **503** | processa |
| Números da sorte | não existem | emitidos |
| Captura de e-mail | permitida, rotulada como "não é inscrição" | — |
| Documentos legais | publicados | publicados |
| CA na página | "aguardando emissão" | nº + link do PDF |

---

## 3. Fluxo do participante, passo a passo

### Passo 1 — Identificação

Campos, todos obrigatórios (os quatro do briefing, mais nascimento):

| Campo | Validação no cliente | Por que é coletado |
| --- | --- | --- |
| Nome completo | ≥ 2 nomes, sem dígitos | Identificação e entrega do prêmio |
| CPF | dígito verificador | Chave da participação e do teto por pessoa |
| Data de nascimento | idade ≥ 18 na data | Restrição legal de participação |
| E-mail | formato | Confirmação e comunicação do resultado |
| Telefone | DDD 11–99; celular começa com 9 | Contato do contemplado |

Três aceites, deliberadamente separados:

1. Regulamento + Termos de Uso — **obrigatório**
2. Tratamento de dados para participar — **obrigatório** (base: execução de contrato)
3. Comunicações de marketing — **opcional**, desmarcado

O terceiro é separado porque, sob a LGPD, consentimento para marketing não
pode ser condição de participação. Amarrar os três num checkbox só é o erro
mais comum desse tipo de campanha, e é o que gera questionamento depois.

### Passo 2 — Validação da compra

Aqui está a decisão de produto mais importante do fluxo: **um campo em vez de
cinco.**

O caminho óbvio seria pedir número da nota, série, CNPJ do emitente, data e
valor total. São cinco campos, cinco chances de erro de digitação, e um
formulário que ninguém preenche na fila do caixa. A alternativa usa a
**chave de acesso de 44 dígitos**, que já está impressa no rodapé de todo
cupom fiscal ao lado do QR Code.

Funciona porque a chave não é um identificador opaco — ela é estruturada:

```
35 2608 12345678000199 65 001 000012345 1 87654321 5
│   │    │              │  │   │         │ │        └ DV (módulo 11)
│   │    │              │  │   │         │ └────────── código numérico
│   │    │              │  │   │         └──────────── tipo de emissão
│   │    │              │  │   └────────────────────── número da NF
│   │    │              │  └────────────────────────── série
│   │    │              └───────────────────────────── modelo (65 = NFC-e)
│   │    └──────────────────────────────────────────── CNPJ do emitente
│   └───────────────────────────────────────────────── ano/mês de emissão
└───────────────────────────────────────────────────── UF (35 = SP)
```

Consequências práticas, todas verificadas em `lib/notaFiscal.ts`:

- **Erro de digitação é pego no navegador.** O 44º dígito é verificador
  (módulo 11, pesos 2–9 cíclicos). Um dígito trocado não passa.
- **CNPJ, UF, data, série e número saem da própria chave**, sem consulta
  externa — não precisamos pedir o que já está ali.
- **A tela devolve o que entendeu.** Assim que a chave fica válida, aparece um
  painel com CNPJ do estabelecimento, mês de emissão, número e série. Isso
  transforma 44 dígitos numa conferência de um segundo: o participante
  reconhece a loja, ou percebe na hora que pegou o cupom errado.
- **Nota fora da vigência é recusada** comparando o ano/mês da chave com o
  início da promoção.

Além da chave, o passo coleta:

- **quantidade por produto participante** (contador com botões grandes — isso
  é preenchido no celular, não no desktop);
- **imagem do cupom** (JPG/PNG/PDF, até 5 MB), que é a prova documental para
  auditoria e para conferir que a nota contém produto elegível.

### Passo 3 — Emissão

Nota validada, a resposta traz os números da sorte, o total acumulado no CPF e
quanto ainda cabe no teto. Se o teto cortou parte dos números, **o corte
aparece na tela** — o participante não descobre depois que comprou esperando
números que não vieram.

---

## 4. Regras de negócio, e onde cada uma vive

Todas em `lib/campaign.ts`, num objeto só. Nenhum valor de prêmio, data,
limite ou número de CA é escrito direto num componente: se estiver em dois
lugares, um dia os dois divergem — e divergência entre a LP e o regulamento
protocolado é problema de conformidade, não de layout.

| Regra | Valor | Onde |
| --- | --- | --- |
| Idade mínima | 18 anos | `campaign.regras.idadeMinima` |
| Teto por CPF | 200 números | `campaign.regras.maxNumerosPorCpf` |
| Nota única na campanha | sim | `campaign.regras.notaFiscalUnica` |
| Prazo p/ cadastrar após a compra | 30 dias | `campaign.regras.prazoCadastroNotaDias` |
| Números por produto | 3 (Collection) / 5 (Arena) | `lib/numeroDaSorte.ts` |
| Prêmios | 50 camisetas autografadas | `campaign.premios` |

**Campos que o jurídico precisa preencher antes do protocolo** — hoje `null`,
e a página mostra `[A CONFIRMAR]` de propósito, para gritar o que falta:

- `certificado.numero` e `certificado.pdf`
- `vigencia.inicio` e `vigencia.fim`
- `apuracao.data`
- `premios.itensAutografados.valorUnitario`
- CNPJ da promotora (nas páginas legais)
- `contato.sacTelefone`

---

## 5. O upload do cupom

O arquivo **não** deve trafegar pelo servidor da aplicação. O caminho correto,
e o que o código já assume:

1. cliente pede uma URL assinada de upload (`POST /api/upload-url`);
2. cliente envia o arquivo **direto ao object storage**, com expiração curta;
3. cliente manda a chave devolvida em `nota.cupomKey`;
4. o servidor grava só a chave; o bucket é privado, sem URL pública.

O ponto de integração está marcado no `fetch` de `components/Participation.tsx`.
Hoje ele envia `upload-pendente/<nome do arquivo>` como placeholder.

Por que assim: imagem de cupom é dado pessoal (nome do titular, itens
comprados, às vezes CPF na nota). Passar o binário pelo app server significa
guardar dado pessoal em log, em disco temporário e em memória de processo, sem
nenhum ganho.

---

## 6. O que falta para produção

O que está pronto: interface completa, validações de cliente e de servidor,
regras de negócio, gating por autorização, documentos legais e o contrato da
API. O que falta é persistência e infraestrutura.

### 6.1 Banco (bloqueante)

`app/api/participacao/route.ts` usa um `Map` em memória — ele morre a cada
reinício e não é compartilhado entre instâncias. Substituir por:

```sql
participante(id, nome, cpf UNIQUE, nascimento, email, telefone, criado_em)
consentimento(id, participante_id, tipo, aceito_em, ip, user_agent, versao_doc)
nota_fiscal(id, participante_id, chave_acesso UNIQUE, cnpj_emitente,
            emissao, cupom_key, status, validado_em)
numero_sorte(id, participante_id, nota_fiscal_id, numero UNIQUE, criado_em)
```

Três invariantes que **têm** que ser do banco, não da aplicação:

- `UNIQUE (chave_acesso)` — a checagem em código tem janela de corrida; duas
  requisições simultâneas com a mesma nota passam as duas.
- `UNIQUE (numero)` + emissão **dentro de transação** — sem isso, dois
  cadastros concorrentes recebem o mesmo número da sorte, e aí a apuração
  tem dois donos para um número.
- Teto por CPF conferido com `SELECT ... FOR UPDATE` na mesma transação.

`consentimento` guarda IP, user-agent, momento e **versão do documento
aceito**: é o que prova, meses depois, o que a pessoa aceitou.

### 6.2 Restante

| Item | Observação |
| --- | --- |
| Upload assinado | §5 |
| Rate limiting | por IP e por CPF, no endpoint de cadastro |
| CAPTCHA | contra automação em massa |
| E-mail transacional | confirmação com os números emitidos |
| Área do participante | login para consultar números e notas |
| Auditoria de notas | fila de conferência manual/OCR das imagens |
| Apuração | entrada dos resultados oficiais da Loteria Federal |
| `robots: index` | hoje `noindex` em `app/layout.tsx` — liberar na publicação |
| Aviso de cookies | se houver medição de audiência |

---

## 7. Checklist antes do protocolo na SPA/MF

- [ ] Preencher todos os campos `null` de `lib/campaign.ts` (§4)
- [ ] Substituir as minutas legais pelo texto final do jurídico
  (`app/regulamento`, `app/politica-de-privacidade`, `app/termos-de-uso`) e
  remover o aviso de minuta (`draft={false}` em `LegalPage`)
- [ ] Trocar o logotipo `futï` pelo SVG oficial (`components/FutiWordmark.tsx`)
- [ ] Trocar as assinaturas Biscoitê e Neymar Jr. pelos SVGs oficiais
  (`components/BrandLockup.tsx`)
- [ ] Instalar a Noka licenciada e descomentar o `@font-face`
  (`app/globals.css`)
- [ ] Conferir que os pesos de números por produto batem com o regulamento
- [ ] Gerar os prints da LP para anexar ao protocolo (`/`, formulário passo 1,
      passo 2, passo 3, e as três páginas legais)
- [ ] Confirmar se o encontro com o Neymar Jr. entra ou não no CA e ajustar
      `campaign.premios.encontro.confirmado`

## 8. Depois da emissão do CA

- [ ] `certificado.numero` e `certificado.pdf` preenchidos
- [ ] `NEXT_PUBLIC_PROMO_STATUS=ACTIVE`
- [ ] Verificar que o CA aparece na seção "Documentos oficiais" e no rodapé
- [ ] `robots: index` liberado
- [ ] Teste de ponta a ponta com nota fiscal real
