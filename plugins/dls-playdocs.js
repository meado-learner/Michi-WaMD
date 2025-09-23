import fetch from "node-fetch";
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    console.log('[INFO] Comando recibido:', command, 'Texto:', text);

    if (!text?.trim()) {
      console.log('[WARN] No se envió texto para buscar');
      return conn.reply(m.chat, `❀ Envía el nombre o link del vídeo para descargar.`, m);
    }

    await m.react('🕒');
    console.log('[INFO] Emoji de espera enviado');

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text;
    console.log('[INFO] Query detectada:', query);

    const search = await yts(query);
    console.log('[INFO] Resultados de búsqueda obtenidos');

    const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0];
    if (!result) throw 'ꕥ No se encontraron resultados.';

    const { title, seconds, views, url, thumbnail, author } = result;
    console.log(`[INFO] Video seleccionado: ${title} | ${seconds}s | ${views} vistas | ${url}`);

    if (seconds > 2400) throw '❐ Lo sentimos, este video excede la duración máxima de 40 minutos. Esta limitación se aplica para evitar saturación en el bot y garantizar un rendimiento estable.';

    const vistas = formatViews(views);
    const duracion = formatDuration(seconds);
    const canal = author?.name || 'Desconocido';

    if (['mp3doc', 'ytmp3doc'].includes(command)) {
      console.log('[INFO] Descargando audio...');
      const audioUrl = await getYtmp3(url);
      if (!audioUrl) throw '> ⚠ Algo falló, no se pudo obtener el audio.';
      console.log('[INFO] URL de audio obtenida:', audioUrl);

      const info = `「✦」Descargando *<${title}>*

> ✐ Canal » *${canal}*
> ⴵ Duración » *${duracion}*
> ✰ Calidad: *128k*
> 🜸 Link » ${url}
> ⟡ Vistas » *${vistas}*`;

      console.log('[INFO] Enviando info...');
      await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m });

      console.log('[INFO] Enviando audio como documento...');
      await conn.sendMessage(m.chat, { document: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });

      await m.react('✔️');
      console.log('[SUCCESS] Audio enviado como documento correctamente');

    } else if (['mp4doc', 'ytmp4doc'].includes(command)) {
      console.log('[INFO] Descargando video...');
      const video = await getYtmp4(url);
      if (!video?.data) throw '⚠ Algo falló, no se pudo obtener el video.';
      console.log('[INFO] Video obtenido');

      const info = `「✦」Descargando *<${title}>*

> ✐ Canal » *${canal}*
> ⴵ Duración » *${duracion}*
> ✰ Calidad: *360p*
> 🜸 Link » ${url}
> ⟡ Vistas » *${vistas}*`;

      console.log('[INFO] Enviando info...');
      await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m });

      console.log('[INFO] Enviando video como documento...');
      await conn.sendMessage(m.chat, { document: { url: video.url }, fileName: `${title}.mp4`, mimetype: 'video/mp4' }, { quoted: m });

      await m.react('✔️');
      console.log('[SUCCESS] Video enviado como documento correctamente');
    }

  } catch (e) {
    await m.react('✖️');
    console.error('[ERROR]', e);
    return conn.reply(m.chat, typeof e === 'string' ? e : '⚠ Se produjo un error.\n' + e.message, m);
  }
};

handler.command = handler.help = ['mp3doc', 'ytmp3doc', 'mp4doc', 'ytmp4doc'];
handler.tags = ['descargas'];
handler.coin = 31

export default handler;

async function getYtmp3(url) {
  try {
    console.log('[INFO] Llamando API YTMP3');
    const endpoint = `http://173.208.192.170/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint, { redirect: 'follow' }).then(r => r.json());
    console.log('[INFO] Respuesta API YTMP3:', res);
    if (!res?.data?.url) return null;
    return res.data.url;
  } catch (err) {
    console.error('[ERROR] getYtmp3', err);
    return null;
  }
}

async function getYtmp4(url) {
  try {
    console.log('[INFO] Llamando API YTMP4');
    const endpoint = `https://api-adonix.ultraplus.click/download/ytmp4?apikey=Adofreekey&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint).then(r => r.json());
    console.log('[INFO] Respuesta API YTMP4:', res);
    if (!res?.data?.url) return null;

    const finalUrl = await getFinalUrl(res.data.url);
    console.log('[INFO] URL final del video:', finalUrl);

    return { data: Buffer.from(await fetch(finalUrl).then(r => r.arrayBuffer())), url: finalUrl };
  } catch (err) {
    console.error('[ERROR] getYtmp4', err);
    return null;
  }
}

async function getFinalUrl(url) {
  console.log('[INFO] Resolviendo URL final...');
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  return res.url || url;
}

function formatViews(views) {
  if (views === undefined) return "No disponible";
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)} B (${views.toLocaleString()})`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} M (${views.toLocaleString()})`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)} K (${views.toLocaleString()})`;
  return views.toString();
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min} minutos ${sec} segundos`;
}
