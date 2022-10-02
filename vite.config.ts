import { sveltekit } from '@sveltejs/kit/vite';
import type { Plugin, UserConfig } from 'vite';
import { configureServer } from './server/webSocketServer';

export const webSocketServer: Plugin = {
	name: 'webSocketServer',
	configureServer: configureServer
};

const config: UserConfig = {
	plugins: [webSocketServer, sveltekit()]
};

export default config;
