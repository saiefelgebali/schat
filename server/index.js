import express from 'express';
import { createServer } from 'http';
import { handler } from '../build/handler.js';
import { SocketServer } from '../shared/dist/socket.server.js';
import { ExpressPeerServer } from 'peer';

const port = 3000;
const app = express();
const server = createServer(app);

// Use peerjs
const peerServer = ExpressPeerServer(server);
app.use('/peerjs', peerServer);

// Use Socket.io
const socketServer = new SocketServer();
socketServer.attachToServer(server);

// Use SvelteKit
app.use(handler);

server.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
