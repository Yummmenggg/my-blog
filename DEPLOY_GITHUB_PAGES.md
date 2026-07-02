# GitHub Pages Auto Deploy

This repository uses the `blog/` folder as the Astro site root.

## Folder layout

```text
repo/
├─ .github/workflows/deploy-blog.yml
└─ blog/
   ├─ src/content/posts/en/blog/
   ├─ src/content/posts/en/projects/
   ├─ templates/
   ├─ package.json
   └─ astro.config.mjs
```

## One-time GitHub setup

1. Push this repository to GitHub.
2. Open the repository on GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.
5. Push changes to `main` or `master`.

After the workflow finishes, GitHub Pages will show the live URL in the workflow summary and in `Settings` -> `Pages`.

## Where to write posts

Blog posts:

```text
blog/src/content/posts/en/blog/
```

Project posts:

```text
blog/src/content/posts/en/projects/
```

Use the files in `blog/templates/` as writing templates. Every post should keep tags in frontmatter so the search tag filter can auto-collect them.

## Important domain choice

This site currently uses root-based URLs like `/img/...`, `/blog/...`, and `/projects/...`.

This repository is currently configured as a GitHub project page:

```text
https://Yummmenggg.github.io/my-blog/
```

The Astro config uses `base: '/my-blog'`, and `blog/src/config/site.ts` uses the same public URL.

## Local verification

Run commands from the `blog/` folder:

```powershell
cd blog
npm ci
npm run build
npm run preview
```
