/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/auth/login',
        'http://localhost:3000/auth/register',
      ],
      startServerCommand: 'pnpm --filter @menuos/web start',
      startServerReadyPattern: 'Ready in',
      numberOfRuns: 1,
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'color-contrast': 'error',
        'meta-description': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'label': 'error',
        'link-name': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
