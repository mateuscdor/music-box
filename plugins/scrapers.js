const {
    AddModule
} = require('../index');
const {
	addinfo,
	isUrl,
	getBuffer,
	generateListYTS,
	generatelinkpreview
} = require('../lib/utils');
const {
	getString
} = require('./lang/lang');
const {
	yta,
	ytvideo,
	ytIdRegex
} = require('../lib/y2mate');
const yts = require("yt-search")
const ID3Writer = require('browser-id3-writer');
const { toAudio, toPTT } = require('../lib/converter')
const config = require('../config');
const Lang = getString('scrapers');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg')

AddModule({pattern: 'song', fromMe: false, desc: Lang.SONG_DESC}, (async (m, client, text) => { 
if(!text) return m.reply(Lang.NEED_TEXT_SONG)
if (isUrl(text) && text.includes('youtu')) {
let ytId = ytIdRegex.exec(text)
let media_1 = await yta('https://youtu.be/' + ytId[1], '128kbps', 'en68')
let media_2 = await yta('https://youtu.be/' + ytId[1], '128kbps', 'en154')
let media_3 = await yta('https://youtu.be/' + ytId[1], '128kbps', 'en136')
let media_4 = await yta('https://youtu.be/' + ytId[1], '128kbps', 'id4')
let media = media_1 || media_2 || media_3 || media_4
let thumb = await getBuffer(media.thumb)
if (media.filesize >= 10000) return client.sendMessage(m.chat, { audio: { url: media.dl_link }, mimetype: 'audio/mpeg'}, { quoted: m})
ffmpeg(media.dl_link)
.audioBitrate(128)
.save('./song.mp3')
.on('end', async () => {
let writer = await addinfo(fs.readFileSync('./song.mp3'), thumb, media.title, 'Hermit Official', 'desc')
fs.unlinkSync('./song.mp3')

client.sendMessage(m.chat, { audio: Buffer.from(writer.arrayBuffer), mimetype: 'audio/mpeg'}, { quoted: m})
})
return;
}
let search = await yts(text)
if (search.length < 1) return await m.reply(Lang.NO_RESULT);
let list = await generateListYTS(search)
const listMessage = {
text: `And ${list.length} More Results...`,
footer: 'user: ' + m.pushName,
title: search.videos[0].title,
buttonText: 'Select song',
sections: list
}
await client.sendMessage(m.chat, listMessage)
}));

AddModule({pattern: 'music', fromMe: false, desc: Lang.SONG_DESC}, (async (m, client, text) => { 
if (isUrl(text) && text.includes('youtu')) return client.sendSong(text)
console.log(text)
let search = await yts(text)
let media = await yta(search.videos[0].url, '128kbps')
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
}));
AddModule({pattern: 'vector', fromMe: false, desc: 'vector'}, (async (m, client, text) => { 
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
if (!/video/.test(mime) && !/audio/.test(mime)) return m.reply("*Reply to Video*")
let location = await client.downloadAndSaveMediaMessage(quoted)
ffmpeg(location)
.outputOptions(["-y", "-filter_complex", "[0:a]avectorscope=s=480x480:zoom=1.5:rc=0:gc=200:bc=0:rf=0:gf=40:bf=0,format=yuv420p[v]", "-map", "[v]", "-map 0:a"])
.save('output.mp4')
.on('end', async () => {
await client.sendMessage(m.chat, { video: fs.readFileSync('output.mp4')}, { quoted: m })
});
}));