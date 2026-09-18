/**
 * dedup_problems.js
 * Removes duplicate problems from the DB (keeping the one with the most useful title)
 * and reports the final count.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const col = mongoose.connection.collection('problems');

  // Find all duplicate URL groups
  const dups = await col.aggregate([
    { $group: { _id: '$url', ids: { $push: '$_id' }, titles: { $push: '$title' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray();

  console.log(`Found ${dups.length} duplicate URL groups. Cleaning...`);

  let removed = 0;
  for (const dup of dups) {
    // Keep the first one (index 0), delete the rest
    const [keep, ...deleteIds] = dup.ids;
    await col.deleteMany({ _id: { $in: deleteIds } });
    removed += deleteIds.length;
    console.log(`  Removed ${deleteIds.length} dups for: ${dup._id}`);
  }

  const finalCount = await col.countDocuments();
  console.log(`\nRemoved ${removed} duplicates.`);
  console.log(`Final problem count: ${finalCount}`);

  // Also update the landing page reference if needed
  const byPlatform = await col.aggregate([
    { $group: { _id: '$platform', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log('\nFinal by platform:', JSON.stringify(byPlatform, null, 2));

  mongoose.disconnect();
});
