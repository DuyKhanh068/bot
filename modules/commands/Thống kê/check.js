const p = require("path");
const fs = require("fs");
const moment = require('moment-timezone');

moment.locale('vi');

const cacheDir = p.join('./modules/data/checktts');

if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

let resets = false;

const createNewFile = (filePath, event) => {
    const New_File = {
        Time: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || YYYY-MM-DD'),
        total: [],
        week: [],
        day: []
    };

    if (event.isGroup) {
        const listID = event.participantIDs;
        for (let userID of listID) {
            const userTemplate = {
                id: userID,
                count: 0,
                ttgn: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || dddd'),
                joinTime: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || YYYY-MM-DD')
            };
            New_File.total.push(userTemplate);
            New_File.week.push(userTemplate);
            New_File.day.push(userTemplate);
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(New_File, null, 4));
    return New_File;
};


const join_time = (joinTime) => {
    const [t, dp] = joinTime.split(' || ');
    const j = moment.tz(`${dp}T${t}`, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Ho_Chi_Minh');
    const now = moment.tz('Asia/Ho_Chi_Minh');
    const dt = moment.duration(now.diff(j));
    const d = dt.asDays();
    const h = dt.hours();
    const m = dt.minutes();
    const s = dt.seconds();

    if (d >= 1) {
        return `${Math.floor(d)} ngày`;
    } else {
        return `${h}|${m}|${s}`;
    }
};
module.exports = {
    config: {
        name: "check",
        version: "2.0.0",
        credits: "DK",
        Rent: 1,
        hasPermssion: 0,
        description: "no",
        usage: "no",
        commandCategory: "Thống kê",
        cooldowns: 0
    }, 
    // onLoad: () => {
    //     setInterval(() => {
    //         console.log('áhfidhsi')
    //         const timeVN = moment().tz('Asia/Ho_Chi_Minh');
    //         const gio = timeVN.hour();
    //         const phut = timeVN.minute();
    //         const giay = timeVN.second();
    //         const ngayHienTai = timeVN.day();

    //         fs.readdir(cacheDir, async (err, files) => {
    //             if (gio === 7 && phut === 46 && giay === 0) {
    //                 files.forEach(file => {
    //                     if (p.extname(file) === '.json') {
    //                         const filePath = p.join(cacheDir, file);
    //                         const threadData = JSON.parse(fs.readFileSync(filePath));

    //                         if (ngayHienTai === 1 && threadData.week && Array.isArray(threadData.week)) {
    //                             threadData.week.forEach(item => {
    //                                 if (item.hasOwnProperty('count')) {
    //                                     item.count = 0;
    //                                 }
    //                             });
    //                         }

    //                         if (threadData.day && Array.isArray(threadData.day)) {
    //                             threadData.day.forEach(item => {
    //                                 if (item.hasOwnProperty('count')) {
    //                                     item.count = 0;
    //                                 }
    //                             });
    //                         }
    //                         fs.writeFileSync(filePath, JSON.stringify(threadData, null, 2));
    //                     }
    //                 });
    //             }
    //         });
    //     }, 1000);
    // },
    handleEvent: async function ({ api, event, Threads }) {
        if (resets) return;
        if (!event.isGroup) return;

        const { senderID, threadID } = event;
        const filePath = p.join(cacheDir, `${threadID}.json`);

        let threadData;
        if (!fs.existsSync(filePath)) {
            threadData = createNewFile(filePath, event);
        } else {
            try {
                const rawData = fs.readFileSync(filePath);
                threadData = JSON.parse(rawData);
            } catch (error) {
                threadData = createNewFile(filePath, event);
            }

            if (event.isGroup) {
                for (let userID of event.participantIDs) {
                    if (!threadData.total.some(user => user.id == userID)) {
                        const userTemplate = {
                            id: userID,
                            count: 0,
                            ttgn: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || dddd'),
                            joinTime: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || YYYY-MM-DD')
                        };
                        threadData.total.push(userTemplate);
                        threadData.week.push(userTemplate);
                        threadData.day.push(userTemplate);
                    }
                }
                fs.writeFileSync(filePath, JSON.stringify(threadData, null, 4));
            }
        }

        const updateData = (dataArray, senderID) => {
            const userDataIndex = dataArray.findIndex(e => e.id == senderID);

            if (userDataIndex === -1) {
                dataArray.push({
                    id: senderID,
                    count: 1,
                    ttgn: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || dddd'),
                    joinTime: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || YYYY-MM-DD')
                });
            } else {
                dataArray[userDataIndex].count++;
                dataArray[userDataIndex].ttgn = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || dddd');
            }
        };

        updateData(threadData.total, senderID);
        updateData(threadData.week, senderID);
        updateData(threadData.day, senderID);

        fs.writeFileSync(filePath, JSON.stringify(threadData, null, 4));
    },
    run: async function ({ api, event, Threads, args, Users }) {
        const { messageReply, mentions, threadID, messageID, senderID } = event;
        const filePath = p.join(cacheDir, `${threadID}.json`);
        const threadData = JSON.parse(fs.readFileSync(filePath));

        function quickSort(arr, key) {
            if (arr.length <= 1) return arr;
            const pivot = arr[Math.floor(arr.length / 2)][key];
            const left = arr.filter(item => item[key] > pivot);
            const middle = arr.filter(item => item[key] === pivot);
            const right = arr.filter(item => item[key] < pivot);
            return [...quickSort(left, key), ...middle, ...quickSort(right, key)];
        }

        if (args[0] === 'all') {
            const datas = threadData.total.filter(user => event.participantIDs.includes(user.id));
            const sortedData = quickSort(datas, 'count');

            let message = '== [ CHECKTT ] ==';
            for (const [index, user] of sortedData.entries()) {
                const userInfo = await Users.getData(user.id);

                let userName = userInfo.name;
                if (!userName) {
                    const đcm = await api.getUserInfo(user.id);
                    userName = đcm[user.id]?.name || "Unknown"
                }
                message += `\n${index + 1}. ${userName}: ${user.count}`;
            }

            api.sendMessage(message + `\n\nReply tin nhắn này kèm\n+lọc + số tin nhắn: bot sẽ lọc những người có số tin nhắn từ số tin nhắn mà người dùng nhập vào\n+kick + stt (có thể nhập nhiều, cách nhau bằng dấu cách): bot sẽ kick người đó khỏi nhóm\n+reset: để reset tin nhắn về 0\n\nGỡ tự động sau 60s`, threadID, (err, info) => {
                if (err) return console.error(err);
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    author: senderID,
                    messageID: info.messageID,
                    threadID: threadID,
                    sortedData
                });
                setTimeout(() => { api.unsendMessage(info.messageID) }, 60000);//chỉnh time ở đây
            });

            threadData.total = datas;
            fs.writeFileSync(filePath, JSON.stringify(threadData, null, 4));
        } else if (args[0] === 'reset') {
            const dataThread = (await Threads.getData(event.threadID)).threadInfo;
            if (!dataThread.adminIDs.some(item => item.id === senderID)) {
                return api.sendMessage('❌ Bạn không đủ quyền hạn để sử dụng!', threadID, messageID);
            }

            resets = true;
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const participantIDs = event.participantIDs;

                const resetCount = (items) => {
                    return items.filter(item => participantIDs.includes(item.id)).map(item => {
                        item.count = 0;
                        return item;
                    });
                };

                data.total = resetCount(data.total);
                data.week = resetCount(data.week);
                data.day = resetCount(data.day);

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

                api.sendMessage(`✅ Đã đặt lại toàn bộ dữ liệu đếm tương tác của nhóm`, threadID);
            } catch (error) {
                api.sendMessage(`❌ Lỗi: Không thể đặt lại dữ liệu. ${error.message}`, threadID);
            }
            resets = false;
        } else if (args[0] == 'name') {
            const threadInfo = await Threads.getData(threadID);
            const participants = threadInfo.participantIDs;
            const mem = participants
                .filter(userID => !threadInfo.nicknames[userID])
                .map((userID, index) => ({ id: userID, index }));

            if (mem.length === 0) {
                return api.sendMessage("Tất cả các thành viên đều đã có biệt danh.", threadID, messageID);
            }

            let message = "📋 Danh sách các thành viên chưa có biệt danh:\n";
            for (let i = 0; i < mem.length; i++) {
                const userID = mem[i].id;
                const userInfo = await Users.getData(userID);
                message += `${i + 1}. ${userInfo.name || 'Không xác định'}\n`;
            }
            return api.sendMessage(message, threadID, messageID);
        } else if (args[0] == 'loc') {
            const dataThread = (await Threads.getData(event.threadID)).threadInfo;
            if (!dataThread.adminIDs.some(item => item.id === senderID)) {
                return api.sendMessage('Bạn không đủ quyền hạn để sử dụng!', threadID, messageID);
            }
            const botID = api.getCurrentUserID();
            const botIsAdmin = dataThread.adminIDs.some(admin => admin.id === botID);

            if (!botIsAdmin) {
                return api.sendMessage("❌ Bot cần quyền quản trị viên để thực hiện lệnh này.", threadID, messageID);
            }

            const sl = parseInt(args[1]);
            if (isNaN(sl)) {
                return api.sendMessage("Vui lòng nhập một số hợp lệ.", threadID, messageID);
            }

            const userss = threadData.total.filter(user => user.count <= sl).map(user => user.id);

            if (userss.length === 0) {
                return api.sendMessage("Không có thành viên nào có số tin nhắn nhỏ hơn hoặc bằng " + sl, threadID, messageID);
            }
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            for (const id of userss) {
                await api.removeUserFromGroup(id, threadID);
                await delay(500);
            }

            api.sendMessage(`Đã lọc thành công ${userss.length}`, threadID);
        } else {
            const uid = messageReply?.senderID || (mentions && Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID);
            const sortedData = quickSort(threadData.total, 'count');
            const sortedData1 = quickSort(threadData.week, 'count');
            const sortedData2 = quickSort(threadData.day, 'count');
            const userIndex = sortedData.findIndex(user => user.id == uid);
            const userIndex1 = sortedData1.findIndex(user => user.id == uid);
            const userIndex2 = sortedData2.findIndex(user => user.id == uid);

            if (userIndex !== -1) {
                const userCount = sortedData[userIndex].count;
                const userCount1 = sortedData1[userIndex1]?.count || 0;
                const userCount2 = sortedData2[userIndex2]?.count || 0;

                const rank = userIndex + 1; // xếp hạng tổng
                const rank1 = userIndex1 + 1; // xếp hạng tuần
                const rank2 = userIndex2 + 1; // xếp hạng ngày

                const ttgn = sortedData[userIndex].ttgn;
                const joinTime = sortedData[userIndex].joinTime;

                const userName = (await Users.getData(uid)).name;

                const threadInfo = (await Threads.getData(event.threadID)).threadInfo;
                let permission;

                if (global.config.ADMINBOT.includes(uid)) {
                    permission = `Admin Bot`;
                } else if (threadInfo.adminIDs.some(i => i.id == uid)) {
                    permission = `Quản Trị Viên`
                } else {
                    permission = `Thành viên`;
                }

                const totalCount = sortedData.reduce((sum, user) => sum + user.count, 0);
                const tl = Math.ceil((userCount / totalCount) * 100);

                const joins = join_time(joinTime);

                const message = `✨ Tương tác của ${userName}:\n` +
                    `💬 Tổng số tin nhắn: ${userCount}\n` +
                    `🔮 Chức Vụ: ${permission}\n` +
                    `📅 Số tin nhắn trong tuần: ${userCount1}\n` +
                    `📆 Số tin nhắn trong ngày: ${userCount2}\n` +
                    `⏰ Lần cuối nhắn tin: ${ttgn}\n` +
                    `🧸 Tỉ lệ tương tác: ${tl}%\n` +
                    `🏆 Xếp hạng: ${rank}/${event.participantIDs.length} (tổng)\n` +
                    `🏆 Xếp hạng: ${rank1}/${event.participantIDs.length} (tuần)\n` +
                    `🏆 Xếp hạng: ${rank2}/${event.participantIDs.length} (ngày)\n` +
                    `🕰️ Ngày vào nhóm: ${joinTime}\n` +
                    `🗓️ Đã tham gia được: ${joins}`;

                api.sendMessage(message, threadID);
            } else {
                api.sendMessage(`User ID: ${uid} not found.`, threadID);
            }
        }
    }
};

