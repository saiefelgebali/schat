import { ConsoleColor, log } from './log.js';
import db from '../../shared/db.js';
/** Standardize every user's friend group label */
export const friendsOfUserRoom = (username) => `friends-of-${username}`;
export const configureSocket = (io) => {
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
            // Add to friends' rooms
            const user = await db.user.findUnique({ select: { friends: true }, where: { username } });
            user.friends.forEach((friend) => {
                // Add to friends' groups
                socket.join(friendsOfUserRoom(friend.username));
                // Make sure friend is in my room
                userSockets[friend.username]?.join(friendsOfUserRoom(username));
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
        });
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
        socket.on('disconnect', async () => {
            delete userSockets[username];
            log(`'${username}' disconnected.`, { color: ConsoleColor.FgYellow });
            // Notify friends that this user disconnected
            io.to(friendsOfUserRoom(username)).emit('online', { username, status: false });
        });
    });
};
