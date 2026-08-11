// ============================================================
//  ALERTA DE PRAZO — Conexão Corporativa
//  Executa diariamente via gatilho (Time-driven trigger)
//  Colunas esperadas na planilha (linha de cabeçalho = 1):
//    A  Nome do Solicitante
//    B  Centro/Setor
//    C  Tipo de Material
//    D  Data de Encerramento   (formato: dd/mm/aaaa ou Date)
//    E  Status                 (ex: "Pendente", "Concluído")
//    F  E-mail do Coordenador  (destinatário do alerta)
// ============================================================

var SHEET_NAME   = "Demandas – Conexão Corporativa"; // nome da aba
var COL_NOME     = 1;   // A
var COL_CENTRO   = 2;   // B
var COL_MATERIAL = 3;   // C
var COL_PRAZO    = 4;   // D
var COL_STATUS   = 5;   // E
var COL_EMAIL    = 6;   // F

// Quantos dias antes do vencimento disparar o alerta
var DIAS_AVISO   = [5, 2, 1]; // avisa com 5, 2 e 1 dia(s) de antecedência

function verificarPrazos() {
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var sheet   = ss.getSheetByName(SHEET_NAME);
  var dados   = sheet.getDataRange().getValues();
  var hoje    = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (var i = 1; i < dados.length; i++) {          // i=1 pula cabeçalho
    var linha  = dados[i];
    var status = String(linha[COL_STATUS - 1]).trim().toLowerCase();

    if (status === "concluído" || status === "concluido") continue;

    var prazo  = new Date(linha[COL_PRAZO - 1]);
    prazo.setHours(0, 0, 0, 0);
    if (isNaN(prazo.getTime())) continue;

    var diffMs   = prazo - hoje;
    var diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

    var nivel    = null;
    var mensagem = null;

    if (diffDias < 0) {
      // Prazo já ultrapassado
      nivel    = "TEMPO ESGOTADO";
      mensagem = "O prazo para esta demanda <strong style=\"color:#B45309;\">já foi ultrapassado</strong> há <strong>" + Math.abs(diffDias) + " dia(s)</strong>.";
    } else if (DIAS_AVISO.indexOf(diffDias) !== -1) {
      // Prazo se aproximando
      nivel    = diffDias <= 2 ? "URGENTE" : "PRÓXIMO";
      mensagem = diffDias === 1
        ? "O prazo para esta demanda <strong style=\"color:#B45309;\">vence amanhã</strong>. Resta apenas <strong>1 dia</strong>."
        : "O prazo para esta demanda está <strong style=\"color:#B45309;\">se aproximando</strong>: restam apenas <strong>" + diffDias + " dia(s)</strong>.";
    }

    if (!nivel) continue;

    var emailDestinatario = String(linha[COL_EMAIL - 1]).trim();
    if (!emailDestinatario) continue;

    var html = gerarHtmlEmail({
      mensagemBanner  : mensagem,
      nivelAlerta     : nivel,
      nomeSolicitante : linha[COL_NOME - 1],
      centroSetor     : linha[COL_CENTRO - 1],
      tipoMaterial    : linha[COL_MATERIAL - 1],
      dataEncerramento: Utilities.formatDate(prazo, Session.getScriptTimeZone(), "dd/MM/yyyy"),
      linkPlanilha    : ss.getUrl(),
    });

    MailApp.sendEmail({
      to      : emailDestinatario,
      subject : "[Conexão Corporativa] Alerta de Prazo — " + nivel,
      htmlBody: html,
    });

    Logger.log("Alerta enviado para " + emailDestinatario + " | Linha " + (i + 1) + " | Nível: " + nivel);
  }
}

// ----------------------------------------------------------
//  Gerador do HTML do e-mail
// ----------------------------------------------------------
function gerarHtmlEmail(d) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f0f9f5;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f9f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,102,82,0.13);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#006652;padding:32px 36px 28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#5BDC9E;border-radius:50%;width:44px;height:44px;text-align:center;vertical-align:middle;" width="44" height="44">
                          <span style="font-size:22px;line-height:44px;display:inline-block;">⏰</span>
                        </td>
                        <td style="padding-left:16px;vertical-align:middle;">
                          <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;line-height:1.2;">ALERTA DE PRAZO!</div>
                          <div style="color:#5BDC9E;font-size:13px;margin-top:4px;">Sistema de Controle de Demandas — Conexão Corporativa</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BANNER -->
          <tr>
            <td style="background-color:#ffffff;padding:28px 36px 0 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#FFF8ED;border-left:4px solid #FFC571;border-radius:4px;padding:14px 18px;">
                    <span style="color:#7A4F00;font-size:14px;">${d.mensagemBanner}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- INFO TABLE -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2ede9;border-radius:8px;overflow:hidden;">

                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2ede9;background-color:#f7fcfa;width:40%;">
                    <span style="color:#006652;font-size:13px;font-weight:600;">Nível de Alerta</span>
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2ede9;">
                    <span style="background-color:#FFC571;color:#7A3B00;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;">${d.nivelAlerta}</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2ede9;background-color:#f7fcfa;">
                    <span style="color:#006652;font-size:13px;font-weight:600;">Solicitante</span>
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2ede9;">
                    <span style="color:#1a3b31;font-size:14px;">${d.nomeSolicitante}</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2ede9;background-color:#f7fcfa;">
                    <span style="color:#006652;font-size:13px;font-weight:600;">Centro/Setor</span>
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2ede9;">
                    <span style="color:#1a3b31;font-size:14px;">${d.centroSetor}</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2ede9;background-color:#f7fcfa;">
                    <span style="color:#006652;font-size:13px;font-weight:600;">Tipo de Material</span>
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2ede9;">
                    <span style="color:#1a3b31;font-size:14px;">${d.tipoMaterial}</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 20px;background-color:#f7fcfa;">
                    <span style="color:#006652;font-size:13px;font-weight:600;">Data de Encerramento</span>
                  </td>
                  <td style="padding:14px 20px;">
                    <span style="color:#1a3b31;font-size:14px;font-weight:600;">${d.dataEncerramento}</span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background-color:#ffffff;padding:0 36px 28px 36px;text-align:center;">
              <a href="${d.linkPlanilha}" style="display:inline-block;background-color:#006652;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;">
                Acessar Planilha de Demandas →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f0f9f5;border-top:1px solid #c8e8df;padding:20px 36px;text-align:center;">
              <p style="margin:0;color:#5a8a7a;font-size:12px;line-height:1.6;">
                Este e-mail foi gerado automaticamente pelo sistema de controle de demandas.<br/>
                Em caso de dúvidas, entre em contato com a equipe responsável.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
