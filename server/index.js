import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { handler } from '../build/handler.js';

const port = 3000;
const app = express();
const server = createServer(app);

const io = new Server(server);

io.on('connection', (socket) => {
	socket.emit('eventFromServer', 'Hello world! - Server in production');
});

app.use(handler);

server.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
