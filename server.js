const { WebSocketServer } = require('ws');
const http = require('http');
const PORT = process.env.PORT || 8000;
const server = http.createServer((req, res) => { res.writeHead(200); res.end('ELINDOR server OK'); });
const wss = new WebSocketServer({ server });
const rooms = new Map();
const MAX = 98;
function getRoom() {
  for (const [name, room] of rooms) { if (room.clients.size < MAX) return name; }
  const name = 'sala-' + (rooms.size + 1);
  rooms.set(name, { clients: new Set() });
  return name;
}
wss.on('connection', (ws) => {
  const roomName = getRoom();
  const room = rooms.get(roomName);
  room.clients.add(ws);
  ws.room = roomName;
  ws.send(JSON.stringify({ t: 'welcome', room: roomName, total: room.clients.size }));
  ws.on('message', (data) => {
    let msg; try { msg = JSON.parse(data); } catch { return; }
    msg.room = roomName;
    for (const c of room.clients) { if (c !== ws && c.readyState === 1) c.send(JSON.stringify(msg)); }
  });
  ws.on('close', () => { room.clients.delete(ws); if (room.clients.size === 0) rooms.delete(roomName); });
});
console.log('ELINDOR server en puerto ' + PORT);
