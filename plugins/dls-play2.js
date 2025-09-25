import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`» Ingresa un texto o link de YouTube\n> *Ejemplo:* ${usedPrefix + command} ozuna`);

  try {
    let url, results, txt, img;

    let ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
    if (ytRegex.test(text)) {
      url = text;
    } else {
      let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${text}`)).json();
      results = api.data[0];
      url = results.url;

      txt = `*❐ ${results.title}*

> ✦ *Canal* » ${results.author.name}
> ⴵ *Duración:* » ${results.duration}
> ✰ *Vistas:* » ${results.views}
> ✐ *Publicación* » ${results.publishedAt}
> 🜸 *Link* » ${results.url}`;

      img = results.image;
      await conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: m });
    }

    let api2 = await (await fetch(`https://api-adonix.ultraplus.click/download/ytmp4?apikey=Adofreekey&url=${url}`)).json();

    if (!api2?.data?.url) return m.reply('❌ No se pudo descargar el video.');

    await conn.sendMessage(m.chat, {
      video: { url: api2.data.url },
      mimetype: 'video/mp4',
      fileName: `${results ? results.title : 'video'}.mp4`,
      caption: '> ❑ Aqui tienes'
    }, { quoted: m });

  } catch (e) {
    m.reply(`Error: ${e.message}`);
    m.react('✖️');
  }
};

handler.command = ['play2', 'ytmp4'];
handler.help = ['play2', 'ytmp4'];
handler.tags = ['descargas'];
//handler.coin = 25;

export default handler;
