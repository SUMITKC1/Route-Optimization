import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  email: string;
  password?: string;
  provider: 'local' | 'google';
  name?: string;
  picture?: string;
  avatar?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  provider: { type: String, enum: ['local', 'google'], required: true },
  name: { type: String },
  picture: { type: String },
  avatar: { type: String, default: '' },
});

export default mongoose.model<IUser>('User', UserSchema); 