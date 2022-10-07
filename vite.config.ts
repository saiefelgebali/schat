import { sveltekit } from '@sveltejs/kit/vite';
import type { Plugin, UserConfig } from 'vite';
import { configureServer } from './server/webSocketDevServer';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

export const webSocketDevServer: Plugin = {
	name: 'webSocketDevServer',
	configureServer: configureServer
};

const config: UserConfig = {
	resolve: {
		alias: {
			$shared: path.resolve(__dirname, './shared')
		}
	},
	plugins: [webSocketDevServer, sveltekit()]
};

export default config;
