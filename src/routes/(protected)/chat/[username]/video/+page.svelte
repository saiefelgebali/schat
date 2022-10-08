<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { socketManager } from '$lib/store';
	import type { MediaConnection, Peer } from 'peerjs';
	import type { SocketConnectCall, SocketDisconnectCall } from '$shared/src/interface';

	export let data: { user: { username: string }; friend: { username: string } };

	let localPeer: Peer;
	let localVideo: HTMLVideoElement;
	let localStream: MediaStream;

	let call: MediaConnection;
	let remoteVideo: HTMLVideoElement;
	let remoteStream: MediaStream;

	onMount(async () => {
		if (!browser) return;

		// Try to access the user's media devices
		try {
			localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
		} catch {
			localStream = new MediaStream();
		}

		// Connect local stream to video
		if (localVideo) showVideoStream(localVideo, localStream);

		// Connect to peer server
		const { Peer } = await import('peerjs');

		localPeer = new Peer({
			host: '/',
			port: 3000
		});

		localPeer.on('open', handlePeerOpen);
		localPeer.on('call', handlePeerCall);

		$socketManager?.emit('disconnect-call', {
			username: data.friend.username
		});

		$socketManager.on('connect-call', handleConnectCall);
		$socketManager.on('disconnect-call', handleDisconnectCall);
	});

	onDestroy(() => {
		$socketManager?.emit('disconnect-call', {
			username: data.friend.username
		} as SocketDisconnectCall);
	});

	// Socket event handlers
	function handleConnectCall(data: SocketConnectCall) {
		callPeer(data.userId);
	}
	function handleDisconnectCall(data: SocketConnectCall) {
		console.log('user disconnected');
		closeVideoStream(remoteVideo, remoteStream);
	}

	// Peer event handlers

	function handlePeerOpen(id: string) {
		console.log('Peer open');
		$socketManager.emit('connect-call', {
			userId: id,
			username: data.friend.username
		} as SocketConnectCall);
	}

	function handlePeerCall(call: MediaConnection) {
		console.log('Peer call');
		call.answer(localStream);
		call.on('stream', handleCallStream);
		call.on('close', handleCallClose);
	}

	function callPeer(id: string) {
		console.log('Calling peer');
		call = localPeer.call(id, localStream);
		call.on('stream', handleCallStream);
		call.on('close', handleCallClose);
	}

	function handleCallStream(stream: MediaStream) {
		remoteStream = stream;
		showVideoStream(remoteVideo, remoteStream);
	}

	function handleCallClose() {
		call.close();
	}

	// Utility functions

	async function showVideoStream(video: HTMLVideoElement, stream: MediaStream) {
		video.srcObject = stream;
		video.onloadedmetadata = () => {
			video.play();
		};
	}

	async function closeVideoStream(video: HTMLVideoElement, stream: MediaStream) {
		stream?.getTracks()?.forEach((track) => {
			track.stop();
		});
		video.srcObject = null;
	}
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
