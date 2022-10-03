<script lang="ts">
	import { friendsStore, socket } from '$lib/store';
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';
	import type { ChatMessage } from '$lib/interface/chat.message.interface';
	import type { Friend } from '$lib/interface/friend.interface';
	import type {
		SocketJoin,
		SocketMessage,
		SocketOnline,
		SocketTyping
	} from '$lib/interface/socket.event.interface';

	export let data: {
		user: { username: string };
		friends: Friend[];
		friendRequests: { username: string }[];
	};

	// Add friends to store
	friendsStore.update((store) => {
		data.friends.forEach((friend) => {
			if (store.find((f) => f.username === friend.username)) return;
			store.push({ ...friend });
		});
		return store;
	});

	function updateFriend(username: string, handler: (friend: Friend) => void) {
		friendsStore.update((store) => {
			let storedFriend = store.find((f) => f.username === username);
			if (!storedFriend) return store;
			handler(storedFriend);
			return store;
		});
	}

	onMount(() => {
		socket.set(io());

		$socket.on('connect', () => {
			console.log('Connected via WebSockets');
			$socket.emit('join', {
				username: data.user.username
			} as SocketJoin);
		});

		$socket.on('message', (message: SocketMessage) => {
			if (message.from === data.user.username) {
				updateFriend(message.to, (friend) => {
					friend.messages = [...friend.messages, message];
				});
			}
			updateFriend(message.from, (friend) => {
				friend.messages = [...friend.messages, message];
			});
		});

		$socket.on('typing', (message: SocketTyping) => {
			updateFriend(message.from, (friend) => {
				friend.typing = message.status;
			});
		});

		$socket.on('online', (message: SocketOnline) => {
			friendsStore.update((store) => {
				const storedFriend = store.find((f) => f.username === message.username);
				if (!storedFriend) return store;
				storedFriend.online = message.status;
				return store;
			});
		});
	});
</script>

<slot />
