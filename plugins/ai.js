module.exports = async (conn, from, command, body) => {
    if (command.startsWith('.ai ')) {
        const prompt = body.slice(4);
        await conn.sendMessage(from, { text: `🤖 *Digi Solutions AI*\n\nඔබගේ ප්‍රශ්නය: ${prompt}\n\nපිළිතුර සකසමින් පවතී...` });
        // මෙතැනට Gemini API response එක පසුව එක් කළ හැක
    }
};
