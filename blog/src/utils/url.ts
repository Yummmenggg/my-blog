/**
 * Determines whether the last segment of a path looks like a file.
 */
const FILE_PATH_PATTERN = /\/[^/]+\.[^/]+$/;
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
const SPECIAL_URL_PATTERN = /^(?:#|mailto:|tel:|sms:|data:|javascript:)/i;

const splitSuffix = (value: string): { base: string; suffix: string } => {
  const match = value.match(/[?#].*$/);
  if (!match) {
    return { base: value, suffix: '' };
  }

  const suffix = match[0];
  return { base: value.slice(0, -suffix.length), suffix };
};

/**
 * Ensures a URL has a trailing slash when pointing to a directory.
 * File-like paths are left untouched.
 */
export function ensureTrailingSlash(url: string): string {
  if (!url || url === '/') return '/';

  const { base, suffix } = splitSuffix(url);
  if (base === '/404' || base === '/404/') {
    return `/404${suffix}`;
  }
  if (FILE_PATH_PATTERN.test(base)) {
    return `${base}${suffix}`;
  }

  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}${suffix}`;
}

/**
 * Adds trailing slash to a path if not present.
 * File-like paths are left untouched.
 */
export function addTrailingSlash(path: string): string {
  if (!path || path === '/') return '/';
  if (path.includes('#') || path.includes('?')) return path;
  if (FILE_PATH_PATTERN.test(path)) return path;
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * Removes trailing slash from a path.
 */
export function removeTrailingSlash(path: string): string {
  if (path === '/') return path;
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function getBasePath(): string {
  const rawBase = import.meta.env.BASE_URL ?? '/';
  if (!rawBase || rawBase === '/') return '';

  const prefixed = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;
  return prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed;
}

export function stripBasePath(path: string): string {
  const basePath = getBasePath();
  if (!basePath || !path.startsWith(basePath)) return path;

  const stripped = path.slice(basePath.length);
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

export function withBasePath(url: string): string {
  if (!url || ABSOLUTE_URL_PATTERN.test(url) || SPECIAL_URL_PATTERN.test(url)) {
    return url;
  }

  const basePath = getBasePath();
  if (!basePath) return url;

  const [pathWithQuery, hash = ''] = url.split('#');
  const [path, query = ''] = pathWithQuery.split('?');
  const suffix = `${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
    return `${normalizedPath}${suffix}`;
  }

  return `${basePath}${normalizedPath}${suffix}`;
}
