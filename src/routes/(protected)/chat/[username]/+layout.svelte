<script lang="ts">
	import { onMount } from 'svelte';
	import { friendsStore } from '$lib/store';
	import type { Friend } from '$shared/src/interface';

	// State
	export let data: {
		user: { username: string };
		friend: Friend;
	};

	$: friend = $friendsStore.find((f) => f.username === data.friend.username);

	onMount(() => {
		if (!friend) {
			$friendsStore = [...$friendsStore, data.friend];
		}
	});
</script>

<slot />
