module.exports.config = {
	name: "tod",
	version: "0.0.1",
	hasPermssion: 0,
	credits: "DK",
	description: "thật hay thách",
	commandCategory: "Game",
    cooldowns: 5
};
var dare = ["Chụp 1 tấm ảnh gửi vào đây","Để avt người hỏi 1 tuần","Vào FaceBook Của người hỏi Bão Like","Nhắn Tỏ Tình Với crush","Ghi Âm Hát Một Bài Nhạc Bất Kì","Ghi Âm Với Nội Dung Là Yêu người hỏi nhất Nhất","Để hình người hỏi làm avt 1 day","Quay video và nói yêu người hỏi rất nhiều","Ăn một thìa cà phê gia vị bất kì trong bếp","Gửi một tấm ảnh lúc bé của bạn","Gửi một tấm ảnh dìm của bạn","Quay video và nói một câu bất kì với cái lưỡi lè ra trong lúc nói","Đăng một trạng thái dài dòng, vô nghĩa trên Facebook.","Bắt chước một ngôi sao YouTube cho đến khi một người chơi khác đoán được bạn đang thể hiện vai diễn của ai.","Gọi cho một người bạn, giả vờ đó là sinh nhật của họ và hát cho họ nghe Chúc mừng sinh nhật","Chụp một tấm hình với gương mặt gợi cảm","Nhắn tin cho nyc bảo quay lại","Tự vả vào mặt 3 cái","Ghi âm một câu em nhớ anh gửi cho admin","Nhắn tin cho bạn thân và bảo là tao đang nứng","Đặt ngôn ngữ điện thoại di động của bạn thành tiếng Trung","Hôn người bạn cùng giới ngồi cạnh, bất kể vị trí nào đều được.","Gởi tin nhắn cho người bạn bất kỳ: Đi ỉa chung hong? Tui đem giấy rồi nè.","Gửi cho người bạn cùng giới thân thiết nhất một tin nhắn: Tôi thật sự thích cậu lâu lắm rồi","Lấy quần đội lên đầu và chụp hình lại gửi vào đây","Hãy tự dơ cánh tay lên và ngửi nách của bạn","Hãy nhắn tin cho 5 người lạ bất kì"];//Câu hỏi thách <3
var truth = ["Có coi phim người lớn bao giờ chưa?","Hôm nay mặc quần màu gì?","Có thẩm du bao giờ chưa ?","Có quan hệ người lớn bao giờ chưa?","Bị ăn sừng bao nhiêu lần rồi?","Bạn đã bao giờ đi tiểu trong bể bơi chưa?","Bạn đã bao giờ trốn học chưa?","Hôm nay mặc áo ngực màu gì?","Bạn đã ngửi quần lót của mình để kiểm tra xem chúng có bị bẩn không?","Nếu bạn có thể hôn ai đó ngay bây giờ bạn sẽ hôn ai?","Điều kinh tởm nhất mà bạn từng say là gì?", "Có cởi đồ khi đi ngủ không?","Có chụp ảnh nude hoặc quay video không", "Vị trí yêu thích của bạn trên giường là gì?","Đã đi đá phò bao giờ chưa","Một tháng làm việc đó mấy lần","Khi thẩm du trong đầu nghĩ đến ai?","Có từng có suy nghĩ quan hệ 18+ với ny không?","Lông nách có nhiều không","Thích mặt quần lọt khe hay ren?","Có hay bị nốn lừng đêm khuya không?","Bạn muốn có bao nhiêu đứa trẻ?","Một sự thật đáng xấu hổ mà tôi nên biết về bạn là gì?","Nụ hôn đầu tiên của bạn như thế nào?","Số đo 3 vòng của bạn bao nhiêu","Thích kích thước hay kinh nghiệm trong chuyện xxx","Ăn cứt mũi bao giờ chưa","Có ý định quan hệ với người yêu bao giờ chưa?","Cháo lưỡi bao giờ chưa","Nơi yêu thích của bạn để được hôn?","Bạn còn nhớ nyc không","Bạn có ý định quay lại với nyc không","Bạn có bị hôi nách không","Chia sẽ trải nghiệm lần đầu khi cháo lưỡi với người yêu"];//Câu hỏi thật <3
module.exports.run = async ({ event, api, args, Currencies }) => {
  const request = require("request");
const fs = require("fs");
   const { threadID, messageID, senderID } = event;
    
    
    
    if (!args[0]) {
     var msg = {body: `Reply tin nhắn này và chọn thật hoặc thách \n\n1. Thách🐥\n2. Thật 🐰\n\nCó chơi có chịu cấm bùm kèo`}
        
        return api.sendMessage(msg, event.threadID, (error, info) => {
        
            global.client.handleReply.push({
                type: "choosee",
                name: this.config.name,
                author: event.senderID,
                messageID: info.messageID
            })
        })
    }
}
    module.exports.handleReply = async function ({
    args,
    event,
    Users,
    api,
    handleReply,
    Currencies
}) {
  const axios = require("axios");
    var { author } = handleReply;
    if (event.senderID != author) return api.sendMessage("[ WARNING ] - Bạn không phải người sử dụng lệnh", event.threadID, event.messageID); 
    switch (handleReply.type) {
    case "choosee": {
        switch (event.body) {
        case "1": {
          api.unsendMessage(handleReply.messageID);
          
    return api.sendMessage(`Dare 🐥 -> ${dare[Math.floor(Math.random()*dare.length)]}`, event.threadID, event.messageID)

            }
            
        
        
        case "2": {
          api.unsendMessage(handleReply.messageID);
    return api.sendMessage(`Truth 🐰 -> ${truth[Math.floor(Math.random()*truth.length)]}`, event.threadID, event.messageID)
            }
            break;
					default:
           const choose = parseInt(event.body);
            	if (isNaN(event.body)) return api.sendMessage("Vui lòng nhập 1 con số", event.threadID, event.messageID);
            	if (choose > 2 || choose < 1) return api.sendMessage("Lựa chọn không nằm trong danh sách.", event.threadID, event.messageID); 
    }
    }
}
      }