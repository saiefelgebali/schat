type SendFormResult = Promise<{
	error?: string;
	success?: string;
	user?: { username: string };
	data?: any;
}>;

/**
 * Send an HTML form using the JS Fetch API
 */
export async function sendForm(form: HTMLFormElement): SendFormResult {
	const res = await fetch(form.action, {
		method: form.method,
		body: new FormData(form),
		headers: { accept: 'application/json' }
	});

	return await res.json();
}
