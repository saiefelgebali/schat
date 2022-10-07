<script lang="ts">
	import { socketManager } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import MessageField from './MessageField.svelte';
	import MessageBox from './MessageBox.svelte';
	import { friendsStore } from '$lib/store';
	import type { SocketMessageToServer } from '$shared/src/interface';
	import Icon from '$lib/components/Icon.svelte';

	// State
	export let data: {
		user: { username: string };
		friend: { username: string };
	};

	$: friend = $friendsStore.find((f) => f.username === data.friend.username);

	let draft: SocketMessageToServer = {
		text: '',
		from: data.user.username,
		to: data.friend.username
	};

	// Send typing status
	$: typing = draft.text.length > 2;

	$: {
		if ($socketManager)
			$socketManager.emit('typing', {
				from: data.user.username,
				to: data.friend.username,
				status: typing
			});
	}

	// Send drafted message
	function sendMessage() {
		$socketManager.emit('message', draft);
		draft.text = '';
	}
</script>

<Header>
	<div class="flex items-center gap-2" slot="center">
		<h2 class="font-medium text-gray-900">{data.friend.username}</h2>
		<p>{friend?.online ? 'Online' : 'Offline'}</p>
	</div>
	<div class="flex items-center justify-end" slot="right">
		<a href={`/chat/${data.friend.username}/video`}>
			<Icon icon="video" class="cursor-pointer" />
		</a>
	</div>
</Header>

{#if friend}
	<div>
		<MessageBox user={data.user} {friend} />
	</div>

	<div class="border-t pt-4 pb-6 fixed bottom-0 left-0 right-0 z-20 bg-gray-50">
		<MessageField bind:value={draft.text} class="w-full" send={sendMessage} />
	</div>
{/if}
