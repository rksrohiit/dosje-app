const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting CI API Integration Tests...');

  // 1. Health Check
  const health = await request({ host: 'localhost', port: 5000, path: '/api/dashboard/health', method: 'GET' });
  if (health.statusCode !== 200 || health.body.status !== 'ok') {
    throw new Error(`Health check failed: ${JSON.stringify(health.body)}`);
  }
  console.log('✅ 1/3 Health Check passed');

  // 2. Login Check
  const login = await request(
    { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@dosje.gov.in', password: 'Admin@123' }
  );
  if (login.statusCode !== 200 || !login.body.token) {
    throw new Error(`Login failed: ${JSON.stringify(login.body)}`);
  }
  const token = login.body.token;
  console.log(`✅ 2/3 Auth Login passed (Role: ${login.body.user.role})`);

  // 3. Stats Check
  const stats = await request(
    { host: 'localhost', port: 5000, path: '/api/dashboard/stats', method: 'GET', headers: { Authorization: `Bearer ${token}` } }
  );
  if (stats.statusCode !== 200 || stats.body.total_ngos !== 10) {
    throw new Error(`Stats check failed: ${JSON.stringify(stats.body)}`);
  }
  console.log(`✅ 3/3 Dashboard Stats passed (${stats.body.total_ngos} NGOs online)`);

  console.log('🎉 ALL CI TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ CI TEST FAILED:', err.message);
  process.exit(1);
});