module.exports.handleReply = async ({ api, event, handleReply, Users, Threads }) => {
    const { body, threadID, messageID, senderID } = event;

    const dataThread = (await Threads.getData(event.threadID)).threadInfo;
    if (!dataThread.adminIDs.some(item => item.id === senderID)) return api.sendMessage('Quyền hạn????', threadID, messageID);
    const botID = api.getCurrentUserID();
    const botIsAdmin = dataThread.adminIDs.some(admin => admin.id === botID);

    if (!botIsAdmin) return api.sendMessage("❌ Bot cần quyền quản trị viên để thực hiện lệnh này.", threadID, messageID);

    const args = body.trim().split(' ');

    const keyword = args[0].trim().toLowerCase();
    const values = args.slice(1).map(value => parseInt(value, 10));

    const filePath = p.join(cacheDir, `${threadID}.json`);
    const threadData = JSON.parse(fs.readFileSync(filePath));


    if (keyword === 'lọc') {
        const sl = parseInt(values[0], 10);

        if (isNaN(sl)) return api.sendMessage("Thiếu số", threadID, messageID);


        const userss = threadData.total.filter(user => user.count <= sl).map(user => user.id);

        if (userss.length === 0) return api.sendMessage("Không có thành viên nào có số tin nhắn nhỏ hơn hoặc bằng " + sl, threadID, messageID);
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for (const id of userss) {
            if (id == botID) continue;
            await api.removeUserFromGroup(id, threadID);
            await delay(500);
        }

        api.sendMessage(`Đã lọc thành công ${userss.length}`, threadID);

    } else if (keyword === 'kick') {
        if (values.length === 0) return api.sendMessage("Thiếu số", threadID, messageID);

        if (!values.every(value => /^\d+$/.test(value))) return api.sendMessage(`Nhập số?`, threadID, messageID);

        const listDel = values.map(value => parseInt(value, 10));

        const Thằng_Bị_kick_list = handleReply.sortedData;

        let Thằng_Ngu_Bị_Kick = [];
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for (const [index, user] of Thằng_Bị_kick_list.entries()) {
            if (listDel.includes(index + 1)) {
                try {
                    const userInfo = await Users.getData(user.id);
                    const userName = userInfo.name;
                    if (user.id == botID) continue;
                    await api.removeUserFromGroup(user.id, threadID);
                    Thằng_Ngu_Bị_Kick.push(`${userName}`);
                    await delay(500)
                } catch (error) {
                    //console.error(`Lỗi ${user.id}: ${error.message}`);
                }
            }
        }
        if (Thằng_Ngu_Bị_Kick.length > 0) {
            const message = `Đã kick ${Thằng_Ngu_Bị_Kick.join(', ')}`;
            api.sendMessage(message, threadID);
        }
    } else if (keyword === 'reset') {
        resets = true;
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const participantIDs = event.participantIDs;
    
            const resetCount = (items) => {
                return items.filter(item => participantIDs.includes(item.id)).map(item => {
                    item.count = 0;
                    return item;
                });
            };

            data.total = resetCount(data.total);
            data.week = resetCount(data.week);
            data.day = resetCount(data.day);
    
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
            api.sendMessage(`✅ Đã đặt lại toàn bộ dữ liệu đếm tương tác của nhóm`, threadID);
        } catch (error) {
            api.sendMessage(`❌ Lỗi: Không thể đặt lại dữ liệu. ${error.message}`, threadID);
        }
        resets = false;
    }
};
