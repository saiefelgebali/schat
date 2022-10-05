import type { ServerLoadEvent } from '@sveltejs/kit';
import { authorizedRouteGuard } from '$lib/route.guards';

export const load = async (event: ServerLoadEvent) => {
	authorizedRouteGuard(event);
};
