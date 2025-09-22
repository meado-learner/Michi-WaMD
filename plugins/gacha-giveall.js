import { promises as _0x157ffe } from 'fs';
async function load() {
  const _0x470dee = await _0x157ffe.readFile('./lib/characters.json', 'utf-8');
  return JSON.parse(_0x470dee);
}
function get(_0x2aa386) {
  return Object.values(_0x2aa386).flatMap(_0x4eb119 => Array.isArray(_0x4eb119.characters) ? _0x4eb119.characters : []);
}
let pending = {};
const verifi = async () => {
  try {
    const _0x8ce889 = await _0x157ffe.readFile("./package.json", "utf-8");
    const _0x57bf4e = JSON.parse(_0x8ce889);
    return _0x57bf4e.repository?.["url"] === "git+https://github.com/meado-learner/Michi-WaMD.git";
  } catch {
    return false;
  }
};
let handler = async (_0x45a781, {
  conn: _0x5860b1,
  usedPrefix: _0x2619ab
}) => {
  if (!(await verifi())) {
    return _0x5860b1.reply(_0x45a781.chat, "❀ El comando *<" + command + ">* solo está disponible para Michi", _0x45a781);
  }
  if (!global.db.data.chats?.[_0x45a781.chat]?.["gacha"] && _0x45a781.isGroup) {
    return _0x45a781.reply("ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *" + _0x2619ab + "gacha on*");
  }
  try {
    const _0x41020e = global.db.data.users[_0x45a781.sender];
    if (!Array.isArray(_0x41020e.characters)) {
      _0x41020e.characters = [];
    }
    const _0x48a52a = await _0x45a781.mentionedJid;
    const _0x50ef6e = _0x48a52a[0x0] || _0x45a781.quoted && (await _0x45a781.quoted.sender);
    if (!_0x50ef6e || typeof _0x50ef6e !== "string" || !_0x50ef6e.includes('@')) {
      return _0x45a781.reply("❀ Debes mencionar a quien quieras regalarle tus personajes.");
    }
    const _0x2ae5f9 = global.db.data.users[_0x50ef6e];
    if (!_0x2ae5f9) {
      return _0x45a781.reply("ꕥ El usuario mencionado no está registrado.");
    }
    if (!Array.isArray(_0x2ae5f9.characters)) {
      _0x2ae5f9.characters = [];
    }
    const _0x3864ce = await load();
    const _0x1a8927 = get(_0x3864ce);
    const _0x72b3aa = _0x41020e.characters;
    const _0x515919 = _0x72b3aa.map(_0xa33fec => {
      const _0x151eb9 = global.db.data.characters?.[_0xa33fec] || {};
      const _0x15105f = _0x1a8927.find(_0x3f377b => _0x3f377b.id === _0xa33fec);
      const _0x5596a7 = typeof _0x151eb9.value === 'number' ? _0x151eb9.value : typeof _0x15105f?.['value'] === 'number' ? _0x15105f.value : 0x0;
      return {
        'id': _0xa33fec,
        'name': _0x151eb9.name || _0x15105f?.["name"] || "ID:" + _0xa33fec,
        'value': _0x5596a7
      };
    });
    if (_0x515919.length === 0x0) {
      return _0x45a781.reply("ꕥ No tienes personajes para regalar.");
    }
    const _0x305027 = _0x515919.reduce((_0x2d32e0, _0x259ef1) => _0x2d32e0 + _0x259ef1.value, 0x0);
    let _0x2243a8 = await (async () => global.db.data.users[_0x50ef6e].name.trim() || (await _0x5860b1.getName(_0x50ef6e).then(_0x3240e9 => typeof _0x3240e9 === "string" && _0x3240e9.trim() ? _0x3240e9 : _0x50ef6e.split('@')[0x0])["catch"](() => _0x50ef6e.split('@')[0x0])))();
    let _0x4e2dac = await (async () => global.db.data.users[_0x45a781.sender].name.trim() || (await _0x5860b1.getName(_0x45a781.sender).then(_0x2e7d6a => typeof _0x2e7d6a === "string" && _0x2e7d6a.trim() ? _0x2e7d6a : _0x45a781.sender.split('@')[0x0])["catch"](() => _0x45a781.sender.split('@')[0x0])))();
    pending[_0x45a781.sender] = {
      'sender': _0x45a781.sender,
      'to': _0x50ef6e,
      'value': _0x305027,
      'count': _0x515919.length,
      'ids': _0x515919.map(_0xc761b8 => _0xc761b8.id),
      'chat': _0x45a781.chat,
      'timeout': setTimeout(() => delete pending[_0x45a781.sender], 0xea60)
    };
    await _0x5860b1.reply(_0x45a781.chat, "「✿」 *" + _0x4e2dac + "*, ¿confirmas regalar todo tu harem a *" + _0x2243a8 + "*?\n\n❏ Personajes a transferir: *" + _0x515919.length + "*\n❏ Valor total: *" + _0x305027.toLocaleString() + "*\n\n✐ Para confirmar responde a este mensaje con \"Aceptar\".\n> Esta acción no se puede deshacer, revisa bien los datos antes de confirmar.", _0x45a781, {
      'mentions': [_0x50ef6e]
    });
  } catch (_0x383c8f) {
    await _0x5860b1.reply(_0x45a781.chat, "⚠︎ Se ha producido un problema.\n> Usa *" + _0x2619ab + "report* para informarlo.\n\n" + _0x383c8f.message, _0x45a781);
  }
};
handler.before = async (_0x23079a, {
  conn: _0x233ef8
}) => {
  try {
    const _0x582ff5 = pending[_0x23079a.sender];
    if (!_0x582ff5 || _0x23079a.text?.["trim"]()["toLowerCase"]() !== "aceptar") {
      return;
    }
    if (_0x23079a.sender !== _0x582ff5.sender || _0x582ff5.chat !== _0x23079a.chat) {
      return;
    }
    if (typeof _0x582ff5.to !== "string" || !_0x582ff5.to.includes('@')) {
      return;
    }
    const _0x32448b = global.db.data.users[_0x23079a.sender];
    const _0x30cca9 = global.db.data.users[_0x582ff5.to];
    for (const _0x201ce4 of _0x582ff5.ids) {
      const _0x1c823a = global.db.data.characters?.[_0x201ce4];
      if (!_0x1c823a || _0x1c823a.user !== _0x23079a.sender) {
        continue;
      }
      _0x1c823a.user = _0x582ff5.to;
      if (!_0x30cca9.characters.includes(_0x201ce4)) {
        _0x30cca9.characters.push(_0x201ce4);
      }
      _0x32448b.characters = _0x32448b.characters.filter(_0x5e23f8 => _0x5e23f8 !== _0x201ce4);
      if (_0x32448b.sales?.[_0x201ce4]?.["user"] === _0x23079a.sender) {
        delete _0x32448b.sales[_0x201ce4];
      }
      if (_0x32448b.favorite === _0x201ce4) {
        delete _0x32448b.favorite;
      }
      if (global.db.data.users[_0x23079a.sender]?.["favorite"] === _0x201ce4) {
        delete global.db.data.users[_0x23079a.sender].favorite;
      }
    }
    clearTimeout(_0x582ff5.timeout);
    delete pending[_0x23079a.sender];
    let _0x420883 = await (async () => global.db.data.users[_0x582ff5.to].name.trim() || (await _0x233ef8.getName(_0x582ff5.to).then(_0x419e49 => typeof _0x419e49 === "string" && _0x419e49.trim() ? _0x419e49 : _0x582ff5.to.split('@')[0x0])['catch'](() => _0x582ff5.to.split('@')[0x0])))();
    await _0x23079a.reply("「✿」 Has regalado con éxito todos tus personajes a *" + _0x420883 + "*!\n\n> ❏ Personajes regalados: *" + _0x582ff5.count + "*\n> ⴵ Valor total: *" + _0x582ff5.value.toLocaleString() + '*');
    return true;
  } catch (_0x128286) {
    await _0x233ef8.reply(_0x23079a.chat, "⚠︎ Se ha producido un problema.\n> Usa *" + usedPrefix + "report* para informarlo.\n\n" + _0x128286.message, _0x23079a);
  }
};
handler.help = ["giveallharem"];
handler.tags = ["gacha"];
handler.command = ['giveallharem'];
handler.group = true;
export default handler;
