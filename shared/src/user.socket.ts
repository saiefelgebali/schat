import { Socket } from 'socket.io';
import { SocketJoin, SocketMessage, SocketOnline, SocketTyping } from './interface';
import { ConsoleColor, log } from './log';
import { SocketServer } from './socket.server';
import db from './db';

/**
 * Returns an array of the usernames of a profile's friends.
 */
const getProfileFriends = async (username: string) => {
	const res = await db.profile.findUnique({
		select: { friends: { select: { username: true } } },
		where: { username: username }
	});

	return res?.friends.map((f) => f.username) || [];
};

export class UserSocket {
	private _username: string;
	public get username(): string {
		return this._username;
	}
	public get socket(): Socket {
		return this._socket;
	}

	constructor(private _socket: Socket, private server: SocketServer) {
		this.socket.on('join', this.onJoin);
		this.socket.on('message', this.onMessage);
		this.socket.on('typing', this.onTyping);
		this.socket.on('disconnect', this.onDisconnect);
	}

	/**
	 * Emit an event to a user on the socket server
	 */
	emitToUser(username: string, event: string, data: any) {
		this.server.emitToUser(username, event, data);
	}

	// Socket Events

	private onJoin = async (data: SocketJoin) => {
		if (!data.username) return;

		this.socket.join(data.username);

		this._username = data.username;

		this.server.connectUser(this);

		log(`'${data.username}' joined.`, { color: ConsoleColor.FgCyan });

		const friends = await getProfileFriends(data.username);

		friends.forEach((friendUsername) => {
			// Alert friends that you joined
			this.emitToUser(friendUsername, 'online', {
				username: data.username,
				status: true
			} as SocketOnline);

			// Alert you if friends are online
			if (this.server.isOnline(friendUsername)) {
				this.emitToUser(this.username, 'online', {
					username: friendUsername,
					status: true
				} as SocketOnline);
			}
		});
	};

	private onMessage = async (data: SocketMessage) => {
		this.emitToUser(data.from, 'message', data);
		this.emitToUser(data.to, 'message', data);
	};

	private onTyping = async (data: SocketTyping) => {
		this.emitToUser(data.to, 'typing', data);
	};

	private onDisconnect = async () => {
		this.socket.rooms.clear();

		this.server.disconnectUser(this);

		log(`'${this.username}' disconnected.`, { color: ConsoleColor.FgYellow });

		// Alert friends that you disconnected
		const friends = await getProfileFriends(this.username);
		friends.forEach((f) =>
			this.emitToUser(f, 'online', { username: this.username, status: false } as SocketOnline)
		);
	};
}
