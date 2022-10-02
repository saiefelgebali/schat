<script lang="ts">
	import { sendForm } from '$lib/api';
	import Textfield from '$lib/components/Textfield.svelte';
	import FormInfo from '$lib/components/FormInfo.svelte';
	import AuthForm from '../AuthForm.svelte';
	import AuthSubmit from '../AuthSubmit.svelte';
	import AuthLink from '../AuthLink.svelte';

	let error: string = '';
	let success: string = '';
	let loading: boolean = false;

	const data = {
		username: '',
		password: '',
		confirm: ''
	};

	async function handleSubmit(event: SubmitEvent) {
		const formEl = event.target as HTMLFormElement;
		const res = await sendForm(formEl);

		error = res.error || '';
		success = res.success || '';

		if (success !== '') {
			window.location.href = '/auth/login';
		}
	}
</script>

<AuthForm
	title="Create an account"
	{handleSubmit}
	{loading}
	action="/auth/register"
	method="post"
	autocomplete="off"
>
	<Textfield bind:value={data.username} type="text" name="username" label="Username" required />
	<Textfield bind:value={data.password} type="password" name="password" label="Password" required />
	<Textfield bind:value={data.confirm} type="password" label="Confirm Password" />
	<FormInfo {error} />
	<AuthSubmit>Create account</AuthSubmit>
</AuthForm>

<AuthLink href="/auth/login">Sign in to an existing account</AuthLink>
