import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  handles: {
    leetcode?: string;
    codeforces?: string;
    codechef?: string;
    github?: string;
    atcoder?: string;
    gfg?: string;
    cses?: string;
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    dailyGoal: number;
    revisionEnabled: boolean;
    emailDigest: boolean;
    timezone: string;
    publicProfile: boolean;
  };
  streak: {
    current: number;
    longest: number;
    lastActiveDate?: string;
    freezesLeft: number;
  };
  xp: number;
  level: number;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String },
  avatarUrl: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  handles: {
    leetcode: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    codechef: { type: String, default: '' },
    github: { type: String, default: '' },
    atcoder: { type: String, default: '' },
    gfg: { type: String, default: '' },
    cses: { type: String, default: '' },
  },
  settings: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    dailyGoal: { type: Number, default: 3 },
    revisionEnabled: { type: Boolean, default: true },
    emailDigest: { type: Boolean, default: true },
    timezone: { type: String, default: 'UTC' },
    publicProfile: { type: Boolean, default: false },
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: String },
    freezesLeft: { type: Number, default: 3 },
  },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
