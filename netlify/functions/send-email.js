const { Resend } = require('resend');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { apiKey, from, to, subject, html, text, emailId } = JSON.parse(event.body);
    if (!apiKey || !to || !subject) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      text,
      reply_to: 'beebaby.microcreche@gmail.com',
      tags: [{ name: 'emailId', value: emailId || 'crm-' + Date.now() }],
    });

    if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ id: data.id, ok: true }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
