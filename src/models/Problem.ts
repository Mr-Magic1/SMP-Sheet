import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProblem extends Document {
  userId?: mongoose.Types.ObjectId;
  patternId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  title: string;
  url: string;
  platform: 'leetcode' | 'codeforces' | 'cses' | 'usaco' | 'atcoder' | 'other';
  slug: string;
  difficulty: string | null;
  tags: string[];
  order: number;
  estimatedMinutes: number;
  source: string;
}

const ProblemSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  patternId: { type: Schema.Types.ObjectId, ref: 'Pattern', required: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  platform: { type: String, enum: ['leetcode', 'codeforces', 'cses', 'usaco', 'atcoder', 'other'], required: true },
  slug: { type: String, required: true },
  difficulty: { type: String, default: null },
  tags: [{ type: String }],
  order: { type: Number, required: true },
  estimatedMinutes: { type: Number, default: 30 },
  source: { type: String, required: true }
}, { timestamps: true });

ProblemSchema.index({ userId: 1 });
ProblemSchema.index({ order: 1 });

export const Problem: Model<IProblem> = mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema);
