import type { ServerLoadEvent } from '@sveltejs/kit';
import type { Friend } from '$lib/interface/friend.interface';
import { authorizedRouteGuard } from '$lib/route.guards';
import db from '$shared/db';

export const load = async (event: ServerLoadEvent) => {
	authorizedRouteGuard(event);

	if (!event.locals.user) throw new Error();
	const username = event.locals.user.username;

	// Select all the profiles that I have added
	const user = (await db.user.findUnique({
		where: { username },
		select: { friends: { select: { username: true } } }
	}))!;

	// Select all the profiles that have added me,
	// but I haven't added back
	const profile = (await db.profile.findUnique({
		where: { username },
		select: {
			username: true,
			friends: {
				select: { username: true },
				where: { username: { notIn: user.friends.map((f) => f.username) } }
			}
		}
	}))!;

	const friends = user.friends.map<Friend>((f) => ({
		username: f.username,
		online: false,
		typing: false,
		messages: []
	}));

	return {
		user: { username },
		friends,
		friendRequests: [...profile.friends]
	};
};
