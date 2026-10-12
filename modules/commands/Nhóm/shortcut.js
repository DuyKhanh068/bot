// const fs = require('fs');
// const path = require('path');
// const request = require('request');
// const moment = require('moment-timezone');
// module.exports.config = {
//     name: "shortcut",
//     version: "2.0.0",
//     hasPermssion: 0,
//     Rent: 1,
//     credits: "DK",
//     description: "hỏng có bít=))",
//     commandCategory: "Nhóm",
//     usages: "[ all / delete /tag / join /leave /autosend ]",
//     cooldowns: 0
// };
// const ShortFile = path.resolve(__dirname, 'data', 'shortCutData.json');
// let data_Short = {};
// if (!fs.existsSync(ShortFile)) fs.writeFileSync(ShortFile, JSON.stringify({}), 'utf-8');
// data_Short = fs.readFileSync(ShortFile, 'utf-8') ? JSON.parse(fs.readFileSync(ShortFile, 'utf-8')) : {};
// function saveData() { fs.writeFileSync(ShortFile, JSON.stringify(data_Short, null, 4), 'utf-8'); }

// module.exports.onLoad = (api) => {
//     data_Short = fs.readFileSync(ShortFile, 'utf-8') ? JSON.parse(fs.readFileSync(ShortFile, 'utf-8')) : {};
//     setInterval(() => {
//         const _c = new Date().toTimeString().split(' ')[0];
//         for (const threadID in data_Short) {
//             const autosendEntries = data_Short[threadID].filter(entry => {
//                 return entry && entry.short_type && entry.short_type.type === 'autosend';
//             });

//             autosendEntries.forEach(entry => {
//                 if (entry.sendTime === _c) {
//                     const message = entry.output || "Nội dung không xác định";
//                     const fileType = entry.file;
//                     const fileUrl = entry.url;
//                     if (entry.short_type.loai === 1) {
//                         if (fileType && fileUrl) {
//                             _send(api, threadID, message, fileType, fileUrl);
//                         } else {
//                             api.sendMessage(message, threadID, (err) => {
//                                 if (err) console.error("Lỗi gửi autosend:", err);
//                             });
//                         }
//                     } else if (entry.short_type.loai === 2) {
//                         global.data.allThreadID.forEach(id => {
//                             if (fileType && fileUrl) {
//                                 _send(api, id, message, fileType, fileUrl);
//                             } else {
//                                 api.sendMessage(message, id, (err) => {
//                                     if (err) console.error(`Lỗi gửi autosend đến nhóm ${id}:`, err);
//                                 });
//                             }
//                         });
//                     }
//                 }
//             });
//         }
//     }, 1000);
// };

// function _send(api, threadID, message, fileType, fileUrl) {
//     if (fileType && fileUrl) {
//         const filePath = __dirname + `/cache/${threadID}.${fileType}`;
//         const sendMsg = () => {
//             api.sendMessage({ body: message, attachment: fs.createReadStream(filePath) }, threadID, (err) => {
//                 if (err) {
//                     console.error(`Lỗi gửi file autosend cho nhóm ${threadID}:`, err);
//                 }
//                 fs.unlinkSync(filePath);
//             });
//         };
//         request(encodeURI(fileUrl))
//             .pipe(fs.createWriteStream(filePath))
//             .on('close', sendMsg)
//             .on('error', (err) => {
//                 console.error(`Lỗi tải file từ URL ${fileUrl}:`, err);
//             });
//     } else {
//         api.sendMessage(message, threadID, (err) => {
//             if (err) console.error(`Lỗi gửi autosend cho nhóm ${threadID}:`, err);
//         });
//     }
// }

// module.exports.events = async function ({ api, event, args, Threads, Users }) {
//     const { threadID, logMessageType, logMessageData, participantIDs, author } = event;
//     const thread_info = (await Threads.getData(threadID)).threadInfo;
//     const admins = thread_info.adminIDs.map(e => [e.id, global.data.userName.get(e.id)]);
//     const shortcuts = data_Short[threadID] || [];
//     let shortcut = null;
//     let msgBody = '';
//     if (logMessageType === 'log:subscribe' || logMessageType === 'log:unsubscribe') {
//         shortcut = shortcuts.find(item => item.short_type && item.short_type.type === (logMessageType === 'log:subscribe' ? 'join' : 'leave'));
//         if (shortcut) {
//             const replacements = {
//                 '{nameThread}': thread_info.threadName + '',
//                 '{soThanhVien}': logMessageType === 'log:subscribe' ? participantIDs.length : participantIDs.length - 1,
//                 '{time}': moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY - HH:mm:ss'),
//                 '{authorName}': await Users.getNameUser(author),
//                 '{authorId}': `https://www.facebook.com/profile.php?id=${author}`,
//                 '{qtv}': `@${admins.map(e => e[1]).join('\n@')}`
//             };

//             if (logMessageType === 'log:subscribe') {
//                 replacements['{link}'] = logMessageData.addedParticipants
//                     ? logMessageData.addedParticipants.map(e => `https://www.facebook.com/profile.php?id=${e.userFbId}`).join('\n')
//                     : '';
//                 replacements['{name}'] = logMessageData.addedParticipants
//                     ? logMessageData.addedParticipants.map(e => e.fullName).join(', ')
//                     : '';
//             } else if (logMessageType === 'log:unsubscribe') {
//                 replacements['{link}'] = `https://www.facebook.com/profile.php?id=${logMessageData.leftParticipantFbId}`;
//                 replacements['{name}'] = await Users.getNameUser(logMessageData.leftParticipantFbId);
//                 replacements['{trangThai}'] = logMessageData.leftParticipantFbId === author ? 'đã tự out khỏi nhóm' : 'đã bị kick khỏi nhóm';
//             }
//             msgBody = shortcut.output.replace(/({\w+})/g, (match) => replacements[match] || match);

