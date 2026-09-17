import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  status: 'todo' | 'attempting' | 'solved' | 'stuck' | 'revisit';
  firstAttemptedAt?: Date;
  solvedAt?: Date;
  attempts: number;
  timeSpentSec: number;
  difficultyFelt: number; // 1-5
  usedEditorial: boolean;
  starred: boolean;
}

const ProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  status: { type: String, enum: ['todo', 'attempting', 'solved', 'stuck', 'revisit'], default: 'todo' },
  firstAttemptedAt: { type: Date },
  solvedAt: { type: Date },
  attempts: { type: Number, default: 0 },
  timeSpentSec: { type: Number, default: 0 },
  difficultyFelt: { type: Number, min: 1, max: 5 },
  usedEditorial: { type: Boolean, default: false },
  starred: { type: Boolean, default: false }
}, { timestamps: true });

ProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
ProgressSchema.index({ userId: 1, status: 1 });

export const Progress: Model<IProgress> = mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);
