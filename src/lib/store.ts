import type { Socket } from 'socket.io-client';
import { writable } from 'svelte/store';
import type { ChatMessage } from './chatMessage.interface';
import type { Friend } from './friend.interface';

export const friendsStore = writable<Friend[]>([]);

export const socket = writable<Socket>();
