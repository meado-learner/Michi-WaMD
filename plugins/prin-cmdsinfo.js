import { readdirSync, unlinkSync, existsSync, promises as fs } from 'fs';
import path from 'path';
import cp from 'child_process';
import { promisify } from 'util';
import moment from 'moment-timezone';

const exec = promisify(cp.exec).bind(cp);
const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

const handler = async (m, { conn, text, command, usedPrefix, args }) => {
  try {
    const nombre = m.pushName || 'Anónimo';
    const tag = '@' + m.sender.split('@')[0];
    const usertag = Array.from(new Set([...text.matchAll(/@(\d{5,})/g)]), m => `${m[1]}@s.whatsapp.net`);
    const chatLabel = m.isGroup ? (await conn.getName(m.chat) || 'Grupal') : 'Privado';
    const horario = moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A');

    switch (command) {
      case 'suggest':
      case 'sug': {
        if (!text) return conn.sendMessage(m.chat, { text: '✐ Por favor, escribe la sugerencia que deseas enviar al desarrollador.', ...rcanal }, { quoted: m });
        if (text.length < 10) return conn.sendMessage(m.chat, { text: 'ꕥ La sugerencia debe contener al menos 10 caracteres.', ...rcanal }, { quoted: m });
        await m.react('🕒');

        const sug = `「✦」SUGERENCIA RECIBIDA

✐ Usuario » *${nombre}*
✩ Tag » *${tag}*
✿ Sugerencia » ${text}
✰ Chat » *${chatLabel}*
🜸 Fecha » *${horario}*
♤ InfoBot » *${botname} / ${vs}*`;

        await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: sug, mentions: [m.sender, ...usertag], ...rcanal }, { quoted: m });
        await m.react('✔️');
        await conn.sendMessage(m.chat, { text: '❒ Tu sugerencia ha sido enviada correctamente. Gracias por contribuir a mejorar el Bot.', ...rcanal }, { quoted: m });
        break;
      }

      case 'report':
      case 'reportar': {
        if (!text) return conn.sendMessage(m.chat, { text: '✐ Por favor, describe el error que deseas reportar.', ...rcanal }, { quoted: m });
        if (text.length < 10) return conn.sendMessage(m.chat, { text: 'ꕥ El reporte debe contener al menos 10 caracteres.', ...rcanal }, { quoted: m });
        await m.react('🕒');

        const rep = `「✦」REPORTE RECIBIDO

✐ Usuario » *${nombre}*
✩ Tag » *${tag}*
✿ Reporte » ${text}
✰ Chat » *${chatLabel}*
🜸 Fecha » *${horario}*
♤ InfoBot » *${botname} / ${vs}*`;

        await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: rep, mentions: [m.sender, ...usertag], ...rcanal }, { quoted: m });
        await m.react('✔️');
        await conn.sendMessage(m.chat, { text: '❒ El reporte ha sido enviado correctamente. Si el error es falso o malintencionado, podrían aplicarse restricciones.', ...rcanal }, { quoted: m });
        break;
      }

      case 'invite': {
        if (!text) return conn.sendMessage(m.chat, { text: '✐ Debes enviar un enlace válido para invitar al Bot a tu grupo.', ...rcanal }, { quoted: m });
        let [_, code] = text.match(linkRegex) || [];
        if (!code) return conn.sendMessage(m.chat, { text: 'ꕥ El enlace de invitación no es válido.', ...rcanal }, { quoted: m });
        await m.react('🕒');

        const invite = `「✦」INVITACIÓN RECIBIDA

✐ Usuario » *${nombre}*
✩ Tag » *${tag}*
✰ Chat » *${chatLabel}*
🜸 Fecha » *${horario}*
♤ InfoBot » *${botname} / ${vs}*
❒ Link » ${text}`;

        const mainBotNumber = global.conn.user.jid.split('@')[0];
        const senderBotNumber = conn.user.jid.split('@')[0];
        const destino = mainBotNumber === senderBotNumber ? `${suittag}@s.whatsapp.net` : `${senderBotNumber}@s.whatsapp.net`;

        await conn.sendMessage(destino, { text: invite, mentions: [m.sender, ...usertag], ...rcanal }, { quoted: m });
        await m.react('✔️');
        await conn.sendMessage(m.chat, { text: '❒ El enlace ha sido enviado correctamente. Gracias por tu invitación.', ...rcanal }, { quoted: m });
        break;
      }

      case 'fixmsg':
      case 'ds': {
        if (global.conn.user.jid !== conn.user.jid)
          return conn.sendMessage(m.chat, { text: '✐ Este comando solo puede ejecutarse desde el número principal del Bot.', ...rcanal }, { quoted: m });
        await m.react('🕒');

        const chatIdList = m.isGroup ? [m.chat, m.sender] : [m.sender];
        const sessionPath = './Sessions/';
        let files = await fs.readdir(sessionPath);
        let count = 0;

        for (let file of files) {
          for (let id of chatIdList) {
            if (file.includes(id.split('@')[0])) {
              await fs.unlink(path.join(sessionPath, file));
              count++;
              break;
            }
          }
        }

        await m.react(count === 0 ? '✖️' : '✔️');
        await conn.sendMessage(m.chat, { text: count === 0
          ? 'ꕥ No se encontraron archivos de sesión relacionados con tu ID.'
          : `❒ Se eliminaron *${count}* archivos de sesión correctamente.`, ...rcanal }, { quoted: m });
        break;
      }
    }
  } catch (err) {
    await m.react('✖️');
    await conn.sendMessage(m.chat, { text: `⚠︎ Ocurrió un error inesperado.\n> Usa *${usedPrefix}report* para informarlo.\n\n🜸 Detalles: ${err.message}`, ...rcanal }, { quoted: m });
  }
};

handler.help = ['suggest', 'reporte', 'invite', 'fixmsg'];
handler.tags = ['ayuda'];
handler.command = ['suggest', 'sug', 'report', 'reportar', 'invite', 'fixmsg', 'ds'];

export default handler;
