// The MLL build uses the home page's header/drawer markup and styles.
export function initMllShell(language = 'ko') {
  const $ = selector => document.querySelector(selector);
  const en = language === 'en', text = (ko, english) => en ? english : ko;
  const trigger = $('#menuTrigger'), drawer = $('#siteDrawer'), backdrop = $('#drawerBackdrop');
  const background = [$('.header'), $('main'), $('.footer'), $('.skip-link')];
  let open = false, previousFocus, ldm = false;
  try { ldm = localStorage.getItem('muntang-ldm') === '1'; } catch { /* Optional storage. */ }
  document.body.appendChild(trigger);
  function setDrawer(value) {
    open = value;
    if (open) previousFocus = document.activeElement;
    drawer.inert = !open;
    drawer.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? text('메뉴 닫기', 'Close menu') : text('메뉴 열기', 'Open menu'));
    if (open) drawer.querySelector('.drawer-head').appendChild(trigger); else document.body.appendChild(trigger);
    for (const node of background) node.inert = open;
    document.body.classList.toggle('drawer-open', open);
    document.documentElement.classList.toggle('drawer-open', open);
    drawer.classList.toggle('is-open', open); backdrop.classList.toggle('is-open', open);
    if (open) requestAnimationFrame(() => { if (open) drawer.querySelector('.drawer-link')?.focus({ preventScroll: true }); });
    else if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
  trigger.addEventListener('click', () => setDrawer(!open));
  backdrop.addEventListener('click', () => setDrawer(false));
  drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); setDrawer(false); }
    if (event.key === 'Tab') {
      const items = [...drawer.querySelectorAll('a[href],button:not(:disabled)')].filter(node => node.offsetParent !== null);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  function setLdm(value) {
    ldm = value;
    document.body.classList.toggle('ldm-mode', value);
    $('#ldmToggle').setAttribute('aria-pressed', String(value));
    $('#ldmToggle').setAttribute('aria-label', value ? text('저사양 모드 끄기', 'Disable low detail mode') : text('저사양 모드 켜기', 'Enable low detail mode'));
    $('#ldmStatus').textContent = value ? text('켬', 'On') : text('끔', 'Off');
    try { localStorage.setItem('muntang-ldm', value ? '1' : '0'); } catch { /* Optional storage. */ }
  }
  setLdm(ldm);
  $('#ldmToggle').addEventListener('click', () => setLdm(!ldm));
  let pending = false;
  function progress() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      const distance = document.documentElement.scrollHeight - innerHeight;
      $('#progressBar').style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
      pending = false;
    });
  }
  window.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress, { passive: true });
  return { progress, motionEnabled: () => !ldm && !matchMedia('(prefers-reduced-motion: reduce)').matches };
}
