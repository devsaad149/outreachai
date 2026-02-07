const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generatePersonalizedEmail = async (lead, customInstructions = "") => {
    const prompt = `Write a brief, personalized cold outreach email (max 120 words) for ${lead.business_name}, 
     a ${lead.industry || 'business'} business. Address ${lead.decision_maker_name}. 
     Mention that I noticed ${lead.observation || lead.industry || 'their business'}. 
     Offer a free website audit/sample. Tone: helpful, not salesy. 
     Include clear CTA to book a 15-min call.
     ${customInstructions ? `Additional Instructions: ${customInstructions}` : ""}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an expert sales copywriter specializing in personalized cold outreach." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        return {
            subject: `Quick question for ${lead.business_name}`,
            body: response.choices[0].message.content.trim()
        };
    } catch (error) {
        console.error('OpenAI Error (Generate):', error);
        throw error;
    }
};

const analyzeSentiment = async (text) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Analyze the sentiment of the following email reply. Categorize as: POSITIVE, NEGATIVE, or NEUTRAL. POSITIVE means interested or asking for more info. NEGATIVE means not interested or asking to stop. NEUTRAL is unclear or generic questions."
                },
                { role: "user", content: text }
            ],
            temperature: 0,
        });

        const sentiment = response.choices[0].message.content.toUpperCase().trim();
        if (sentiment.includes('POSITIVE')) return 'positive';
        if (sentiment.includes('NEGATIVE')) return 'negative';
        return 'neutral';
    } catch (error) {
        console.error('OpenAI Error (Sentiment):', error);
        return 'neutral';
    }
};

const generateFollowUpEmail = async (lead, previousEmails) => {
    const prompt = `Generate a follow-up email for ${lead.decision_maker_name} at ${lead.business_name}. 
    They haven't replied to the previous email yet. Keep it short, helpful, and different from the last one.
    Context: They were offered a free audit.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant following up on a previous outreach." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        return {
            subject: `Re: Quick question for ${lead.business_name}`,
            body: response.choices[0].message.content.trim()
        };
    } catch (error) {
        console.error('OpenAI Error (Follow-up):', error);
        throw error;
    }
};

module.exports = { generatePersonalizedEmail, analyzeSentiment, generateFollowUpEmail };
