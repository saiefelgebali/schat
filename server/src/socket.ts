import { Server } from 'socket.io';
import { SocketMessage } from '../../shared/interface.js';
import db from '../../shared/db.js';

enum ConsoleColor {
	Reset = '\x1b[0m',
	Bright = '\x1b[1m',
	Dim = '\x1b[2m',
	Underscore = '\x1b[4m',
	Blink = '\x1b[5m',
	Reverse = '\x1b[7m',
	Hidden = '\x1b[8m',

	FgBlack = '\x1b[30m',
	FgRed = '\x1b[31m',
	FgGreen = '\x1b[32m',
	FgYellow = '\x1b[33m',
	FgBlue = '\x1b[34m',
	FgMagenta = '\x1b[35m',
	FgCyan = '\x1b[36m',
	FgWhite = '\x1b[37m',

	BgBlack = '\x1b[40m',
	BgRed = '\x1b[41m',
	BgGreen = '\x1b[42m',
	BgYellow = '\x1b[43m',
	BgBlue = '\x1b[44m',
	BgMagenta = '\x1b[45m',
	BgCyan = '\x1b[46m',
	BgWhite = '\x1b[47m'
}

const log = (message: string, options?: { color: ConsoleColor }) => {
	console.log(`${options?.color ?? ''}[socket.ts]${ConsoleColor.Reset} ${message}`);
};

export const configureSocket = (io: Server) => {
	// Keep track of who is online
	const userSockets = {};

	io.on('connection', (socket) => {
		let username = '';

		log('New socket connection');

		socket.on('join', async (message) => {
			username = message.username;

			log(`'${username}' joined.`, { color: ConsoleColor.FgCyan });

			// Invalid join
			if (!username) {
				log('ERROR: socket was disconnected forcefully.', { color: ConsoleColor.FgRed });
				return socket.disconnect(true);
			}

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

			log(`'${username}' disconnected.`, { color: ConsoleColor.FgYellow });

			if (!username) {
				return;
			}

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
