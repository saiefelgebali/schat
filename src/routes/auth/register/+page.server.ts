import type { ServerLoad } from '@sveltejs/kit';
import { unauthorizedRouteGuard } from '$lib/route.guards';

export const load: ServerLoad = (event) => {
	unauthorizedRouteGuard(event);
};
