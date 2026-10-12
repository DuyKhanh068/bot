module.exports.config = {
    name: "rent",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "DK",
    description: "Thuê bot",
    commandCategory: "Admin",
    usages: "[]",
    cooldowns: 5,
    dependencies: "",
};
const moment = require('moment');
const fs = require('fs-extra');
const filePath = './modules/data/thuebot.json';
let rentKey = "./modules/data/RentKey.json"
if (!fs.existsSync(rentKey)) fs.writeFileSync(rentKey, '{ "used_keys": [], "unUsed_keys": [] }', 'utf8');
let dataRent;
module.exports.run = async function ({ api, Users, Threads, event, args }) {
    dataRent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (args[0] === 'add') {
        const timeDay = parseInt(args[1], 10) || 30;
        let uid = event.type === "message_reply" ? event.messageReply.senderID : Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : event.senderID;

        const findT = dataRent?.find(item => item.t_id === event.threadID);
        if (!findT) {
            const today = moment().format('DD/MM/YYYY');
            const endDate = toDate(timeDay, today);
            const newData = {
                t_id: event.threadID,
                id: uid,
                time_start: today,
                time_end: endDate
            };
            dataRent.push(newData);
            save();
            api.sendMessage(`Đã thêm thuê bot cho nhóm ${event.threadID} từ ngày ${today} đến ngày ${endDate}`, event.threadID);
        } else {
            const end = moment(findT.time_end, 'D/M/YYYY');
            const newEndDate = toDate(timeDay, end.format('DD/MM/YYYY'));
            if (moment(newEndDate, 'DD/MM/YYYY').isBefore(moment(findT.time_start, 'DD/MM/YYYY'))) {
                return api.sendMessage(`Ngày kết thúc không thể trước ngày bắt đầu (${findT.time_start}).`, event.threadID);
            }
            findT.time_end = newEndDate;
            save();
            api.sendMessage(`Nhóm ${event.threadID} đã thuê trước đó. Thời gian thuê mới kéo dài đến ${newEndDate}.`, event.threadID);
        }
    } else if (args[0] === 'del') {
        const index = dataRent.findIndex(item => item.t_id === event.threadID);
        if (index !== -1) {
            dataRent.splice(index, 1);
            save();
            api.sendMessage(`Đã xóa thông tin thuê bot cho nhóm ${event.threadID}.`, event.threadID);
        } else {
            api.sendMessage(`Không tìm thấy thông tin thuê bot cho nhóm ${event.threadID}.`, event.threadID);
        }
    } else if (args[0] === "list") {
        try {
            const e = Math.min((((parseInt(args[1], 10) || 1) - 1) * 10) + 10, dataRent.length);
            const threadInfo = await Threads.getData(event.threadID);
            const vip = threadInfo.threadInfo;
            const mes = await Promise.all(
                dataRent
                    .slice(((parseInt(args[1], 10) || 1) - 1) * 10, e)
                    .map(async (f, i) => {
                        const userName = await Users.getNameUser(f.id) || 'Unknown User';
                        return `${((parseInt(args[1], 10) || 1) - 1) * 10 + i + 1}. ${userName}\n` +
                            `📝 Tình trạng: ${moment(f.time_end, 'DD/MM/YYYY').isAfter(moment()) ? 'Chưa Hết Hạn ✅' : 'Đã Hết Hạn ❎'}\n` +
                            `🌾 Nhóm: ${vip.threadName}\n` +
                            `Từ: ${f.time_start}\n` +
                            `Đến: ${f.time_end}\n`;
                    })
            );

            api.sendMessage(`[Danh Sách Thuê Bot ${parseInt(args[1], 10) || 1}/${Math.ceil(dataRent.length / 10)}]\n\n${mes}\n\n` +
                `→ Reply (phản hồi) theo stt để xem chi tiết\n` +
                `→ Reply del + stt để xóa khỏi danh sách\n` +
                `→ Reply out + stt để thoát nhóm (cách nhau để chọn nhiều số)\n` +
                `→ Reply giahan + stt để gia hạn\n` +
                `Ví dụ: 12/12/2023 => 1/1/2024\n` +
                `→ Reply page + stt để xem các nhóm khác\n` +
                `Ví dụ: page 2`, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        data: dataRent,
                        num: e,
                        messageID: info.messageID,
                        author: event.senderID
                    });
                });
        } catch (e) {
            console.log(e);
        }
    } else if (args[0] == 'reg') {
        let r = fs.readFileSync(rentKey, 'utf-8');
        let j = r ? JSON.parse(r) : {};
        if (!j.used_keys) j.used_keys = [];
        if (!j.unUsed_keys) j.unUsed_keys = [];
        const day = parseInt(args[1]) || 30;
        function randomKey(day) {
            const prefix = global.config.keyRent || "Vtuan" // sửa ở config.json nhé
            const suffix = Math.random().toString(36).substring(2, 9);
            return prefix + '_' + day + '_' + suffix;
        }

        let key = randomKey(day);
        while (j.used_keys.includes(key)) {
            key = randomKey(day);
        }

        j.unUsed_keys.push(key);
        fs.writeFileSync(rentKey, JSON.stringify(j, null, 4), 'utf-8');
        api.sendMessage(`${key}`, event.threadID);
    } else if (args[0] == "info") {
        try {
            const threadInfo = await Threads.getData(event.threadID);
            const { threadName, participantIDs } = threadInfo.threadInfo;
            const totalMembers = participantIDs.length;

            const rentInfo = dataRent.find(item => item.t_id === event.threadID);
            let rentStatus = rentInfo ?
                `📝 Thuê bot từ: ${rentInfo.time_start} đến: ${rentInfo.time_end}\n` +
                `Tình trạng: ${moment(rentInfo.time_end, 'DD/MM/YYYY').isAfter(moment()) ? 'Chưa Hết Hạn ✅' : 'Đã Hết Hạn ❎'}`
                : 'Nhóm này chưa thuê bot.';
            api.sendMessage(
                `Thông tin nhóm:\n` +
                `🌾 Tên nhóm: ${threadName || 'Không tên'}\n` +
                `👥 Số thành viên: ${totalMembers}\n\n` +
                `Thông tin thuê bot:\n${rentStatus}`,
                event.threadID
            );
        } catch (error) {
            api.sendMessage(`Đã xảy ra lỗi khi lấy thông tin nhóm: ${error.message}`, event.threadID);
        }
    } else {
        api.sendMessage(
            `Cách sử dụng lệnh:\n\n` +
            `1. rent add [số ngày] - Thêm hoặc gia hạn thuê bot cho nhóm hiện tại (mặc định 30 ngày).\n` +
            `2. rent del - Xóa thông tin thuê bot của nhóm hiện tại.\n` +
            `3. rent list [trang] - Hiển thị danh sách các nhóm đã thuê bot (mặc định trang 1).\n` +
            `4. rent reg [số ngày] - Tạo key thuê bot với số ngày tương ứng (mặc định 30 ngày).\n` +
            `5. rent info - Hiển thị thông tin thuê bot của nhóm hiện tại.\n\n` +
            `Ví dụ: rent add 30 - Thêm hoặc gia hạn 30 ngày thuê bot cho nhóm hiện tại.`,
            event.threadID
        );
    }
}

