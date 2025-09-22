import { promises as _0x3d1df1 } from 'fs';
const verifi = async () => {
  try {
    const _0x1e76ba = await _0x3d1df1.readFile("./package.json", "utf-8");
    const _0x4b4433 = JSON.parse(_0x1e76ba);
    return _0x4b4433.repository?.["url"] === 'git+https://github.com/meado-learner/Michi-WaMD.git';
  } catch {
    return false;
  }
};
let handler = async (_0x73f8df, {
  conn: _0x240186,
  args: _0x39f2d5,
  usedPrefix: _0x135643
}) => {
  if (!(await verifi())) {
    return _0x240186.reply(_0x73f8df.chat, "❀ El comando *<" + command + ">* solo está disponible para Michi", _0x73f8df);
  }
  if (!global.db.data.chats?.[_0x73f8df.chat]?.['gacha'] && _0x73f8df.isGroup) {
    return _0x73f8df.reply("ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *" + _0x135643 + "gacha on*");
  }
  try {
    const _0x5265de = global.db.data.users[_0x73f8df.sender];
    if (!Array.isArray(_0x5265de.characters)) {
      _0x5265de.characters = [];
    }
    if (!_0x39f2d5.length) {
      return _0x73f8df.reply("❀ Debes escribir el nombre del personaje y citar o mencionar al usuario que lo recibirá");
    }
    const _0x418721 = await _0x73f8df.mentionedJid;
    const _0x17307f = _0x418721[0x0] || _0x73f8df.quoted && (await _0x73f8df.quoted.sender);
    if (!_0x17307f) {
      return _0x73f8df.reply("❀ Debes mencionar o citar el mensaje del destinatario.");
    }
    const _0x1162e4 = _0x73f8df.quoted ? _0x39f2d5.join(" ").toLowerCase().trim() : _0x39f2d5.slice(0x0, -0x1).join(" ").toLowerCase().trim();
    const _0x1603dd = Object.keys(global.db.data.characters).find(_0xf79a4b => {
      const _0x4c25a0 = global.db.data.characters[_0xf79a4b];
      return typeof _0x4c25a0.name === "string" && _0x4c25a0.name.toLowerCase() === _0x1162e4 && _0x4c25a0.user === _0x73f8df.sender;
    });
    if (!_0x1603dd) {
      return _0x73f8df.reply("ꕥ No se encontró el personaje *" + _0x1162e4 + "* o no está reclamado por ti.");
    }
    const _0x17401b = global.db.data.characters[_0x1603dd];
    if (!_0x5265de.characters.includes(_0x1603dd)) {
      return _0x73f8df.reply("ꕥ *" + _0x17401b.name + "* no está reclamado por ti.");
    }
    const _0x57fad = global.db.data.users[_0x17307f];
    if (!_0x57fad) {
      return _0x73f8df.reply("ꕥ El usuario mencionado no está registrado.");
    }
    if (!Array.isArray(_0x57fad.characters)) {
      _0x57fad.characters = [];
    }
    if (!_0x57fad.characters.includes(_0x1603dd)) {
      _0x57fad.characters.push(_0x1603dd);
    }
    _0x5265de.characters = _0x5265de.characters.filter(_0x2be762 => _0x2be762 !== _0x1603dd);
    _0x17401b.user = _0x17307f;
    if (_0x5265de.sales?.[_0x1603dd]?.["user"] === _0x73f8df.sender) {
      delete _0x5265de.sales[_0x1603dd];
    }
    if (_0x5265de.favorite === _0x1603dd) {
      delete _0x5265de.favorite;
    }
    if (global.db.data.users[_0x73f8df.sender]?.["favorite"] === _0x1603dd) {
      delete global.db.data.users[_0x73f8df.sender].favorite;
    }
    let _0x41331a = await (async () => _0x5265de.name?.["trim"]() || (await _0x240186.getName(_0x73f8df.sender).then(_0x182642 => typeof _0x182642 === "string" && _0x182642.trim() ? _0x182642 : _0x73f8df.sender.split('@')[0x0])["catch"](() => _0x73f8df.sender.split('@')[0x0])))();
    let _0x5525c5 = await (async () => _0x57fad.name?.["trim"]() || (await _0x240186.getName(_0x17307f).then(_0x444e4e => typeof _0x444e4e === 'string' && _0x444e4e.trim() ? _0x444e4e : _0x17307f.split('@')[0x0])["catch"](() => _0x17307f.split('@')[0x0])))();
    await _0x240186.reply(_0x73f8df.chat, "❀ *" + _0x17401b.name + "* ha sido regalado a *" + _0x5525c5 + "* por *" + _0x41331a + '*.', _0x73f8df, {
      'mentions': [_0x17307f]
    });
  } catch (_0x214aa6) {
    await _0x240186.reply(_0x73f8df.chat, "⚠︎ Se ha producido un problema.\n> Usa *" + _0x135643 + "report* para informarlo.\n\n" + _0x214aa6.message, _0x73f8df);
  }
};
handler.help = ["regalar"];
handler.tags = ["gacha"];
handler.command = ["givechar", "givewaifu", "regalar"];
handler.group = true;
export default handler;
