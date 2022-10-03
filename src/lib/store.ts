import type { Socket } from 'socket.io-client';
import { writable } from 'svelte/store';
import type { ChatMessage } from './interface/chat.message.interface';
import type { Friend } from './interface/friend.interface';

export const friendsStore = writable<Friend[]>([]);

export const socket = writable<Socket>();
