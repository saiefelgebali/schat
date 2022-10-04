<script lang="ts">
	import { socket } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import MessageField from './MessageField.svelte';
	import MessageBox from './MessageBox.svelte';
	import { friendsStore } from '$lib/store';
	import type { Friend, ChatMessage } from '$shared/src/interface';
	import { onMount } from 'svelte';

	// State
	export let data: {
		user: { username: string };
		friend: Friend;
		isFriend: boolean;
	};

	$: storedFriend = $friendsStore.find((f) => f.username === data.friend.username);
	$: friend = storedFriend || data.friend;

	onMount(() => {
		if (!storedFriend) {
			$friendsStore.push(data.friend);
		}
	});

	let draft: ChatMessage = {
		text: '',
		from: data.user.username,
		to: data.friend.username
	};

	// Send typing status
	$: typing = draft.text.length > 2;

	$: {
		if ($socket && $socket.active) {
			$socket.emit('typing', {
				from: data.user.username,
				to: data.friend.username,
				status: typing
			});
		}
	}

	// Send drafted message
	function sendMessage() {
		$socket?.emit('message', draft);
		draft.text = '';
	}
</script>

<div class="max-h-screen h-screen flex flex-col">
	<Header>
		<div class="flex items-center gap-2" slot="center">
			<h2 class="font-medium text-gray-900">{friend.username}</h2>
			<p>{friend.online ? 'Online' : 'Offline'}</p>
		</div>
	</Header>

	{#if data.isFriend}
		<MessageBox user={data.user} {friend} />
	{/if}
</div>

<div class="border-t pt-4 pb-6 fixed bottom-0 left-0 right-0 z-20 bg-gray-50">
	<MessageField bind:value={draft.text} class="w-full" send={sendMessage} />
</div>
