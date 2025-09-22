import moment from "moment-timezone"
import fs from "fs"
import path from "path"

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let menu = {}
    for (let plugin of Object.values(global.plugins)) {
      if (!plugin || !plugin.help) continue
      let tags = plugin.tags || []
      for (let tag of tags) {
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
        if (subBotConfig.banner) bannerUrl = subBotConfig.banner
      } catch (e) { console.error(e) }
    }

    let sections = []
    let firstSection = true
    for (let tag in menu) {
      let rows = menu[tag].flatMap(plugin =>
        plugin.help.map(cmd => ({
          title: `${usedPrefix}${cmd}`,
          rowId: `${usedPrefix}${cmd}`,
          description: '' 
        }))
      )

      let title = firstSection 
        ? `Hola! Soy ${botNameToShow}\nHora: ${moment.tz("America/Tegucigalpa").format("HH:mm:ss")}\nFecha: ${moment.tz("America/Tegucigalpa").format("DD/MM/YYYY")}\nBot: ${(conn.user.jid == global.conn.user.jid ? 'Principal 🅥' : 'Sub Bot 🅑')}\n\n${tag.toUpperCase()}`
        : tag.toUpperCase()

      sections.push({ title, rows })
      firstSection = false
    }

    const listMessage = {
      text: 'Selecciona un comando 👇',
      footer: `Actividad: ${uptimeStr}`,
      title: '',
      buttonText: 'Abrir menú',
      sections: sections.map(sec => ({
        title: sec.title,
        rows: sec.rows
      })),
      headerType: 4,
      image: { url: bannerUrl }
    }

    await conn.sendMessage(m.chat, listMessage, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, "» Ocurrió un error.", m)
  }
}

handler.command = ['carru']
export default handler
