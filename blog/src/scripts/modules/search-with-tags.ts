import {
  getLanguageFromPath,
  getLocaleConfig,
  normalizeLanguage,
  stripLanguageFromPath,
} from './locale';

type SearchPost = {
  title: string;
  description?: string;
  content: string;
  url: string;
  lang: string;
  category?: string;
  categoryText?: string;
  icon?: string;
  imageUrl?: string;
  date?: string;
  tags?: string[];
};

const SEARCH_INPUT_SELECTOR = '.search input';
const SEARCH_RESULTS_ID = 'search-results';
const SEARCH_CONTAINER_SELECTOR = '.search';
const POSTS_LIST_SELECTOR = '.posts-list';
const FILTER_SELECTOR = '.filter';
const SEARCH_TOGGLE_SELECTOR = '.header__search-toggle';
const SEARCH_TAGS_SELECTOR = '[data-search-tags]';
const SEARCH_TAG_LIST_SELECTOR = '[data-search-tag-list]';

type SearchWindow = Window & {
  __SEARCH_CATEGORY_SEGMENTS__?: unknown;
  __ASTRO_BASE_PATH__?: unknown;
  __SEARCH_STRINGS__?: Partial<SearchStrings>;
  __SEARCH_CATEGORY_LABELS__?: Record<string, string>;
};

type SearchStrings = {
  resultsHeading: string;
  noResults: string;
  allPosts: string;
};

const DEFAULT_SEARCH_STRINGS: SearchStrings = {
  resultsHeading: 'Search results',
  noResults: 'No results found',
  allPosts: 'All posts',
};

let postsCache: SearchPost[] | null = null;
let debounceTimer: number | undefined;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const normalizeTag = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\+\+/g, 'pp')
    .replace(/&&/g, ' ')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || encodeURIComponent(value.trim().toLowerCase());
};

const getBasePath = (): string => {
  const raw = (window as SearchWindow).__ASTRO_BASE_PATH__;
  if (typeof raw !== 'string' || !raw.length) {
    return '/';
  }

  return raw.endsWith('/') ? raw : `${raw}/`;
};

