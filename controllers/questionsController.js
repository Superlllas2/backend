import axios from 'axios';

export const getQuestions = async (req, res) => {
    const { topics, difficulty, numberOfQuestions } = req.body;

    const difficultySettings = {
        Friendly: 0.2,
        Easy: 0.4,
        Intermediate: 0.6,
        Hard: 0.8,
        Immortal: 1.0,
    };

    const topPValue = difficultySettings[difficulty] ?? 0.6; // fallback

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/responses',
            {
                model: 'gpt-5-mini',
                input: [
                    {
                        role: 'system',
                        content:
                            'You are a helpful assistant that generates unique, difficult-to-answer multiple-choice questions. You MUST respond with a single valid JSON array, nothing else.',
                    },
                    {
                        role: 'user',
                        content: `Generate ${numberOfQuestions} unique multiple-choice questions about the following topics: ${topics}. Difficulty level should be ${difficulty}, where friendly is all-around general knowledge, easy is commonly known information, intermediate requires topic familiarity, hard demands specialized knowledge, and immortal questions involve expert-level or rare details. 

Return ONLY a JSON array, strictly in this format (no extra text, no comments):

[
  { "question": "text", "options": ["opt1", "opt2", "opt3", "opt4"], "answer_index": 2 },
  ...
]`,
                    },
                ],
                max_output_tokens: 1500,
                temperature: 1,
                top_p: topPValue,
                frequency_penalty: 0.2,
                presence_penalty: 0.1,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // New Responses API shape: output[0].content[0].text
        const rawContent =
            response?.data?.output?.[0]?.content?.[0]?.text ?? '';

        console.log('OpenAI Raw Content:', rawContent);

        let generatedQuestions;
        try {
            generatedQuestions = JSON.parse(rawContent);
        } catch (e) {
            console.error('Error parsing JSON from OpenAI:', e.message);
            return res
                .status(502)
                .json({ error: 'Failed to parse questions from OpenAI response' });
        }

        if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
            console.error('Parsed questions are empty or not an array:', generatedQuestions);
            return res
                .status(502)
                .json({ error: 'No valid questions were returned by the model' });
        }

        // Optional: basic validation of structure
        const cleanedQuestions = generatedQuestions.filter((q) => {
            return (
                q &&
                typeof q.question === 'string' &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                Number.isInteger(q.answer_index) &&
                q.answer_index >= 0 &&
                q.answer_index < q.options.length
            );
        });

        if (cleanedQuestions.length === 0) {
            console.error('All questions failed validation:', generatedQuestions);
            return res
                .status(502)
                .json({ error: 'Model returned questions in an invalid format' });
        }

        res.json(cleanedQuestions);
    } catch (error) {
        console.error(
            'Error fetching questions:',
            error.response ? error.response.data : error.message
        );
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};
