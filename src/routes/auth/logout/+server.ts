import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';

export const GET: RequestHandler = async () => {
	return new Response(null, {
		status: 303,
		headers: {
			'Set-Cookie': cookie.serialize('session', '', {
				path: '/',
				// The cookie should expire immediately
				expires: new Date(0)
			}),
			location: '/'
		}
	});
};
