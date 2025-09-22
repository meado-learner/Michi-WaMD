import fetch from "node-fetch"
import yts from "yt-search"
import fs from "fs"
import { exec } from "child_process"
import path from "path"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, `❀ Envía el nombre o link del vídeo para descargar.`, m)

    await m.react("🕒")

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
    const query = videoMatch ? "https://youtu.be/" + videoMatch[1] : text

    const search = await yts(query)
    const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
    if (!result) throw "ꕥ No se encontraron resultados."

    const { title, seconds, views, url, thumbnail, author } = result
    if (seconds > 2400) throw "> ❐ Este video excede la duración máxima de 40 minutos."

    const vistas = formatViews(views)
    const duracion = formatDuration(seconds)
    const canal = author?.name || "Desconocido"

    if (["play", "yta", "ytmp3", "playaudio", "mp3"].includes(command)) {
      const audioUrl = await getYtmp3(url)
      if (!audioUrl) throw "> ⚠ No se pudo obtener el audio."

      const info = `「✦」Descargando *<${title}>*

> ✐ Canal » *${canal}*
> ⴵ Duración » *${duracion}*
> ✰ Calidad: *128k*
> 🜸 Link » ${url}
> ⟡ Vistas » *${vistas}*`

      await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

      const tempFile = path.join("./temp", `${Date.now()}.mp3`)
      const outputFile = path.join("./temp", `${Date.now()}_bass.ogg`)

      const res = await fetch(audioUrl)
      const buffer = await res.arrayBuffer()
      fs.writeFileSync(tempFile, Buffer.from(buffer))

      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${tempFile}" -af "bass=g=5" -c:a libopus -b:a 128k "${outputFile}"`, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      await conn.sendMessage(
        m.chat,
        { audio: fs.readFileSync(outputFile), fileName: `${title}.ogg`, mimetype: "audio/ogg; codecs=opus", ptt: true },
        { quoted: m }
      )

      fs.unlinkSync(tempFile)
      fs.unlinkSync(outputFile)

      await m.react("✔️")
    }

    if (["play2", "ytv", "ytmp4", "mp4"].includes(command)) {
      const video = await getYtmp4(url)
      if (!video?.data) throw "⚠ No se pudo obtener el video."

      const info = `「✦」Descargando *<${title}>*

> ✐ Canal » *${canal}*
> ⴵ Duración » *${duracion}*
> ✰ Calidad: *360p*
> 🜸 Link » ${url}
> ⟡ Vistas » *${vistas}*`

      await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

      await conn.sendMessage(
        m.chat,
        { video: video.data, fileName: `${title}.mp4`, mimetype: "video/mp4", caption: "> » Video descargado correctamente." },
        { quoted: m }
      )

      await m.react("✔️")
    }
  } catch (e) {
    await m.react("✖️")
    return conn.reply(m.chat, typeof e === "string" ? e : "⚠ Se produjo un error.\n" + e.message, m)
  }
}

handler.command = handler.help = ["play", "ytmp3", "play2", "ytmp4", "mp4", "mp3"]
handler.tags = ["descargas"]
handler.group = true

export default handler

async function getYtmp3(url) {
  try {
    const endpoint = `http://173.208.192.170/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(url)}`
    const res = await fetch(endpoint, { redirect: "follow" }).then(r => r.json())
    if (!res?.data?.url) return null
    return res.data.url
  } catch {
    return null
  }
}

async function getYtmp4(url) {
  try {
    const endpoint = `https://api-adonix.ultraplus.click/download/ytmp4?apikey=Adofreekey&url=${encodeURIComponent(url)}`
    const res = await fetch(endpoint).then(r => r.json())
    if (!res?.data?.url) return null

    const finalUrl = await getFinalUrl(res.data.url)
    const videoBuffer = await fetch(finalUrl).then(r => r.arrayBuffer())
    return { data: Buffer.from(videoBuffer), url: finalUrl }
  } catch {
    return null
  }
}

async function getFinalUrl(url) {
  const res = await fetch(url, { method: "HEAD", redirect: "follow" })
  return res.url || url
}

function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)} B`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)} K`
  return views.toString()
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min} minutos ${sec} segundos`
}