module.exports.config = {
    name: "tarot",
    version: "0.0.1",
    hasPermssion: 0,
    credits: "DK",
    description: "Bói bài tarot",
    commandCategory: "Game",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const axios = require("axios")
    const c = (await axios.get('https://raw.githubusercontent.com/ThanhAli-Official/tarot/main/data.json')).data
  if(args[0] > c.length) return api.sendMessage('⚠️ Không thể vượt quá số bài đang có trong hệ thống dữ liệu', event.threađID)
    if(!args[0]){
    var k = Math.floor(Math.random() * c.length)
  } else {
      var k = args[0]
  }
    const x = c[k]
    const t = (await axios.get(`${x.image}`, {
        responseType: "stream"
      })).data;
    const msg = ({
        body: `[ BÓI BÀI TAROT ]\n\n📝 Tên lá bài: ${x.name}\n✏️ Thuộc bộ: ${x.suite}\n✴️ Mô tả: ${x.vi.description}\n🏷️ Diễn dịch: ${x.vi.interpretation}\n📜 Bài ngược: ${x.vi.reversed}`,
        attachment: t
    })
    return api.sendMessage(msg, event.threadID, event.messageID)
     }