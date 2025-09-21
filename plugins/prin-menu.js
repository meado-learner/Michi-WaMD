import moment from "moment-timezone"
import fs from "fs"
import path from "path"

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let menu = {}
    for (let plugin of Object.values(global.plugins)) {
      if (!plugin || !plugin.help) continue
      let taglist = plugin.tags || []
      for (let tag of taglist) {
        if (!menu[tag]) menu[tag] = []
        menu[tag].push(plugin)
      }
    }

    let uptimeSec = process.uptime()
    let hours = Math.floor(uptimeSec / 3600)
    let minutes = Math.floor((uptimeSec % 3600) / 60)
    let seconds = Math.floor(uptimeSec % 60)
    let uptimeStr = `${hours}h ${minutes}m ${seconds}s`
    
    let botNameToShow = global.botname || ""
    let bannerUrl = global.michipg || ""

    const senderBotNumber = conn.user.jid.split('@')[0]
    const configPath = path.join('./Sessions/SubBot', senderBotNumber, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const subBotConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (subBotConfig.name) botNameToShow = subBotConfig.name
        if (subBotConfig.banner) bannerUrl = subBotConfig.banner // si existe banner personalizado lo usamos
      } catch (e) { console.error(e) }
    }

    let txt = `> .・。.・゜〄・.・〄・゜・。.\n`
    txt += `> ✐ *Hola! Soy ${botNameToShow}*\n`
    txt += `> ⊹ *Hora* » ${moment.tz("America/Tegucigalpa").format("HH:mm:ss")}\n`
    txt += `> ⊹ *Fecha* » ${moment.tz("America/Tegucigalpa").format("DD/MM/YYYY")}\n`
    txt += `> ✦ *Bot* » ${(conn.user.jid == global.conn.user.jid ? 'Principal 🅥' : 'Sub Bot 🅑')}\n\n`

    for (let tag in menu) {
      txt += `> ➭ *✩ ${tag.toUpperCase()} ✩*\n`
      for (let plugin of menu[tag]) {
        for (let cmd of plugin.help) {
          txt += `> ⟩ ${usedPrefix}${cmd}\n`
        }
      }
      txt += `\n`
    }

    txt += `> : *Actividad* » ${uptimeStr}`

    await conn.sendMessage(
      m.chat,
      {
        text: txt,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          externalAdReply: {
            title: ``,
            body: "» Menu De Comandos",
            thumbnailUrl: bannerUrl, 
            sourceUrl: "https://whatsapp.com/channel/0029VaS0g4T1jQZ2VwVJCe0P",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m } 
    )

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, "» Ocurrió un error.", m)
  }
}

handler.command = ['help', 'menu']
export default handler
