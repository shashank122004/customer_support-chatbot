export const handleQuery = async (req, res) => {
    try {
        const GEMINI_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        // Security: Never log API keys or sensitive data
        
        const { query, history = [] } = req.body;

        if (!query || query.trim() === '') {
            return res.status(400).json({
                response: 'Query is required'
            });
        }

        /* ---------------- STRONG SYSTEM PROMPT ---------------- */
        const systemPrompt = `
You are a professional customer support assistant for Reliance,
an electrical appliance retail company.

IMPORTANT: Always provide SPECIFIC, DETAILED answers with numbers, prices, and concrete information.
Never give generic responses. Make your answers sound authoritative and well-researched.

For Reliance-related queries, answer based on the information below and ENHANCE with specific details.
For non-Reliance queries, answer the question with specific facts and details, then add: "For any other queries related to Reliance, contact Reliance support."

Reliance Support Knowledge Base:

Warranty & Invoice:
- Warranty depends on product and brand and is mentioned on the invoice
- Lost invoices can be recovered via customer support using registered mobile number
- ENHANCE: Provide specific warranty periods (e.g., "typically 1-2 years for electronics, 5-10 years for appliances")

Installation & Demo:
- Installation is generally provided for ACs, TVs, refrigerators, washing machines
- Installation may be free or paid depending on product and brand
- Installation usually happens within a few working days after delivery
- ENHANCE: Give specific timeframes and typical installation costs

Service & Repair:
- Service requests are raised via Reliance customer support
- Repair time depends on issue and spare part availability
- ENHANCE: Mention typical repair times and cost ranges

Delivery & Orders:
- Delivery timelines depend on location and product availability
- Delivery can often be rescheduled before dispatch
- Order tracking details are shared via SMS or email
- ENHANCE: Give specific delivery timeframes for different locations

Returns & Refunds:
- Returns depend on product category and condition
- Refunds are processed after return approval within a few working days
- Opened products may not always be eligible for return
- ENHANCE: Specify exact return windows (e.g., "7-30 days depending on product category")

Payments:
- Payment methods include cards, UPI, net banking, and EMI
- EMI availability depends on product and bank
- Failed payments with deduction should be reported to customer support
- ENHANCE: Mention specific EMI options and interest rates

Product Information (like Dyson, Samsung, LG, etc.):
- Provide specific model numbers, price ranges, and features
- Include warranty details, specifications, and comparisons
- Give concrete recommendations based on the query

Rules:
- ALWAYS provide specific numbers, prices, timeframes, and details
- Make answers sound authoritative and well-researched
- For product pricing, provide realistic price ranges with specific models
- For warranties, give specific durations
- Be polite, clear, and detailed
- Format responses in clean, professional paragraphs
- Use simple line breaks (not bullet points with asterisks or symbols)
- Write in a conversational, natural tone without markdown formatting
- Structure information logically with smooth transitions
- For Reliance-related queries, use and ENHANCE the knowledge base above with specific details
- For greetings like "hi", "hello", etc., respond warmly and ask how you can help
- For general questions (weather, math, facts, etc.), answer them with specific details
- After answering non-Reliance questions, add on a new line: "For any other queries related to Reliance, contact Reliance support."
- Never give vague or generic answers - always be specific
- Keep responses concise but informative (2-4 sentences for simple queries, more for complex ones)
- Maintain context from previous conversation and refer back to it when relevant
`;

        // Build conversation contents for Gemini API
        const contents = [];
        
        // Add system prompt as the first message
        contents.push({
            role: 'user',
            parts: [{ text: systemPrompt }]
        });
        
        contents.push({
            role: 'model',
            parts: [{ text: 'Understood. I will help with Reliance support queries and provide specific, detailed answers.' }]
        });

        // Add conversation history
        if (history && history.length > 0) {
            history.forEach(msg => {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            });
        }

        // Add current query
        contents.push({
            role: 'user',
            parts: [{ text: query }]
        });

        /* ---------------- GEMINI API CALL ---------------- */
        const geminiResponse = await fetch(
            `${GEMINI_API_URL}?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents
                })
            }
        );

        const data = await geminiResponse.json();
        
        // Log the full response for debugging
        console.log('Gemini API Response:', JSON.stringify(data, null, 2));

        // Check if there was an error from Gemini
        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return res.status(200).json({
                response: 'I apologize, but I encountered an issue. Please try again. For Reliance-related queries, contact Reliance support.'
            });
        }

        const answer =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Hello! I am here to help you. For any queries related to Reliance, please contact Reliance support.';

        return res.status(200).json({
            response: answer
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({
            response: 'Internal server error. Please try again later.'
        });
    }
};
