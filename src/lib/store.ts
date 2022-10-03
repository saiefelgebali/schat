import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';
import type { Friend } from '$shared/interface';

export const friendsStore = writable<Friend[]>([]);

export const socket = writable<Socket | null>(null);
