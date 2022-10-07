import { Server as HttpServer } from 'http';
import { UserSocket } from './user.socket.js';
export declare class SocketServer {
    private io;
    private sockets;
    constructor();
    attachToServer: (server: HttpServer) => void;
    emitToUser: (username: string, event: string, data: any) => void;
    private onConnection;
    /**
     * Adds a UserSocket to the dictionary of online users
     */
    connectUser: (user: UserSocket) => void;
    /**
     * Removes a UserSocket from the dictionary of online users
     */
    disconnectUser: (user: UserSocket) => void;
    /**
     * Returns a boolean that tells whether or not a user is currently online
     */
    isOnline: (username: string) => boolean;
}
