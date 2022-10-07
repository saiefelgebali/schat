<script lang="ts">
	import type { ChatMessage } from '@prisma/client';

	export let message: ChatMessage;
	export let user: { username: string };
</script>

<p class="message break-words" class:me={message.fromUsername === user.username}>
	{message.text}
</p>

<style lang="postcss">
	.message {
		@apply px-4 py-2 bg-gray-200 rounded-2xl w-max rounded-tl-sm max-w-full;
	}

	.me {
		@apply bg-blue-800 text-white rounded-tl-2xl rounded-tr-sm self-end;
	}
</style>
