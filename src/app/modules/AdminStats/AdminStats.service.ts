/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Payment } from '../Payment/payment.model';
import { User } from '../User/user.model';
import { JobPost } from '../JobPost/jobPost.model';
import { TutorApplication } from '../TutorApplication/tutorApplication.model';
// moment removed — সব date calculation native Date + BD offset (UTC+6) দিয়ে

const getDashboardStatsFromDB = async () => {
  // 🇧🇩 Bangladesh Timezone (UTC+6) — সব date calculation BD midnight অনুযায়ী
  const BD_OFFSET_MS = 6 * 60 * 60 * 1000; // +6 hours in ms
  const nowUTC = new Date();

  // আজকের শুরু (BD midnight → UTC তে convert)
  const bdNow = new Date(nowUTC.getTime() + BD_OFFSET_MS);
  const startOfToday = new Date(
    Date.UTC(bdNow.getUTCFullYear(), bdNow.getUTCMonth(), bdNow.getUTCDate()) - BD_OFFSET_MS,
  );

  // এই সপ্তাহের শুরু (BD time অনুযায়ী, Saturday = 6)
  const bdDay = bdNow.getUTCDay(); // 0=Sun
  const satOffset = bdDay === 6 ? 0 : bdDay + 1; // Sat থেকে কত দিন পেরিয়েছে
  const startOfWeek = new Date(startOfToday.getTime() - satOffset * 24 * 60 * 60 * 1000);

  // এই মাসের শুরু
  const startOfMonth = new Date(
    Date.UTC(bdNow.getUTCFullYear(), bdNow.getUTCMonth(), 1) - BD_OFFSET_MS,
  );

  // গত মাসের শুরু ও শেষ
  const lastMonthDate = new Date(Date.UTC(bdNow.getUTCFullYear(), bdNow.getUTCMonth() - 1, 1));
  const startOfLastMonth = new Date(lastMonthDate.getTime() - BD_OFFSET_MS);
  const endOfLastMonth = new Date(startOfMonth.getTime() - 1); // এই মাসের শুরুর 1ms আগে

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
    todayNewTutors,
    todayNewJobPosts,
    todayNewApplications,
    dailyJobPosts,
    dailyApplications,
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
          createdAt: { $gte: new Date(nowUTC.getTime() - 6 * 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: '+06:00' } },
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
          createdAt: { $gte: new Date(nowUTC.getTime() - 14 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%d', date: '$createdAt', timezone: '+06:00' } },
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
          createdAt: { $gte: new Date(nowUTC.getTime() - 14 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%d', date: '$createdAt', timezone: '+06:00' } },
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
          createdAt: { $gte: new Date(nowUTC.getTime() - 12 * 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: '+06:00' } },
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
      .populate('tutor', 'name email image')
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

    // ১১. আজকের নতুন টিউটর রেজিস্ট্রেশন কাউন্ট
    User.countDocuments({
      role: 'tutor',
      createdAt: { $gte: startOfToday },
    }),

    // ১২. আজকের নতুন জব পোস্ট কাউন্ট (শুধু published)
    JobPost.countDocuments({
      createdAt: { $gte: startOfToday },
      status: 'published',
    }),

    // ১৩. আজকের নতুন টিউটর অ্যাপ্লিকেশন কাউন্ট
    TutorApplication.countDocuments({
      createdAt: { $gte: startOfToday },
    }),

    // ১৪. ডেইলি জব পোস্ট (গত ১৪ দিন)
    JobPost.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(nowUTC.getTime() - 14 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%d', date: '$createdAt', timezone: '+06:00' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { day: '$_id', count: 1, _id: 0 } },
    ]),

    // ১৫. ডেইলি অ্যাপ্লিকেশন (গত ১৪ দিন)
    TutorApplication.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(nowUTC.getTime() - 14 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%d', date: '$createdAt', timezone: '+06:00' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { day: '$_id', count: 1, _id: 0 } },
    ]),
  ]);

  // 🔍 Debug: todayStats values
  console.log('todayStart:', startOfToday);
  console.log('newJobPosts:', todayNewJobPosts);
  console.log('newApplications:', todayNewApplications);
  console.log('newTutors:', todayNewTutors);

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
  const dayOfMonth = bdNow.getUTCDate();
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
    dailyJobPosts,
    dailyApplications,
    monthlyEarnings12,

    // Payment details
    recentPayments,
    paymentStatusBreakdown,

    // আজকের ডেইলি কাউন্টার
    todayStats: {
      newTutors: todayNewTutors,
      newJobPosts: todayNewJobPosts,
      newApplications: todayNewApplications,
    },
  };
};

export const AdminStatsService = {
  getDashboardStatsFromDB,
};
