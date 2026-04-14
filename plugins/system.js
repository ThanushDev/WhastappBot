const { GoogleGenerativeAI } = require("@google/generative-ai");
const si = require('systeminformation');
const config = require('../config');

module.exports = async (conn, from, command, body) => {
    // 1. AI Feature
    if (command.startsWith('.ai ')) {
        const genAI = new GoogleGenerativeAI(config.GEMINI_API);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const res = await model.generateContent(body.slice(4));
        await conn.sendMessage(from, { text: `🤖 *Digi Solutions AI*:\n\n${res.response.text()}` });
    }
    // 2. System Status
    if (command === '.status') {
        const cpu = await si.cpu();
        await conn.sendMessage(from, { text: `🚀 *${config.BOT_NAME} Status*\n\nPlatform: ${cpu.brand}\nSpeed: ${cpu.speed}GHz` });
    }
};
