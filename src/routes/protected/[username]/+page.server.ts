import { redirect, type ServerLoad } from '@sveltejs/kit';
import { authorizedRouteGuard } from '$lib/route.guards';
import db from '$lib/db';

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

	// Check if there is a mutual relationship in place
	const isFriend =
		user.friends.map((f) => f.username).includes(friend.username) &&
		friend.friends.map((f) => f.username).includes(user.username);

	return {
		user: { username: event.locals.user!.username },
		friend: { username: friend.username },
		isFriend
	} as App.PageData;
};
