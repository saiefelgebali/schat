import { friendRequestsStore, friendsStore } from '$lib/store';
import { io, Socket } from 'socket.io-client';
import type {
	SocketJoin,
	SocketMessage,
	SocketOnline,
	SocketTyping,
	Friend,
	SocketFriendRequest,
	SocketFriend
} from '$shared/src/interface';

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

		this.socket.on('connect', this.onConnect);
		this.socket.on('message', this.onMessage);
		this.socket.on('typing', this.onTyping);
		this.socket.on('online', this.onOnline);
		this.socket.on('friendRequest', this.onFriendRequest);
		this.socket.on('friend', this.onFriend);
	}

	emit(event: string, data: any) {
		this.socket.emit(event, data);
	}

	// Event handlers

	onConnect = () => {
		this.socket.emit('join', {
			username: this.username
		} as SocketJoin);
	};

	onMessage = (data: SocketMessage) => {
		if (data.from === this.username) {
			updateFriend(data.to, (friend) => {
				friend.messages = [...friend.messages, data];
			});
			return;
		}

		updateFriend(data.from, (friend) => {
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
}
