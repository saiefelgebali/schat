import { writable } from 'svelte/store';
import type { Friend } from '$shared/src/interface';
import type { SocketManager } from './socket.manager';

export const friendsStore = writable<Friend[]>([]);
export const friendRequestsStore = writable<{ username: string }[]>([]);
export const username = writable<string>();

export const socketManager = writable<SocketManager>();
