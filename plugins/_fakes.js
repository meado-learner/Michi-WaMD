import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) { 
    
    let botNameToShow = global.botname
    let bannerUrl = icono || global.michipg
    try {
        const senderBotNumber = conn.user.jid.split('@')[0]
        const configPath = path.join('./Sessions/SubBot', senderBotNumber, 'config.json')
        if (fs.existsSync(configPath)) {
            const subBotConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
            if (subBotConfig.name) botNameToShow = subBotConfig.name
            if (subBotConfig.banner) bannerUrl = subBotConfig.banner
        }
    } catch(e) { console.error('Error leyendo subbot config:', e) }

    global.canalIdM = ["120363403739366547@newsletter", "120363403739366547@newsletter"]
    global.canalNombreM = ["Support Ado 🦖", "Ado 𝗖𝗛𝗡𝗟︎"]
    global.channelRD = await getRandomChannel()

    const d = new Date(new Date + 3600000)
    global.locale = 'es'
    global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
    global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
    global.mes = d.toLocaleDateString('es', {month: 'long'})
    global.año = d.toLocaleDateString('es', {year: 'numeric'})
    global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

    const canal = 'https://whatsapp.com/channel/0029VbAfPu9BqbrEMFWXKE0d'  
    const comunidad = 'https://chat.whatsapp.com/I0dMp2fEle7L6RaWBmwlAa'
    const git = 'https://github.com/'
    const github = 'https://github.com/' 
    const correo = 'minexdt@gmail.com'
    global.redes = [canal, comunidad, git, github, correo].getRandom()

    global.nombre = m.pushName || 'Anónimo'

    global.packsticker = `〄 𝗦𝗧𝗜𝗖𝗞𝗘𝗥𝗦\n✩ᩚ Usuario » ${global.nombre}\n✦ Bot » ${botNameToShow}`
    global.packsticker2 = `\n\n${dev}`

    global.fkontak = { 
        key: { participants:"0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, 
        message: { contactMessage: { 
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
        }}, 
        participant: "0@s.whatsapp.net" 
    }

    global.rcanal = { 
        contextInfo: { 
            isForwarded: true, 
            forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '', newsletterName: channelRD.name }, 
            externalAdReply: { 
                title: botNameToShow, 
                body: dev, 
                mediaUrl: null, 
                description: null, 
                previewType: "PHOTO", 
                thumbnail: await (await fetch(bannerUrl)).buffer(), 
                sourceUrl: global.redes, 
                mediaType: 1, 
                renderLargerThumbnail: false 
            }, 
            mentionedJid: null 
        } 
    }
}

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
    let randomIndex = Math.floor(Math.random() * canalIdM.length)
    let id = canalIdM[randomIndex]
    let name = canalNombreM[randomIndex]
    return { id, name }
}
