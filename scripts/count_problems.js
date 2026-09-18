const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await mongoose.connection.collection('problems').countDocuments();
  console.log('Total problems in DB:', count);

  const byPlatform = await mongoose.connection.collection('problems').aggregate([
    { $group: { _id: '$platform', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log('By platform:', JSON.stringify(byPlatform, null, 2));

  // Check for duplicates by URL
  const dups = await mongoose.connection.collection('problems').aggregate([
    { $group: { _id: '$url', count: { $sum: 1 }, titles: { $push: '$title' } } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]).toArray();
  console.log('\nDuplicate URLs:', dups.length);
  if (dups.length > 0) console.log(JSON.stringify(dups.slice(0, 5), null, 2));

  mongoose.disconnect();
});
