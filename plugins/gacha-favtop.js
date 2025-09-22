import { promises as _0x4b3f35 } from 'fs';
async function loadCharacters() {
  const _0x241e60 = await _0x4b3f35.readFile("./lib/characters.json", "utf-8");
  return JSON.parse(_0x241e60);
}
function flattenCharacters(_0x207baf) {
  return Object.values(_0x207baf).flatMap(_0x51e118 => Array.isArray(_0x51e118.characters) ? _0x51e118.characters : []);
}
const verifi = async () => {
  try {
    const _0x41fcc3 = await _0x4b3f35.readFile("./package.json", "utf-8");
    const _0x283bf9 = JSON.parse(_0x41fcc3);
    return _0x283bf9.repository?.['url'] === 'git+https://github.com/meado-learner/Michi-WaMD.git';
  } catch {
    return false;
  }
};
const handler = async (_0x1b0bd6, {
  conn: _0x591214,
  args: _0x35bc85,
  usedPrefix: _0x216e50,
  command: _0x79ff7d
}) => {
  if (!(await verifi())) {
    return _0x591214.reply(_0x1b0bd6.chat, "❀ El comando *<" + _0x79ff7d + ">* solo está disponible para Michi.", _0x1b0bd6);
  }
  if (!global.db.data.chats?.[_0x1b0bd6.chat]?.["gacha"] && _0x1b0bd6.isGroup) {
    return _0x1b0bd6.reply("ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *" + _0x216e50 + "gacha on*");
  }
  if (!global.db.data.characters) {
    global.db.data.characters = {};
  }
  if (!global.db.data.users) {
    global.db.data.users = {};
  }
  try {
    const _0x5b80ff = await loadCharacters();
    const _0x560364 = flattenCharacters(_0x5b80ff);
    const _0x2890fb = global.db.data.users[_0x1b0bd6.sender];
    if (!Array.isArray(_0x2890fb.characters)) {
      _0x2890fb.characters = [];
    }
    switch (_0x79ff7d) {
      case "setfav":
      case "wfav":
        {
          if (!_0x35bc85.length) {
            return _0x1b0bd6.reply("❀ Debes especificar un personaje.\n> Ejemplo » *" + (_0x216e50 + _0x79ff7d) + " Yuki Suou*");
          }
          const _0x1f28b2 = _0x35bc85.join(" ").toLowerCase().trim();
          const _0x3bf66c = _0x560364.find(_0x5d0d6f => _0x5d0d6f.name.toLowerCase() === _0x1f28b2);
          if (!_0x3bf66c) {
            return _0x1b0bd6.reply("ꕥ No se encontró el personaje *" + _0x1f28b2 + '*.');
          }
          if (!_0x2890fb.characters.includes(_0x3bf66c.id)) {
            return _0x1b0bd6.reply("ꕥ El personaje *" + _0x3bf66c.name + "* no está reclamado por ti.");
          }
          const _0x43d5db = _0x2890fb.favorite;
          _0x2890fb.favorite = _0x3bf66c.id;
          if (_0x43d5db && _0x43d5db !== _0x3bf66c.id) {
            const _0x22faf0 = global.db.data.characters?.[_0x43d5db];
            const _0x5d6856 = typeof _0x22faf0?.["name"] === 'string' ? _0x22faf0.name : "personaje anterior";
            return _0x1b0bd6.reply("❀ Se ha reemplazado tu favorito *" + _0x5d6856 + "* por *" + _0x3bf66c.name + '*!');
          }
          return _0x1b0bd6.reply("❀ Ahora *" + _0x3bf66c.name + "* es tu personaje favorito!");
          break;
        }
      case "favtop":
      case "favoritetop":
      case "favboard":
        {
          const _0x16a4bf = {};
          for (const [, _0x1bd950] of Object.entries(global.db.data.users)) {
            const _0x484f2e = _0x1bd950.favorite;
            if (_0x484f2e) {
              _0x16a4bf[_0x484f2e] = (_0x16a4bf[_0x484f2e] || 0x0) + 0x1;
            }
          }
          const _0x1ebce2 = _0x560364.map(_0x303a6c => ({
            'name': _0x303a6c.name,
            'favorites': _0x16a4bf[_0x303a6c.id] || 0x0
          })).filter(_0x29b80f => _0x29b80f.favorites > 0x0);
          const _0x536455 = parseInt(_0x35bc85[0x0]) || 0x1;
          const _0x3adfc0 = Math.max(0x1, Math.ceil(_0x1ebce2.length / 0xa));
          if (_0x536455 < 0x1 || _0x536455 > _0x3adfc0) {
            return _0x1b0bd6.reply("ꕥ Página no válida. Hay un total de *" + _0x3adfc0 + "* páginas.");
          }
          const _0x2e99ac = _0x1ebce2.sort((_0x219111, _0x22dfb4) => _0x22dfb4.favorites - _0x219111.favorites);
          const _0x44c988 = _0x2e99ac.slice((_0x536455 - 0x1) * 0xa, _0x536455 * 0xa);
          let _0x143693 = "✰ Top de personajes favoritos:\n\n";
          _0x44c988.forEach((_0x5dbf15, _0x103516) => {
            _0x143693 += '#' + ((_0x536455 - 0x1) * 0xa + _0x103516 + 0x1) + " » *" + _0x5dbf15.name + "*\n";
            _0x143693 += "   ♡ " + _0x5dbf15.favorites + " favorito" + (_0x5dbf15.favorites !== 0x1 ? 's' : '') + ".\n";
          });
          _0x143693 += "\n> Página " + _0x536455 + " de " + _0x3adfc0;
          await _0x591214.reply(_0x1b0bd6.chat, _0x143693.trim(), _0x1b0bd6);
          break;
        }
      case "deletefav":
      case "delfav":
        {
          if (!_0x2890fb.favorite) {
            return _0x1b0bd6.reply("❀ No tienes ningún personaje marcado como favorito.");
          }
          const _0x28e31f = _0x2890fb.favorite;
          const _0xe5ae0f = global.db.data.characters?.[_0x28e31f] || {};
          let _0x47a5ab = typeof _0xe5ae0f.name === "string" ? _0xe5ae0f.name : null;
          if (!_0x47a5ab) {
            const _0x43990d = _0x560364.find(_0xc28d96 => _0xc28d96.id === _0x28e31f);
            _0x47a5ab = _0x43990d?.["name"] || "personaje desconocido";
          }
          delete _0x2890fb.favorite;
          _0x1b0bd6.reply("✎ *" + _0x47a5ab + "* ha dejado de ser tu personaje favorito.");
          break;
        }
    }
  } catch (_0x242d4e) {
    await _0x591214.reply(_0x1b0bd6.chat, "⚠︎ Se ha producido un problema.\n> Usa *" + _0x216e50 + "report* para informarlo.\n\n" + _0x242d4e.message, _0x1b0bd6);
  }
};
handler.help = ["setfav", "favtop", "delfav"];
handler.tags = ["gacha"];
handler.command = ["setfav", 'wfav', "favtop", "favoritetop", 'favboard', "deletefav", "delfav"];
handler.group = true;
export default handler;
