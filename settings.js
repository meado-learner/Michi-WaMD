import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

global.botNumber = "" 

global.owner = [
// ZONA DE JIDS
["50493732693", "Ado </>", true],
[""],
[""],  
// ZONA DE LIDS 
["", "", true],
["", "", true], 
["", "", true]
]

global.mods = []
global.suittag = ["50493732693"] 
global.prems = []


global.libreria = "Baileys Multi Device"
global.vs = "^1.3.2"
global.nameqr = "Michi"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.MichiJadibts = true

global.botname = "𝖬𝗂𝖼𝗁𝗂 - 𝖡𝗈𝗍𝖶𝖺"
global.textbot = "ᴍɪᴄʜɪ ᴠ3, 𝗔𝗱𝗼"
global.dev = "✎ ⍴᥆ᥕᥱrᥱძ ᑲᥡ 𝗔𝗱𝗼"
global.author = "© mᥲძᥱ ᥕі𝗍һ 𝖠𝖽𝗈"
global.etiqueta = "𝖠𝖽𝗈 | 𝟤𝟢𝟤𝟧 ©"
global.currency = "¢ Pesos"
global.michipg = "https://files.catbox.moe/p2eq60.jpg"
global.icono = "https://files.catbox.moe/dnjyto.jpg"
global.catalogo = fs.readFileSync('./lib/catalogo.jpg')


global.group = "https://chat.whatsapp.com/D80dadzwRq4LQqFGUntZfK?mode=ems_copy_t"
global.community = ""
global.channel = "https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O"
global.github = "https://github.com"
global.gmail = "minexdt@gmail.com"
global.ch = {
ch1: "120363420941524030@newsletter"
}


global.APIs = {
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
zenzxz: { url: "https://api.zenzxz.my.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
adonix: { url: "https://api-adonix.ultraplus.click", key: null }
}


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings.js'"))
import(`${file}?update=${Date.now()}`)
})
