import type { Handle } from '@sveltejs/kit';
import cookie from 'cookie';
import db from '$lib/db';

export const handle: Handle = async ({ event, resolve }) => {
	const cookieHeader = event.request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');

	// Default behaviour
	if (!cookies.session) {
		return await resolve(event);
	}

	// Add user to locals
	const user = await db.user.findUnique({
		where: { token: cookies.session },
		select: { username: true }
	});

	if (user) {
		event.locals.user = { username: user.username };
	}

	return await resolve(event);
};
