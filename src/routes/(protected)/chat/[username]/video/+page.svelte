<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import { socketManager } from '$lib/store';
	import type { MediaConnection, Peer } from 'peerjs';
	import type { SocketStartCall, SocketDisconnectCall } from '$shared/src/interface';

	export let data: { user: { username: string }; friend: { username: string } };

	let localPeer: Peer;
	let localId: string;
	let localVideo: HTMLVideoElement;
	let localStream: MediaStream;

	let remoteId: string | null;
	let remoteVideo: HTMLVideoElement;
	let remoteStream: MediaStream | null;
	let remoteMuted = true;

	let status: 'receiving-call' | 'sending-call' | 'connecting' | 'in-call' | null = null;

	onMount(async () => {
		if (!browser) return;

		// Try to access the user's media devices
		try {
			localVideo.setAttribute('autoplay', 'true');
			localVideo.setAttribute('muted', 'true');
			localVideo.setAttribute('playsinline', 'true');
			localStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false
			});
			alert('Got user media');
		} catch (e) {
			alert('Could not get user media');
			localStream = new MediaStream();
		}

		// Connect local stream to video
		if (localVideo) showVideoStream(localVideo, localStream);

		// Connect to peer server
		const { Peer } = await import('peerjs');

		localPeer = new Peer({
			host: import.meta.env.VITE_PUBLIC_PEER_HOST,
			port: import.meta.env.VITE_PUBLIC_PEER_PORT
		});

		console.log('Connecting to peer server', import.meta.env.VITE_PUBLIC_PEER_HOST);

		localPeer.on('open', (id) => (localId = id));
		localPeer.on('call', answerCall);

		// Reset handlers
		$socketManager.off('start-call', handleStartCall);
		$socketManager.off('disconnect-call', handleDisconnectCall);

		$socketManager.on('start-call', handleStartCall);
		$socketManager.on('disconnect-call', handleDisconnectCall);
	});

	onDestroy(() => {
		stopStreaming();
	});

	// Socket event handlers
	function handleStartCall(msg: SocketStartCall) {
		console.log('receiving call from friend');
		if (msg.from !== data.friend.username) return;
		remoteId = msg.userId;
		status = 'receiving-call';
	}
	function handleDisconnectCall() {
		console.log('user disconnected');
		closeCall();
	}

	// Peer event handlers

	/**
	 * Start a call by sending the event via sockets.
	 */
	function callUser() {
		console.log('sending call to friend');
		$socketManager?.emit('start-call', {
			userId: localId,
			from: data.user.username,
			to: data.friend.username
		} as SocketStartCall);
		status = 'sending-call';
	}

	/**
	 * Answer a call request sent via sockets.
	 */
	function answerUser() {
		if (!remoteId) throw new Error('Could not answer call');
		console.log('answering call from friend');
		$socketManager?.emit('accept-call', {
			userId: localId,
			from: data.user.username,
			to: data.friend.username
		} as SocketStartCall);
		callPeer(remoteId);
	}

	/**
	 * Initiate a p2p connection with a user.
	 */
	function callPeer(id: string) {
		if (!localPeer || !localStream) throw new Error('Cannot call peer');
		const call = localPeer.call(id, localStream);
		status = 'connecting';
		call.on('stream', (stream) => {
			remoteStream = stream;
			showVideoStream(remoteVideo, remoteStream);
			status = 'in-call';
		});
	}

	/**
	 * Receive a call from another peer
	 */
	function answerCall(call: MediaConnection) {
		call.answer(localStream);
		status = 'connecting';
		call.on('stream', (stream) => {
			remoteStream = stream;
			showVideoStream(remoteVideo, remoteStream);
			status = 'in-call';
		});
	}

	/**
	 * End a call
	 */
	function endCall() {
		$socketManager?.emit('disconnect-call', {
			from: data.user.username,
			to: data.friend.username
		} as SocketDisconnectCall);
		closeCall();
	}

	function stopStreaming() {
		localStream?.getTracks().forEach((track) => {
			track.stop();
		});
	}

	function closeCall() {
		remoteStream?.getTracks().forEach((track) => {
			track.stop();
		});
		remoteVideo.srcObject = remoteId = remoteStream = status = null;
	}

	// Utility functions

	async function showVideoStream(video: HTMLVideoElement, stream: MediaStream) {
		video.srcObject = stream;
		video.onloadedmetadata = () => {
			video.play();
		};
	}

	function unmuteVideo() {
		console.log('unmuted video');
	}
</script>

<div class="">
	<div class="container p-0 min-h-screen flex relative">
		<video class="my-video" bind:this={localVideo} autoplay playsinline muted />
		<!-- svelte-ignore a11y-media-has-caption -->
		<video class="friend-video" bind:this={remoteVideo} on:click={unmuteVideo} />

		<div class="absolute flex bottom-8 w-full  justify-center">
			{#if !status}
				<button class="call-button bg-green-600" on:click={callUser}>Call</button>
			{:else if status === 'receiving-call'}
				<button class="call-button bg-green-600" on:click={answerUser}>Answer</button>
			{:else if status === 'sending-call'}
				<button class="call-button bg-green-600">Calling</button>
			{:else if status === 'connecting'}
				<button class="call-button bg-green-600">Loading</button>
			{:else}
				<button on:click={endCall} class="call-button bg-red-600">End</button>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	.call-button {
		@apply text-white p-4 w-20 rounded-full aspect-square text-xs;
	}

	.my-video {
		border-radius: 1rem;
		position: absolute;
		top: 1rem;
		left: 1rem;
		width: 200px;
	}

	.friend-video {
		width: 100%;
	}
</style>
