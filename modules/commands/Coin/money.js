module.exports.config = {
    name: "money",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "DK", // mod by Tien
    description: "Kiểm tra số tiền của bản thân hoặc người được tag",
    commandCategory: "Coin",
    usages: "[Tag]",
    cooldowns: 0
};

module.exports.languages = {
    "vi": {
        "sotienbanthan": "💵 Số tiền trong ví: %1$",
        "sotiennguoikhac": "💵 Số tiền trong ví %1: %2$"
    },
    "en": {
        "sotienbanthan": "Your current balance: %1$",
        "sotiennguoikhac": "%1's current balance: %2$"
    }
}

module.exports.run = async function({ api, event, args, Currencies, getText }) {
    try {
        const { threadID, messageID, senderID, mentions } = event;

        if (!args[0]) {
            const money = (await Currencies.getData(senderID)).money;
            const b = money.toLocaleString();
            return api.sendMessage(getText("sotienbanthan", b), threadID, messageID);
        } else if (Object.keys(event.mentions).length == 1) {
            const mention = Object.keys(mentions)[0];
            let money = (await Currencies.getData(mention)).money;
            const b = money.toLocaleString();
            if (!b) money = 0;
            return api.sendMessage({
                body: getText("sotiennguoikhac", mentions[mention].replace(/\@/g, ""), b),
                mentions: [{
                    tag: mentions[mention].replace(/\@/g, ""),
                    id: mention
                }]
            }, threadID, messageID);
        } else {
            return api.sendMessage(`⚠️ Lệnh không hợp lệ. Sử dụng: ${this.config.usages}`, threadID, messageID);
        }
    } catch (e) {
        console.log(e);
        return api.sendMessage("❌ Đã xảy ra lỗi trong quá trình xử lý lệnh. Vui lòng thử lại.", threadID, messageID);
    }
}
