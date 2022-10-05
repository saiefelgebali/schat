<script lang="ts">
	import { friendRequestsStore, friendsStore, socketManager } from '$lib/store';
	import { onMount } from 'svelte';
	import type { Friend } from '$shared/src/interface';
	import { SocketManager } from '$lib/socket.manager';

	export let data: {
		user: { username: string };
		friends: Friend[];
		friendRequests: { username: string }[];
	};

	onMount(() => {
		// Add friends to store
		$friendsStore = data.friends;

		// Add friend requests to store
		$friendRequestsStore = data.friendRequests;

		$socketManager = new SocketManager(data.user.username);
	});
</script>

<slot />
