import type { ServerLoadEvent } from '@sveltejs/kit';
import type { Friend } from '$shared/src/interface';
import { authorizedRouteGuard } from '$lib/route.guards';
import db from '$shared/src/db';
import type { ChatMessage } from '@prisma/client';

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

	if (!data) throw new Error();

	// Get all friend messages
	const friendMessages: { [username: string]: ChatMessage[] } = {};
	await Promise.all(
		data.friends.map(async (friend) => {
			const messages = await db.chatMessage.findMany({
				where: {
					fromUsername: { in: [username, friend.username] },
					OR: { toUsername: { in: [username, friend.username] } }
				},
				orderBy: { timestamp: 'asc' }
			});
			friendMessages[friend.username] = messages;
		})
	);

	const friends =
		data.friends.map<Friend>((f) => ({
			username: f.username,
			messages: friendMessages[f.username],
			online: false,
			typing: false
		})) || [];

	const friendRequests =
		data.receivedFriendRequests.map<{ username: string }>((fr) => ({
			username: fr.fromUsername
		})) || [];

	return {
		user: { username },
		friends,
		friendRequests
	};
};
