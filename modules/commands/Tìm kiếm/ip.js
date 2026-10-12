module.exports.config = {
	name: "ip",	
	version: "1.0.0", 
	hasPermssion: 2,
	credits: "DK",
	description: "Xem thông tin ip của bạn hoặc ip khác", 
	commandCategory: "Tìm kiếm",
	usages: "",
	cooldowns: 0,
	dependencies: "",
};
module.exports.run = async function({ api, args, event, __GLOBAL }) {
  const timeStart = Date.now();
  
    const axios = require("axios");
  if (!args[0]) {api.sendMessage("❎ Vui lòng nhập ip bạn muốn kiểm tra",event.threadID, event.messageID);}
  else {
var infoip = (await axios.get(`http://ip-api.com/json/${args.join(' ')}?fields=66846719`)).data;
       if (infoip.status == 'fail')
         {api.sendMessage(`⚠️ Đã xảy ra lỗi: ${infoip.message}`, event.threadID, event.messageID)}
          else {
 api.sendMessage({body:`🗺️ Châu lục: ${infoip.continent}\n🏳️ Quốc gia: ${infoip.country}\n🎊 Mã QG: ${infoip.countryCode}\n🕋 Khu vực: ${infoip.region}\n⛱️ Vùng/Tiểu bang: ${infoip.regionName}\n🏙️ Thành phố : ${infoip.city}\n🛣️ Quận/Huyện: ${infoip.district}\n📮 Mã bưu chính: ${infoip.zip}\n🧭 Latitude: ${infoip.lat}\n🧭 Longitude: ${infoip.lon}\n⏱️ Timezone: ${infoip.timezone}\n👨‍✈️ Tên tổ chức: ${infoip.org}\n💵 Đơn vị tiền tệ: ${infoip.currency}`,location: {
				latitude: infoip.lat,
				longitude: infoip.lon,
				current: true
			}}
,event.threadID, event.masageID);}
        }
    
}