import type { LoadEvent, ServerLoad, ServerLoadEvent } from '@sveltejs/kit';
import { authorizedRouteGuard } from '$lib/route.guards';

export const load: ServerLoad = (event) => {
	authorizedRouteGuard(event);

	return {
		friendUsername: event.locals.user?.username
	};
};
