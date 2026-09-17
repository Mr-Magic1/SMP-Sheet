import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  bodyMd: string;
  snippets: {
    language: string;
    code: string;
    label: string;
  }[];
}

const NoteSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  bodyMd: { type: String, default: '' },
  snippets: [{
    language: String,
    code: String,
    label: String
  }]
}, { timestamps: true });

NoteSchema.index({ bodyMd: 'text' });
NoteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
