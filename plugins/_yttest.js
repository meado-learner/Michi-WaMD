import fetch from "node-fetch"
import yts from "yt-search"

const download = async (videoId, format = "mp3") => {
    const headers = {
        "accept-encoding": "gzip, deflate, br, zstd",
        "origin": "https://ht.flvto.online",
    }
    const body = JSON.stringify({
        "id": videoId,
        "fileType": format
    })
    const response = await fetch(`https://ht.flvto.online/converter`, { headers, body, method: "post" })
    if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text()}`)
    const json = await response.json()
    return json
}

let handler = async (m, { conn, command, text }) => {
    if (!text) return m.reply(`✎ Ingresa un link o nombre de la canción/video\nEjemplo: *.${command} ozuna*`)

    try {
        let format = command === "audio" ? "mp3" : "mp4"
        let videoId

      
        if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(text)) {
            let match = text.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
            videoId = match ? match[1] : null
        } else {
        
            let search = await yts(text)
            if (!search || !search.videos.length) return m.reply("⚠ No encontré resultados")
            videoId = search.videos[0].videoId
        }

        if (!videoId) return m.reply("⚠ No pude obtener el ID del video")

        let res = await download(videoId, format)
        if (!res || !res.url) return m.reply("⚠ No se pudo generar el enlace de descarga")

        if (format === "mp3") {
            await conn.sendMessage(m.chat, {
                audio: { url: res.url },
                mimetype: "audio/mpeg",
                fileName: `${res.title || "audio"}.mp3`,
                ptt: false
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                video: { url: res.url },
                mimetype: "video/mp4",
                fileName: `${res.title || "video"}.mp4`
            }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply("⚠ Error al descargar el contenido")
    }
}

handler.command = ['audio', 'video']
export default handler
