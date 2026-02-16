export default [
    {
        ignores: ['node_modules/**', 'public/**', 'test-results/**'],
    },
    {
        files: ['**/*.js'],
        rules: {
            // Relaxed rules for demo project
            'no-unused-vars': 'warn',
            'no-console': 'off',
        },
    },
];
