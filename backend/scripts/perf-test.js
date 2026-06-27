// Quick performance test — run with: node scripts/perf-test.js
import fetch from 'node:http';

const BASE = 'http://localhost:3000';

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const start = Date.now();
    const r = fetch.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        const ms = Date.now() - start;
        try { resolve({ ms, data: JSON.parse(raw) }); }
        catch { resolve({ ms, raw }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  // Login
  const login = await req('POST', '/api/users/login', { email: 'admin@eniac.edu.br', senha: 'admin123' });
  const token = login.data?.data?.token;
  if (!token) { console.error('Login falhou:', login); process.exit(1); }
  console.log(`Login:              ${login.ms}ms`);

  // Dashboard
  const dash = await req('GET', '/api/reports/dashboard', null, token);
  const d = dash.data?.data;
  console.log(`Dashboard:          ${dash.ms}ms | usuarios=${d?.totalUsuarios} avaliacoes=${d?.totalAvaliacoes} media=${d?.mediaGeral}`);

  // NineBox calculateAll
  const nb = await req('GET', '/api/ninebox/calculate-all', null, token);
  console.log(`NineBox calc-all:   ${nb.ms}ms | team=${nb.data?.data?.total}`);

  // User list to get an ID
  const users = await req('GET', '/api/users?limit=1', null, token);
  const uid = users.data?.data?.users?.[0]?.id;

  // User report
  const report = await req('GET', `/api/reports/user/${uid}`, null, token);
  const rd = report.data?.data;
  console.log(`UserReport:         ${report.ms}ms | recebidas=${rd?.avaliacoesRecebidas} feitas=${rd?.avaliacoesFeitas} media=${rd?.mediaGeral}`);

  // Pending campaigns (gestor)
  const glogin = await req('POST', '/api/users/login', { email: 'joao.silva@eniac.edu.br', senha: 'senha123' });
  const gtoken = glogin.data?.data?.token;
  const pending = await req('GET', '/api/campaigns/pending', null, gtoken);
  console.log(`PendingCampaigns:   ${pending.ms}ms | count=${Array.isArray(pending.data?.data) ? pending.data.data.length : '?'}`);
}

main().catch(console.error);
