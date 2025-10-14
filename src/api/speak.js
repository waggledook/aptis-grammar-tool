export async function getTtsUrl({ text, voice = 'en-GB-Neural2-C', rate = 1.0, pitch = 0, format = 'mp3' }) {
    const r = await fetch('/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, rate, pitch, format }),
    });
    if (!r.ok) throw new Error(`speak failed: ${r.status}`);
    return r.json(); // { url, cached }
  }
  