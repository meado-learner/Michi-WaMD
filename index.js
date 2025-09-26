process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import './plugins/_fakes.js'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn, execSync } from 'child_process'
import lodash from 'lodash'
import { MichiJadiBot } from './plugins/subs-conexion.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import boxen from 'boxen'
import pino from 'pino'
import Pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import store from './lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

console.log(chalk.magentaBright('\n🌾 Iniciando...'))
console.log(chalk.yellow('MichiWA'))
console.log(chalk.red('Made with Ado'))
protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
return path.dirname(global.__filename(pathURL, true))
}; global.__require = function require(dir = import.meta.url) {
return createRequire(dir)
}

global.timestamp = {start: new Date}
const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#!./]')

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('database.json'))
global.DATABASE = global.db; 
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) {
return new Promise((resolve) => setInterval(async function() {
if (!global.db.READ) {
clearInterval(this);
resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
}}, 1 * 1000))
}
if (global.db.data !== null) return
global.db.READ = true
await global.db.read().catch(console.error)
global.db.READ = null
global.db.data = {
users: {},
chats: {},
stats: {},
msgs: {},
sticker: {},
settings: {},
...(global.db.data || {}),
}
global.db.chain = chain(global.db.data)
}
loadDatabase()

const {state, saveState, saveCreds} = await useMultiFileAuthState(global.sessions)
const msgRetryCounterMap = new Map()
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const colors = chalk.bold.white
const qrOption = chalk.blueBright
const textOption = chalk.cyan
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))
let opcion
if (methodCodeQR) {
opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${sessions}/creds.json`)) {
do {
opcion = await question(colors("Seleccione una opción:\n") + qrOption("1. Con código QR\n") + textOption("2. Con código de texto de 8 dígitos\n--> "))
if (!/^[1-2]$/.test(opcion)) {
console.log(chalk.bold.redBright(`No se permiten numeros que no sean 1 o 2, tampoco letras o símbolos especiales.`))
}} while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${sessions}/creds.json`))
} 

console.info = () => { }

const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
mobile: MethodMobile, 
browser: ["MacOs", "Safari"],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: false, 
generateHighQualityLinkPreview: true, 
syncFullHistory: false,
getMessage: async (key) => {
try {
let jid = jidNormalizedUser(key.remoteJid);
let msg = await store.loadMessage(jid, key.id)
return msg?.message || ""
} catch (error) {
return ""
}},
msgRetryCounterCache: msgRetryCounterCache || new Map(),
userDevicesCache: userDevicesCache || new Map(),
defaultQueryTimeoutMs: undefined,
cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
version: version, 
keepAliveIntervalMs: 55000, 
maxIdleTimeMs: 60000, 
}

global.conn = makeWASocket(connectionOptions)
if (!fs.existsSync(`./${sessions}/creds.json`)) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (!conn.authState.creds.registered) {
let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`[ 🍂 ]  Por favor, Ingrese el número de WhatsApp.\n${chalk.bold.magentaBright('---> ')}`)))
phoneNumber = phoneNumber.replace(/\D/g,'')
if (!phoneNumber.startsWith('+')) {
phoneNumber = `+${phoneNumber}`
}} while (!await isValidPhoneNumber(phoneNumber))
rl.close()
addNumber = phoneNumber.replace(/\D/g, '')
setTimeout(async () => {
let codeBot = await conn.requestPairingCode(addNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
console.log(chalk.bold.white(chalk.bgMagenta(`[ ✿ ]  Código:`)), chalk.bold.white(chalk.white(codeBot)))
}, 3000)
}}}}
conn.isInit = false
conn.well = false
conn.logger.info(`[ 🍐 ]  H E C H O\n`)
if (!opts['test']) {
if (global.db) setInterval(async () => {
if (global.db.data) await global.db.write()
if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp', `${jadi}`], tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])))
}, 30 * 1000)
}

