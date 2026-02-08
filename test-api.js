const http = require('http');

const encodedEmail = encodeURIComponent('nirbhayrajput003@gmail.com');
const path = `/api/package-inquiries/user/${encodedEmail}`;

console.log('Testing endpoint:', path);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: path,
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
