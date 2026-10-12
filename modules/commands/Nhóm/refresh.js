module.exports.config = {
  name: "refresh",
  version: "1.0",
  hasPermssion: 1,
  credits: "DK",
  description: "Làm mới data nhóm",
  commandCategory: "Nhóm",
  usages: "để trống/threadID",
  cooldowns: 5,

};
module.exports.run = async function ({ event, args, api, Threads }) {
  const { threadID } = event;
  const targetID = args[0] || event.threadID;
  var threadInfo = await api.getThreadInfo(targetID);
  let threadName = threadInfo.threadName;
  let qtv = threadInfo.adminIDs.length;
  await Threads.setData(targetID, { threadInfo });
  return api.sendMessage(`✅ Đã làm mới data nhóm thành công!\n\n👨‍💻 Box: ${threadName}\n🔎 ID: ${targetID}\n\n📌 Cập nhật thành công ${qtv} quản trị viên nhóm!`, threadID);
}