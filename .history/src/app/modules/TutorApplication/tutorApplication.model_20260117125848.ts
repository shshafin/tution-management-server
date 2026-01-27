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
      ref: 'JobPost', // তোর JobPost মডেলের নাম যদি 'JobPost' হয়
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

/**
 * High-Level Protection:
 * একই টিউটর যেন একই জবে দুইবার অ্যাপ্লাই করতে না পারে।
 * ডাটাবেস লেভেলে এই ইউনিক ইনডেক্স থাকলে ডুপ্লিকেট ডাটা ঢোকা অসম্ভব।
 */
tutorApplicationSchema.index({ tutor: 1, jobPost: 1 }, { unique: true });

export const TutorApplication = model<TTutorApplication>(
  'TutorApplication',
  tutorApplicationSchema,
);
