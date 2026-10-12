module.exports.config = {
	"name": "pending",
	"version": "1.0.6",
	"credits": "DK",
	"hasPermssion": 2,
	"description": "Quản lý tin nhắn chờ của bot",
	"commandCategory": "Admin",
	"usages": "[u] [t] [a]",
	"cooldowns": 5
};

module.exports.handleReply = async function ({ api, event, handleReply, getText }) {
	api.unsendMessage(event.messageID)
	if (String(event.senderID) !== String(handleReply.author)) return;
	const { body, threadID, messageID } = event;
	var count = 0;

	if (isNaN(body) && body.indexOf("c") == 0 || body.indexOf("cancel") == 0) {
		const index = (body.slice(1, body.length)).split(/\s+/);
		for (const singleIndex of index) {
			console.log(singleIndex);
			if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length) return api.sendMessage(`⚠️ Không hợp lệ`, threadID, messageID);
		}
		return api.sendMessage(`Done`, threadID, messageID);
	}
	else {

		const index = body.split(/\s+/);
		const fs = require("fs");
		for (const singleIndex of index) {
			if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length) return api.sendMessage(`Không hợp lệ`, threadID, messageID);
			api.unsendMessage(handleReply.messageID);
			api.sendMessage("", event.threadID, () => api.sendMessage(`.`, handleReply.pending[singleIndex - 1].threadID));
			count += 1;

		}
		return api.sendMessage(`Done`, threadID, messageID);
	}
}

module.exports.run = async function ({ api, event, args, permission, handleReply }) {
	if (args.join() == "") {
		api.sendMessage(`${global.config.PREFIX}pending user: Hàng chờ người dùng\n${global.config.PREFIX}pending thread: Hàng chờ nhóm\n${global.config.PREFIX}pending all: Tất cả box đang chờ duyệt`, event.threadID, event.messageID);
	}
	const content = args.slice(1, args.length);
	switch (args[0]) {
		case "user":
		case "u":
		case "-u":
		case "User": {
			const { threadID, messageID } = event;
			const commandName = this.config.name;
			var msg = "", index = 1;

			try {
				var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
				var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
			} catch (e) { return api.sendMessage("Error", threadID, messageID) }

			const list = [...spam, ...pending].filter(group => group.isGroup == false);

			for (const single of list) msg += `${index++}. ${single.name}\n${single.threadID}\n`;

			if (list.length != 0) return api.sendMessage(`${msg}\n📌 Reply (phản hồi) theo stt để duyệt`, threadID, (error, info) => {
				global.client.handleReply.push({
					name: commandName,
					messageID: info.messageID,
					author: event.senderID,
					pending: list
				})
			}, messageID);
			else return api.sendMessage("❎ Hiện tại không có người dùng nào trong hàng chờ", threadID, messageID);
		}
		case "thread":
		case "-t":
		case "t":
		case "Thread": {
			const { threadID, messageID } = event;
			const commandName = this.config.name;
			var msg = "", index = 1;

			try {
				var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
				var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
			} catch (e) { return api.sendMessage("Error", threadID, messageID) }

			const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

			for (const single of list) msg += `${index++}. ${single.name}\n${single.threadID}\n`;

			if (list.length != 0) return api.sendMessage(`${msg}\n📌 Reply (phản hồi) theo stt để duyệt`, threadID, (error, info) => {
				global.client.handleReply.push({
					name: commandName,
					messageID: info.messageID,
					author: event.senderID,
					pending: list
				})
			}, messageID);
			else return api.sendMessage("❎ Hiện tại không có nhóm nào trong hàng chờ", threadID, messageID);
		}
		case "all":
		case "a":
		case "-a":
		case "al": {
			const { threadID, messageID } = event;
			const commandName = this.config.name;
			var msg = "", index = 1;

			try {
				var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
				var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
			} catch (e) { return api.sendMessage("Error", threadID, messageID) }

			const listThread = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);
			const listUser = [...spam, ...pending].filter(group => group.isGroup == false)
			const list = [...spam, ...pending].filter(group => group.isSubscribed);

			for (const single of list) msg += `${index++}. ${single.name}\n${single.threadID}\n`;

			if (list.length != 0) return api.sendMessage(`${msg}\n📌 Reply (phản hồi) theo stt để duyệt`, threadID, (error, info) => {
				global.client.handleReply.push({
					name: commandName,
					messageID: info.messageID,
					author: event.senderID,
					pending: list
				})
			}, messageID);
			else return api.sendMessage("❎ Hiện tại không có tin nhắn nào trong hàng chờ", threadID, messageID);
		}
	}
}