async function resolveLidToRealJid(lidJid, groupJid, maxRetries = 3, retryDelay = 1000) {
if (!lidJid?.endsWith("@lid") || !groupJid?.endsWith("@g.us")) return lidJid?.includes("@") ? lidJid : `${lidJid}@s.whatsapp.net`
const cached = lidCache.get(lidJid);
if (cached) return cached;
const lidToFind = lidJid.split("@")[0];
let attempts = 0
while (attempts < maxRetries) {
try {
const metadata = await conn.groupMetadata(groupJid)
if (!metadata?.participants) throw new Error("No se obtuvieron participantes")
for (const participant of metadata.participants) {
try {
if (!participant?.jid) continue
const contactDetails = await conn.onWhatsApp(participant.jid)
if (!contactDetails?.[0]?.lid) continue
const possibleLid = contactDetails[0].lid.split("@")[0]
if (possibleLid === lidToFind) {
lidCache.set(lidJid, participant.jid)
return participant.jid
}} catch (e) {
continue
}}
lidCache.set(lidJid, lidJid)
return lidJid
} catch (e) {
attempts++
if (attempts >= maxRetries) {
lidCache.set(lidJid, lidJid)
return lidJid
}
await new Promise(resolve => setTimeout(resolve, retryDelay))
}}
return lidJid
}

async function extractAndProcessLids(text, groupJid) {
if (!text) return text
const lidMatches = text.match(/\d+@lid/g) || []
let processedText = text
for (const lid of lidMatches) {
try {
const realJid = await resolveLidToRealJid(lid, groupJid);
processedText = processedText.replace(new RegExp(lid, 'g'), realJid)
} catch (e) {
console.error(`Error procesando LID ${lid}:`, e)
}}
return processedText
}

async function processLidsInMessage(message, groupJid) {
if (!message || !message.key) return message
try {
const messageCopy = {
key: {...message.key},
message: message.message ? {...message.message} : undefined,
...(message.quoted && {quoted: {...message.quoted}}),
...(message.mentionedJid && {mentionedJid: [...message.mentionedJid]})
}
const remoteJid = messageCopy.key.remoteJid || groupJid
if (messageCopy.key?.participant?.endsWith('@lid')) { messageCopy.key.participant = await resolveLidToRealJid(messageCopy.key.participant, remoteJid) }
if (messageCopy.message?.extendedTextMessage?.contextInfo?.participant?.endsWith('@lid')) { messageCopy.message.extendedTextMessage.contextInfo.participant = await resolveLidToRealJid( messageCopy.message.extendedTextMessage.contextInfo.participant, remoteJid ) }
if (messageCopy.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
const mentionedJid = messageCopy.message.extendedTextMessage.contextInfo.mentionedJid
if (Array.isArray(mentionedJid)) {
for (let i = 0; i < mentionedJid.length; i++) {
if (mentionedJid[i]?.endsWith('@lid')) {
mentionedJid[i] = await resolveLidToRealJid(mentionedJid[i], remoteJid)
}}}}
if (messageCopy.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.contextInfo?.mentionedJid) {
const quotedMentionedJid = messageCopy.message.extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage.contextInfo.mentionedJid;
if (Array.isArray(quotedMentionedJid)) {
for (let i = 0; i < quotedMentionedJid.length; i++) {
if (quotedMentionedJid[i]?.endsWith('@lid')) {
quotedMentionedJid[i] = await resolveLidToRealJid(quotedMentionedJid[i], remoteJid)
}}}}
if (messageCopy.message?.conversation) { messageCopy.message.conversation = await extractAndProcessLids(messageCopy.message.conversation, remoteJid) }
if (messageCopy.message?.extendedTextMessage?.text) { messageCopy.message.extendedTextMessage.text = await extractAndProcessLids(messageCopy.message.extendedTextMessage.text, remoteJid) }
if (messageCopy.message?.extendedTextMessage?.contextInfo?.participant && !messageCopy.quoted) {
const quotedSender = await resolveLidToRealJid( messageCopy.message.extendedTextMessage.contextInfo.participant, remoteJid );
messageCopy.quoted = { sender: quotedSender, message: messageCopy.message.extendedTextMessage.contextInfo.quotedMessage }
}
return messageCopy
} catch (e) {
console.error('Error en processLidsInMessage:', e)
return message
}}

