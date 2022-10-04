<script lang="ts">
	import type { Friend } from '$shared/src/interface';
	import StatusIndicator from './StatusIndicator.svelte';

	export let friend: Friend;
</script>

<a href={`/chat/${friend.username}`} class="block py-4 container hover:bg-gray-100">
	<div class="flex items-center gap-4">
		<StatusIndicator online={friend.online} />
		<div class="flex flex-col overflow-hidden">
			<p class="text-gray-700 truncate">{friend.username}</p>
			<p class="text-gray-400 truncate">
				{#if friend.typing}
					Typing...
				{:else if friend.messages.length > 0}
					{friend.messages[friend.messages.length - 1].text}
				{:else}
					Click to message
				{/if}
			</p>
		</div>
	</div>
</a>
