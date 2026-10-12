const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '..', '..', '..', 'config.json');

module.exports.config = {
    name: "admin",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "DK",
    description: "Admin Config",
    commandCategory: "Admin",
    usages: "Config",
    cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    let uidList = [];
    if (event.mentions && Object.keys(event.mentions).length > 0) uidList = Object.keys(event.mentions);
    if (event.type === "message_reply" && event.messageReply) uidList.push(event.messageReply.senderID);
    if (args.length > 1) uidList = uidList.concat(args.slice(1));

    const action = args[0];
    if (['add', 'remove', 'sp', 'rsp'].includes(action)) {
        if (!global.config.ADMINBOT.includes(event.senderID)) return api.sendMessage(`Bạn không đủ quyền hạn để sử dụng lệnh này!`, event.threadID);
        const changesCount = updateList(action, uidList);
        const actionText = action === 'add' ? 'thêm vào admin' : action === 'remove' ? 'xóa khỏi admin' : action === 'sp' ? 'thêm vào NDH' : 'gỡ khỏi NDH';
        return api.sendMessage(changesCount === 0 ? `Không có người dùng nào được ${actionText}!` : `✅ Đã ${actionText} thành công ${changesCount} người dùng.`, threadID, messageID);
    } else if (args[0] === 'list') {
        const lists = await getLists(api);
        return api.sendMessage(`SupperAdmin:\n${lists.admin.join('\n')}\n\nDanh sách admin:\n${lists.ndh.join('\n')}`, threadID, messageID);
    } if (['only', 'refresh'].includes(args[0])) {
        if (!global.config.ADMINBOT.includes(event.senderID)) return api.sendMessage(`Bạn không đủ quyền hạn để sử dụng lệnh này!`, event.threadID);
        args[0] === 'only' ? (global.config.MAINTENANCE = !global.config.MAINTENANCE, api.sendMessage(`✅ Đã ${global.config.MAINTENANCE ? 'bật' : 'tắt'} chế độ MAINTENANCE.`, threadID, messageID)) : (global.config = JSON.parse(fs.readFileSync(configPath, 'utf-8')), api.sendMessage(`✅ Đã làm mới cấu hình từ file config.json.`, threadID, messageID));
        return fs.writeFileSync(configPath, JSON.stringify(global.config, null, 4), 'utf8');
    } else {
        if (global.config.ADMINBOT.includes(event.senderID) || global.config.NDH.includes(event.senderID)) {
            api.sendMessage(`⚠️ Lệnh không hợp lệ! Hãy sử dụng một trong các lệnh sau:\n\n🔹 "add" -  Thêm admin\n🔹 "remove" - Xóa admin\n🔹 "sp" - Thêm vào NDH\n🔹 "rsp" - Gỡ khỏi NDH\n🔹 "list" - Xem danh sách\n🔹 "only" - Bật/Tắt chế độ MAINTENANCE\n🔹 "refresh" - Tải lại cấu hình
`, threadID, messageID);
        } else {
            const lists = await getLists(api);
            api.sendMessage(`SupperAdmin:\n${lists.admin.join('\n')}\n\nDanh sách admin:\n${lists.ndh.join('\n')}`, threadID, messageID);
        }
    }
}

function updateList(action, uidList) {
    let _ = 0;
    uidList = [...new Set(uidList.map(id => id.trim()).filter(id => !isNaN(id) && id !== "").map(id => id.toString()))];
    const ___ = {
        add: { list: global.config.ADMINBOT, _: uid => !global.config.ADMINBOT.includes(uid) }, remove: { list: global.config.ADMINBOT, _: uid => global.config.ADMINBOT.includes(uid) }, sp: { list: global.config.NDH, _: uid => !global.config.NDH.includes(uid) }, rsp: { list: global.config.NDH, _: uid => global.config.NDH.includes(uid) }
    };
    uidList.forEach(uid => {
        const __ = ___[action];
        if (__ && __._(uid)) {
            action === 'remove' || action === 'rsp' ? __.list.splice(__.list.indexOf(uid), 1) : __.list.push(uid);
            _++;
        }
    });
    fs.writeFileSync(configPath, JSON.stringify(global.config, null, 4), 'utf8');
    return _;
}

async function getLists(api) {
    const getNames = async (uids) => Promise.all(uids.map(async uid => {
        const $ = await api.getUserInfo(uid);
        return $[uid]?.name || "Unknown";
    }));
    const { ADMINBOT, NDH } = global.config;
    const [admin, ndh] = await Promise.all([getNames(ADMINBOT || []), getNames(NDH || [])]);
    return { admin, ndh };
}