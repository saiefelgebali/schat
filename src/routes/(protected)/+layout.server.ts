import type { ServerLoadEvent } from '@sveltejs/kit';
import { authorizedRouteGuard } from '$lib/route.guards';
import db from '$lib/db';

export const load = async (event: ServerLoadEvent) => {
	authorizedRouteGuard(event);

	if (!event.locals.user) throw new Error();
	const username = event.locals.user.username;

	return {
		user: { username }
	};
};
