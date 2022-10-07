import { Server } from 'socket.io';
import { log } from './log.js';
import { UserSocket } from './user.socket.js';
export class SocketServer {
    constructor() {
        this.attachToServer = (server) => {
            this.io.attach(server);
        };
        this.emitToUser = (username, event, data) => {
            this.io.to(username).emit(event, data);
        };
        // IO Events
        this.onConnection = (socket) => {
            log('New socket connection');
            new UserSocket(socket, this);
        };
        /**
         * Adds a UserSocket to the dictionary of online users
         */
        this.connectUser = (user) => {
            this.sockets[user.username] = user;
        };
        /**
         * Removes a UserSocket from the dictionary of online users
         */
        this.disconnectUser = (user) => {
            delete this.sockets[user.username];
        };
        /**
         * Returns a boolean that tells whether or not a user is currently online
         */
        this.isOnline = (username) => {
            return username in this.sockets;
        };
        this.io = new Server();
        this.sockets = {};
        this.io.on('connection', this.onConnection);
    }
}
