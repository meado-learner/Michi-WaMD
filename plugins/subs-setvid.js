import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

async function uploadToAdonix(content, mime) {
  const { ext } = (await fileTypeFromBuffer(content)) || { ext: "mp4" }
  const blob = new Blob([content], { type: mime })
  const form = new FormData()
  const filename = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}.${ext}`
  form.append("file", blob, filename)

  const res = await fetch("https://adonixfiles.mywire.org/upload", {
    method: "POST",
    body: form,
    headers: {
      "User-Agent": "Mai-WaBot"
    }
  })

  return await res.json()
}

const handler = async (m, { conn, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, "")
  const botPath = path.join("./Sessions/SubBot", senderNumber)
  const configPath = path.join(botPath, "config.json")

  if (!fs.existsSync(botPath)) {
    return m.reply("> ꕤ Este comando es solo para *sockets*.")
  }

  try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

    
    if (!mime || !/video\/(mp4|mkv|mov)/.test(mime)) {
      return conn.sendMessage(m.chat, {
        text: `❐ Por favor, responde a un 🎞️ *video válido* (MP4, MKV, MOV) usando *.${command}*`,
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: "🕓", key: m.key }
    })

    const media = await q.download()
    if (!media) throw new Error("❌ No se pudo descargar el video.")

    const uploadRes = await uploadToAdonix(media, mime)
    if (!uploadRes?.data?.url) throw new Error("❒ Error al subir el video.")

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}
    config.video = uploadRes.data.url
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    await conn.sendMessage(m.chat, {
      text: `✩︎ Video actualizado correctamente:\n${uploadRes.data.url}`,
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, {
      text: "❌ No se pudo subir el video, inténtalo más tarde.",
    }, { quoted: m })
    await conn.sendMessage(m.chat, {
      react: { text: "✖️", key: m.key }
    })
  }
}


handler.command = ["setvid"]
export default handler