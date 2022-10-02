<script lang="ts">
	import { socket } from '$lib/socket';
	import Header from '$lib/components/Header.svelte';
	import MessageField from './MessageField.svelte';
	import type { ChatMessage } from './ChatMessage.interface';
	import MessageBox from './MessageBox.svelte';
	import { friendsStore } from '../../../lib/store';

	// State
	export let data: {
		user: { username: string };
		friend: { username: string };
		isFriend: boolean;
	};

	const { user, friend, isFriend } = data;

	$: storedFriend = $friendsStore.find((f) => f.username === friend.username);

	let draft: ChatMessage = {
		text: '',
		from: data.user.username,
		to: data.friend.username
	};
	let messages: ChatMessage[] = [];

	let typing: boolean = false;

	// Add friend to store if not already included
	friendsStore.update((store) => {
		if (store.find((f) => f.username === friend.username)) return store;
		store.push({ ...friend, online: false });
		return store;
	});

	$socket.on('connect', () => {
		console.log('Connected via WebSockets');
		$socket.emit('join', data.user.username);
	});

	$socket.on('message', (message: ChatMessage) => {
		if ([data.friend.username, data.user.username].includes(message.from)) {
			messages = [...messages, message];
		}
	});

	$socket.on('typing', (data: { status: boolean }) => {
		typing = data.status;
	});

	$socket.on('online', (data: { username: string; status: boolean }) => {
		console.log(data.username, 'is', data.status ? 'online' : 'offline');
		friendsStore.update((store) => {
			const storedFriend = store.find((f) => f.username === data.username);
			if (!storedFriend) return store;
			storedFriend.online = true;
			return store;
		});
	});

	// Send typing status
	$: {
		if ($socket.active) {
			$socket.emit('typing', {
				from: data.user.username,
				to: data.friend.username,
				status: draft.text.length > 2
			});
		}
	}

	// Send drafted message
	function sendMessage() {
		$socket.emit('message', draft);
		draft.text = '';
	}
</script>

<div class="max-h-screen h-screen flex flex-col">
	<Header title={friend.username} />

	{storedFriend?.online}
	{#if data.isFriend}
		<MessageBox {user} {friend} {messages} {typing} />
	{/if}
</div>

<div class="border-t pt-4 pb-6 fixed bottom-0 left-0 right-0 z-20 bg-gray-50">
	<MessageField bind:value={draft.text} class="w-full" send={sendMessage} />
</div>
