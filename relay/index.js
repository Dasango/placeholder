const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = 3001;
const clients = new Set();

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/event") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const event = JSON.parse(body);
        console.log("Received:", event.event, "from", event.repo);
        const message = JSON.stringify(event);
        for (const client of clients) {
          client.send(message);
        }
        res.writeHead(200);
        res.end("OK");
      } catch (e) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected. Total:", clients.size);
  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected. Total:", clients.size);
  });
});

server.listen(PORT, () => {
  console.log(`Relay running on http://localhost:${PORT}`);
});
