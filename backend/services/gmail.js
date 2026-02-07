const { google } = require('googleapis');
const { oauth2Client } = require('./googleAuth');

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

const sendEmail = async (to, subject, body) => {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    try {
        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        return res.data;
    } catch (error) {
        console.error('Gmail Send Error:', error);
        throw error;
    }
};

const listNewReplies = async (lastCheckTime) => {
    try {
        // query to find unread messages in inbox received after lastCheckTime
        const query = `is:unread category:primary after:${Math.floor(lastCheckTime / 1000)}`;
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: query
        });

        if (!res.data.messages) return [];

        const messages = await Promise.all(
            res.data.messages.map(async (msg) => {
                const fullMsg = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id
                });
                return fullMsg.data;
            })
        );

        return messages;
    } catch (error) {
        console.error('Gmail List Error:', error);
        return [];
    }
};

const markAsRead = async (messageId) => {
    try {
        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD']
            }
        });
    } catch (error) {
        console.error('Gmail Mark As Read Error:', error);
    }
};

module.exports = { sendEmail, listNewReplies, markAsRead };
