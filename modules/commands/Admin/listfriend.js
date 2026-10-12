module.exports.config = {
  name: "listfriend",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "DK",
  description: "Xem thông tin bạn bè/Xoá bạn bè bằng cách reply",
  commandCategory: "Admin",
  usages: "",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, args, Users, handleReply, event, Threads }) {
  const { threadID, messageID } = event;
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

  switch (handleReply.type) {
    case "reply":
      {
        var msg ="" , name, urlUser, uidUser;
        var arrnum = event.body.split(" ");
        var nums = arrnum.map(n => parseInt(n));
        for (let num of nums) {
          name = handleReply.nameUser[num - 1];
          urlUser = handleReply.urlUser[num - 1];
          uidUser = handleReply.uidUser[num - 1];

          api.unfriend(uidUser);
          msg += '- ' + name + '\n🌐ProfileUrl: ' + urlUser + "\n";
          //console.log(msg);
        }

        api.sendMessage(`✅ Thực thi xoá bạn bè\n\n${msg}`, threadID, () =>
          api.unsendMessage(handleReply.messageID));
      }
      break;
  }
};


module.exports.run = async function ({ event, api, args }) {
  const { threadID, messageID, senderID } = event;
  //var unfriend =  await api.unfriend();
  try {
    var listFriend = [];
    var dataFriend = await api.getFriendsList();
    var countFr = dataFriend.length;

    for (var friends of dataFriend) {
      listFriend.push({
        name: friends.fullName || "Chưa đặt tên",
        uid: friends.userID,
        gender: friends.gender,
        vanity: friends.vanity,
        profileUrl: friends.profileUrl
      });
    }
    var nameUser = [], urlUser = [], uidUser = [];
    var page = 1;
    page = parseInt(args[0]) || 1;
    page < -1 ? page = 1 : "";
    var limit = 10;
    var msg = `📌 DS GỒM ${countFr} BẠN BÈ\n\n`;
    var numPage = Math.ceil(listFriend.length / limit);

    for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
      if (i >= listFriend.length) break;
      let infoFriend = listFriend[i];
      msg += `${i + 1}. ${infoFriend.name}\n🙇‍♂️ID: ${infoFriend.uid}\n🧏‍♂️Gender: ${infoFriend.gender}\n❄️Vanity: ${infoFriend.vanity}\n🌐Profile Url: ${infoFriend.profileUrl}\n\n`;
      nameUser.push(infoFriend.name);
      urlUser.push(infoFriend.profileUrl);
      uidUser.push(infoFriend.uid);
    }
    msg += `\n-> Trang ${page}/${numPage} <-\nDùng ${global.config.PREFIX}${this.config.name} + số trang/all\n\n`;

    return api.sendMessage(msg + '📌 Reply (phản hồi) theo stt có thể rep nhiều số, cách nhau bằng dấu cách để xoá bạn bè đó khỏi danh sách', event.threadID, (e, data) =>
      global.client.handleReply.push({
        name: this.config.name,
        author: event.senderID,
        messageID: data.messageID,
        nameUser,
        urlUser,
        uidUser,
        type: 'reply'
      })
    )
  }
  catch (e) {
    return console.log(e)
  }
          }