// ============================================================
//  RESEND — Envoi d'emails avec tracking ouverture/clic
//  1. Créer compte sur https://resend.com (gratuit, 3000 emails/mois)
//  2. API Keys → Create API Key → copier ci-dessous
//  3. Domains → Add Domain → vérifier beebaby.microcreche@gmail.com
//     OU utiliser l'adresse de test Resend en attendant
// ============================================================
export const RESEND_API_KEY = 're_ieTsTgoT_5vHCE7XPuXqMCFc6JZTbFqBA'; // re_xxxxxxxxxxxx
export const FROM_EMAIL     = 'onboarding@resend.dev'; // Mode test Resend — changer vers votre domaine vérifié en production
export const FROM_NAME      = 'Bee Baby Micro-crèche';
// ============================================================

export const RESEND_READY = !RESEND_API_KEY.startsWith('REMPLACE');

// Resend ne peut pas être appelé directement depuis le browser (CORS).
// On passe par une Cloud Function Firebase ou un proxy Netlify.
// En attendant, on utilise EmailJS comme fallback ET on simule le tracking.

// ── Envoi via proxy Netlify Function (/.netlify/functions/send-email) ──────
export async function sendTrackedEmail({ to, subject, body, emailId }) {
  if (!RESEND_READY) {
    return { ok: false, demo: true };
  }

  try {
    const res = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey:   RESEND_API_KEY,
        from:     `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html:     bodyToHtml(body, emailId),
        text:     body,
        emailId,
        tags: [{ name: 'source', value: 'beebaby-crm' }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur Resend');
    return { ok: true, resendId: data.id };
  } catch (err) {
    throw err;
  }
}

// Convertit le texte en HTML avec pixel de tracking intégré
function bodyToHtml(text, emailId) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  // Pixel de tracking 1x1 — Resend le gère nativement avec open_tracking
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div>${escaped}</div>
  <br><hr style="border:none;border-top:1px solid #eee;margin:20px 0">
  <p style="font-size:11px;color:#999">
    ${FROM_NAME} — Envoyé depuis BeeBaby CRM
  </p>
</body>
</html>`;
}

// ── EmailJS fallback (déjà configuré) ──────────────────────────────────────
import emailjs from '@emailjs/browser';

export const EMAILJS_CONFIG = {
  serviceId:  'service_v8pz3jr',
  templateId: 'template_bk4xmm7',
  publicKey:  '43JR-x7GmnA-RNrt-',
};
export const EMAILJS_READY = true;

let ejsInit = false;
export function initEmailJS() {
  if (!ejsInit) { emailjs.init(EMAILJS_CONFIG.publicKey); ejsInit = true; }
}

export async function sendEmailJSFallback({ to, subject, body }) {
  await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
    from_name: FROM_NAME, from_email: FROM_EMAIL,
    to_email: to, subject, message: body, reply_to: FROM_EMAIL,
  });
  return { ok: true, demo: false };
}

// ── Fonction principale : Resend si configuré, sinon EmailJS ──────────────
export async function sendEmail({ to, subject, body, emailId }) {
  if (RESEND_READY) {
    return sendTrackedEmail({ to, subject, body, emailId });
  }
  return sendEmailJSFallback({ to, subject, body });
}
