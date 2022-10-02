<script lang="ts">
	import { sendForm } from '$lib/api';
	import Textfield from '$lib/components/Textfield.svelte';
	import FormInfo from '$lib/components/FormInfo.svelte';
	import AuthForm from '../AuthForm.svelte';
	import AuthLink from '../AuthLink.svelte';
	import AuthSubmit from '../AuthSubmit.svelte';

	let error: string = '';
	let success: string = '';
	let loading: boolean = false;

	const fields = {
		username: '',
		password: ''
	};

	const handleSubmit = async (e: Event) => {
		const formEl = e.target as HTMLFormElement;
		const res = await sendForm(formEl);

		error = res.error || '';
		success = res.success || '';

		if (success !== '' && res.user) {
			location.href = '/';
		}
	};
</script>

<AuthForm
	title="Log in to your account"
	{handleSubmit}
	{loading}
	action="/auth/login"
	method="post"
	autocomplete="off"
>
	<Textfield bind:value={fields.username} type="text" name="username" label="Username" />
	<Textfield bind:value={fields.password} type="password" name="password" label="Password" />
	<FormInfo {error} />
	<AuthSubmit>Log in</AuthSubmit>
</AuthForm>

<AuthLink href="/auth/register">Create a new account</AuthLink>
