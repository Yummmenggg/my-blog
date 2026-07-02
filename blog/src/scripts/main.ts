import { initCodeEnhance } from './modules/code-enhance';
import { initLanguageSwitcher } from './modules/language';
import { initMobileMenu } from './modules/mobile-menu';
import { initSearch } from './modules/search-with-tags';
import { highlightActiveTags } from './modules/tags';
import { initThemeSwitchers } from './modules/theme';

let bannerLogged = false;

const logCuriousBanner = () => {
  if (bannerLogged) {
    return;
  }
  bannerLogged = true;

  console.log(
    `%c wow, you're curious! 🧐
%c
%c         ▄              ▄
%c        ▌▒█           ▄▀▒▌
%c        ▌▒▒█        ▄▀▒▒▒▐
%c       ▐▄▀▒▒▀▀▀▀▄▄▄▀▒▒▒▒▒▐
%c     ▄▄▀▒░▒▒▒▒▒▒▒▒▒█▒▒▄█▒▐
%c   ▄▀▒▒▒░░░▒▒▒░░░▒▒▒▀██▀▒▌
%c  ▐▒▒▒▄▄▒▒▒▒░░░▒▒▒▒▒▒▒▀▄▒▒▌
%c  ▌░░▌█▀▒▒▒▒▒▄▀█▄▒▒▒▒▒▒▒█▒▐
%c ▐░░░▒▒▒▒▒▒▒▒▌██▀▒▒░░░▒▒▒▀▄▌
%c ▌░▒▄██▄▒▒▒▒▒▒▒▒▒░░░░░░▒▒▒▒▌
%c▌▒▀▐▄█▄█▌▄░▀▒▒░░░░░░░░░░▒▒▒▐
%c▐▒▒▐▀▐▀▒░▄▄▒▄▒▒▒▒▒▒░▒░▒░▒▒▒▒▌
%c▐▒▒▒▀▀▄▄▒▒▒▄▒▒▒▒▒▒▒▒░▒░▒░▒▒▐
%c ▌▒▒▒▒▒▒▀▀▀▒▒▒▒▒▒░▒░▒░▒░▒▒▒▌
%c ▐▒▒▒▒▒▒▒▒▒▒▒▒▒▒░▒░▒░▒▒▄▒▒▐
%c  ▀▄▒▒▒▒▒▒▒▒▒▒▒░▒░▒░▒▄▒▒▒▒▌
%c    ▀▄▒▒▒▒▒▒▒▒▒▒▄▄▄▀▒▒▒▒▄▀
%c      ▀▄▄▄▄▄▄▀▀▀▒▒▒▒▒▄▄▀
%c         ▒▒▒▒▒▒▒▒▒▒▀▀`,
    'color: #f07d63',
    ...Array(19).fill('color: #ccae62'),
  );
};

const runModules = () => {
  initThemeSwitchers();
  initLanguageSwitcher();
  initSearch();
  highlightActiveTags();
  initMobileMenu();
  initCodeEnhance();
};

const initApp = () => {
  logCuriousBanner();
  runModules();
};

const runWhenReady = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
  } else {
    initApp();
  }
};

export const initClientApp = () => {
  if (typeof window === 'undefined') {
    return;
  }

  runWhenReady();
  document.addEventListener('astro:after-swap', initApp);
};

if (typeof window !== 'undefined') {
  initClientApp();
}
