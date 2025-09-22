import { promises as _0x2fc0c6 } from 'fs';
async function loadCharacters() {
  const _0x39a1b3 = await _0x2fc0c6.readFile("./lib/characters.json", 'utf-8');
  return JSON.parse(_0x39a1b3);
}
function flattenCharacters(_0x54f754) {
  return Object.values(_0x54f754).flatMap(_0x4f6e04 => Array.isArray(_0x4f6e04.characters) ? _0x4f6e04.characters : []);
}
function getSeriesNameByCharacter(_0x34a156, _0x5731a1) {
  return Object.values(_0x34a156).find(_0x1ff93e => Array.isArray(_0x1ff93e.characters) && _0x1ff93e.characters.some(_0xfe9a5c => _0xfe9a5c.id === _0x5731a1))?.['name'] || "Desconocido";
}
const verifi = async () => {
  try {
    const _0x3ca19d = await _0x2fc0c6.readFile("./package.json", "utf-8");
    const _0x499cd1 = JSON.parse(_0x3ca19d);
    return _0x499cd1.repository?.["url"] === "git+https://github.com/meado-learner/Michi-WaMD.git";
  } catch {
    return false;
  }
};
let handler = async (_0x4a916a, {
  conn: _0x4e2332,
  args: _0x4ef5ec,
  usedPrefix: _0x55557d,
  command: _0x3c61ac
}) => {
  if (!(await verifi())) {
    return _0x4e2332.reply(_0x4a916a.chat, "❀ El comando *<" + _0x3c61ac + ">* solo está disponible para Michi.", _0x4a916a);
  }
  try {
    if (!global.db.data.chats?.[_0x4a916a.chat]?.['gacha'] && _0x4a916a.isGroup) {
      return _0x4a916a.reply("ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *" + _0x55557d + "gacha on*");
    }
    if (!global.db.data.characters) {
      global.db.data.characters = {};
    }
    const _0x9786da = global.db.data.users[_0x4a916a.sender];
    const _0xfeabc7 = Date.now();
    if (_0x9786da.lastVote && _0xfeabc7 < _0x9786da.lastVote) {
      const _0x49d2ce = Math.ceil((_0x9786da.lastVote - _0xfeabc7) / 0x3e8);
      const _0x1f251a = Math.floor(_0x49d2ce / 0xe10);
      const _0x46508d = Math.floor(_0x49d2ce % 0xe10 / 0x3c);
      const _0x593822 = _0x49d2ce % 0x3c;
      let _0x2238f9 = '';
      if (_0x1f251a > 0x0) {
        _0x2238f9 += _0x1f251a + " hora" + (_0x1f251a !== 0x1 ? 's' : '') + " ";
      }
      if (_0x46508d > 0x0) {
        _0x2238f9 += _0x46508d + " minuto" + (_0x46508d !== 0x1 ? 's' : '') + " ";
      }
      if (_0x593822 > 0x0 || _0x2238f9 === '') {
        _0x2238f9 += _0x593822 + " segundo" + (_0x593822 !== 0x1 ? 's' : '');
      }
      return _0x4a916a.reply("ꕥ Debes esperar *" + _0x2238f9.trim() + "* para usar *" + (_0x55557d + _0x3c61ac) + "* de nuevo.");
    }
    const _0x353330 = _0x4ef5ec.join(" ").trim();
    if (!_0x353330) {
      return _0x4a916a.reply("❀ Debes especificar un personaje para votarlo.");
    }
    const _0x6b7650 = await loadCharacters();
    const _0x38f9a2 = flattenCharacters(_0x6b7650);
    const _0x5a8259 = _0x38f9a2.find(_0x38b0af => _0x38b0af.name.toLowerCase() === _0x353330.toLowerCase());
    if (!_0x5a8259) {
      return _0x4a916a.reply("ꕥ Personaje no encontrado. Asegúrate de que el nombre esté correcto.");
    }
    if (!global.db.data.characters[_0x5a8259.id]) {
      global.db.data.characters[_0x5a8259.id] = {};
    }
    const _0x52358f = global.db.data.characters[_0x5a8259.id];
    if (typeof _0x52358f.value !== "number") {
      _0x52358f.value = Number(_0x5a8259.value || 0x0);
    }
    if (typeof _0x52358f.votes !== "number") {
      _0x52358f.votes = 0x0;
    }
    if (!_0x52358f.name) {
      _0x52358f.name = _0x5a8259.name;
    }
    if (_0x52358f.lastVotedAt && _0xfeabc7 < _0x52358f.lastVotedAt + 7200000) {
      const _0x2ba62d = _0x52358f.lastVotedAt + 7200000 - _0xfeabc7;
      const _0x5efd5f = Math.ceil(_0x2ba62d / 0x3e8);
      const _0x41c9cf = Math.floor(_0x5efd5f / 0xe10);
      const _0x547070 = Math.floor(_0x5efd5f % 0xe10 / 0x3c);
      const _0x4ca8b4 = _0x5efd5f % 0x3c;
      let _0x3d1597 = '';
      if (_0x41c9cf > 0x0) {
        _0x3d1597 += _0x41c9cf + " hora" + (_0x41c9cf !== 0x1 ? 's' : '') + " ";
      }
      if (_0x547070 > 0x0) {
        _0x3d1597 += _0x547070 + " minuto" + (_0x547070 !== 0x1 ? 's' : '') + " ";
      }
      if (_0x4ca8b4 > 0x0 || _0x3d1597 === '') {
        _0x3d1597 += _0x4ca8b4 + " segundo" + (_0x4ca8b4 !== 0x1 ? 's' : '');
      }
      return _0x4a916a.reply("ꕥ *" + _0x52358f.name + "* ha sido votada recientemente.\n> Debes esperar *" + _0x3d1597.trim() + "* para votarla de nuevo.");
    }
    if (!_0x52358f.dailyIncrement) {
      _0x52358f.dailyIncrement = {};
    }
    const _0x3e098f = new Date().toISOString().slice(0x0, 0xa);
    const _0x54e976 = _0x52358f.dailyIncrement[_0x3e098f] || 0x0;
    if (_0x54e976 >= 0x384) {
      return _0x4a916a.reply("ꕥ El personaje *" + _0x52358f.name + "* ya tiene el valor máximo.");
    }
    const _0x25be4a = Math.min(0x384 - _0x54e976, Math.floor(Math.random() * 0xc9) + 0x32);
    _0x52358f.value += _0x25be4a;
    _0x52358f.votes += 0x1;
    _0x52358f.lastVotedAt = _0xfeabc7;
    _0x52358f.dailyIncrement[_0x3e098f] = _0x54e976 + _0x25be4a;
    _0x9786da.lastVote = _0xfeabc7 + 7200000;
    const _0x1db30a = getSeriesNameByCharacter(_0x6b7650, _0x5a8259.id);
    await _0x4e2332.reply(_0x4a916a.chat, "❀ Votaste por *" + _0x52358f.name + "* (*" + _0x1db30a + "*)\n> Su nuevo valor es *" + _0x52358f.value.toLocaleString() + '*', _0x4a916a);
  } catch (_0x9c8497) {
    await _0x4e2332.reply(_0x4a916a.chat, "⚠︎ Se ha producido un problema.\n> Usa *" + _0x55557d + "report* para informarlo.\n\n" + _0x9c8497.message, _0x4a916a);
  }
};
handler.help = ["vote"];
handler.tags = ["gacha"];
handler.command = ["vote", "votar"];
handler.group = true;
export default handler;
