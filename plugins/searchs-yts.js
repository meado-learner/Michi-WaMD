import yts from 'yt-search'

var handler = async (m, { text, conn, args, command, usedPrefix }) => {
if (!text) return conn.reply(m.chat, `❀ Por favor, ingresa una búsqueda de Youtube.`, m)
try {
  await m.react('🕒')
  let results = await yts(text)
  let videos = results.all.filter(v => v.type === 'video')
  let teks = `「✦」Resultados de la búsqueda para *${text}*\n\n` + videos.map(v => `
❐ *${v.title}*
> ✐ Canal » *${v.author.name}*
> ⴵ Duración » *${v.timestamp}*
> ✐ Subido » *${v.ago}*
> ✰ Vistas » *${v.views.toLocaleString()}*
> 🜸 Link » _${v.url}_`).join('\n\n')
  
  await conn.sendFile(m.chat, videos[0].thumbnail, 'yts.jpeg', teks, m)
  await m.react('✔️')
} catch (e) {
  await m.react('✖️')
  conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e.message, m)
}}

handler.help = ['ytsearch']
handler.tags = ['buscadores']
handler.command = ['ytbuscar', 'ytsearch', 'yts']
handler.group = true
handler.coin = 12

export default handler
