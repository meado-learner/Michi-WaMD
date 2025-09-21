import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args }) => {
  try {
    const chatId = m.chat
    if (!chatId.endsWith('@g.us')) {
      return await conn.sendMessage(chatId, { text: `𖣣ֶㅤ֯⌗ Este comando solo se puede usar en grupos.`, quoted: m })
    }

    const metadata = await conn.groupMetadata(chatId)
    const allMentions = metadata.participants.map(p => p.id)
    let messageToForward = null

    const streamToBuffer = async (stream) => {
      let buffer = Buffer.alloc(0)
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
      return buffer
    }

    const getQuotedMessage = m.quoted?.message || m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (getQuotedMessage) {
      const quoted = getQuotedMessage

      if (quoted.imageMessage) {
        const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.imageMessage, 'image'))
        messageToForward = { image: buffer, mimetype: quoted.imageMessage.mimetype || 'image/jpeg', caption: quoted.imageMessage.caption || '' }
      } else if (quoted.videoMessage) {
        const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.videoMessage, 'video'))
        messageToForward = { video: buffer, mimetype: quoted.videoMessage.mimetype || 'video/mp4', caption: quoted.videoMessage.caption || '' }
      } else if (quoted.audioMessage) {
        const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.audioMessage, 'audio'))
        messageToForward = { audio: buffer, mimetype: quoted.audioMessage.mimetype || 'audio/mp3' }
      } else if (quoted.stickerMessage) {
        const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.stickerMessage, 'sticker'))
        messageToForward = { sticker: buffer }
      } else if (quoted.documentMessage) {
        const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.documentMessage, 'document'))
        messageToForward = { document: buffer, mimetype: quoted.documentMessage.mimetype || 'application/pdf', caption: quoted.documentMessage.caption || '' }
      } else if (quoted.conversation || quoted.extendedTextMessage?.text) {
        messageToForward = { text: quoted.conversation || quoted.extendedTextMessage.text }
      }
    }

    if (!messageToForward && args.join(' ').trim()) {
      messageToForward = { text: args.join(' ') }
    }

    if (!messageToForward) {
      return await conn.sendMessage(chatId, { text: `> ⌗ Debes responder a un mensaje o escribir algo para etiquetar al grupo.`, quoted: m })
    }

    await conn.sendMessage(chatId, { ...messageToForward, mentions: allMentions }, { quoted: m })

  } catch (error) {
    console.error('❌ Error en el comando tag:', error)
    await conn.sendMessage(m.chat, { text: `𖣣ֶㅤ֯⌗ 🕸 Ocurrió un error al ejecutar el comando *tag*.`, quoted: m })
  }
}

handler.command = ['tag']
handler.help = ['tag']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler
