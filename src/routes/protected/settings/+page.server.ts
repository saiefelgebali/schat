import type { ServerLoad } from '@sveltejs/kit';
import { authorizedRouteGuard } from '$lib/route.guards';

export const load: ServerLoad = (event) => {
	authorizedRouteGuard(event);

	return {
		user: event.locals.user!
	};
};
