import type { ViteDevServer } from 'vite';
import { SocketServer } from '../shared/src/socket.server';

export const configureServer = (server: ViteDevServer) => {
	if (!server.httpServer) throw new Error('Could not access HTTP server');
	const socketServer = new SocketServer();
	socketServer.attachToServer(server.httpServer);
};
