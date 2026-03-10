/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Payment } from '../Payment/payment.model';
import { User } from '../User/user.model';
import { JobPost } from '../JobPost/jobPost.model';
import { TutorApplication } from '../TutorApplication/tutorApplication.model';
import moment from 'moment';

const getDashboardStatsFromDB = async () => {
  const startOfToday = moment().startOf('day').toDate();
  const startOfWeek = moment().startOf('week').toDate();
  const startOfMonth = moment().startOf('month').toDate();
  const startOfLastMonth = moment()
    .subtract(1, 'month')
    .startOf('month')
    .toDate();
  const endOfLastMonth = moment().subtract(1, 'month').endOf('month').toDate();

  const [
    earnings,
    totalTutors,
    activeJobs,
    totalApps,
    incomeStats,
    growthStats,
    dailyTutorGrowth,
    dailyEarnings,
    lastMonthEarnings,
    monthlyEarnings12,
    recentPayments,
    paymentStatusBreakdown,
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

    // ৫. ডেইলি টিউটর রেজিস্ট্রেশন (গত ১৪ দিন)
    User.aggregate([
      {
        $match: {
          role: 'tutor',
          createdAt: { $gte: moment().subtract(14, 'days').toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { day: '$_id', count: 1, _id: 0 } },
    ]),

    // ৬. ডেইলি পেমেন্ট (গত ১৪ দিন)
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: moment().subtract(14, 'days').toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { day: '$_id', amount: 1, _id: 0 } },
    ]),

    // ৭. গত মাসের আয় (growth % এর জন্য)
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // ৮. গত ১২ মাসের monthly earnings (bar chart এর জন্য)
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: moment().subtract(12, 'months').toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', amount: 1, count: 1, _id: 0 } },
    ]),

    // ৯. সর্বশেষ ১০টা payment (table এর জন্য)
    Payment.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email image')
      .lean(),

    // ১০. Payment status breakdown
    Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
      { $project: { status: '$_id', count: 1, total: 1, _id: 0 } },
    ]),
  ]);

  // গত মাস vs এই মাস growth %
  const thisMonthEarning = incomeStats[0]?.monthly || 0;
  const lastMonthEarning = lastMonthEarnings[0]?.total || 0;
  const monthlyGrowthPercent =
    lastMonthEarning === 0
      ? 100
      : Math.round(
          ((thisMonthEarning - lastMonthEarning) / lastMonthEarning) * 100,
        );

  // Average daily earning (এই মাসের)
  const dayOfMonth = moment().date();
  const avgDailyEarning =
    dayOfMonth > 0 ? Math.round(thisMonthEarning / dayOfMonth) : 0;

  return {
    totalEarnings: earnings[0]?.total || 0,
    totalTutors,
    activeJobs,
    totalApplications: totalApps,

    // আয়ের বিস্তারিত
    incomeRatio: {
      today: incomeStats[0]?.today || 0,
      weekly: incomeStats[0]?.weekly || 0,
      monthly: thisMonthEarning,
      lastMonth: lastMonthEarning,
      monthlyGrowthPercent,
      avgDailyEarning,
    },

    // Charts data
    tutorGrowth: growthStats,
    dailyTutorGrowth,
    dailyEarnings,
    monthlyEarnings12,

    // Payment details
    recentPayments,
    paymentStatusBreakdown,
  };
};

export const AdminStatsService = {
  getDashboardStatsFromDB,
};
