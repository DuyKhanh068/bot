const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "sing",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "DK",
    description: "Tìm kiếm và phát nhạc MP3 từ YouTube",
    commandCategory: "Tìm kiếm",
    usages: "[tên bài hát | link youtube]",
    cooldowns: 5
};

// Hàm định dạng kích thước byte
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Hàm lấy link tải âm thanh từ YouTube ID
async function getAudioUrl(videoID) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
    
    // Thử qua endpoint API 1
    try {
        const res = await axios.get(`https://api.zenkey.my.id/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}`, { timeout: 15000 });
        if (res.data && res.data.result && res.data.result.download) {
            return {
                url: res.data.result.download,
                title: res.data.result.title || "Unknown"
            };
        }
    } catch (_) {}

    // Fallback API 2 (Cobalt)
    try {
        const res = await axios.post("https://api.cobalt.tools/api/json", {
            url: videoUrl,
            isAudioOnly: true,
            audioFormat: "mp3"
        }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            timeout: 15000
        });
        if (res.data && res.data.url) {
            return {
                url: res.data.url,
                title: "YouTube Audio"
            };
        }
    } catch (_) {}

    // Fallback API 3
    try {
        const res = await axios.get(`https://tools.betabotz.eu.org/tools/yt-audio?url=${encodeURIComponent(videoUrl)}`, { timeout: 15000 });
        if (res.data && res.data.result) {
            return {
                url: res.data.result,
                title: "YouTube Audio"
            };
        }
    } catch (_) {}

    throw new Error("Không thể lấy link tải âm thanh từ các server hỗ trợ.");
}

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body.trim());
    if (isNaN(choice) || choice < 1 || choice > handleReply.results.length) {
        return api.sendMessage("⚠️ Vui lòng phản hồi số thứ tự hợp lệ có trong danh sách!", threadID, messageID);
    }

    const selected = handleReply.results[choice - 1];
    api.unsendMessage(handleReply.messageID);

    const processingMsg = await new Promise(resolve => {
        api.sendMessage(`⏳ Đang tải bài hát: "${selected.title}"\nVui lòng chờ trong giây lát...`, threadID, (err, info) => resolve(info));
    });

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `${Date.now()}_${selected.id}.mp3`);

    try {
        const audioData = await getAudioUrl(selected.id);
        const response = await axios.get(audioData.url, { responseType: "arraybuffer", timeout: 60000 });

        await fs.writeFile(filePath, Buffer.from(response.data));
        const stat = await fs.stat(filePath);

        // Giới hạn gửi file của Facebook Messenger (dưới 26MB)
        if (stat.size > 26214400) {
            await fs.unlink(filePath);
            if (processingMsg) api.unsendMessage(processingMsg.messageID);
            return api.sendMessage("❎ File âm thanh vượt quá giới hạn 25MB của Messenger, không thể gửi!", threadID, messageID);
        }

        if (processingMsg) api.unsendMessage(processingMsg.messageID);

        await api.sendMessage({
            body: `🎵 Bài hát: ${selected.title}\n⏱️ Thời lượng: ${selected.length || "N/A"}\n📦 Dung lượng: ${formatSize(stat.size)}`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            fs.unlink(filePath).catch(() => {});
        }, messageID);

    } catch (error) {
        if (processingMsg) api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(`❎ Lỗi khi xử lý bài hát: ${error.message}`, threadID, messageID);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ").trim();

    if (!query) {
        return api.sendMessage("⚠️ Vui lòng nhập tên bài hát hoặc link YouTube cần tìm!\nVí dụ: .sing Cắt đôi nỗi sầu", threadID, messageID);
    }

    // Kiểm tra nếu người dùng đưa vào link YouTube trực tiếp
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = query.match(ytRegex);

    if (match && match[1]) {
        const videoID = match[1];
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `${Date.now()}_${videoID}.mp3`);

        const processingMsg = await new Promise(resolve => {
            api.sendMessage("⏳ Đang xử lý link YouTube, vui lòng chờ...", threadID, (err, info) => resolve(info));
        });

        try {
            const audioData = await getAudioUrl(videoID);
            const response = await axios.get(audioData.url, { responseType: "arraybuffer", timeout: 60000 });
            await fs.writeFile(filePath, Buffer.from(response.data));
            const stat = await fs.stat(filePath);

            if (stat.size > 26214400) {
                await fs.unlink(filePath);
                if (processingMsg) api.unsendMessage(processingMsg.messageID);
                return api.sendMessage("❎ File âm thanh lớn hơn 25MB, không thể gửi qua Messenger!", threadID, messageID);
            }

            if (processingMsg) api.unsendMessage(processingMsg.messageID);
            return api.sendMessage({
                body: `🎵 Tải nhạc thành công!\n📦 Dung lượng: ${formatSize(stat.size)}`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                fs.unlink(filePath).catch(() => {});
            }, messageID);

        } catch (err) {
            if (processingMsg) api.unsendMessage(processingMsg.messageID);
            return api.sendMessage(`❎ Lỗi: ${err.message}`, threadID, messageID);
        }
    }

    // Nếu tìm kiếm theo từ khóa
    try {
        let results = [];
        try {
            const youtubeSearch = require("youtube-search-api");
            const searchData = await youtubeSearch.GetListByKeyword(query, false, 6);
            if (searchData && searchData.items) {
                results = searchData.items.map(item => ({
                    id: item.id,
                    title: item.title,
                    length: item.length ? item.length.simpleText : "N/A"
                }));
            }
        } catch (_) {}

        if (results.length === 0) {
            return api.sendMessage("❎ Không tìm thấy kết quả nào phù hợp với từ khóa trên YouTube!", threadID, messageID);
        }

        let msg = `🔎 KẾT QUẢ TÌM KIẾM CHO: "${query}"\n────────────────────\n`;
        results.forEach((item, index) => {
            msg += `${index + 1}. ${item.title} (${item.length})\n\n`;
        });
        msg += `👉 Reply (phản hồi) tin nhắn này số thứ tự (1-${results.length}) để tải nhạc.`;

        return api.sendMessage(msg, threadID, (err, info) => {
            if (err) return;
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                results
            });
        }, messageID);

    } catch (err) {
        return api.sendMessage(`❎ Lỗi tìm kiếm: ${err.message}`, threadID, messageID);
    }
};