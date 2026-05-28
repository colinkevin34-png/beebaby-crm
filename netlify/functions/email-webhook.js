// Netlify Function : /.netlify/functions/email-webhook
// Reçoit les webhooks Resend (ouverture, clic, bounce, etc.)
// et met à jour Firebase en temps réel

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }        = require('firebase-admin/firestore');

// Firebase Admin (variables d'env Netlify)
let db;
function getDB() {
  if (!db) {
    initializeApp({
      credential: cert({
        projectId:    process.env.FIREBASE_PROJECT_ID    || 'prospectcrm-33b44',
        clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    db = getFirestore();
  }
  return db;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const { type, data } = payload;
    const emailId = data?.email_id || data?.tags?.find(t=>t.name==='emailId')?.value;

    if (!emailId) return { statusCode: 200, body: 'no emailId' };

    const firestore = getDB();
    const emailsRef = firestore.collection('emails');

    // Chercher l'email par resendId
    const snap = await emailsRef.where('resendId', '==', emailId).limit(1).get();
    if (snap.empty) return { statusCode: 200, body: 'email not found' };

    const docRef = snap.docs[0].ref;
    const now    = new Date().toISOString();

    switch (type) {
      case 'email.opened':
        await docRef.update({
          opened: true,
          openedAt: now,
          openCount: (snap.docs[0].data().openCount || 0) + 1,
          lastOpenedAt: now,
        });
        break;

      case 'email.clicked':
        await docRef.update({
          clicked: true,
          clickedAt: now,
          clickCount: (snap.docs[0].data().clickCount || 0) + 1,
          lastClickedAt: now,
          clickedUrl: data?.click?.link || null,
        });
        break;

      case 'email.bounced':
        await docRef.update({ bounced: true, bouncedAt: now, bounceReason: data?.bounce?.type });
        break;

      case 'email.spam_complaint':
        await docRef.update({ spam: true, spamAt: now });
        break;

      case 'email.delivery_delayed':
        await docRef.update({ delayed: true, delayedAt: now });
        break;
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, type }) };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: err.message };
  }
};
