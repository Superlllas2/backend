import GameSession from '../models/GameSession.js';

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const generateUniqueCode = async () => {
    let code = generateCode();
    let exists = await GameSession.findOne({ code });
    while (exists) {
        code = generateCode();
        exists = await GameSession.findOne({ code });
    }
    return code;
};

export const createSession = async (req, res) => {
    try {
        const { mode = 'solo', quizSettings = {}, participants = [] } = req.body;
        const hostId = req.user.id;
        const code = await generateUniqueCode();

        const session = await GameSession.create({
            host: hostId,
            code,
            mode,
            quizSettings,
            participants,
        });

        return res.status(201).json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        return res.status(500).json({ message: 'Failed to create session.' });
    }
};

export const listMySessions = async (req, res) => {
    try {
        const sessions = await GameSession.find({ host: req.user.id }).sort({ updatedAt: -1 });
        return res.status(200).json(sessions);
    } catch (error) {
        console.error('Error listing sessions:', error);
        return res.status(500).json({ message: 'Failed to fetch sessions.' });
    }
};

export const getSessionByCode = async (req, res) => {
    try {
        const code = req.params.code?.toUpperCase();
        const session = await GameSession.findOne({ code });
        if (!session) {
            return res.status(404).json({ message: 'Session not found.' });
        }
        return res.status(200).json(session);
    } catch (error) {
        console.error('Error fetching session by code:', error);
        return res.status(500).json({ message: 'Failed to fetch session.' });
    }
};

export const updateSession = async (req, res) => {
    try {
        const session = await GameSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        if (session.host.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the host can update this session.' });
        }

        const allowedFields = ['mode', 'status', 'quizSettings', 'participants', 'startedAt', 'endedAt'];
        let updated = false;
        allowedFields.forEach((field) => {
            if (typeof req.body[field] !== 'undefined') {
                session[field] = req.body[field];
                updated = true;
            }
        });

        if (!updated) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        await session.save();
        return res.status(200).json(session);
    } catch (error) {
        console.error('Error updating session:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Session not found.' });
        }
        return res.status(500).json({ message: 'Failed to update session.' });
    }
};

export const deleteSession = async (req, res) => {
    try {
        const session = await GameSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        if (session.host.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the host can delete this session.' });
        }

        await session.deleteOne();
        return res.status(200).json({ message: 'Session deleted.' });
    } catch (error) {
        console.error('Error deleting session:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Session not found.' });
        }
        return res.status(500).json({ message: 'Failed to delete session.' });
    }
};
