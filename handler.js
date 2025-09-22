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
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// Cache de prefijo personalizado
let customPrefixCache = null

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

        // --- Lógica del Prefijo del Subbot ---
        let prefixRegex = global.prefix
        
        if (!customPrefixCache) {
            try {
                const senderNumber = this.user.jid.split('@')[0]
                const botPath = path.join('./Sessions/SubBot', senderNumber)
                const configPath = path.join(botPath, 'config.json')

                if (fs.existsSync(configPath)) {
                    const config = JSON.parse(fs.readFileSync(configPath))
                    if (config.prefix) {
                        if (config.prefix === 'multi') {
                            prefixRegex = /^[#$@*&?,;:+×!_\-¿.]/
                        } else {
                            let safe = [...config.prefix].map(c =>
                                c.replace(/([.*+?^${}()|\[\]\\])/g, '\\$1')
                            )
                            prefixRegex = new RegExp(`^(${safe.join('|')})`)
                        }
                        customPrefixCache = prefixRegex
                    }
                }
            } catch (e) {
                console.error('🍁 Error cargando prefijo del subbot:', e)
            }
        } else {
            prefixRegex = customPrefixCache
        }

        m.exp = 0
        m.coin = false

        // Resto del código existente...
        
        // Procesamiento de plugins con optimización
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
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
                } catch (err) {
                    console.error(err)
                }
            }
            
            if (!opts["restrict"] && plugin.tags && plugin.tags.includes("admin")) {
                continue
            }
            
            const pluginPrefix = plugin.customPrefix || prefixRegex || conn.prefix || global.prefix
            const match = (pluginPrefix instanceof RegExp ?
                [[pluginPrefix.exec(m.text), pluginPrefix]] :
                Array.isArray(pluginPrefix) ?
                pluginPrefix.map(prefix => {
                    const regex = prefix instanceof RegExp ?
                        prefix : new RegExp(strRegex(prefix))
                    return [regex.exec(m.text), regex]
                }) :
                typeof pluginPrefix === "string" ?
                [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
                [[[], new RegExp()]])
                .find(prefix => prefix[1])
                
            if (!match) continue
            
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
                })) {
                    continue
                }
            }
            
            if (typeof plugin !== "function") continue
            
            const usedPrefix = (match[0] || "")[0]
            const noPrefix = m.text.replace(usedPrefix, "")
            let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
            args = args || []
            let _args = noPrefix.trim().split(" ").slice(1)
            let text = _args.join(" ")
            command = (command || "").toLowerCase()
            
            // Validaciones de permisos optimizadas
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
            }
            if (plugin.botAdmin && !isBotAdmin) {
                fail("botAdmin", m, this)
                continue
            }
            if (plugin.admin && !isAdmin) {
                fail("admin", m, this)
                continue
            }
            if (plugin.private && m.isGroup) {
                fail("private", m, this)
                continue
            }
            
            m.isCommand = true
            m.exp += plugin.exp ? parseInt(plugin.exp) : 10
            
            try {
                await plugin.call(this, m, {
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
                })
            } catch (err) {
                m.error = err
                console.error(err)
            } finally {
                if (typeof plugin.after === "function") {
                    try {
                        await plugin.after.call(this, m, {
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
                        })
                    } catch (err) {
                        console.error(err)
                    }
                }
                if (isAccept) global.db.data.users[m.sender].commands++
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        if (opts["queque"] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }
        
        try {
            if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
        } catch (err) {
            console.warn(err)
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
    }[type]
    
    if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))
    import(`${file}?update=${Date.now()}`)
})
