var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Server } from 'socket.io';
import { ConsoleColor, log } from './log.js';
import db from './db.js';
/** Standardize every user's friend group label */
export const friendsOfUserRoom = (username) => `friends-of-${username}`;
// Keep track of who is online
const userSockets = {};
const io = new Server();
io.on('connection', (socket) => {
    let username = '';
    log('New socket connection');
    socket.on('join', (message) => __awaiter(void 0, void 0, void 0, function* () {
        username = message.username;
        log(`'${username}' joined.`, { color: ConsoleColor.FgCyan });
        // Invalid join
        if (!username) {
            log('ERROR: socket was disconnected forcefully.', { color: ConsoleColor.FgRed });
            return socket.disconnect(true);
        }
        userSockets[username] = socket;
        // Add to friends' rooms
        const user = yield db.user.findUnique({ select: { friends: true }, where: { username } });
        user.friends.forEach((friend) => {
            var _a;
            // Add to friends' groups
            socket.join(friendsOfUserRoom(friend.username));
            // Make sure friend is in my room
            (_a = userSockets[friend.username]) === null || _a === void 0 ? void 0 : _a.join(friendsOfUserRoom(username));
            // Update users already connected
            socket.emit('online', {
                username: friend.username,
                status: friend.username in userSockets
            });
        });
        // Notify friends that this user joined
        io.to(friendsOfUserRoom(username)).emit('online', {
            username,
            status: true
        });
    }));
    socket.on('message', (message) => {
        if (message.to in userSockets) {
            const friend = userSockets[message.to];
            friend.emit('message', message);
        }
        socket.emit('message', message);
    });
    socket.on('typing', (message) => {
        if (!(message.to in userSockets))
            return;
        const friend = userSockets[message.to];
        friend.emit('typing', {
            from: message.from,
            status: message.status
        });
    });
    socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        delete userSockets[username];
        log(`'${username}' disconnected.`, { color: ConsoleColor.FgYellow });
        // Notify friends that this user disconnected
        io.to(friendsOfUserRoom(username)).emit('online', { username, status: false });
    }));
});
export default io;
