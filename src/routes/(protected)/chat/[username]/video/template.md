# Template for connecting users via peer.js

```js
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import { socketManager, username } from '$lib/store';
	import type { MediaConnection, Peer } from 'peerjs';
	import type { SocketConnectCall } from '$shared/src/interface';

	let myVideo: HTMLVideoElement;
	let friendVideo: HTMLVideoElement;

	let myPeer: Peer;
	let friendPeer: MediaConnection | null = null;

	onMount(async () => {
		if (!browser) return;

		const { Peer } = await import('peerjs');

		// Add my stream to display
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
		addVideoStream(myVideo, stream);

		// Setup a peer connection
		myPeer = new Peer('', {
			host: '/',
			port: 3000
		});

		myPeer.on('open', (id) => {
			// Initiate connection
			$socketManager.emit('connect-call', { username: $username, userId: id } as SocketConnectCall);
		});

		myPeer.on('call', (call) => {
			console.log('receiving call from user');
			call.answer(stream);
			call.on('stream', (friendVideoStream) => {
				addVideoStream(friendVideo, friendVideoStream);
			});
		});

		// Accept connection
		function connectCall({ userId }: SocketConnectCall) {
			connectToUser(userId, stream);
		}
		$socketManager.off('connect-call', connectCall);
		$socketManager.on('connect-call', connectCall);

		// Close connection
		function disconnectCall() {
			friendPeer?.close();
		}
		$socketManager.off('disconnect-call', disconnectCall);
		$socketManager.on('disconnect-call', disconnectCall);
	});

	onDestroy(() => {
		friendPeer?.close();
		$socketManager?.emit('disconnect-call', { username: $username });
	});

	const addVideoStream = (video: HTMLVideoElement, stream: MediaStream) => {
		video.srcObject = stream;
		video.addEventListener('loadedmetadata', () => {
			video.play();
		});
	};

	function connectToUser(userId: string, stream: MediaStream) {
		const call = myPeer.call(userId, stream);
		console.log('calling user');
		call.on('stream', (friendVideoStream) => {
			addVideoStream(friendVideo, friendVideoStream);
		});
		call.on('close', () => {
			friendVideo.srcObject = null;
			friendPeer = null;
		});
		friendPeer = call;
	}
```
