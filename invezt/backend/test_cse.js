import axios from 'axios';

const baseURL = 'https://www.cse.lk/api/';
const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.cse.lk/',
    'Origin': 'https://www.cse.lk',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

async function testCSE() {
  console.log('--- Testing getFinancialAnnouncement ---');
  try {
    const res = await client.post('getFinancialAnnouncement');
    console.log('Status:', res.status);
    const announcements = res.data?.reqFinancialAnnouncemnets || [];
    console.log('Announcements Found:', announcements.length);
    if (announcements.length > 0) {
        console.log('First Announcement Sample:', JSON.stringify(announcements[0]).slice(0, 200));
    }
  } catch (error) {
    console.error('getFinancialAnnouncement failed:', error.message);
  }

  console.log('\n--- Testing companyInfoSummery (Standardized Symbols) ---');
  const symbolsToTest = ['COMB', 'comb', 'HNB', 'JKH.N0000'];
  
  for (const sym of symbolsToTest) {
    try {
      let formattedSym = sym.toUpperCase().trim();
      if (formattedSym.length <= 5 && !formattedSym.includes('.')) {
        formattedSym = `${formattedSym}.N0000`;
      }
      
      console.log(`Testing: ${sym} -> ${formattedSym}`);
      const params = new URLSearchParams();
      params.append('symbol', formattedSym);
      const res = await client.post('companyInfoSummery', params);
      console.log(`  Success for ${formattedSym}:`, !!res.data?.reqSymbolInfo);
    } catch (error) {
      console.error(`  Failed for ${sym}:`, error.message);
    }
  }
}

testCSE();
