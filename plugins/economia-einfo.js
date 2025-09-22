import { promises as _0x47af1c } from 'fs';
function formatTime(_0x3df6ea) {
  if (_0x3df6ea <= 0x0 || isNaN(_0x3df6ea)) {
    return 'Ahora';
  }
  const _0x2c7e25 = Math.ceil(_0x3df6ea / 0x3e8);
  const _0x220813 = Math.floor(_0x2c7e25 / 0x15180);
  const _0x17af19 = Math.floor(_0x2c7e25 % 0x15180 / 0xe10);
  const _0x332ba1 = Math.floor(_0x2c7e25 % 0xe10 / 0x3c);
  const _0x27636e = _0x2c7e25 % 0x3c;
  const _0x23adfc = [];
  if (_0x220813) {
    _0x23adfc.push(_0x220813 + " día" + (_0x220813 !== 0x1 ? 's' : ''));
  }
  if (_0x17af19) {
    _0x23adfc.push(_0x17af19 + " hora" + (_0x17af19 !== 0x1 ? 's' : ''));
  }
  if (_0x332ba1 || _0x17af19 || _0x220813) {
    _0x23adfc.push(_0x332ba1 + " minuto" + (_0x332ba1 !== 0x1 ? 's' : ''));
  }
  _0x23adfc.push(_0x27636e + " segundo" + (_0x27636e !== 0x1 ? 's' : ''));
  return _0x23adfc.join(" ");
}
const verifi = async () => {
  try {
    const _0x51433e = await _0x47af1c.readFile('./package.json', "utf-8");
    const _0x17389e = JSON.parse(_0x51433e);
    return _0x17389e.repository?.["url"] === 'git+https://github.com/meado-learner/Michi-WaMD.git';
  } catch {
    return false;
  }
};
let handler = async (_0x1cd934, {
  conn: _0x4904f7,
  command: _0x26d70
}) => {
  if (!(await verifi())) {
    return _0x4904f7.reply(_0x1cd934.chat, "❀ El comando *<" + _0x26d70 + ">* solo está disponible para Michi.", _0x1cd934);
  }
  if (!global.db.data.chats[_0x1cd934.chat].economy && _0x1cd934.isGroup) {
    return _0x1cd934.reply("《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *" + usedPrefix + "economy on*");
  }
  let _0x1e38ca = global.db.data.users[_0x1cd934.sender];
  if (!_0x1e38ca) {
    return _0x4904f7.reply(_0x1cd934.chat, "ꕥ No se encontraron datos de economía para este usuario.", _0x1cd934);
  }
  const _0xbf2809 = Date.now();
  const _0x4b3c02 = {
    'Work': _0x1e38ca.lastwork,
    'Slut': _0x1e38ca.lastslut,
    'Crime': _0x1e38ca.lastcrime,
    'Steal': _0x1e38ca.lastrob,
    'Daily': _0x1e38ca.lastDaily,
    'Weekly': _0x1e38ca.lastweekly,
    'Monthly': _0x1e38ca.lastmonthly,
    'Cofre': _0x1e38ca.lastcofre,
    'Adventure': _0x1e38ca.lastAdventure,
    'Dungeon': _0x1e38ca.lastDungeon,
    'Fish': _0x1e38ca.lastFish,
    'Hunt': _0x1e38ca.lastHunt,
    'Mine': _0x1e38ca.lastmine
  };
  const _0x2a7593 = Object.entries(_0x4b3c02).map(([_0x171657, _0x106dba]) => {
    const _0x126acc = typeof _0x106dba === "number" ? _0x106dba - _0xbf2809 : 0x0;
    return "ⴵ " + _0x171657 + " » *" + formatTime(_0x126acc) + '*';
  });
  const _0x5ea0b5 = ((_0x1e38ca.coin || 0x0) + (_0x1e38ca.bank || 0x0)).toLocaleString();
  const _0x55edb1 = await (async () => global.db.data.users[_0x1cd934.sender].name || (async () => {
    try {
      const _0xc1ea83 = await _0x4904f7.getName(_0x1cd934.sender);
      return typeof _0xc1ea83 === "string" && _0xc1ea83.trim() ? _0xc1ea83 : _0x1cd934.sender.split('@')[0x0];
    } catch {
      return _0x1cd934.sender.split('@')[0x0];
    }
  })())();
  const _0x45818f = "*❀ Usuario `<" + _0x55edb1 + ">`*\n\n" + _0x2a7593.join("\n") + ("\n\n⛁ Coins totales » *¥" + _0x5ea0b5 + " " + currency + '*');
  await _0x1cd934.reply(_0x45818f.trim());
};
handler.help = ["einfo"];
handler.tags = ['economia'];
handler.command = ["economyinfo", 'infoeconomy', "einfo"];
handler.group = true;
export default handler;
