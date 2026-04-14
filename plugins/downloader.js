module.exports = async (conn, from, command, body) => {
    if (command.startsWith('.fb ') || command.startsWith('.yt ')) {
        const link = body.slice(4);
        await conn.sendMessage(from, { text: `📥 *Downloading...*\n\nඔබ ලබාදුන් ලින්ක් එක පරීක්ෂා කරමින් පවතී: ${link}` });
    }
};
