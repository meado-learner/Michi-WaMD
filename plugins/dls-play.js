import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`» Ingresa un texto o link de YouTube\n> *Ejemplo:* ${usedPrefix + command} ozuna`);

  try {
    let results;
    
    if (text.includes("youtube.com") || text.includes("youtu.be")) {
      results = { url: text };
    } else {
      let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`)).json();
      if (!api?.data || api.data.length === 0) return m.reply('No se encontraron resultados.');
      results = api.data[0];
    }

    let txt = `❐ *${results.title || 'Resultado Encontrado'}*

> ✦ *Canal* » ${results.author?.name || '-'}
> ⴵ *Duración:* » ${results.duration || '-'}
> ✰ *Vistas:* » ${results.views || '-'}
> ✐ *Publicación* » ${results.publishedAt || '-'}
> 🜸 *Link* » ${results.url}`;

    if (results.image) {
      await conn.sendMessage(m.chat, { image: { url: results.image }, caption: txt }, { quoted: m });
    } else {
      await m.reply(txt);
    }

    let api2 = await (await fetch(`https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${results.url}`)).json();

    if (!api2?.data?.url) return m.reply('No se pudo descargar el audio.');

    await conn.sendMessage(m.chat, {
      audio: { url: api2.data.url },
      mimetype: 'audio/mpeg',
      fileName: `${results.title || 'audio'}.mp3`,
      ptt: false
    }, { quoted: m });

  } catch (e) {
    m.reply(`Error: ${e.message}`);
    m.react('✖️');
  }
};

handler.command = ['play', 'ytmp3'];
handler.help = ['play', 'ytmp3'];
handler.tags = ['descargas'];
//handler.coin = 25

export default handler;