async function connectionUpdate(update) {
const {connection, lastDisconnect, isNewLogin} = update
global.stopped = connection
if (isNewLogin) conn.isInit = true
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
await global.reloadHandler(true).catch(console.error);
global.timestamp.connect = new Date
}
if (global.db.data == null) loadDatabase()
if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
if (opcion == '1' || methodCodeQR) {
console.log(chalk.green.bold(`[ ✿ ]  Escanea este código QR`))}
}
if (connection === "open") {
const userJid = jidNormalizedUser(conn.user.id)
const userName = conn.user.name || conn.user.verifiedName || "Desconocido"
await joinChannels(conn)
console.log(chalk.green.bold(`[ ✿ ]  Conectado a: ${userName}`))
}
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
if (connection === 'close') {
if (reason === DisconnectReason.badSession) {
console.log(chalk.bold.cyanBright(`\n⚠︎ Sin conexión, borra la session principal del Bot, y conectate nuevamente.`))
} else if (reason === DisconnectReason.connectionClosed) {
console.log(chalk.bold.magentaBright(`\n♻ Reconectando la conexión del Bot...`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionLost) {
console.log(chalk.bold.blueBright(`\n⚠︎ Conexión perdida con el servidor, reconectando el Bot...`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(chalk.bold.yellowBright(`\nꕥ La conexión del Bot ha sido reemplazada.`))
} else if (reason === DisconnectReason.loggedOut) {
console.log(chalk.bold.redBright(`\n⚠︎ Sin conexión, borra la session principal del Bot, y conectate nuevamente.`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.restartRequired) {
console.log(chalk.bold.cyanBright(`\n♻ Conectando el Bot con el servidor...`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.timedOut) {
console.log(chalk.bold.yellowBright(`\n♻ Conexión agotada, reconectando el Bot...`))
await global.reloadHandler(true).catch(console.error)
} else {
console.log(chalk.bold.redBright(`\n⚠︎ Conexión cerrada, conectese nuevamente.`))
}}}
process.on('uncaughtException', console.error)
let isInit = true
let handler = await import('./handler.js')
global.reloadHandler = async function(restatConn) {
try {
const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e);
}
if (restatConn) {
const oldChats = global.conn.chats
try {
global.conn.ws.close()
} catch { }
conn.ev.removeAllListeners()
global.conn = makeWASocket(connectionOptions, {chats: oldChats})
isInit = true
}
if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}
conn.handler = handler.handler.bind(global.conn)
conn.connectionUpdate = connectionUpdate.bind(global.conn)
conn.credsUpdate = saveCreds.bind(global.conn, true)
const currentDateTime = new Date()
const messageDateTime = new Date(conn.ev)
if (currentDateTime >= messageDateTime) {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
} else {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
}
conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
}
setInterval(() => {
console.log('[ ✿ ]  Reiniciando...');
process.exit(0)
}, 10800000)
let rtU = join(__dirname, `./${jadi}`)
if (!existsSync(rtU)) {
mkdirSync(rtU, { recursive: true }) 
}

global.rutaJadiBot = join(__dirname, `./${jadi}`)
if (global.MichiJadibts) {
if (!existsSync(global.rutaJadiBot)) {
mkdirSync(global.rutaJadiBot, { recursive: true }) 
console.log(chalk.bold.cyan(`ꕥ La carpeta: ${jadi} se creó correctamente.`))
} else {
console.log(chalk.bold.cyan(`ꕥ La carpeta: ${jadi} ya está creada.`)) 
}
const readRutaJadiBot = readdirSync(rutaJadiBot)
if (readRutaJadiBot.length > 0) {
const creds = 'creds.json'
for (const gjbts of readRutaJadiBot) {
const botPath = join(rutaJadiBot, gjbts)
const readBotPath = readdirSync(botPath)
if (readBotPath.includes(creds)) {
MichiJadiBot({pathMichiJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot'})
}}}}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
try {
const file = global.__filename(join(pluginFolder, filename))
const module = await import(file)
global.plugins[filename] = module.default || module
} catch (e) {
conn.logger.error(e)
delete global.plugins[filename]
}}}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
if (pluginFilter(filename)) {
const dir = global.__filename(join(pluginFolder, filename), true);
if (filename in global.plugins) {
if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`)
else {
conn.logger.warn(`deleted plugin - '${filename}'`)
return delete global.plugins[filename]
}} else conn.logger.info(`new plugin - '${filename}'`)
const err = syntaxerror(readFileSync(dir), filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true,
});
if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
else {
try {
const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
global.plugins[filename] = module.default || module;
} catch (e) {
conn.logger.error(`error require plugin '${filename}\n${format(e)}'`)
} finally {
global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
}}}}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
import startServer from './server.js';
import os from 'os';
import events from './lib/events.js';

await global.reloadHandler()

// Start the web server
const port = 12009;
startServer(port);

// Log the local IP addresses
const networkInterfaces = os.networkInterfaces();
console.log(chalk.bold.yellowBright('\nꕥ Web Interface running on:'));
Object.keys(networkInterfaces).forEach(ifaceName => {
    networkInterfaces[ifaceName].forEach(iface => {
        if ('IPv4' === iface.family && iface.internal === false) {
            console.log(chalk.bold.cyanBright(`  > http://${iface.address}:${port}`));
        }
    });
});

// Listener for pairing code requests from the web UI
events.on('get-code-request', async ({ phoneNumber, requestId }) => {
    const pathMichiJadiBot = path.join(global.rutaJadiBot, phoneNumber);
    if (!fs.existsSync(pathMichiJadiBot)) {
        fs.mkdirSync(pathMichiJadiBot, { recursive: true });
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(pathMichiJadiBot);
        const { version } = await fetchLatestBaileysVersion();
        const msgRetryCache = new NodeCache();

        const connectionOptions = {
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
            msgRetryCounterCache: msgRetryCache,
            browser: ['MichiWaMD', 'Web', '1.0'],
            version,
            generateHighQualityLinkPreview: true
        };

        let sock = makeWASocket(connectionOptions);

        const cleanup = () => {
            try {
                sock.ws.close();
                sock.ev.removeAllListeners();
            } catch {}
        };

        const timeout = setTimeout(() => {
            events.emit(`get-code-response:${requestId}`, { error: 'Request timed out after 45 seconds.' });
            cleanup();
        }, 45000);

        sock.ev.on('connection.update', async (update) => {
            const { connection, qr } = update;
            if (qr) {
                 try {
                    const code = await sock.requestPairingCode(phoneNumber);
                    events.emit(`get-code-response:${requestId}`, { code: code.match(/.{1,4}/g)?.join("-") || code });
                    clearTimeout(timeout);
                    cleanup();
                 } catch (e) {
                    events.emit(`get-code-response:${requestId}`, { error: 'Failed to request pairing code.' });
                    clearTimeout(timeout);
                    cleanup();
                 }
            }
            if (connection === 'close') {
                clearTimeout(timeout);
                cleanup();
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (e) {
        console.error('Error in get-code-request handler:', e);
        events.emit(`get-code-response:${requestId}`, { error: 'An internal server error occurred.' });
    }
});

import setPrefixHandler from './plugins/subs-setprefix.js';

// Listener for set prefix requests
events.on('set-prefix-request', async ({ phoneNumber, prefix, requestId }) => {
    let replyMessage = '';
    const fakeM = {
        sender: `${phoneNumber}@s.whatsapp.net`,
        reply: (text) => {
            replyMessage = text;
            return Promise.resolve(); // Mock the async nature of reply
        }
    };

    try {
        // Call the actual plugin handler
        await setPrefixHandler(fakeM, { text: prefix });
        events.emit(`set-prefix-response:${requestId}`, { message: replyMessage });
    } catch (e) {
        console.error('Error in set-prefix-request handler:', e);
        events.emit(`set-prefix-response:${requestId}`, { error: 'An internal error occurred while setting the prefix.' });
    }
});


async function _quickTest() {
const test = await Promise.all([
spawn('ffmpeg'),
spawn('ffprobe'),
spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
spawn('convert'),
spawn('magick'),
spawn('gm'),
spawn('find', ['--version']),
].map((p) => {
return Promise.race([
new Promise((resolve) => {
p.on('close', (code) => {
resolve(code !== 127);
});
}),
new Promise((resolve) => {
p.on('error', (_) => resolve(false))
})])
}))
const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
Object.freeze(global.support);
}
// Limpieza automática de audios innecesarios de subbots cada 3 minutos
setInterval(async () => {
  console.log(chalk.cyan('[ ✿ ] Iniciando limpieza automática de SubBots...'));
  const baseDir = `./${jadi}/`;
  try {
    if (!existsSync(baseDir)) {
      console.log(chalk.yellow(`[ ✿ ] No existe la carpeta ${jadi}.`));
      return;
    }

    const subBots = readdirSync(baseDir);
    let totalDeleted = 0;

    for (const bot of subBots) {
      const botPath = join(baseDir, bot);
      const stat = statSync(botPath);
      if (!stat.isDirectory()) continue;

      const files = readdirSync(botPath);
      for (const file of files) {
        if (!['creds.json', 'config.json', 'config.js'].includes(file)) {
          const filePath = join(botPath, file);
          const fileStat = statSync(filePath);
          try {
            if (fileStat.isDirectory()) {
              rmSync(filePath, { recursive: true, force: true });
            } else {
              unlinkSync(filePath);
            }
            totalDeleted++;
          } catch (err) {
            console.error(chalk.red(`Error eliminando ${bot}/${file}: ${err.message}`));
          }
        }
      }
    }

    console.log(chalk.green(
      totalDeleted
        ? `[ ✿ ] Limpieza completa: ${totalDeleted} archivos eliminados`
        : `[ ✿ ] No se eliminaron archivos, solo creds.json y config presentes`
    ));

  } catch (error) {
    console.error(chalk.red(`Error en limpieza automática de subBots: ${error}`));
  }
}, 3 * 60 * 1000); // 3 minutos
// Tmp
setInterval(async () => {
const tmpDir = join(__dirname, 'tmp')
try {
const filenames = readdirSync(tmpDir)
filenames.forEach(file => {
const filePath = join(tmpDir, file)
unlinkSync(filePath)})
console.log(chalk.gray(`→ Archivos de la carpeta TMP eliminados`))
} catch {
console.log(chalk.gray(`→ Los archivos de la carpeta TMP no se pudieron eliminar`));
}}, 30 * 1000)
// Sessions Subs
setInterval(async () => {
const directories = [`./${sessions}/`, `./${jadi}/`]
directories.forEach(dir => {
readdirSync(dir, (err, files) => {
if (err) throw err
files.forEach(file => {
if (file !== 'creds.json') {
const filePath = path.join(dir, file);
unlinkSync(filePath, err => {
if (err) {
console.log(chalk.gray(`\n→ El archivo ${file} no se logró borrar.\n` + err))
} else {
console.log(chalk.gray(`\n→ ${file} fué eliminado correctamente.`))
} }) }
}) }) }) }, 10 * 60 * 1000)
_quickTest().catch(console.error)
async function isValidPhoneNumber(number) {
try {
number = number.replace(/\s+/g, '')
if (number.startsWith('+521')) {
number = number.replace('+521', '+52');
} else if (number.startsWith('+52') && number[4] === '1') {
number = number.replace('+52 1', '+52');
}
const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
return phoneUtil.isValidNumber(parsedNumber)
} catch (error) {
return false
}}

async function joinChannels(sock) {
for (const value of Object.values(global.ch)) {
if (typeof value === 'string' && value.endsWith('@newsletter')) {
await sock.newsletterFollow(value).catch(() => {})
}}}
