import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPattern extends Document {
  userId?: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  order: number;
  description: string;
}

const PatternSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

PatternSchema.index({ topicId: 1, slug: 1 }, { unique: true });
PatternSchema.index({ userId: 1 });
PatternSchema.index({ order: 1 });

export const Pattern: Model<IPattern> = mongoose.models.Pattern || mongoose.model<IPattern>('Pattern', PatternSchema);
