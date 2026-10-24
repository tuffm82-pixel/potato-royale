'use strict';
const http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const {createMultiplayer}=require('./multiplayer-server.cjs');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
function createServer(options={}) {
 const multiplayer=createMultiplayer(options);
 const server=http.createServer(async(req,res)=>{
  if(await multiplayer.handle(req,res))return;
  let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(url==='/')url='/index.html';
  const allowed=/^\/(index\.html|art-gallery\.html|app\.js|animations\.js|animations\.css|online\.js|card-art\.js|game-core\.js|styles\.css|comic\.css)$/.test(url)||/^\/assets\/[a-zA-Z0-9_./-]+\.(png|svg|webp|jpg|jpeg)$/.test(url);
  const file=path.resolve(__dirname,'.'+url);
  if(!allowed||!file.startsWith(__dirname+path.sep)||url.split('/').some(p=>p.startsWith('.'))||!['GET','HEAD'].includes(req.method)){res.writeHead(404).end('Not found');return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});res.end(req.method==='HEAD'?undefined:data);});
 });
 server.requestTimeout=10000;server.headersTimeout=10000;server.on('close',multiplayer.close);return server;
}
if(require.main===module){const port=Number(process.env.PORT)||4173,host=process.env.HOST||'127.0.0.1';createServer().listen(port,host,()=>console.log(`Potato Royale: http://${host}:${port}`));}
module.exports={createServer};
