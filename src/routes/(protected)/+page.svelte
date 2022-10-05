<script lang="ts">
	import { sendForm } from '$lib/api';
	import { friendRequestsStore, friendsStore, socketManager } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import FriendPreview from './FriendPreview.svelte';
	import type { SocketFriend } from '$shared/src/interface';

	const addFriend = async (e: Event) => {
		const res = await sendForm(e.target as HTMLFormElement);

		if (res.success) {
			// Add new friend to friend's list
			const newFriend = res.data.friend;
			$friendsStore = [
				...$friendsStore,
				{ username: newFriend.username, online: false, typing: false, messages: [] }
			];

			// Remove friend from requests
			$friendRequestsStore = $friendRequestsStore.filter(
				(fr) => fr.username !== newFriend.username
			);

			$socketManager?.emit('friend', { username: newFriend.username } as SocketFriend);
		}

		if (res.error) {
			console.error(res.error);
		}
	};
</script>

<Header>
	<div class="flex justify-end" slot="right">
		<a href="/settings" class="text-gray-700">Settings</a>
	</div>
</Header>

<section class="pt-8">
	<div class="container">
		<h1 class="text-3xl">Friends ({$friendsStore.length})</h1>
	</div>
	<div class="divide-y">
		{#if $friendsStore.length === 0}
			<div class="container p-4">
				<p class="mb-2">You have no friends added. 🥲</p>
				<p><a class="text-gray-500" href="/settings">Click here to add a friend!</a></p>
			</div>
		{:else}
			{#each $friendsStore as friend} <FriendPreview {friend} />{/each}
		{/if}
	</div>
</section>

{#if $friendRequestsStore.length > 0}
	<section class="py-4">
		<div class="container">
			<h1 class="text-3xl">Friend Requests</h1>
		</div>
		<div class="divide-y">
			{#each $friendRequestsStore as request}
				<div class="py-4 container hover:bg-gray-100 flex justify-between items-center">
					<div>
						<p class="text-gray-700">{request.username}</p>
						<p class="text-gray-400">Added you</p>
					</div>
					<div class="flex gap-4">
						<form action="/friends" method="post" on:submit|preventDefault={addFriend}>
							<input type="hidden" name="friend" value={request.username} />
							<button class="bg-gray-200 rounded py-2 px-4">Add back</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
