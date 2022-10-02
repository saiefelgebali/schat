import { writable } from 'svelte/store';

interface Friend {
	username: string;
	online: boolean;
}

export const friendsStore = writable<Friend[]>([]);
