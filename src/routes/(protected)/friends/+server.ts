import type { RequestHandler } from '@sveltejs/kit';

import db from '$shared/src/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw new Error('Not authorized');

	const form = await request.formData();
	const friendUsername = form.get('friend');
	const username = locals.user.username;

	// Invalid input
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

	// Check if that profile exists
	const other = await db.profile.findUnique({ where: { username: friendUsername } });
	if (!other) {
		return new Response(JSON.stringify({ error: 'Could not add this user...' }), {
			status: 400
		});
	}

	// Check if you already sent them a request
	const profile = await db.profile.findUnique({
		where: { username },
		select: {
			friends: { where: { username: friendUsername } },
			sentFriendRequests: { where: { to: { username: friendUsername } } },
			receivedFriendRequests: { where: { from: { username: friendUsername } } }
		}
	});

	if (!profile) throw new Error('Could not find profile');

	if (profile.friends.length > 0 || profile.sentFriendRequests.length > 0) {
		return new Response(JSON.stringify({ error: `You cannot add ${friendUsername} again...` }), {
			status: 400
		});
	}

	// Other person sent you a friend request
	if (profile.receivedFriendRequests.length > 0) {
		await db.profile.update({
			where: { username },
			data: {
				// Add to friends
				friends: { connect: { username: friendUsername } },
				receivedFriendRequests: {
					delete: {
						fromUsername_toUsername: { fromUsername: friendUsername, toUsername: username }
					}
				}
			}
		});

		await db.profile.update({
			where: { username: friendUsername },
			data: {
				friends: { connect: { username } }
			}
		});

		// Success
		return new Response(
			JSON.stringify({
				success: 'Added friend.',
				data: { friend: { username: friendUsername } }
			}),
			{ status: 200 }
		);
	}

	// Otherwise, just send that profile a friend request
	await db.profile.update({
		where: { username },
		data: {
			sentFriendRequests: { create: { toUsername: friendUsername } }
		}
	});

	return new Response(
		JSON.stringify({
			success: 'Sent friend request.',
			data: { friendRequest: { username: friendUsername } }
		}),
		{ status: 200 }
	);
};
