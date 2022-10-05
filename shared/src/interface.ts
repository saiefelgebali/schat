// Sockets

export interface SocketJoin {
	username: string;
}

export interface SocketMessage {
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

// Other

export interface ChatMessage {
	text: string;
	from: string;
	to: string;
}

export interface Friend {
	username: string;
	online: boolean;
	typing: boolean;
	messages: ChatMessage[];
}
