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

const login  = await req('POST', '/api/users/login', { email: 'admin@eniac.edu.br', senha: 'admin123' });
const token  = login.body.data?.token;
console.log(`Login:             ${login.ms}ms`);

const dash   = await req('GET', '/api/reports/dashboard', null, token);
const d      = dash.body.data;
console.log(`Dashboard:         ${dash.ms}ms | usuarios=${d?.totalUsuarios} avaliacoes=${d?.totalAvaliacoes} media=${d?.mediaGeral}`);

const nb     = await req('GET', '/api/ninebox/calculate-all', null, token);
console.log(`NineBox calc-all:  ${nb.ms}ms | team=${nb.body.data?.total}`);

const ul     = await req('GET', '/api/users?limit=1', null, token);
const uid    = ul.body.data?.users?.[0]?.id;
const report = await req('GET', `/api/reports/user/${uid}`, null, token);
const rd     = report.body.data;
console.log(`UserReport:        ${report.ms}ms | recebidas=${rd?.avaliacoesRecebidas} feitas=${rd?.avaliacoesFeitas} media=${rd?.mediaGeral}`);

const gl     = await req('POST', '/api/users/login', { email: 'joao.silva@eniac.edu.br', senha: 'senha123' });
const gt     = gl.body.data?.token;
const pend   = await req('GET', '/api/campaigns/pending', null, gt);
console.log(`PendingCampaigns:  ${pend.ms}ms | count=${pend.body.data?.length ?? JSON.stringify(pend.body).slice(0,80)}`);
