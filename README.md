# Batuhan Ozturk - Personal Website

A modern personal website and blog built with Astro, inspired by the enscribe.dev theme.

## Features

- Fast, modern static site built with Astro
- Blog with MDX support
- Beautiful code syntax highlighting with Expressive Code
- Responsive design with Tailwind CSS
- Dark mode support
- RSS feed for blog posts
- Sitemap generation
- TypeScript for type safety

## Tech Stack

- **Framework**: [Astro](https://astro.build)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Content**: MDX with Content Collections
- **Code Highlighting**: [Expressive Code](https://expressive-code.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Type Safety**: TypeScript

## Project Structure

```text
/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable components
│   ├── content/      # Content collections
│   │   └── blog/     # Blog posts (MDX)
│   ├── layouts/      # Page layouts
│   │   ├── BaseLayout.astro
│   │   └── BlogPostLayout.astro
│   ├── lib/          # Utility functions
│   ├── pages/        # Routes
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── blog/
│   │   └── rss.xml.ts
│   └── styles/       # Global styles
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:4321`

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `npm run astro ...` | Run Astro CLI commands |

## Writing Blog Posts

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Your Post Title"
description: "A brief description"
pubDate: "2025-10-12"
author: "Batuhan Ozturk"
tags: ["tag1", "tag2"]
---

# Your Content Here

Write your blog post content using Markdown and MDX.
```

## Customization

### Update Site Information

1. Edit `astro.config.mjs` to update the site URL
2. Update personal information in [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro)
3. Customize colors in [src/styles/global.css](src/styles/global.css)
4. Update social links in [src/pages/about.astro](src/pages/about.astro)

### Adding New Pages

Create new `.astro` files in `src/pages/`. Astro uses file-based routing.

## Deployment

This site can be deployed to various platforms:

- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [GitHub Pages](https://pages.github.com)

Build the site with:

```bash
npm run build
```

## Acknowledgments

This theme is inspired by [enscribe.dev](https://github.com/jktrn/enscribe.dev) by jktrn.

## License

MIT License - feel free to use this for your own projects!
