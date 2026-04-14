module.exports = async (conn, from, body, msg) => {
    if (body === '.tagall') {
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        let txt = `📢 *Attention Everyone!*\n\n`;
        for (let mem of participants) { txt += ` @${mem.id.split('@')[0]}`; }
        await conn.sendMessage(from, { text: txt, mentions: participants.map(a => a.id) });
    }
};
