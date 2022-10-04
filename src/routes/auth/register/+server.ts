import type { RequestHandler, RequestEvent } from '@sveltejs/kit';
import db from '$shared/src/db';
import bcrypt from 'bcrypt';

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const form = await request.formData();
	const username = form.get('username');
	const password = form.get('password');

	if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
		return new Response(
			JSON.stringify({
				error: 'Username and password are required.'
			}),
			{ status: 400 }
		);
	}

	try {
		// Create a user
		await db.user.create({
			data: {
				username,
				// Encrypt password
				password: await bcrypt.hash(password, 10)
			}
		});

		// Create matching profile
		await db.profile.create({
			data: { username }
		});

		return new Response(
			JSON.stringify({
				success: 'User created successfully.'
			}),
			{ status: 201 }
		);
	} catch (error) {
		// Username is already taken
		return new Response(
			JSON.stringify({
				error: 'User already exists.'
			}),
			{ status: 400 }
		);
	}
};