//             const msg = { body: msgBody };
//             const url = shortcut.url;
//             if (url) {
//                 const send = (attachment) => api.sendMessage({ body: msg.body, attachment }, threadID, event.messageID);
//                 switch (url) {
//                     case 's':
//                         return api.sendMessage(msg.body, threadID, event.messageID);
//                     case 'rd_girl':
//                         return send(global.girl.splice(0, 1));
//                     case 'anime':
//                         return send(global.anime.splice(0, 1));
//                     default:
//                         const file = __dirname + `/cache/${event.senderID}.${shortcut.file}`;
//                         const sendMsg = () => api.sendMessage({ body: msg.body, attachment: fs.createReadStream(file) }, threadID, () => fs.unlinkSync(file), event.messageID);
//                         request(encodeURI(url)).pipe(fs.createWriteStream(file)).on('close', sendMsg);
//                 }
//             } else {
//                 api.sendMessage(msg.body, threadID, event.messageID);
//             }
//         }
//     }
// };

// module.exports.run = async function ({ api, event, args, Threads, Users }) {
//     if (args[0] == "all" || args[0] == "allin" || args[0] == "list") {
//         const shortcuts = data_Short[event.threadID] || [];
//         if (shortcuts.length === 0) return api.sendMessage("💡 Không có shortcut nào được lưu.", event.threadID);

//         let msg = '📌 Danh sách các shortcut đã lưu:\n\n';
//         for (const [index, shortcut] of shortcuts.entries()) {
//             const inputDisplay = shortcut.input
//                 ? `🔹 Input: ${shortcut.input}`
//                 : (shortcut.short_type && shortcut.short_type.type
//                     ? `🔸 Loại: ${shortcut.short_type.type}` +
//                     (shortcut.short_type.type === 'autosend' ? '' : `\n👤 Người tạo: ${await Users.getNameUser(shortcut.short_type.senderID) || 'không có'}`)
//                     : '🔸 Loại: không có');

//             const outputDisplay = shortcut.output
//                 ? `💬 Output: ${shortcut.output}`
//                 : '💬 Output: không có';

//             msg += `🐥 ${index + 1}:\n${inputDisplay}\n${outputDisplay}\n\n`;
//         }

//         msg += `🔄 Reply tin nhắn này để xóa shortcut theo thứ tự.`;

//         return api.sendMessage(msg, event.threadID, (err, info) => {
//             if (err) return console.error(err);
//             global.client.handleReply.push({
//                 name: module.exports.config.name,
//                 author: event.senderID,
//                 messageID: info.messageID,
//                 threadID: event.threadID,
//                 type: 'shortAll',
//                 shortcuts
//             });
//         });
//     }
//     else if (args[0] == "delete" || args[0] == "del") {
//         const dataThread = (await Threads.getData(event.threadID)).threadInfo;
//         if (!dataThread.adminIDs.some(item => item.id === event.senderID)) return api.sendMessage('Quyền hạn????', event.threadID, event.messageID);
//         if (!args[1]) return api.sendMessage("Vui lòng cung cấp từ khóa để xóa.", event.threadID);
//         const keyword = args[1];
//         const shortcuts = data_Short[event.threadID] || [];
//         const index = shortcuts.findIndex(shortcut => shortcut.input === keyword);
//         if (index === -1) return api.sendMessage(`Không tìm thấy shortcut với từ khóa: ${keyword}`, event.threadID);
//         shortcuts.splice(index, 1);
//         saveData();
//         api.sendMessage(`Đã xóa shortcut với từ khóa: ${keyword}`, event.threadID);
//     } if (["join", "leave", "tag"].includes(args[0])) {
//         const dataThread = args[0] !== 'tag' ? (await Threads.getData(event.threadID)).threadInfo : (await Threads.getData(event.threadID)).threadInfo;
//         const isAdmin = args[0] === 'tag' || dataThread.adminIDs.some(item => item.id === event.senderID);
//         const es = data_Short[event.threadID]?.find(shortcut => shortcut.short_type?.type === args[0] && (args[0] === 'tag' ? shortcut.short_type.senderID === event.senderID : true));
//         if (!isAdmin) return api.sendMessage('Quyền hạn????', event.threadID, event.messageID);
//         if (es) return api.sendMessage(`Đã có ${args[0] === 'tag' ? 'shortcut tag' : args[0]} rồi!`, event.threadID);
//         api.sendMessage(`📌 Reply tin nhắn này để nhập câu trả lời ${args[0] == 'join' ? 'khi có người vào nhóm' : args[0] == 'leave' ? 'khi có người rời nhóm' : args[0] == 'tag' ? 'khi có người tag' : 'cho tin nhắn tự động'}`, event.threadID, (err, info) => {

//             if (err) return console.error(err);
//             global.client.handleReply.push({
//                 name: module.exports.config.name,
//                 author: event.senderID,
//                 messageID: info.messageID,
//                 threadID: event.threadID,
//                 step: 2,
//                 short_type: args[0],
//                 type: 'shortAdd',
//                 data: {}
//             });
//         });
//     } else if (args[0] == 'autosend') {
//         const dataThread = (await Threads.getData(event.threadID)).threadInfo;
//         if (!dataThread.adminIDs.some(item => item.id === event.senderID) && !global.config.ADMINBOT.includes(event.senderID)) return api.sendMessage('Quyền hạn????', event.threadID, event.messageID);
//         api.sendMessage(`📌 Reply tin nhắn này để thêm tin nhắn tự động`, event.threadID, (err, info) => {
//             if (err) return console.error(err);
//             global.client.handleReply.push({
//                 name: module.exports.config.name,
//                 author: event.senderID,
//                 messageID: info.messageID,
//                 threadID: event.threadID,
//                 short_type: args[0],
//                 type: 'autosend',
//                 data: {},
//                 step: 1
//             });
//         });
//     }
//     else {
//         api.sendMessage(`📌 Reply tin nhắn này để nhập từ khóa cho shortcut`, event.threadID, (err, info) => {
//             if (err) return console.error(err);
//             global.client.handleReply.push({
//                 name: module.exports.config.name,
//                 author: event.senderID,
//                 messageID: info.messageID,
//                 threadID: event.threadID,
//                 step: 1,
//                 type: 'shortAdd',
//                 data: {}
//             });
//         });
//     }
// }

