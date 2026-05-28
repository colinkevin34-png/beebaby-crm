import emailjs from "@emailjs/browser";

// ============================================================
//  Configuration — envoi depuis contact@beebaby.info via Resend
//  avec tracking ouverture/clic natif
// ============================================================
export const RESEND_API_KEY = "re_ieTsTgoT_5vHCE7XPuXqMCFc6JZTbFqBA";
export const FROM_EMAIL     = "contact@beebaby.info";
export const FROM_NAME      = "Bee Baby Micro-crèche";
export const RESEND_READY   = true;
export const EMAILJS_READY  = false; // Resend gère tout

let _init = false;
export function initEmailJS() { _init = true; }

// ── Envoi via Netlify Function → Resend avec tracking ────────
export async function sendEmail({ to, subject, body, emailId }) {
  const res = await fetch("/.netlify/functions/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey:  RESEND_API_KEY,
      from:    `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html:    bodyToHtml(body, emailId),
      text:    body,
      emailId,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur Resend");
  return { ok: true, demo: false, resendId: data.id };
}

function bodyToHtml(text, emailId) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div>${escaped}</div>
  <br><hr style="border:none;border-top:1px solid #eee;margin:20px 0">
  <p style="font-size:11px;color:#999">${FROM_NAME}</p>
</body></html>`;
}

export const sendRealEmail = sendEmail;
export const sendEmailJSFallback = sendEmail;
