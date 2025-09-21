import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react('🕓')

    let q = m.quoted ? m.quoted : m  
    let mime = (q.msg || q).mimetype || q.mediaType || ''  

    if (!mime) {  
      return conn.sendMessage(m.chat, {  
        text: `❀ Por favor, envía una imagen o responde a una imagen usando *${usedPrefix + command}*`,  
        ...global.rcanal  
      }, { quoted: m })  
    }  

    if (!/image\/(jpe?g|png|webp)/.test(mime)) {  
      return conn.sendMessage(m.chat, {  
        text: `✧ El formato (${mime}) no es compatible, usa JPG, PNG o WEBP.`,  
        ...global.rcanal  
      }, { quoted: m })  
    }  

    await conn.sendMessage(m.chat, {  
      text: `ꕤ Mejorando la calidad, aguarda un momento..`,  
      ...global.rcanal  
    }, { quoted: m })  

    let imgBuffer = await q.download?.()  
    if (!imgBuffer) throw new Error('No pude descargar la imagen.')  

    
    const formData = new FormData()
    formData.append('fileToUpload', imgBuffer, 'image.jpg')

    const uploadRes = await fetch('https://adonixfiles.mywire.org/upload', {
      method: 'POST',
      body: formData
    })
    if (!uploadRes.ok) throw new Error('Error al subir la imagen')
    const uploadedUrl = await uploadRes.text() 

    
    const apiUrl = `https://api-adonix.ultraplus.click/canvas/hd?apikey=Adofreekey&url=${encodeURIComponent(uploadedUrl)}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Error al mejorar la imagen')
    const buffer = await res.buffer()

    await conn.sendMessage(m.chat, {  
      image: buffer,  
      caption: '> ❐ *Imagen mejorada con éxito*',  
      ...global.rcanal  
    }, { quoted: m })  

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    await conn.sendMessage(m.chat, {
      text: '❌ Error al mejorar la imagen, inténtalo más tarde.',
      ...global.rcanal
    }, { quoted: m })
  }
}

handler.help = ['hd']
handler.tags = ['herramientas']
handler.command = ['remini', 'hd', 'enhance']

export default handler
