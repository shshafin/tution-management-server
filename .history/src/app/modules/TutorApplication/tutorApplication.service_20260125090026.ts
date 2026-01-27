import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { JobPost } from '../JobPost/jobPost.model';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import { TutorApplication } from './tutorApplication.model';

const applyToJobIntoDB = async (tutorId: string, jobId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isAlreadyApplied = await TutorApplication.findOne({
      tutor: tutorId,
      jobPost: jobId,
    }).session(session);

    if (isAlreadyApplied) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already applied for this job!',
        '',
      );
    }

    const [config, tutor, job] = await Promise.all([
      AdminConfig.findOne().session(session),
      User.findById(tutorId).session(session),
      JobPost.findById(jobId).session(session),
    ]);

    if (!job || job.status !== 'published') {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Job post is not active or not found.',
        '',
      );
    }

    if (job.totalApplications >= 5) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Application limit reached! Maximum 5 tutors can apply for this job.',
        '',
      );
    }

    if (!tutor) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tutor profile not found.', '');
    }

    const applyCost = config?.jobApplyCost || 1;
    if (tutor.credits < applyCost) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Insufficient credits! You need ${applyCost} credits to apply.`,
        '',
      );
    }

    await User.findByIdAndUpdate(
      tutorId,
      { $inc: { credits: -applyCost } },
      { session, new: true },
    );

    await JobPost.findByIdAndUpdate(
      jobId,
      { $inc: { totalApplications: 1 } },
      { session },
    );

    const result = await TutorApplication.create(
      [
        {
          tutor: tutorId,
          jobPost: jobId,
          status: 'pending',
        },
      ],
      { session },
    );

    await session.commitTransaction();
    await session.endSession();

    return result[0];
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const getMyAppliedJobsFromDB = async (tutorId: string) => {
  const result = await TutorApplication.find({ tutor: tutorId })
    .populate({
      path: 'jobPost',
    })
    .sort('-appliedAt');
  return result;
};

export const TutorApplicationService = {
  applyToJobIntoDB,
  getMyAppliedJobsFromDB,
};
