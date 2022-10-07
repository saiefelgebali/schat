// Sockets

import { ChatMessage } from '@prisma/client';
import type Peer from 'peerjs';

export interface SocketJoin {
	username: string;
}

export interface SocketMessageToServer {
	from: string;
	to: string;
	text: string;
}

export interface SocketTyping {
	from: string;
	to: string;
	status: boolean;
}

export interface SocketOnline {
	username: string;
	status: boolean;
}

export interface SocketFriendRequest {
	username: string;
}

export interface SocketFriend {
	username: string;
}

export interface SocketConnectCall {
	username: string;
	userId: string;
}

export interface SocketDisconnectCall {
	username: string;
}

// Other
export interface Friend {
	username: string;
	online: boolean;
	typing: boolean;
	messages: ChatMessage[];
	peer?: Peer;
}
