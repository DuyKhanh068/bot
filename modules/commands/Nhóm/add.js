module.exports.config = {
  name: "add",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "DK",
  description: "Thêm người dùng vào nhóm bằng link hoặc uid",
  commandCategory: "Nhóm",
  usages: "[args]",
  cooldowns: 0
};
const { getUID } = require('../../../utils/index')
this.run = async function ({ api, event, args, Threads, Users }) {
  const { threadID, messageID } = event;
  const link = args.join(" ")
  if (!args[0]) return api.sendMessage('', threadID, messageID);
  var { participantIDs, approvalMode, adminIDs } = (await Threads.getData(event.threadID)).threadInfo;
  if (link.indexOf(".com/") !== -1) {
    const res = await getUID(args[0] || event.messageReply.body);
    var uidUser = res
    api.addUserToGroup(uidUser, threadID, (err) => {
      if (participantIDs.includes(uidUser)) return api.sendMessage(`❎ Thành viên đã có mặt trong nhóm`, threadID, messageID);
      if (err) return api.sendMessage(`❎ Không thể thêm thành viên vào nhóm`, threadID, messageID);
      else if (approvalMode && !adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage(`✅ Đã thêm người dùng vào danh sách phê duyệt`, threadID, messageID);
      else return api.sendMessage(`✅ Thêm thành viên vào nhóm thành công`, threadID, messageID);
    });
  }
  else {
    var uidUser = args[0]
    api.addUserToGroup(uidUser, threadID, (err) => {
      if (participantIDs.includes(uidUser)) return api.sendMessage(`❎ Thành viên đã có mặt trong nhóm`, threadID, messageID);
      if (err) return api.sendMessage(`❎ Không thể thêm thành viên vào nhóm`, threadID, messageID);
      else if (approvalMode && !adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage(`✅ Đã thêm người dùng vào danh sách phê duyệt`, threadID, messageID);
      else return api.sendMessage(`✅ Thêm thành viên vào nhóm thành công`, threadID, messageID);
    });
  }
}