module.exports = {
	root: true,
	env: {
		browser: false,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		ecmaVersion: 2019,
	},
	ignorePatterns: [
		'.eslintrc.js',
		'**/*.js',
		'/dist',
		'/node_modules',
	],
	overrides: [
		{
			files: ['./nodes/**/*.ts'],
			plugins: ['n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/nodes'],
			rules: {
				'n8n-nodes-base/node-param-default-wrong-for-limit': 'warn',
				'n8n-nodes-base/node-param-placeholder-miscased-id': 'warn',
			},
		},
		{
			files: ['./credentials/**/*.ts'],
			plugins: ['n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/credentials'],
		},
	],
};
