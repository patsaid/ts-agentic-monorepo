module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New features
        'fix',      // Bug fixes
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'test',     // Adding or updating tests
        'chore',    // Maintenance tasks
        'ci',       // CI/CD changes
        'perf',     // Performance improvements
        'revert'    // Revert previous commits
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'backend',      // Backend-specific changes
        'frontend',     // Frontend-specific changes
        'agents',       // AI agents module
        'users',        // Users module
        'auth',         // Authentication
        'conversations',// Conversations module
        'user-info',    // User info module
        'database',     // Database changes
        'api',          // API changes
        'ui',           // UI components
        'config',       // Configuration changes
        'deps',         // Dependencies
        'monorepo',     // Monorepo-wide changes
        'testing',      // Testing infrastructure
        'lint',         // Linting configuration
      ]
    ],
    'subject-max-length': [2, 'always', 72],
    'header-max-length': [2, 'always', 100],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never']
  }
};