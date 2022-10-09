<script lang="ts">
	import type { ChatMessage } from '@prisma/client';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	export let message: ChatMessage;
	export let user: { username: string };
	let self: HTMLDivElement;

	onMount(() => {
		if (!self) return;
		console.log('message mounted');
		self.scrollIntoView();
	});

	const timestamp = DateTime.fromJSDate(message.timestamp).toFormat('HH:mm');
</script>

<div class="message" class:me={message.fromUsername === user.username} bind:this={self}>
	<div class="flex break-words">
		<p class="text">{message.text}</p>
		<span class="timestamp self-end">{timestamp}</span>
	</div>
</div>

<style lang="postcss">
	.message {
		@apply px-4 py-2 bg-gray-200 rounded-2xl w-max rounded-tl-sm max-w-full;
	}

	.message .timestamp {
		@apply pt-2 ml-2;
	}

	.me {
		@apply bg-blue-800  rounded-tl-2xl rounded-tr-sm self-end;
	}

	.me p {
		@apply text-white;
	}

	.timestamp {
		@apply text-xs text-gray-400;
	}
</style>
