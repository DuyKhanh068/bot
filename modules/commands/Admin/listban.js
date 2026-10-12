module.exports.config = {
  name: "listban",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "DK",
  description: "Xem danh sách ban của nhóm hoặc của người dùng",
  commandCategory: "Admin",
  usages: "[thread/user]",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, args, Users, handleReply, event, Threads }) {
  const { threadID, messageID } = event;
  let name = await Users.getNameUser(event.senderID);
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

  const arrnum = event.body.split(" ").map(n => parseInt(n));
  let msg = "";
  let uidS = "";

  switch (handleReply.type) {
    case "unbanthread":
      for (const num of arrnum) {
        const myString = handleReply.listBanned[num - 1];
        const [str, uid] = myString.split(':').map(part => part.trim());

        const data = (await Threads.getData(uid)).data || {};
        data.banned = 0;
        await Threads.setData(uid, { data });

        global.data.threadBanned.delete(uid);
        msg += `Unbanned: ${myString}\n\n`;
        uidS += ` ${uid}\n`;
      }

      api.sendMessage(`✅ Nhóm của bạn đã được admin gỡ ban`, uidS, () =>
        api.sendMessage(`${global.data.botID}`, () =>
          api.sendMessage(`✅ Thực thi Unban(true/false)\n\n${msg}`, threadID, () =>
            api.unsendMessage(messageID))
        ));
      break;

    case 'unbanuser':
      for (const num of arrnum) {
        const myString = handleReply.listBanned[num - 1];
        const [str, uid] = myString.split(':').map(part => part.trim());

        const data = (await Users.getData(uid)).data || {};
        data.banned = 0;
        await Users.setData(uid, { data });

        global.data.userBanned.delete(uid);
        msg += `Unbanned: ${myString}\n`;
        uidS += ` ${uid}\n`;
      }

      api.sendMessage(`Thực thi Unban (true/false)\n\n${msg}`, threadID, () =>
        api.unsendMessage(messageID));
      break;
  }
};

module.exports.run = async function ({ event, api, Users, args, Threads }) {
  const { threadID, messageID } = event;
  const listBanned = [];
  const listbanViews = [];
  let i = 1;
  let j = 1;

  const generateBanList = async (getList, getInfo) => {
    for (const item of getList) {
      const info = await getInfo(item);
      listBanned.push(`${i++}. ${info.name}\n🔰ID: ${item}`);
      listbanViews.push(`${j++}. ${info.name}\n🔰ID: ${item}\n📋Lý do: ${info.reason}\n⏱Time: ${info.date}`);
    }
  };

  switch (args[0]) {
    case "thread":
    case "t":
    case "-t":
      const threadBanned = Array.from(global.data.threadBanned.keys());
      await generateBanList(
        threadBanned,
        async (id) => ({
          name: global.data.threadInfo.get(id)?.threadName || "Tên không tồn tại",
          reason: global.data.threadBanned.get(id)?.reason,
          date: global.data.threadBanned.get(id)?.dateAdded
        })
      );

      return api.sendMessage(listbanViews.length ? 
        `Hiện gồm có ${listbanViews.length} nhóm bị ban\n\n${listbanViews.join("\n\n")}` +
        "\n\nReply tin nhắn này + stt có thể rep nhiều số, cách nhau bằng dấu cách nếu muốn unban thread tương ứng." :
        "❎ Hiện tại không có nhóm nào bị ban.",
        threadID, 
        (error, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: 'unbanthread',
            listBanned
          });
        },
        messageID
      );

    case "user":
    case "u":
    case "-u":
      const userBanned = Array.from(global.data.userBanned.keys());
      await generateBanList(
        userBanned,
        async (id) => ({
          name: global.data.userName.get(id) || await Users.getNameUser(id),
          reason: global.data.userBanned.get(id)?.reason,
          date: global.data.userBanned.get(id)?.dateAdded
        })
      );

      return api.sendMessage(listbanViews.length ? 
        `Hiện tai gồm có ${listbanViews.length} 𝗻gười dùng bị ban\n\n${listbanViews.join("\n\n")}` +
        "\n\nReply tin nhắn này + stt có thể rep nhiều số, cách nhau bằng dấu cách nếu muốn unban user tương ứng." :
        "❎ Hiện tại không có người dùng nào bị ban.",
        threadID,
        (error, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: 'unbanuser',
            listBanned
          });
        },
        messageID
      );

    default:
      return api.sendMessage(`Lệnh không hợp lệ. Sử dụng: ${this.config.usages}`, threadID, messageID);
  }
}
