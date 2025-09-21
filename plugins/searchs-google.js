import fetch from 'node-fetch';

let handler = async (m, { text, usedPrefix, args }) => {
  if (!text) return m.reply(`✩ Por favor, proporciona el término de búsqueda que deseas realizar a *Google*.\n\nEjemplo: ${usedPrefix}google gatos curiosos`);

  const apiUrl = `${global.APIs.delirius.url}/search/googlesearch?query=${encodeURIComponent(text)}`;
  const maxResults = Number(args[1]) || 3;

  try {
    await m.react('🕒');
Url);
    if (!response.ok) throw new Error('No se pudo conectar con la API');

    const result = await response.json();
    if (!result.status || !Array.isArray(result.data) || !result.data.length) {
      await m.react('✖️');
      return m.reply('ꕥ No se encontraron resultados para esa búsqueda.');
    }

    let replyMessage = `「ᜊ」Resultados de búsqueda para *<${text}>*\n\n`;
    result.data.slice(0, maxResults).forEach((item, index) => {
      replyMessage += `> ✐ Título » *${index + 1}. ${item.title || 'Sin título'}*\n`;
      replyMessage += `> ⴵ Descripción » ${item.description ? `*${item.description}*` : '_Sin descripción_'}\n`;
      replyMessage += `> 🜸 Link » ${item.url || '_Sin url_'}\n\n`;
    });

    await m.reply(replyMessage.trim());
    await m.react('✔️');
  } catch (error) {
    await m.react('✖️');
    m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}.`);
  }
};

handler.help = ['search'];
handler.command = ['search', 'google'];
handler.group = true;

export default handler;
