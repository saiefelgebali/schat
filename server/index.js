import express from 'express';
import { createServer } from 'http';
import { handler } from '../build/handler.js';
import { SocketServer } from '../shared/src/socket.server';

const port = 3000;
const app = express();
const server = createServer(app);
const socketServer = new SocketServer();
socketServer.attachToServer(server);
app.use(handler);
server.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
