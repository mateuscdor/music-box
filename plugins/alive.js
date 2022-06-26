const { AddModule } = require("../index");
AddModule({pattern: 'ping', fromMe: false, desc: 'Bot response in second.'}, (async (m, client) => {
  var start = new Date().getTime();
  var msg = await m.reply('```Ping!```');
  var end = new Date().getTime();

  await m.reply('*Pong!*\n```' + (end - start) + 'ms```');
}));
