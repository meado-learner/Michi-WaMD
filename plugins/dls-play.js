import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, `❀ Envía el nombre o link del vídeo para descargar.`, m);
    await m.react('🕒');

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text;
    const search = await yts(query);
    const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0];

    if (!result) throw 'ꕥ No se encontraron resultados.';
    const { title, timestamp, views, url } = result;
    if (result.seconds > 1620) throw '⚠ El video supera el límite de duración (27 minutos).';

    const vistas = formatViews(views);

    let apiUrl;
    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      apiUrl = `${global.APIs.adonix.url}/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(url)}`;
      await conn.sendMessage(m.chat, {
        audio: { url: apiUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m });

      await m.react('✔️');

    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      apiUrl = `${global.APIs.adonix.url}/download/ytmp4?apikey=Adofreekey&url=${encodeURIComponent(url)}`;
      await conn.sendMessage(m.chat, {
        video: { url: apiUrl },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      }, { quoted: m });

      await m.react('✔️');
    }

  } catch (e) {
    await m.react('✖️');
    return conn.reply(m.chat, typeof e === 'string' ? e : '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + e.message, m);
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4'];
handler.tags = ['descargas'];
handler.group = true;

export default handler;

function formatViews(views) {
  if (views === undefined) return "No disponible";
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)} Billones (${views.toLocaleString()})`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} Millones (${views.toLocaleString()})`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)} Mil (${views.toLocaleString()})`;
  return views.toString();
}
