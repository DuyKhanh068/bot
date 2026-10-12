const fs = require("fs");
const path = require('path');
const moment = require('moment-timezone');
const filePath = __dirname + "/FolderGame/taixiu/";
if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });
const data = filePath + 'data/'
if (!fs.existsSync(data)) fs.mkdirSync(data, { recursive: true });
const lichsugiaodich = data + 'lichsugiaodich/'
if (!fs.existsSync(lichsugiaodich)) fs.mkdirSync(lichsugiaodich, { recursive: true });
const betHistoryPath = data + 'betHistory/';
if (!fs.existsSync(betHistoryPath)) fs.mkdirSync(betHistoryPath, { recursive: true });
const moneyFile = filePath + 'money.json';
const phiênFile = filePath + 'phiên.json';
const fileCheck = filePath + 'file_check.json';
if (!fs.existsSync(moneyFile)) fs.writeFileSync(moneyFile, "[]", "utf-8");
if (!fs.existsSync(phiênFile)) fs.writeFileSync(phiênFile, "[]", "utf-8");
if (!fs.existsSync(fileCheck)) fs.writeFileSync(fileCheck, "[]", "utf-8");
module.exports.config = {
    name: "tx",
    version: "4.0.0",
    hasPermssion: 0,
    Rent: 2,
    credits: "DK",
    description: "no",
    commandCategory: "Game",
    usages: "[]",
    cooldowns: 0,
};
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}
function playGame() {
    const dice1 = rollDice();
    const dice2 = rollDice();
    const dice3 = rollDice();
    const total = dice1 + dice2 + dice3;
    const result = (total >= 3 && total <= 10) ? 'xỉu' : 'tài';
    return { total, result, dice1, dice2, dice3 };
}
function Number(number) {
    let strNumber = number.toString();
    let parts = strNumber.split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    let pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(integerPart)) {
        integerPart = integerPart.replace(pattern, '$1,$2');
    }
    return integerPart + decimalPart;
}
module.exports.run = async function ({ api, event, args, Users, Currencies, Threads }) {
    const { ADMINBOT } = global.config;
    const { messageReply, mentions, threadID, messageID, senderID } = event;
    const checkmn = JSON.parse(fs.readFileSync(moneyFile, "utf-8"));

    if (args[0] === 'set') {
        if (!ADMINBOT.includes(senderID)) return api.sendMessage(`⚠️ Bạn không có quyền sử dụng lệnh này!`, threadID);
        let uid;
        let input;
        const arg = args.slice(1).join(' ').split(' ');

        if (arg[0].toLowerCase() === 'me') {
            uid = senderID;
            input = parseInt(arg[1].trim());
        } else if (messageReply) {
            uid = messageReply.senderID;
            input = parseInt(args[1].trim());
        } else if (mentions && Object.keys(mentions).length > 0) {
            uid = parseInt(Object.keys(mentions)[0]);
            input = parseInt(args[args.length - 1].trim());
        } else if (!isNaN(parseInt(arg[0]))) {
            uid = parseInt(arg[0].trim());
            input = parseInt(arg[1].trim());
        } else if (arg[0].toLowerCase() === 'all') {
            input = parseInt(arg[1].trim());
            if (isNaN(input)) {
                return api.sendMessage('⚠️ Số tiền không hợp lệ!', threadID);
            }

            const participantIDs = event.participantIDs.filter(id => id !== ''); // Lọc các ID hợp lệ
            const userHistoricData = [];
            const time = Date.now();

            participantIDs.forEach(id => {
                let e = checkmn.findIndex(entry => entry.senderID == id);

                if (e !== -1) {
                    const historicInput = checkmn[e].input;
                    checkmn[e].input += input;
                    userHistoricData.push({
                        senderID: parseInt(id),
                        time: time,
                        input: input,
                        historic_input: historicInput
                    });
                } else {
                    const newEntry = {
                        senderID: parseInt(id),
                        input: input
                    };
                    checkmn.push(newEntry);
                    userHistoricData.push({
                        senderID: parseInt(id),
                        time: time,
                        input: input,
                        historic_input: 0
                    });
                }
            });

            fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
            userHistoricData.forEach(data => {
                const userHistoricFile = lichsugiaodich + `${data.senderID}.json`;
                let userHistoricEntries = [];
                if (fs.existsSync(userHistoricFile)) {
                    userHistoricEntries = JSON.parse(fs.readFileSync(userHistoricFile, "utf-8"));
                }
                userHistoricEntries.push(data);
                fs.writeFileSync(userHistoricFile, JSON.stringify(userHistoricEntries, null, 4), 'utf-8');
            });

            return api.sendMessage(`💰 Đã thêm ${Number(input).toLocaleString()} VNĐ cho tất cả thành viên!`, threadID);
        } else {
            return api.sendMessage('⚠️ Định dạng không hợp lệ! Hãy sử dụng me|số tiền, reply số tiền, tag số tiền, hoặc uid|số tiền.', threadID);
        }

        if (isNaN(input)) {
            return api.sendMessage('⚠️ Số tiền không hợp lệ!', threadID);
        }

        const userHistoricFile = lichsugiaodich + `${uid}.json`;
        let userHistoricData = [];
        if (fs.existsSync(userHistoricFile)) {
            userHistoricData = JSON.parse(fs.readFileSync(userHistoricFile, "utf-8"));
        }

        let e = checkmn.findIndex(entry => entry.senderID == uid);
        let time = Date.now();

        if (e !== -1) {
            const historicInput = checkmn[e].input;
            checkmn[e].input += input;
            userHistoricData.push({
                senderID: parseInt(uid),
                time: time,
                input: input,
                historic_input: historicInput
            });
        } else {
            const newEntry = {
                senderID: parseInt(uid),
                input: input
            };
            checkmn.push(newEntry);
            userHistoricData.push({
                senderID: parseInt(uid),
                time: time,
                input: input,
                historic_input: 0
            });
        }

        fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
        fs.writeFileSync(userHistoricFile, JSON.stringify(userHistoricData, null, 4), 'utf-8');
        const name = await Users.getNameUser(uid);
        const message = `
🌟 Successful Deposit!
--------------------------------
👤 User Name: ${name}
🔢 User ID: ${uid}
💰 Money: ${Number(input)} VNĐ
🕒 Time: ${new Date(time).toLocaleString()}
--------------------------------
🎉 Thank you for using our service!
`;
        return api.sendMessage(message, threadID);
    } else if (args[0] == 'nap' || args[0] == 'nạp') {
        let input;
        if (args[1] == 'all') {
            input = (await Currencies.getData(senderID)).money
        } else {
            input = parseInt(args[1])
        }
        if (input) {
            const tien_hien_co = (await Currencies.getData(senderID)).money
            if (tien_hien_co < input) {
                return api.sendMessage(`Bạn không có nhiều tiền như thế\nQuy đổi:\n100000VND = 10000VND ở trong game tx`, threadID)
            } else {
                const userHistoricFile = lichsugiaodich + `${senderID}.json`;
                let userHistoricData = [];
                if (fs.existsSync(userHistoricFile)) {
                    userHistoricData = JSON.parse(fs.readFileSync(userHistoricFile, "utf-8"));
                }
                await Currencies.decreaseMoney(senderID, input);
                let e = checkmn.findIndex(entry => entry.senderID == senderID);
                let time = Date.now();

                if (e !== -1) {
                    const historicInput = checkmn[e].input;
                    checkmn[e].input += Math.round(input / 10);
                    userHistoricData.push({
                        senderID: parseInt(senderID),
                        time: time,
                        input: Math.round(input / 10),
                        historic_input: historicInput
                    });
                } else {
                    const newEntry = {
                        senderID: parseInt(senderID),
                        input: Math.round(input / 10)
                    };
                    checkmn.push(newEntry);
                    userHistoricData.push({
                        senderID: parseInt(senderID),
                        time: time,
                        input: Math.round(input / 10),
                        historic_input: 0
                    });
                }

                fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
                fs.writeFileSync(userHistoricFile, JSON.stringify(userHistoricData, null, 4), 'utf-8');
                const name = await Users.getNameUser(senderID);
                const message = `
🌟 Successful Deposit!
    --------------------------------
👤 User Name: ${name}
🔢 User ID: ${senderID}
💰 Money: ${Number(Math.round(input / 10))} VNĐ
🕒 Time: ${new Date(time).toLocaleString()}
    --------------------------------
🎉 Thank you for using our service!
`;
                return api.sendMessage(message, threadID);
            }
        } else {
            api.sendMessage(`Nhập số tiền quy đổi`, threadID)
        }
    } else if (args[0] === 'rut' || args[0] === 'rút') {
        let e1 = checkmn.findIndex(entry => entry.senderID == senderID);
        if (e1 == -1) return api.sendMessage(`Bạn làm đéo gì có tiền??`, threadID, event.messageID)
        let input;
        if (args[1] == 'all') {
            input = checkmn[e1].input
        } else {
            input = parseInt(args[1])
        }
        if (input) {
            if (input == 0) return api.sendMessage(`Đã nghèo còn thích xạo ke à?`, threadID, messageID)
            if (input > checkmn[e1].input) return api.sendMessage(`Bạn không đủ tiền để rút!\nHệ quy chiếu: 1000 trong game tx = 8000!`, threadID);
            if (e1 !== -1) {
                checkmn[e1].input -= input;
                await Currencies.increaseMoney(senderID, input * 8);
                fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
                api.sendMessage(`Bạn vừa rút thành công: ${Number(input * 8)}`, threadID, event.messageID)
            }
        } else {
            api.sendMessage(`Nhập số tiền muốn rút!`, threadID, messageID)
        }
    } else if (args[0] == 'pay') {
        let uid;
        let input;
        if (messageReply) {
            uid = messageReply.senderID;
            input = parseInt(args[1].trim());
        } else if (mentions && Object.keys(mentions).length > 0) {
            uid = parseInt(Object.keys(mentions)[0]);
            input = parseInt(args[args.length - 1].trim());
        } else {
            return api.sendMessage('⚠️ Định dạng không hợp lệ! Hãy reply với số tiền hoặc tag số tiền.', threadID);
        }

        if (isNaN(input)) {
            return api.sendMessage('⚠️ Số tiền không hợp lệ!', threadID);
        }

        const userHistoricFile = lichsugiaodich + `${uid}.json`;
        let userHistoricData = [];
        if (fs.existsSync(userHistoricFile)) {
            userHistoricData = JSON.parse(fs.readFileSync(userHistoricFile, "utf-8"));
        }

        let e = checkmn.findIndex(entry => entry.senderID == senderID);
        let recipientIndex = checkmn.findIndex(entry => entry.senderID == uid);
        let time = Date.now();

        if (e !== -1 && checkmn[e].input >= input) {
            const historicInput = checkmn[e].input;
            checkmn[e].input -= input;
            userHistoricData.push({
                senderID: parseInt(senderID),
                time: time,
                input: -input,
                historic_input: historicInput
            });

            if (recipientIndex !== -1) {
                const recipientHistoricInput = checkmn[recipientIndex].input;
                checkmn[recipientIndex].input += input;
                userHistoricData.push({
                    senderID: parseInt(uid),
                    time: time,
                    input: input,
                    historic_input: recipientHistoricInput
                });
            } else {
                const newEntry = {
                    senderID: parseInt(uid),
                    input: input
                };
                checkmn.push(newEntry);
                userHistoricData.push({
                    senderID: parseInt(uid),
                    time: time,
                    input: input,
                    historic_input: 0
                });
            }

            fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
            fs.writeFileSync(userHistoricFile, JSON.stringify(userHistoricData, null, 4), 'utf-8');
            const name = await Users.getNameUser(uid);
            const message = `
🌟 Successful Payment!
    --------------------------------
👤 Sender Name: ${await Users.getNameUser(senderID)}
🔢 Sender ID: ${senderID}
👤 Recipient Name: ${name}
🔢 Recipient ID: ${uid}
💰 Money: ${Number(input)} VNĐ
🕒 Time: ${new Date(time).toLocaleString()}
    --------------------------------
🎉 Thank you for using our service!
`;
            return api.sendMessage(message, threadID);
        } else {
            return api.sendMessage('⚠️ Bạn không đủ tiền để chuyển!', threadID);
        }
    } else if (args[0] === 'check') {
        let uid;
        if (messageReply) {
            uid = messageReply.senderID;
        } else if (mentions && Object.keys(mentions).length > 0) {
            uid = parseInt(Object.keys(mentions)[0]);
        } else if (!isNaN(parseInt(args[1]))) {
            uid = parseInt(args[1].trim());
        } else {
            uid = senderID;
        }

        let e = checkmn ? checkmn.findIndex(entry => entry.senderID == uid) : -1;
        if (e === -1) return api.sendMessage('⚠️ Người dùng không có tiền trong hệ thống!', threadID);

        if (e !== -1 && checkmn && checkmn[e]) {
            const name = await Users.getNameUser(uid);
            const message = `
🌟 User Balance!
        --------------------------------
👤 User Name: ${name}
🔢 User ID: ${uid}
💰 Money: ${Number(checkmn[e].input)} VNĐ
🕒 Time: ${new Date().toLocaleString()}
        --------------------------------
Thả '👍' để xem lịch sử đặt cược
            `;
            return api.sendMessage(message, threadID, (err, info) => {
                global.client.handleReaction.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    at: senderID,
                    cc: uid,
                    type: 'check'
                });
            });
        } else {
            return api.sendMessage('⚠️ Người dùng không có tiền trong hệ thống!', threadID);
        }
    }
    else if (args[0] === 'his') {
        let uid;
        if (messageReply) {
            uid = messageReply.senderID;
        } else if (mentions && Object.keys(mentions).length > 0) {
            uid = parseInt(Object.keys(mentions)[0]);
        } else if (!isNaN(parseInt(args[1]))) {
            uid = parseInt(args[1].trim());
        } else {
            uid = senderID;
        }

        const userHistoricFile = lichsugiaodich + `${uid}.json`;
        if (fs.existsSync(userHistoricFile)) {
            const đầu_khấc = JSON.parse(fs.readFileSync(userHistoricFile, "utf-8"));
            const name = (await Users.getData(uid)).name;

            const cốn_lài = đầu_khấc.slice(-5).reverse();

            let message = `
🌟 Transaction History!
--------------------------------
👤 User Name: ${name}
🔢 User ID: ${uid}
--------------------------------
`;
            cốn_lài.forEach(entry => {
                message += `
🕒 Time: ${new Date(entry.time).toLocaleString()}
💰 Change: ${entry.input > 0 ? '+' : ''}${Number(entry.input)} VNĐ
💰 Balance after: ${Number(entry.historic_input + entry.input)} VNĐ
--------------------------------
`;
            });
            return api.sendMessage(message, threadID);
        } else {
            return api.sendMessage('⚠️ Không có lịch sử giao dịch nào!', threadID);
        }
    } else if (args[0] === 'reset') {
        if (!ADMINBOT.includes(senderID)) return api.sendMessage(`⚠️ Bạn không có quyền sử dụng lệnh này!`, threadID);
        let uid;
        if (messageReply) {
            uid = messageReply.senderID;
        } else if (mentions && Object.keys(mentions).length > 0) {
            uid = parseInt(Object.keys(mentions)[0]);
        } else if (!isNaN(parseInt(args[1]))) {
            uid = parseInt(args[1].trim());
        } else {
            uid = null;
        }
        if (uid) {
            const index = checkmn.findIndex(entry => entry.senderID == uid);
            if (index !== -1) {
                checkmn.splice(index, 1);
                fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
                const userHistoricFile = lichsugiaodich + `${uid}.json`;
                if (fs.existsSync(userHistoricFile)) {
                    fs.unlinkSync(userHistoricFile);
                }
                return api.sendMessage(`💰 Đã reset tiền của người dùng ID: ${(await Users.getData(uid)).name}`, threadID);
            } else {
                return api.sendMessage('⚠️ Người dùng không tồn tại trong hệ thống!', threadID);
            }
        } else {
            checkmn.splice(0, checkmn.length);
            fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
            fs.readdirSync(lichsugiaodich).forEach(file => {
                fs.unlinkSync(path.join(lichsugiaodich, file));
            });
            return api.sendMessage('💰 Đã reset tiền của tất cả người dùng!', threadID);
        }
    } else if (args[0] === 'top') {
        const topUsers = checkmn
            .filter(entry => entry.input > 0)
            .sort((a, b) => b.input - a.input)
            .slice(0, 10);

        if (topUsers.length === 0) {
            return api.sendMessage('⚠️ Không có người dùng nào trong bảng xếp hạng!', threadID);
        }

        let message = `
🌟 Top 10 Users with Most Money!
    --------------------------------
`;
        for (let i = 0; i < topUsers.length; i++) {
            const name = (await Users.getData(topUsers[i].senderID)).name;
            message += `
${i + 1}. 👤 User Name: ${name}
🔢 User ID: ${topUsers[i].senderID}
💰 Money: ${Number(topUsers[i].input).toLocaleString()} VNĐ
    --------------------------------
`;
        }
        return api.sendMessage(message, threadID);
    } else if (args[0] === 'tài' || args[0] === 'xỉu') {
        const checkData = JSON.parse(fs.readFileSync(fileCheck, "utf-8"));
        const player = checkmn.find(entry => entry.senderID == senderID);
        let betAmount;

        if (!player) return api.sendMessage('⚠️ Tiền thì không có cứ thích đỏ đen là thế lon nào??', threadID, event.messageID);
        if (player.input <= 0) return api.sendMessage('⚠️ Nợ tiền chồng chất không lo kiếm tiền mà trả đi chơi củ cac gì!', threadID, event.messageID);

        if (args[1] === "all") {
            betAmount = player.input;
        } else if (args[1].includes('%')) {
            const percentage = parseInt(args[1].replace('%', ''));
            if (isNaN(percentage) || percentage <= 0) return api.sendMessage('⚠️ Xin lỗi, phần trăm đặt cược phải là một số hợp lệ và lớn hơn 0!', threadID, event.messageID);
            betAmount = Math.round(player.input * (percentage / 100));
        } else {
            betAmount = parseInt(args[1]);
        }

        if (isNaN(betAmount) || betAmount <= 0) return api.sendMessage('⚠️ Xin lỗi, số tiền đặt cược phải là một số hợp lệ và lớn hơn 0!', threadID, event.messageID);
        if (betAmount < 1000 && args[1] !== "all") return api.sendMessage('⚠️ Xin lỗi, số tiền đặt cược phải lớn hơn 1000 VNĐ!', threadID);
        if (betAmount > player.input) return api.sendMessage('⚠️ Tiền thì ít mà cứ thích chơi lớn vậy???!', threadID, event.messageID);
        betAmount = Math.round(betAmount);

        if (!checkData.includes(threadID)) {
            const ket_qua = playGame();
            const DITCONMEMAY = ket_qua.result == args[0] ? 'win' : 'lose';
            if (DITCONMEMAY == 'win') {
                player.input += betAmount;
            } else if (DITCONMEMAY == 'lose') {
                player.input -= betAmount;
            }
            fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
            const e = checkmn.find(entry => entry.senderID == senderID);
            const dcm = `
🎲 KẾT QUẢ ĐÁ XÚC XẮC:
--------------------------------
🎲 Số xúc xắc 1: ${ket_qua.dice1}
🎲 Số xúc xắc 2: ${ket_qua.dice2}
🎲 Số xúc xắc 3: ${ket_qua.dice3}
🎲 Tổng điểm: ${ket_qua.total}
--------------------------------
🎉 Bạn đã chọn: ${args[0]}
✨ Kết quả: ${ket_qua.result}
🏆 Bạn ${DITCONMEMAY == 'win' ? `thắng và nhận được ${Number(betAmount * 2)} VNĐ` : `thua và mất số tiền: ${Number(betAmount)} VNĐ`}
💲 Tiền hiện có: ${Number(e.input)}
    `;
            return api.sendMessage(dcm, threadID);
        } else {
            if (txTime >= 45) {
                return api.sendMessage('⌛ Hết thời gian đặt cược', threadID);
            } else if (txTime > 50) {
                return api.sendMessage(`⌛ Vui lòng chờ phiên mới\nPhiên mới bắt đầu sau: ${60 - txTime}s`, threadID);
            }

            const phiênData = JSON.parse(fs.readFileSync(phiênFile, "utf-8"));
            const phiên = phiênData.length ? phiênData[phiênData.length - 1].phien : 1;

            const userBetFile = `${betHistoryPath}${senderID}.json`;
            let userBetData = [];
            if (fs.existsSync(userBetFile)) {
                userBetData = JSON.parse(fs.readFileSync(userBetFile, "utf-8"));
            }

            const e = userBetData.find(entry => entry.senderID === senderID && entry.phien === phiên);
            if (e) {
                if (e.choice !== args[0]) {
                    return api.sendMessage('⚠️ Bạn chỉ có thể đặt cược vào một lựa chọn (tài hoặc xỉu) trong cùng một phiên.', threadID);
                } else {
                    e.betAmount += betAmount;
                    player.input -= betAmount;
                    fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
                    fs.writeFileSync(userBetFile, JSON.stringify(userBetData, null, 4), 'utf-8');
                    const ctime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
                    return api.sendMessage(`[PHIÊN: ${phiên}]\nĐã đặt cược thêm: ${args[0]}\nSố tiền cược thêm: ${Number(betAmount)} VNĐ\nTổng số tiền cược: ${Number(e.betAmount)} VNĐ\nThời gian đặt: ${ctime}\nThời gian còn lại: ${50 - txTime}s`, threadID);
                }
            } else {
                player.input -= betAmount;
                userBetData.push({
                    senderID: senderID,
                    choice: args[0],
                    betAmount: betAmount,
                    phien: phiên,
                    time: Date.now()
                });
                fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
                fs.writeFileSync(userBetFile, JSON.stringify(userBetData, null, 4), 'utf-8');
                const ctime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
                return api.sendMessage(`[PHIÊN: ${phiên}]\nĐã đặt cược: ${args[0]}\nSố tiền cược: ${Number(betAmount)} VNĐ\nThời gian đặt: ${ctime}\nThời gian còn lại: ${50 - txTime}s`, threadID);
            }
        }
    } else if (args[0] === 'on' || args[0] === 'off') {
        const checkData = JSON.parse(fs.readFileSync(fileCheck, "utf-8"));
        const { ADMINBOT } = global.config;
        const dataThread = (await Threads.getData(event.threadID)).threadInfo;
        if (!dataThread.adminIDs.some(item => item.id === senderID) && !ADMINBOT.includes(senderID)) {
            return api.sendMessage('❎ Bạn không đủ quyền hạn để sử dụng!', threadID, event.messageID);
        }
        if (args[0] === 'on') {
            if (!checkData.includes(threadID)) {
                checkData.push(threadID);
                fs.writeFileSync(fileCheck, JSON.stringify(checkData, null, 4), 'utf-8');
                return api.sendMessage('✅ Đã bật trò chơi cho nhóm này!', threadID);
            }
        } else if (args[0] === 'off') {
            const index = checkData.indexOf(threadID);
            if (index > -1) {
                checkData.splice(index, 1);
                fs.writeFileSync(fileCheck, JSON.stringify(checkData, null, 4), 'utf-8');
                return api.sendMessage('Đã tắt trò chơi cho nhóm này!', threadID);
            }
        }
    } else {
        const message = `
[ Tài Xỉu ]
    
🔸 +tx on/off: Bật/tắt server trong nhóm
🔸 +tx tài/xỉu + số tiền/all: Đặt cược
🔸 +tx nap/nạp/rut/rút: Nạp/rút tiền
🔸 +tx pay tag/reply: Chuyển tiền cho người chơi khác
🔸 +tx check tag/reply/trống: Xem số tiền hiện có
🔸 +tx reset trống/tag/reply/uid: Đưa money của người dùng hoặc tất cả về 0
🔸 +tx top: Xem những người chơi có tiền đứng đầu
🔸 +tx his: Xem lịch sử nạp!

⚠️ Chú ý:
- Server liên kết với tất cả các nhóm!
- Bạn cũng có thể chơi đơn nhóm bằng cách dùng: tx tài/xỉu + số tiền
`;

        return api.sendMessage(message, threadID);
    }
}
module.exports.handleReaction = async function ({ api, event, handleReaction, Users }) {
    if (handleReaction.type === 'check' && event.reaction === '👍') {
        api.unsendMessage(handleReaction.messageID);

        const userBetPath = `${betHistoryPath}${handleReaction.cc}.json`;
        if (!fs.existsSync(userBetPath)) return api.sendMessage(`Người dùng chưa có dữ liệu!`, event.threadID);

        const betData = JSON.parse(fs.readFileSync(userBetPath, "utf-8")).slice(-7);

        const comparisons = betData.map(bet => {
            const win = bet.ket_qua === 'thắng' ? 'Thắng' : (bet.ket_qua === 'thua' ? 'Thua' : 'Chưa có kết quả');
            return {
                phien: bet.phien,
                choice: bet.choice,
                amount: bet.betAmount,
                win
            };
        });

        const msg = comparisons.map(res => `
Phiên ${res.phien}:
- Lựa chọn: ${res.choice}
- Số tiền cược: ${Number(res.amount).toLocaleString()} VNĐ
- Kết quả: ${res.win}`).join('');

        return api.sendMessage(`KẾT QUẢ CÁC CƯỢC:
--------------------------------
${msg}
`, event.threadID);
    }
};
