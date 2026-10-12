const axios = require("axios");

module.exports.config = {
  name: "countryinfo",
  version: "1.0.0",
  hasPermission: 0,
  credits: "DK",
  description: "Get information about a country",
  commandCategory: "Tìm kiếm",
  usages: "/Countryinfo [country name]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) {
    api.sendMessage("Vui lòng cung cấp tên quốc gia!", event.threadID, event.messageID);
    return;
  }

  const countryName = encodeURIComponent(args.join(" "));
  const apiEndpoint = `https://restcountries.com/v3.1/name/${countryName}`;

  try {
    const response = await axios.get(apiEndpoint);
    const countryData = response.data;

    if (!countryData.length) {
      api.sendMessage(`Không tìm thấy thông tin cho quốc gia "${args.join(" ")}".`, event.threadID, event.messageID);
      return;
    }

    const countryInfo = countryData[0];
    const name = countryInfo.name.common;
    const officialName = countryInfo.name.official;
    const capital = countryInfo.capital?.[0];
    const region = countryInfo.region;
    const population = countryInfo.population;
    const languages = Object.values(countryInfo.languages).join(", ");
    const timezones = countryInfo.timezones.join(", ");
    const continents = countryInfo.continents.join(", ");
    const googleMaps = countryInfo.maps.googleMaps;
    const openStreetMaps = countryInfo.maps.openStreetMaps;
    const flagsPNG = countryInfo.flags.png;
    const flagsSVG = countryInfo.flags.svg;

    const message = `🌎 Quốc Gia: ${name} (${officialName})\n⛩️ Thủ Đô: ${capital || "N/A"}\n🧭 Vùng Đất: ${region}\n👥 Dân Số: ${population}\n📝 Ngôn Ngữ: ${languages}\n⏳ Múi giờ: ${timezones}\n🗺️ Lục Địa: ${continents}\n📍 Google Map: ${googleMaps}\n🗾 Bản Đồ: ${openStreetMaps}\n\n🔱 Cờ:\n[PNG](${flagsPNG})\n[SVG](${flagsSVG})
    `;

    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage("Đã xảy ra lỗi khi tìm thông tin quốc gia. Vui lòng thử lại sau.", event.threadID, event.messageID);
    console.error("Lỗi API của các quốc gia còn lại:", error.message);
  }
};
             