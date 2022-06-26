const {
    AddModule
} = require('../index');
const {
	getString
} = require('./lang/lang')
const Config = require('../config');
const axios = require('axios');
const fs = require('fs');
const Db = require('./sql/plugin');
const Lang = getString('_plugin');

AddModule({pattern: 'install', fromMe: true, desc: Lang.INSTALL_DESC}, (async (m, client, text) => {
    if (text === '') return await m.reply('```' + Lang.NEED_URL + '.install https://gist.github.com/Quiec/cd5af0c153a613ba55c24f8c6b6f5565```')
    try {
        var url = new URL(text);
    } catch {
        return await m.reply(Lang.INVALID_URL);
    }
    if (url.host === 'gist.github.com') {
        url.host = 'gist.githubusercontent.com';
        url = url.toString() + '/raw'
    } else {
        url = url.toString()
    }
    try {
        var response = await axios(url);
    } catch {
        return await m.reply(Lang.INVALID_PLUGIN + ' ```' + e + '```')
    }
    let plugin_name = /pattern: ["'](.*)["'],/g.exec(response.data)
    plugin_name = plugin_name[1].split(" ")[0]
    fs.writeFileSync('./plugins/' + plugin_name + '.js', response.data);
    try {
        require('./' + plugin_name);
    } catch (e) {
        fs.unlinkSync('./plugins/' + plugin_name + '.js')
        return await m.reply(Lang.INVALID_PLUGIN + e);
    }
    await Db.installPlugin(url, plugin_name);
    await m.reply(Lang.INSTALLED.replace('{}', plugin_name));
}));

AddModule({pattern: 'plugin', fromMe: true, desc: Lang.PLUGIN_DESC}, (async (m, client, text) => {
var plugins = await Db.PluginDB.findAll();
if (text !== '') {
var plugin = plugins.filter(_plugin => _plugin.dataValues.name == text)
try {
await m.reply(plugin.dataValues.name + ": " + plugin.dataValues.url);
} catch {
return await m.reply(Lang.NOT_FOUND_PLUGIN)
}
return;
}
var msg = Lang.INSTALLED_FROM_REMOTE;
var plugins = await Db.PluginDB.findAll();
if (plugins.length < 1) {
return await m.reply(Lang.NO_PLUGIN);
} else {
plugins.map(
(plugin) => {
msg += '*' + plugin.dataValues.name + '* : ' + plugin.dataValues.url + '\n\n';
}
);
return await m.reply(msg);
}
}));


AddModule({pattern: 'remove', fromMe: true, desc: Lang.REMOVE_DESC}, (async (m, client, text) => {
    if (text === '') return await m.reply(Lang.NEED_PLUGIN);
    var plugin = await Db.PluginDB.findAll({where: {name: text}});
    if (plugin.length < 1) {
        return await m.reply(Lang.NOT_FOUND_PLUGIN);
    } else {
        await plugin[0].destroy();
        delete require.cache[require.resolve('./' + text + '.js')]
        fs.unlinkSync('./plugins/' + text + '.js');
        await m.reply(Lang.DELETED.replace('{}', text));
    }
}));
