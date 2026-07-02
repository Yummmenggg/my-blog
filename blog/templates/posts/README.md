# Post Writing Templates

These templates are not published directly. Copy one file into the matching content folder, rename it to your final slug, edit the frontmatter, then change `draft: true` to `draft: false`.

Use the folder path as the first-level category:

- Blog posts: `src/content/posts/en/blog/<slug>.md`
- Project posts: `src/content/posts/en/projects/<slug>.md`

If you want one large template grouped by your three long-term content tracks, start from:

- `all-post-sections-template.md`

Use tags as the second-level topic system. Keep these topic tags exact so the homepage cards and search filters stay aligned:

- `C++ && Linux`
- `Agent`
- `Algorithm`

Every post must have at least one tag. Recommended tag shape:

```yaml
tags: ['Blog', 'C++ && Linux', 'Kernel', 'Notes']
```

or:

```yaml
tags: ['Projects', 'Agent', 'RAG', 'Demo']
```

The first Markdown image becomes the large visual block at the top of the article body. The `image` frontmatter controls cards, feeds, and social previews.
