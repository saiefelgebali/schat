<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import { socketManager } from '$lib/store';
	import type { MediaConnection, Peer } from 'peerjs';
	import type { SocketStartCall, SocketDisconnectCall } from '$shared/src/interface';
	import MyVideo from './MyVideo.svelte';
	import FriendVideo from './FriendVideo.svelte';
	import Icon from '$lib/components/Icon.svelte';

	export let data: { user: { username: string }; friend: { username: string } };

	const buttonSize = 20;

	let localPeer: Peer;
	let localId: string;
	let localVideo: HTMLVideoElement;
	let localStream: MediaStream;

	let remoteId: string | null;
	let remoteVideo: HTMLVideoElement;
	let remoteStream: MediaStream | null;

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
				audio: true
			});
		} catch (e) {
			alert('Could not access the camera');
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
		endCall();
		stopStreaming();
	});

	// Socket event handlers
	function handleStartCall(msg: SocketStartCall) {
		console.log('receiving call from friend');
		if (msg.from !== data.friend.username) return;
		remoteId = msg.userId;
		if (status === 'sending-call') {
			return answerUser();
		}
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
		if (remoteVideo) remoteVideo.srcObject = null;
		remoteId = remoteStream = status = null;
	}

	// Utility functions

	async function showVideoStream(video: HTMLVideoElement, stream: MediaStream) {
		video.srcObject = stream;
		video.onloadedmetadata = () => {
			video.play();
		};
	}
</script>

<div>
	<div class="container p-0  min-h-screen flex relative">
		<!-- svelte-ignore a11y-media-has-caption -->
		<MyVideo bind:self={localVideo} />
		<FriendVideo bind:self={remoteVideo} />

		<div class="container absolute flex justify-center bottom-24 w-full">
			<div class="max-w-md w-full">
				{#if !status}
					<div class="w-full flex justify-center">
						<button class="call-button bg-green-600" on:click={callUser}
							><Icon
								width={buttonSize}
								height={buttonSize}
								icon="phone"
								class="fill-white"
							/></button
						>
					</div>
				{:else if status === 'receiving-call'}
					<div class="w-full">
						<div class="flex justify-center mb-8">
							<p>{data.friend.username} is calling you...</p>
						</div>
						<div class="flex w-full justify-between">
							<button class="call-button bg-green-600" on:click={answerUser}
								><Icon
									width={buttonSize}
									height={buttonSize}
									icon="phone"
									class="fill-white"
								/></button
							>
							<button class="call-button bg-red-600" on:click={endCall}
								><Icon
									width={buttonSize}
									height={buttonSize}
									icon="phone"
									class="fill-white"
								/></button
							>
						</div>
					</div>
				{:else if status === 'sending-call'}
					<div class="w-full">
						<div class="flex justify-center mb-8">
							<p>Calling {data.friend.username}...</p>
						</div>
						<div class="flex w-full justify-center">
							<button class="call-button bg-red-600" on:click={endCall}
								><Icon
									width={buttonSize}
									height={buttonSize}
									icon="phone"
									class="fill-white"
								/></button
							>
						</div>
					</div>
				{:else if status === 'connecting'}
					<div class="w-full">
						<div class="flex justify-center mb-8">
							<p>Connecting...</p>
						</div>
						<div class="flex w-full justify-center">
							<button class="call-button bg-red-600" on:click={endCall}
								><Icon
									width={buttonSize}
									height={buttonSize}
									icon="phone"
									class="fill-white"
								/></button
							>
						</div>
					</div>
				{:else}
					<div class="w-full">
						<div class="flex w-full justify-center">
							<button class="call-button bg-red-600" on:click={endCall}
								><Icon
									width={buttonSize}
									height={buttonSize}
									icon="phone"
									class="fill-white"
								/></button
							>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.call-button {
		@apply p-4 rounded-full aspect-square flex justify-center items-center;
	}
</style>
