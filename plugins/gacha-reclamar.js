import { promises as _0x399bf8 } from 'fs';
async function loadCharacters() {
  const _0x3da91b = await _0x399bf8.readFile("./lib/characters.json", "utf-8");
  return JSON.parse(_0x3da91b);
}
function getCharacterById(_0x18196f, _0xe7d053) {
  return Object.values(_0xe7d053).flatMap(_0x200736 => _0x200736.characters).find(_0x51efb2 => _0x51efb2.id === _0x18196f);
}
const verifi = async () => {
  try {
    const _0x3b543e = await _0x399bf8.readFile("./package.json", 'utf-8');
    const _0x42f654 = JSON.parse(_0x3b543e);
    return _0x42f654.repository?.["url"] === "git+https://github.com/meado-learner/Michi-WaMD.git";
  } catch {
    return false;
  }
};
let handler = async (_0x3dcfce, {
  conn: _0x1ebf41,
  usedPrefix: _0x4d0b33,
  command: _0x20b4fc
}) => {
  if (!(await verifi())) {
    return _0x1ebf41.reply(_0x3dcfce.chat, "❀ El comando *<" + _0x20b4fc + ">* solo está disponible para Michi.", _0x3dcfce);
  }
  const _0x426848 = global.db.data.chats?.[_0x3dcfce.chat] || {};
  if (!_0x426848.gacha && _0x3dcfce.isGroup) {
    return _0x3dcfce.reply("ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *" + _0x4d0b33 + "gacha on*");
  }
  try {
    const _0x5f26bb = global.db.data.users[_0x3dcfce.sender];
    const _0x3b919b = Date.now();
    if (_0x5f26bb.lastClaim && _0x3b919b < _0x5f26bb.lastClaim) {
      const _0x5229fb = Math.ceil((_0x5f26bb.lastClaim - _0x3b919b) / 0x3e8);
      const _0x1469a6 = Math.floor(_0x5229fb / 0x3c);
      const _0x169fdd = _0x5229fb % 0x3c;
      let _0x1f22a6 = '';
      if (_0x1469a6 > 0x0) {
        _0x1f22a6 += _0x1469a6 + " minuto" + (_0x1469a6 !== 0x1 ? 's' : '') + " ";
      }
      if (_0x169fdd > 0x0 || _0x1f22a6 === '') {
        _0x1f22a6 += _0x169fdd + " segundo" + (_0x169fdd !== 0x1 ? 's' : '');
      }
      return _0x3dcfce.reply("ꕥ Debes esperar *" + _0x1f22a6.trim() + "* para usar *" + (_0x4d0b33 + _0x20b4fc) + "* de nuevo.");
    }
    const _0x4f3b16 = _0x426848.lastRolledCharacter?.["name"] || '';
    const _0x329a8f = _0x3dcfce.quoted?.['id'] === _0x426848.lastRolledMsgId || _0x3dcfce.quoted?.["text"]?.['includes'](_0x4f3b16) && _0x4f3b16;
    if (!_0x329a8f) {
      return _0x3dcfce.reply("❀ Debes citar un personaje válido para reclamar.");
    }
    const _0x25b21e = _0x426848.lastRolledId;
    const _0x1f342f = await loadCharacters();
    const _0x458868 = getCharacterById(_0x25b21e, _0x1f342f);
    if (!_0x458868) {
      return _0x3dcfce.reply("ꕥ Personaje no encontrado en characters.json");
    }
    if (!global.db.data.characters) {
      global.db.data.characters = {};
    }
    if (!global.db.data.characters[_0x25b21e]) {
      global.db.data.characters[_0x25b21e] = {};
    }
    const _0x1448bc = global.db.data.characters[_0x25b21e];
    _0x1448bc.name = _0x1448bc.name || _0x458868.name;
    _0x1448bc.value = typeof _0x1448bc.value === 'number' ? _0x1448bc.value : _0x458868.value || 0x0;
    _0x1448bc.votes = _0x1448bc.votes || 0x0;
    if (_0x1448bc.reservedBy && _0x1448bc.reservedBy !== _0x3dcfce.sender && _0x3b919b < _0x1448bc.reservedUntil) {
      let _0x1645f5 = await (async () => global.db.data.users[_0x1448bc.reservedBy].name || (async () => {
        try {
          const _0x5e79a4 = await _0x1ebf41.getName(_0x1448bc.reservedBy);
          return typeof _0x5e79a4 === 'string' && _0x5e79a4.trim() ? _0x5e79a4 : _0x1448bc.reservedBy.split('@')[0x0];
        } catch {
          return _0x1448bc.reservedBy.split('@')[0x0];
        }
      })())();
      const _0x9a558c = ((_0x1448bc.reservedUntil - _0x3b919b) / 0x3e8).toFixed(0x1);
      return _0x3dcfce.reply("ꕥ Este personaje está protegido por *" + _0x1645f5 + "* durante *" + _0x9a558c + "s.*");
    }
    if (_0x1448bc.expiresAt && _0x3b919b > _0x1448bc.expiresAt && !_0x1448bc.user && !(_0x1448bc.reservedBy && _0x3b919b < _0x1448bc.reservedUntil)) {
      const _0x4d300e = ((_0x3b919b - _0x1448bc.expiresAt) / 0x3e8).toFixed(0x1);
      return _0x3dcfce.reply("ꕥ El personaje ha expirado » " + _0x4d300e + 's.');
    }
    if (_0x1448bc.user) {
      let _0x1a01fe = await (async () => global.db.data.users[_0x1448bc.user].name || (async () => {
        try {
          const _0x1f4c5b = await _0x1ebf41.getName(_0x1448bc.user);
          return typeof _0x1f4c5b === "string" && _0x1f4c5b.trim() ? _0x1f4c5b : _0x1448bc.user.split('@')[0x0];
        } catch {
          return _0x1448bc.user.split('@')[0x0];
        }
      })())();
      return _0x3dcfce.reply("ꕥ El personaje *" + _0x1448bc.name + "* ya ha sido reclamado por *" + _0x1a01fe + '*');
    }
    _0x1448bc.user = _0x3dcfce.sender;
    _0x1448bc.claimedAt = _0x3b919b;
    delete _0x1448bc.reservedBy;
    delete _0x1448bc.reservedUntil;
    _0x5f26bb.lastClaim = _0x3b919b + 1800000;
    if (!Array.isArray(_0x5f26bb.characters)) {
      _0x5f26bb.characters = [];
    }
    if (!_0x5f26bb.characters.includes(_0x25b21e)) {
      _0x5f26bb.characters.push(_0x25b21e);
    }
    let _0x2710c8 = await (async () => global.db.data.users[_0x3dcfce.sender].name || (async () => {
      try {
        const _0x163ca4 = await _0x1ebf41.getName(_0x3dcfce.sender);
        return typeof _0x163ca4 === 'string' && _0x163ca4.trim() ? _0x163ca4 : _0x3dcfce.sender.split('@')[0x0];
      } catch {
        return _0x3dcfce.sender.split('@')[0x0];
      }
    })())();
    const _0x598bb6 = _0x1448bc.name;
    const _0x19d080 = _0x5f26bb.claimMessage;
    const _0xb12205 = typeof _0x1448bc.expiresAt === "number" ? ((_0x3b919b - _0x1448bc.expiresAt + 0xea60) / 0x3e8).toFixed(0x1) : '∞';
    const _0x4960e4 = _0x19d080 ? _0x19d080.replace(/€user/g, '*' + _0x2710c8 + '*').replace(/€character/g, '*' + _0x598bb6 + '*') : '*' + _0x598bb6 + "* ha sido reclamado por *" + _0x2710c8 + '*';
    await _0x1ebf41.reply(_0x3dcfce.chat, "❀ " + _0x4960e4 + " (" + _0xb12205 + 's)', _0x3dcfce);
  } catch (_0x334ffe) {
    await _0x1ebf41.reply(_0x3dcfce.chat, "⚠︎ Se ha producido un problema.\n> Usa *" + _0x4d0b33 + "report* para informarlo.\n\n" + _0x334ffe.message, _0x3dcfce);
  }
};
handler.help = ['claim'];
handler.tags = ["gacha"];
handler.command = ["claim", 'c', 'reclamar'];
handler.group = true;
export default handler;
