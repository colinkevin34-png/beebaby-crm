import emailjs from '@emailjs/browser';

// ============================================================
//  EMAILJS — Colle tes 3 valeurs ici après avoir suivi le guide
//  → https://www.emailjs.com
// ============================================================
export const EMAILJS_CONFIG = {
  serviceId:  'service_v8pz3jr',   // Email Services → ton Service ID
  templateId: 'template_bk4xmm7',  // Email Templates → ton Template ID
  publicKey:  '43JR-x7GmnA-RNrt-',   // Account → General → Public Key
};
export const FROM_EMAIL = 'beebaby.microcreche@gmail.com';
export const FROM_NAME  = 'Bee Baby Micro-crèche';
// ============================================================

export const EMAILJS_READY = !EMAILJS_CONFIG.serviceId.startsWith('REMPLACE');

let initialized = false;
export function initEmailJS() {
  if (!initialized && EMAILJS_READY) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    initialized = true;
  }
}

export async function sendRealEmail({ to, subject, body }) {
  if (!EMAILJS_READY) {
    return { ok: false, demo: true };
  }
  await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
    from_name:  FROM_NAME,
    from_email: FROM_EMAIL,
    to_email:   to,
    subject,
    message:    body,
    reply_to:   FROM_EMAIL,
  });
  return { ok: true };
}
