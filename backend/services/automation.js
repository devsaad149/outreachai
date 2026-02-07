const cron = require('node-cron');
const { listNewReplies, markAsRead, sendEmail } = require('./gmail');
const { analyzeSentiment, generateFollowUpEmail } = require('./openai');
const { Lead, Response, Email, sequelize } = require('../database');
const { Op } = require('sequelize');

// Check for new replies every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log('Running Inbox Check...');
    const lastCheck = Date.now() - (30 * 60 * 1000);
    const messages = await listNewReplies(lastCheck);

    for (const msg of messages) {
        const fromHeader = msg.payload.headers.find(h => h.name === 'From').value;
        const emailMatch = fromHeader.match(/<(.+)>/) || [null, fromHeader];
        const emailAddress = emailMatch[1];

        const lead = await Lead.findOne({ where: { email: emailAddress } });
        if (lead) {
            const body = msg.snippet; // simplistic body extraction
            const sentiment = await analyzeSentiment(body);

            await Response.create({
                lead_id: lead.id,
                response_text: body,
                sentiment: sentiment
            });

            if (sentiment === 'positive') {
                lead.status = 'Replied'; // Or specific status flow
                // Auto-respond if positive logic here
            } else if (sentiment === 'negative') {
                lead.status = 'Not Interested';
            }

            await lead.save();
            await markAsRead(msg.id);
        }
    }
});

// Check for follow-ups every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running Follow-up Check...');
    const fortyEightHoursAgo = new Date(Date.now() - (48 * 60 * 60 * 1000));

    // Find leads with status 'Sent' and no reply, sent > 48h ago
    const leadsToFollowUp = await Lead.findAll({
        where: {
            status: 'Sent',
            created_at: { [Op.lt]: fortyEightHoursAgo }
        },
        include: [Email]
    });

    for (const lead of leadsToFollowUp) {
        const followUp = await generateFollowUpEmail(lead, lead.Emails);
        await sendEmail(lead.email, followUp.subject, followUp.body);

        await Email.create({
            LeadId: lead.id,
            subject: followUp.subject,
            body: followUp.body,
            sent_at: new Date(),
            email_type: 'follow-up'
        });

        lead.status = 'Follow-up Sent';
        await lead.save();
    }
});
