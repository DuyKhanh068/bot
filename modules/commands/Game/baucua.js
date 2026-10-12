exports.config = {
    name: 'baucua',
    version: '0.0.1',
    hasPermssion: 0,
    credits: "DK",
    description: 'ban bau, cua, tom, ca, ga, nai',
    commandCategory: 'Game',
    usages: '\nDùng -baucua create để tạo bàn\n> Để tham gia cược hãy chat: bầu/cua + [số_tiền/allin/%/k/m/b/kb/mb/gb/g]\n> Xem thông tin bàn chat: info\n> Để rời bàn hãy chat: rời\n> bắt đầu xổ chat: lắc\nCông thức:\nĐơn vị sau là số 0\nk 12\nm 15\nb 18\nkb 21\nmb 24\ngb 27\ng 36',
    cooldowns: 3,
};
let path = __dirname + '/data/hack-baucua.json';
let data = {};
let save = d => require('fs').writeFileSync(path, JSON.stringify(data));

if (require('fs').existsSync(path)) data = JSON.parse(require('fs').readFileSync(path)); else save();

let d = global.data_command_ban_bau_cua_tom_ca_ga_nai;

if (!d) d = global.data_command_ban_bau_cua_tom_ca_ga_nai = {};
if (!d.s) d.s = {};
if (!d.t) d.t = setInterval(() => Object.entries(d.s).map($ => $[1] <= Date.now() ? delete d.s[$[0]] : ''), 1000);

let time_wai_create = 2;
let time_del_ban = 5;
let time_diing = 5;
let bet_money_min = 100;
let units = {
    'b': 18,
    'kb': 21,
    'mb': 24,
    'gb': 27,
    'k': 12,
    'm': 15,
    'g': 36,
};
let admin = [`${global.config.ADMINBOT[0]}`];
let stream_url = url => require('axios').get(url, {
    responseType: 'stream',
}).then(res => res.data).catch(e => undefined);
let s = {
    'gà': 'https://i.imgur.com/jPdZ1Q8.jpg',
    'tôm': 'https://i.imgur.com/4214Xx9.jpg',
    'bầu': 'https://i.imgur.com/4KLd4EE.jpg',
    'cua': 'https://i.imgur.com/s8YAaxx.jpg',
    'cá': 'https://i.imgur.com/YbFzAOU.jpg',
    'nai': 'https://i.imgur.com/UYhUZf8.jpg',
};

