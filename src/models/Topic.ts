import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopic extends Document {
  sheetId: string;
  sectionId: string;
  slug: string;
  title: string;
  order: number;
  tier: 'foundation' | 'core' | 'advanced' | 'boss';
  guidanceMd: string;
  prerequisites: string[]; // slugs
  resources: any[];
}

const TopicSchema: Schema = new Schema({
  sheetId: { type: String, required: true },
  sectionId: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  order: { type: Number, required: true },
  tier: { type: String, enum: ['foundation', 'core', 'advanced', 'boss'], required: true },
  guidanceMd: { type: String, default: '' },
  prerequisites: [{ type: String }],
  resources: [{ type: Schema.Types.Mixed }] // Can reference external Resource docs or embedded
}, { timestamps: true });

export const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
