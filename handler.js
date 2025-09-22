import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

let subBotConfig = {}
const loadSubBotConfig = (senderNumber) => {
    const configPath = path.join('./Sessions/SubBot', senderNumber, 'config.json')
    if (fs.existsSync(configPath)) {
        subBotConfig[senderNumber] = JSON.parse(fs.readFileSync(configPath))
    } else {
        delete subBotConfig[senderNumber]
    }
}

const saveDatabase = () => {
    if (global.db.data) {
        fs.writeFileSync(global.db.filepath, JSON.stringify(global.db.data, null, 2))
    }
}
setInterval(saveDatabase, 60 * 1000)

const ROWNERS = new Set(global.owner.map(([number]) => number.replace(/[^0-9]/g, "") + "@s.whatsapp.net"))
const MODS = new Set(global.mods.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"))
const PREMS = new Set(global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return

        const senderNumber = this.user.jid.split('@')[0]
        loadSubBotConfig(senderNumber)
        let prefixRegex = global.prefix
        if (subBotConfig[senderNumber] && subBotConfig[senderNumber].prefix) {
            const configPrefix = subBotConfig[senderNumber].prefix
            if (configPrefix === 'multi') {
                prefixRegex = new RegExp('^[#$@*&?,;:+×!_\\-¿.]')
            } else {
                let safe = [...configPrefix].map(c => c.replace(/([.*+?^${}()|\[\]\\])/g, '\\$1'))
                prefixRegex = new RegExp('^(' + safe.join('|') + ')')
            }
        }

        m.exp = 0
        m.coin = false

        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== "object") global.db.data.users[m.sender] = {}
            if (user) {
                if (!("name" in user)) user.name = m.name
                if (!isNumber(user.exp)) user.exp = 0
                if (!isNumber(user.coin)) user.coin = 0
                if (!isNumber(user.bank)) user.bank = 0
                if (!isNumber(user.level)) user.level = 0
                if (!isNumber(user.health)) user.health = 100
                if (!("genre" in user)) user.genre = ""
                if (!("birth" in user)) user.birth = ""
                if (!("marry" in user)) user.marry = ""
                if (!("description" in user)) user.description = ""
                if (!("packstickers" in user)) user.packstickers = null
                if (!("premium" in user)) user.premium = false
                if (!user.premium) user.premiumTime = 0
                if (!("banned" in user)) user.banned = false
                if (!("bannedReason" in user)) user.bannedReason = ""
                if (!("commands" in user)) user.commands = 0
                if (!isNumber(user.afk)) user.afk = -1
                if (!("afkReason" in user)) user.afkReason = ""
                if (!isNumber(user.warn)) user.warn = 0
            } else global.db.data.users[m.sender] = {
                name: m.name,
                exp: 0,
                coin: 0,
                bank: 0,
                level: 0,
                health: 100,
                genre: "",
                birth: "",
                marry: "",
                description: "",
                packstickers: null,
                premium: false,
                premiumTime: 0,
                banned: false,
                bannedReason: "",
                commands: 0,
                afk: 0,
                afkReason: "",
                warn: 0
            }
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!("isBanned" in chat)) chat.isBanned = false
                if (!("welcome" in chat)) chat.welcome = true
                if (!("sWelcome" in chat)) chat.sWelcome = ""
                if (!("sBye" in chat)) chat.sBye = ""
                if (!("detect" in chat)) chat.detect = true
                if (!("primaryBot" in chat)) chat.primaryBot = null
                if (!("modoadmin" in chat)) chat.modoadmin = false
                if (!("antiLink" in chat)) chat.antiLink = true
                if (!("nsfw" in chat)) chat.nsfw = false
                if (!("economy" in chat)) chat.economy = true
                if (!("gacha" in chat)) chat.gacha = true
            } else global.db.data.chats[m.chat] = {
                isBanned: false,
                welcome: true,
                sWelcome: "",
                sBye: "",
                detect: true,
                primaryBot: null,
                modoadmin: false,
                antiLink: true,
                nsfw: false,
                economy: true,
                gacha: true
            }
            var settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== "object") global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!("self" in settings)) settings.self = false
                if (!("restrict" in settings)) settings.restrict = true
                if (!("jadibotmd" in settings)) settings.jadibotmd = true
                if (!("antiPrivate" in settings)) settings.antiPrivate = false
                if (!("gponly" in settings)) settings.gponly = false
            } else global.db.data.settings[this.user.jid] = {
                self: false,
                restrict: true,
                jadibotmd: true,
                antiPrivate: false,
                gponly: false
            }
        } catch (e) {
            console.error(e)
        }

        if (typeof m.text !== "string") m.text = ""
        const user = global.db.data.users[m.sender]
        try {
            const actual = user.name || ""
            const nuevo = m.pushName || await this.getName(m.sender)
            if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
                user.name = nuevo
            }
        } catch {}
        const chat = global.db.data.chats[m.chat]
        const conn = m.conn || global.conn
        const setting = global.db.data.settings[conn?.user?.jid]

        const isROwner = ROWNERS.has(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isROwner || MODS.has(m.sender)
        const isPrems = isROwner || PREMS.has(m.sender) || user.premium == true

        if (opts["nyimak"]) return
        if (!m.fromMe && !isMods && setting["self"]) return
        if (!m.fromMe && !isMods && setting["gponly"] && !m.chat.endsWith("g.us") && !/code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/gim.test(m.text)) return
        if (opts["swonly"] && m.chat !== "status@broadcast") return

        if (opts["queque"] && m.text && !(isMods || isPrems)) {
            const queque = this.msgqueque,
                time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)
        let usedPrefix

        const groupMetadata = m.isGroup ? { ...(conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}), ...(((conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants) && { participants: ((conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants || []).map(p => ({ ...p, id: p.jid, jid: p.jid, lid: p.lid })) }) } : {}
        const participants = ((m.isGroup ? groupMetadata.participants : []) || []).map(participant => ({ id: participant.jid, jid: participant.jid, lid: participant.lid, admin: participant.admin }))
        const userGroup = (m.isGroup ? participants.find((u) => conn.decodeJid(u.jid) === m.sender) : {}) || {}
        const botGroup = (m.isGroup ? participants.find((u) => conn.decodeJid(u.jid) == this.user.jid) : {}) || {}
        const isRAdmin = userGroup?.admin == "superadmin" || false
        const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
        const isBotAdmin = botGroup?.admin || false

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")

        const pluginMap = new Map()
        for (const name in global.plugins) {
            const plugin = global.plugins[name]
            if (plugin.command) {
                if (Array.isArray(plugin.command)) {
                    for (const cmd of plugin.command) pluginMap.set(cmd.toString(), plugin)
                } else {
                    pluginMap.set(plugin.command.toString(), plugin)
                }
            }
        }
        
        const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
        let usedPrefix = null
        let command = null
        const prefixes = Array.isArray(prefixRegex) ? prefixRegex : [prefixRegex]

        for (const prefix of prefixes) {
            const regex = prefix instanceof RegExp ? prefix : new RegExp(strRegex(prefix))
            const match = regex.exec(m.text)
            if (match && match[0]) {
                usedPrefix = match[0]
                const noPrefix = m.text.replace(usedPrefix, "").trim()
                const [cmd, ...args] = noPrefix.split(" ").filter(v => v)
                command = (cmd || "").toLowerCase()
                break
            }
        }

        if (usedPrefix) {
            const noPrefix = m.text.replace(usedPrefix, "")
            let _args = noPrefix.trim().split(" ").slice(1)
            let text = _args.join(" ")
            const plugin = pluginMap.get(command)
            
            if (plugin) {
                if (plugin.disabled) return
                if (!opts["restrict"]) if (plugin.tags && plugin.tags.includes("admin")) return

                if ((m.id.startsWith("NJX-") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return

                if (global.db.data.chats[m.chat].primaryBot && global.db.data.chats[m.chat].primaryBot !== this.user.jid) {
                    const primaryBotConn = global.conns.find(conn =>
                        conn.user.jid === global.db.data.chats[m.chat].primaryBot &&
                        conn.ws.socket &&
                        conn.ws.socket.readyState !== ws.CLOSED
                    )
                    const participants = m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
                    const primaryBotInGroup = participants.some(p => p.jid === global.db.data.chats[m.chat].primaryBot)

                    if (!(m.text && m.text.startsWith((usedPrefix || '.') + 'delprimary'))) {
                        if (primaryBotConn && primaryBotInGroup || global.db.data.chats[m.chat].primaryBot === global.conn.user.jid) {
                            throw !1
                        } else {
                            global.db.data.chats[m.chat].primaryBot = null
                        }
                    }
                }

                m.plugin = plugin.name || command
                global.comando = command

                if (chat) {
                    const botId = this.user.jid
                    const primaryBotId = chat.primaryBot
                    if (plugin.name !== "group-banchat.js" && chat?.isBanned && !isMods) {
                        if (!primaryBotId || primaryBotId === botId) {
                            const aviso = `ꕥ El bot *${setting.botname}* está desactivado en este grupo\n\n> ✦ Un *administrador* puede activarlo con el comando:\n> » *${usedPrefix}bot on*`
                            await m.reply(aviso)
                            return
                        }
                    }
                    if (m.text && user.banned && !isMods) {
                        const mensaje = `ꕥ Estas baneado/a, no puedes usar comandos en este bot!\n\n> ● *Razón ›* ${user.bannedReason}\n\n> ● Si este Bot es cuenta oficial y tienes evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`.trim()
                        if (!primaryBotId || primaryBotId === botId) {
                            m.reply(mensaje)
                            return
                        }
                    }
                }

                const adminMode = chat.modoadmin || false
                const wa = plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || prefixRegex || m.text.slice(0, 1) === prefixRegex || plugin.command

                if (adminMode && !isOwner && m.isGroup && !isAdmin && wa) return
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
                    fail("owner", m, this)
                    return
                }
                if (plugin.rowner && !isROwner) {
                    fail("rowner", m, this)
                    return
                }
                if (plugin.owner && !isOwner) {
                    fail("owner", m, this)
                    return
                }
                if (plugin.mods && !isMods) {
                    fail("mods", m, this)
                    return
                }
                if (plugin.premium && !isPrems) {
                    fail("premium", m, this)
                    return
                }
                if (plugin.group && !m.isGroup) {
                    fail("group", m, this)
                    return
                } else if (plugin.botAdmin && !isBotAdmin) {
                    fail("botAdmin", m, this)
                    return
                } else if (plugin.admin && !isAdmin) {
                    fail("admin", m, this)
                    return
                }
                if (plugin.private && m.isGroup) {
                    fail("private", m, this)
                    return
                }
                m.isCommand = true
                m.exp += plugin.exp ? parseInt(plugin.exp) : 10
                let extra = {
                    usedPrefix,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    userGroup,
                    botGroup,
                    isROwner,
                    isOwner,
                    isMods,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename,
                    user,
                    chat,
                    setting
                }
                try {
                    await plugin.call(this, m, extra)
                } catch (err) {
                    m.error = err
                    console.error(err)
                } finally {
                    if (typeof plugin.after === "function") {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                    if (plugin) {
                        global.db.data.users[m.sender].commands = (global.db.data.users[m.sender].commands || 0) + 1
                    }
                }
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        if (opts["queque"] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
            }
        }
        try {
            if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
        } catch (err) {
            console.warn(err)
            console.log(m.message)
        }
    }
}

global.dfail = (type, m, conn) => {
    const msg = {
        rowner: `> 〄 El comando *${comando}* solo puede ser usado por los creadores del bot.`,
        owner: `> 〄 El comando *${comando}* solo puede ser usado por los desarrolladores del bot.`,
        mods: `> 〄 El comando *${comando}* solo puede ser usado por los moderadores del bot.`,
        premium: `> 〄 El comando *${comando}* solo puede ser usado por los usuarios premium.`,
        group: `> 〄 El comando *${comando}* solo puede ser usado en grupos.`,
        private: `> 〄 El comando *${comando}* solo puede ser usado al chat privado del bot.`,
        admin: `> 〄 El comando *${comando}* solo puede ser usado por los administradores del grupo.`,
        botAdmin: `> 〄 Para ejecutar el comando *${comando}* debo ser administrador del grupo.`,
        restrict: `> 〄 Esta caracteristica está desactivada.`
    } [type]
    if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))
    import(`${file}?update=${Date.now()}`)
})
