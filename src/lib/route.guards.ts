import { redirect, type ServerLoadEvent } from '@sveltejs/kit';

/**
 * Redirects users to '/' if they are authorized.
 */
export const unauthorizedRouteGuard = ({ locals }: ServerLoadEvent) => {
	if (locals.user) {
		throw redirect(302, '/');
	}
};

/**
 * Redirects users to '/auth/login' if they are not authorized to use this route.
 */
export const authorizedRouteGuard = ({ locals }: ServerLoadEvent) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}
};
