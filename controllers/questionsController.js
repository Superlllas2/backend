// import apiClient from '../../src/api.js';
//
// export const getQuestions = async (req, res) => {
//
//     const {topics, difficulty, numberOfQuestions} = req.body;
//     const difficultySettings = {
//         Friendly: 0.2,
//         Easy: 0.4,
//         Intermediate: 0.6,
//         Hard: 0.8,
//         Immortal: 1.0
//     };
//
//     const topPValue = difficultySettings[difficulty];
//
//     try {
//         const response = await apiClient.post(
//             'https://api.openai.com/v1/chat/completions',
//             {
//                 model: "gpt-4o-mini",
//                 messages: [
//                     {
//                         role: "system",
//                         content: "You are a helpful assistant that generates unique difficult to answer multiple-choice questions."
//                     },
//                     {
//                         role: "user",
//                         content: `Generate ${numberOfQuestions} unique multiple-choice questions about the following topics: ${topics}. Difficulty level should be ${difficulty}, where friendly is all-around general knowledge, easy is commonly known information, intermediate requires topic familiarity, hard demands specialized knowledge, and immortal questions involve expert-level or rare details. Format each question strictly as: { "question": "text", "options": ["opt1", "opt2", "opt3", "opt4"], "answer_index": 2 }`
//                     }
//                 ],
//                 max_tokens: 1000,
//                 temperature: 1,
//                 frequency_penalty: 0.2,
//                 presence_penalty: 0.1,
//                 top_p: topPValue,
//             },
//             {
//                 headers: {
//                     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
//                 }
//             }
//         );
//
//         // Clean and parse the response
//         const rawContent = response.data.choices[0].message.content;
//         console.log("OpenAI Raw Content:", rawContent); // Log the response for debugging
//
//         // Use a regular expression to extract each JSON object individually
//         const jsonObjects = rawContent.match(/\{.*?}/g) || []; // Matches each JSON object or returns an empty array if none
//
//         // Filter and parse each JSON object
//         const generatedQuestions = jsonObjects.reduce((questions, obj) => {
//             try {
//                 questions.push(JSON.parse(obj));
//             } catch (e) {
//                 console.error("Error parsing question object:", obj, e.message);
//             }
//             return questions;
//         }, []);
//
//         if (generatedQuestions.length === 0) {
//             new Error("No valid questions could be parsed.");
//         }
//
//         res.json(generatedQuestions);
//     } catch (error) {
//         console.error("Error fetching questions:", error.response ? error.response.data : error.message);
//         res.status(500).json({ error: 'Failed to fetch questions' });
//     }
// };
