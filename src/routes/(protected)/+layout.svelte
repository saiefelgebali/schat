<script lang="ts">
	import { socket } from '$lib/socket';
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';

	export let data: App.PageData;

	onMount(() => {
		socket.set(io());

		$socket.on('connect', () => {
			console.log('Connected via WebSockets');
			$socket.emit('join', data.user!.username);
		});
	});
</script>

<slot />
