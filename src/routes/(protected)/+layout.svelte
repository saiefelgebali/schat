<script lang="ts">
	import { friendRequestsStore, friendsStore, socket } from '$lib/store';
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';
	import type {
		SocketJoin,
		SocketMessage,
		SocketOnline,
		SocketTyping,
		Friend,
		SocketFriendRequest,
		SocketFriend
	} from '$shared/src/interface';

	export let data: {
		user: { username: string };
		friends: Friend[];
		friendRequests: { username: string }[];
	};

	function updateFriend(username: string, handler: (friend: Friend) => void) {
		friendsStore.update((store) => {
			let storedFriend = store.find((f) => f.username === username);
			if (!storedFriend) return store;
			handler(storedFriend);
			return store;
		});
	}

	onMount(() => {
		// Add friends to store
		$friendsStore = data.friends;

		// Add friend requests to store
		$friendRequestsStore = data.friendRequests;

		// Remove existing socket
		if ($socket) {
			$socket.close();
			$socket.removeAllListeners();
			$socket = null;
		}

		// Create new socket
		const s = io();

		s.removeAllListeners(); // Ensure any existing event listeners are removed.

		s.on('connect', () => {
			if (!data.user.username) return;

			s.emit('join', {
				username: data.user.username
			} as SocketJoin);
		});

		s.on('message', (message: SocketMessage) => {
			if (message.from === data.user.username) {
				updateFriend(message.to, (friend) => {
					friend.messages = [...friend.messages, message];
				});
			}
			updateFriend(message.from, (friend) => {
				friend.messages = [...friend.messages, message];
			});
		});

		s.on('typing', (message: SocketTyping) => {
			updateFriend(message.from, (friend) => {
				friend.typing = message.status;
			});
		});

		s.on('online', (message: SocketOnline) => {
			friendsStore.update((store) => {
				const storedFriend = store.find((f) => f.username === message.username);
				if (!storedFriend) return store;
				storedFriend.online = message.status;
				return store;
			});
		});

		s.on('friendRequest', (data: SocketFriendRequest) => {
			$friendRequestsStore = [...$friendRequestsStore, data];
		});

		s.on('friend', (data: SocketFriend) => {
			$friendsStore = [
				...$friendsStore,
				{ messages: [], online: false, typing: false, username: data.username }
			];
		});

		socket.set(s);
	});
</script>

<slot />
