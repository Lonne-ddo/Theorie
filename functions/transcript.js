export async function onRequest(context) {
  const url = new URL(context.request.url);
  const videoId = url.searchParams.get('v');
  const lang = url.searchParams.get('lang') || 'fr';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Missing video ID' }), { headers });
  }

  try {
    // Try auto-generated captions first, then manual
    const langs = [lang, lang === 'fr' ? 'en' : 'fr', 'a.' + lang, 'a.en'];
    let text = '';
    let usedLang = '';

    for (var i = 0; i < langs.length; i++) {
      const l = langs[i];
      const tUrl = 'https://www.youtube.com/api/timedtext?v=' + videoId + '&lang=' + l + '&fmt=json3';
      try {
        const res = await fetch(tUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.events && data.events.length > 0) {
          text = data.events
            .filter(function(e) { return e.segs; })
            .map(function(e) {
              return e.segs.map(function(s) { return s.utf8 || ''; }).join('');
            })
            .join(' ')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          usedLang = l;
          break;
        }
      } catch(e) { continue; }
    }

    if (!text) {
      return new Response(JSON.stringify({ error: 'no_transcript', message: 'No transcript available for this video.' }), { headers });
    }

    return new Response(JSON.stringify({ text, lang: usedLang, videoId }), { headers });

  } catch(err) {
    return new Response(JSON.stringify({ error: err.message }), { headers });
  }
}
