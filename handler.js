import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(() => {
    resolve()
}, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate || !chatUpdate.messages || chatUpdate.messages.length === 0) return
    
    try {
        this.pushMessage(chatUpdate.messages).catch(() => {})
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        
        if (!m) return
        
        if (!m.key?.id) return

        if (global.db.data == null) await global.loadDatabase()
        
        m = smsg(this, m) || m
        
        if (!m) return

        // --- Lógica del Prefijo del Subbot ---
        let prefixRegex = global.prefix
        try {
            const senderNumber = this.user.jid.split('@')[0]
            const botPath = path.join('./Sessions/SubBot', senderNumber)
            const configPath = path.join(botPath, 'config.json')

            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath))
                if (config.prefix) {
                    if (config.prefix === 'multi') {
                        prefixRegex = new RegExp('^[#$@*&?,;:+×!_\\-¿.]')
                    } else {
                        let safe = [...config.prefix].map(c =>
                            c.replace(/([.*+?^${}()|\[\]\\])/g, '\\$1')
                        )
                        prefixRegex = new RegExp('^(' + safe.join('|') + ')')
                    }
                }
            }
        } catch (e) {
            // Silenciar error para mejor rendimiento
        }

        m.exp = 0
        m.coin = false

        // Optimización: Acceso directo a datos
        const userData = global.db.data.users
        const chatData = global.db.data.chats
        const settingsData = global.db.data.settings

        let user = userData[m.sender] || (userData[m.sender] = {
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
            afk: -1,
            afkReason: "",
            warn: 0
        })

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

        let chat = chatData[m.chat] || (chatData[m.chat] = {
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
        })

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

        let setting = settingsData[this.user.jid] || (settingsData[this.user.jid] = {
            self: false,
            restrict: true,
            jadibotmd: true,
            antiPrivate: false,
            gponly: false
        })

        if (!("self" in setting)) setting.self = false
        if (!("restrict" in setting)) setting.restrict = true
        if (!("jadibotmd" in setting)) setting.jadibotmd = true
        if (!("antiPrivate" in setting)) setting.antiPrivate = false
        if (!("gponly" in setting)) setting.gponly = false

        if (typeof m.text !== "string") m.text = ""
        
        try {
            const actual = user.name || ""
            const nuevo = m.pushName || await this.getName(m.sender)
            if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
                user.name = nuevo
            }
        } catch {}

        const conn = m.conn || global.conn
        const isROwner = [...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isROwner || global.mods.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || user.premium == true

        if (opts["nyimak"]) return
        if (!m.fromMe && !isMods && setting["self"]) return
        if (!m.fromMe && !isMods && setting["gponly"] && !m.chat.endsWith("g.us") && !/code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/gim.test(m.text)) return
        if (opts["swonly"] && m.chat !== "status@broadcast") return

        if (opts["queque"] && m.text && !(isMods || isPrems)) {
            const queque = this.msgqueque,
                time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(() => {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                delay(time)
            }, time)
        }

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)
        let usedPrefix

        const groupMetadata = m.isGroup ? 
            conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(() => ({})) : {}
        const participants = m.isGroup ? (groupMetadata.participants || []).map(p => ({ 
            id: p.jid, 
            jid: p.jid, 
            lid: p.lid, 
            admin: p.admin 
        })) : []
        const userGroup = m.isGroup ? participants.find(u => conn.decodeJid(u.jid) === m.sender) || {} : {}
        const botGroup = m.isGroup ? participants.find(u => conn.decodeJid(u.jid) == this.user.jid) || {} : {}
        const isRAdmin = userGroup?.admin == "superadmin" || false
        const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
        const isBotAdmin = botGroup?.admin || false

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
        
        // Procesamiento optimizado de plugins
        for (const name in global.plugins) {
            const plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            
            const __filename = join(___dirname, name)
            
            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename,
                        user,
                        chat,
                        setting
                    })
                } catch {}
            }
            
            if (!opts["restrict"] && plugin.tags && plugin.tags.includes("admin")) continue
            
            const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
            const pluginPrefix = plugin.customPrefix || prefixRegex || conn.prefix || global.prefix

            const match = (pluginPrefix instanceof RegExp ?
                [[pluginPrefix.exec(m.text), pluginPrefix]] :
                Array.isArray(pluginPrefix) ?
                pluginPrefix.map(prefix => {
                    const regex = prefix instanceof RegExp ? prefix : new RegExp(strRegex(prefix))
                    return [regex.exec(m.text), regex]
                }) :
                typeof pluginPrefix === "string" ?
                [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
                [[[[], new RegExp]]]
            ).find(prefix => prefix[1])

            if (typeof plugin.before === "function") {
                if (await plugin.before.call(this, m, {
                        match,
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
                    })) continue
            }
            
            if (typeof plugin !== "function") continue
            
            if ((usedPrefix = (match[0] || "")[0])) {
                const noPrefix = m.text.replace(usedPrefix, "")
                let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split(" ").slice(1)
                let text = _args.join(" ")
                command = (command || "").toLowerCase()
                const fail = plugin.fail || global.dfail
                const isAccept = plugin.command instanceof RegExp ?
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                    plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === "string" ?
                    plugin.command === command : false
                
                global.comando = command

                // Validar que m.id exista antes de usarlo
                if (m.id && (
                    m.id.startsWith("NJX-") || 
                    (m.id.startsWith("BAE5") && m.id.length === 16) || 
                    (m.id.startsWith("B24E") && m.id.length === 20)
                )) return

                // Primary creator: Alex, Edited by Ado 🦖
                if (chat && chat.primaryBot && chat.primaryBot !== this.user.jid) {
                    const primaryBotConn = global.conns.find(conn =>
                        conn.user.jid === chat.primaryBot &&
                        conn.ws.socket &&
                        conn.ws.socket.readyState !== ws.CLOSED
                    )
                    const participants = m.isGroup ?
                        (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants :
                        []
                    const primaryBotInGroup = participants.some(p => p.jid === chat.primaryBot)

                    if (!(m.text && m.text.startsWith((usedPrefix || '.') + 'delprimary'))) {
                        if (primaryBotConn && primaryBotInGroup || chat.primaryBot === global.conn.user.jid) {
                            return
                        } else {
                            chat.primaryBot = null
                        }
                    }
                }

                if (!isAccept) continue
                m.plugin = name
                if (chat) {
                    const botId = this.user.jid
                    const primaryBotId = chat.primaryBot
                    if (name !== "group-banchat.js" && chat?.isBanned && !isMods) {
                        if (!primaryBotId || primaryBotId === botId) {
                            const aviso = `ꕥ El bot *${setting.botname}* está desactivado en este grupo\n\n> ✦ Un *administrador* puede activarlo con el comando:\n> » *${usedPrefix}bot on*`
                            await this.sendMessage(m.chat, { text: aviso }, { quoted: m })
                            return
                        }
                    }
                    if (m.text && user.banned && !isMods) {
                        const mensaje = `ꕥ Estas baneado/a, no puedes usar comandos en este bot!\n\n> ● *Razón ›* ${user.bannedReason}\n\n> ● Si este Bot es cuenta oficial y tienes evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`.trim()
                        if (!primaryBotId || primaryBotId === botId) {
                            await this.sendMessage(m.chat, { text: mensaje }, { quoted: m })
                            return
                        }
                    }
                }
                const adminMode = chat.modoadmin || false
                const wa = plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || pluginPrefix || m.text.slice(0, 1) === pluginPrefix || plugin.command
                if (adminMode && !isOwner && m.isGroup && !isAdmin && wa) return
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
                    fail("owner", m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) {
                    fail("rowner", m, this)
                    continue
                }
                if (plugin.owner && !isOwner) {
                    fail("owner", m, this)
                    continue
                }
                if (plugin.mods && !isMods) {
                    fail("mods", m, this)
                    continue
                }
                if (plugin.premium && !isPrems) {
                    fail("premium", m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) {
                    fail("group", m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) {
                    fail("botAdmin", m, this)
                    continue
                } else if (plugin.admin && !isAdmin) {
                    fail("admin", m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail("private", m, this)
                    continue
                }
                m.isCommand = true
                m.exp += plugin.exp ? parseInt(plugin.exp) : 10
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
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
                    console.error(err)
                    if (m && m.chat) await this.sendMessage(m.chat, { text: '⚠️ Error al ejecutar el comando.' }, { quoted: m })
                } finally {
                    if (typeof plugin.after === "function") {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch {}
                    }
                    if (isAccept) { 
                        userData[m.sender].commands = (userData[m.sender].commands || 0) + 1 
                    }
                }
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        if (opts["queque"] && m && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        let user
        if (m && m.sender && (user = global.db.data.users[m.sender])) {
            user.exp += m.exp || 0
        }
        try {
            if (!opts["noprint"] && m) await (await import("./lib/print.js")).default(m, this)
        } catch {}
    }
}

global.dfail = (type, m, conn) => {
    if (!m || !m.chat || !conn || !conn.sendMessage) return;

    const msg = {
        rowner: `> 〄 El comando *${global.comando}* solo puede ser usado por los creadores del bot.`,
        owner: `> 〄 El comando *${global.comando}* solo puede ser usado por los desarrolladores del bot.`,
        mods: `> 〄 El comando *${global.comando}* solo puede ser usado por los moderadores del bot.`,
        premium: `> 〄 El comando *${global.comando}* solo puede ser usado por los usuarios premium.`,
        group: `> 〄 El comando *${global.comando}* solo puede ser usado en grupos.`,
        private: `> 〄 El comando *${global.comando}* solo puede ser usado al chat privado del bot.`,
        admin: `> 〄 El comando *${global.comando}* solo puede ser usado por los administradores del grupo.`,
        botAdmin: `> 〄 Para ejecutar el comando *${global.comando}* debo ser administrador del grupo.`,
        restrict: `> 〄 Esta caracteristica está desactivada.`
    }[type]

    if (msg) return conn.sendMessage(m.chat, { text: msg }, { quoted: m }).then(_ => m.react('✖️'))
}

let file = global.__filename(import.meta.url, true)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))
    import(`${file}?update=${Date.now()}`)
})
