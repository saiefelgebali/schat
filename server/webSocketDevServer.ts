import type { ViteDevServer } from 'vite';
import io from '../shared/src/socket';

export const configureServer = (server: ViteDevServer) => {
	if (!server.httpServer) throw new Error('Could not access HTTP server');

	io.attach(server.httpServer);
};
