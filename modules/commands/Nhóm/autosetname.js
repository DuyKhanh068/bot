
// module.exports.config = {
//     name: "autosetname",
//     version: "1.0.0",
//     hasPermssion: 1,
//     credits: "DK",
//     description: "Set tên cho thành viên mới vào!",
//     commandCategory: "Quản Trị Viên",
//     usages: "[add <name> /rm] ",
//     cooldowns: 0
// };

// const fs = require('fs-extra');

// const DT = "./modules/commands/data/autosetname.json";
// if (!fs.existsSync(DT)) fs.writeFileSync(DT, JSON.stringify([]));

// module.exports.run = async ({ api, event, args, Threads }) => {
//     const content = (args.slice(1, args.length)).join(" ");

//     let read = await fs.readFile(DT, 'utf-8');
//     let Data = read ? JSON.parse(read) : [];
//     let threadEntry = Data.find(entry => entry.threadID === event.threadID);

//     switch (args[0]) {
//         case "add": {
//             if (threadEntry) {
//                 threadEntry.nameUser = content;
//             } else {
//                 const data = {
//                     threadID: event.threadID,
//                     nameUser: content
//                 };
//                 Data.push(data);
//             }
//             await fs.writeFile(DT, JSON.stringify(Data, null, 4), 'utf-8');
//             api.sendMessage("✅ Đặt cấu hình tên thành viên mới thành công\n📝 Preview: " + content, event.threadID, event.messageID);
//             break;
//         }
//         case "rm": {
//             if (threadEntry) {
//                 Data = Data.filter(entry => entry.threadID !== event.threadID);
//                 await fs.writeFile(DT, JSON.stringify(Data, null, 4), 'utf-8');
//                 api.sendMessage("✅ Đã xóa tên tự động thành công!", event.threadID, event.messageID);
//             } else {
//                 api.sendMessage("⚠️ Nhóm chưa đặt tên tự động!", event.threadID, event.messageID);
//             }
//             break;
//         }
//         default: {
//             api.sendMessage("📝 Dùng: autosetname add + name để cấu hình biệt danh cho thành viên mới\n✏️ Dùng: autosetname rm để xóa cấu hình đặt biệt danh cho thành viên mới", event.threadID, event.messageID);
//         }
//     }
// }
// thích dùng cái nào thì dùng! muốn dùng cái này thì hủy // của lệnh bên dưới đi và thêm // vào lệnh ở bên trên!

const { join } = require("path");
const { existsSync, writeFileSync, readFileSync } = require("fs-extra");

module.exports.config = {
    "name": "autosetname",
    "version": "1.0.1",
    "hasPermssion": 1,
    "credits": "DK",
    "description": "Tự động setname cho thành viên mới",
    "commandCategory": "Nhóm",
    "usages": "[add <name> /remove] ",
    "cooldowns": 5
}

module.exports.onLoad = () => {
    const pathData = join(__dirname, "data", "autosetname.json");
    if (!existsSync(pathData)) return writeFileSync(pathData, "[]", "utf-8"); 
}

module.exports.run = async function  ({ event, api, args, permssionm, Users })  {
    const { threadID, messageID, senderID } = event;
    const pathData = join(__dirname, "data", "autosetname.json");
    const content = (args.slice(1, args.length)).join(" ");
    var dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
    var thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, nameUser: [] };
    switch (args[0]) {
        case "add": {
            if (content.length == 0) return api.sendMessage("⚠️ Phần cấu hình tên thành viên mới không được bỏ trống!", threadID, messageID);
            if (thisThread.nameUser.length > 0) return api.sendMessage("⚠️ Vui lòng xóa cấu hình tên cũ trước khi đặt tên mới!", threadID, messageID); 
            thisThread.nameUser.push(content);
            //const name = (await Users.getData(event.senderID)).name
            writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
            api.sendMessage(`✅ Đặt cấu hình tên thành viên mới thành công\n📝 Preview: ${
            content
            .replace(/{name}/g, global.data.userName.get(senderID))
            .replace(/{time}/g, require('moment-timezone')().tz('Asia/Ho_Chi_Minh').format('HH:MM:ss | DD/MM/YYYY'))
            }`, threadID, messageID);
            break;
        }
        case "rm":
        case "remove":
        case "delete": {
                if (thisThread.nameUser.length == 0) return api.sendMessage("❎ Nhóm bạn chưa đặt cấu hình tên thành viên mới!", threadID, messageID);
                thisThread.nameUser = [];
                api.sendMessage(`✅ Xóa thành công phần cấu hình tên thành viên mới`, threadID, messageID);
                break;
        }
        default: {
                return api.sendMessage(`📝 Dùng: autosetname add TVM {name} {time} để cấu hình biệt danh cho thành viên mới\n✏️ Dùng: autosetname remove để xóa cấu hình đặt biệt danh cho thành viên mới\n{name} -> get name user\n{time} -> thời gian vào nhóm`, threadID, messageID);
        }
    }
    if (!dataJson.some(item => item.threadID == threadID)) dataJson.push(thisThread);
    return writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
}