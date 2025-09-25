import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob, File } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted || m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.reply(m.chat, `✎ Por favor responde a un archivo válido (imagen, video, documento, etc).`, m, rcanal);

  await m.react('🕒');

  try {
    let media = await q.download();
    let linkData = await maybox(media, mime);

    if (!linkData?.url) throw '✐ No se pudo subir el archivo';

    await conn.reply(m.chat, linkData.url, m, rcanal);
    await m.react('✅');
  } catch (err) {
    console.error(err);
    await m.react('❌');
    await conn.reply(m.chat, `☁︎ Hubo un error al subir el archivo a Files de Adonix. Intenta de nuevo más tarde.`, m, rcanal);
  }
};

handler.command = ['tourl'];
handler.tags = ['herramientas'];
handler.help = ['tourl']
//handler.coin = 12

export default handler;

async function maybox(content, mime) {
  const { ext } = (await fileTypeFromBuffer(content)) || { ext: 'bin' };
  const filename = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
  const form = new FormData();
  const blob = new Blob([content], { type: mime });
  form.append('file', new File([blob], filename, { type: mime }));

  const res = await fetch('https://adonixfiles.mywire.org/upload', {
    method: 'POST',
    body: form,
    headers: {
      'User-Agent': 'Michi-WaBot',
    }
  });

  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return await res.json();
}
