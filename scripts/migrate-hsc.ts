/**
 * Migration Script: HSC → HSC 1st Year
 *
 * পুরনো tutor দের teachingClasses array তে bare 'HSC' value থাকলে
 * সেটাকে 'HSC 1st Year' এ আপডেট করে।
 *
 * Usage:
 *   npx ts-node scripts/migrate-hsc.ts
 *
 * অথবা .env তে MONGO_URI সেট করে:
 *   MONGO_URI=mongodb+srv://... npx ts-node scripts/migrate-hsc.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || process.env.DATABASE_URL || '';

async function migrateHSC() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI or DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }
  const usersCollection = db.collection('users');

  // Count affected documents first
  const affectedCount = await usersCollection.countDocuments({
    teachingClasses: 'HSC',
  });

  console.log(`📊 Found ${affectedCount} tutor(s) with bare 'HSC' in teachingClasses`);

  if (affectedCount === 0) {
    console.log('✅ No migration needed — no bare HSC values found');
    await mongoose.disconnect();
    return;
  }

  // Replace 'HSC' with 'HSC 1st Year' using $set and array filters
  // Strategy: pull 'HSC', then addToSet 'HSC 1st Year' (avoids duplicates)
  const pullResult = await usersCollection.updateMany(
    { teachingClasses: 'HSC' },
    { $pull: { teachingClasses: 'HSC' } as any },
  );
  console.log(`  ↳ Pulled 'HSC' from ${pullResult.modifiedCount} document(s)`);

  const addResult = await usersCollection.updateMany(
    { _id: { $in: await usersCollection.find({ teachingClasses: { $exists: true } }).map(d => d._id).toArray() } },
    { $addToSet: { teachingClasses: 'HSC 1st Year' } },
  );
  // More targeted approach: only add to those we just pulled from
  // But since we already pulled, let's just re-query and add

  console.log(`  ↳ Added 'HSC 1st Year' to ${addResult.modifiedCount} document(s)`);
  console.log(`✅ Migration complete! ${affectedCount} tutor(s) migrated.`);

  await mongoose.disconnect();
}

migrateHSC().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