// module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads }) {
//     if (event.senderID !== handleReply.author) return;
//     if (handleReply.type == "shortAdd") {
//         let data = handleReply.data;
//         switch (handleReply.step) {
//             case 1:
//                 if (event.body.length == 0) return api.sendMessage("❎ Câu trả lời không được để trống", event.threadID, event.messageID);
//                 const shortcuts = data_Short[event.threadID] || [];
//                 const index = shortcuts.findIndex(shortcut => shortcut.input === event.body.trim());
//                 if (index !== -1) return api.sendMessage(`❎ Trùng từ khóa`, event.threadID, event.messageID);
//                 api.unsendMessage(handleReply.messageID);
//                 data.input = event.body.trim();
//                 api.sendMessage(`📌 Reply tin nhắn này để nhập câu trả lời khi sử dụng từ khóa`, event.threadID, (err, info) => {
//                     if (err) return console.error(err);
//                     global.client.handleReply.push({
//                         name: module.exports.config.name,
//                         author: event.senderID,
//                         messageID: info.messageID,
//                         data: data,
//                         type: 'shortAdd',
//                         step: 2
//                     });
//                 });
//                 break;
//             case 2:
//                 if (event.body.length == 0) return api.sendMessage("❎ Câu trả lời không được để trống", event.threadID, event.messageID);
//                 if (handleReply.short_type) data.short_type = { type: handleReply.short_type, senderID: handleReply.author }
//                 data.output = event.body.trim();
//                 api.sendMessage(`📌 Reply tin nhắn này bằng tệp video/ảnh/mp3/gif hoặc nếu không cần bạn có thể reply tin nhắn này và nhập 's' hoặc muốn random video theo data api có sẵn thì nhập 'random gái' hoặc 'random anime`, event.threadID, (err, info) => {
//                     if (err) return console.error(err);
//                     global.client.handleReply.push({
//                         name: module.exports.config.name,
//                         author: event.senderID,
//                         messageID: info.messageID,
//                         data: data,
//                         type: 'shortAdd',
//                         step: 3,
//                     });
//                 });
//                 break;
//             case 3:
//                 let media;
//                 if (event.attachments.length > 0 && ['photo', 'audio', 'video', 'animated_image'].includes(event.attachments[0].type)) media = event.attachments[0].type === 'photo' ? 'ảnh' : event.attachments[0].type === 'audio' ? 'âm thanh' : event.attachments[0].type === 'video' ? 'video' : 'gif', data.file = event.attachments[0].type === 'photo' ? 'jpg' : event.attachments[0].type === 'audio' ? 'mp3' : event.attachments[0].type === 'video' ? 'mp4' : 'gif', data.url = event.attachments[0].url;
//                 else if (['random girl', 'random gái'].includes(event.body.toLowerCase())) data.url = 'rd_girl', media = 'random girl'
//                 else if (event.body.toLowerCase() === 'random anime') data.url = 'anime', media = 'random anime'
//                 else media = 'Không có type', data.url = 's';
//                 api.unsendMessage(handleReply.messageID);
//                 if (!data_Short[event.threadID]) data_Short[event.threadID] = [];
//                 data_Short[event.threadID].push(handleReply.data);
//                 saveData();
//                 api.sendMessage(`📝 Đã thêm thành công shortcut mới, dưới đây là phần tổng quát: \n\n - Input: ${handleReply.data.input}\n - Type: ${media || 'text'}\n - Output: ${handleReply.data.output}`, event.threadID);
//                 break;
//             default:
//                 break;
//         }
//     } else if (handleReply.type == "shortAll") {
//         const dataThread = (await Threads.getData(event.threadID)).threadInfo;
//         if (!dataThread.adminIDs.some(item => item.id === event.senderID)) return api.sendMessage('Quyền hạn????', event.threadID, event.messageID);
//         const shortcuts = data_Short[event.threadID] || [];
//         const indices = event.body.split(' ').map(num => parseInt(num) - 1);
//         const invalidIndices = indices.filter(index => isNaN(index) || index < 0 || index >= shortcuts.length);
//         if (invalidIndices.length > 0)
//             return api.sendMessage("Một hoặc nhiều số thứ tự không hợp lệ.", event.threadID, event.messageID);
//         indices.sort((a, b) => b - a);
//         for (let i = 0; i < indices.length; i++) {
//             shortcuts.splice(indices[i], 1);
//         }
//         saveData();
//         api.sendMessage(`Đã xóa các shortcut với số thứ tự: ${indices.map(index => index + 1).join(', ')}`, event.threadID, event.messageID);
//     }
//     else if (handleReply.type == "autosend") {
//         let data = handleReply.data;
//         switch (handleReply.step) {
//             case 1:
//                 data.output = event.body.trim();
//                 api.sendMessage(`📌 Bạn muốn áp dụng autosend cho:\n1. Nhóm này\n2. Tất cả các nhóm\nReply tin nhắn này với lựa chọn 1 hoặc 2.`, event.threadID, (err, info) => {
//                     if (err) return console.error(err);
//                     global.client.handleReply.push({
//                         name: module.exports.config.name,
//                         author: event.senderID,
//                         messageID: info.messageID,
//                         data: data,
//                         type: 'autosend',
//                         step: 2
//                     });
//                 });
//                 break;

