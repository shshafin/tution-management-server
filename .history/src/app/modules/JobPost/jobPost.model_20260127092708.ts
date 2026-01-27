import { Schema, model } from 'mongoose';
import { TJobPost } from './jobPost.interface';

const jobPostSchema = new Schema<TJobPost>(
  {
    tutoringType: { type: String, enum: ['home', 'online'], required: true },
    guardianPhone: { type: String, required: true },
    location: { type: String, required: true },
    studentGender: { type: String, enum: ['male', 'female'], required: true },
    tutorGenderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      required: true,
    },
    studyCategory: {
      type: String,
      enum: [
        'Bangla Medium',
        'English Medium',
        'English Version',
        'Admission Test',
      ],
      required: true,
    },
    classLevel: { type: String, required: true },
    subjects: {
      type: [String],
      required: true,
      // ডাটাবেস লেভেলে এনাম ভ্যালিডেশন (অপশনাল কিন্তু নিরাপদ)
    },
    specialPreferences: {
      isExperiencedRequired: { type: Boolean, default: false },
      isPublicVarsityRequired: { type: Boolean, default: false },
      isSubjectBackgroundRequired: { type: Boolean, default: false },
      selectedSubjectBackground: {
        type: [String],
        enum: ['CSE', 'English', 'Math', 'Physics', 'Chemistry', 'Biology'],
      },
    },
    minSalary: { type: Number, required: true },
    maxSalary: { type: Number, required: true },
    numberOfStudents: { type: Number, default: 1 },
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'tutor_availability'],
      required: true,
    },
    daysPerWeek: { type: [Number], required: true },
    demoClassDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'published', 'closed'],
      default: 'pending',
    },
    totalApplications: {
      type: Number,
      default: 0,
    },
    isOtpVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const JobPost = model<TJobPost>('JobPost', jobPostSchema);
