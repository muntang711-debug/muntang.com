export function initPageScroll() {
  if (document.querySelector('.page-scrollbar')) return;
  const rail = document.createElement('div'), thumb = document.createElement('div');
  rail.className = 'page-scrollbar'; thumb.className = 'page-scrollbar-thumb';
  rail.setAttribute('aria-hidden', 'true'); rail.appendChild(thumb);
  document.body.appendChild(rail);
  document.documentElement.classList.add('page-scroll-overlay');
  let frame = 0, drag = null;
  function geometry() {
    const height = innerHeight;
    const total = document.scrollingElement.scrollHeight;
    const size = Math.min(height, Math.max(32, height * height / total));
    return { range: Math.max(0, total - height), travel: height - size, size };
  }
  function update() {
    frame = 0;
    const { range, travel, size } = geometry();
    rail.hidden = range <= 0;
    thumb.style.height = size + 'px';
    thumb.style.transform = `translateY(${range ? Math.min(1, Math.max(0, scrollY / range)) * travel : 0}px)`;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function move(clientY) {
    const { range, travel } = geometry();
    window.scrollTo({ top: travel ? Math.max(0, Math.min(1, (clientY - drag.offset) / travel)) * range : 0, behavior: 'instant' });
  }
  rail.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    drag = { id: event.pointerId, offset: event.target === thumb ? event.clientY - thumb.getBoundingClientRect().top : geometry().size / 2 };
    rail.setPointerCapture(event.pointerId);
    rail.classList.add('is-dragging');
    move(event.clientY);
  });
  rail.addEventListener('pointermove', event => { if (drag?.id === event.pointerId) move(event.clientY); });
  const finish = () => { drag = null; rail.classList.remove('is-dragging'); };
  rail.addEventListener('lostpointercapture', finish);
  rail.addEventListener('pointercancel', finish);
  rail.addEventListener('pointerup', event => { if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId); finish(); });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  new ResizeObserver(schedule).observe(document.body);
  update();
}
