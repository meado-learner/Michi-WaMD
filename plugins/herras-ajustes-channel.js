// --> Código original de GataNina [ Editado por Ado ]
import { getUrlFromDirectPath } from "@whiskeysockets/baileys"
import _ from "lodash"
import axios from 'axios' 

let handler = async (m, { conn, command, usedPrefix, args, text, groupMetadata, isOwner, isROwner }) => {
const isCommand1 = /^(inspect|inspeccionar)\b$/i.test(command)
const isCommand2 = /^(seguircanal)\b$/i.test(command)
const isCommand3 = /^(noseguircanal)\b$/i.test(command)
const isCommand4 = /^(silenciarcanal)\b$/i.test(command)
const isCommand5 = /^(nosilenciarcanal)\b$/i.test(command)
const isCommand6 = /^(nuevafotochannel)\b$/i.test(command)
const isCommand7 = /^(eliminarfotochannel)\b$/i.test(command)
const isCommand8 = /^(avisoschannel|resiviravisos)\b$/i.test(command)
const isCommand9 = /^(reactioneschannel|reaccioneschannel)\b$/i.test(command)
const isCommand10 = /^(nuevonombrecanal)\b$/i.test(command)
const isCommand11 = /^(nuevadescchannel)\b$/i.test(command)

const channelUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
const botAdminNotice = '\n\n⚠️ *IMPORTANTE:* Verifique que el bot tenga permisos de administrador en el canal para que los comandos funcionen correctamente.'

let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

async function reportError(e) {
    await m.reply(`❌ *Error del sistema*\n\nSe produjo un error interno. Por favor, intente nuevamente más tarde.\n\n📞 Si el problema persiste, contacte al administrador.`)
    console.error('Error en comando de canal:', e)
}

let thumb = null
let pp, ch, q, mime, buffer, media, inviteUrlch, imageBuffer

switch (true) {     
    case isCommand1:
        let inviteCode
        if (!text) return await conn.reply(m.chat, `🔍 *INSPECTOR DE GRUPOS Y CANALES*\n\n📝 *Uso del comando:*\n${usedPrefix}${command} <enlace>\n\n📋 *Ejemplo:*\n${usedPrefix}${command} https://chat.whatsapp.com/ABC123\n\n${botAdminNotice}`, m)
        
        const MetadataGroupInfo = async (res, isInviteInfo = false) => {
            let nameCommunity = "No pertenece a ninguna comunidad"
            let groupPicture = "No disponible"

            if (res.linkedParent) {
                let linkedGroupMeta = await conn.groupMetadata(res.linkedParent).catch(() => null)
                nameCommunity = linkedGroupMeta ? "`Nombre:` " + linkedGroupMeta.subject || nameCommunity : nameCommunity
            }
            
            pp = await conn.profilePictureUrl(res.id, 'image').catch(() => null)
            inviteCode = await conn.groupInviteCode(m.chat).catch(() => null)
            
            const formatParticipants = (participants) =>
                participants && participants.length > 0
                    ? participants.map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (superadmin)" : user.admin === "admin" ? " (admin)" : ""}`).join("\n")
                    : "No encontrado"
            
            let caption = `═══════════════════════════
🆔 *IDENTIFICADOR*
${res.id || "No encontrado"}

👑 *CREADOR*
${res.owner ? `@${res.owner?.split("@")[0]}` : "No encontrado"} 
${res.creation ? `• ${formatDate(res.creation)}` : "(Fecha no disponible)"}

🏷️ *NOMBRE DEL GRUPO*
${res.subject || "No encontrado"}

✏️ *ÚLTIMA MODIFICACIÓN*
${res.subjectOwner ? `@${res.subjectOwner?.split("@")[0]}` : "No encontrado"} 
${res.subjectTime ? `• ${formatDate(res.subjectTime)}` : "(Fecha no disponible)"}

📄 *DESCRIPCIÓN*
${res.desc || "No disponible"}

📝 *AUTOR DE LA DESCRIPCIÓN*
${res.descOwner ? `@${res.descOwner?.split("@")[0]}` : "No encontrado"}

🗃️ *ID DE LA DESCRIPCIÓN*
${res.descId || "No encontrado"}

🖼️ *IMAGEN DE PERFIL*
${pp ? pp : groupPicture}

💫 *AUTOR*
${res.author || "No encontrado"}

🎫 *CÓDIGO DE INVITACIÓN*
${res.inviteCode || inviteCode || "No disponible"}

⏱️ *MENSAJES EFÍMEROS*
${res.ephemeralDuration !== undefined ? `${res.ephemeralDuration} segundos` : "Desactivado"}

👥 *ESTADÍSTICAS*
• Total de miembros: ${res.size || "No disponible"}
• Administradores: ${res.participants && res.participants.length > 0 ? res.participants.filter(user => user.admin === "admin" || user.admin === "superadmin").map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (superadmin)" : " (admin)"}`).join("\n") : "No encontrado"}

═══════════════════════════
✨ *CONFIGURACIÓN AVANZADA*

🔗 *COMUNIDAD VINCULADA*
${res.isCommunity ? "Este grupo es un chat de avisos" : `${res.linkedParent ? "• ID: " + res.linkedParent : "Este grupo independiente"} ${nameCommunity ? `\n${nameCommunity}` : ""}`}

🔒 *RESTRICCIONES*
• Modo restringido: ${res.restrict ? "✅ Activado" : "❌ Desactivado"}
• Modo anuncios: ${res.announce ? "✅ Activado" : "❌ Desactivado"}

🏘️ *TIPO DE GRUPO*
• Es comunidad: ${res.isCommunity ? "✅ Sí" : "❌ No"}
• Chat de anuncios: ${res.isCommunityAnnounce ? "✅ Sí" : "❌ No"}

🤝 *CONFIGURACIÓN DE MIEMBROS*
• Aprobación de ingreso: ${res.joinApprovalMode ? "✅ Activada" : "❌ Desactivada"}
• Agregar futuros miembros: ${res.memberAddMode ? "✅ Permitido" : "❌ Restringido"}

═══════════════════════════`
            return caption.trim()
        }

        const inviteGroupInfo = async (groupData) => {
            const { id, subject, subjectOwner, subjectTime, size, creation, owner, desc, descId, linkedParent, restrict, announce, isCommunity, isCommunityAnnounce, joinApprovalMode, memberAddMode, ephemeralDuration } = groupData
            let nameCommunity = "No pertenece a ninguna comunidad"
            let groupPicture = "No disponible"
            
            if (linkedParent) {
                let linkedGroupMeta = await conn.groupMetadata(linkedParent).catch(() => null)
                nameCommunity = linkedGroupMeta ? "• Nombre: " + linkedGroupMeta.subject : nameCommunity
            }
            
            pp = await conn.profilePictureUrl(id, 'image').catch(() => null)
            
            const formatParticipants = (participants) =>
                participants && participants.length > 0
                    ? participants.map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (superadmin)" : user.admin === "admin" ? " (admin)" : ""}`).join("\n")
                    : "No encontrado"

            let caption = `═══════════════════════════
🆔 *IDENTIFICADOR*
${id || "No encontrado"}

👑 *CREADOR*
${owner ? `@${owner?.split("@")[0]}` : "No encontrado"} 
${creation ? `• ${formatDate(creation)}` : "(Fecha no disponible)"}

🏷️ *NOMBRE DEL GRUPO*
${subject || "No encontrado"}

✏️ *ÚLTIMA MODIFICACIÓN*
${subjectOwner ? `@${subjectOwner?.split("@")[0]}` : "No encontrado"} 
${subjectTime ? `• ${formatDate(subjectTime)}` : "(Fecha no disponible)"}

📄 *DESCRIPCIÓN*
${desc || "No disponible"}

🗃️ *ID DE LA DESCRIPCIÓN*
${descId || "No encontrado"}

🖼️ *IMAGEN DE PERFIL*
${pp ? pp : groupPicture}

👥 *ESTADÍSTICAS*
• Total de miembros: ${size || "No disponible"}
• Miembros destacados:\n${formatParticipants(groupData.participants)}

═══════════════════════════
✨ *CONFIGURACIÓN AVANZADA*

🔗 *COMUNIDAD VINCULADA*
${isCommunity ? "Este grupo es un chat de avisos" : `${linkedParent ? "• ID: " + linkedParent : "Grupo independiente"} ${nameCommunity ? `\n${nameCommunity}` : ""}`}

🔒 *CONFIGURACIÓN*
• Modo anuncios: ${announce ? "✅ Activado" : "❌ Desactivado"}
• Es comunidad: ${isCommunity ? "✅ Sí" : "❌ No"}
• Chat de anuncios: ${isCommunityAnnounce ? "✅ Sí" : "❌ No"}
• Aprobación de ingreso: ${joinApprovalMode ? "✅ Activada" : "❌ Desactivada"}

═══════════════════════════`
            return caption.trim()
        }

        let info
        try {
            let res = text ? null : await conn.groupMetadata(m.chat)
            info = await MetadataGroupInfo(res)
            console.log('✓ Método de metadatos del grupo')
        } catch {
            const inviteUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
            
            let inviteInfo
            if (inviteUrl) {
                try {
                    inviteInfo = await conn.groupGetInviteInfo(inviteUrl)
                    info = await inviteGroupInfo(inviteInfo)
                    console.log('✓ Método de enlace de invitación')    
                } catch (e) {
                    return await m.reply(`❌ *GRUPO NO ENCONTRADO*\n\nEl enlace proporcionado no corresponde a un grupo de WhatsApp válido.\n\n💡 *Sugerencia:* Verifique que el enlace sea correcto y esté activo.`)
                }
            }
        }

        if (info) {
            const md = "https://chat.whatsapp.com"
            await conn.sendMessage(m.chat, { 
                text: info, 
                contextInfo: {
                    mentionedJid: conn.parseMention(info),
                    externalAdReply: {
                        title: `🔍 INSPECTOR DE GRUPOS`,
                        body: `✨ Análisis completo del grupo`,
                        thumbnailUrl: pp ? pp : thumb,
                        sourceUrl: args[0] || (inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : md),
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: fkontak })
        } else {
            // Manejo de enlaces de canales
            let newsletterInfo
            if (!channelUrl) return await conn.reply(m.chat, `❌ *ENLACE DE CANAL INVÁLIDO*\n\nEl enlace proporcionado no corresponde a un canal de WhatsApp válido.\n\n💡 *Sugerencia:* Asegúrese de usar un enlace de canal de WhatsApp correcto.\n\n${botAdminNotice}`, m)
            
            if (channelUrl) {
                try {
                    newsletterInfo = await conn.newsletterMetadata("invite", channelUrl).catch(() => null)
                    if (!newsletterInfo) return await conn.reply(m.chat, `❌ *CANAL NO ENCONTRADO*\n\nNo se pudo obtener información del canal especificado.\n\n💡 *Posibles causas:*\n• El enlace no es válido\n• El canal no existe\n• Permisos insuficientes\n\n${botAdminNotice}`, m)       
                    
                    let caption = `═══════════════════════════
📢 *INSPECTOR DE CANALES*
✨ Análisis completo del canal

${processObject(newsletterInfo, "", newsletterInfo?.preview)}

═══════════════════════════
⚠️ *NOTA:* Para ejecutar comandos de administración, el bot debe ser administrador del canal.`

                    if (newsletterInfo?.preview) {
                        pp = getUrlFromDirectPath(newsletterInfo.preview)
                    } else {
                        pp = thumb
                    }
                    
                    await conn.sendMessage(m.chat, { 
                        text: caption, 
                        contextInfo: {
                            mentionedJid: conn.parseMention(caption),
                            externalAdReply: {
                                title: `📢 INSPECTOR DE CANALES`,
                                body: `✨ Análisis detallado del canal`,
                                thumbnailUrl: pp,
                                sourceUrl: args[0],
                                mediaType: 1,
                                showAdAttribution: false,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: fkontak })
                    
                    if (newsletterInfo.id) {
                        await conn.sendMessage(m.chat, { text: `🆔 *ID del canal:* ${newsletterInfo.id}` }, { quoted: null })
                    }
                } catch (e) {
                    reportError(e)
                }
            }
        }
        break

    // Seguir un canal de WhatsApp 
    case isCommand2:
        if (!text) return await conn.reply(m.chat, `📢 *SEGUIR CANAL*\n\n📝 *Descripción:* El bot comenzará a seguir el canal especificado.\n\n📋 *Uso:*\n${usedPrefix}${command} <ID_canal | enlace>\n\n💡 *Ejemplo:*\n${usedPrefix}${command} https://chat.whatsapp.com/channel/ABC123\n\n${botAdminNotice}`, m)
        
        if (text.includes("@newsletter")) {
            ch = text
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterFollow(ch)
            await conn.reply(m.chat, `✅ *CANAL SEGUIDO EXITOSAMENTE*\n\n📢 *Canal:* ${chtitle}\n⏰ *Estado:* Suscripción activa\n\n✨ El bot ahora recibirá actualizaciones de este canal.`, m) 
        } catch (e) {
            reportError(e)
        }
        break

    // Dejar de seguir un canal de WhatsApp 
    case isCommand3:
        if (!text) return await conn.reply(m.chat, `📢 *DEJAR DE SEGUIR CANAL*\n\n📝 *Descripción:* El bot dejará de seguir el canal especificado.\n\n📋 *Uso:*\n${usedPrefix}${command} <ID_canal | enlace>\n\n💡 *Ejemplo:*\n${usedPrefix}${command} https://chat.whatsapp.com/channel/ABC123\n\n${botAdminNotice}`, m)
        
        if (text.includes("@newsletter")) {
            ch = text
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterUnfollow(ch)
            await conn.reply(m.chat, `✅ *CANAL DEJADO DE SEGUIR*\n\n📢 *Canal:* ${chtitle}\n⏰ *Estado:* Suscripción cancelada\n\nℹ️ El bot ya no recibirá actualizaciones de este canal.`, m) 
        } catch (e) {
            reportError(e)
        }
        break

    // Silenciar un canal de WhatsApp 
    case isCommand4:
        if (!text) return await conn.reply(m.chat, `🔇 *SILENCIAR CANAL*\n\n📝 *Descripción:* Desactiva las notificaciones del canal especificado.\n\n📋 *Uso:*\n${usedPrefix}${command} <ID_canal | enlace>\n\n💡 *Ejemplo:*\n${usedPrefix}${command} https://chat.whatsapp.com/channel/ABC123\n\n${botAdminNotice}`, m)
        
        if (text.includes("@newsletter")) {
            ch = text
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterMute(ch)
            await conn.reply(m.chat, `✅ *CANAL SILENCIADO*\n\n📢 *Canal:* ${chtitle}\n🔇 *Estado:* Notificaciones desactivadas\n\nℹ️ El bot ya no recibirá notificaciones de este canal.`, m) 
        } catch (e) {
            reportError(e)
        }
        break

    // Dejar de silenciar un canal de WhatsApp 
    case isCommand5:
        if (!text) return await conn.reply(m.chat, `🔊 *ACTIVAR NOTIFICACIONES CANAL*\n\n📝 *Descripción:* Activa las notificaciones del canal especificado.\n\n📋 *Uso:*\n${usedPrefix}${command} <ID_canal | enlace>\n\n💡 *Ejemplo:*\n${usedPrefix}${command} https://chat.whatsapp.com/channel/ABC123\n\n${botAdminNotice}`, m)
        
        if (text.includes("@newsletter")) {
            ch = text
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterUnmute(ch)
            await conn.reply(m.chat, `✅ *NOTIFICACIONES ACTIVADAS*\n\n📢 *Canal:* ${chtitle}\n🔊 *Estado:* Notificaciones activadas\n\nℹ️ El bot volverá a recibir notificaciones de este canal.`, m) 
        } catch (e) {
            reportError(e)
        }
        break

    // Modificar la imagen del canal
    case isCommand6:
        if (!text) return await conn.reply(m.chat, `🖼️ *CAMBIAR IMAGEN DEL CANAL*\n\n📝 *Descripción:* Actualiza la imagen de perfil del canal.\n\n📋 *Opciones de uso:*\n\n1️⃣ *Respondiendo a una imagen:*\n${usedPrefix}${command} <ID_canal>\n\n2️⃣ *Con URL de imagen:*\n${usedPrefix}${command} <ID_canal> <URL_imagen>\n\n💡 *Ejemplos:*\n${usedPrefix}${command} 12345@newsletter\n${usedPrefix}${command} 12345@newsletter https://ejemplo.com/imagen.jpg\n\n⚠️ *Formato soportado:* JPG, JPEG, PNG\n\n${botAdminNotice}`, m)
        
        const regex = /(\b\w+@newsletter\b)(?:.*?(https?:\/\/[^\s]+?\.(?:jpe?g|png)))?/i
        const match = text.match(regex)
        let match1 = match ? match[1] || null : null
        let match2 = match ? match[2] || null : null
        
        if (m.quoted) {
            q = m.quoted ? m.quoted : m
            mime = (q.msg || q).mimetype || q.mediaType || ''
            if (/image/g.test(mime) && !/webp/g.test(mime)) {
                media = await q.download()
            } else {
                return await conn.reply(m.chat, `❌ *FORMATO DE IMAGEN INVÁLIDO*\n\n⚠️ *Error:* La imagen debe estar en formato JPG, JPEG o PNG.\n\n💡 *Solución:* Responda a una imagen válida o proporcione una URL correcta.`, m)
            }
        } else { 
            const imageUrlRegex = /(https?:\/\/[^\s]+?\.(?:jpe?g|png))/
            if (!match2 && !text.match(imageUrlRegex)) return await conn.reply(m.chat, `❌ *URL DE IMAGEN REQUERIDA*\n\n⚠️ *Error:* Debe proporcionar una URL de imagen válida después del ID del canal.\n\n💡 *Ejemplo:*\n${usedPrefix}${command} 12345@newsletter https://ejemplo.com/imagen.jpg`, m)
            
            try {
                const response = await axios.get(match2 || text.match(imageUrlRegex)[0], { responseType: 'arraybuffer' })
                imageBuffer = Buffer.from(response.data, 'binary')
            } catch (error) {
                return await conn.reply(m.chat, `❌ *ERROR AL DESCARGAR IMAGEN*\n\n⚠️ *Causa:* No se pudo descargar la imagen desde la URL proporcionada.\n\n💡 *Solución:* Verifique que la URL sea accesible y contenga una imagen válida.`, m)
            }
            media = imageBuffer
        }
        
        if (text.includes("@newsletter")) {
            if(!match1) return await conn.reply(m.chat, `❌ *ID DE CANAL REQUERIDO*\n\n⚠️ *Error:* No se encontró el ID del canal en el mensaje.\n\n💡 *Formato correcto:*\n${usedPrefix}${command} 12345@newsletter`, m)
            ch = match1
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterUpdatePicture(ch, media)
            
            const successMessage = `✅ *IMAGEN DEL CANAL ACTUALIZADA*\n\n📢 *Canal:* ${chtitle}\n🖼️ *Estado:* Imagen de perfil actualizada exitosamente\n\n✨ La nueva imagen ha sido aplicada correctamente.`
            
            await conn.sendMessage(m.chat, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Nueva imagen de perfil aplicada al canal',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
            
            await conn.sendMessage(ch, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Nueva imagen de perfil aplicada al canal',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
        } catch (e) {
            reportError(e)
        }
        break

    // Eliminar la imagen del canal
    case isCommand7:
        if (!text) return await conn.reply(m.chat, `🗑️ *ELIMINAR IMAGEN DEL CANAL*\n\n📝 *Descripción:* Elimina la imagen de perfil del canal.\n\n📋 *Uso:*\n${usedPrefix}${command} <ID_canal | enlace>\n\n💡 *Ejemplo:*\n${usedPrefix}${command} https://chat.whatsapp.com/channel/ABC123\n\n${botAdminNotice}`, m)
        
        if (text.includes("@newsletter")) {
            ch = text
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterRemovePicture(ch)
            
            const successMessage = `✅ *IMAGEN DEL CANAL ELIMINADA*\n\n📢 *Canal:* ${chtitle}\n🗑️ *Estado:* Imagen de perfil eliminada exitosamente\n\nℹ️ El canal ahora no tiene imagen de perfil.`
            
            await conn.sendMessage(m.chat, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Imagen de perfil del canal eliminada',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
            
            await conn.sendMessage(ch, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Imagen de perfil del canal eliminada',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
        } catch (e) {
            reportError(e)
        }
        break

    // Recibir notificaciones de actualizaciones del canal en tiempo real
    case isCommand8:
        if (!text) return await conn.reply(m.chat, `🔔 *SUSCRIBIRSE A ACTUALIZACIONES*\n\n📝 *Descripción:* El bot recibirá notificaciones en tiempo real de los cambios en el canal.\n\n📋 *Uso:*\n${usedPrefix}${command} <ID_canal | enlace>\n\n💡 *Ejemplo:*\n${usedPrefix}${command} https://chat.whatsapp.com/channel/ABC123\n\n${botAdminNotice}`, m)
        
        if (text.includes("@newsletter")) {
            ch = text
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.subscribeNewsletterUpdates(ch)
            await conn.reply(m.chat, `✅ *SUSCRIPCIÓN A ACTUALIZACIONES ACTIVADA*\n\n📢 *Canal:* ${chtitle}\n🔔 *Estado:* Monitoreo activo\n\n✨ El bot recibirá notificaciones de todos los cambios en tiempo real.`, m) 
        } catch (e) {
            reportError(e)
        }
        break

    // Establece el modo de reacciones en un canal de WhatsApp 
    case isCommand9:
        if (!text) return await conn.reply(m.chat, `😃 *CONFIGURAR REACCIONES DEL CANAL*\n\n📝 *Descripción:* Establece las reglas de reacciones permitidas en el canal.\n\n📋 *Opciones disponibles:*\n\n1️⃣ *[1]* - Reacción con cualquier emoji\n2️⃣ *[2]* - Solo emojis predeterminados\n3️⃣ *[3]* - Ninguna reacción permitida\n\n📝 *Uso:*\n${usedPrefix}${command} <ID_canal> <opción>\n\n💡 *Ejemplos:*\n${usedPrefix}${command} 12345@newsletter 1\n${usedPrefix}${command} 12345@newsletter 2\n\n${botAdminNotice}`, m)

        const parts = text.split(' ')
        const modeNumber = parseInt(parts.pop())
        ch = parts.join(' ')

        let mode
        switch (modeNumber) {
            case 1:
                mode = 'ALL'
                break
            case 2:
                mode = 'BASIC'
                break
            case 3:
                mode = 'NONE'
                break
            default:
                return await conn.reply(m.chat, `❌ *OPCIÓN DE REACCIONES INVÁLIDA*\n\n⚠️ *Error:* La opción ${modeNumber} no es válida.\n\n📋 *Opciones disponibles:*\n\n1️⃣ *[1]* - Reacción con cualquier emoji\n2️⃣ *[2]* - Solo emojis predeterminados\n3️⃣ *[3]* - Ninguna reacción permitida\n\n💡 *Ejemplo:*\n${usedPrefix}${command} 12345@newsletter 1`, m)
        }

        if (ch.includes("@newsletter")) {
            ch = ch.trim()
        } else {
            ch = await conn.newsletterMetadata("invite", ch).then(data => data.id).catch(() => null)
        }

        try {
            const chtitle = await conn.newsletterMetadata(ch.includes("@newsletter") ? "jid" : "invite", ch.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterReactionMode(ch, mode)
            
            const modeText = mode === 'ALL' ? 'Cualquier emoji' : mode === 'BASIC' ? 'Emojis predeterminados' : 'Ninguna reacción'
            const successMessage = `✅ *MODO DE REACCIONES CONFIGURADO*\n\n📢 *Canal:* ${chtitle}\n😃 *Modo:* ${modeText}\n\nℹ️ Las reglas de reacciones han sido actualizadas correctamente.`
            
            await conn.sendMessage(m.chat, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Configuración de reacciones actualizada',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
            
            await conn.sendMessage(ch, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Configuración de reacciones actualizada',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
        } catch (e) {
            reportError(e)
        }
        break

    // Modificar nombre del canal
    case isCommand10:
        if (!text) return await conn.reply(m.chat, `🏷️ *CAMBIAR NOMBRE DEL CANAL*\n\n📝 *Descripción:* Actualiza el nombre del canal especificado.\n\n⚠️ *Límite:* Máximo 99 caracteres\n\n📋 *Uso:*\n${usedPrefix}${command} <ID_canal> <nuevo_nombre>\n\n💡 *Ejemplo:*\n${usedPrefix}${command} 12345@newsletter "Canal Oficial Noticias"\n\n${botAdminNotice}`, m)
        
        const [id, ...nameParts] = text.split(' ')
        const name = nameParts.join(' ').trim()
        
        if (name.length > 99) return await conn.reply(m.chat, `❌ *NOMBRE DEMASIADO LARGO*\n\n⚠️ *Error:* El nombre del canal no puede exceder los 99 caracteres.\n\n📏 *Longitud actual:* ${name.length} caracteres\n\n💡 *Solución:* Use un nombre más corto.`, m)
        
        if (text.includes("@newsletter")) {
            ch = id.trim()
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterUpdateName(ch, name)
            
            const successMessage = `✅ *NOMBRE DEL CANAL ACTUALIZADO*\n\n📢 *Canal:* ${chtitle}\n\n🏷️ *Cambio realizado:*\n• *Anterior:* ${chtitle}\n• *Nuevo:* ${name}\n\n✨ El nombre del canal ha sido actualizado exitosamente.`
            
            await conn.sendMessage(m.chat, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Nuevo nombre aplicado al canal',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
            
            await conn.sendMessage(ch, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Nuevo nombre aplicado al canal',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
        } catch (e) {
            reportError(e)
        }
        break

    // Modificar la descripción del canal
    case isCommand11:
        if (!text) return await conn.reply(m.chat, `📝 *CAMBIAR DESCRIPCIÓN DEL CANAL*\n\n📝 *Descripción:* Actualiza la descripción del canal especificado.\n\n📋 *Uso:*\n${usedPrefix}${command} <ID_canal> <nueva_descripción>\n\n💡 *Ejemplo:*\n${usedPrefix}${command} 12345@newsletter "Bienvenidos al canal oficial de noticias"\n\n${botAdminNotice}`, m)
        
        const [idch, ...descriptionParts] = text.split(' ')
        const description = descriptionParts.join(' ').trim()
        
        if (text.includes("@newsletter")) {
            ch = idch.trim()
        } else {
            ch = await conn.newsletterMetadata("invite", channelUrl).then(data => data.id).catch(() => null)
        }       
        
        try {
            const chtitle = await conn.newsletterMetadata(text.includes("@newsletter") ? "jid" : "invite", text.includes("@newsletter") ? ch : channelUrl).then(data => data.name).catch(() => null)
            await conn.newsletterUpdateDescription(ch, description)
            
            const successMessage = `✅ *DESCRIPCIÓN DEL CANAL ACTUALIZADA*\n\n📢 *Canal:* ${chtitle}\n\n📄 *Nueva descripción:*\n${description}\n\n✨ La descripción del canal ha sido actualizada exitosamente.`
            
            await conn.sendMessage(m.chat, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Nueva descripción aplicada al canal',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
            
            await conn.sendMessage(ch, { 
                text: successMessage, 
                contextInfo: {
                    externalAdReply: {
                        title: "🔔 NOTIFICACIÓN DEL SISTEMA",
                        body: 'Nueva descripción aplicada al canal',
                        thumbnailUrl: pp,
                        sourceUrl: "",
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null })
        } catch (e) {
            reportError(e)
        }
        break
}

handler.tags = ['channel']
handler.command = handler.help = ['nuevafotochannel', 'nosilenciarcanal', 'silenciarcanal', 'noseguircanal', 'seguircanal', 'avisoschannel', 'resiviravisos', 'inspect', 'eliminarfotochannel', 'reactioneschannel', 'reaccioneschannel', 'nuevonombrecanal', 'nuevadescchannel', 'inspeccionar']
handler.register = false
export default handler 

function formatDate(n, locale = "es", includeTime = true) {
    if (n > 1e12) {
        n = Math.floor(n / 1000)
    } else if (n < 1e10) {
        n = Math.floor(n * 1000)
    }
    const date = new Date(n)
    if (isNaN(date)) return "Fecha no válida"
    const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' }
    const formattedDate = date.toLocaleDateString(locale, optionsDate)
    if (!includeTime) return formattedDate
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const period = hours < 12 ? 'AM' : 'PM'
    const formattedTime = `${hours}:${minutes}:${seconds} ${period}`
    return `${formattedDate}, ${formattedTime}`
}

function formatValue(key, value, preview) {
    switch (key) {
        case "subscribers":
            return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "Sin suscriptores"
        case "creation_time":
        case "nameTime":
        case "descriptionTime":
            return formatDate(value)
        case "description": 
        case "name":
            return value || "Sin información"
        case "state":
            switch (value) {
                case "ACTIVE": return "🟢 Activo"
                case "GEOSUSPENDED": return "🌍 Suspendido por región"
                case "SUSPENDED": return "🔴 Suspendido"
                default: return "❓ Desconocido"
            }
        case "reaction_codes":
            switch (value) {
                case "ALL": return "✅ Todas las reacciones"
                case "BASIC": return "⚡ Reacciones básicas"
                case "NONE": return "🚫 Sin reacciones"
                default: return "❓ Desconocido"
            }
        case "verification":
            switch (value) {
                case "VERIFIED": return "✅ Verificado"
                case "UNVERIFIED": return "❌ No verificado"
                default: return "❓ Desconocido"
            }
        case "mute":
            switch (value) {
                case "ON": return "🔇 Silenciado"
                case "OFF": return "🔊 Activo"
                case "UNDEFINED": return "❓ Sin definir"
                default: return "❓ Desconocido"
            }
        case "view_role":
            switch (value) {
                case "ADMIN": return "👑 Administrador"
                case "OWNER": return "💎 Propietario"
                case "SUBSCRIBER": return "👤 Suscriptor"
                case "GUEST": return "👻 Invitado"
                default: return "❓ Desconocido"
            }
        case "picture":
            if (preview) {
                return getUrlFromDirectPath(preview)
            } else {
                return "❌ Sin imagen"
            }
        default:
            return value !== null && value !== undefined ? value.toString() : "Sin información"
    }
}

function newsletterKey(key) {
    return _.startCase(key.replace(/_/g, " "))
        .replace("Id", "🆔 Identificador")
        .replace("State", "📌 Estado")
        .replace("Creation Time", "📅 Fecha de creación")
        .replace("Name Time", "✏️ Última modificación del nombre")
        .replace("Name", "🏷️ Nombre del canal")
        .replace("Description Time", "📝 Última modificación de descripción")
        .replace("Description", "📜 Descripción")
        .replace("Invite", "📩 Código de invitación")
        .replace("Handle", "👤 Nombre de usuario")
        .replace("Picture", "🖼️ Imagen de perfil")
        .replace("Preview", "👀 Vista previa")
        .replace("Reaction Codes", "😃 Configuración de reacciones")
        .replace("Subscribers", "👥 Total de suscriptores")
        .replace("Verification", "✅ Estado de verificación")
        .replace("Viewer Metadata", "🔍 Información avanzada")
}

function processObject(obj, prefix = "", preview) {
    let caption = ""
    Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (typeof value === "object" && value !== null) {
            if (Object.keys(value).length > 0) {
                const sectionName = newsletterKey(prefix + key)
                caption += `\n═══════════════════════════\n${sectionName}\n═══════════════════════════\n`
                caption += processObject(value, `${prefix}${key}_`)
            }
        } else {
            const shortKey = prefix ? prefix.split("_").pop() + "_" + key : key
            const displayValue = formatValue(shortKey, value, preview)
            const translatedKey = newsletterKey(shortKey)
            caption += `${translatedKey}\n${displayValue}\n\n`
        }
    })
    return caption.trim()
}