import { friendRequestsStore, friendsStore } from '$lib/store';
import { io, Socket } from 'socket.io-client';
import type {
	SocketJoin,
	SocketOnline,
	SocketTyping,
	Friend,
	SocketFriendRequest,
	SocketFriend,
	SocketStartCall,
	SocketDisconnectCall
} from '$shared/src/interface';
import type { ChatMessage } from '@prisma/client';

/**
 * Update the state of a friend in memory.
 */
function updateFriend(username: string, handler: (friend: Friend) => void) {
	friendsStore.update((store) => {
		let storedFriend = store.find((f) => f.username === username);
		if (!storedFriend) return store;
		handler(storedFriend);
		return store;
	});
}

export class SocketManager {
	private socket: Socket;

	constructor(private username: string) {
		this.socket = io();
		this.socket.removeAllListeners(); // Ensure any existing event listeners are removed.

		this.on('connect', this.onConnect);
		this.on('message', this.onMessage);
		this.on('typing', this.onTyping);
		this.on('online', this.onOnline);
		this.on('friendRequest', this.onFriendRequest);
		this.on('friend', this.onFriend);
		this.on('connect-call', this.onConnectCall);
	}

	emit(event: string, data: any) {
		this.socket.emit(event, data);
	}

	on(event: string, handler: (data: any) => void) {
		this.socket.on(event, handler);
	}

	off(event: string, handler: (data: any) => void) {
		this.socket.off(event, handler);
	}

	// Event handlers

	onConnect = () => {
		this.socket.emit('join', {
			username: this.username
		} as SocketJoin);
	};

	onMessage = (data: ChatMessage) => {
		if (data.fromUsername === this.username) {
			updateFriend(data.toUsername, (friend) => {
				friend.messages = [...friend.messages, data];
			});
			return;
		}

		updateFriend(data.fromUsername, (friend) => {
			friend.messages = [...friend.messages, data];
		});
	};

	onTyping = (data: SocketTyping) => {
		updateFriend(data.from, (friend) => {
			friend.typing = data.status;
		});
	};

	onOnline = (data: SocketOnline) => {
		updateFriend(data.username, (friend) => {
			friend.online = data.status;
		});
	};

	onFriendRequest = (data: SocketFriendRequest) => {
		friendRequestsStore.update((store) => {
			store.push(data);
			return store;
		});
	};

	onFriend = (data: SocketFriend) => {
		friendsStore.update((store) => {
			store.push({ messages: [], online: false, typing: false, username: data.username });
			return store;
		});
	};

	// Peers
	onConnectCall = (data: SocketStartCall) => {};

	onDisconnectCall = (data: SocketDisconnectCall) => {};
}
