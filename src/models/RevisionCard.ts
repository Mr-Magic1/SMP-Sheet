import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRevisionCard extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  ease: number;
  intervalDays: number;
  dueDate: Date;
  reps: number;
  lapses: number;
  lastReviewedAt: Date;
}

const RevisionCardSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  ease: { type: Number, default: 2.5 },
  intervalDays: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  reps: { type: Number, default: 0 },
  lapses: { type: Number, default: 0 },
  lastReviewedAt: { type: Date }
}, { timestamps: true });

RevisionCardSchema.index({ userId: 1, dueDate: 1 });
RevisionCardSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export const RevisionCard: Model<IRevisionCard> = mongoose.models.RevisionCard || mongoose.model<IRevisionCard>('RevisionCard', RevisionCardSchema);
