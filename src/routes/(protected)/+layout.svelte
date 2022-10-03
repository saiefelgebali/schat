<script lang="ts">
	import { friendsStore, socket } from '$lib/store';
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';
	import type { ChatMessage } from '../../lib/chatMessage.interface';
	import type { Friend } from '$lib/friend.interface';

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
			$socket.emit('join', data.user.username);
		});

		$socket.on('message', (message: ChatMessage) => {
			if (message.from === data.user.username) {
				updateFriend(message.to, (friend) => {
					friend.messages = [...friend.messages, message];
				});
			}
			updateFriend(message.from, (friend) => {
				friend.messages = [...friend.messages, message];
			});
		});

		$socket.on('typing', (data: { from: string; status: boolean }) => {
			updateFriend(data.from, (friend) => {
				friend.typing = data.status;
			});
		});

		$socket.on('online', (data: { username: string; status: boolean }) => {
			console.log(data.username, 'is', data.status ? 'online' : 'offline');
			friendsStore.update((store) => {
				const storedFriend = store.find((f) => f.username === data.username);
				if (!storedFriend) return store;
				storedFriend.online = data.status;
				return store;
			});
		});
	});
</script>

<slot />
