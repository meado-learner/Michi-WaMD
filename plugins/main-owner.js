let handler = async (m, { conn, usedPrefix, isOwner }) => {
let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Ado⁩;;\nFN:Ado\nORG:Ado\nTITLE:\nitem1.TEL;waid=50493732693:50493732693\nitem1.X-ABLabel:Ado\nX-WA-BIZ-DESCRIPTION:\nX-WA-BIZ-NAME:Ado\nEND:VCARD`
await conn.sendMessage(m.chat, { contacts: { displayName: 'Ado', contacts: [{ vcard }] }}, {quoted: m})
}
handler.help = ['owner']
handler.tags = ['main']
handler.command = ['owner', 'creator', 'creador', 'dueño'] 

export default handler
