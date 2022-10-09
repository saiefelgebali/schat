import { Socket } from 'socket.io';
import { SocketServer } from './socket.server.js';
export declare class UserSocket {
    private _socket;
    private server;
    private _username;
    get username(): string;
    get socket(): Socket;
    private call?;
    constructor(_socket: Socket, server: SocketServer);
    /**
     * Emit an event to a user on the socket server
     */
    emitToUser(username: string, event: string, data: any): void;
    private onJoin;
    private onMessage;
    private onTyping;
    private onStartCall;
    private onAcceptCall;
    private onDisconnectCall;
    private onDisconnect;
}
