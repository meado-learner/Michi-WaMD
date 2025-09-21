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
        if (subBotConfig.banner) bannerUrl = subBotConfig.banner
      } catch (e) { console.error(e) }
    }

    let sections = []
    let firstSection = true

    for (let tag in menu) {
      let rows = menu[tag].flatMap(plugin =>
        plugin.help.map(cmd => ({
          title: `${usedPrefix}${cmd}`,
          description: '' // puedes agregar descripción si quieres
        }))
      )

      let sectionTitle = firstSection 
        ? `> .・。.・゜〄・.・〄・゜・。.\n> ✐ Hola! Soy ${botNameToShow}\n> ⊹ Hora » ${moment.tz("America/Tegucigalpa").format("HH:mm:ss")}\n> ⊹ Fecha » ${moment.tz("America/Tegucigalpa").format("DD/MM/YYYY")}\n> ✦ Bot » ${(conn.user.jid == global.conn.user.jid ? 'Principal 🅥' : 'Sub Bot 🅑')}\n\n*${tag.toUpperCase()}*`
        : `*${tag.toUpperCase()}*`

      sections.push({
        title: sectionTitle,
        rows
      })

      firstSection = false
    }

    await conn.sendMessage(
      m.chat,
      {
        text: 'Selecciona un comando',
        image: { url: bannerUrl },
        footer: `Actividad: ${uptimeStr}`,
        templateButtons: sections.map(sec => ({
          index: 1,
          urlButton: {
            displayText: sec.title,
            url: "#" // si quieres algo clickeable, o lo puedes dejar vacío
          }
        }))
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, "» Ocurrió un error.", m)
  }
}

handler.command = ['carru']
export default handler
