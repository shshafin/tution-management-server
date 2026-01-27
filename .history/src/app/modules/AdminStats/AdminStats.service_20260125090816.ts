import { Payment } from '../Payment/payment.model';
import { User } from '../User/user.model';
import { JobPost } from '../JobPost/jobPost.model';
import { TutorApplication } from '../TutorApplication/tutorApplication.model';

const getDashboardStatsFromDB = async () => {
  const [earnings, totalTutors, activeJobs, totalApps] = await Promise.all([

    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    User.countDocuments({ role: 'tutor' }),
    JobPost.countDocuments({ status: 'published' }),
    TutorApplication.countDocuments(),
  ]);

  return {
    totalEarnings: earnings[0]?.total || 0,
    totalTutors,
    activeJobs,
    totalApplications: totalApps,
  };
};

export const AdminStatsService = {
  getDashboardStatsFromDB,
};
