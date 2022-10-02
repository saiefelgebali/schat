import type { ServerLoad } from '@sveltejs/kit';
import { unauthorizedRouteGuard } from '$lib/route.guards';

export const load: ServerLoad = (event): App.PageData => {
	unauthorizedRouteGuard(event);

	return { user: event.locals.user };
};
