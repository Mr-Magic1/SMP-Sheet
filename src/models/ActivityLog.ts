import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  solvedCount: number;
  minutes: number;
  events: any[];
}

const ActivityLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  solvedCount: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
  events: [{ type: Schema.Types.Mixed }]
}, { timestamps: true });

ActivityLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
