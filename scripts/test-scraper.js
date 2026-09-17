const cheerio = require('cheerio');

async function testCodechef(handle) {
  try {
    const html = await fetch(`https://www.codechef.com/users/${handle}`).then(r => r.text());
    const $ = cheerio.load(html);
    const rating = $('.rating-number').text().trim();
    // Usually the fully solved is in a section like: "Fully Solved (123)"
    const solvedMatch = html.match(/Fully Solved\s*\(\s*(\d+)\s*\)/i);
    const solved = solvedMatch ? solvedMatch[1] : '0';
    console.log('CodeChef:', { rating, solved });
  } catch (e) {
    console.log('CodeChef Error:', e.message);
  }
}

async function testAtCoder(handle) {
  try {
    const html = await fetch(`https://atcoder.jp/users/${handle}`).then(r => r.text());
    const $ = cheerio.load(html);
    // <th class="no-break">Rating</th><td><span class="user-red">3916</span>
    const ratingStr = $('th:contains("Rating")').next('td').find('span').first().text();
    const rating = ratingStr || '0';
    console.log('AtCoder:', { rating });
  } catch (e) {
    console.log('AtCoder Error:', e.message);
  }
}

async function testGFG(handle) {
  try {
    const html = await fetch(`https://auth.geeksforgeeks.org/user/${handle}/practice/`).then(r => r.text());
    const $ = cheerio.load(html);
    // Usually "Overall Coding Score" or "Problems Solved"
    // The classes change often. Let's look for "Problems Solved"
    const scoreText = $('.score_cards_container .score_card').filter(function() {
      return $(this).text().includes('Overall Coding Score');
    }).find('.score_card_value').text();
    console.log('GFG:', { scoreText });
  } catch (e) {
    console.log('GFG Error:', e.message);
  }
}

async function testCSES(handle) {
    try {
        const html = await fetch(`https://cses.fi/user/${handle}`).then(r => r.text());
        const $ = cheerio.load(html);
        const solvedStr = $('td:contains("resolved tasks")').next().text();
        console.log('CSES:', { solvedStr });
    } catch (e) {
        console.log('CSES Error:', e.message);
    }
}

testCodechef('gennady.korotkevich');
testAtCoder('tourist');
testGFG('kailash');
testCSES('1'); // ID is used usually for CSES
