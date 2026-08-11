# Alerta de Prazo — Conexão Corporativa

Sistema de automação para envio de alertas por e-mail quando o prazo de uma demanda está se aproximando ou já foi ultrapassado. Integrado ao Google Sheets via **Google Apps Script**.

---

## Visão geral

Quando uma demanda registrada na planilha se aproxima do vencimento (ou já venceu), o sistema dispara automaticamente um e-mail estilizado para a coordenação acadêmica com os dados da demanda e um link direto para a planilha.

```
Planilha Google Sheets
        ↓  (gatilho diário)
  Apps Script verifica prazos
        ↓  (se prazo crítico)
  Gmail envia alerta HTML
        ↓
  Coordenação recebe e-mail
```

---

## Estrutura de arquivos

```
Projeto
├── AlertaPrazo_AppScript.gs   ← script principal (colar no Apps Script)
├── email_alerta_prazo.html    ← prévia visual do e-mail
├── email_alerta_prazo.svg     ← layout para edição no Figma
└── README.md
```

---

## Configuração da planilha

A aba de demandas deve seguir esta estrutura de colunas (linha 1 = cabeçalho):

| Coluna | Campo                  | Exemplo                          |
|--------|------------------------|----------------------------------|
| A      | Nome do Solicitante    | Maria Silva                      |
| B      | Centro/Setor           | Centro de Gestão                 |
| C      | Tipo de Material       | Capa de formulário               |
| D      | Data de Encerramento   | 20/06/2026                       |
| E      | Status                 | Pendente                         |
| F      | E-mail do Coordenador  | coordenacao@instituicao.edu.br   |

> Linhas com **Status** igual a `Concluído` ou `Concluido` são ignoradas automaticamente pelo script.

---

## Instalação

### 1. Abrir o Apps Script

Na planilha Google Sheets, acesse:

```
Extensões → Apps Script
```

### 2. Colar o código

Apague o conteúdo padrão e cole o conteúdo do arquivo `AlertaPrazo_AppScript.gs`.

### 3. Ajustar as configurações

No topo do script, edite as variáveis conforme sua planilha:

```javascript
var SHEET_NAME = "Demandas – Conexão Corporativa"; // nome exato da aba

var COL_NOME     = 1;  // coluna A
var COL_CENTRO   = 2;  // coluna B
var COL_MATERIAL = 3;  // coluna C
var COL_PRAZO    = 4;  // coluna D
var COL_STATUS   = 5;  // coluna E
var COL_EMAIL    = 6;  // coluna F

var DIAS_AVISO = [5, 2, 1]; // dias antes do vencimento para disparar alerta
```

### 4. Criar o gatilho automático

No painel do Apps Script:

1. Clique em ** Gatilhos** (ícone de relógio na barra lateral)
2. Clique em **+ Adicionar gatilho**
3. Configure:
   - **Função**: `verificarPrazos`
   - **Origem do evento**: Acionado por tempo
   - **Tipo**: Diariamente
   - **Horário**: escolha um horário fixo (ex: 8h–9h)
4. Clique em **Salvar** e autorize as permissões solicitadas

---

## Níveis de alerta

O sistema classifica cada demanda em um de três níveis:

| Nível           | Condição                          | Quando dispara         |
|-----------------|-----------------------------------|------------------------|
| `PRÓXIMO`       | Faltam 5 dias para o vencimento   | Uma vez, no dia exato  |
| `URGENTE`       | Faltam 1 ou 2 dias                | Uma vez, no dia exato  |
| `TEMPO ESGOTADO`| Prazo já ultrapassado             | Todos os dias após o vencimento |

Para alterar os dias de aviso antecipado, edite a variável:

```javascript
var DIAS_AVISO = [5, 2, 1];
//               ^  ^  ^ dias antes do vencimento
```

---

## Paleta de cores do e-mail

| Papel              | Cor       | Hex       |
|--------------------|-----------|-----------|
| Fundo do header    | Verde     | `#006652` |
| Destaque / badge   | Verde menta | `#5BDC9E` |
| Alerta / banner    | Âmbar     | `#FFC571` |
| Fundo geral        | Verde claro | `#E8F5F1` |
| Texto principal    | Verde escuro | `#1A3B31` |
| Texto rótulo       | Verde médio | `#006652` |

---

## Personalização do e-mail

O HTML do e-mail é gerado pela função `gerarHtmlEmail()` dentro do próprio script. Para alterar o visual, edite diretamente essa função ou use o arquivo `email_alerta_prazo.html` como base.

As variáveis injetadas dinamicamente são:

| Variável no template | Origem no script         |
|----------------------|--------------------------|
| `${d.mensagemBanner}` | Texto gerado conforme o nível |
| `${d.nivelAlerta}`    | `PRÓXIMO`, `URGENTE` ou `TEMPO ESGOTADO` |
| `${d.nomeSolicitante}` | Coluna A da planilha    |
| `${d.centroSetor}`    | Coluna B da planilha     |
| `${d.tipoMaterial}`   | Coluna C da planilha     |
| `${d.dataEncerramento}` | Coluna D formatada     |
| `${d.linkPlanilha}`   | URL da planilha atual    |

---

## Exemplo de e-mail enviado

```
Assunto: [Conexão Corporativa] Alerta de Prazo — TEMPO ESGOTADO

┌─────────────────────────────────────────────┐
│     ALERTA DE PRAZO!                        │
│      Sistema de Controle de Demandas        │
├─────────────────────────────────────────────┤
│  O prazo já foi ultrapassado há 4 dia(s).   │
├──────────────────┬──────────────────────────┤
│  Nível de Alerta │  TEMPO ESGOTADO          │
│  Solicitante     │  Maria Silva             │
│  Centro/Setor    │  Centro de Gestão        │
│  Tipo de Material│  Capa de formulário      │
│  Encerramento    │  20/06/2026              │
├──────────────────┴──────────────────────────┤
│       [ Acessar Planilha de Demandas → ]    │
└─────────────────────────────────────────────┘
```

---

## Permissões necessárias

Ao salvar o gatilho pela primeira vez, o Google solicitará autorização para:

- **Gmail** — enviar e-mails em seu nome
- **Planilhas Google** — ler os dados da planilha

Essas permissões são necessárias para o funcionamento do script.

---

## Projeto relacionado

Este sistema faz parte da automação do projeto **Conexão Corporativa**, integrado ao fluxo do Google Workspace Studio (`Conexão Corporativa - 1`) que também envia notificações à coordenação via formulário de demanda.
