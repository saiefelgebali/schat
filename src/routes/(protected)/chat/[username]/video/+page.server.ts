import type { ServerLoad } from '@sveltejs/kit';
import { authorizedRouteGuard } from '$lib/route.guards';

export const load: ServerLoad = (event) => {
	authorizedRouteGuard(event);

	return {
		user: { username: event.locals.user?.username },
		friend: { username: event.params.username }
	};
};
