import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as cheerio from 'cheerio';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

async function fetchLeetCode(handle: string) {
  if (!handle) return null;
  try {
    const query = `
      query getUserProfile($username: String!) { 
        matchedUser(username: $username) { 
          submitStats: submitStatsGlobal { 
            acSubmissionNum { difficulty count } 
          } 
          profile { ranking } 
        } 
        userContestRanking(username: $username) { rating } 
      }
    `;
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username: handle } })
    });
    
    if (!res.ok) return null;
    const { data } = await res.json();
    
    if (!data.matchedUser) return null; // user not found

    const stats = data.matchedUser.submitStats.acSubmissionNum;
    const getCount = (diff: string) => stats.find((s: any) => s.difficulty === diff)?.count || 0;

    return {
      solved: getCount('All'),
      rating: Math.round(data.userContestRanking?.rating || 0),
      rank: data.matchedUser.profile?.ranking || 'N/A',
      easy: getCount('Easy'),
      medium: getCount('Medium'),
      hard: getCount('Hard')
    };
  } catch (e) {
    console.error('LC sync error:', e);
    return null;
  }
}

async function fetchCodeforces(handle: string) {
  if (!handle) return null;
  try {
    const [infoRes, statusRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
      fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
    ]);
    
    if (!infoRes.ok || !statusRes.ok) return null;
    
    const infoData = await infoRes.json();
    const statusData = await statusRes.json();
    
    if (infoData.status !== 'OK' || statusData.status !== 'OK') return null;

    const user = infoData.result[0];
    
    let easy = 0, medium = 0, hard = 0;
    const solvedSet = new Set<string>();

    for (const s of statusData.result) {
      if (s.verdict === 'OK') {
        const pId = `${s.problem.contestId}-${s.problem.index}`;
        if (!solvedSet.has(pId)) {
          solvedSet.add(pId);
          const rating = s.problem.rating || 0;
          if (rating > 0 && rating < 1200) easy++;
          else if (rating >= 1200 && rating <= 1900) medium++;
          else if (rating > 1900) hard++;
        }
      }
    }

    return {
      solved: solvedSet.size,
      rating: user.rating || 0,
      rank: user.rank || 'Unrated',
      easy,
      medium,
      hard,
      maxRating: user.maxRating || 0
    };
  } catch (e) {
    console.error('CF sync error:', e);
    return null;
  }
}

async function fetchCodeChef(handle: string) {
  if (!handle) return null;
  try {
    const res = await fetch(`https://codechef-api.vercel.app/handle/${handle}`);
    if (!res.ok || (res.headers.get('content-type') && !res.headers.get('content-type')?.includes('application/json'))) {
      // Fallback to manual scraping
      const html = await fetch(`https://www.codechef.com/users/${handle}`).then(r => r.text());
      const $ = cheerio.load(html);
      const rating = parseInt($('.rating-number').text().trim()) || 0;
      
      const solvedMatch = html.match(/Total Problems Solved:\s*(\d+)/i);
      const solved = solvedMatch ? parseInt(solvedMatch[1]) : 0;
      const rank = $('.rating-star').text().trim() || 'N/A';
      
      return { rating, solved, rank };
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
    if (!res.ok || (res.headers.get('content-type') && !res.headers.get('content-type')?.includes('application/json'))) {
      throw new Error("API failed");
    }
    const data = await res.json();
    if (data.error) throw new Error("API failed");
    return {
      solved: data.totalProblemsSolved || 0,
      rating: data.codingScore || 0,
      rank: 'N/A'
    };
  } catch {
    // Fallback to manual scraping
    try {
      const html = await fetch(`https://www.geeksforgeeks.org/user/${handle}/`).then(r => r.text());
      const scoreMatch = html.match(/\\?"coding_score\\?":(\d+)/i);
      const solvedMatch = html.match(/\\?"total_problems_solved\\?":(\d+)/i);
      return {
        solved: solvedMatch ? parseInt(solvedMatch[1]) : 0,
        rating: scoreMatch ? parseInt(scoreMatch[1]) : 0,
        rank: 'N/A'
      };
    } catch {
      return null;
    }
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