//             case 2:
//                 const dataThread = (await Threads.getData(event.threadID)).threadInfo;
//                 const isAdmin = dataThread.adminIDs.some(item => item.id === event.senderID) || global.config.ADMINBOT.includes(event.senderID);
//                 if (!isAdmin && event.body === '2') return api.sendMessage("❎ Bạn không có quyền áp dụng autosend cho tất cả các nhóm.", event.threadID, event.messageID);
//                 if (!['1', '2'].includes(event.body)) return api.sendMessage("❎ Lựa chọn không hợp lệ, vui lòng chọn 1 hoặc 2.", event.threadID, event.messageID);
//                 data.short_type = {
//                     type: "autosend",
//                     loai: event.body == '1' ? 1 : 2
//                 };

//                 api.sendMessage(`📌 Reply tin nhắn này để nhập giờ gửi autosend với định dạng 'aa:bb:cc' (giờ phút giây)`, event.threadID, (err, info) => {
//                     if (err) return console.error(err);
//                     global.client.handleReply.push({
//                         name: module.exports.config.name,
//                         author: event.senderID,
//                         messageID: info.messageID,
//                         data: data,
//                         type: 'autosend',
//                         step: 3
//                     });
//                 });
//                 break;

//             case 3:
//                 const timePattern = /^(\d{2}):(\d{2}):(\d{2})$/;
//                 if (!timePattern.test(event.body.trim())) {
//                     return api.sendMessage("❎ Định dạng giờ không hợp lệ, vui lòng nhập theo định dạng 'aa:bb:cc' (giờ phút giây)", event.threadID, event.messageID);
//                 }
//                 data.sendTime = event.body.trim();
//                 let isDuplicate = false;
//                 for (const threadID in data_Short) {
//                     const autosendEntries = data_Short[threadID].filter(entry => entry.short_type?.type === 'autosend');

//                     autosendEntries.forEach(entry => {
//                         if (entry.sendTime === data.sendTime && entry.short_type.loai === data.short_type.loai) {
//                             isDuplicate = true;
//                         }
//                     });
//                 }

//                 if (isDuplicate) {
//                     return api.sendMessage(`⚠️ Cảnh báo: Thời gian gửi ${data.sendTime} đã tồn tại cho loại ${data.short_type.loai}.`, event.threadID, event.messageID);
//                 }

//                 api.sendMessage(`📌 Reply tin nhắn này để gửi nội dung autosend hoặc tệp đính kèm (ảnh/video/mp3/gif)`, event.threadID, (err, info) => {
//                     if (err) return console.error(err);
//                     global.client.handleReply.push({
//                         name: module.exports.config.name,
//                         author: event.senderID,
//                         messageID: info.messageID,
//                         data: data,
//                         type: 'autosend',
//                         step: 4
//                     });
//                 });
//                 break;

//             case 4:
//                 let media;
//                 if (event.attachments.length > 0 && ['photo', 'audio', 'video', 'animated_image'].includes(event.attachments[0].type)) {
//                     media = event.attachments[0].type === 'photo' ? 'ảnh' : event.attachments[0].type === 'audio' ? 'âm thanh' : event.attachments[0].type === 'video' ? 'video' : 'gif';
//                     data.file = event.attachments[0].type === 'photo' ? 'jpg' : event.attachments[0].type === 'audio' ? 'mp3' : event.attachments[0].type === 'video' ? 'mp4' : 'gif';
//                     data.url = event.attachments[0].url;
//                 } else {
//                     media = 'text';
//                     data.url = event.body.trim();
//                 }

//                 api.unsendMessage(handleReply.messageID);
//                 if (!data_Short[event.threadID]) data_Short[event.threadID] = [];
//                 data_Short[event.threadID].push(data);
//                 if (data.isGlobal) {
//                     Object.keys(data_Short).forEach(threadID => {
//                         if (!data_Short[threadID]) data_Short[threadID] = [];
//                         data_Short[threadID].push(data);
//                     });
//                 }

//                 saveData();
//                 api.sendMessage(`📝 Đã thêm thành công autosend mới, chi tiết:\n- Loại: ${data.short_type.loai == 1 ? 'Nhóm này' : 'Tất cả các nhóm'}\n- Thời gian: ${data.sendTime}\n- Type: ${media}\n- Output: ${data.output || 'Không có'}`, event.threadID);
//                 break;

//             default:
//                 break;
//         }
//     }
// };

// module.exports.handleEvent = async function ({ api, event, Threads, Users }) {
//     if (!data_Short[event.threadID] || (api.getCurrentUserID() === event.senderID && !event.body) || !event.mentions) return;
//     const tagItem = Object.keys(event.mentions).length > 0 ? data_Short[event.threadID].find(item => item.short_type?.type === 'tag' && event.mentions[item.short_type.senderID]) : null;
//     const inputItem = data_Short[event.threadID]?.find(item => item.input === event.body);
//     let msg = tagItem ? tagItem.output : (inputItem ? inputItem.output : '');
//     let url = tagItem ? tagItem.url : (inputItem ? inputItem.url : '');
//     if (msg) {
//         const name = await Users.getNameUser(event.senderID) || 'người dùng facebook';
//         const time = new Date().toLocaleTimeString();
//         msg = msg.replace(/\{name\}/g, name).replace(/\{time\}/g, time);
//         if (url) {
//             if (url == 's') api.sendMessage(msg, event.threadID, event.messageID);
//             else if (url === 'rd_girl') api.sendMessage({ body: msg, attachment: global.girl.splice(0, 1) }, event.threadID, event.messageID);
//             else if (url === 'anime') api.sendMessage({ body: msg, attachment: global.anime.splice(0, 1) }, event.threadID, event.messageID);
//             else {
//                 let file = tagItem ? tagItem.file : (inputItem ? inputItem.file : '');
//                 const cacheFilePath = __dirname + `/cache/${event.senderID}.${file}`
//                 const c = () => {
//                     api.sendMessage({
//                         body: msg,
//                         attachment: fs.createReadStream(cacheFilePath)
//                     }, event.threadID, () => { fs.unlinkSync(cacheFilePath) }, event.messageID);
//                 };
//                 request(encodeURI(url)).pipe(fs.createWriteStream(cacheFilePath)).on('close', c);
//             }
//         } else {
//             api.sendMessage(msg, event.threadID, event.messageID);
//         }
//     }
// };

