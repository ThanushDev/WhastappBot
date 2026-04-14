module.exports = async (conn, from, body) => {
    if (body.startsWith('.fb ') || body.startsWith('.yt ')) {
        await conn.sendMessage(from, { text: '📥 වීඩියෝව සකසමින් පවතී... කරුණාකර රැඳී සිටින්න.' });
        // මෙතැනට ytdl-core වැනි libraries සම්බන්ධ කළ යුතුය
    }
};
