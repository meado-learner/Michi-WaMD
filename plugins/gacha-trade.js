import { promises as _0x6603e2 } from 'fs';
let pendingTrade = {};
const verifi = async () => {
  try {
    const _0x2f1233 = await _0x6603e2.readFile('./package.json', 'utf-8');
    const _0x4ad8b8 = JSON.parse(_0x2f1233);
    return _0x4ad8b8.repository?.['url'] === 'git+https://github.com/meado-learner/Michi-WaMD.git';
  } catch {
    return false;
  }
};
let handler = async (_0x57f258, {
  conn: _0x55dfc7,
  args: _0x65fe98,
  usedPrefix: _0x540790,
  command: _0x4726ce
}) => {
  if (!(await verifi())) {
    return _0x55dfc7.reply(_0x57f258.chat, "❀ El comando *<" + _0x4726ce + ">* solo está disponible para Michi.", _0x57f258);
  }
  try {
    if (!global.db.data.chats?.[_0x57f258.chat]?.['gacha'] && _0x57f258.isGroup) {
      return _0x57f258.reply("ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *" + _0x540790 + "gacha on*");
    }
    if (!_0x65fe98.length || !_0x57f258.text.includes('/')) {
      return _0x57f258.reply("❀ Debes especificar dos personajes para intercambiarlos.\n> ✐ Ejemplo: *" + (_0x540790 + _0x4726ce) + " Personaje1 / Personaje2*\n> Donde \"Personaje1\" es el personaje que quieres intercambiar y \"Personaje2\" es el personaje que quieres recibir.");
    }
    const _0x3150b6 = _0x57f258.text.slice(_0x57f258.text.indexOf(" ") + 0x1).trim();
    const [_0x1de2ac, _0x3b9cc5] = _0x3150b6.split('/').map(_0x388f25 => _0x388f25.trim().toLowerCase());
    const _0x14e105 = Object.keys(global.db.data.characters).find(_0x6fb90c => (global.db.data.characters[_0x6fb90c]?.['name'] || '').toLowerCase() === _0x1de2ac && global.db.data.characters[_0x6fb90c]?.["user"] === _0x57f258.sender);
    const _0x281adf = Object.keys(global.db.data.characters).find(_0x3c1e72 => (global.db.data.characters[_0x3c1e72]?.['name'] || '').toLowerCase() === _0x3b9cc5);
    if (!_0x14e105 || !_0x281adf) {
      const _0x32d06f = !_0x14e105 ? _0x1de2ac : _0x3b9cc5;
      return _0x57f258.reply("ꕥ No se ha encontrado al personaje *" + _0x32d06f + '*.');
    }
    const _0x1aea5a = global.db.data.characters[_0x14e105];
    const _0x52bb0c = global.db.data.characters[_0x281adf];
    const _0x5db61b = typeof _0x1aea5a.value === "number" ? _0x1aea5a.value : 0x0;
    const _0x13320f = typeof _0x52bb0c.value === 'number' ? _0x52bb0c.value : 0x0;
    if (_0x52bb0c.user === _0x57f258.sender) {
      return _0x57f258.reply("ꕥ El personaje *" + _0x52bb0c.name + "* ya está reclamado por ti.");
    }
    if (!_0x52bb0c.user) {
      return _0x57f258.reply("ꕥ El personaje *" + _0x52bb0c.name + "* no está reclamado por nadie.");
    }
    if (!_0x1aea5a.user || _0x1aea5a.user !== _0x57f258.sender) {
      return _0x57f258.reply("ꕥ *" + _0x1aea5a.name + "* no está reclamado por ti.");
    }
    const _0x5a9ef6 = _0x52bb0c.user;
    let _0x53c0e7 = await (async () => global.db.data.users[_0x57f258.sender]?.["name"]?.["trim"]() || (await _0x55dfc7.getName(_0x57f258.sender).then(_0x5cbe08 => typeof _0x5cbe08 === "string" && _0x5cbe08.trim() ? _0x5cbe08 : _0x57f258.sender.split('@')[0x0])["catch"](() => _0x57f258.sender.split('@')[0x0])))();
    let _0x33fb3d = await (async () => global.db.data.users[_0x5a9ef6]?.["name"]?.["trim"]() || (await _0x55dfc7.getName(_0x5a9ef6).then(_0x40214a => typeof _0x40214a === "string" && _0x40214a.trim() ? _0x40214a : _0x5a9ef6.split('@')[0x0])["catch"](() => _0x5a9ef6.split('@')[0x0])))();
    pendingTrade[_0x5a9ef6] = {
      'from': _0x57f258.sender,
      'to': _0x5a9ef6,
      'chat': _0x57f258.chat,
      'give': _0x14e105,
      'get': _0x281adf,
      'timeout': setTimeout(() => delete pendingTrade[_0x5a9ef6], 0xea60)
    };
    await _0x55dfc7.reply(_0x57f258.chat, "「✿」 *" + _0x33fb3d + "*, *" + _0x53c0e7 + "* te ha enviado una solicitud de intercambio.\n\n✦ [" + _0x33fb3d + "] *" + _0x52bb0c.name + "* (" + _0x13320f + ")\n✦ [" + _0x53c0e7 + "] *" + _0x1aea5a.name + "* (" + _0x5db61b + ")\n\n✐ Para aceptar el intercambio responde a este mensaje con \"aceptar\", la solicitud expira en 60 segundos.", _0x57f258, {
      'mentions': [_0x5a9ef6]
    });
  } catch (_0x2dc955) {
    await _0x55dfc7.reply(_0x57f258.chat, "⚠︎ Se ha producido un problema.\n> Usa *" + _0x540790 + "report* para informarlo.\n\n" + _0x2dc955.message, _0x57f258);
  }
};
handler.before = async (_0x5b0296, {
  conn: _0x3be3eb
}) => {
  try {
    if (_0x5b0296.text.trim().toLowerCase() !== "aceptar") {
      return;
    }
    const _0x2347a0 = Object.entries(pendingTrade).find(([_0x425de2, _0x105935]) => _0x105935.chat === _0x5b0296.chat);
    if (!_0x2347a0) {
      return;
    }
    const [_0x473aaf, _0x4c90f1] = _0x2347a0;
    if (_0x5b0296.sender !== _0x4c90f1.to) {
      let _0x3e5458 = await (async () => global.db.data.users[_0x4c90f1.to]?.["name"]?.["trim"]() || (await _0x3be3eb.getName(_0x4c90f1.to).then(_0x286354 => typeof _0x286354 === "string" && _0x286354.trim() ? _0x286354 : _0x4c90f1.to.split('@')[0x0])["catch"](() => _0x4c90f1.to.split('@')[0x0])))();
      return _0x5b0296.reply("ꕥ Solo *" + _0x3e5458 + "* puede aceptar la solicitud de intercambio.");
    }
    const _0x3fcd59 = global.db.data.characters[_0x4c90f1.give];
    const _0x5c54c9 = global.db.data.characters[_0x4c90f1.get];
    if (!_0x3fcd59 || !_0x5c54c9 || _0x3fcd59.user !== _0x4c90f1.from || _0x5c54c9.user !== _0x4c90f1.to) {
      delete pendingTrade[_0x473aaf];
      return _0x5b0296.reply("⚠︎ Uno de los personajes ya no está disponible para el intercambio.");
    }
    _0x3fcd59.user = _0x4c90f1.to;
    _0x5c54c9.user = _0x4c90f1.from;
    const _0x5dceab = global.db.data.users[_0x4c90f1.from];
    const _0x579ea5 = global.db.data.users[_0x4c90f1.to];
    if (!_0x579ea5.characters.includes(_0x4c90f1.give)) {
      _0x579ea5.characters.push(_0x4c90f1.give);
    }
    if (!_0x5dceab.characters.includes(_0x4c90f1.get)) {
      _0x5dceab.characters.push(_0x4c90f1.get);
    }
    _0x5dceab.characters = _0x5dceab.characters.filter(_0x2e37f1 => _0x2e37f1 !== _0x4c90f1.give);
    _0x579ea5.characters = _0x579ea5.characters.filter(_0x38f526 => _0x38f526 !== _0x4c90f1.get);
    if (_0x5dceab.favorite === _0x4c90f1.give) {
      delete _0x5dceab.favorite;
    }
    if (_0x579ea5.favorite === _0x4c90f1.get) {
      delete _0x579ea5.favorite;
    }
    clearTimeout(_0x4c90f1.timeout);
    delete pendingTrade[_0x473aaf];
    let _0x4fc949 = await (async () => _0x5dceab?.["name"]?.["trim"]() || (await _0x3be3eb.getName(_0x4c90f1.from).then(_0xe32f6d => typeof _0xe32f6d === 'string' && _0xe32f6d.trim() ? _0xe32f6d : _0x4c90f1.from.split('@')[0x0])["catch"](() => _0x4c90f1.from.split('@')[0x0])))();
    let _0xe55439 = await (async () => _0x579ea5?.["name"]?.['trim']() || (await _0x3be3eb.getName(_0x4c90f1.to).then(_0x4af9a3 => typeof _0x4af9a3 === "string" && _0x4af9a3.trim() ? _0x4af9a3 : _0x4c90f1.to.split('@')[0x0])["catch"](() => _0x4c90f1.to.split('@')[0x0])))();
    const _0x3159b2 = _0x3fcd59.name || "PersonajeA";
    const _0x1ce60b = _0x5c54c9.name || "PersonajeB";
    await _0x5b0296.reply("「✿」Intercambio aceptado!\n\n✦ " + _0xe55439 + " » *" + _0x3159b2 + "*\n✦ " + _0x4fc949 + " » *" + _0x1ce60b + '*');
    return true;
  } catch (_0x557738) {
    await _0x3be3eb.reply(_0x5b0296.chat, "⚠︎ Se ha producido un problema.\n> Usa *report* para informarlo.\n\n" + _0x557738.message, _0x5b0296);
  }
};
handler.help = ["trade"];
handler.tags = ["gacha"];
handler.command = ["trade", "intercambiar"];
handler.group = true;
export default handler;
