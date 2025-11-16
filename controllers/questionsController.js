import axios from 'axios';

export const getQuestions = async (req, res) => {

    const {topics, difficulty, numberOfQuestions} = req.body;
    const difficultySettings = {
        Friendly: 0.2,
        Easy: 0.4,
        Intermediate: 0.6,
        Hard: 0.8,
        Immortal: 1.0
    };

    const topPValue = difficultySettings[difficulty] ?? 0.6;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-5-mini",
                messages: [
                    {
                        role: "system",
                        content: "You must output ONLY valid JSON. No prose or explanations."
                    },
                    {
                        role: "user",
                        content: `Generate ${numberOfQuestions} questions about ${topics}.\nUse difficulty ${difficulty}.\nReturn format MUST be:\n[\n  {\n    "question": "text",\n    "options": ["opt1", "opt2", "opt3", "opt4"],\n    "answer_index": 2\n  }\n]\nNo markdown, no commentary.`
                    }
                ],
                reasoning_effort: "medium",
                verbosity: "medium",
                max_completion_tokens: 3500
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        const raw = response.data.choices[0].message.content;
        console.log("RAW OPENAI OUTPUT:", raw);

        let questions;
        try {
            questions = JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse OpenAI response:", raw);
            return res.status(502).json({ error: "Invalid format from OpenAI" });
        }

        const isValid = Array.isArray(questions) && questions.every((q) => {
            return (
                q && typeof q === 'object' &&
                typeof q.question === 'string' &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                q.options.every((opt) => typeof opt === 'string') &&
                Number.isInteger(q.answer_index) &&
                q.answer_index >= 0 &&
                q.answer_index <= 3
            );
        });

        if (!isValid) {
            console.error("Invalid data from OpenAI:", questions);
            return res.status(502).json({ error: "Invalid format from OpenAI" });
        }

        res.json(questions);
    } catch (error) {
        if (error.response) {
            console.error("Error fetching questions:", error.response.status, error.response.data);
        } else {
            console.error("Error fetching questions:", error.message);
        }
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};
