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
      res.on('end', () => resolve({ ms: Date.now() - start, status: res.statusCode, body: JSON.parse(raw) }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

const login = await req('POST', '/api/users/login', { email: 'admin@eniac.edu.br', senha: 'admin123' });
const token = login.body.data?.token;
console.log(`Login: ${login.ms}ms status=${login.status}`);

const dash = await req('GET', '/api/reports/dashboard', null, token);
console.log(`Dashboard: ${dash.ms}ms status=${dash.status} => ${JSON.stringify(dash.body).slice(0,200)}`);

const nb = await req('GET', '/api/ninebox/calculate-all', null, token);
console.log(`NineBox: ${nb.ms}ms status=${nb.status} => ${JSON.stringify(nb.body).slice(0,200)}`);

const ul = await req('GET', '/api/users?limit=1', null, token);
const uid = ul.body.data?.users?.[0]?.id;
const report = await req('GET', `/api/reports/user/${uid}`, null, token);
console.log(`UserReport: ${report.ms}ms status=${report.status} => ${JSON.stringify(report.body).slice(0,300)}`);
