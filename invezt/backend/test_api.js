import axios from 'axios';

async function testCSE() {
  console.log('Testing CSE API: https://www.cse.lk/api/tradeSummary');
  try {
    const response = await axios.post('https://www.cse.lk/api/tradeSummary', {}, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    if (response.data) {
      const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.reqTradeSummary || response.data);
      console.log('Success! Data type:', typeof data, 'IsArray:', Array.isArray(data));
      if (Array.isArray(data)) {
        console.log('Items count:', data.length);
        if (data.length > 0) {
          console.log('Sample item:', data[0]);
        }
      }
    }
  } catch (error) {
    console.error('API Request Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testCSE();
