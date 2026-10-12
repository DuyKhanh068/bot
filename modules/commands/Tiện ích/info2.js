const axios = require("axios");
const downloader = require("image-downloader");
const fs = require("fs");
const fse = require('fs-extra');
const path = require("path");
const moment = require("moment-timezone");

module.exports.config = {
    name: "info2",
    version: "0.0.5",
    hasPermssion: 0,
    credits: "DK",
    description: "Lấy thông tin người dùng từ Facebook",
    usages: "[uid|link|reply]",
    commandCategory: "Tiện ích",
    cooldowns: 5,
};

async function streamURL(url, mime = 'jpg') {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`;
    await downloader.image({ url, dest });
    setTimeout(() => fse.unlinkSync(dest), 60 * 1000); // Xóa file sau 1 phút
    return fse.createReadStream(dest);
}

async function getUidFromLink(link) {
    try {
        const response = await axios.get(`https://ffb.vn/api/tool/get-id-fb?idfb=${encodeURIComponent(link)}`);
        return response.data.id || null;
    } catch (error) {
        console.error("Error fetching UID from link:", error);
        return null;
    }
}

module.exports.run = async function({ api, event, args }) {
    let uid = args[0];

    // Kiểm tra nếu người dùng reply tin nhắn
    if (event.messageReply) {
        uid = event.messageReply.senderID;
    } else if (uid && uid.startsWith("http")) {
        // Kiểm tra nếu người dùng gửi link và lấy UID từ link
        uid = await getUidFromLink(uid);
    } else if (!uid) {
        // Nếu UID trống thì sử dụng UID của người sử dụng lệnh
        uid = event.senderID;
    }

    if (!uid) {
        return api.sendMessage("Vui lòng cung cấp UID, liên kết người dùng hợp lệ hoặc reply tin nhắn của người dùng!", event.threadID, event.messageID);
    }

    try {
        api.sendMessage("🔄 Đang lấy thông tin...", event.threadID, event.messageID);

        // Gửi yêu cầu đến hai API cùng lúc
        const [response1, response2] = await Promise.all([
            axios.get(`https://lechii.onrender.com/facebook/getinfo?uid=${uid}`),
            axios.get(`https://lechii.onrender.com/facebook/getinfov2?uid=${uid}`)
        ]);

        const result1 = response1.data;
        const result2 = response2.data;

        // Hàm kiểm tra và lấy dữ liệu từ API 1, nếu không có thì lấy từ API 2
        const getData = (data1, data2, field) => {
            return data1 && data1[field] && data1[field] !== "Không có dữ liệu!" ? data1[field] : (data2 && data2[field] ? data2[field] : "❌");
        };

        // Lấy các thông tin từ API 1 và API 2
		const user_id = result2.id
        const name = getData(result1, result2, 'name');
        const firstName = getData(result1, result2, 'first_name');
        const profileUrl = getData(result1, result2, 'link');
        const gender = getData(result1, result2, 'gender');
        const locale = getData(result1, result2, 'locale');
        const subscribers = getData(result1, result2, 'subscribers') && getData(result1, result2, 'subscribers').summary ? getData(result1, result2, 'subscribers').summary.total_count : "❌";
        const timezone = getData(result1, result2, 'timezone');
        const username = getData(result1, result2, 'username');
        const coverPhotoUrl = getData(result1, result2, 'cover') ? getData(result1, result2, 'cover').source : null;
        const createdTime = moment.tz(result2.created_time, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss"); // Định dạng theo múi giờ Việt Nam
        const updatedTime = getData(result1, result2, 'updated_time') ? moment(getData(result1, result2, 'updated_time')).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss") : "❌";
        let relationshipStatus = getData(result1, result2, 'relationship_status');
        const birthday = getData(result1, result2, 'birthday');
        const hometown = typeof getData(result1, result2, 'hometown') === 'object' ? getData(result1, result2, 'hometown').name : getData(result1, result2, 'hometown');
        const location = typeof getData(result1, result2, 'location') === 'object' ? getData(result1, result2, 'location').name : getData(result1, result2, 'location');
        const about = getData(result1, result2, 'about');
        const quotes = getData(result1, result2, 'quotes');
        const verify = result2.is_verified === true ? "Đã xác minh" : "Chưa xác minh";
        const work = getData(result1, result2, 'work');
        const love = getData(result2, result1, 'love');

        // Kiểm tra và thêm "với" nếu cần thiết
        if (love && love.name !== '❌') {
            relationshipStatus += ` với ${love.name}`;
        }

        // Tìm bài viết gần nhất từ API getinfov2
        const posts2 = result2.posts ? result2.posts.data : [];
        let latestPost = null;
        if (posts2.length > 0) {
            latestPost = posts2.reduce((latest, post) => {
                return !latest || new Date(post.created_time) > new Date(latest.created_time) ? post : latest;
            }, null);
        }

        // Định dạng tin nhắn
        let message = `
╭──────────────────⭓
│ 👤 Họ tên: ${name}
│ 👤 Tên: ${firstName}
│ 🔗 User name: ${username} (${user_id})
│ 🌐 Link profile: ${profileUrl}
│ 🧬 Giới tính: ${gender}
│ 🌍 Ngôn ngữ: ${locale}
│ 🕒 Múi giờ: ${timezone}
│ 📊 Số người theo dõi: ${subscribers}
│ 🎉 Tạo lúc: ${createdTime}
│ ⏰ Cập nhật lúc: ${updatedTime}
│ 💖 Trạng thái quan hệ: ${relationshipStatus}`;

        if (love && love.id) {
            message += `\n│ 💞 Link người set: fb.com/${love.id}`;
        }

        message += `
│ 🎂 Ngày sinh: ${birthday}
│ 📍 Quê quán: ${hometown}
│ 🌍 Nơi ở: ${location}
│ 📝 Giới thiệu bản thân: ${about}
│ 📌 Trích dẫn yêu thích: ${quotes}
│ ✅ Xác minh: ${verify}
│ 💼 Công việc:
${Array.isArray(work) ? work.map(w => `│ - ${w.position ? w.position.name : '❌'} tại ${w.employer ? w.employer.name : '❌'}, ${w.location ? w.location.name : '❌'}, từ ${w.start_date ? moment(w.start_date).format("DD/MM/YYYY") : '❌'}`).join('\n') : '❌'}
╰─────────────────⭓`;

        // Lấy thông tin bài viết gần nhất (nếu có)
        if (latestPost) {
            const postTime = latestPost.created_time ? moment(latestPost.created_time).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss") : "❌";
            const postMessage = latestPost.message || "❌";
            const postStory = latestPost.story || "❌";
            const postLink = latestPost.link || "❌";

            message += `
╭──────────────────⭓
│ 📅 Bài viết gần nhất:
│ 🕒 Thời gian: ${postTime}
│ 📝 Nội dung: ${postMessage}
│ 📖 Câu chuyện: ${postStory}
│ 🔗 Link: ${postLink}
╰─────────────────⭓`;
        }

        // Tải ảnh đại diện và ảnh bìa xuống
        const userImage = await streamURL(`https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        let coverImage = null;
        if (coverPhotoUrl) {
            coverImage = await streamURL(coverPhotoUrl);
        }

        // Gửi tin nhắn với file đính kèm
        const attachments = coverImage ? [userImage, coverImage] : [userImage];
        api.sendMessage(
            {
                body: message,
                attachment: attachments,
            },
            event.threadID,
            (err, info) => {
                if (!err) {
                    // Tự động xóa tin nhắn sau 60 giây
                    setTimeout(() => {
                        api.unsendMessage(info.messageID);
                    }, 60 * 1000);

                    fs.unlinkSync(userImage.path); // Xóa file ảnh đại diện sau khi gửi
                    if (coverImage) fs.unlinkSync(coverImage.path); // Xóa file ảnh bìa sau khi gửi nếu có
                }
            },
            event.messageID
        );
    } catch (error) {
        console.error(error);
        return api.sendMessage("❌ Có lỗi xảy ra khi lấy thông tin!", event.threadID, event.messageID);
    }
};