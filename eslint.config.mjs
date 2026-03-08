import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import nextVitals from 'eslint-config-next/core-web-vitals'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'

const eslintConfig = defineConfig([
	// js.configs.recommended, // TODO - Turn these on
	// ...tseslint.configs.recommended,
	...nextVitals,
	{
		plugins: {
			'unused-imports': unusedImports,
		},
		rules: {
			'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
			'unused-imports/no-unused-imports': 'error',
			'prefer-const': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
		},
	},
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'.git/**',
		'.github/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
	]),
])

export default eslintConfig
