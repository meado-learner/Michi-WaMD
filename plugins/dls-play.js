import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`» Ingresa un texto o link de YouTube\n> *Ejemplo:* ${usedPrefix + command} ozuna`)

  try {
    let results, url

    
    let search = await yts(text)
    if (!search?.all || search.all.length === 0) return m.reply('No se encontraron resultados.')

    results = search.all[0]
    url = results.url

    if (command === 'play' || command === 'ytmp3') {
      let api2 = await (await fetch(`https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${url}`)).json()
      if (!api2?.data?.url) return m.reply('> No se pudo descargar el audio.')

      let txt = `「✦」Descargando *${results.title}*

> ✐ Canal » *${results.author?.name || '-'}*
> ⴵ Duración » *${results.timestamp || '-'}*
> ✰ Calidad » *${api2.data.quality || '128k'}*
> 🜸 Link » ${results.url}`

      await conn.sendMessage(m.chat, { image: { url: results.image }, caption: txt }, { quoted: m })

      await conn.sendMessage(m.chat, {
        audio: { url: api2.data.url },
        mimetype: 'audio/mpeg',
        fileName: `${results.title || 'audio'}.mp3`,
        ptt: false
      }, { quoted: m })

    } else if (command === 'play2' || command === 'ytmp4') {
      let api2 = await (await fetch(`https://api-adonix.ultraplus.click/download/ytmp4?apikey=Adofreekey&url=${url}`)).json()
      if (!api2?.data?.url) return m.reply('> No se pudo descargar el video.')

      let txt = `「✦」Descargando *${results.title}*

> ✐ Canal » *${results.author?.name || '-'}*
> ⴵ Duración » *${results.timestamp || '-'}*
> ✰ Calidad » *${api2.data.quality || '360p'}*
> 🜸 Link » ${results.url}`

      await conn.sendMessage(m.chat, { image: { url: results.image }, caption: txt }, { quoted: m })

      await conn.sendMessage(m.chat, {
        video: { url: api2.data.url },
        mimetype: 'video/mp4',
        fileName: `${results.title || 'video'}.mp4`,
        caption: '> ❑ Aquí tienes'
      }, { quoted: m })
    }

  } catch (e) {
    m.reply(`Error: ${e.message}`)
    m.react('✖️')
  }
}

handler.command = ['play', 'ytmp3', 'play2', 'ytmp4']
handler.help = ['play', 'ytmp3', 'play2', 'ytmp4']
handler.tags = ['descargas']

export default handler
