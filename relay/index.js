import http from 'http';
import { WebSocketServer } from 'ws';
import express from 'express';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Error: El formato del JSON es inválido' });
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Servidor Express activo');
});
app.post('/event', (req, res) => {
  for (const client of clients) {
    res.json({ message: 'Evento recibido', data: eventData });
  }
});

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  clients.add(ws);

  ws.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`);
    ws.send(`Respuesta del servidor: ${message}`);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
    clients.delete(ws);
  });
});

server.listen(3001, () => {
  console.log('Servidor escuchando en el puerto 3001');
});