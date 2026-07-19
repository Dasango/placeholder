// @ts-check

import http from 'http';
import { WebSocketServer } from 'ws';
import express from 'express';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


app.use(express.json());

app.get('/', (req, res) => {
  console.log('[GET] Evento recibido:', req.body);
  res.send('Servidor Express activo');
});
app.post('/event', (req, res) => {
  console.log('[POST] Evento recibido:', req.body);
  for (const client of clients) {
    client.send(JSON.stringify(req.body));
  }
  res.json({ message: 'Evento recibido', ok: true })
});

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('[WebSocket] Cliente conectado');
  clients.add(ws);

  ws.on('message', (message) => {
    console.log(`[WebSocket] Mensaje recibido: ${message}`);
    ws.send(`[WebSocket] Respuesta del servidor: ${message}`);
  });

  ws.on('close', () => {
    console.log('[WebSocket] Cliente desconectado');
    clients.delete(ws);
  });
});

server.listen(3001, () => {
  console.log('[HTTP] Servidor escuchando en el puerto 3001');
});