import { Server } from 'socket.io';
import { SocketMessage } from '../../shared/interface.js';
import db from '../../shared/db.js';

export const configureSocket = (io: Server) => {
	// Keep track of who is online
	const userSockets = {};

	io.on('connection', (socket) => {
		let username = '';

		socket.on('join', async (message) => {
			username = message.username;
			userSockets[username] = socket;

			// Alert friends
			const user = await db.user.findUnique({ select: { friends: true }, where: { username } });
			if (!user) return;
			user.friends.forEach((f) => {
				if (!(f.username in userSockets)) return;
				userSockets[f.username].emit('online', { username, status: true });
				// Alert self of online friends
				socket.emit('online', { username: f.username, status: true });
			});
		});

		socket.on('message', (message: SocketMessage) => {
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
			delete userSockets[username];

			// Alert friends
			const user = await db.user.findUnique({
				select: { friends: true },
				where: { username }
			});
			if (!user) return;
			user.friends.forEach((f) => {
				if (!(f.username in userSockets)) return;
				userSockets[f.username].emit('online', { username, status: false });
			});
		});
	});
};
