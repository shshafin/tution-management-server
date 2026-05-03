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

const getAllApplicationsFromDB = async (
  query: Record<string, any>,
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = query?.searchTerm || '';
  const statusFilter = query?.status || '';

  // Build pipeline to search within populated tutor fields
  const pipeline: any[] = [
    // Populate tutor
    {
      $lookup: {
        from: 'users',
        localField: 'tutor',
        foreignField: '_id',
        as: 'tutor',
      },
    },
    { $unwind: '$tutor' },
    // Populate jobPost
    {
      $lookup: {
        from: 'jobposts',
        localField: 'jobPost',
        foreignField: '_id',
        as: 'jobPost',
      },
    },
    { $unwind: '$jobPost' },
  ];

  // Search filter (tutor name or phone)
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { 'tutor.name': { $regex: searchTerm, $options: 'i' } },
          { 'tutor.phone': { $regex: searchTerm, $options: 'i' } },
          { 'jobPost.classLevel': { $regex: searchTerm, $options: 'i' } },
          { 'jobPost.location.shortArea': { $regex: searchTerm, $options: 'i' } },
        ],
      },
    });
  }

  // Status filter
  if (statusFilter) {
    pipeline.push({
      $match: { status: statusFilter },
    });
  }

  // Sort by latest
  pipeline.push({ $sort: { appliedAt: -1 } });

  // Count total before pagination
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await TutorApplication.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Project needed fields
  pipeline.push({
    $project: {
      _id: 1,
      status: 1,
      appliedAt: 1,
      createdAt: 1,
      'tutor._id': 1,
      'tutor.name': 1,
      'tutor.phone': 1,
      'tutor.email': 1,
      'tutor.image': 1,
      'tutor.gender': 1,
      'tutor.location': 1,
      'jobPost._id': 1,
      'jobPost.classLevel': 1,
      'jobPost.subjects': 1,
      'jobPost.studyCategory': 1,
      'jobPost.location': 1,
      'jobPost.minSalary': 1,
      'jobPost.maxSalary': 1,
      'jobPost.guardianName': 1,
      'jobPost.tutoringType': 1,
      'jobPost.status': 1,
    },
  });

  const result = await TutorApplication.aggregate(pipeline);

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
  getAllApplicationsFromDB,
};
