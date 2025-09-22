import fetch from "node-fetch";
import yts from 'yt-search';
import { createCanvas, loadImage, registerFont } from 'canvas';


// registerFont('./fonts/Roboto-Bold.ttf', { family: 'Roboto' });

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

    if (seconds > 2400) throw '> ❐ Lo sentimos, este video excede la duración máxima de 40 minutos.';

    const vistas = formatViews(views);
    const duracion = formatDuration(seconds);
    const canal = author?.name || 'Desconocido';

    const info = `「✦」Descargando *<${title}>*
> ✐ Canal » *${canal}*
> ⴵ Duración » *${duracion}*
> ✰ Calidad » *${['play','yta','ytmp3','playaudio'].includes(command) ? '128k' : '360p'}*
> 🜸 Link » ${url}
> ⟡ Vistas » *${vistas}*`;

    // Genera miniatura con info
    const thumbWithText = await drawThumbnailWithText(thumbnail, info);

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      console.log('[INFO] Descargando audio...');
      const audioUrl = await getYtmp3(url);
      if (!audioUrl) throw '> ⚠ Algo falló, no se pudo obtener el audio.';
      console.log('[INFO] URL de audio obtenida:', audioUrl);

      console.log('[INFO] Enviando miniatura con info...');
      await conn.sendMessage(m.chat, { image: thumbWithText, caption: '> Audio listo para reproducir' }, { quoted: m });

      console.log('[INFO] Enviando audio...');
      await conn.sendMessage(m.chat, { audio: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg', ptt: false }, { quoted: m });

      await m.react('✔️');
      console.log('[SUCCESS] Audio enviado correctamente');

    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      console.log('[INFO] Descargando video...');
      const video = await getYtmp4(url);
      if (!video?.data) throw '⚠ Algo falló, no se pudo obtener el video.';
      console.log('[INFO] Video obtenido');

      console.log('[INFO] Enviando miniatura con info...');
      await conn.sendMessage(m.chat, { image: thumbWithText, caption: '> Video listo para descargar' }, { quoted: m });

      console.log('[INFO] Enviando video...');
      await conn.sendMessage(m.chat, { video: video.data, fileName: `${title}.mp4`, mimetype: 'video/mp4', caption: '> » Video descargado correctamente.' }, { quoted: m });

      await m.react('✔️');
      console.log('[SUCCESS] Video enviado correctamente');
    }

  } catch (e) {
    await m.react('✖️');
    console.error('[ERROR]', e);
    return conn.reply(m.chat, typeof e === 'string' ? e : '⚠ Se produjo un error.\n' + e.message, m);
  }
};

handler.command = handler.help = ['play', 'ytmp3', 'play2', 'ytmp4', 'mp4', 'mp3'];
handler.tags = ['descargas'];
handler.group = true;

export default handler;

// ================= FUNCIONES AUX =================

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

    const videoBuffer = await fetch(finalUrl).then(r => r.arrayBuffer());
    return { data: Buffer.from(videoBuffer), url: finalUrl };
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

// ================= CANVAS =================

async function drawThumbnailWithText(thumbnailUrl, infoText) {
  const img = await loadImage(thumbnailUrl);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  
  ctx.drawImage(img, 0, 0);

  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, img.height - 140, img.width, 140);

  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = infoText.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 20, img.height - 130 + i * 32);
  });

  return canvas.toBuffer();
}