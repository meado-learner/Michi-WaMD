import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`» Ingresa Un Texto Para Buscar En Youtube\n> *Ejemplo:* ${usedPrefix + command} ozuna`);

  try {
  
    let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${text}`)).json();
    let results = api.data[0];

    let txt = `*「✦」 ${results.title}*

> ✦ *Canal* » ${results.author.name}
> ⴵ *Duración:* » ${results.duration}
> ✰ *Vistas:* » ${results.views}
> ✐ *Publicación* » ${results.publishedAt}
> 🜸 *Link* » ${results.url}`;

    let img = results.image;

    await conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: m });

    
    let api2 = await (await fetch(`https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${results.url}`)).json();

    if (!api2?.data?.url) return m.reply('No se pudo descargar el audio.');

    await conn.sendMessage(m.chat, {
      audio: { url: api2.data.url },
      mimetype: 'audio/mpeg',
      fileName: `${results.title}.mp3`,
      ptt: true
    }, { quoted: m });

  } catch (e) {
    m.reply(`Error: ${e.message}`);
    m.react('✖️');
  }
};

handler.command = ['play'];
handler.help = ['play']
handler.tags = ['descargas']
//handler.coin = 2

export default handler;
