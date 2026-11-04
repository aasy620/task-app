const http = require('http');
const PORT = process.env.PORT || 3000;
let tasks = [];
let nextId = 1;

const page = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>TaskTrack</title></head>
<body style="font-family:sans-serif;max-width:480px;margin:40px auto">
<h2>TaskTrack</h2>
<input id="t" placeholder="New task"><button onclick="add()">Add</button>
<ul id="list"></ul>
<script>
async function load(){
  const r = await fetch('/api/tasks'); const d = await r.json();
  document.getElementById('list').innerHTML = d.map(function(x){
    return '<li><span onclick="tog('+x.id+')" style="cursor:pointer;text-decoration:'+(x.done?'line-through':'none')+'">'+x.title+'</span> <button onclick="del('+x.id+')">x</button></li>';
  }).join('');
}
async function add(){
  const i = document.getElementById('t');
  await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:i.value})});
  i.value=''; load();
}
async function tog(id){ await fetch('/api/tasks/'+id,{method:'PATCH'}); load(); }
async function del(id){ await fetch('/api/tasks/'+id,{method:'DELETE'}); load(); }
load();
</script></body></html>`;

function send(res, code, data, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(type === 'application/json' ? JSON.stringify(data) : data);
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'GET' && url === '/') return send(res, 200, page, 'text/html; charset=utf-8');
  if (url === '/health') return send(res, 200, { status: 'ok' });
  if (url === '/api/tasks' && req.method === 'GET') return send(res, 200, tasks);

  if (url === '/api/tasks' && req.method === 'POST') {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);
        if (!title || !title.trim()) return send(res, 400, { error: 'title is required' });
        const t = { id: nextId++, title: title.trim(), done: false };
        tasks.push(t);
        send(res, 201, t);
      } catch {
        send(res, 400, { error: 'invalid JSON' });
      }
    });
    return;
  }

  const m = url.match(/^\/api\/tasks\/(\d+)$/);
  if (m) {
    const i = tasks.findIndex(t => t.id === Number(m[1]));
    if (i < 0) return send(res, 404, { error: 'not found' });
    if (req.method === 'PATCH') { tasks[i].done = !tasks[i].done; return send(res, 200, tasks[i]); }
    if (req.method === 'DELETE') { const [d] = tasks.splice(i, 1); return send(res, 200, { deleted: d.id }); }
  }
  send(res, 404, { error: 'not found' });
});

server.listen(PORT, '0.0.0.0', () => console.log('TaskTrack running on port ' + PORT));