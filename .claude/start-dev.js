const http = require("http");
const { spawn } = require("child_process");
const net = require("net");
const PORT = parseInt(process.env.PORT || "3000", 10);
const NEXT_PORT = PORT + 1;

let nextReady = false;

// 1. Start Next.js immediately on a side port
const next = spawn(process.execPath, ["node_modules/.bin/next", "dev", "--port", String(NEXT_PORT)], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(NEXT_PORT) },
});

next.on("exit", (code) => process.exit(code || 0));
process.on("SIGTERM", () => next.kill());
process.on("SIGINT", () => next.kill());

// 2. Proxy server on the real port — serves placeholder until Next.js is ready, then proxies
const server = http.createServer((req, res) => {
  if (!nextReady) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<html><head><meta http-equiv='refresh' content='2'></head><body style='display:flex;justify-content:center;align-items:center;height:100vh;font-family:system-ui;color:#666'><h2>Starting dev server...</h2></body></html>"
    );
    return;
  }
  // Proxy to Next.js
  const proxyReq = http.request(
    { hostname: "localhost", port: NEXT_PORT, path: req.url, method: req.method, headers: req.headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on("error", () => {
    res.writeHead(502);
    res.end("Bad Gateway");
  });
  req.pipe(proxyReq);
});

// Handle WebSocket upgrade for HMR
server.on("upgrade", (req, socket, head) => {
  if (!nextReady) return socket.destroy();
  const proxySocket = net.connect(NEXT_PORT, "localhost", () => {
    proxySocket.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n") +
      "\r\n\r\n"
    );
    if (head.length) proxySocket.write(head);
    socket.pipe(proxySocket).pipe(socket);
  });
  proxySocket.on("error", () => socket.destroy());
  socket.on("error", () => proxySocket.destroy());
});

server.listen(PORT);

// 3. Poll until Next.js is ready
const poll = setInterval(() => {
  const req = http.get(`http://localhost:${NEXT_PORT}`, (res) => {
    res.resume();
    nextReady = true;
    clearInterval(poll);
  });
  req.on("error", () => {});
  req.end();
}, 500);
