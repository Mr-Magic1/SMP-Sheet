/**
 * reseed.js
 * Runs parse.js to regenerate seed.json, then completely replaces the DB
 * with the fresh deduplicated data (upsert by URL, no duplicates).
 */
const { execSync } = require('child_process');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Step 1: Re-run parse.js to regenerate seed.json
console.log('🔄 Re-parsing source documents...');
execSync('node scripts/parse.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

const seed = require('../seed.json');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection;
  const topicCol = db.collection('topics');
  const patternCol = db.collection('patterns');
  const problemCol = db.collection('problems');
  const resourceCol = db.collection('resources');

  console.log('\n🗑  Clearing existing data...');
  await Promise.all([
    topicCol.deleteMany({}),
    patternCol.deleteMany({}),
    problemCol.deleteMany({}),
    resourceCol.deleteMany({}),
  ]);

  const { ObjectId } = mongoose.Types;

  let totalProblems = 0;
  let totalResources = 0;
  const seenUrls = new Set();
  let skippedDups = 0;

  for (const section of seed.sections) {
    for (const topic of section.topics) {
      const topicId = new ObjectId();
      await topicCol.insertOne({
        _id: topicId,
        title: topic.title,
        slug: topic.slug,
        order: topic.order,
        guidanceMd: topic.guidanceMd || '',
      });

      // Resources
      for (const res of topic.resources || []) {
        await resourceCol.insertOne({
          topicId,
          kind: res.kind,
          title: res.title,
          url: res.url,
          order: res.order,
        });
        totalResources++;
      }

      // Patterns & problems
      for (const pattern of topic.patterns || []) {
        const patternId = new ObjectId();
        await patternCol.insertOne({
          _id: patternId,
          topicId,
          title: pattern.title,
          slug: pattern.slug,
          order: pattern.order,
        });

        for (const problem of pattern.problems || []) {
          // Normalize URL for dedup check
          const normUrl = problem.url.replace(/\/+$/, '').toLowerCase().split('?')[0];
          if (seenUrls.has(normUrl)) {
            skippedDups++;
            continue;
          }
          seenUrls.add(normUrl);

          await problemCol.insertOne({
            topicId,
            patternId,
            title: problem.title,
            url: problem.url,
            platform: problem.platform,
            slug: problem.slug || '',
            order: problem.order,
          });
          totalProblems++;
        }
      }
    }
  }

  console.log(`\n✅ Seeded successfully!`);
  console.log(`   Problems: ${totalProblems} (skipped ${skippedDups} duplicates)`);
  console.log(`   Resources: ${totalResources}`);

  const byPlatform = await problemCol.aggregate([
    { $group: { _id: '$platform', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log('\n   By platform:');
  byPlatform.forEach(p => console.log(`     ${p._id}: ${p.count}`));

  mongoose.disconnect();
});
