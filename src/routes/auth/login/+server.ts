import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import cookie from 'cookie';
import db from '$shared/src/db';

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const username = form.get('username');
	const password = form.get('password');

	if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
		return new Response(JSON.stringify({ error: 'Username and password are required.' }), {
			status: 400
		});
	}

	const user = await db.user.findUnique({ where: { username } });
	const validCredentials = user && (await bcrypt.compare(password, user.password));

	if (!validCredentials) {
		return new Response(
			JSON.stringify({
				error: 'Incorrect username and/or password.'
			}),
			{ status: 400 }
		);
	}

	// Generate a new token
	const token = crypto.randomUUID();

	await db.user.update({
		where: { username },
		data: { token }
	});

	return new Response(
		JSON.stringify({
			user: { username },
			success: 'Logged in successfully.'
		}),
		{
			status: 200,
			headers: {
				'Set-Cookie': cookie.serialize('session', token, {
					path: '/',
					// Prevent JavaScript from accessing cookie
					httpOnly: true,
					sameSite: 'strict',
					// Only sent over HTTPS
					secure: process.env.NODE_ENV === 'production',
					// Set cookie to expire after a month
					maxAge: 60 * 60 * 24 * 30
				})
			}
		}
	);
};
