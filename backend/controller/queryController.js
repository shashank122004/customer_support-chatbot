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

        /* ---------------- FAQ FIRST (UNCHANGED) ---------------- */
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

        /* ---------------- STRONG SYSTEM PROMPT ---------------- */
        const systemPrompt = `
You are a professional customer support assistant for Croma,
an electrical appliance retail company.

You must answer ONLY based on the information below.

Croma Support Knowledge Base:

Warranty & Invoice:
- Warranty depends on product and brand and is mentioned on the invoice
- Lost invoices can be recovered via customer support using registered mobile number

Installation & Demo:
- Installation is generally provided for ACs, TVs, refrigerators, washing machines
- Installation may be free or paid depending on product and brand
- Installation usually happens within a few working days after delivery

Service & Repair:
- Service requests are raised via Croma customer support
- Repair time depends on issue and spare part availability

Delivery & Orders:
- Delivery timelines depend on location and product availability
- Delivery can often be rescheduled before dispatch
- Order tracking details are shared via SMS or email

Returns & Refunds:
- Returns depend on product category and condition
- Refunds are processed after return approval within a few working days
- Opened products may not always be eligible for return

Payments:
- Payment methods include cards, UPI, net banking, and EMI
- EMI availability depends on product and bank
- Failed payments with deduction should be reported to customer support

Rules:
- Be polite, clear, and concise
- you can guess or invent information based on the knowledge base above
- If the query is outside Croma services, politely say you cannot help
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
