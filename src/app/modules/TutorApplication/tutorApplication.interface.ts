import { Types } from 'mongoose';

export type TTutorApplication = {
  tutor: Types.ObjectId;
  jobPost: Types.ObjectId;
  status: 'pending' | 'shortlisted' | 'rejected' | 'contacted';
  appliedAt: Date;
};
