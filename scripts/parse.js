const fs = require('fs');
const path = require('path');

const smpDocPath = path.join(__dirname, '../../SMP Skill Prep Doc.md');
const extraDir = path.join(__dirname, '../../extra');
const smpContent = fs.readFileSync(smpDocPath, 'utf8');

// ── Map: link anchor text in SMP doc → local file in /extra ──────────────
const docMapping = {
  'Binary search questions': 'Binary_Search_Problem_Set.docx.md',
  'Binary_Search_Problem_Set.docx': 'Binary_Search_Problem_Set.docx.md',
  'String Questions': 'String Questions.md',
  'Number_Theory_Problem_Set.docx': 'Number_Theory_Problem_Set.docx.md',
  'TwoPointer Problems': 'TwoPointer Problems.md',
  'Stacks_Queues_Problem_Set': 'Stacks_Queues_Problem_Set.md',
  'PriorityQueue': 'PriorityQueue.md',
  'LeetCode Graph Study Guide & Problem List': 'LeetCode Graph Study Guide & Problem List.md',
  'DP Problems': 'DP Problems.md',
  'Segment_Tree_Problem_Set.docx': 'Segment_Tree_Problem_Set.docx.md',
  'Binary Tree & BST Prblms': 'Binary Tree & BST Prblms.md',
};

// Files that should merge into an existing topic (slug) rather than creating standalone
const fileToTopicSlug = {
  'Binary_Search_Problem_Set.docx.md': 'binary-search',
  'Number_Theory_Problem_Set.docx.md': 'number-theory-maths',
  'Segment_Tree_Problem_Set.docx.md': 'segment-trees',
  'Stacks_Queues_Problem_Set.md': 'stacks-queues',
};

// ── Helpers ───────────────────────────────────────────────────────────────

let orderTopic = 1;
let orderPattern = 1;
let orderProblem = 1;