const fs = require('fs');
const path = require('path');
const request = require('request');
const moment = require('moment-timezone');
module.exports.config = {
    name: "shortcut",
    version: "2.0.0",
    hasPermssion: 0,
    Rent: 1,
    credits: "DK",
    description: "hỏng có bít=))",
    commandCategory: "Nhóm",
    usages: "[ all / delete /tag / join /leave /autosend ]",
    cooldowns: 0
};
const ShortFile = path.resolve(__dirname, 'data', 'shortCutData.json');
let data_Short = {};
if (!fs.existsSync(ShortFile)) fs.writeFileSync(ShortFile, JSON.stringify({}), 'utf-8');
data_Short = fs.readFileSync(ShortFile, 'utf-8') ? JSON.parse(fs.readFileSync(ShortFile, 'utf-8')) : {};
function saveData() { fs.writeFileSync(ShortFile, JSON.stringify(data_Short, null, 4), 'utf-8'); }

module.exports.onLoad = (api) => {
    data_Short = fs.readFileSync(ShortFile, 'utf-8') ? JSON.parse(fs.readFileSync(ShortFile, 'utf-8')) : {};
    setInterval(() => {
        const _c = new Date().toTimeString().split(' ')[0];
        for (const threadID in data_Short) {
            const autosendEntries = data_Short[threadID].filter(entry => {
                return entry && entry.short_type && entry.short_type.type === 'autosend';
            });

            autosendEntries.forEach(entry => {
                if (entry.sendTime === _c) {
                    const message = entry.output || "Nội dung không xác định";
                    const fileType = entry.file;
                    const fileUrl = entry.url;
                    if (entry.short_type.loai === 1) {
                        if (fileType && fileUrl) {
                            _send(api, threadID, message, fileType, fileUrl);
                        } else {
                            api.sendMessage(message, threadID, (err) => {
                                if (err) console.error("Lỗi gửi autosend:", err);
                            });
                        }
                    } else if (entry.short_type.loai === 2) {
                        global.data.allThreadID.forEach(id => {
                            if (fileType && fileUrl) {
                                _send(api, id, message, fileType, fileUrl);
                            } else {
                                api.sendMessage(message, id, (err) => {
                                    if (err) console.error(`Lỗi gửi autosend đến nhóm ${id}:`, err);
                                });
                            }
                        });
                    }
                }
            });
        }
    }, 1000);
};

function _send(api, threadID, message, fileType, fileUrl) {
    if (fileType && fileUrl) {
        const filePath = __dirname + `/cache/${threadID}.${fileType}`;
        const sendMsg = () => {
            api.sendMessage({ body: message, attachment: fs.createReadStream(filePath) }, threadID, (err) => {
                if (err) {
                    console.error(`Lỗi gửi file autosend cho nhóm ${threadID}:`, err);
                }
                fs.unlinkSync(filePath);
            });
        };
        request(encodeURI(fileUrl))
            .pipe(fs.createWriteStream(filePath))
            .on('close', sendMsg)
            .on('error', (err) => {
                console.error(`Lỗi tải file từ URL ${fileUrl}:`, err);
            });
    } else {
        api.sendMessage(message, threadID, (err) => {
            if (err) console.error(`Lỗi gửi autosend cho nhóm ${threadID}:`, err);
        });
    }
}

module.exports.events = async function ({ api, event, args, Threads, Users }) {
    const { threadID, logMessageType, logMessageData, participantIDs, author } = event;
    const thread_info = (await Threads.getData(threadID)).threadInfo;
    const admins = thread_info?.adminIDs.map(e => [e.id, global.data.userName.get(e.id)]);
    const shortcuts = data_Short[threadID] || [];
    let shortcut = null;
    let msgBody = '';
    if (logMessageType === 'log:subscribe' || logMessageType === 'log:unsubscribe') {
        shortcut = shortcuts.find(item => item.short_type && item.short_type.type === (logMessageType === 'log:subscribe' ? 'join' : 'leave'));
        if (shortcut) {
            const replacements = {
                '{nameThread}': thread_info.threadName + '',
                '{soThanhVien}': logMessageType === 'log:subscribe' ? participantIDs.length : participantIDs.length - 1,
                '{time}': moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY - HH:mm:ss'),
                '{authorName}': await Users.getNameUser(author),
                '{authorId}': `https://www.facebook.com/profile.php?id=${author}`,
                '{qtv}': `@${admins.map(e => e[1]).join('\n@')}`
            };

            if (logMessageType === 'log:subscribe') {
                replacements['{link}'] = logMessageData.addedParticipants
                    ? logMessageData.addedParticipants.map(e => `https://www.facebook.com/profile.php?id=${e.userFbId}`).join('\n')
                    : '';
                replacements['{name}'] = logMessageData.addedParticipants
                    ? logMessageData.addedParticipants.map(e => e.fullName).join(', ')
                    : '';
            } else if (logMessageType === 'log:unsubscribe') {
                replacements['{link}'] = `https://www.facebook.com/profile.php?id=${logMessageData.leftParticipantFbId}`;
                replacements['{name}'] = await Users.getNameUser(logMessageData.leftParticipantFbId);
                replacements['{trangThai}'] = logMessageData.leftParticipantFbId === author ? 'đã tự out khỏi nhóm' : 'đã bị kick khỏi nhóm';
            }
            msgBody = shortcut.output.replace(/({\w+})/g, (match) => replacements[match] || match);

            const msg = { body: msgBody };
            const url = shortcut.url;
            if (url) {
                const send = (attachment) => api.sendMessage({ body: msg.body, attachment }, threadID, event.messageID);
                switch (url) {
                    case 's':
                        return api.sendMessage(msg.body, threadID, event.messageID);
                    case 'rd_girl':
                        return send(global.girl.splice(0, 1));
                    case 'anime':
                        return send(global.anime.splice(0, 1));
                    default:
                        const file = __dirname + `/cache/${event.senderID}.${shortcut.file}`;
                        const sendMsg = () => api.sendMessage({ body: msg.body, attachment: fs.createReadStream(file) }, threadID, () => fs.unlinkSync(file), event.messageID);
                        request(encodeURI(url)).pipe(fs.createWriteStream(file)).on('close', sendMsg);
                }
            } else {
                api.sendMessage(msg.body, threadID, event.messageID);
            }
        }
    }
};

