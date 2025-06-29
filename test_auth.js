// Simple authentication test script
import https from 'https';

function testLogin() {
  const postData = JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  });

  const options = {
    hostname: '789cafd9-60b1-45fc-a05b-b50f1641a728-00-1g3qtyvlbb8so.spock.replit.dev',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', data);
      try {
        const response = JSON.parse(data);
        if (response.status === 'success') {
          console.log('✅ Login successful!');
          console.log('User:', response.user);
        } else {
          console.log('❌ Login failed:', response.message);
        }
      } catch (e) {
        console.log('❌ Failed to parse response:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.write(postData);
  req.end();
}

testLogin();