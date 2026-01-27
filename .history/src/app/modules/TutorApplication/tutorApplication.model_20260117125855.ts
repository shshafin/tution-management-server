import { Schema, model } from 'mongoose';
import { TTutorApplication } from './tutorApplication.interface';

const tutorApplicationSchema = new Schema<TTutorApplication>(
  {
    tutor: {
      type: Schema.Types.ObjectId,
      ref: 'User', // তোর User মডেলের নাম যদি 'User' হয়
      required: true,
    },
    jobPost: {
      type: Schema.Types.ObjectId,
      ref: 'JobPost',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'contacted'],
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);


tutorApplicationSchema.index({ tutor: 1, jobPost: 1 }, { unique: true });

export const TutorApplication = model<TTutorApplication>(
  'TutorApplication',
  tutorApplicationSchema,
);