module.exports.run = async function ({ api, event, args, Threads, Users }) {
    if (args[0] == "all" || args[0] == "allin" || args[0] == "list") {
        const shortcuts = data_Short[event.threadID] || [];
        if (shortcuts.length === 0) return api.sendMessage("💡 Không có shortcut nào được lưu.", event.threadID);

        let msg = '📌 Danh sách các shortcut đã lưu:\n\n';
        for (const [index, shortcut] of shortcuts.entries()) {
            const inputDisplay = shortcut.input
                ? `🔹 Input: ${shortcut.input}`
                : (shortcut.short_type && shortcut.short_type.type
                    ? `🔸 Loại: ${shortcut.short_type.type}` +
                    (shortcut.short_type.type === 'autosend' ? '' : `\n👤 Người tạo: ${await Users.getNameUser(shortcut.short_type.senderID) || 'không có'}`)
                    : '🔸 Loại: không có');

            const outputDisplay = shortcut.output
                ? `💬 Output: ${shortcut.output}`
                : '💬 Output: không có';

            msg += `🐥 ${index + 1}:\n${inputDisplay}\n${outputDisplay}\n\n`;
        }

        msg += `🔄 Reply tin nhắn này để xóa shortcut theo thứ tự.`;

        return api.sendMessage(msg, event.threadID, (err, info) => {
            if (err) return console.error(err);
            global.client.handleReply.push({
                name: module.exports.config.name,
                author: event.senderID,
                messageID: info.messageID,
                threadID: event.threadID,
                type: 'shortAll',
                shortcuts
            });
        });
    }
    else if (args[0] == "delete" || args[0] == "del") {
        const dataThread = (await Threads.getData(event.threadID)).threadInfo;
        if (!dataThread.adminIDs.some(item => item.id === event.senderID)) return api.sendMessage('Quyền hạn????', event.threadID, event.messageID);
        if (!args[1]) return api.sendMessage("Vui lòng cung cấp từ khóa để xóa.", event.threadID);
        const keyword = args[1];
        const shortcuts = data_Short[event.threadID] || [];
        const index = shortcuts.findIndex(shortcut => shortcut.input === keyword);
        if (index === -1) return api.sendMessage(`Không tìm thấy shortcut với từ khóa: ${keyword}`, event.threadID);
        shortcuts.splice(index, 1);
        saveData();
        api.sendMessage(`Đã xóa shortcut với từ khóa: ${keyword}`, event.threadID);
    } if (["join", "leave", "tag"].includes(args[0])) {
        const dataThread = args[0] !== 'tag' ? (await Threads.getData(event.threadID)).threadInfo : (await Threads.getData(event.threadID)).threadInfo;
        const isAdmin = args[0] === 'tag' || dataThread.adminIDs.some(item => item.id === event.senderID);
        const es = data_Short[event.threadID]?.find(shortcut => shortcut.short_type?.type === args[0] && (args[0] === 'tag' ? shortcut.short_type.senderID === event.senderID : true));
        if (!isAdmin) return api.sendMessage('Quyền hạn????', event.threadID, event.messageID);
        if (es) return api.sendMessage(`Đã có ${args[0] === 'tag' ? 'shortcut tag' : args[0]} rồi!`, event.threadID);
        api.sendMessage(`📌 Reply tin nhắn này để nhập câu trả lời ${args[0] == 'join' ? 'khi có người vào nhóm' : args[0] == 'leave' ? 'khi có người rời nhóm' : args[0] == 'tag' ? 'khi có người tag' : 'cho tin nhắn tự động'}`, event.threadID, (err, info) => {

            if (err) return console.error(err);
            global.client.handleReply.push({
                name: module.exports.config.name,
                author: event.senderID,
                messageID: info.messageID,
                threadID: event.threadID,
                step: 2,
                short_type: args[0],
                type: 'shortAdd',
                data: {}
            });
        });
    } else if (args[0] == 'autosend') {
        const dataThread = (await Threads.getData(event.threadID)).threadInfo;
        if (!dataThread.adminIDs.some(item => item.id === event.senderID) && !global.config.ADMINBOT.includes(event.senderID)) return api.sendMessage('Quyền hạn????', event.threadID, event.messageID);
        api.sendMessage(`📌 Reply tin nhắn này để thêm tin nhắn tự động`, event.threadID, (err, info) => {
            if (err) return console.error(err);
            global.client.handleReply.push({
                name: module.exports.config.name,
                author: event.senderID,
                messageID: info.messageID,
                threadID: event.threadID,
                short_type: args[0],
                type: 'autosend',
                data: {},
                step: 1
            });
        });
    }
    else {
        api.sendMessage(`📌 Reply tin nhắn này để nhập từ khóa cho shortcut`, event.threadID, (err, info) => {
            if (err) return console.error(err);
            global.client.handleReply.push({
                name: module.exports.config.name,
                author: event.senderID,
                messageID: info.messageID,
                threadID: event.threadID,
                step: 1,
                type: 'shortAdd',
                data: {}
            });
        });
    }
}

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads }) {
    if (handleReply.messageID) {
        api.unsendMessage(handleReply.messageID);
    } 
    if (event.senderID !== handleReply.author) return;
    if (handleReply.type == "shortAdd") {44
        let data = handleReply.data;
        switch (handleReply.step) {
            case 1:
                if (event.body.length == 0) return api.sendMessage("❎ Câu trả lời không được để trống", event.threadID, event.messageID);
                const shortcuts = data_Short[event.threadID] || [];
                const index = shortcuts.findIndex(shortcut => shortcut.input === event.body.trim());
                if (index !== -1) return api.sendMessage(`❎ Trùng từ khóa`, event.threadID, event.messageID);
                api.unsendMessage(handleReply.messageID);
                data.input = event.body.trim();
                api.sendMessage(`📌 Reply tin nhắn này để nhập câu trả lời khi sử dụng từ khóa`, event.threadID, (err, info) => {
                    if (err) return console.error(err);
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        author: event.senderID,
                        messageID: info.messageID,
                        data: data,
                        type: 'shortAdd',
                        step: 2
                    });
                });
                Rr4break;
            case 2:
                if (event.body.length == 0) return api.sendMessage("❎ Câu trả lời không được để trống", event.threadID, event.messageID);
                if (handleReply.short_type) data.short_type = { type: handleReply.short_type, senderID: handleReply.author }
                data.output = event.body.trim();
                api.sendMessage(`📌 Reply tin nhắn này bằng tệp video/ảnh/mp3/gif hoặc nếu không cần bạn có thể reply tin nhắn này và nhập 's' hoặc muốn random video theo data api có sẵn thì nhập 'random gái' hoặc 'random anime`, event.threadID, (err, info) => {
                    if (err) return console.error(err);
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        author: event.senderID,
                        messageID: info.messageID,
                        data: data,
                        type: 'shortAdd',
                        step: 3,
                    });
                });
                break;
            case 3:
                let media;
                if (event.attachments.length > 0 && ['photo', 'audio', 'video', 'animated_image'].includes(event.attachments[0].type)) media = event.attachments[0].type === 'photo' ? 'ảnh' : event.attachments[0].type === 'audio' ? 'âm thanh' : event.attachments[0].type === 'video' ? 'video' : 'gif', data.file = event.attachments[0].type === 'photo' ? 'jpg' : event.attachments[0].type === 'audio' ? 'mp3' : event.attachments[0].type === 'video' ? 'mp4' : 'gif', data.url = event.attachments[0].url;
                else if (['random girl', 'random gái'].includes(event.body.toLowerCase())) data.url = 'rd_girl', media = 'random girl'
                else if (event.body.toLowerCase() === 'random anime') data.url = 'anime', media = 'random anime'
                else media = 'Không có type', data.url = 's';
                api.unsendMessage(handleReply.messageID);
                if (!data_Short[event.threadID]) data_Short[event.threadID] = [];
                data_Short[event.threadID].push(handleReply.data);
                saveData();
                api.sendMessage(`📝 Đã thêm thành công shortcut mới, dưới đây là phần tổng quát: \n\n - Input: ${handleReply.data.input}\n - Type: ${media || 'text'}\n - Output: ${handleReply.data.output}`, event.threadID);
                break;
            default:
                break;
        }
    } else if (handleReply.type == "shortAll") {
        const dataThread = (await Threads.getData(event.threadID)).threadInfo;
        if (!dataThread.adminIDs.some(item => item.id === event.senderID)) return api.sendMessage('Quyền hạn????', event.threadID, event.messageID);
        const shortcuts = data_Short[event.threadID] || [];
        const indices = event.body.split(' ').map(num => parseInt(num) - 1);
        const invalidIndices = indices.filter(index => isNaN(index) || index < 0 || index >= shortcuts.length);
        if (invalidIndices.length > 0)
            return api.sendMessage("Một hoặc nhiều số thứ tự không hợp lệ.", event.threadID, event.messageID);
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
            shortcuts.splice(indices[i], 1);
        }
        saveData();
        api.sendMessage(`Đã xóa các shortcut với số thứ tự: ${indices.map(index => index + 1).join(', ')}`, event.threadID, event.messageID);
    }
    else if (handleReply.type == "autosend") {
        let data = handleReply.data;
        switch (handleReply.step) {
            case 1:
                data.output = event.body.trim();
                api.sendMessage(`📌 Bạn muốn áp dụng autosend cho:\n1. Nhóm này\n2. Tất cả các nhóm\nReply tin nhắn này với lựa chọn 1 hoặc 2.`, event.threadID, (err, info) => {
                    if (err) return console.error(err);
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        author: event.senderID,
                        messageID: info.messageID,
                        data: data,
                        type: 'autosend',
                        step: 2
                    });
                });
                break;

            case 2:
                const dataThread = (await Threads.getData(event.threadID)).threadInfo;
