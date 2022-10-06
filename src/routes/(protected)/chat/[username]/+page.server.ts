import { redirect, type ServerLoad } from '@sveltejs/kit';
import { authorizedRouteGuard } from '$lib/route.guards';
import db from '$shared/src/db';
import type { Friend } from '$shared/src/interface';

export const load: ServerLoad = async (event) => {
	authorizedRouteGuard(event);

	const user = await db.profile.findUnique({
		select: { username: true, friends: { select: { username: true } } },
		where: { username: event.locals.user!.username }
	});
	const friend = await db.profile.findUnique({
		select: { username: true, friends: { select: { username: true } } },
		where: { username: event.params.username }
	});

	if (!friend || !user) {
		throw redirect(302, '/');
	}

	const messages = await db.chatMessage.findMany({
		where: {
			fromUsername: { in: [user.username, friend.username] },
			OR: { toUsername: { in: [user.username, friend.username] } }
		},
		take: 5,
		orderBy: { timestamp: 'desc' }
	});

	// Check if there is a mutual relationship in place
	const isFriend =
		user.friends.map((f) => f.username).includes(friend.username) &&
		friend.friends.map((f) => f.username).includes(user.username);

	return {
		user: { username: user.username },
		friend: { username: friend.username, online: false, typing: false, messages } as Friend,
		isFriend
	};
};
