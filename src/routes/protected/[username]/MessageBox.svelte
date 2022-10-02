<script lang="ts">
	import { tick } from 'svelte';
	import type { ChatMessage } from './ChatMessage.interface';
	import Message from './Message.svelte';

	export let user: { username: string };
	export let friend: { username: string };
	export let messages: ChatMessage[];
	export let typing: boolean = false;
	let statusBox: HTMLElement;

	async function scrollToBottom() {
		if (!statusBox) return;

		// Scroll to end of message box after DOM update
		await tick();
		statusBox.scrollIntoView();
	}

	// Scroll to bottom
	$: if (messages.length > 0) scrollToBottom();
</script>

<section class="container h-full overflow-y-scroll py-8 mb-20">
	<div class="flex flex-col gap-4">
		{#each messages as message}
			<Message {user} {message} />
		{/each}
	</div>
	<div class:opacity-0={!typing} bind:this={statusBox}>
		<p class="text-sm py-4 text-gray-500">{friend.username} is typing...</p>
	</div>
</section>
