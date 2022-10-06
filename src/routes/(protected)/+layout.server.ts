import type { ServerLoadEvent } from '@sveltejs/kit';
import type { Friend } from '$shared/src/interface';
import { authorizedRouteGuard } from '$lib/route.guards';
import db from '$shared/src/db';

export const load = async (event: ServerLoadEvent) => {
	authorizedRouteGuard(event);

	if (!event.locals.user) throw new Error();
	const username = event.locals.user.username;

	const data = await db.profile.findUnique({
		where: { username },
		select: {
			friends: true,
			receivedFriendRequests: true
		}
	});

	const friends =
		data?.friends.map<Friend>((f) => ({
			username: f.username,
			messages: [],
			online: false,
			typing: false
		})) || [];

	const friendRequests =
		data?.receivedFriendRequests.map<{ username: string }>((fr) => ({
			username: fr.fromUsername
		})) || [];

	return {
		user: { username },
		friends,
		friendRequests
	};
};