const isBotAdmin = global.config.ADMINBOT.includes(event.senderID); // Chỉ admin bot
const isGroupAdmin = dataThread.adminIDs.some(item => item.id === event.senderID); // Admin nhóm

if (!isBotAdmin && event.body === '2') 
    return api.sendMessage("❎ Chỉ admin bot mới có quyền áp dụng autosend cho tất cả các nhóm.", event.threadID, event.messageID);

if (!['1', '2'].includes(event.body)) 
    return api.sendMessage("❎ Lựa chọn không hợp lệ, vui lòng chọn 1 hoặc 2.", event.threadID, event.messageID);

data.short_type = {
    type: "autosend",
    loai: event.body == '1' ? 1 : 2
};

api.sendMessage(`📌 Reply tin nhắn này để nhập giờ gửi autosend với định dạng 'aa:bb:cc' (giờ phút giây)`, event.threadID, (err, info) => {
    if (err) return console.error(err);
    global.client.handleReply.push({
        name: module.exports.config.name,
        author: event.senderID,
        messageID: info.messageID,
        data: data,
        type: 'autosend',
        step: 3
    });
});

                break;

            case 3:
                const timePattern = /^(\d{2}):(\d{2}):(\d{2})$/;
                if (!timePattern.test(event.body.trim())) {
                    return api.sendMessage("❎ Định dạng giờ không hợp lệ, vui lòng nhập theo định dạng 'aa:bb:cc' (giờ phút giây)", event.threadID, event.messageID);
                }
                data.sendTime = event.body.trim();
                let isDuplicate = false;
                for (const threadID in data_Short) {
                    const autosendEntries = data_Short[threadID].filter(entry => entry.short_type?.type === 'autosend');

                    autosendEntries.forEach(entry => {
                        if (entry.sendTime === data.sendTime && entry.short_type.loai === data.short_type.loai) {
                            isDuplicate = true;
                        }
                    });
                }

                if (isDuplicate) {
                    return api.sendMessage(`⚠️ Cảnh báo: Thời gian gửi ${data.sendTime} đã tồn tại cho loại ${data.short_type.loai}.`, event.threadID, event.messageID);
                }

                api.sendMessage(`📌 Reply tin nhắn này để gửi nội dung autosend hoặc tệp đính kèm (ảnh/video/mp3/gif)`, event.threadID, (err, info) => {
                    if (err) return console.error(err);
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        author: event.senderID,
                        messageID: info.messageID,
                        data: data,
                        type: 'autosend',
                        step: 4
                    });
                });
                break;

            case 4:
                let media;
                if (event.attachments.length > 0 && ['photo', 'audio', 'video', 'animated_image'].includes(event.attachments[0].type)) {
                    media = event.attachments[0].type === 'photo' ? 'ảnh' : event.attachments[0].type === 'audio' ? 'âm thanh' : event.attachments[0].type === 'video' ? 'video' : 'gif';
                    data.file = event.attachments[0].type === 'photo' ? 'jpg' : event.attachments[0].type === 'audio' ? 'mp3' : event.attachments[0].type === 'video' ? 'mp4' : 'gif';
                    data.url = event.attachments[0].url;
                } else {
                    media = 'text';
                    data.url = event.body.trim();
                }

                api.unsendMessage(handleReply.messageID);
                if (!data_Short[event.threadID]) data_Short[event.threadID] = [];
                data_Short[event.threadID].push(data);
                if (data.isGlobal) {
                    Object.keys(data_Short).forEach(threadID => {
                        if (!data_Short[threadID]) data_Short[threadID] = [];
                        data_Short[threadID].push(data);
                    });
                }

                saveData();
                api.sendMessage(`📝 Đã thêm thành công autosend mới, chi tiết:\n- Loại: ${data.short_type.loai == 1 ? 'Nhóm này' : 'Tất cả các nhóm'}\n- Thời gian: ${data.sendTime}\n- Type: ${media}\n- Output: ${data.output || 'Không có'}`, event.threadID);
                break;

            default:
                break;
        }
    }
};

