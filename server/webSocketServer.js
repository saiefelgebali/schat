// @ts-nocheck
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

/** @param server {import('vite').ViteDevServer} */
export const configureServer = (server) => {
	if (!server.httpServer) throw new Error('Could not access HTTP server');

	// Establish connection to database
	const db = new PrismaClient();

	// Keep track of who is online
	const userSockets = {};

	const io = new Server(server.httpServer);

	io.on('connection', (socket) => {
		let socketUsername = '';

		socket.on('join', async (username) => {
			socketUsername = username;
			userSockets[username] = socket;

			// Alert friends
			const user = await db.user.findUnique({ select: { friends: true }, where: { username } });
			if (!user) return;
			user.friends.forEach((f) => {
				if (!(f.username in userSockets)) return;
				userSockets[f.username].emit('online', { username, status: true });
			});
		});

		socket.on('message', (message) => {
			if (message.to in userSockets) {
				const friend = userSockets[message.to];
				friend.emit('message', message);
			}
			socket.emit('message', message);
		});

		socket.on('typing', (message) => {
			if (!(message.to in userSockets)) return;
			const friend = userSockets[message.to];
			friend.emit('typing', {
				from: message.from,
				status: message.status
			});
		});

		socket.on('disconnect', async () => {
			delete userSockets[socketUsername];

			// Alert friends
			const user = await db.user.findUnique({
				select: { friends: true },
				where: { username: socketUsername }
			});
			if (!user) return;
			user.friends.forEach((f) => {
				if (!(f.username in userSockets)) return;
				userSockets[f.username].emit('online', { username: socketUsername, status: false });
			});
		});
	});
};
