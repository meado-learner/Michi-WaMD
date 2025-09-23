import fetch from 'node-fetch'

var handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `❐ Por favor ingresa el enlace del TikTok.`, m, { ...rcanal })
  try {
    await m.react('🕒')

    const endpoint = `https://api-adonix.gleeze.com/download/tiktok?apikey=Adofreekey&url=${encodeURIComponent(text)}`
    const res = await fetch(endpoint).then(r => r.json())
    if (!res?.status || !res?.data) throw '⚠︎ No se pudo obtener la información del TikTok.'

    const { title, author, thumbnail, duration, video, audio, likes, comments, shares, views } = res.data
    const canal = author?.name || author?.username || 'Desconocido'
    const duracion = `${Math.floor(duration / 60)}m ${duration % 60}s`

    const caption = `「✦」TikTok Descargado\n\n` +
                    `> ✐ Título » *${title}*\n` +
                    `> ✐ Canal » *${canal}*\n` +
                    `> ✐ Duración » *${duracion}*\n` +
                    `> ✐ Likes » *${likes}*\n` +
                    `> ✐ Comentarios » *${comments}*\n` +
                    `> ✐ Compartidos » *${shares}*\n` +
                    `> ✐ Vistas » *${views}*\n` +
                    `> ✐ Link » ${text}`

    
    await conn.sendMessage(m.chat, { video: { url: video }, caption, ...rcanal }, { quoted: m })

    await conn.sendMessage(m.chat, { audio: { url: audio }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg', ...rcanal }, { quoted: m })

    await m.react('✔️')
  } catch (error) {
    await m.react('✖️')
    return conn.reply(m.chat, `⚠︎ Ocurrió un error.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m, { ...rcanal })
  }
}

handler.tags = ['descargas']
handler.help = ['tiktok']
handler.command = ['tiktok', 'tt']
handler.group = true
handler.coin = 3

export default handler
