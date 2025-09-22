import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `✐ Ingresa un prompt válido.\n\nEjemplo:\n${usedPrefix + command} un dragón volando entre montañas`, m);

  try {
    await m.react("🕓");

    const url = `https://api-adonix.gleeze.com/ai/veo3?apikey=Adofreekey&prompt=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.status || !data.video) {
      return conn.reply(m.chat, "❒ No se pudo generar el contenido, intenta con otro prompt.", m);
    }

    const caption = `「✦」Veo3 Generator

✐ Prompt » *${text}*
🜸 Fuente » *Adonix API*`;

    await conn.sendMessage(m.chat, {
      video: { url: data.video },
      caption
    }, { quoted: m });

    await m.react("✔️");
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `⚠︎ Ocurrió un error al generar el contenido.\n> Usa *${usedPrefix}report* para informarlo.\n\n🜸 Detalles: ${e.message}`, m);
  }
};

handler.help = ["veo3"];
handler.tags = ["inteligencia artificial"];
handler.command = ["veo3"];

export default handler;
