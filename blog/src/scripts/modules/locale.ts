import { DEFAULT_LOCALE } from '@config/locales';

export type LocaleConfig = {
  defaultLanguage: string;
  languages: string[];
};

type LocaleWindow = typeof window & { __LOCALE_CONFIG__?: LocaleConfig };
type BaseWindow = typeof window & { __ASTRO_BASE_PATH__?: unknown };

const getBasePath = (): string => {
  const raw = (window as BaseWindow).__ASTRO_BASE_PATH__;
  if (typeof raw !== 'string' || !raw.length || raw === '/') {
    return '';
  }

  const prefixed = raw.startsWith('/') ? raw : `/${raw}`;
  return prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed;
};

const stripBasePath = (pathname: string): string => {
  const basePath = getBasePath();
  if (!basePath || !pathname.startsWith(basePath)) {
    return pathname;
  }

  const stripped = pathname.slice(basePath.length);
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
};

export const getLocaleConfig = (): LocaleConfig => {
  const raw = (window as LocaleWindow).__LOCALE_CONFIG__;
  const documentLanguage = document.documentElement?.lang ?? '';
  const normalizedDocumentLanguage = documentLanguage.split('-')[0]?.toLowerCase() || undefined;

  const fallbackLanguage = raw?.defaultLanguage ?? normalizedDocumentLanguage ?? DEFAULT_LOCALE;

  const languages = Array.isArray(raw?.languages) && raw.languages.length
    ? [...raw.languages]
    : [fallbackLanguage];

  const uniqueLanguages = Array.from(new Set(languages.filter(Boolean)));
  const defaultLanguage = raw?.defaultLanguage ?? uniqueLanguages[0] ?? fallbackLanguage;

  if (!uniqueLanguages.length) {
    uniqueLanguages.push(defaultLanguage ?? DEFAULT_LOCALE);
  }

  return { defaultLanguage, languages: uniqueLanguages };
};

export const normalizeLanguage = (lang: string | null | undefined, config: LocaleConfig): string => {
  if (!lang) {
    return config.defaultLanguage;
  }

  const lower = lang.toLowerCase();
  return config.languages.find((code) => code.toLowerCase() === lower) ?? config.defaultLanguage;
};

export const getLanguageFromPath = (pathname: string, config: LocaleConfig): string => {
  const pathWithoutBase = stripBasePath(pathname);
  const normalizedPath = pathWithoutBase.endsWith('/') ? pathWithoutBase : `${pathWithoutBase}/`;

  for (const code of config.languages) {
    if (code === config.defaultLanguage) {
      continue;
    }

    if (normalizedPath === `/${code}/` || normalizedPath.startsWith(`/${code}/`)) {
      return code;
    }
  }

  return config.defaultLanguage;
};

export const getTargetPath = (lang: string, config: LocaleConfig): string => {
  return lang === config.defaultLanguage ? '/' : `/${lang}/`;
};

export const stripLanguageFromPath = (pathname: string, lang: string, config: LocaleConfig): string => {
  const pathWithoutBase = stripBasePath(pathname);
  if (lang === config.defaultLanguage) {
    return pathWithoutBase;
  }

  const pattern = new RegExp(`^/${lang}`);
  const stripped = pathWithoutBase.replace(pattern, '');
  return stripped || '/';
};
