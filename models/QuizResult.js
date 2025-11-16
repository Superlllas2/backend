import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
    {
        questionText: { type: String },
        options: [{ type: String }],
        correctIndex: { type: Number },
        selectedIndex: { type: Number },
        isCorrect: { type: Boolean, default: false },
    },
    { _id: false }
);

const quizResultSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        topics: [{ type: String }],
        difficulty: {
            type: String,
            enum: ['Friendly', 'Easy', 'Intermediate', 'Hard', 'Immortal'],
        },
        numberOfQuestions: { type: Number, min: 1 },
        correctCount: { type: Number, min: 0 },
        totalTimeSeconds: { type: Number, min: 0 },
        accuracy: { type: Number, min: 0, max: 1 },
        answers: [answerSchema],
        visibility: {
            type: String,
            enum: ['private', 'public'],
            default: 'private',
        },
        status: {
            type: String,
            enum: ['completed', 'abandoned'],
            default: 'completed',
        },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

quizResultSchema.pre('save', function(next) {
    if (
        (typeof this.accuracy !== 'number' || Number.isNaN(this.accuracy)) &&
        typeof this.correctCount === 'number' &&
        typeof this.numberOfQuestions === 'number' &&
        this.numberOfQuestions > 0
    ) {
        this.accuracy = Number((this.correctCount / this.numberOfQuestions).toFixed(4));
    }
    next();
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export default QuizResult;