const getCategorySlugs = (): string[] => {
  const segments = (window as SearchWindow).__SEARCH_CATEGORY_SEGMENTS__;
  if (!Array.isArray(segments)) {
    return [];
  }

  return segments
    .map((segment) =>
      typeof segment === 'string'
        ? segment.trim().replace(/^\//, '').replace(/\/$/, '')
        : '',
    )
    .filter((segment): segment is string => Boolean(segment));
};

const getSearchStrings = (): SearchStrings => {
  const raw = (window as SearchWindow).__SEARCH_STRINGS__;
  if (!raw) {
    return DEFAULT_SEARCH_STRINGS;
  }

  return {
    resultsHeading: typeof raw.resultsHeading === 'string' && raw.resultsHeading.length
      ? raw.resultsHeading
      : DEFAULT_SEARCH_STRINGS.resultsHeading,
    noResults: typeof raw.noResults === 'string' && raw.noResults.length
      ? raw.noResults
      : DEFAULT_SEARCH_STRINGS.noResults,
    allPosts: typeof raw.allPosts === 'string' && raw.allPosts.length
      ? raw.allPosts
      : DEFAULT_SEARCH_STRINGS.allPosts,
  };
};

const loadPosts = async (): Promise<SearchPost[]> => {
  if (postsCache) {
    return postsCache;
  }

  const response = await fetch(new URL(`${getBasePath()}search.json`, window.location.origin).toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch search index: ${response.status}`);
  }

  postsCache = await response.json();
  return postsCache ?? [];
};

const getCurrentContext = (config: ReturnType<typeof getLocaleConfig>) => {
  const lang = normalizeLanguage(getLanguageFromPath(window.location.pathname, config), config);
  const normalizedPath = stripLanguageFromPath(window.location.pathname, lang, config);
  const category = getCategorySlugs().find((slug) => normalizedPath.startsWith(`/${slug}`)) ?? null;
  return { lang, category };
};

const resetSearchView = (
  resultsContainer: HTMLElement,
  postsListContainer: HTMLElement | null,
  filterContainer: HTMLElement | null,
) => {
  resultsContainer.innerHTML = '';
  resultsContainer.style.display = 'none';
  postsListContainer?.style.removeProperty('display');
  filterContainer?.style.removeProperty('display');
};

const renderResults = (
  posts: SearchPost[],
  resultsContainer: HTMLElement,
  contextCategory: string | null,
) => {
  const strings = getSearchStrings();
  const categoryLabels = (window as SearchWindow).__SEARCH_CATEGORY_LABELS__ ?? {};
  const categoryTitle = contextCategory
    ? categoryLabels[contextCategory] ?? contextCategory
    : strings.allPosts;
  const headerTitle = `${strings.resultsHeading}: ${categoryTitle}`;

  const header = `
<div class="filter">
  <div class="filter__categories categories">
    <div class="categories__wrapper">
      <h2 class="categories__wrapper">${escapeHtml(headerTitle)}</h2>
    </div>
    <div class="categories__content"></div>
  </div>
</div>`;

  if (!posts.length) {
    resultsContainer.innerHTML = `${header}<div class="no-posts">${escapeHtml(strings.noResults)}</div>`;
    return;
  }

  const markup = posts
    .map((post) => {
      const categoryText = post.categoryText ?? post.category ?? '';
      const categoryHtml = post.category && post.icon
        ? `<div class="post__category category"><div class="category__item category__item--light-blue">${escapeHtml(post.icon)} ${escapeHtml(categoryText)}</div></div>`
        : '';
      const dateHtml = post.date
        ? `<div class="post__date_right category"><div class="category__item date__item--light-blue">${escapeHtml(post.date)}</div></div>`
        : '';
      const imageHtml = post.imageUrl
        ? `<div class="post__thumbnail"><picture><img src="${escapeHtml(post.imageUrl)}" alt=""></picture></div>`
        : '';
      const tagsHtml = post.tags?.length
        ? `<div class="post__tags" aria-label="Post tags">${post.tags
            .map((tag) => `<span class="post__tag">${escapeHtml(tag)}</span>`)
            .join('')}</div>`
        : '';

      return `
<a href="${escapeHtml(post.url)}" class="post">
  ${categoryHtml}
  ${dateHtml}
  ${imageHtml}
  <div class="post__content">
    <h2 class="post__title">${escapeHtml(post.title)}</h2>
    ${post.description ? `<div class="post__summary">${escapeHtml(post.description)}</div>` : ''}
    ${tagsHtml}
  </div>
</a>`;
    })
    .join('');

  resultsContainer.innerHTML = `${header}<div class="posts-list search-results__posts">${markup}</div>`;
};

const renderTagButtons = (
  posts: SearchPost[],
  tagList: HTMLElement | null,
  activeTags: Set<string>,
) => {
  if (!tagList) {
    return;
  }

  const tags = Array.from(new Set(posts.flatMap((post) => post.tags ?? [])))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  tagList.innerHTML = tags
    .map((tag) => {
      const normalized = normalizeTag(tag);
      const active = activeTags.has(normalized);
      return `<button type="button" class="search__tag-button${active ? ' is-active' : ''}" data-tag="${escapeHtml(normalized)}">${escapeHtml(tag)}</button>`;
    })
    .join('');
};

const getActiveTags = (tagList: HTMLElement | null): Set<string> =>
  new Set(
    Array.from(tagList?.querySelectorAll<HTMLButtonElement>('.search__tag-button.is-active') ?? [])
      .map((button) => button.dataset.tag)
      .filter((tag): tag is string => Boolean(tag)),
  );

const getInitialTagFilters = (): Set<string> => {
  const params = new URLSearchParams(window.location.search);
  return new Set(
    [...params.getAll('tag'), ...(params.get('tags')?.split(',') ?? [])]
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map(normalizeTag),
  );
};

const debounce = (callback: () => void, delay: number) => {
  if (debounceTimer) {
    window.clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(callback, delay);
};

export const initSearch = () => {
  const searchInput = document.querySelector<HTMLInputElement>(SEARCH_INPUT_SELECTOR);
  const resultsContainer = document.getElementById(SEARCH_RESULTS_ID);
  if (!searchInput || !resultsContainer || searchInput.dataset.searchInit === 'true') {
    return;
  }
  searchInput.dataset.searchInit = 'true';

  const postsListContainer = document.querySelector<HTMLElement>(POSTS_LIST_SELECTOR);
  const filterContainer = document.querySelector<HTMLElement>(FILTER_SELECTOR);
  const searchContainer = document.querySelector<HTMLElement>(SEARCH_CONTAINER_SELECTOR);
  const searchToggle = document.querySelector<HTMLButtonElement>(SEARCH_TOGGLE_SELECTOR);
  const searchTags = document.querySelector<HTMLElement>(SEARCH_TAGS_SELECTOR);
  const tagList = document.querySelector<HTMLElement>(SEARCH_TAG_LIST_SELECTOR);
  const config = getLocaleConfig();
  const initialTags = getInitialTagFilters();

  const setSearchOpen = (isOpen: boolean) => {
    searchContainer?.classList.toggle('hidden', !isOpen);
    if (searchTags) {
      searchTags.hidden = !isOpen;
    }
    if (isOpen) {
      searchInput.focus();
    }
  };

  const getScopedPosts = (posts: SearchPost[]) => {
    const { lang, category } = getCurrentContext(config);
    const scoped = posts.filter((post) => {
      const matchesLang = normalizeLanguage(post.lang, config) === lang;
      const matchesCategory = !category || post.category === category;
      return matchesLang && matchesCategory;
    });
    return { scoped, category };
  };

  const applyFilters = async () => {
    try {
      const { scoped, category } = getScopedPosts(await loadPosts());
      const activeTags = getActiveTags(tagList);
      renderTagButtons(scoped, tagList, activeTags);

      const searchTerm = searchInput.value.trim().toLowerCase();
      if (!searchTerm && activeTags.size === 0) {
        resetSearchView(resultsContainer, postsListContainer, filterContainer);
        return;
      }

      const filtered = scoped.filter((post) => {
        const tags = post.tags ?? [];
        const tagSlugs = tags.map(normalizeTag);
        const content = `${post.title} ${post.description ?? ''} ${post.content ?? ''} ${tags.join(' ')}`.toLowerCase();
        const matchesTerm = !searchTerm || content.includes(searchTerm);
        const matchesTags =
          activeTags.size === 0 ||
          Array.from(activeTags).some((activeTag) => tagSlugs.includes(activeTag));
        return matchesTerm && matchesTags;
      });

      resultsContainer.style.display = 'block';
      if (postsListContainer) postsListContainer.style.display = 'none';
      if (filterContainer) filterContainer.style.display = 'none';
      renderResults(filtered, resultsContainer, category);
    } catch (error) {
      console.error(error);
    }
  };

  searchInput.addEventListener('input', () => debounce(applyFilters, 300));

  tagList?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.search__tag-button');
    if (!button) return;
    button.classList.toggle('is-active');
    void applyFilters();
  });

  searchToggle?.addEventListener('click', () => {
    const nextIsOpen = searchContainer?.classList.contains('hidden') ?? false;
    setSearchOpen(nextIsOpen);
    if (!nextIsOpen) {
      searchInput.value = '';
      tagList?.querySelectorAll('.search__tag-button.is-active').forEach((button) => {
        button.classList.remove('is-active');
      });
      resetSearchView(resultsContainer, postsListContainer, filterContainer);
    } else {
      void applyFilters();
    }
  });

  void (async () => {
    const { scoped } = getScopedPosts(await loadPosts());
    renderTagButtons(scoped, tagList, initialTags);
    setSearchOpen(initialTags.size > 0);
    if (initialTags.size > 0) {
      await applyFilters();
    } else {
      resetSearchView(resultsContainer, postsListContainer, filterContainer);
    }
  })();
};
