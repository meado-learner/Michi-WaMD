import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted || m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.sendMessage(m.chat, { text: `📎 Por favor responde a una imagen válida usando *${usedPrefix + command}*`, ...global.rcanal }, { quoted: m });

  if (!/image\/(jpe?g|png|webp)/.test(mime)) return conn.sendMessage(m.chat, { text: `✧ El formato (${mime}) no es compatible, usa JPG, PNG o WEBP.`, ...global.rcanal }, { quoted: m });

  await m.react('🕒');

  try {
    let media = await q.download();
    if (!media) throw '❌ No se pudo descargar la imagen';

    let linkData = await maybox(media, mime);
    if (!linkData?.data?.url) throw '❌ No se pudo subir la imagen a AdonixFiles';
    let uploadedUrl = linkData.data.url;

    await conn.sendMessage(m.chat, { text: `ꕤ Imagen subida con éxito, mejorando calidad...`, ...global.rcanal }, { quoted: m });

  
    const apiUrl = `https://api-adonix.ultraplus.click/canvas/hd?apikey=Adofreekey&url=${encodeURIComponent(uploadedUrl)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw '❌ Error al mejorar la imagen';
    const buffer = await res.buffer();

    await conn.sendMessage(m.chat, { image: buffer, caption: '> ❐ *Imagen mejorada con éxito*', ...global.rcanal }, { quoted: m });
    await m.react('✅');

  } catch (err) {
    console.error(err);
    await m.react('❌');
    await conn.sendMessage(m.chat, { text: '🚫 Hubo un error al mejorar la imagen, inténtalo de nuevo más tarde.', ...global.rcanal }, { quoted: m });
  }
};

handler.help = ['hd'];
handler.tags = ['tools'];
handler.command = ['remini', 'hd', 'enhance'];
export default handler;


async function maybox(content, mime) {
  const { ext } = (await fileTypeFromBuffer(content)) || { ext: 'bin' };
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const form = new FormData();
  const filename = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
  form.append('file', blob, filename);

  const res = await fetch('https://adonixfiles.mywire.org/upload', {
    method: 'POST',
    body: form,
    headers: { 'User-Agent': 'Michi-WaBot' }
  });

  return await res.json();
}
