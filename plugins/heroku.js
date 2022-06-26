const simpleGit = require('simple-git');
const git = simpleGit();
const Config = require('../config');
const {
    AddModule
} = require("../index");
const Heroku = require('heroku-client');
const heroku = new Heroku({
    token: Config.HEROKU.API_KEY
})
let baseURI = "/apps/" + Config.HEROKU.APP_NAME
AddModule({
        pattern: "restart",
        fromMe: true,
        desc: 'Restart the bot'
    },
    (async (m, client) => {
        await m.reply("_Restarting_")
        console.log(baseURI)
        await heroku.delete(baseURI + "/dynos").catch(async (error) => {
            await m.reply("*Check Heroku app name in Heroku app settings*\n*Update Heroku api key in Heroku app settings*")
        });
    }));
AddModule({
    pattern: 'shutdown',
    fromMe: true,
    dontAddCommandList: true
}, (async (m, client) => {
    await heroku.get(baseURI + '/formation').then(async (formation) => {
        forID = formation[0].id;
        await m.reply("*Shutting down.. ❌*")
        await heroku.patch(baseURI + '/formation/' + forID, {
            body: {
                quantity: 0
            }
        });
    }).catch(async (err) => {
        await m.reply(error.message)
    });
}));
AddModule({pattern: 'setvar', fromMe: true, desc: "Set heroku config var"}, (async (m, client, text) => {
    if (text === "") return await m.reply("```Either Key or Value is missing```")
    if ((varKey = text.split(":")[0]) && (varValue = text.split(":")[1])) {
        await heroku.patch(baseURI + '/config-vars', {
            body: {
                [varKey]: varValue
            }
        }).then(async (app) => {
            done = 'Successfully set' + '```' + varKey + '➜' + varValue + '```'
             await m.reply(done);
        });
    } else {
        await m.reply("*Check Heroku app name in Heroku app settings*\n*Update Heroku api key in Heroku app settings*");
    }
}));
AddModule({pattern: 'delvar', fromMe: true, desc: "Delete heroku config var"}, (async (m, client, text) => {
    if (text === "") return await m.reply("```Either Key or Value is missing```");
    await heroku.get(baseURI + '/config-vars').then(async (vars) => {
        key = text.trim();
        for (vr in vars) {
            if (key == vr) {
                await heroku.patch(baseURI + '/config-vars', {
                    body: {
                        [key]: null
                    }
                });
                return await m.reply("```{} successfully deleted```".replace('{}', key));
            }
        }
        await m.reply("```No results found for this key```");
    }).catch(async (error) => {
        await m.reply("*Check Heroku app name in Heroku app settings*\n*Update Heroku api key in Heroku app settings*");
    });

}));
AddModule({pattern: 'getvar', fromMe: true, desc: "Get heroku config var"}, (async (m, client, text) => {
    if (text === "") return await m.reply("```Either Key or Value is missing```")
    await heroku.get(baseURI + '/config-vars').then(async (vars) => {
        for (vr in vars) {
            if (text.trim() == vr) return await m.reply('_{} : {}_'.replace('{}', vr).replace('{}', vars[vr]));
        }
        await m.reply("```No results found for this key```");
    }).catch(async (error) => {
        await m.reply("*Check Heroku app name in Heroku app settings*\n*Update Heroku api key in Heroku app settings*");
    });
}));
AddModule({
        pattern: "allvar",
        fromMe: true,
        desc: "Shows all vars in Heroku APP settings."
    },
    async (m, client, text) => {
        let msg = "```Here your all Heroku vars\n\n\n"
        await heroku
            .get(baseURI + "/config-vars")
            .then(async (keys) => {
                for (let key in keys) {
                    msg += `${key} : ${keys[key]}\n\n`
                }
                return await m.reply(msg + "```")
            })
            .catch(async (error) => {
                await m.reply("*Check Heroku app name in Heroku app settings*\n*Update Heroku api key in Heroku app settings*")
            })
    }
);
AddModule({
    pattern: 'update',
    fromMe: true,
    dontAddCommandList: true,
    desc: "Checks or start bot updates"
}, (async (m, client, text) => {
const match = text.trim().split(/ +/).slice(0)
if (!text) {
await client.sendMessage(m.chat, { text: ' UPDATE MANAGER', templateButtons: [{index: 1, quickReplyButton: {displayText: 'UPDATE CHECK', id: 'update check'}},{index: 2, quickReplyButton: {displayText: 'UPDATE START', id: 'update start'}}]})
return;
}
if (match[0] === "check") {
await git.fetch();
var commits = await git.log(['index' + '..origin/' + 'index']);
if (commits.total === 0) {
await client.sendMessage(m.chat, {text: "Bot up to date"})
} else {
var degisiklikler = "Updates are available\n";
commits['all'].map((commit) => {degisiklikler += '(' + commit.date.substring(0, 10) + ') : *' + commit.message + '*\n';});
await client.sendMessage(m.chat, { text: degisiklikler, templateButtons: [{index: 1, quickReplyButton: {displayText: 'UPDATE START', id: '.update start'}}]})
}
} else if (match[0] === "start") {
await git.fetch();
var commits = await git.log(['index' + '..origin/' + 'index']);
if (commits.total === 0) {
return await client.sendMessage(m.chat, {text: "_Bot up to date_"})
} else {
await client.sendMessage(m.chat, {text: "_Build started_"})
try {
var app = await heroku.get('/apps/' + Config.HEROKU.APP_NAME)
} catch {
await client.sendMessage(m.chat, {text: "*Invalid Heroku Details*\n*Update Heroku APP name and Heroku API key*"})
await new Promise(r => setTimeout(r, 1000));
}
git.fetch('upstream', 'index');
git.reset('hard', ['FETCH_HEAD']);
var git_url = app.git_url.replace("https://", "https://api:" + Config.HEROKU.API_KEY + "@")
try {
await git.addRemote('heroku', git_url);
} catch {
console.log('heroku remote ekli');
}
await git.push('heroku', 'index');
await client.sendMessage(m.chat, {text: "_Successfully updated_"})
await client.sendMessage(m.chat, {text: "_Restarting_"})
}
} else {
await client.sendMessage(m.chat, { text: ' UPDATE MANAGER', templateButtons: [{index: 1, quickReplyButton: {displayText: 'UPDATE CHECK', id: '.update check'}},{index: 2, quickReplyButton: {displayText: 'UPDATE START', id: 'update start'}},]})
}
}));
