import type { ChatMessage } from './chatMessage.interface';

export interface Friend {
	username: string;
	online: boolean;
	typing: boolean;
	messages: ChatMessage[];
}
