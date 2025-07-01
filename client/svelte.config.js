// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';


import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(
  {
      // For adapter-static:
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // For SPA fallback
      precompress: true
    }
		),
		alias: {
			'$': path.resolve('./src'),
			'$shared': path.resolve('../shared'),
			'$types': path.resolve('../shared/types'),
			'$server': path.resolve('../server'),
			'$root': path.resolve('./')
		}
	}
};

export default config;
