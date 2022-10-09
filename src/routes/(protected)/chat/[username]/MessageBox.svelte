<script lang="ts">
	import Message from './Message.svelte';
	import type { Friend } from '$shared/src/interface';
	import type { ChatMessage } from '@prisma/client';
	import { onMount } from 'svelte';
	import { tick } from 'svelte';

	export let user: { username: string };
	export let friend: Friend;
	export let messages: ChatMessage[];

	let statusBox: HTMLElement;

	onMount(async () => {
		await tick();
		statusBox.scrollIntoView();
	});
</script>

<section class="container py-8 mb-20">
	<div class="flex flex-col gap-4">
		{#each messages as message}
			<Message {user} {message} />
		{/each}
	</div>
	<div class:opacity-0={!friend.typing} bind:this={statusBox}>
		<p class="text-sm py-4 text-gray-500">{friend.username} is typing...</p>
	</div>
</section>
