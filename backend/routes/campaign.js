const express = require('express');
const router = express.Router();
const { Lead, Email } = require('../database');
const { generatePersonalizedEmail } = require('../services/openai');
const { sendEmail } = require('../services/gmail');

router.post('/start', async (req, res) => {
  try {
    const pendingLeads = await Lead.findAll({ where: { status: 'Pending' } });
    
    // In a real app, this should be done via a job queue to handle rate limits
    // and not block the request. For MVP, we'll process a few and return.
    
    let sentCount = 0;
    for (const lead of pendingLeads) {
      // Rate limiting: sleep for a bit (simplified)
      // await new Promise(resolve => setTimeout(resolve, 2000)); 

      const personalized = await generatePersonalizedEmail(lead);
      await sendEmail(lead.email, personalized.subject, personalized.body);

      await Email.create({
        LeadId: lead.id,
        subject: personalized.subject,
        body: personalized.body,
        sent_at: new Date(),
        email_type: 'initial'
      });

      lead.status = 'Sent';
      await lead.save();
      sentCount++;
    }

    res.json({ message: `Campaign started. ${sentCount} emails sent.` });
  } catch (error) {
    console.error('Campaign Error:', error);
    res.status(500).json({ error: 'Failed to start campaign.' });
  }
});

module.exports = router;
