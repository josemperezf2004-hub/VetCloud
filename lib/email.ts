import nodemailer from "nodemailer";

// Adapter de envío de email: hoy usa Gmail SMTP (cuenta personal del dueño de
// la plataforma + contraseña de aplicación), no un proveedor transaccional
// como Resend — decisión explícita para arrancar sin costo. Gmail limita a
// ~500 envíos/día y no es ideal a mayor escala; si eso se vuelve un problema,
// solo hay que reescribir `enviarEmail`, nunca a los llamadores.
//
// Sin `GMAIL_USER`/`GMAIL_APP_PASSWORD` configuradas (ej. en desarrollo local
// antes de generar la contraseña de aplicación), el email no se envía de
// verdad: se imprime en la consola del servidor para poder probar el flujo
// igual.
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function enviarEmail(destinatario: string, asunto: string, html: string) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `[email] GMAIL_USER/GMAIL_APP_PASSWORD no configuradas — no se envió email real.\n` +
        `[email] Para: ${destinatario}\n[email] Asunto: ${asunto}\n[email] Contenido:\n${html}`
    );
    return;
  }

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: destinatario,
    subject: asunto,
    html,
  });
}

export async function enviarEmailRecuperacion(destinatario: string, link: string) {
  await enviarEmail(
    destinatario,
    "Recupera tu contraseña de VetCloud",
    `<p>Recibimos una solicitud para restablecer tu contraseña de VetCloud.</p>
     <p><a href="${link}">Hace clic aquí para crear una nueva contraseña</a></p>
     <p>Este enlace vence en 1 hora. Si no solicitaste esto, podés ignorar este email.</p>`
  );
}
