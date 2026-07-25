// modules/resourceLocker/defaultResources.js
// Seed resources shown on first load. User-added resources are merged in
// alongside these by resourceStore.js.

export const DEFAULT_RESOURCES = [
  {
    id: 'seed-mdn',
    title: 'MDN Web Docs',
    description: 'Reference and guides for HTML, CSS, and JavaScript.',
    url: 'https://developer.mozilla.org',
    tags: ['docs', 'javascript', 'css', 'html'],
  },
  {
    id: 'seed-caniuse',
    title: 'Can I Use',
    description: 'Browser support tables for front-end features.',
    url: 'https://caniuse.com',
    tags: ['reference', 'css', 'javascript'],
  },
  {
    id: 'seed-tailwind',
    title: 'Tailwind CSS Docs',
    description: 'Utility-class reference and configuration guide.',
    url: 'https://tailwindcss.com/docs',
    tags: ['docs', 'css'],
  },
  {
    id: 'seed-regex101',
    title: 'Regex101',
    description: 'Build and debug regular expressions with live explanations.',
    url: 'https://regex101.com',
    tags: ['tools', 'javascript'],
  },
  {
    id: 'seed-devdocs',
    title: 'DevDocs',
    description: 'Fast, searchable API documentation for many languages in one place.',
    url: 'https://devdocs.io',
    tags: ['docs', 'reference'],
  },
  {
    id: 'seed-tsdocs',
    title: 'TypeScript Handbook',
    description: 'Official guide to TypeScript\u2019s type system and syntax.',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    tags: ['docs', 'typescript'],
  },
];
