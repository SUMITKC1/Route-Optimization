import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJourneyHistory extends Document {
  user: Types.ObjectId; // Reference to User
  route: {
    label: string;
    lat: number;
    lng: number;
  }[];
  distance: number;
  duration: number;
  algorithm: string;
  createdAt: Date;
}

const JourneyHistorySchema = new Schema<IJourneyHistory>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  route: [
    {
      label: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  ],
  distance: { type: Number, required: true },
  duration: { type: Number, required: true },
  algorithm: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IJourneyHistory>('JourneyHistory', JourneyHistorySchema); 