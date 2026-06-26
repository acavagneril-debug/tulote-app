const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { email, nombre } = JSON.parse(event.body);

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      attributes: { NOMBRE: nombre, FUENTE: 'tulote.app' },
      listIds: [parseInt(process.env.BREVO_LIST_ID) || 2],
      updateEnabled: true,
    }),
  });

  const status = response.status;
  if (status === 204 || status === 201 || status === 400) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 500, body: JSON.stringify({ error: 'Error Brevo' }) };
};