module.exports.handleEvent = async function ({ api, event, Threads, Users }) {
    if (!data_Short[event.threadID] || (api.getCurrentUserID() === event.senderID && !event.body) || !event.mentions) return;
    const tagItem = Object.keys(event.mentions).length > 0 ? data_Short[event.threadID].find(item => item.short_type?.type === 'tag' && event.mentions[item.short_type.senderID]) : null;
    const inputItem = data_Short[event.threadID]?.find(item => item.input === event.body);
    let msg = tagItem ? tagItem.output : (inputItem ? inputItem.output : '');
    let url = tagItem ? tagItem.url : (inputItem ? inputItem.url : '');
    if (msg) {
        const name = await Users.getNameUser(event.senderID) || 'người dùng facebook';
        const time = new Date().toLocaleTimeString();
        msg = msg.replace(/\{name\}/g, name).replace(/\{time\}/g, time);
        if (url) {
            if (url == 's') api.sendMessage(msg, event.threadID, event.messageID);
            else if (url === 'rd_girl') api.sendMessage({ body: msg, attachment: global.girl.splice(0, 1) }, event.threadID, event.messageID);
            else if (url === 'anime') api.sendMessage({ body: msg, attachment: global.anime.splice(0, 1) }, event.threadID, event.messageID);
            else {
                let file = tagItem ? tagItem.file : (inputItem ? inputItem.file : '');
                const cacheFilePath = __dirname + `/cache/${event.senderID}.${file}`
                const c = () => {
                    api.sendMessage({
                        body: msg,
                        attachment: fs.createReadStream(cacheFilePath)
                    }, event.threadID, () => { fs.unlinkSync(cacheFilePath) }, event.messageID);
                };
                request(encodeURI(url)).pipe(fs.createWriteStream(cacheFilePath)).on('close', c);
            }
        } else {
            api.sendMessage(msg, event.threadID, event.messageID);
        }
    }
};