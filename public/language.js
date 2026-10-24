(() => {
  const key = 'muntang-language';
  const routes = { ko: '/', en: '/en/' };
  if (!Object.values(routes).includes(location.pathname)) return;
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Storage is optional. */ }
  if (Object.hasOwn(routes, saved) && location.pathname !== routes[saved]) {
    location.replace(routes[saved] + location.search + location.hash);
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const toggle = event.target.closest?.('a#languageToggle');
    const language = toggle?.getAttribute('lang');
    if (!Object.hasOwn(routes, language)) return;
    try { localStorage.setItem(key, language); } catch { /* The link still works without storage. */ }
  });
})();
