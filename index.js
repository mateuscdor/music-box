class Collection extends Map {
	find(fn = (value, key, collection) => {}, thisArg) {
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}
	}
	setOptions(name, options = {}) {
		if (!name) return name;
		if (!Object.keys(options).length) return options;
		if (!this.has(name)) return `"${name}" is not matched any commands!`;
		let command = this.get(name);
		this.set(name, { ...command, options: { ...command.options, ...options } });
		return this.get(name);
	}
	modify(name, options = {}) {
		if (!name) return name;
		if (!Object.keys(options).length) return options;
		if (!this.has(name)) return `"${name}" is not matched any commands!`;
		let command = this.get(name);
		this.set(name, { ...command, options: { ...command.options, ...options } });
		return this.get(name);
	}
}
const sesion_d_b = { connectionString: 'postgres://zlfzlblrpfaflp:bf13db17a844623f36347e2e30888420b6840830acde9581436b8b145b430afb@ec2-44-205-41-76.compute-1.amazonaws.com:5432/d50s122prdh7cm', ssl: { rejectUnauthorized: false, }, };
const data_base = { connectionString: 'postgres://fltdbgdagsmpku:8790c5739d4e87465d0c1cdffd1e080f89b9cbc209668f322389fe78f7c0b8b5@ec2-34-225-159-178.compute-1.amazonaws.com:5432/d23lm09m07p1qi', ssl: { rejectUnauthorized: false, }, };
const create_store = async () => { await pool.query("CREATE TABLE IF NOT EXISTS SessionDB(pass text PRIMARY KEY, session text);"); };
const create_session = async () => { 
await sesion_pol.query("CREATE TABLE IF NOT EXISTS sessiondb(pass text PRIMARY KEY, session json);"); 
};

const get_session = async (pass) => {
await create_session(); 
let result = await sesion_pol.query("select * from sessiondb where pass=$1;", [pass,]); 
if (result.rowCount) { 
return result.rows[0] 
} else { 
return false;
}};

const addsession = async (session, pass) => {
await create_session(); 
let result = await sesion_pol.query("SELECT * FROM sessiondb WHERE pass=$1", [pass,]); 
if (result.rows.length) {
await sesion_pol.query("UPDATE sessiondb SET session=$1  WHERE pass=$2;",[session, pass]); 
await sesion_pol.query("commit;"); 
return true; 
} else {
await sesion_pol.query("INSERT INTO sessiondb VALUES($1,$2);", [pass, session,]);
await sesion_pol.query("commit;"); 
return true; 
}};

const {
	default: makeWASocket,
	DisconnectReason,
	useSingleFileAuthState,
	makeInMemoryStore,
	fetchLatestBaileysVersion,
	jidDecode,
	delay,
	downloadContentFromMessage
} = require('@adiwajshing/baileys');
const {
	smsg,
	getBuffer
} = require('./lib/utils')
const util = require('util')
const got = require("got");
const config = require('./config');
const { Pool } = require('pg');
const pool = new Pool(data_base);
const sesion_pol = new Pool(sesion_d_b);
const pino = require('pino')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const  { Boom } = require('@hapi/boom')
const { exec, spawn, execSync } = require("child_process")
const PhoneNumber = require('awesome-phonenumber')
const yts = require("yt-search")
const ffmpeg = require('fluent-ffmpeg')
const { yta, ytv } = require('./lib/y2mate')
const { toAudio, toPTT } = require('./lib/converter')
const moment = require('moment-timezone')
const ID3Writer = require('browser-id3-writer');
const prefa = '.'
const Commands = new Collection()
exports.Commands = Commands

exports.AddModule = (info, func) => {
	
	var infos = {
        fromMe: info['fromMe'] === undefined ? true : info['fromMe'],
        onlyGroup: info['onlyGroup'] === undefined ? false : info['onlyGroup'],
        onlyPm: info['onlyPm'] === undefined ? false : info['onlyPm'],
        desc: info['desc'] === undefined ? '' : info['desc'],
        usage: info['usage'] === undefined ? '' : info['usage'],
        dontAddCommandList: info['dontAddCommandList'] === undefined ? false : info['dontAddCommandList'],
        warn: info['warn'] === undefined ? '' : info['warn'],
        function: func
    };
    
return Commands.set(info.pattern, infos);
}

