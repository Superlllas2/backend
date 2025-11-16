import QuizResult from '../models/QuizResult.js';

const VISIBILITY_VALUES = ['private', 'public'];

export const createResult = async (req, res) => {
    try {
        const {
            topics = [],
            difficulty,
            numberOfQuestions,
            correctCount,
            totalTimeSeconds,
            accuracy,
            answers = [],
            visibility,
            status,
            notes,
        } = req.body;

        if (typeof numberOfQuestions !== 'number' || numberOfQuestions <= 0) {
            return res.status(400).json({ message: 'numberOfQuestions must be a positive number.' });
        }

        if (typeof correctCount !== 'number' || correctCount < 0) {
            return res.status(400).json({ message: 'correctCount must be a non-negative number.' });
        }

        if (answers && !Array.isArray(answers)) {
            return res.status(400).json({ message: 'answers must be an array.' });
        }

        const payload = {
            user: req.user.id,
            topics,
            difficulty,
            numberOfQuestions,
            correctCount,
            totalTimeSeconds,
            accuracy,
            answers,
            visibility,
            status,
            notes,
        };

        const result = await QuizResult.create(payload);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error creating quiz result:', error);
        return res.status(500).json({ message: 'Failed to save quiz result.' });
    }
};

export const listResults = async (req, res) => {
    try {
        const { visibility, user } = req.query;
        const filter = {};

        if (visibility === 'public') {
            filter.visibility = 'public';
            filter.status = 'completed';
        } else {
            filter.user = req.user.id;
            if (user === 'me') {
                filter.user = req.user.id;
            }
        }

        const results = await QuizResult.find(filter).sort({ createdAt: -1 });
        return res.status(200).json(results);
    } catch (error) {
        console.error('Error listing quiz results:', error);
        return res.status(500).json({ message: 'Failed to fetch quiz results.' });
    }
};

export const getResultById = async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'Quiz result not found.' });
        }

        if (result.visibility !== 'public' && result.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this result.' });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching quiz result:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Quiz result not found.' });
        }
        return res.status(500).json({ message: 'Failed to fetch quiz result.' });
    }
};

export const updateResult = async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Quiz result not found.' });
        }

        if (result.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this result.' });
        }

        const updates = {};
        if (typeof req.body.visibility !== 'undefined') {
            if (!VISIBILITY_VALUES.includes(req.body.visibility)) {
                return res.status(400).json({ message: 'Invalid visibility value.' });
            }
            updates.visibility = req.body.visibility;
        }

        if (typeof req.body.notes !== 'undefined') {
            updates.notes = req.body.notes;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        Object.assign(result, updates);
        await result.save();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updating quiz result:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Quiz result not found.' });
        }
        return res.status(500).json({ message: 'Failed to update quiz result.' });
    }
};

export const deleteResult = async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Quiz result not found.' });
        }

        if (result.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this result.' });
        }

        await result.deleteOne();
        return res.status(200).json({ message: 'Quiz result deleted.' });
    } catch (error) {
        console.error('Error deleting quiz result:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Quiz result not found.' });
        }
        return res.status(500).json({ message: 'Failed to delete quiz result.' });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const results = await QuizResult.find({ visibility: 'public', status: 'completed' })
            .sort({ accuracy: -1, correctCount: -1, totalTimeSeconds: 1, createdAt: 1 })
            .limit(limit)
            .populate('user', 'email');

        return res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return res.status(500).json({ message: 'Failed to fetch leaderboard.' });
    }
};
