<script lang="ts">
	import { sendForm } from '$lib/api';
	import MainLayout from '$lib/components/MainLayout.svelte';
	import Textfield from '$lib/components/Textfield.svelte';
	import FormInfo from '$lib/components/FormInfo.svelte';
	import { socketManager } from '$lib/store';
	import type { SocketFriend, SocketFriendRequest } from '$shared/src/interface';

	export let data: App.PageData;

	let error: string = '';
	let success: string = '';

	export const addFriend = async (e: Event) => {
		const formEl = e.target as HTMLFormElement;
		const res = await sendForm(formEl);

		error = res.error || '';
		success = res.success || '';

		if (res.data.friendRequest) {
			$socketManager?.emit('friendRequest', {
				username: res.data.friendRequest.username
			} as SocketFriendRequest);
		} else if (res.data.friend) {
			$socketManager?.emit('friend', { username: res.data.friend.username } as SocketFriend);
		}

		formEl.reset();
	};
</script>

<MainLayout title="Settings">
	<main slot="main">
		<section class="container py-4">
			<h2>Account</h2>
			<p class="mb-4">
				Currently logged in as <span class="text-yellow-700">{data.user?.username}</span>
			</p>
			<a href="/auth/logout" class="text-gray-500">Click to Log out</a>
		</section>

		<section class="container py-4">
			<h2>Friends</h2>
			<form action="/friends" method="post" on:submit|preventDefault={addFriend}>
				<label class="block mb-2 text-gray-600" for="friend">Enter your friend's user id</label>
				<div class="flex gap-2">
					<Textfield type="text" name="friend" autocomplete="off" />
					<button class="bg-gray-200 rounded py-2 px-4">Add</button>
				</div>
				<FormInfo {error} {success} />
			</form>
		</section>
	</main>
</MainLayout>

<style lang="postcss">
	h2 {
		@apply text-xl font-medium mb-4;
	}
</style>
