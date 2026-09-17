import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Topic } from '../src/models/Topic';
import { Pattern } from '../src/models/Pattern';
import { Problem } from '../src/models/Problem';
import { Resource } from '../src/models/Resource';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sheetforge';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const seedDataPath = path.join(__dirname, '../seed.json');
  if (!fs.existsSync(seedDataPath)) {
    console.error('seed.json not found!');
    process.exit(1);
  }

  const sheetData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  const sheetId = sheetData.sheetId;

  for (const section of sheetData.sections) {
    for (const topicData of section.topics) {
      console.log(`Seeding topic: ${topicData.title}`);
      
      const topic = await Topic.findOneAndUpdate(
        { slug: topicData.slug },
        {
          sheetId,
          sectionId: section.sectionId,
          slug: topicData.slug,
          title: topicData.title,
          order: topicData.order,
          tier: topicData.tier,
          guidanceMd: topicData.guidanceMd,
          prerequisites: [],
        },
        { upsert: true, new: true }
      );

      // Resources
      const resourceIds = [];
      for (const resData of topicData.resources || []) {
        const resource = await Resource.findOneAndUpdate(
          { url: resData.url, ownerId: topic._id },
          {
            ownerType: 'topic',
            ownerId: topic._id,
            kind: resData.kind,
            title: resData.title,
            url: resData.url,
            author: resData.author,
          },
          { upsert: true, new: true }
        );
        resourceIds.push(resource._id);
      }
      topic.resources = resourceIds;
      await topic.save();

      // Patterns and Problems
      for (const patternData of topicData.patterns || []) {
        const pattern = await Pattern.findOneAndUpdate(
          { topicId: topic._id, slug: patternData.slug },
          {
            topicId: topic._id,
            slug: patternData.slug,
            title: patternData.title,
            order: patternData.order,
            description: ''
          },
          { upsert: true, new: true }
        );

        for (const probData of patternData.problems || []) {
          await Problem.findOneAndUpdate(
            { url: probData.url, patternId: pattern._id },
            {
              patternId: pattern._id,
              topicId: topic._id,
              title: probData.title,
              url: probData.url,
              platform: probData.platform,
              slug: probData.slug,
              order: probData.order,
              source: probData.source
            },
            { upsert: true, new: true }
          );
        }
      }
    }
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding:', err);
  process.exit(1);
});
