import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, `❀ Envía el nombre o link del vídeo para descargar.`, m)
    await m.react('🕒')

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
    const search = await yts(query)
    const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]

    if (!result) throw 'ꕥ No se encontraron resultados.'
    const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result
    if (seconds > 1620) throw '⚠ El video supera el límite de duración (27 minutos).'

    const vistas = formatViews(views)
    const thumb = (await conn.getFile(thumbnail)).data

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      const audio = await getAud(url)
      if (!audio?.data) throw '> ⚠ Algo sucedió mal, no se pudo obtener el audio.'

      const info = `> ✿ Descargando *<${title}>*\n\n> ✩ Canal » *${author.name}*\n> ✐ Vistas » *${vistas}*\n> ✧︎ Duración » *${timestamp}*\n> ❐ Publicado » *${ago}*\n> ➪ Link » ${url}`

      await conn.sendMessage(m.chat, {
        text: info,
        contextInfo: {
          externalAdReply: {
            title: '',
            body: `ꕤ API: ${audio.api}`,
            thumbnail: thumb,
            mediaType: 2,
            mediaUrl: 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O',
            sourceUrl: url
          }
        }
      }, { quoted: m })

      // 🔥 Enviar audio desde la URL final
      await conn.sendMessage(m.chat, {
        audio: { url: audio.finalUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
      }, { quoted: m })

      await m.react('✔️')

    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      const video = await getVid(url)
      if (!video?.data) throw '⚠ Algo sucedió mal, no se pudo obtener el video.'

      const info = `✿ Descargando *<${title}>*\n\n> ✩ Canal » *${author.name}*\n> ✐ Vistas » *${vistas}*\n> ✧︎ Duración » *${timestamp}*\n> ❐ Publicado » *${ago}*\n> ➪ Link » ${url}`

      await conn.sendMessage(m.chat, {
        text: info,
        contextInfo: {
          externalAdReply: {
            title: '',
            body: `ꕤ API: ${video.api}`,
            thumbnail: thumb,
            mediaType: 2,
            mediaUrl: 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O',
            sourceUrl: url
          }
        }
      }, { quoted: m })

      // 🔥 Enviar video desde la URL final
      await conn.sendMessage(m.chat, {
        video: { url: video.finalUrl },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
      }, { quoted: m })

      await m.react('✔️')
    }

  } catch (e) {
    await m.react('✖️')
    return conn.reply(m.chat, typeof e === 'string' ? e : '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + e.message, m)
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']
handler.group = true

export default handler

// --- FUNCIONES DE DESCARGA ---
async function getAud(url) {
  const endpoint = `${global.APIs.adonix.url}/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(url)}`
  try {
    const res = await fetch(endpoint).then(r => r.json())
    if (!res?.data?.url) return null

    // 🔥 Resolver redirección al estilo Maycol
    const head = await fetch(res.data.url, { method: "HEAD", redirect: "follow" })
    const finalUrl = head.url

    return { data: Buffer.alloc(0), api: 'Adonix', url: res.data.url, finalUrl } // data vacío porque enviamos URL directo
  } catch {
    return null
  }
}

async function getVid(url) {
  const endpoint = `${global.APIs.adonix.url}/download/ytmp4?apikey=Adofreekey&url=${encodeURIComponent(url)}`
  try {
    const res = await fetch(endpoint).then(r => r.json())
    if (!res?.data?.url) return null

    const head = await fetch(res.data.url, { method: "HEAD", redirect: "follow" })
    const finalUrl = head.url

    return { data: Buffer.alloc(0), api: 'Adonix', url: res.data.url, finalUrl }
  } catch {
    return null
  }
}

// --- FORMATO DE VISTAS ---
function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)} Billones (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} Millones (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)} Mil (${views.toLocaleString()})`
  return views.toString()
}
