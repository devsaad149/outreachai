const fetch = require('node-fetch');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama2';

// Ollama API call function
const callOllama = async (messages, systemPrompt = "", temperature = 0.7) => {
    try {
        // Convert OpenAI-style messages to Ollama format
        const prompt = `${systemPrompt}\n\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\nassistant:`;

        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                prompt: prompt,
                stream: false,
                temperature: temperature
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Ollama API Error:', error);
        throw error;
    }
};

const generatePersonalizedEmail = async (lead, customInstructions = "") => {
    const prompt = `Write a brief, personalized cold outreach email (max 120 words) for ${lead.business_name}, 
     a ${lead.industry || 'business'} business. Address ${lead.decision_maker_name}. 
     Mention that I noticed ${lead.observation || lead.industry || 'their business'}. 
     Offer a free website audit/sample. Tone: helpful, not salesy. 
     Include clear CTA to book a 15-min call.
     ${customInstructions ? `Additional Instructions: ${customInstructions}` : ""}`;

    try {
        const response = await callOllama(
            [{ role: "user", content: prompt }],
            "You are an expert sales copywriter specializing in personalized cold outreach.",
            0.7
        );

        return {
            subject: `Quick question for ${lead.business_name}`,
            body: response.trim()
        };
    } catch (error) {
        console.error('Email Generation Error:', error);
        throw error;
    }
};

const analyzeSentiment = async (text) => {
    try {
        const response = await callOllama(
            [{ role: "user", content: text }],
            "Analyze the sentiment of the following email reply. Categorize as: POSITIVE, NEGATIVE, or NEUTRAL. POSITIVE means interested or asking for more info. NEGATIVE means not interested or asking to stop. NEUTRAL is unclear or generic questions. Respond with ONLY the word: POSITIVE, NEGATIVE, or NEUTRAL.",
            0
        );

        const sentiment = response.toUpperCase().trim();

        // Clean up any extra text from the response
        if (sentiment.includes('POSITIVE')) return 'positive';
        if (sentiment.includes('NEGATIVE')) return 'negative';
        return 'neutral';
    } catch (error) {
        console.error('Sentiment Analysis Error:', error);
        return 'neutral';
    }
};

const generateFollowUpEmail = async (lead, previousEmails) => {
    const prompt = `Generate a follow-up email for ${lead.decision_maker_name} at ${lead.business_name}. 
    They haven't replied to the previous email yet. Keep it short, helpful, and different from the last one.
    Context: They were offered a free audit.`;

    try {
        const response = await callOllama(
            [{ role: "user", content: prompt }],
            "You are a helpful assistant following up on a previous outreach.",
            0.7
        );

        return {
            subject: `Re: Quick question for ${lead.business_name}`,
            body: response.trim()
        };
    } catch (error) {
        console.error('Follow-up Email Error:', error);
        throw error;
    }
};

module.exports = { generatePersonalizedEmail, analyzeSentiment, generateFollowUpEmail };
