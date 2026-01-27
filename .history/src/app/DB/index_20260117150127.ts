/* eslint-disable no-console */
import { User } from '../modules/User/user.model';

const superUser = {
  name: 'Super Admin',
  email: 'admin@gmail.com',
  password: 'adminpassword',
  phone: '01700000000',
  role: 'super_admin',
  status: 'active',
  credits: 99999,
  location: 'Dhaka',
  gender: 'male',
  experienceYears: 10,
  secondaryInfo: {
    background: 'bangla medium',
    institute: 'Default HSC',
    group: 'science',
    result: '5.00',
    passingYear: '2010',
  },
  higherSecondaryInfo: {
    background: 'bangla medium',
    institute: 'Default SSC',
    group: 'science',
    result: '5.00',
    passingYear: '2012',
  },
  bachelorInfo: {
    institute: 'Default University',
    discipline: 'engineering',
    major: 'Computer Science and Engineering',
    result: '4.00',
    passingYear: '2016',
  },
};

const seedSuperAdmin = async () => {
  const isSuperAdminExits = await User.findOne({ role: 'super_admin' });

  if (!isSuperAdminExits) {
    await User.create(superUser);
    console.log('🚀 Super Admin seeded successfully!');
  }
};

export default seedSuperAdmin;
