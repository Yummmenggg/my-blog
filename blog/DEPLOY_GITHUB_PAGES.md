# GitHub Pages Auto Deploy

This Astro project lives in the repository's `blog/` folder.

The repository root deploys it with GitHub Actions from `.github/workflows/deploy-blog.yml`.

## One-time GitHub setup

1. Push the whole repository to GitHub.
2. Keep this Astro project under the root `blog/` folder.
3. Open the repository on GitHub.
4. Go to `Settings` -> `Pages`.
5. Under `Build and deployment`, set `Source` to `GitHub Actions`.
6. Push to `main` or `master`.

After the workflow finishes, GitHub Pages will show the live URL in the workflow summary and in `Settings` -> `Pages`.

## Important domain choice

This site currently uses root-based URLs like `/img/...`, `/blog/...`, and `/projects/...`.

This repository is currently configured as a GitHub project page:

```text
https://Yummmenggg.github.io/my-blog/
```

The Astro config uses `base: '/my-blog'`, and `blog/src/config/site.ts` uses the same public URL.

## Before publishing

`blog/src/config/site.ts` is currently set for the GitHub Pages project deployment:

```ts
siteUrl: 'https://Yummmenggg.github.io/my-blog',
```

Replace it with your custom domain if you bind one later.

## Local verification

```powershell
cd blog
npm ci
npm run build
npm run preview
```
