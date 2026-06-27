import http from 'node:http';
function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = { hostname:'localhost',port:3000,path,method, headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...(data?{'Content-Length':Buffer.byteLength(data)}:{})} };
    const start=Date.now();
    const r=http.request(opts,res=>{let raw='';res.on('data',c=>raw+=c);res.on('end',()=>resolve({ms:Date.now()-start,status:res.statusCode,body:JSON.parse(raw)}));});
    r.on('error',reject);if(data)r.write(data);r.end();
  });
}
const login = await req('POST','/api/users/login',{email:'admin@eniac.edu.br',senha:'admin123'});
const token = login.body.data?.token;

const dash = await req('GET','/api/reports/dashboard',null,token);
console.log('Dashboard status:', dash.status, 'ms:', dash.ms);
console.log('Full body:', JSON.stringify(dash.body, null, 2));
