import type { RequestHandler } from '@sveltejs/kit';

import db from '$shared/src/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response(null, { status: 401 });
	}

	const fd = await request.formData();
	const friendUsername = fd.get('friend');
	const username = locals.user.username;

	if (!friendUsername || typeof friendUsername !== 'string') {
		return new Response(JSON.stringify({ error: "You must enter your friend's username." }), {
			status: 400
		});
	}

	// When a user tries to add themself
	else if (friendUsername === username) {
		return new Response(JSON.stringify({ error: 'You cannot add yourself as a friend...' }), {
			status: 400
		});
	}

	// Check if the friend exists
	const friend = await db.profile.findUnique({
		select: { username: true, friends: { where: { username } } },
		where: { username: friendUsername }
	});
	if (!friend) {
		return new Response(JSON.stringify({ error: 'Could not add friend.' }), { status: 400 });
	}

	// Check if they are already friends
	if (friend.friends.length !== 0) {
		return new Response(
			JSON.stringify({ error: `You are already friends with ${friendUsername}.` }),
			{ status: 400 }
		);
	}

	// Create relationship
	try {
		await db.user.update({
			where: { username },
			data: { friends: { connect: { username: friendUsername } } }
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Something went wrong.' }), { status: 500 });
	}

	return new Response(
		JSON.stringify({ success: 'Added friend.', data: { friend: { username: friendUsername } } }),
		{ status: 200 }
	);
};
