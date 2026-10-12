module.exports.config = {
    name: "reset",
    version: "2.0.2",
    hasPermssion: 2,
    credits: "DK",
    description: "Khởi động lại bot",
    commandCategory: "Admin",
    usages: "restart",
    cooldowns: 0,
    dependencies: {}
};

module.exports.run = async function ({ api, args, event, permssion }) {
    const { threadID, messageID } = event;
    const moment = require("moment-timezone");

    if (permssion != 3) return api.sendMessage(`[ DONATE ]`, event.threadID, event.messageID);

    if (args.length == 0) {
        api.sendMessage(`🔄 Tiến hành khởi động lại bot...`, event.threadID, () => process.exit(1));
    } else {
        let time = parseInt(args.join(" "), 10);
        var gio = moment.tz("Asia/Ho_Chi_Minh").format("HH");
        var phut = moment.tz("Asia/Ho_Chi_Minh").format("mm");
        var giay = moment.tz("Asia/Ho_Chi_Minh").format("ss");

        setTimeout(() =>
            api.sendMessage(`🔄 Khởi động lại sau ${time}s\n⏰ Bây giờ là: ${gio}:${phut}:${giay}`, threadID), 0);

        setTimeout(() => {
            api.sendMessage(`🔄 Đã hết ${time}s bắt đầu quá trình khởi động lại bot...`, event.threadID, () => process.exit(1));
        }, 1000 * time);
    }
};
