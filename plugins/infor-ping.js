import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
  let timestamp = speed()
  let sentMsg = await conn.reply(m.chat, '❐ Calculando ping...', m)
  let latency = speed() - timestamp

  exec(`neofetch --stdout`, (error, stdout, stderr) => {
    let child = stdout.toString("utf-8")
    let ssd = child.replace(/Memory:/, "Ram:")

    let result = `✩ *¡Pong!*\n> *_✦ Tiempo ${latency.toFixed(4).split(".")[0]}ms_*\n${ssd}`
    conn.sendMessage(m.chat, { text: result, ...rcanal, edit: sentMsg.key }, { quoted: m })
  })
}

handler.help = ['ping']
handler.tags = ['informacion']
handler.command = ['ping', 'p']

export default handler
