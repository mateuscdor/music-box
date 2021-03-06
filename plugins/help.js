const djs = require("../index");

const footer = '๐ฎ๐ฑโ โโโอชโอคโอฌโอซโอฅโอญโแทคโอคโอฌฯโป'
const botName = '๐ฎ๐ฑโ โโโอชโอคโอฌโอซโอฅโอญโแทคโอคโอฌฯโป'

module.exports = {
	name: "help",
	alias: ["h", "cmd", "menu"],
	category: "general",
	async exec({ client, m, args, isCreator }) {
		if (args[0]) {
			const data = [];
			const name = args[0].toLowerCase();
			const { commands, prefix } = djs;
			const cmd = commands.get(name) || commands.find((cmd) => cmd.alias && cmd.alias.includes(name));
			if (!cmd || (cmd.category === "private" && !isOwner)) return await msg.reply("No command found");
			else data.push(`*Cmd:* ${cmd.name}`);
			if (cmd.alias) data.push(`*Alias:* ${cmd.alias.join(", ")}`);
			if (cmd.limit) data.push(`*Limit:* ${cmd.consume || 1}`);
			if (cmd.premium) data.push(`*Premium:* ${cmd.premiumType.join(" / ")}`);
			if (cmd.desc) data.push(`*Description:* ${cmd.desc}`);
			if (cmd.use)
				data.push(
					`*Usage:* \`\`\`${prefix}${cmd.name} ${cmd.use}\`\`\`\n\nNote: [] = optional, | = or, <> = must filled`
				);

			return await msg.reply(data.join("\n"));
		} else {
			const { pushName, sender } = m;
			const { prefix, commands } = djs;
			const cmds = commands.keys();
			let category = [];

			for (let cmd of cmds) {
				let info = commands.get(cmd);
				if (!cmd) continue;
				if (!info.category || info.category === "private" || info.owner) continue;
				if (Object.keys(category).includes(info.category)) category[info.category].push(info);
				else {
					category[info.category] = [];
					category[info.category].push(info);
				}
			}
			let str =
				`Hello, ${pushName === undefined ? sender.split("@")[0] : pushName}\n*Here My Command List*\n\n` +
				`โญโโโโโโโจ *${botName}* โฉ\nโฐโโโโโโโโโ\n\n`;
			const keys = Object.keys(category);
			for (const key of keys) {
				str += `โญโโโโโโโจ *${key.toUpperCase()}* โฉ\n\`\`\`${category[key]
					.map(
						(cmd, idx) =>
							`โ ${idx + 1}. ${cmd.name}${cmd.limit ? ` (${cmd.consume || 1} limit)` : ""}${
								cmd.premium ? ` (Premium Only)` : ""
							}`
					)
					.join("\n")}\`\`\`\nโฐโโโโโโโโโโโโโโ\n`;
			}
			str += `send ${prefix}help followed by a command name to get detail of command, e.g. ${prefix}help sticker`;
			await client.sendMessage(
				m.chat,
				{
					text: str,
					footer: footer,
					templateButtons: [
						{ urlButton: { displayText: "Telegram Bot", url: "https://t.me/secondMidnight_bot" } },
						{
							urlButton: {
								displayText: "Source Code",
								url: "https://github.com/FaizBastomi/wbot/tree/multi-device",
							},
						},
					],
				},
				{ quoted: m }
			);
		}
	},
};
