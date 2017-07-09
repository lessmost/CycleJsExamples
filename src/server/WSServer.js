const WebSocketServer = require('websocket').server;
const http = require('http');
const ip = require('ip');

const server = http.createServer((req, res) => {
    res.writeHead(404);
    res.end();
});

server.listen(8080, () => {
    console.log(`Server listening on port ws://${ip.address()}:8080/`);
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
});

const peers = [];
wsServer.on('request', (req) => {
    const conn = req.accept(null, req.origin);
    let peerIdx;
    console.log(`Accept connection from ${req.host}`);
    peerIdx = peers.length;
    peers.push(conn);

    conn.on('message', (msg) => {
        if (msg.type === 'utf8') {
            peers.forEach(peer => {
                peer.sendUTF(msg.utf8Data);
            });
        }
    });
    conn.on('close', () => {
        console.log(`Connection close from ${req.host}`);
        peers.splice(peerIdx, 1);
    });
});
