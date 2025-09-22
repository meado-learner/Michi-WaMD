import fetch from "node-fetch";
import yts from 'yt-search';
import { createCanvas, loadImage } from 'canvas';

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, `❀ Envía el nombre o link del vídeo para descargar.`, m);
    await m.react('🕒');

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text;

    const search = await yts(query);
    const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0];
    if (!result) throw 'ꕥ No se encontraron resultados.';

    const { title, seconds, views, url, thumbnail, author } = result;
    if (seconds > 2400) throw '⚠ Lo sentimos, este video excede la duración máxima de 40 minutos.';

    const vistas = formatViews(views);
    const duracion = formatDuration(seconds);
    const canal = author?.name || 'Desconocido';
    const calidad = ['play','yta','ytmp3','playaudio'].includes(command) ? '128k' : '360p';

    const infoData = { title, canal, duracion, vistas, calidad, url, seconds };
    const thumbWithText = await drawThumbnailWithProgress(thumbnail, infoData);

    if (['play', 'yta', 'ytmp3','playaudio'].includes(command)) {
      const audioUrl = await getYtmp3(url);
      if (!audioUrl) throw '⚠ Algo falló, no se pudo obtener el audio.';
      await conn.sendMessage(m.chat, { image: thumbWithText, caption: '> Procesando tu pedido..' }, { quoted: m });
      await conn.sendMessage(m.chat, { audio: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg', ptt: false }, { quoted: m });
      await m.react('✔️');

    } else if (['play2', 'ytv', 'ytmp4','mp4'].includes(command)) {
      const video = await getYtmp4(url);
      if (!video?.data) throw '⚠ Algo falló, no se pudo obtener el video.';
      await conn.sendMessage(m.chat, { image: thumbWithText, caption: '> Procesando tu pedido...' }, { quoted: m });
      await conn.sendMessage(m.chat, { video: video.data, fileName: `${title}.mp4`, mimetype: 'video/mp4', caption: '> » Video descargado correctamente.' }, { quoted: m });
      await m.react('✔️');
    }

  } catch (e) {
    await m.react('✖️');
    return conn.reply(m.chat, typeof e === 'string' ? e : '⚠ Se produjo un error.\n' + e.message, m);
  }
};

handler.command = handler.help = ['play','ytmp3','play2','ytmp4','mp4','mp3'];
handler.tags = ['descargas'];
handler.group = true;

export default handler;

async function getYtmp3(url) {
  try {
    const endpoint = `http://173.208.192.170/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint).then(r=>r.json());
    return res?.data?.url || null;
  } catch { return null; }
}

async function getYtmp4(url) {
  try {
    const endpoint = `https://api-adonix.ultraplus.click/download/ytmp4?apikey=Adofreekey&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint).then(r=>r.json());
    if(!res?.data?.url) return null;
    const finalUrl = await getFinalUrl(res.data.url);
    const videoBuffer = await fetch(finalUrl).then(r=>r.arrayBuffer());
    return { data: Buffer.from(videoBuffer), url: finalUrl };
  } catch { return null; }
}

async function getFinalUrl(url) {
  const res = await fetch(url, { method:'HEAD', redirect:'follow' });
  return res.url || url;
}

function formatViews(views) {
  if(!views) return "No disponible";
  if(views>=1_000_000_000) return `${(views/1_000_000_000).toFixed(1)} B (${views.toLocaleString()})`;
  if(views>=1_000_000) return `${(views/1_000_000).toFixed(1)} M (${views.toLocaleString()})`;
  if(views>=1_000) return `${(views/1_000).toFixed(1)} K (${views.toLocaleString()})`;
  return views.toString();
}

function formatDuration(seconds) {
  const min = Math.floor(seconds/60);
  const sec = seconds%60;
  return `${min}m ${sec}s`;
}

async function drawThumbnailWithProgress(thumbnailUrl, info) {
  const img = await loadImage(thumbnailUrl);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img,0,0);

  const infoHeight = 180;
  ctx.fillStyle='rgba(0,0,0,0.7)';
  ctx.fillRect(0,img.height-infoHeight,img.width,infoHeight);

  ctx.shadowColor='rgba(0,0,0,0.7)';
  ctx.shadowBlur=6;
  ctx.shadowOffsetX=2;
  ctx.shadowOffsetY=2;

  ctx.fillStyle='#FFFFFF';
  ctx.font='bold 36px sans-serif';
  ctx.textAlign='left';
  ctx.textBaseline='top';
  let title = info.title.length>50 ? info.title.slice(0,50)+'…': info.title;
  ctx.fillText(`🖊️ ${title}`,20,img.height-infoHeight+20);

  ctx.font='24px sans-serif';
  ctx.fillStyle='#CCCCCC';
  ctx.fillText(`📺 ${info.canal} | ⏱️ ${info.duracion}`,20,img.height-infoHeight+70);
  ctx.fillText(`👀 ${info.vistas} | 🎵 ${info.calidad}`,20,img.height-infoHeight+110);

  ctx.font='20px sans-serif';
  ctx.fillStyle='#AAAAAA';
  ctx.fillText(`🔗 ${info.url}`,20,img.height-infoHeight+150);

  
  const progressWidth = img.width - 40;
  const progressHeight = 10;
  const steps = 20;
  const currentStep = Math.floor(Math.random()*steps)+1; 

  for(let i=0;i<steps;i++){
    ctx.fillStyle=i<currentStep?'#FF0000':'#555555';
    ctx.fillRect(20+i*(progressWidth/steps),img.height-infoHeight-20,progressWidth/steps-2,progressHeight);
  }

  return canvas.toBuffer();
}