import axios from "axios"
import qs from "qs"

async function getFinalFileUrl(mediaUrl) {
  const headers = {
    accept: "*/*",
    "accept-language": "id-ID",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    cookie: "PHPSESSID=ofu9rbop984f7ovqdsp72q9t82",
    origin: "https://ytdown.io",
    referer: "https://ytdown.io/en/",
    "sec-ch-ua": "\"Chromium\";v=\"127\", \"Not)A;Brand\";v=\"99\", \"Microsoft Edge Simulate\";v=\"127\", \"Lemur\";v=\"127\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
    "x-requested-with": "XMLHttpRequest"
  }
  const data = qs.stringify({ url: mediaUrl })
  const resp = await axios.post("https://ytdown.io/proxy.php", data, { headers })
  return resp.data.api.fileUrl
}

async function ytdown(fullUrl) {
  const headers = {
    accept: "*/*",
    "accept-language": "id-ID",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    cookie: "PHPSESSID=ofu9rbop984f7ovqdsp72q9t82",
    origin: "https://ytdown.io",
    referer: "https://ytdown.io/en/",
    "sec-ch-ua": "\"Chromium\";v=\"127\", \"Not)A;Brand\";v=\"99\", \"Microsoft Edge Simulate\";v=\"127\", \"Lemur\";v=\"127\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
    "x-requested-with": "XMLHttpRequest"
  }

  const phaseOneData = qs.stringify({ url: fullUrl })
  const phaseOneResp = await axios.post("https://ytdown.io/proxy.php", phaseOneData, { headers })
  const resPhase1 = phaseOneResp.data.api

  const downloadsVideo = []

  if (resPhase1.mediaItems) {
    for (const item of resPhase1.mediaItems) {
      if (item.type.toLowerCase() === "video") {
        if (["640x360", "854x480", "1280x720", "1920x1080"].includes(item.mediaRes)) {
          const finalUrl = await getFinalFileUrl(item.mediaUrl)
          downloadsVideo.push({
            quality: item.mediaRes === "640x360" ? "Low" : 
                     item.mediaRes === "854x480" ? "SD" : 
                     item.mediaRes === "1280x720" ? "HD" : "FHD",
            resolution: item.mediaRes,
            size: item.mediaFileSize,
            extension: item.mediaExtension,
            url: finalUrl,
            thumbnail: item.mediaThumbnail
          })
        }
      }
    }
  }

  return {
    status: true,
    title: resPhase1.title,
    description: resPhase1.description,
    thumbnail: resPhase1.imagePreviewUrl,
    channel: {
      name: resPhase1.userInfo?.name || null,
      username: resPhase1.userInfo?.username || null,
      subscribers: resPhase1.mediaStats?.followersCount || null,
      joined: resPhase1.userInfo?.dateJoined || null,
      verified: resPhase1.userInfo?.isVerified || false,
      avatar: resPhase1.userInfo?.userAvatar || null
    },
    downloadsVideo: downloadsVideo.length ? downloadsVideo : null
  }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`✦ Uso: *${usedPrefix + command} <url de YouTube>*`)

  try {
    await m.react("🕒")
    const result = await ytdown(args[0])

    if (!result.status || !result.downloadsVideo) {
      return m.reply("✗ No se pudo obtener el video.")
    }

    let txt = `*✦ YouTube Downloader*\n\n`
    txt += `> 📌 *Título:* ${result.title}\n`
    txt += `> 📝 *Descripción:* ${result.description || "-"}\n`
    txt += `> 📺 *Canal:* ${result.channel?.name || "-"}\n`
    txt += `> 🔗 *URL:* ${args[0]}\n\n`

    txt += `*Opciones disponibles:*\n`
    result.downloadsVideo.forEach((vid, i) => {
      txt += `\n${i+1}. 🎥 ${vid.quality} (${vid.resolution})\n`
      txt += `⏺️ Tamaño: ${vid.size}\n`
      txt += `📂 Formato: ${vid.extension}\n`
      txt += `🔗 ${vid.url}\n`
    })

    await conn.sendMessage(m.chat, {
      image: { url: result.thumbnail },
      caption: txt
    }, { quoted: m })
    await m.react("✅")

  } catch (e) {
    m.reply(` Error: ${e.message}`)
  }
}

handler.command = ["ytio", "ytdownio", "ytio2"]
export default handler
