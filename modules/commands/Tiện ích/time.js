module.exports.config = {
  name: "time",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "DK",
  description: "xem thời gian của các nước",
  commandCategory: "Tiện ích",
  cooldowns: 2,
};


module.exports.run = async ({ api, event }) => {

  const moment = require("moment-timezone");
  const day = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
  var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = 'Chủ Nhật'
  if (thu == 'Monday') thu = 'Thứ Hai'
  if (thu == 'Tuesday') thu = 'Thứ Ba'
  if (thu == 'Wednesday') thu = 'Thứ Tư'
  if (thu == "Thursday") thu = 'Thứ Năm'
  if (thu == 'Friday') thu = 'Thứ Sáu'
  if (thu == 'Saturday') thu = 'Thứ Bảy'

  const gio = moment.tz("Asia/Ho_Chi_Minh").format("h:mm:ss - A");
  const gio2 = moment.tz("Europe/London").format("h:mm:ss - A");
  const gio1 = moment.tz("America/Brasilia").format("h:mm:ss - A");
  const gio3 = moment.tz("Asia/Seoul").format("h:mm:ss - A");
  const gio4 = moment.tz("Asia/Tokyo").format("h:mm:ss - A");
  const gio5 = moment.tz("America/New_York").format("h:mm:ss - A");
  const gio6 = moment.tz("Asia/Kuala_Lumpur").format("h:mm:ss - A");
  const gio7 = moment.tz("Europe/Paris").format("h:mm:ss - A");
  const gio8 = moment.tz("Asia/Manila").format("h:mm:ss - A");
  const gio9 = moment.tz("Asia/Bangkok").format("h:mm:ss - A");
  const gio10 = moment.tz("Asia/Kolkata").format("h:mm:ss - A");
  const gio11 = moment.tz("Asia/Hong_Kong").format("h:mm:ss - A");
  const gio12 = moment.tz("America/Mexico_City").format("h:mm:ss - A");

  const message = `📆 Ngày: ${day} (${thu})\n\n🇻🇳 Vietnam: ${gio}\n🇵🇭 Philippines: ${gio8}\n🇬🇧 London: ${gio2}\n🇺🇸 New York: ${gio5}\n🇰🇷 Seoul: ${gio3}\n🇯🇵 Tokyo: ${gio4}\n🇧🇷 Brasilia: ${gio1}\n🇲🇾 Kuala Lumpur: ${gio6}\n🇫🇷 Paris: ${gio7}\n🇹🇭 Thailand: ${gio9}\n🇮🇳 Ấn Độ: ${gio10}\n🇭🇰 Hong Kong: ${gio11}\n🇲🇽 Mexico City: ${gio12}`;

  api.sendMessage(message, event.threadID);
};