import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResource extends Document {
  ownerType: 'topic' | 'pattern';
  ownerId: mongoose.Types.ObjectId;
  kind: 'video' | 'article' | 'playlist' | 'sheet';
  title: string;
  url: string | null;
  author: string;
  needsLink: boolean;
}

const ResourceSchema: Schema = new Schema({
  ownerType: { type: String, enum: ['topic', 'pattern'], required: true },
  ownerId: { type: Schema.Types.ObjectId, required: true },
  kind: { type: String, enum: ['video', 'article', 'playlist', 'sheet'], required: true },
  title: { type: String, required: true },
  url: { type: String, default: null },
  author: { type: String, default: '' },
  needsLink: { type: Boolean, default: false }
}, { timestamps: true });

export const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
