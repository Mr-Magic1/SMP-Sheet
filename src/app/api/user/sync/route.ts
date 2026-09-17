import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as cheerio from 'cheerio';

export const maxDuration = 30; // Max timeout for scraping
export const revalidate = 3600; // Cache for 1 hour

async function fetchLeetCode(handle: string) {
  if (!handle) return null;
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      solved: data.totalSolved || 0,
      rating: Math.round(data.contributionPoint || 0), // LC API sometimes doesn't expose contest rating directly without another call
      rank: data.ranking || 'N/A'
    };
  } catch {
    return null;
  }
}

async function fetchCodeforces(handle: string) {
  if (!handle) return null;
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    if (!res.ok) return null;
    const data = await res.json();
    const user = data.result[0];
    return {
      solved: user.friendOfCount || 0, // Codeforces API doesn't return total solved easily, use rating
      rating: user.rating || 0,
      rank: user.rank || 'Unrated',
      maxRating: user.maxRating || 0
    };
  } catch {
    return null;
  }
}

async function fetchCodeChef(handle: string) {
  if (!handle) return null;
  try {
    const res = await fetch(`https://codechef-api.vercel.app/handle/${handle}`);
    if (!res.ok) {
      // Fallback to manual scraping
      const html = await fetch(`https://www.codechef.com/users/${handle}`).then(r => r.text());
      const $ = cheerio.load(html);
      const rating = parseInt($('.rating-number').text().trim()) || 0;
      return { rating, solved: 0, rank: 'N/A' };
    }
    const data = await res.json();
    return {
      solved: data.fullySolved || 0,
      rating: data.currentRating || 0,
      rank: data.stars || 'N/A'
    };
  } catch {
    return null;
  }
}

async function fetchAtCoder(handle: string) {
  if (!handle) return null;
  try {
    const html = await fetch(`https://atcoder.jp/users/${handle}`).then(r => r.text());
    const $ = cheerio.load(html);
    const ratingStr = $('th:contains("Rating")').next('td').find('span').first().text();
    return {
      solved: 0, // Not easily scrapeable from profile
      rating: parseInt(ratingStr) || 0,
      rank: 'N/A'
    };
  } catch {
    return null;
  }
}

async function fetchGFG(handle: string) {
  if (!handle) return null;
  try {
    const res = await fetch(`https://geeks-for-geeks-api.vercel.app/${handle}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      solved: data.totalProblemsSolved || 0,
      rating: data.codingScore || 0,
      rank: 'N/A'
    };
  } catch {
    return null;
  }
}

async function fetchGithub(handle: string) {
  if (!handle) return null;
  try {
    const res = await fetch(`https://api.github.com/users/${handle}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      solved: data.public_repos || 0,
      rating: data.followers || 0,
      rank: 'N/A'
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const handles = user.handles || {};

    const [leetcode, codeforces, codechef, github, atcoder, gfg] = await Promise.all([
      fetchLeetCode(handles.leetcode || ''),
      fetchCodeforces(handles.codeforces || ''),
      fetchCodeChef(handles.codechef || ''),
      fetchGithub(handles.github || ''),
      fetchAtCoder(handles.atcoder || ''),
      fetchGFG(handles.gfg || '')
    ]);

    const stats = {
      leetcode,
      codeforces,
      codechef,
      github,
      atcoder,
      gfg,
      cses: null // CSES scraping requires specific setup
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json({ error: 'Failed to sync platforms' }, { status: 500 });
  }
}
