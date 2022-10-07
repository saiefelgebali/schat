import { Socket } from 'socket.io';
import {
	SocketConnectCall,
	SocketDisconnectCall,
	SocketJoin,
	SocketMessageToServer,
	SocketOnline,
	SocketTyping
} from './interface';
import { ConsoleColor, log } from './log.js';
import { SocketServer } from './socket.server.js';
import db from './db.js';

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

		this.socket.on('connect-call', this.onConnectCall);
		this.socket.on('disconnect-call', this.onDisconnectCall);

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

	private onMessage = async (data: SocketMessageToServer) => {
		const message = await db.chatMessage.create({
			data: {
				text: data.text,
				from: { connect: { username: data.from } },
				to: { connect: { username: data.to } }
			}
		});
		this.emitToUser(data.from, 'message', message);
		this.emitToUser(data.to, 'message', message);
	};

	private onTyping = async (data: SocketTyping) => {
		this.emitToUser(data.to, 'typing', data);
	};

	private onConnectCall = async (data: SocketConnectCall) => {
		console.log('connect call', data.username);
		this.emitToUser(data.username, 'connect-call', data);
	};

	private onDisconnectCall = async (data: SocketDisconnectCall) => {
		this.emitToUser(data.username, 'disconnect-call', data);
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
