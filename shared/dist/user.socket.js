var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ConsoleColor, log } from './log.js';
import db from './db.js';
/**
 * Returns an array of the usernames of a profile's friends.
 */
const getProfileFriends = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield db.profile.findUnique({
        select: { friends: { select: { username: true } } },
        where: { username: username }
    });
    return (res === null || res === void 0 ? void 0 : res.friends.map((f) => f.username)) || [];
});
export class UserSocket {
    constructor(_socket, server) {
        this._socket = _socket;
        this.server = server;
        // Socket Events
        this.onJoin = (data) => __awaiter(this, void 0, void 0, function* () {
            if (!data.username)
                return;
            this.socket.join(data.username);
            this._username = data.username;
            this.server.connectUser(this);
            log(`'${data.username}' joined.`, { color: ConsoleColor.FgCyan });
            const friends = yield getProfileFriends(data.username);
            friends.forEach((friendUsername) => {
                // Alert friends that you joined
                this.emitToUser(friendUsername, 'online', {
                    username: data.username,
                    status: true
                });
                // Alert you if friends are online
                if (this.server.isOnline(friendUsername)) {
                    this.emitToUser(this.username, 'online', {
                        username: friendUsername,
                        status: true
                    });
                }
            });
        });
        this.onMessage = (data) => __awaiter(this, void 0, void 0, function* () {
            const message = yield db.chatMessage.create({
                data: {
                    text: data.text,
                    from: { connect: { username: data.from } },
                    to: { connect: { username: data.to } }
                }
            });
            this.emitToUser(data.from, 'message', message);
            this.emitToUser(data.to, 'message', message);
        });
        this.onTyping = (data) => __awaiter(this, void 0, void 0, function* () {
            this.emitToUser(data.to, 'typing', data);
        });
        this.onStartCall = (data) => __awaiter(this, void 0, void 0, function* () {
            log(`${this.username} is calling ${data.to}`, { color: ConsoleColor.FgMagenta });
            this.call = { username: data.to };
            this.emitToUser(data.to, 'start-call', data);
        });
        this.onAcceptCall = (data) => __awaiter(this, void 0, void 0, function* () {
            log(`${this.username} accepted call from ${data.to}`, { color: ConsoleColor.FgMagenta });
            this.call = { username: data.from };
        });
        this.onDisconnectCall = (data) => __awaiter(this, void 0, void 0, function* () {
            log(`${this.username} stopped calling ${data.to}`, { color: ConsoleColor.FgMagenta });
            this.call = null;
            this.emitToUser(data.to, 'disconnect-call', data);
        });
        this.onDisconnect = () => __awaiter(this, void 0, void 0, function* () {
            this.socket.rooms.clear();
            this.server.disconnectUser(this);
            log(`'${this.username}' disconnected.`, { color: ConsoleColor.FgYellow });
            // Disconnect from any calls
            if (this.call)
                this.emitToUser(this.call.username, 'disconnect-call', {
                    from: this.username,
                    to: this.call.username
                });
            // Alert friends that you disconnected
            const friends = yield getProfileFriends(this.username);
            friends.forEach((f) => this.emitToUser(f, 'online', { username: this.username, status: false }));
        });
        this.socket.on('join', this.onJoin);
        this.socket.on('message', this.onMessage);
        this.socket.on('typing', this.onTyping);
        this.socket.on('start-call', this.onStartCall);
        this.socket.on('accept-call', this.onAcceptCall);
        this.socket.on('disconnect-call', this.onDisconnectCall);
        this.socket.on('disconnect', this.onDisconnect);
    }
    get username() {
        return this._username;
    }
    get socket() {
        return this._socket;
    }
    /**
     * Emit an event to a user on the socket server
     */
    emitToUser(username, event, data) {
        this.server.emitToUser(username, event, data);
    }
}
