import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// 🐢 Propietarios del bot
global.owner = [
  ['', '-', true],
  ['']
]

global.mods = []
global.prems = []

global.packname = '🦖 MichiStickers'
global.author = '🐦‍🔥 Built by Ado ∙ 𝖬𝖽 𝖲𝗒𝗌 ∙ 2025'
global.botname = '🌾 𝖬𝗂𝖼𝗁𝗂 𝖶𝖺𝖬𝖣'

global.name_canal = '🫟╺╺ 𝖠𝖽𝗈 𝗖𝗛𝗡𝗟'
global.id_canal = '120363274577422945@newsletter'
global.canal = 'https://whatsapp.com/channel/0029VaeQcFXEFeXtNMHk0D0n'


global.multiplier = 69
global.maxwarn = '2'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright('🔁 Actualización detectada en 🌿 config.js'))
  import(`${file}?update=${Date.now()}`)
})