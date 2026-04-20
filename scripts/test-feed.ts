require('dotenv').config();
import mongoose from 'mongoose';
import config from '../src/app/config';
import { JobPostService } from '../src/app/modules/JobPost/jobPost.service';
import { User } from '../src/app/modules/User/user.model';

async function test() {
  await mongoose.connect(config.db_url as string);
  console.log('DB Connected');
  
  // Find an offline tutor
  const user = await User.findOne({ role: 'tutor', tutorType: 'offline' }).lean();
  let tutorType = ['offline'];
  let lat = 23.8103;
  let lng = 90.4125;

  if (user) {
    console.log('Found Tutor:', user.email, 'type:', user.tutorType, 'loc:', user.location?.coordinates);
    if (user.tutorType) tutorType = user.tutorType as string[];
    if (user.location?.coordinates) {
      lng = user.location.coordinates[0];
      lat = user.location.coordinates[1];
    }
  }

  // Create queryData exactly like controller
  const queryData = {
    tutorType: tutorType,
    latitude: lat,
    longitude: lng
  };
  
  console.log('Querying feed with:', queryData);
  try {
    const jobs = await JobPostService.getTutorJobFeedFromDB(queryData);
    console.log(`Feed returned ${jobs.length} jobs.`);
    if (jobs.length > 0) {
      console.log('First job distance from tutor loc?:', jobs[0].location?.coordinates);
      // Let's also check total jobs in DB for comparison
      const totalJobs = await mongoose.connection.db.collection('jobposts').countDocuments({ status: 'published' });
      console.log('Total published jobs in DB:', totalJobs);
    }
  } catch (err) {
    console.error('Error in service:', err);
  }
  
  process.exit(0);
}
test();
