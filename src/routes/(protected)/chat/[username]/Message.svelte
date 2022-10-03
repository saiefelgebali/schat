<script lang="ts">
	import type { ChatMessage } from '$lib/interface/chat.message.interface';

	export let message: ChatMessage;
	export let user: { username: string };
</script>

<p class="message break-words" class:me={message.from === user.username}>
	{message.text}
</p>

<style lang="postcss">
	.message {
		@apply px-4 py-2 bg-gray-200 rounded-md w-max rounded-bl-sm max-w-full;
	}

	.me {
		@apply bg-blue-800 text-white rounded-bl-md rounded-br-sm self-end;
	}
</style>