function titleFromUrl(url) {
  // Remove trailing /description/, /solution/, etc.
  let clean = url
    .replace(/[?#].*$/, '')        // strip query/fragment
    .replace(/\/(description|solution|submissions?|discuss)\/*/gi, '')
    .replace(/\/+$/, '')            // trailing slashes
    .trim();

  const slug = clean.split('/').filter(Boolean).pop() || '';

  // Codeforces: .../problem/816/B  → "CF 816B"
  const cfMatch = url.match(/codeforces\.com\/problemset\/problem\/([0-9]+)\/([A-Za-z0-9]+)/);
  if (cfMatch) return `CF ${cfMatch[1]}${cfMatch[2]}`;

  // CSES: .../task/1234  → "CSES 1234"
  const csesMatch = url.match(/cses\.fi\/problemset\/task\/([0-9]+)/);
  if (csesMatch) return `CSES ${csesMatch[1]}`;

  // LeetCode: .../problems/some-slug  → "Some Slug"
  const lcMatch = url.match(/leetcode\.com\/problems\/([^/]+)/);
  if (lcMatch) {
    return lcMatch[1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() || url;
}

function detectPlatform(url) {
  if (url.includes('leetcode.com')) return 'leetcode';
  if (url.includes('codeforces.com')) return 'codeforces';
  if (url.includes('cses.fi')) return 'cses';
  if (url.includes('usaco.guide')) return 'usaco';
  if (url.includes('interviewbit.com')) return 'interviewbit';
  return 'other';
}

// Returns true for learning resources (videos / articles), not practice problems
function isResource(url) {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('geeksforgeeks.org') ||
    url.includes('medium.com') ||
    url.includes('cp-algorithms.com') ||
    url.includes('takeuforward.org') ||
    url.includes('codewitharyan.com') ||
    url.includes('linkedin.com') ||
    url.includes('leetcode.com/discuss/post') ||
    url.includes('leetcode.com/discuss/general-discussion') ||
    url.includes('interviewbit.com/courses') ||
    url.includes('usaco.guide') ||
    url.includes('codeforces.com/blog') ||
    url.includes('codeforces.com/topic') ||
    url.includes('codeforces.com/edu') ||
    url.includes('codeforces.com/contests/')
  );
}

/**
 * Extract (title, url) pairs from a single line.
 * Handles:
 *   - Markdown links:  [Title](url)
 *   - Plain URLs:      https://...
 *   - HTML &nbsp; / * / - prefix noise
 */
function extractLinks(line) {
  // Strip HTML entities and common list-item decorations
  const clean = line
    .replace(/&nbsp;/g, ' ')
    .replace(/^\s*[-*•]\s*/, '')
    .trim();

  const links = [];
  const mdLinkRe = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  const plainUrlRe = /(?<!\()(https?:\/\/[^\s\)>\]"',]+)/g;

  let m;
  const mdUrls = new Set();

  // 1) Markdown links
  while ((m = mdLinkRe.exec(clean)) !== null) {
    let title = m[1].trim();
    let url = m[2].trim().replace(/[.,;)\]]+$/, '');
    mdUrls.add(url);
    if (title.startsWith('http')) title = titleFromUrl(url);
    links.push({ title, url });
  }

  // 2) Plain URLs (not already captured inside markdown)
  const stripped = clean.replace(mdLinkRe, '');
  while ((m = plainUrlRe.exec(stripped)) !== null) {
    let url = m[1].replace(/[.,;)\]]+$/, '');
    if (mdUrls.has(url)) continue;
    links.push({ title: titleFromUrl(url), url });
  }

  return links;
}

/**
 * Push a link into the right bucket (resource or problem).
 */
function pushLink(link, topic, pattern) {
  const { title, url } = link;

  // Skip navigation / meta links
  if (url.includes('docs.google.com')) return;
  if (url.includes('linkedin.com')) return;

  const platform = detectPlatform(url);

  if (isResource(url)) {
    if (!topic.resources.some(r => r.url === url)) {
      topic.resources.push({
        kind: (url.includes('youtu')) ? 'video' : 'article',
        title,
        url,
        author: 'SMP Prep Doc',
      });
    }
  } else {
    const p = {
      title,
      url,
      platform,
      slug: (title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + orderProblem).replace(/^-+|-+$/g, ''),
      order: orderProblem++,
      source: 'smp-sheet',
    };

    let target = pattern;
    if (!target) {
      if (topic.patterns.length === 0) {
        topic.patterns.push({ title: 'General', slug: 'general', order: orderPattern++, problems: [] });
      }
      target = topic.patterns[topic.patterns.length - 1];
    }

    if (!target.problems.some(e => e.url === url)) {
      target.problems.push(p);
    }
  }
}

/**
 * Process a single line: detect new pattern headings, extract links.
 * Returns the updated currentPattern.
 */
function processLine(line, topic, currentPattern) {
  if (!topic) return currentPattern;

  const trimmed = line.replace(/&nbsp;/g, ' ').trim();
  if (!trimmed) return currentPattern;

  // Detect numbered pattern heading ONLY if not a pure resource/guidance line:
  // e.g. "1. Prefix Sum", "2. Knapsack / DP on Subsequences"
  const numMatch = trimmed.match(/^(\d+)[\\.)\s]+(.+)$/);
  if (numMatch) {
    let rawTitle = numMatch[2]
      .replace(/\*\*/g, '')
      .replace(/\\\./g, '.')
      .replace(/\\\+/g, '+')
      .trim();

    // Strip trailing markdown link or URL from the title
    rawTitle = rawTitle.replace(/\s*[\[<].*$/, '').trim();

    // Only create a new pattern if the title looks like a concept, not a long guidance sentence
    const looksLikePattern = rawTitle.length > 0 && rawTitle.length < 80
      && !/^https?:\/\//i.test(rawTitle)
      && !/^(complete|do|first|also|start|solve|practice|learn|refer|after|see|follow|use|btw|note|puri|study|you|gem|good|zinda)/i.test(rawTitle);

    if (looksLikePattern) {
      currentPattern = {
        title: rawTitle,
        slug: rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        order: orderPattern++,
        problems: [],
      };
      topic.patterns.push(currentPattern);
    }
  }

  // Bullet-point sub-pattern headings (inside extra files)
  // e.g. "### 2. Binary Search on Answer"
  const headingMatch = trimmed.match(/^#{1,4}\s+\**(\d+[\\.)\s]+)?(.+?)\**\s*$/);
  if (headingMatch && !numMatch) {
    let title = headingMatch[2]
      .replace(/\\\./g, '.')
      .replace(/\*\*/g, '')
      .trim();
    title = title.replace(/\s*[\[<].*$/, '').trim();

    if (title.length > 2 && title.length < 120
      && !/^https?:\/\//i.test(title)
      && !/^(warning|do not|note:|ps:|also)/i.test(title)) {
      currentPattern = {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        order: orderPattern++,
        problems: [],
      };
      topic.patterns.push(currentPattern);
    }
  }

  // Extract all links on this line
  const links = extractLinks(trimmed);
  for (const link of links) {
    pushLink(link, topic, currentPattern);
  }

  // Check for Google Doc links → record for extra-file parsing
  const gdocRe = /\[([^\]]+)\]\((https:\/\/docs\.google\.com\/document\/d\/[^\)]+)\)/g;
  let gm;
  while ((gm = gdocRe.exec(trimmed)) !== null) {
    const anchor = gm[1].trim();
    const localFile = docMapping[anchor];
    if (localFile) {
      // Return the file so the caller can schedule it
      if (!topic._pendingFiles) topic._pendingFiles = [];
      if (!topic._pendingFiles.includes(localFile)) {
        topic._pendingFiles.push(localFile);
      }
    }
  }

  // Markdown table row with a problem link
  // | # | Subtopic | [Title](url) |
  const tableRe = /\|\s*\d+\s*\|[^|]*\|\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  let tm;
  while ((tm = tableRe.exec(trimmed)) !== null) {
    const title = tm[1].trim();
    const url = tm[2].trim();
    // Only add if not already captured
    if (!links.some(l => l.url === url)) {
      pushLink({ title, url }, topic, currentPattern);
    }
  }

  return currentPattern;
}

// ── Parse a local extra markdown file ────────────────────────────────────

function parseExtraFile(filename, topic) {
  const filePath = path.join(extraDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ File not found: ${filePath}`);
    return;
  }
  console.log(`  📄 Parsing extra file: ${filename}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let pat = null;
  for (let line of lines) {
    pat = processLine(line, topic, pat);
  }
}

// ── Main pass over the SMP Skill Prep Doc ────────────────────────────────

const sheet = {
  sheetId: 'smp-prep-sheet',
  sections: [{ sectionId: 'dsa-prep', topics: [] }],
};

const lines = smpContent.split('\n');
let currentTopic = null;
let currentPattern = null;

// Skip giant base64 image data lines
function looksLikeBase64(line) {
  return line.length > 500 && /^[A-Za-z0-9+/=]{200,}/.test(line.trim());
}

for (let line of lines) {
  if (looksLikeBase64(line)) continue;

  const trimmed = line.replace(/&nbsp;/g, ' ').trim();
  if (!trimmed || trimmed === '&nbsp;') continue;

  // ─ Topic heading detection ─────────────────────────────────────────
  // Matches:  ## Array:  /  # Graphs: /  ## Binary Search :&nbsp;
  if (/^#{1,3}\s/.test(trimmed) && !trimmed.toLowerCase().startsWith('## for')) {
    const rawTitle = trimmed.replace(/^#{1,3}\s+/, '').replace(/&nbsp;.*$/, '').trim();

    // Only create a topic if the heading has a colon (matches SMP doc structure)
    if (rawTitle.includes(':') && rawTitle.length < 60) {
      const title = rawTitle.split(':')[0].trim();
      if (title.length > 1) {
        currentTopic = {
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tier: 'core',
          order: orderTopic++,
          patterns: [],
          resources: [],
          guidanceMd: '',
        };
        sheet.sections[0].topics.push(currentTopic);
        currentPattern = null;
        console.log(`\n📚 Topic: ${title}`);
      }
      continue; // don't fall through to processLine for a heading-only line
    }
  }

  if (currentTopic) {
    currentPattern = processLine(line, currentTopic, currentPattern);
  }
}

// DP topic uses a "## For the Problems..." heading that we skipped above.
// Make sure DP Problems file is always attached to the DP topic.
const dpTopic = sheet.sections[0].topics.find(t => t.slug === 'dynamic-programming');
if (dpTopic && !dpTopic._pendingFiles) dpTopic._pendingFiles = [];
if (dpTopic && !dpTopic._pendingFiles.includes('DP Problems.md')) {
  dpTopic._pendingFiles.push('DP Problems.md');
}

// ── Parse all attached extra files ───────────────────────────────────────
console.log('\n--- Parsing Extra Files ---');
const parsedFiles = new Set();

for (const topic of sheet.sections[0].topics) {
  for (const filename of (topic._pendingFiles || [])) {
    if (!parsedFiles.has(filename)) {
      parseExtraFile(filename, topic);
      parsedFiles.add(filename);
    }
  }
  delete topic._pendingFiles;
}

// Merge any extra files that were not yet linked via pendingFiles
const extraFiles = fs.readdirSync(extraDir).filter(f => f.endsWith('.md'));
for (const file of extraFiles) {
  if (parsedFiles.has(file)) continue;

  const targetSlug = fileToTopicSlug[file];
  if (targetSlug) {
    const topic = sheet.sections[0].topics.find(t => t.slug === targetSlug);
    if (topic) {
      console.log(`\n📎 Merging ${file} → ${topic.title}`);
      parseExtraFile(file, topic);
      parsedFiles.add(file);
    }
  } else {
    console.log(`\n⚠ Skipping unmapped extra file: ${file}`);
  }
}

// ── Print summary ─────────────────────────────────────────────────────────
let totalProblems = 0, totalResources = 0;
for (const topic of sheet.sections[0].topics) {
  let tp = topic.patterns.reduce((s, p) => s + p.problems.length, 0);
  totalProblems += tp;
  totalResources += topic.resources.length;
  console.log(`  ${topic.title}: ${tp} problems, ${topic.resources.length} resources`);
}
console.log(`\n✅ Total: ${totalProblems} problems, ${totalResources} resources across ${sheet.sections[0].topics.length} topics`);

fs.writeFileSync(path.join(__dirname, '../seed.json'), JSON.stringify(sheet, null, 2));
console.log('Seed JSON created at seed.json');
