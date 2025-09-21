import https from 'https'
import cheerio from 'cheerio'
import iconv from 'iconv-lite'

var handler = async (m, { conn, text }) => {
  if (!text) return conn.sendMessage(m.chat, { text: '⚠︎ Por favor escribe un tema. Ej: /grupos musica' }, { quoted: m })

  await m.react('🕒')

  try {
    const grupos = await getGrupos(text)
    if (grupos.length === 0) {
      await conn.sendMessage(m.chat, { text: `❀ No se encontraron grupos para el tema "${text}".` }, { quoted: m })
      await m.react('✔️')
      return
    }

    let mensaje = `❀ Grupos encontrados para "${text}" (${grupos.length}):\n\n`
    grupos.slice(0, 10).forEach((g, i) => {
      mensaje += `*${i + 1}.* ${g.nombre}\n${g.descripcion ? g.descripcion + '\n' : ''}Categoría: ${g.categoria || 'N/A'}\nEnlace: ${g.link}\n\n`
    })
    mensaje += '❀ Mostrando los primeros 10 resultados.'

    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m })
    await m.react('✔️')
  } catch (err) {
    await conn.sendMessage(m.chat, { text: `⚠︎ Error al obtener los grupos: ${err.message}` }, { quoted: m })
    await m.react('✖️')
  }
}

// Función para obtener grupos
async function getGrupos(tema) {
  const url = `https://www.gruposwats.com/`
  const html = await fetchLatin1(url)
  const $ = cheerio.load(html)
  const grupos = []

  $('.divgrupowhatsapp').each((_, el) => {
    const nombre = $(el).find('.grupo_nombre').text().trim()
    const descripcion = $(el).find('.grupo_descripcion').text().trim()
    const categoria = $(el).find('.grupo_categoria').text().trim()
    const img = $(el).find('img.img_grupowasap').attr('src')
    const link = $(el).find('a.btn-unirse').attr('href') || $(el).find('a').attr('href')

    if (nombre && link && nombre.toLowerCase().includes(tema.toLowerCase())) {
      grupos.push({
        nombre,
        descripcion,
        categoria,
        img: img?.startsWith('http') ? img : `https://www.gruposwats.com/${img}`,
        link
      })
    }
  })

  return grupos
}

// Función para leer páginas con encoding windows-1252
async function fetchLatin1(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const decoded = iconv.decode(buffer, 'windows-1252')
        resolve(decoded)
      })
    }).on('error', reject)
  })
}

handler.help = ['grupos <tema>']
handler.tags = ['buscadores']
handler.command = ['grupos', 'wa', 'whatsgrupos']

export default handler
