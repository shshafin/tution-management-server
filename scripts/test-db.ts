require('dotenv').config();
import mongoose from 'mongoose';
import config from '../src/app/config';
import { User } from '../src/app/modules/User/user.model';

async function test() {
  await mongoose.connect(config.database_url as string);
  const user = await User.findOne({ role: 'tutor' }).sort({ createdAt: -1 });
  console.log('Sample Tutor:', user);
  if (user) {
    const tutorType = user.tutorType;
    console.log('Tutor Type:', tutorType);
    console.log('Location:', user.location);
  }
  process.exit(0);
}
test();
