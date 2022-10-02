/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			container: {
				padding: '1rem',
				center: true
			}
		}
	},
	plugins: []
};
