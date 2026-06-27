import http from 'node:http';

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 3000, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const start = Date.now();
    const r = http.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ ms: Date.now() - start, body: JSON.parse(raw) }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

const login = await req('POST', '/api/users/login', { email: 'admin@eniac.edu.br', senha: 'admin123' });
const token = login.body.data?.token;
console.log(`Login: ${login.ms}ms`);

// Inspect dashboard shape
const dash = await req('GET', '/api/reports/dashboard', null, token);
console.log(`Dashboard: ${dash.ms}ms`);
console.log('  top keys:', Object.keys(dash.body));
if (dash.body.data) console.log('  data keys:', Object.keys(dash.body.data));

// Inspect ninebox shape
const nb = await req('GET', '/api/ninebox/calculate-all', null, token);
console.log(`NineBox: ${nb.ms}ms`);
console.log('  top keys:', Object.keys(nb.body));
if (nb.body.data) console.log('  data keys:', Object.keys(nb.body.data));

// Get user id and inspect report
const ul = await req('GET', '/api/users?limit=1', null, token);
const uid = ul.body.data?.users?.[0]?.id;
const report = await req('GET', `/api/reports/user/${uid}`, null, token);
console.log(`UserReport: ${report.ms}ms`);
console.log('  top keys:', Object.keys(report.body));
if (report.body.data) console.log('  data keys:', Object.keys(report.body.data));
