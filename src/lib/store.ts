import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';
import type { Friend } from '$shared/src/interface';

export const friendsStore = writable<Friend[]>([]);
export const friendRequestsStore = writable<{ username: string }[]>([]);

export const socket = writable<Socket | null>(null);