module.exports.handleReply = async function ({ api, event, handleReply }) {
    if (event.args[0].toLowerCase() == 'giahan') {
        let STT = event.args[1];
        if (!handleReply.data[STT - 1]) return api.sendMessage(`STT không tồn tại`, event.threadID);
        const timeDay = parseInt(event.args[2], 10) || 30;
        const findT = handleReply.data[STT - 1];
        const end = moment(findT.time_end, 'D/M/YYYY');
        const newEndDate = toDate(timeDay, end.format('DD/MM/YYYY'));
        if (moment(newEndDate, 'DD/MM/YYYY').isBefore(moment(findT.time_start, 'DD/MM/YYYY'))) {
            return api.sendMessage(`Ngày kết thúc không thể trước ngày bắt đầu (${findT.time_start}).`, event.threadID);
        }
        findT.time_end = newEndDate;
        save();
        api.sendMessage(`Nhóm ${event.threadID} thời gian thuê mới kéo dài đến ${newEndDate}.`, event.threadID);
    } else if (event.args[0].toLowerCase() === "del") {
        let STT = parseInt(event.args[1], 10);
        if (isNaN(STT) || STT < 1 || STT > handleReply.data.length) {
            return api.sendMessage('Số thứ tự không hợp lệ hoặc nằm ngoài phạm vi danh sách.', event.threadID);
        }
        const i = handleReply.data[STT - 1];
        const index = dataRent.findIndex(item => item.t_id === i.t_id && item.id === i.id);
        if (index !== -1) {
            dataRent.splice(index, 1);
            save();
            api.sendMessage(`Đã xóa thông tin thuê bot cho nhóm ${i.t_id}.`, event.threadID);
        }
    } else if (event.args[0].toLowerCase() == 'out') {
        for (let i of event.args.slice(1)) {
            await api.removeUserFromGroup(api.getCurrentUserID(), handleReply.data[i - 1].t_id);
        }
        api.sendMessage(`Đã out nhóm theo yêu cầu`, event.threadID);
    } else if (handleReply.type === 'RentKey') {
        try {
            let r = fs.readFileSync(rentKey, 'utf-8');
            let j = r ? JSON.parse(r) : {};
            if (!j.used_keys) j.used_keys = [];
            if (!j.unUsed_keys) j.unUsed_keys = [];

            const arg = event.body.trim(); // Lấy key từ tin nhắn
            const num = parseInt(arg.split('_')[1]); // Lấy số ngày từ key
            const currentDate = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

            // Kiểm tra key có tồn tại và chưa được sử dụng
            if (j.used_keys.includes(arg)) {
                return api.sendMessage(`❎ Key "${arg}" đã được sử dụng!`, event.threadID);
            } else if (!j.unUsed_keys.includes(arg)) {
                return api.sendMessage(`❎ Key "${arg}" không tồn tại!`, event.threadID);
            }

            const i = dataRent.findIndex(item => item.t_id === event.threadID);
            let endDate;
            if (i !== -1) {
                // Nếu thread đã thuê bot, cập nhật thời gian kết thúc
                const currentEndDate = moment(dataRent[i].time_end, 'DD/MM/YYYY');
                endDate = currentEndDate.add(num, 'days').format('DD/MM/YYYY');
                dataRent[i].time_end = endDate;
                api.sendMessage(`✅ Thời gian thuê bot của nhóm đã được gia hạn đến ${endDate}`, event.threadID);
            } else {
                // Nếu thread chưa thuê bot, thêm dữ liệu mới
                endDate = moment(currentDate, 'DD/MM/YYYY').add(num, 'days').format('DD/MM/YYYY');
                dataRent.push({
                    t_id: event.threadID,
                    id: event.senderID,
                    time_start: currentDate,
                    time_end: endDate
                });
                api.sendMessage(`✅ Đã thêm dữ liệu thuê bot từ ngày ${currentDate} đến ${endDate}`, event.threadID);
            }

            // Cập nhật file RentKey và chuyển key từ unused sang used
            j.unUsed_keys = j.unUsed_keys.filter(key => key !== arg);
            j.used_keys.push(arg);
            fs.writeFileSync(rentKey, JSON.stringify(j, null, 4), 'utf-8');

            // Lưu lại dữ liệu thuê bot
            save();
        } catch (error) {
            api.sendMessage(`❎ Đã xảy ra lỗi: ${error.message}`, event.threadID);
        }
    }
};

function toDate(days, s) {
    const sd = moment(s, 'DD/MM/YYYY');
    if (!sd.isValid()) {
        throw new Error('Ngày bắt đầu không hợp lệ. Hãy dùng định dạng DD/MM/YYYY');
    }
    const td = sd.add(days, 'days');
    return td.format('DD/MM/YYYY');
}
function save() { fs.writeFileSync(filePath, JSON.stringify(dataRent, null, 2)) }