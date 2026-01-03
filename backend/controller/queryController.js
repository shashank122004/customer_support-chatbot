export const handleQuery = async (req, res) => {
    try {
        const GEMINI_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        const { query } = req.body;

        if (!query || query.trim() === '') {
            return res.status(400).json({
                response: 'Query is required'
            });
        }

        /* ---------------- FAQ FIRST ---------------- */
        const faqs = [
            {
                keywords: ['warranty'],
                answer:
                    'Warranty depends on the product and brand. Please check your invoice or product page for exact warranty details.'
            },
            {
                keywords: ['installation'],
                answer:
                    'Installation is usually provided for large appliances like ACs, TVs, and washing machines.'
            },
            {
                keywords: ['return', 'refund'],
                answer:
                    'Returns and refunds depend on the product category and condition. Please contact Croma support for assistance.'
            },
            {
                keywords: ['service', 'repair'],
                answer:
                    'You can raise a service or repair request by contacting Croma customer support with your invoice details.'
            },
            {
                keywords: ['delivery'],
                answer:
                    'Delivery timelines depend on your location and product availability.'
            }
        ];

        const lowerQuery = query.toLowerCase();
        const matchedFAQ = faqs.find(faq =>
            faq.keywords.some(k => lowerQuery.includes(k))
        );

        if (matchedFAQ) {
            return res.status(200).json({
                response: matchedFAQ.answer
            });
        }

        /* ---------------- SYSTEM PROMPT ---------------- */
        const systemPrompt = `
You are a professional customer support assistant for Croma,
an electrical appliance retail company.

Rules:
- Answer ONLY Croma-related queries
- Help with appliances, warranty, service, delivery, installation, and returns
- Be polite, concise, and clear
- Do NOT guess information
- If out of scope, politely refuse
`;

        const finalPrompt = `
${systemPrompt}

User query:
${query}
`;

        /* ---------------- GEMINI API CALL ---------------- */
        const geminiResponse = await fetch(
            `${GEMINI_API_URL}?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { parts: [{ text: finalPrompt }] }
                    ]
                })
            }
        );

        const data = await geminiResponse.json();

        const answer =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Sorry, I could not process your request. Please contact Croma support.';

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
