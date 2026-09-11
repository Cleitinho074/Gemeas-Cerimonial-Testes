import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'ta-marcado.sqlite'));
db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,nome TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,owner TEXT REFERENCES users(id),titulo TEXT NOT NULL,tipo TEXT NOT NULL,data TEXT NOT NULL,local TEXT NOT NULL,prazo TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS access(event_id TEXT REFERENCES events(id),user_id TEXT REFERENCES users(id),PRIMARY KEY(event_id,user_id));
CREATE TABLE IF NOT EXISTS guests(id TEXT PRIMARY KEY,event_id TEXT REFERENCES events(id),token TEXT UNIQUE NOT NULL,nome TEXT NOT NULL,telefone TEXT NOT NULL,grupo TEXT NOT NULL,limite INTEGER NOT NULL,status TEXT NOT NULL,lugares INTEGER NOT NULL DEFAULT 0,restricao TEXT NOT NULL DEFAULT '',criancas INTEGER NOT NULL DEFAULT 0,recado TEXT NOT NULL DEFAULT '',respondido TEXT NOT NULL DEFAULT '',UNIQUE(event_id,telefone));
CREATE INDEX IF NOT EXISTS idx_guests_event ON guests(event_id);
CREATE TABLE IF NOT EXISTS gifts(id TEXT PRIMARY KEY,event_id TEXT REFERENCES events(id),nome TEXT NOT NULL,valor REAL NOT NULL,guest_id TEXT REFERENCES guests(id));
CREATE INDEX IF NOT EXISTS idx_gifts_event ON gifts(event_id);`);
const id = () => randomBytes(18).toString('hex');
const get = (sql, ...args) => db.prepare(sql).get(...args);
const all = (sql, ...args) => db.prepare(sql).all(...args);
const run = (sql, ...args) => db.prepare(sql).run(...args);
const hash = password => { const salt=id(); return salt+':'+scryptSync(password,salt,64).toString('hex'); };
function verify(password, stored) { const [salt,key]=stored.split(':'); return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(key,'hex')); }
function transaction(fn) { db.exec('BEGIN IMMEDIATE'); try {const result=fn();db.exec('COMMIT');return result;} catch(e){db.exec('ROLLBACK');throw e;} }
function user(nome,email,password,role) {const uid=id();run('INSERT INTO users VALUES(?,?,?,?,?)',uid,nome,email,hash(password),role);return uid;}
function event(owner,titulo,tipo,data,local,prazo) {const eid=id();run('INSERT INTO events VALUES(?,?,?,?,?,?,?)',eid,owner,titulo,tipo,data,local,prazo);return eid;}
function guest(eid,g) {const gid=id();run('INSERT INTO guests(id,event_id,token,nome,telefone,grupo,limite,status,lugares,restricao,criancas,respondido) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',gid,eid,id(),g.nome,g.telefone,g.grupo||'Sem grupo',g.limite||2,g.status||'pendente',g.lugares||0,g.restricao||'',g.criancas||0,g.respondido||'');return gid;}
if (!get('SELECT id FROM users LIMIT 1')) transaction(()=>{
 const organizer=user('Ana Beatriz','ana@teste.local','Teste123!','noiva');
 const planner=user('Camila Duarte','cerimonial@teste.local','Teste123!','cerimonialista');
 const eid=event(organizer,'Ana & Marcos','Casamento','2026-12-12','Sítio das Palmeiras','2026-12-05');
 run('INSERT INTO access VALUES(?,?)',eid,planner);
 const names=['Fernanda Alves','Rodrigo Souza','Camila e Bruno','Marta Ribeiro','Juliana Prima','Diego Martins','Larissa Gomes','Paulo e Renata','Beatriz Nunes','Carlos Eduardo'];
 const statuses=['confirmado','confirmado','pendente','recusado','confirmado','pendente','aprovacao','confirmado','pendente','recusado'];
 names.forEach((nome,i)=>guest(eid,{nome,telefone:'119'+String(80000000+i),grupo:['Família da noiva','Trabalho','Faculdade','Família do noivo'][i%4],status:statuses[i],limite:i===4?3:2,lugares:statuses[i]==='confirmado'?(i===4?3:2):0}));
 for(const [nome,valor] of [['Jogo de panelas antiaderente',389],['Jogo de cama casal',260],['Conjunto de taças',150]])run('INSERT INTO gifts VALUES(?,?,?,?,NULL)',id(),eid,nome,valor);
 for(const [titulo,tipo,date] of [['Debutante da Beatriz','Debutante','2026-10-20'],['50 anos do Sr. Otávio','Aniversário','2026-11-05']]) {const e=event(organizer,titulo,tipo,date,'Espaço de eventos',date);run('INSERT INTO access VALUES(?,?)',e,planner);guest(e,{nome:'Convidado de exemplo',telefone:'11990000000'});}
});
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const txt=(v,label,max=160)=>{if(typeof v!=='string'||!v.trim()||v.trim().length>max)fail(400,`${label}: preencha corretamente (até ${max} caracteres).`);return v.trim();};
const phone=v=>{const n=String(v||'').replace(/\D/g,'').replace(/^55(?=\d{10,11}$)/,'');if(!/^\d{10,11}$/.test(n))fail(400,'Informe um telefone com DDD (10 ou 11 dígitos).');return n;};
const integer=(v,min,max,label)=>{if(!Number.isInteger(v)||v<min||v>max)fail(400,`${label}: informe um número inteiro entre ${min} e ${max}.`);return v;};
const date=(v,label)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v||'')||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v)fail(400,`${label} inválida.`);return v;};
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
const today=()=> new Intl.DateTimeFormat('en-CA',{timeZone:'America/Cuiaba',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function session(req){const token=(req.headers.cookie||'').match(/(?:^|;\s*)tm_session=([a-f0-9]+)/)?.[1];return token&&get('SELECT u.id,u.nome,u.email,u.role FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token=? AND s.expires>?',token,Date.now());}
function auth(req){return session(req)||fail(401,'Entre na sua conta para continuar.');}
function allowed(req,eid,write=false){const u=auth(req), e=get('SELECT * FROM events WHERE id=?',eid);if(!e||!(e.owner===u.id||(!write&&get('SELECT * FROM access WHERE event_id=? AND user_id=?',eid,u.id))))fail(403,'Você não tem permissão para este evento.');return e;}
function guestAuth(eid,token){return get('SELECT * FROM guests WHERE event_id=? AND token=?',eid,token||'')||fail(404,'Convite não encontrado. Peça o link individual ao organizador.');}
function deadline(e){if(today()>e.prazo)fail(409,'O prazo de confirmação encerrou. Fale com o organizador.');}
function loginCookie(res,uid){const token=id();run('DELETE FROM sessions WHERE expires<?',Date.now());run('INSERT INTO sessions VALUES(?,?,?)',token,uid,Date.now()+86400000);res.setHeader('Set-Cookie',`tm_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`);}
const rates=new Map();
function limit(req,key,max=30){const k=req.socket.remoteAddress+key, now=Date.now();let r=rates.get(k);if(!r||r.until<now)r={n:0,until:now+60000};rates.set(k,r);if(++r.n>max)fail(429,'Muitas tentativas. Aguarde um minuto.');}
async function body(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>100000)fail(413,'Dados muito grandes.');}try{return JSON.parse(data||'{}');}catch{fail(400,'Dados inválidos.');}}
async function api(req,res,url){
 const p=url.pathname,m=req.method;
 if(m!=='GET'&&req.headers.origin!==`http://${req.headers.host}`)fail(403,'Origem da solicitação inválida.');
 const b=m==='GET'?{}:await body(req);
 if(p==='/api/login'&&m==='POST'){limit(req,'login',12);const u=get('SELECT * FROM users WHERE email=?',String(b.email||'').trim().toLowerCase());if(!u||typeof b.password!=='string'||b.password.length>256||!verify(b.password,u.password)||u.role!==b.role)fail(401,'E-mail, senha ou perfil incorreto.');loginCookie(res,u.id);return {role:u.role};}
 if(p==='/api/logout'&&m==='POST'){const token=(req.headers.cookie||'').match(/tm_session=([a-f0-9]+)/)?.[1];if(token)run('DELETE FROM sessions WHERE token=?',token);res.setHeader('Set-Cookie','tm_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return {ok:true};}
 if(p==='/api/register'&&m==='POST') {limit(req,'register',10);const nome=txt(b.nome,'Nome'),email=txt(b.email,'E-mail').toLowerCase(),password=txt(b.password,'Senha',256);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8)fail(400,'Informe um e-mail válido e uma senha com pelo menos 8 caracteres.');if(get('SELECT id FROM users WHERE email=?',email))fail(409,'Este e-mail já tem conta. Use Entrar.');const data=date(b.data,'Data'),prazo=date(b.prazo,'Prazo');if(prazo>data||data<today())fail(400,'Confira a data do evento e o prazo de confirmação.');const titulo=txt(b.titulo,'Nome do evento'),tipo=txt(b.tipo,'Tipo'),local=txt(b.local,'Local');const uid=transaction(()=>{const uid=user(nome,email,password,'noiva');event(uid,titulo,tipo,data,local,prazo);return uid;});loginCookie(res,uid);return {ok:true};}
 if(p==='/api/me'&&m==='GET')return auth(req);
 if(p==='/api/events'&&m==='GET'){const u=auth(req);return all('SELECT DISTINCT e.* FROM events e LEFT JOIN access a ON a.event_id=e.id WHERE e.owner=? OR a.user_id=? ORDER BY e.data',u.id,u.id).map(e=>({...e,guests:all('SELECT * FROM guests WHERE event_id=? ORDER BY nome',e.id).map(g=>{if(e.owner!==u.id)delete g.token;return g;}),gifts:all('SELECT f.*,g.nome AS reservado_por FROM gifts f LEFT JOIN guests g ON g.id=f.guest_id WHERE f.event_id=?',e.id)}));}
 const match=p.match(/^\/api\/events\/([a-f0-9]+)(?:\/(.*))?$/);
 if(match){const [,eid,action]=match;
  if(action==='public'&&m==='GET'){const e=get('SELECT id,titulo,tipo,data,local,prazo FROM events WHERE id=?',eid)||fail(404,'Evento não encontrado.');const g=url.searchParams.get('token')?guestAuth(eid,url.searchParams.get('token')):null;return {event:e,guest:g?{nome:g.nome,limite:g.limite,status:g.status,lugares:g.lugares,criancas:g.criancas,restricao:g.restricao,recado:g.recado}:null};}
  if(action==='identify'&&m==='POST'){limit(req,'identify',15);const g=guestAuth(eid,b.token);if(norm(String(b.nome||''))!==norm(g.nome))fail(400,'Digite o nome completo que aparece no seu convite.');return {nome:g.nome,limite:g.limite,status:g.status,lugares:g.lugares,criancas:g.criancas,restricao:g.restricao,recado:g.recado};}
  if(action==='self-register'&&m==='POST'){limit(req,'self-register',10);const e=get('SELECT * FROM events WHERE id=?',eid)||fail(404,'Evento não encontrado.');deadline(e);const nome=txt(b.nome,'Nome'),telefone=phone(b.telefone);if(get('SELECT id FROM guests WHERE event_id=? AND telefone=?',eid,telefone))fail(409,'Já existe um cadastro com este telefone. Peça seu link ao organizador.');guest(eid,{nome,telefone,status:'aprovacao',limite:1});return {ok:true};}
  if(action==='response'&&m==='POST'){const e=get('SELECT * FROM events WHERE id=?',eid)||fail(404,'Evento não encontrado.');deadline(e);const g=guestAuth(eid,b.token);if(g.status==='aprovacao')fail(403,'Seu cadastro precisa ser aprovado antes de confirmar.');if(!['confirmado','recusado'].includes(b.status))fail(400,'Escolha se vai ao evento.');const yes=b.status==='confirmado',lugares=yes?integer(b.lugares,1,g.limite,'Pessoas'):0,criancas=yes?integer(b.criancas,0,lugares,'Crianças'):0;const recado=String(b.recado||'').trim(),restricao=yes?String(b.restricao||'').trim():'';if(recado.length>1000||restricao.length>160)fail(400,'Reduza o tamanho da mensagem.');transaction(()=>{run('UPDATE guests SET status=?,lugares=?,criancas=?,restricao=?,recado=?,respondido=? WHERE id=?',b.status,lugares,criancas,restricao,recado,today(),g.id);if(!yes)run('UPDATE gifts SET guest_id=NULL WHERE guest_id=?',g.id);});return {ok:true};}
  if(action==='gifts'&&m==='GET'){const g=guestAuth(eid,url.searchParams.get('token'));return all('SELECT id,nome,valor,guest_id FROM gifts WHERE event_id=?',eid).map(f=>({id:f.id,nome:f.nome,valor:f.valor,reservado:!!f.guest_id,meu:f.guest_id===g.id}));}
  if(action?.startsWith('reserve/')&&m==='POST'){const g=guestAuth(eid,b.token);const e=get('SELECT * FROM events WHERE id=?',eid);deadline(e);if(g.status!=='confirmado')fail(403,'Confirme sua presença antes de reservar.');const fid=action.slice(8);if(b.cancel){const result=run('UPDATE gifts SET guest_id=NULL WHERE id=? AND event_id=? AND guest_id=?',fid,eid,g.id);if(!result.changes)fail(409,'Esta reserva não é sua.');}else{const result=run('UPDATE gifts SET guest_id=? WHERE id=? AND event_id=? AND guest_id IS NULL',g.id,fid,eid);if(!result.changes)fail(409,'Este presente já foi reservado. Atualize a lista.');}return {ok:true};}
  const e=allowed(req,eid,m!=='GET');
  if(!action&&m==='PATCH'){const titulo=txt(b.titulo,'Nome'),local=txt(b.local,'Local'),data=date(b.data,'Data'),prazo=date(b.prazo,'Prazo');if(prazo>data)fail(400,'O prazo não pode ser depois do evento.');run('UPDATE events SET titulo=?,local=?,data=?,prazo=? WHERE id=?',titulo,local,data,prazo,eid);return {ok:true};}
  if(action==='guests'&&m==='POST'){const nome=txt(b.nome,'Nome'),telefone=phone(b.telefone),grupo=txt(b.grupo||'Sem grupo','Grupo'),limite=integer(b.limite,1,30,'Limite');if(get('SELECT id FROM guests WHERE event_id=? AND telefone=?',eid,telefone))fail(409,'Este telefone já está na lista.');guest(eid,{nome,telefone,grupo,limite});return {ok:true};}
  if(action?.startsWith('guests/')&&m==='PATCH'){const gid=action.slice(7),g=get('SELECT * FROM guests WHERE id=? AND event_id=?',gid,eid)||fail(404,'Convidado não encontrado.');if(b.approve){if(g.status!=='aprovacao')fail(409,'Cadastro já analisado.');run("UPDATE guests SET status='pendente' WHERE id=?",gid);}else{const nome=txt(b.nome,'Nome'),telefone=phone(b.telefone),grupo=txt(b.grupo||'Sem grupo','Grupo'),limite=integer(b.limite,Math.max(1,g.lugares),30,'Limite');if(get('SELECT id FROM guests WHERE event_id=? AND telefone=? AND id<>?',eid,telefone,gid))fail(409,'Telefone já cadastrado.');run('UPDATE guests SET nome=?,telefone=?,grupo=?,limite=? WHERE id=?',nome,telefone,grupo,limite,gid);}return {ok:true};}
  if(action==='gifts'&&m==='POST'){const nome=txt(b.nome,'Presente');if(typeof b.valor!=='number'||!Number.isFinite(b.valor)||b.valor<0||b.valor>1000000)fail(400,'Valor inválido.');run('INSERT INTO gifts VALUES(?,?,?,?,NULL)',id(),eid,nome,b.valor);return {ok:true};}
  if(action==='access'&&m==='POST'){const email=txt(b.email,'E-mail').toLowerCase();let u=get('SELECT * FROM users WHERE email=?',email);if(!u){const password=txt(b.password,'Senha inicial',256);if(password.length<8||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Use e-mail válido e senha de pelo menos 8 caracteres.');u={id:user(txt(b.nome,'Nome'),email,password,'cerimonialista'),role:'cerimonialista'};}if(u.role!=='cerimonialista')fail(400,'Esta conta não é de cerimonialista.');run('INSERT OR IGNORE INTO access VALUES(?,?)',eid,u.id);return {ok:true};}
 }
 fail(404,'Página ou operação não encontrada.');
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||4173);
const server=http.createServer(async(req,res)=>{try{
 const host=req.headers.host;
 if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(host))fail(403,'Host inválido. Use o endereço local.');
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
 const url=new URL(req.url,`http://${host}`);
 if(url.pathname.startsWith('/api/')){const result=await api(req,res,url);res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(result));return;}
 if(req.method!=='GET'&&req.method!=='HEAD')fail(405,'Método não permitido.');
 const rel=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);const file=path.resolve(root,'public','.'+rel);
 if(!file.startsWith(path.join(root,'public')+path.sep)||!mime[path.extname(file)]||!existsSync(file))fail(404,'Arquivo não encontrado.');
 res.setHeader('Content-Type',mime[path.extname(file)]);res.end(req.method==='HEAD'?undefined:readFileSync(file));
 }catch(err){res.statusCode=err.status||500;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({error:err.status?err.message:'Não foi possível concluir. Tente novamente.'}));if(!err.status)console.error(err);}});
server.listen(port,'127.0.0.1',()=>console.log(`Tá Marcado disponível em http://127.0.0.1:${port}`));
export {server,db};
