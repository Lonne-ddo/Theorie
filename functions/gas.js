export async function onRequest(context) {
  const url = new URL(context.request.url);
  const params = url.searchParams.toString();
  const GAS = 'https://script.google.com/macros/s/AKfycbzF3q2HqF49UdZaNvDWKoqtVErWkX7QQAxULw6ZETPWrX6Um9H9X9PjWxVkbkxZBL7M1w/exec';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    if (context.request.method === 'POST') {
      const body = await context.request.text();
      const res = await fetch(GAS, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: body,
        redirect: 'follow'
      });
      const text = await res.text();
      return new Response(text, { headers });
    } else {
      const res = await fetch(GAS + (params ? '?' + params : ''), {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const text = await res.text();
      try {
        JSON.parse(text);
        return new Response(text, { headers });
      } catch(e) {
        return new Response(JSON.stringify({ error: 'GAS_ERROR', raw: text.slice(0, 300) }), { headers });
      }
    }
  } catch(err) {
    return new Response(JSON.stringify({ error: err.message }), { headers });
  }
}
