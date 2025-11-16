import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        nickname: { type: String },
        score: { type: Number, default: 0 },
        isHost: { type: Boolean, default: false },
    },
    { _id: false }
);

const quizSettingsSchema = new mongoose.Schema(
    {
        topics: [{ type: String }],
        difficulty: { type: String },
        numberOfQuestions: { type: Number },
    },
    { _id: false }
);

const gameSessionSchema = new mongoose.Schema(
    {
        host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        code: { type: String, unique: true, required: true },
        mode: {
            type: String,
            enum: ['solo', 'versus', 'co-op'],
            default: 'solo',
        },
        status: {
            type: String,
            enum: ['lobby', 'in_progress', 'finished'],
            default: 'lobby',
        },
        quizSettings: quizSettingsSchema,
        participants: [participantSchema],
        startedAt: { type: Date },
        endedAt: { type: Date },
    },
    { timestamps: true }
);

gameSessionSchema.index({ code: 1 }, { unique: true });

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession;
