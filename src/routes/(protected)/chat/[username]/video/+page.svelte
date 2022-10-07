<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { socketManager, username } from '$lib/store';
	import type { MediaConnection, Peer } from 'peerjs';
	import type { SocketConnectCall } from '$shared/src/interface';

	let localVideo: HTMLVideoElement;
	let remoteVideo: HTMLVideoElement;
</script>

<div class="bg-black">
	<div class="container p-0 min-h-screen flex relative">
		<video class="my-video" bind:this={localVideo} muted={true}><track kind="captions" /></video>
		<video class="friend-video" bind:this={remoteVideo} muted={true}
			><track kind="captions" /></video
		>
	</div>
</div>

<style>
	.my-video {
		border-radius: 1rem;
		position: absolute;
		top: 1rem;
		left: 1rem;
		width: 200px;
	}

	.friend-video {
		width: 100%;
		background-color: gray;
	}
</style>
