import moment from "moment-timezone"

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

    let txt = `> .・。.・゜〄・.・〄・゜・。.
\n> ✐ *Hola! Soy ${global.botname || ""}*\n`
    txt += `> ⊹ *Hora* » ${moment.tz("America/Tegucigalpa").format("HH:mm:ss")}\n`
    txt += `> ⊹ *Fecha* » ${moment.tz("America/Tegucigalpa").format("DD/MM/YYYY")}\n`
    txt += `> ✦ *Bot* » ${(conn.user.jid == global.conn.user.jid ? 'Principal 🅥' : 'Sub Bot 🅑')}\n\n`

    for (let tag in menu) {
      txt += `> ➭ *✩ ${tag.toUpperCase()} ✩*\n`
      for (let plugin of menu[tag]) {
        for (let cmd of plugin.help) {
          txt += `> *_» ${usedPrefix}${cmd}_*\n`
        }
      }
      txt += `\n`
    }

    await conn.sendMessage(
      m.chat,
      {
        text: txt,
        contextInfo: {
          externalAdReply: {
            title: ``,
            body: "» Menu De Comandos",
            thumbnailUrl: global.michipg,
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