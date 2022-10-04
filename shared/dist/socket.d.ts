import { Server } from 'socket.io';
/** Standardize every user's friend group label */
export declare const friendsOfUserRoom: (username: string) => string;
declare const io: Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
export default io;