fs.readdirSync('./plugins/sql/').forEach(plugin => {
    if(path.extname(plugin).toLowerCase() == '.js') {
        require('./plugins/sql/' + plugin);
    }
});
        
const plugindb = require('./plugins/sql/plugin');

const readCommand = async () => {
	await config.DATABASE.sync()
    console.log('DB syncing');
    console.log(chalk.blueBright.italic('⬇️ INSTALLING PLUGINS...'));
	var plugins = await plugindb.PluginDB.findAll();
	plugins.map(async (plugin) => {
	if (!fs.existsSync('./plugins/' + plugin.dataValues.name + '.js')) {
	console.log(plugin.dataValues.name);
	var response = await got(plugin.dataValues.url);
	if (response.statusCode == 200) {
	fs.writeFileSync('./plugins/' + plugin.dataValues.name + '.js', response.body);
	require('./plugins/' + plugin.dataValues.name + '.js');
	}     
	}
	});
	fs.readdirSync('./plugins').forEach(plugin => {
	if(path.extname(plugin).toLowerCase() == '.js') {
	require('./plugins/' + plugin);
	}
	});
	console.log(chalk.green.bold('✅ PLUGINS INSTALLED!'));
}


const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
async function connectToWhatsApp() {
	await readCommand()
	let sesion = await get_session(config.SESSION_ID)
	await fs.writeFileSync('./session.json', JSON.stringify(sesion.session, null, 2));
	console.log("[ SESSION LOADED ]");
	const { state, saveState } = useSingleFileAuthState('./session.json');
	let { version, isLatest } = await fetchLatestBaileysVersion()
	const client = makeWASocket({
		logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
		browser: ['WHATSAPP BOT MD', 'Safari','1.0.0'],
		auth: state
	})
	
		   store.bind(client.ev)
		
		client.public = true
		
		const savesession = async () => {
			let isok = await addsession(JSON.parse(fs.readFileSync('./session.json')), config.SESSION_ID);
			console.log(isok)
      }
			
     
	client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update	    
        if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); process.exit(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, Reconnecting...."); connectToWhatsApp(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, Reconnecting..."); connectToWhatsApp(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); process.exit(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Delete Session And Scan Again.`); process.exit(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); connectToWhatsApp(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); connectToWhatsApp(); }
            else { console.log(`Unknown DisconnectReason: ${reason}|${connection}`) }
        }
        console.log('✅ CONNECTED', update)
    })
   
    client.ev.on('messages.upsert', async chatUpdate => {
        try {
        mek = chatUpdate.messages[0]
        if (!mek.message) return
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (!client.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
        m = smsg(client, mek, store)
        var body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
		var budy = (typeof m.text == 'string' ? m.text : '')
		var prefix = prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : prefa ?? global.prefix
		const isCmd = body.startsWith(prefix)
		const type = Object.keys(m.message)[0]        
		const cmdName = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
		const args = body.trim().split(/ +/).slice(1)
		const pushname = m.pushName || "No Name"
		const botNumber = await client.decodeJid(client.user.id)
		const sudo = config.SUDO.split(',')
		const isCreator = [botNumber, ...sudo].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
		const itsMe = m.sender == botNumber ? true : false
		const itsowner = m.sender == global.ownerjid ? true : false
		const text = q = args.join(" ")
		const quoted = m.quoted ? m.quoted : m
		const from = m.key.remoteJid
		const mime = (quoted.msg || quoted).mimetype || ''
		console.log("[ MESSAGE ]",`${pushname} => ${body || budy}`)
		const isMedia = /image|video|sticker|audio/.test(mime)
		const isPublic = config.MODE == 'public' ? true : false
		if (m.message) {
		console.log(chalk.black(chalk.bgWhite('[ MESSAGE ]')), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('=> From'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=> In'), chalk.green(m.isGroup ? pushname : 'Private Chat', m.chat))
		client.sendReadReceipt(m.chat, m.sender, [m.key.id])
		}
		const reply = async(teks) =>{client.sendMessage(m.chat, { text: teks }, { quoted: m })}
		if (budy.startsWith('>')) {if (!isCreator) return; try {let evaled = await eval(budy.slice(2)); if (typeof evaled !== 'string') evaled = require('util').inspect(evaled); await reply(evaled) } catch (err) {await reply(util.format(err))}}
		const cmd = Commands.get(cmdName) || Commands.find((cmd) => cmd.cmd && cmd.cmd.includes(cmdName));
		if (!cmd) return;
		
		if (cmd.fromMe && !isCreator) {
            return
        }
        
          if (cmd.onlyPm && m.isGroup) {
            return
        }
        
        if (cmd.onlyGroup && !m.isGroup) {
            return
        }
        
		try {
		await cmd.function(m, client, text);
		} catch (e) {
		console.error("[CMD ERROR] ", e);
		}
        } catch (err) {
            console.log('ERROR', err)
        }
    })
    
    client.ev.on('creds.update', async save => {
    await saveState()
    await delay(1000)
    let isk = await addsession(JSON.parse(fs.readFileSync('./session.json')), config.SESSION_ID);
	console.log(chalk.cyan(`UPDATE ${isk}`))
    })
       
     client.sendSong = async (Link) => {
let link = Link.replace('https://youtube.com/shorts/','').replace('?feature=share','').replace('https://youtube.com/watch?v=','').replace('https://youtu.be/','')   
let media = await yta(`https://youtu.be/${link}`, '128kbps')
let thumb = await getBuffer(media.thumb)
if (media.filesize >= 10000) return client.sendMessage(m.chat, { audio: { url: media.dl_link }, mimetype: 'audio/mpeg'}, { quoted: m})
ffmpeg(media.dl_link)
.audioBitrate(128)
.save('./song.mp3')
.on('end', async () => {
const writer = new ID3Writer(fs.readFileSync('./song.mp3'));
writer.setFrame('TIT2', media.title)
.setFrame('TPE1', ['Hermit Official'])
.setFrame('APIC', {
type: 3,
data: thumb,
description: media.title
});
writer.addTag();
fs.unlinkSync('./song.mp3')
client.sendMessage(m.chat, { audio: Buffer.from(writer.arrayBuffer), mimetype: 'audio/mpeg'}, { quoted: m})
})
}
	client.sendText = (jid, text, quoted = '', options) => client.sendMessage(jid, { text: text, ...options }, { quoted })
	client.decodeJid = (jid) => { if (!jid) return jid; if (/:\d+@/gi.test(jid)) { let decode = jidDecode(jid) || {}; return decode.user && decode.server && decode.user + '@' + decode.server || jid; } else return jid; }
	client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => { let quoted = message.msg ? message.msg : message; let mime = (message.msg || message).mimetype || ''; let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]; const stream = await downloadContentFromMessage(quoted, messageType); let buffer = Buffer.from([]); for await(const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }; let type = await FileType.fromBuffer(buffer); trueFileName = attachExtension ? (filename + '.' + type.ext) : filename; await fs.writeFileSync(trueFileName, buffer); return trueFileName }
    client.copyNForward = async (jid, message, forceForward = false, options = {}) => { let vtype; if (options.readViewOnce) { message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined); vtype = Object.keys(message.message.viewOnceMessage.message)[0]; delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined)); delete message.message.viewOnceMessage.message[vtype].viewOnce; message.message = { ...message.message.viewOnceMessage.message }; }; let mtype = Object.keys(message.message)[0]; let content = await generateForwardMessageContent(message, null); let ctype = Object.keys(content)[0]; let context = {}; if (mtype != "conversation") context = message.message[mtype].contextInfo; content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo }; const waMessage = await generateWAMessageFromContent(jid, content, options ? { ...content[ctype], ...options, ...(options.contextInfo ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } } : {}) } : {}); await client.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id }); return waMessage }

	return client
}

connectToWhatsApp()