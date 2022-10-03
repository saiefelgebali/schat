import type { ServerLoadEvent } from '@sveltejs/kit';
import { authorizedRouteGuard } from '$lib/route.guards';
import type { Friend } from '$shared/interface';
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
		friends,
		friendRequests: [...profile.friends]
	};
};
