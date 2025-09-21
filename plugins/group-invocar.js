const handler = async (m, { isOwner, isAdmin, conn, args, command, participants }) => {
  if (!isAdmin && !isOwner) return m.reply('» Solo administradores pueden usar esto.')

  await m.react('🕒')

  try {
    const mensaje = args.join` `
    const encabezado = `❀ Mención general ❀`
    const info = `⌦ Grupo: *${await conn.getName(m.chat)}*\n⌦ Miembros: *${participants.length}*\n⌦ Motivo: *${mensaje || 'Sin mensaje personalizado'}*`

    const mentionsList = participants.map(p => p.id)
    mentionsList.push(m.sender)

    let cuerpo = `\n♡ Miembros mencionados:\n`
    for (const id of mentionsList) {
      cuerpo += `» @${id.split('@')[0]}\n`
    }

    const pie = `\n❒ Versión: *${global.vs || '1.0'}*`
    const textoFinal = `${encabezado}\n\n${info}\n${cuerpo}${pie}`

    await conn.sendMessage(m.chat, {
      text: textoFinal,
      mentions: mentionsList,
      ...global.rcanal
    }, { quoted: m })

    await m.react('✔️')
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error.', ...global.rcanal }, { quoted: m })
    await m.react('✖️')
  }
}

handler.help = ['todos']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.admin = true
handler.group = true

export default handler
