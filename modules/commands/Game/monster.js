module.exports.config = {
    name: "monster",
    version: "7.5.0",
    hasPermssion: 0,
    credits: "DK",
    description: "Leak con cak",
    commandCategory: "Game",
    usages: "[tag]",
    cooldowns: 0
};
module.exports.onLoad = function () {
    try {
        global.monster = require("./FolderGame/monster/index.js");
        global.configMonster = require("./FolderGame/monster/config.json");
    }
    catch (e) {
        console.log(e)
    }
}
module.exports.run = async function ({ api, event, args, Users }) {
    var axios = require("axios");
    try {
        var send = (msg, cb) => api.sendMessage(msg, event.threadID, cb, event.messageID);
        switch (args[0]) {
            case "create":
            case "-c":
                return await global.monster.createCharecter({ Users, api, event });
            case "info":
            case "-i":
                return await global.monster.getCharacter({ api, event });
            case "rank":
            case "-r":
                return await global.monster.getRankingInfo({ api, event });
            case "status":
                return await global.monster.getServer({ api, event });
            case "stat":
                return await global.monster.getStats({ api, event });
            case "weapon":
                return await global.monster.getWeapon({ api, event });
            case "top":
            case "-t":
                return await global.monster.getTop({ api, event });
            case "top-power":
                return await global.monster.getTopPower({ api, event });
            case "top-rank":
                return await global.monster.getTopRank({ api, event });
            case "shop":
            case "-s":
                return await api.sendMessage("[ SHOP MONSTER ]\n────────────────\n1. Mua vũ khí loại Great Sword\n2. Mua vũ khí loại Lance\n3. Mua vũ khí loại Swords'n Shields\n4. Mua vũ khí loại Dual Blades\n5. Mua vũ khí loại HBG\n6. Mua vũ khí loại LBG\n7. Mua vũ khí loại Gunlance\n8. Mua thức ăn🍗\n9. Bán quái vật💵\n10. Mua vật phẩm nâng cấp vũ khí🔨\n11. Shop Đặc biệt\nReply (phản hồi) theo stt để chọn\n12. Mua giáp và phụ kiện", event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: 'monster',
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "listItem"
                    });
                }, event.messageID);
            case "bag":
            case "-b":
                return await global.monster.myItem({ api, event });
            case "fix":
                var stream = (await axios.get(global.configMonster.fix, { responseType: 'stream' })).data;
                return api.sendMessage({ body: `Lưu ý: chỉ được sửa độ bền của vũ khí đang sử dụng\nTăng 1 độ bền cần 10$\nReply tin nhắn này cùng số độ bền cần tăng, lượng tăng không thể vượt quá độ bền của vũ khí, sử dụng tag weapon để xem thông tin vũ khí.`, attachment: stream }, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: 'monster',
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "increaseDurability"
                    });
                }, event.messageID);
            case "up-HP":
                var stream = (await axios.get(global.configMonster.fix, { responseType: 'stream' })).data;
                return api.sendMessage({ body: `Reply (phản hồi) số điểm bạn muốn tăng vào chỉ số HP`, attachment: stream }, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: 'monster',
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "increaseHp"
                    });
                }, event.messageID);
            case "up-DEF":
                var stream = (await axios.get(global.configMonster.fix, { responseType: 'stream' })).data;
                return api.sendMessage({ body: `Reply (phản hồi) số điểm bạn muốn tăng vào chỉ số DEF`, attachment: stream }, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: 'monster',
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "increaseDef"
                    });
                }, event.messageID);
            case "up-ATK":
                var stream = (await axios.get(global.configMonster.fix, { responseType: 'stream' })).data;
                return api.sendMessage({ body: `Reply (phản hồi) số điểm bạn muốn tăng vào chỉ số ATK`, attachment: stream }, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: 'monster',
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "increaseAtk"
                    });
                }, event.messageID);
            case "up-SPD":
                var stream = (await axios.get(global.configMonster.fix, { responseType: 'stream' })).data;
                return api.sendMessage({ body: `Reply (phản hồi) số điểm bạn muốn tăng vào chỉ số SPD`, attachment: stream }, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: 'monster',
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "increaseSpd"
                    });
                }, event.messageID);
            case "fight":
                return global.monster.matchRanking({ api, event });
            case "pvp":
                return global.monster.match({ api, event });
            case 'solo':
                send(`[ ----- PVP ----- ]\n────────────────\n1. xem toàn bộ phòng pvp\n2. xem phòng đã tạo\n3. tạo phòng\n\nReply (phản hồi) kèm stt muốn chọn hoặc dùng lệnh + tag để thực hiện hành động.`, (err, res) => (res.name = 'monster', res.type = 'pvp', global.client.handleReply.push(res)));
                break;
            case "location-normal":
                return await global.monster.listLocationNormal({ api, event });
            case "location-boss":
                return await global.monster.listLocationBoss({ api, event });
            case "guide":
                return await global.monster.listGuide({ api, event });
            default:
                var stream = (await axios.get(global.configMonster.monster, { responseType: 'stream' })).data;
                return api.sendMessage({ body: "[ MONSTER HUNTER ]\n────────────────\n1. create: tạo nhân vật\n2. info: xem thông số nhân vật\n3. shop: mở cửa hàng\n4. bag: mở túi đồ để trang bị và sử dụng vật phẩm\n5. fix: sửa trang bị\n6. pvp: săn quái\n7. location-normal: chọn bãi săn thường\n8. location-boss: chọn bãi săn tại hang boss\n9. status: thông tin server\n10. weapon: vũ khí đang trang bị\n12. stat: xem thiên phú nhân vật\n13. solo: Mở giao diện đấu người với người\n14. top: hiển thị top level người chơi\n15. top-power: hiển thị top lực chiến\n16. top-rank: hiển thị top rank hiện tại\n17. fight: ghép trận ngẫu nhiên, đấu rank\n18. rank: kiểm tra rank của bản thân\n19. guide: mở Hướng Dẫn Nâng Cao\n\n Nhập /monster + keyword để sử dụng", attachment: stream }, event.threadID, event.messageID);
        }
    }
    catch (e) {
        console.log(e);
    }
}
module.exports.handleReply = async function ({ api, event, Currencies, handleReply }) {
    try {
        let argus = Object.values(arguments);
        if (typeof handleReply.author == 'string' && handleReply.author != event.senderID) return;
        switch (handleReply.type) {
            case "listItem":
                return await global.monster.getItems({ api, event, type: event.body });
            case "buyItem":
                return await global.monster.buyItem({ api, event, idItem: event.body, Currencies, handleReply });
            case "setItem":
                return await global.monster.setItem({ api, event, idItem: event.body, handleReply });
            case "increaseDurability":
                return await global.monster.increaseDurability({ api, event, Currencies, handleReply });
            case "increaseHp":
                return await global.monster.increaseHp({ api, event, Currencies, handleReply });
            case "increaseDef":
                return await global.monster.increaseDef({ api, event, Currencies, handleReply });
            case "increaseAtk":
                return await global.monster.increaseAtk({ api, event, Currencies, handleReply });
            case "increaseSpd":
                return await global.monster.increaseSpd({ api, event, Currencies, handleReply });
            case "match":
                return await global.monster.match({ api, event, id: event.body });
            case "setLocationID":
                return await global.monster.setLocationID({ api, event, id: event.body, handleReply });
            case "setGuide":
                return await global.monster.setGuide({ api, event, id: event.body, handleReply });
            case 'pvp':
                global.monster.pvp(argus[0], event.senderID, {
                    1: 'list rooms',
                    2: 'info room',
                    3: 'create room',
                }[event.args[0]]);
                break;
            case 'pvp.rooms':
                global.monster.pvp.room(argus[0]);
                break;
            case 'pvp.room.info':
                global.monster.pvp.room(argus[0]);
                break;
            default:
                return;
        }
    }
    catch (e) {
        console.log(e);
    }
}
module.exports.handleReaction = function (o) {
    switch (o.handleReaction.type) {
        case 'pvp.room.info':
            global.monster.pvp.room(o, o.event.userID, {
                '👍': 'ready',
                '👎': 'leave',
            }[o.event.reaction]);
            break;
        default:
            break;
    }
}