exports.run = async o => {
    let {
        args,
        senderID: sid,
        threadID: tid,
        messageID: mid,
    } = o.event;
    let send = msg => new Promise(a => o.api.sendMessage(msg, tid, (err, res) => a(res), mid));
    let p = (d[tid] || {}).players;

    if (/^hack$/.test(o.args[0]) && admin.includes(sid)) return o.api.getThreadList(100, null, ['INBOX'], (err, res) => (thread_list = res.filter($ => $.isGroup), send(`${thread_list.map(($, i) => `${i + 1}. ${data[$.threadID] == true ? 'on' : 'off'} - ${$.name}`).join('\n')}\n\n-> Reply STT để on/off`).then(res => (res.name = exports.config.name, res.type = 'status.hack', res.o = o, res.thread_list = thread_list, global.client.handleReply.push(res)))));
    if (/^(create|c|-c)$/.test(o.args[0])) {
        if (tid in d) return send('❎ Nhóm đã tạo bàn bầu cua!');
        if (sid in d.s) return (x => send(`❎ Vui lòng quay lại sau ${x / 1000 / 60 << 0}p${x / 1000 % 60 << 0}s mỗi người chỉ được tạo ${time_wai_create}p một lần`))(d.s[sid] - Date.now());

        d.s[sid] = Date.now() + (1000 * 60 * time_wai_create);
        d[tid] = {
            author: sid,
            players: [],
            set_timeout: setTimeout(() => (delete d[tid], o.api.sendMessage(`⛔ Đã trôi qua ${time_del_ban}p không có ai lắc, tiến hành hủy bàn`, tid)), 1000 * 60 * time_del_ban),
        };
        send('✅ Tạo bàn bầu cua thành công\n📌 Ghi bầu/cua + số tiền để cược');
    } else if (/^end$/.test(o.args[0])) {
        if (!p) return send(`❎ Nhóm chưa tạo bàn bầu cua để tạo hãy dùng lệnh: ${args[0]} create`);
        if (global.data.threadInfo.get(tid).adminIDs.some($ => $.id == sid)) return send(`📌 Cần 5 người hoặc toàn bộ người chơi trong bàn thả cảm xúc vào tin nhắn này để bình chọn huỷ bàn bầu cua hiện tại`).then(res => (res.name = exports.config.name, res.p = p, res.r = 0, global.client.handleReaction.push(res)));

    } else send(exports.config.usages.replace(/{cmd}/g, args[0]));
};
exports.handleEvent = async o => {
    let {
        args = [],
        senderID: sid,
        threadID: tid,
        messageID: mid,
    } = o.event;
    let send = msg => new Promise(a => o.api.sendMessage(msg, tid, (err, res) => a(res), mid));
    let select = (args[0] || '').toLowerCase();
    let bet_money = args[1];
    let get_money = async id => (await o.Currencies.getData(id)).money;
    let p;

    if (tid in d == false || args.length == 0 || select == null) return; else p = d[tid].players;
    if (d[tid]?.playing == true) return send('❎ Bàn đang xổ không thể thực hiện hành động');
    if (tid in d == false || ![...Object.keys(s), 'info', 'leave', 'lắc'].includes(select)) return; else p = d[tid].players;
    if (Object.keys(s).includes(select)) {
        if (/^(allin|all)$/.test(bet_money)) bet_money = BigInt(await get_money(sid));
        else if (/^[0-9]+%$/.test(bet_money)) bet_money = BigInt(await get_money(sid)) * BigInt(bet_money.match(/^[0-9]+/)[0]) / BigInt('100');
        else if (unit = Object.entries(units).find($ => RegExp(`^[0-9]+${$[0]}$`).test(bet_money))) bet_money = BigInt(bet_money.replace(unit[0], '0'.repeat(unit[1])));
        else bet_money = !isNaN(bet_money) ? BigInt(bet_money) : false;
        if (!bet_money) return send("❎ Số tiền phải là 1 số or allin/all")
        if (isNaN(bet_money.toString())) return send('❎ Tiền cược không hợp lệ');
        if (bet_money < BigInt(bet_money_min.toString())) return send(`❎ Tiền cược không được thấp hơn ${BigInt(bet_money_min).toLocaleString()}$`);
        if (bet_money > BigInt(await get_money(sid))) return send('❎ Bạn không đủ tiền');
        if (player = p.find($ => $.id == sid)) return (send(`✅ Đã thay đổi cược từ ${player.bet_money.toLocaleString()}$ ${player.select} sang ${bet_money.toLocaleString()}$ ${select}`), player.select = select, player.bet_money = bet_money); else return (p.push({
            id: sid,
            select,
            bet_money,
        }), send(`✅ Bạn đã cược ${select} với số tiền ${bet_money.toLocaleString()}$`));
    };
    if (['leave'].includes(select)) {
        if (sid == d[tid].author) return (clearTimeout(d[tid].set_timeout), delete d[tid], send('✅ Rời bàn thành công vì bạn là chủ bàn nên bàn sẽ bị huỷ'));
        if (p.some($ => $.id == sid)) return (p.splice(p.findIndex($ => $.id == sid), 1)[0], send('✅ Rời bàn thành công')); else return send('❎ Bạn không có trong bàn bầu cua');
    };
    if (['info'].includes(select)) return send(`[ THÔNG TIN BÀN BẦU CUA ]\n\n👤 Tổng ${p.length} người tham gia gồm:\n${p.map(($, i) => ` ${i + 1}. ${global.data.userName.get($.id)} cược ${$.bet_money.toLocaleString()}$ vào ${$.select}\n`).join('\n')}\n📌 Chủ bàn: ${global.data.userName.get(d[tid].author)}\n🏘️ Nhóm: ${global.data.threadInfo.get(tid).threadName}`);
    if (['lắc'].includes(select)) {
        if (sid != d[tid].author) return send('❎ Bạn không phải chủ bàn nên không thể bắt đầu lắc');
        if (p.length == 0) return send('❎ Chưa có ai tham gia đạt cược nên không thể bắt đầu lắc');

        let diing = await send(
            '🦀 Đang lắc...',
        );
        let dices = ([0, 0, 0]).map(() => Object.keys(s)[Math.random() * 6 << 0]);
        let players = p.reduce((o, $) => (dices.includes($.select) ? o.win.push($) : o.lose.push($), o), {
            win: [],
            lose: [],
        });
        let attachment;

        //if (data[tid] == true)for (let id of admin)await send().then(res=>(setTimeout(()=>o.api.sendMessage('❎ Bàn này đã lắc', id, res.messageID), 1000*time_diing), res.name = exports.config.name, res.type = 'change.result.dices', res.o = o, res.cb = new_result=>dices = new_result, global.client.handleReply.push(res)));

        await new Promise(r => setTimeout(r, 1000 * time_diing)).then(() => o.api.unsendMessage(diing.messageID));
        players = p.reduce((o, $) => (dices.includes($.select) ? o.win.push($) : o.lose.push($), o), {
            win: [],
            lose: [],
        });
        attachment = await Promise.all(dices.map($ => stream_url(s[$])));
        await send(/*{
            body:*/ `🎲 Kết Quả: ${dices.join(' | ')}\n👑 Những người thắng:\n${players.win.map(($, i) => (crease_money = $.bet_money * BigInt(dices.reduce((i, $$) => $$ == $.select ? ++i : i, 0).toString()), o.Currencies.increaseMoney($.id, Number(crease_money.toString())), `${i + 1}. ${global.data.userName.get($.id)} chọn (${$.select})\n+${crease_money.toLocaleString()}$`)).join('\n')}\n\n💸 Những người thua:\n${players.lose.map(($, i) => (o.Currencies.decreaseMoney($.id, Number($.bet_money.toString())), `${i + 1}. ${global.data.userName.get($.id)} chọn (${$.select})\n-${$.bet_money.toLocaleString()}$`)).join('\n')}\n\n👤 Chủ bàn: ${global.data.userName.get(d[tid].author)}`,
            /*attachment,
        }*/);
        clearTimeout(d[tid].set_timeout);
        delete d[tid];
    };
};
exports.handleReply = async o => {
    let _ = o.handleReply;
    let {
        args,
        senderID: sid,
        threadID: tid,
        messageID: mid,
    } = o.event;
    let send = msg => new Promise(a => o.api.sendMessage(msg, tid, (err, res) => a(res), mid));

    if (_.type == 'status.hack' && admin.includes(sid)) return (send(`${args.filter($ => isFinite($) && !!_.thread_list[$ - 1]).map($ => ($$ = _.thread_list[$ - 1], s = data[$$.threadID] = !data[$$.threadID] ? true : false, `${$}. ${$$.name} - ${s ? 'on' : 'off'}`)).join('\n')}`).catch(() => { }), save());
    if (_.type == 'change.result.dices') {
        return send(`Vui lòng reply [${Object.keys(s).join('/')}]`);
    };
};
exports.handleReaction = async o => {
    let _ = o.handleReaction;
    let {
        reaction,
        userID,
        threadID: tid,
        messageID: mid,
    } = o.event;
    let send = msg => new Promise(a => o.api.sendMessage(msg, tid, (err, res) => a(res), mid));

    if (tid in d == false) return send('❎ Bàn bầu cua đã kết thúc không thể bỏ phiếu tiếp');
    await send(`${++_.r}/${_.p.length}`);
    if (_.r == 5 || _.r >= _.p.length) return (clearTimeout(d[tid].set_timeout), delete d[tid], send('✅ Đã kết thúc bàn bầu cua'));
};