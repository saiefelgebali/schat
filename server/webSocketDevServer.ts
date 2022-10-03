import { ViteDevServer } from 'vite';
import { Server } from 'socket.io';
import { configureSocket } from './src/socket';

export const configureServer = (server: ViteDevServer) => {
	if (!server.httpServer) throw new Error('Could not access HTTP server');

	const io = new Server(server.httpServer);

	configureSocket(io);
};
