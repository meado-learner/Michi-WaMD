import fetch from "node-fetch";

const testYtmp3 = async (m, { conn, text }) => {
  try {
    console.log('[INFO] Comando de prueba recibido');
    if (!text?.trim()) {
      console.log('[WARN] No se envió URL o nombre del video');
      return conn.reply(m.chat, '❀ Envía un link de YouTube para probar la API.', m);
    }

    await m.react('🕒');
    console.log('[INFO] Emoji de espera enviado');

    const endpoint = `https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(text)}`;
    console.log('[INFO] Llamando API con GET:', endpoint);

    const res = await fetch(endpoint, { method: 'GET', redirect: 'follow' }).then(r => r.json());
    console.log('[INFO] Respuesta API recibida:', res);

    if (!res?.status || !res?.data?.url) {
      console.error('[ERROR] No se pudo obtener el audio');
      await m.react('✖️');
      return conn.reply(m.chat, '⚠ No se pudo obtener el audio desde la API', m);
    }

    const { title, url } = res.data;
    console.log('[INFO] Título del audio:', title);
    console.log('[INFO] URL de audio:', url);

    await conn.sendMessage(m.chat, {
      audio: { url },
      fileName: `${title}.mp3`,
      mimetype: 'audio/mpeg'
    }, { quoted: m });

    await m.react('✔️');
    console.log('[SUCCESS] Audio enviado correctamente');

  } catch (err) {
    console.error('[ERROR] Comando de prueba:', err);
    await m.react('✖️');
    return conn.reply(m.chat, '⚠ Se produjo un error al descargar el audio\n' + (err.message || err), m);
  }
};

testYtmp3.command = ['testytmp3'];
testYtmp3.tags = ['descargas'];
testYtmp3.group = true;

export default testYtmp3;
