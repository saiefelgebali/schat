import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { handler } from '../build/handler.js';
import { SocketServer } from '../shared/dist/socket.server.js';

dotenv.config();

const port = 5000;
const app = express();
const server = createServer(app);

// Use Socket.io
const socketServer = new SocketServer();
socketServer.attachToServer(server);

// Use SvelteKit
app.use(handler);

server.listen(port, () => {
	console.log(`Listening at ${process.env.ORIGIN}`);
});
