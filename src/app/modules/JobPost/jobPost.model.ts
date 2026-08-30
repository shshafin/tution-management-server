import { Schema, model } from 'mongoose';
import { IJobPost } from './jobPost.interface';

const jobPostSchema = new Schema<IJobPost>(
  {
    guardianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    tutoringType: {
      type: String,
      enum: ['offline', 'online'],
      required: true,
    },
    guardianPhone: { type: String, required: true },
    guardianName: { type: String, required: true },
    location: {
      shortArea: {
        type: String,
        required: function (this: { tutoringType?: string }) {
          return this.tutoringType !== 'online';
        },
      },
      mapAddress: {
        type: String,
        required: function (this: { tutoringType?: string }) {
          return this.tutoringType !== 'online';
        },
      },
      detailedAddress: { type: String },

      type: {
        type: String,
        enum: ['Point'],
        // No default: online jobs omit location entirely (avoids empty Point breaking 2dsphere)
      },
      coordinates: {
        type: [Number],
        required: function (this: { tutoringType?: string }) {
          return this.tutoringType !== 'online';
        },
      },
      districtId: { type: String },
      districtName: { type: String },
      districtNameBn: { type: String },
      upazilaId: { type: String },
      upazilaName: { type: String },
      upazilaNameBn: { type: String },
    },
    studentGender: { type: String, enum: ['male', 'female'], required: true },
    tutorGenderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      required: true,
    },
    // 🟢 Lowercase Enums (Tutor Sync)
    studyCategory: {
      type: String,
      enum: [
        'bangla medium',
        'english medium',
        'english version',
        'admission test',
        'specialized learning',
        'madrasa',
      ],
      required: true,
    },
    classLevel: { type: String, required: true },
    subjects: {
      type: [String],
      required: true,
    },
    specialPreferences: {
      isExperiencedRequired: { type: Boolean, default: false },
      isPublicVarsityRequired: { type: Boolean, default: false },
      isSubjectBackgroundRequired: { type: Boolean, default: false },
      selectedSubjectBackground: {
        type: [String],
        // 🟢 Discipline Sync: engineering, medical, etc.
        enum: [
          'engineering',
          'medical',
          'business',
          'science',
          'social science',
          'fine_arts',
        ],
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
    // 🟢 ইন্টারফেস অনুযায়ী শুধু Number (১-৭)
    daysPerWeek: { type: Number, required: true },
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

jobPostSchema.index({ location: '2dsphere' });

jobPostSchema.index({
  status: 1,
  isOtpVerified: 1,
  studyCategory: 1,
  classLevel: 1,
});

jobPostSchema.pre('validate', function (next) {
  if (!this.isNew) {
    return next();
  }
  const loc = this.location as any;
  const detailed =
    typeof loc?.detailedAddress === 'string' ? loc.detailedAddress.trim() : '';
  const coords = loc?.coordinates;
  const coordsOk =
    Array.isArray(coords) &&
    coords.length === 2 &&
    Number.isFinite(Number(coords[0])) &&
    Number.isFinite(Number(coords[1]));
  const areaOk =
    typeof loc?.shortArea === 'string' && loc.shortArea.trim().length > 0;
  const mapOk =
    typeof loc?.mapAddress === 'string' && loc.mapAddress.trim().length > 0;
  if (!areaOk || !mapOk || detailed.length < 5 || !coordsOk) {
    return next(
      new Error(
        'জব পোস্টের জন্য এলাকা সিলেক্ট এবং বাসার বিস্তারিত ঠিকানা আবশ্যক',
      ),
    );
  }
  next();
});

export const JobPost = model<IJobPost>('JobPost', jobPostSchema);
