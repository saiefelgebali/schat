import express from 'express';
import { createServer } from 'http';
import { handler } from '../build/handler.js';
import io from '../shared/dist/socket.js';

const port = 3000;
const app = express();
const server = createServer(app);
io.attach(server);
app.use(handler);
server.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
