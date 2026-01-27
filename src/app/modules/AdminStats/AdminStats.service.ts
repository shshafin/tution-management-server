/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Payment } from '../Payment/payment.model';
import { User } from '../User/user.model';
import { JobPost } from '../JobPost/jobPost.model';
import { TutorApplication } from '../TutorApplication/tutorApplication.model';
import moment from 'moment'; // 🟢 'npm install moment' করে নিস, সময় হ্যান্ডেল করা সহজ হবে

const getDashboardStatsFromDB = async () => {
  const now = new Date();
  const startOfToday = moment().startOf('day').toDate();
  const startOfWeek = moment().startOf('week').toDate();
  const startOfMonth = moment().startOf('month').toDate();

  const [
    earnings,
    totalTutors,
    activeJobs,
    totalApps,
    incomeStats,
    growthStats,
  ] = await Promise.all([
    // ১. টোটাল আর্নিং
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // ২. কাউন্টগুলো
    User.countDocuments({ role: 'tutor' }),
    JobPost.countDocuments({ status: 'published' }),
    TutorApplication.countDocuments(),

    // ৩. ইনকাম রেশিও (Today, Weekly, Monthly)
    Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          today: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfToday] }, '$amount', 0],
            },
          },
          weekly: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfWeek] }, '$amount', 0],
            },
          },
          monthly: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$amount', 0],
            },
          },
        },
      },
    ]),

    // ৪. টিউটর গ্রোথ (গত ৬ মাস)
    User.aggregate([
      {
        $match: {
          role: 'tutor',
          createdAt: { $gte: moment().subtract(6, 'months').toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          tutors: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', tutors: 1, _id: 0 } },
    ]),
  ]);

  return {
    totalEarnings: earnings[0]?.total || 0,
    totalTutors,
    activeJobs,
    totalApplications: totalApps,
    incomeRatio: {
      today: incomeStats[0]?.today || 0,
      weekly: incomeStats[0]?.weekly || 0,
      monthly: incomeStats[0]?.monthly || 0,
    },
    tutorGrowth: growthStats, // এটা সরাসরি চার্টে বসবে (Array of objects)
  };
};

export const AdminStatsService = {
  getDashboardStatsFromDB,
};
