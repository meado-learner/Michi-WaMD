const handler = async (m, { isOwner, isAdmin, conn, args, command, participants }) => {
  if (!isAdmin && !isOwner) return m.reply('» Solo administradores pueden usar esto.')

  await m.react('🕒')

  try {
    const mensaje = args.join` `
    const encabezado = `❀ Mención general ❀`
    const info = `⌦ Grupo: *${await conn.getName(m.chat)}*\n⌦ Miembros: *${participants.length}*\n⌦ Motivo: *${mensaje || 'Sin mensaje personalizado'}*`

    let cuerpo = `\n♡ Miembros mencionados:\n`
    for (const mem of participants) {
      cuerpo += `» @${mem.id.split('@')[0]}\n`
    }

    
    cuerpo += `» @${m.sender.split('@')[0]} (Tú)\n`

    const pie = `\n❒ Versión: *${global.vs || '1.0'}*`

    const textoFinal = `${encabezado}\n\n${info}\n${cuerpo}${pie}`

    
    const mentionsList = [...participants.map(p => p.id), m.sender]

    await conn.sendMessage(m.chat, {
      text: textoFinal,
      mentions: mentionsList,
      ...global.rcanal
    }, { quoted: m })

    await m.react('✔️') // reacción de éxito
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
