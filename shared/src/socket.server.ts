import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { log } from './log.js';
import { UserSocket } from './user.socket.js';

export class SocketServer {
	private io: Server;
	private sockets: { [username: string]: UserSocket };

	constructor() {
		this.io = new Server();
		this.sockets = {};
		this.io.on('connection', this.onConnection);
	}

	public attachToServer = (server: HttpServer) => {
		this.io.attach(server);
	};

	public emitToUser = (username: string, event: string, data: any) => {
		this.io.to(username).emit(event, data);
	};

	// IO Events
	private onConnection = (socket: Socket) => {
		log('New socket connection');
		new UserSocket(socket, this);
	};

	/**
	 * Adds a UserSocket to the dictionary of online users
	 */
	public connectUser = (user: UserSocket) => {
		this.sockets[user.username] = user;
	};

	/**
	 * Removes a UserSocket from the dictionary of online users
	 */
	public disconnectUser = (user: UserSocket) => {
		delete this.sockets[user.username];
	};

	/**
	 * Returns a boolean that tells whether or not a user is currently online
	 */
	public isOnline = (username: string) => {
		return username in this.sockets;
	};
}
