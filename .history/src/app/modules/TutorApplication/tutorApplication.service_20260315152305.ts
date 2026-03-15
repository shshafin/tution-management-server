import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { JobPost } from '../JobPost/jobPost.model';
import { AdminConfig } from '../AdminConfig/adminConfig.model';
import { TutorApplication } from './tutorApplication.model';

const applyToJobIntoDB = async (tutorId: string, jobId: string) => {
  const isAlreadyApplied = await TutorApplication.findOne({
    tutor: tutorId,
    jobPost: jobId,
  });

  if (isAlreadyApplied) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already applied for this job!',
      '',
    );
  }

  const [config, tutor, job] = await Promise.all([
    AdminConfig.findOne(),
    User.findById(tutorId),
    JobPost.findById(jobId),
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

  await User.findByIdAndUpdate(tutorId, { $inc: { credits: -applyCost } });
  await JobPost.findByIdAndUpdate(jobId, { $inc: { totalApplications: 1 } });

  const result = await TutorApplication.create({
    tutor: tutorId,
    jobPost: jobId,
    status: 'pending',
  });

  return result;
};

const getMyAppliedJobsFromDB = async (
  tutorId: string,
  query: Record<string, any>,
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const result = await TutorApplication.find({ tutor: tutorId })
    .populate('jobPost')
    .sort('-appliedAt')
    .skip(skip)
    .limit(limit);

  const total = await TutorApplication.countDocuments({ tutor: tutorId });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

export const TutorApplicationService = {
  applyToJobIntoDB,
  getMyAppliedJobsFromDB,
};
