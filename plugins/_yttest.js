import fetch from "node-fetch"
import yts from "yt-search"

const API_URL = "https://dl08.yt-dl.click/"

const download = async (url, isAudio = true) => {
    let body = {
        url: url,
        vQuality: isAudio ? "128kbps" : "360p",
        isAudioOnly: isAudio,
        filenamePattern: "pretty",
        disableMetadata: false,
        disableSubtitle: true
    }

    let res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}\n${await res.text()}`)
    return res.json()
}

let handler = async (m, { conn, command, text }) => {
    if (!text) return m.reply(`✎ Ingresa un link o nombre de la canción/video\nEjemplo: *.${command} ozuna*`)

    try {
        let isAudio = command === "audio"
        let url = text

        
        if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(text)) {
            let search = await yts(text)
            if (!search || !search.videos.length) return m.reply("⚠ No encontré resultados")
            url = search.videos[0].url
        }

        let result = await download(url, isAudio)
        if (!result || !result.url) return m.reply("⚠ No se pudo generar el enlace de descarga")

        if (isAudio) {
            await conn.sendMessage(m.chat, {
                audio: { url: result.url },
                mimetype: "audio/mpeg",
                fileName: `${result.title || "audio"}.mp3`,
                ptt: false
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                video: { url: result.url },
                mimetype: "video/mp4",
                fileName: `${result.title || "video"}.mp4`
            }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply("⚠ Error al descargar el contenido")
    }
}

handler.command = ['audio', 'video']
export default handler
