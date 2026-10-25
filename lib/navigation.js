export function renderSiteMenu(language = 'ko') {
  const en = language === 'en', home = en ? '/en/' : '/', mll = en ? '/en/mll' : '/mll';
  const text = (ko, english) => en ? english : ko;
  const brand = en ? 'Muntang<span class="brand-dot">.</span>com' : '문탕닷컴';
  return `<nav class="site-menu-groups" aria-label="${text('사이트 메뉴', 'Site navigation')}">
    <section class="drawer-category" aria-label="${text('문탕닷컴', 'Muntang.com')}">
      <a class="drawer-link drawer-category-link drawer-stagger" href="${home}"><span>${brand}</span><em aria-hidden="true">↗</em></a>
      <div class="drawer-sub-links">${[[home+'#showreel',text('제작 과정','Creation process')],[home+'#global',text('다국어 자막','English subtitles')],[home+'#videos',text('전체 영상','All videos')]].map(([href,label]) => `<a class="drawer-sub-link drawer-stagger" href="${href}">${label}<span aria-hidden="true">↗</span></a>`).join('')}</div>
    </section>
    <section class="drawer-category" aria-label="MLL">
      <a class="drawer-link drawer-category-link drawer-stagger" href="${mll}"><span>MLL</span><em aria-hidden="true">↗</em></a>
      <div class="drawer-sub-links"><a class="drawer-sub-link drawer-stagger" href="${mll}">${text('데몬리스트','Demonlist')}<span aria-hidden="true">↗</span></a></div>
    </section>
  </nav>
  <div class="drawer-ldm-wrap drawer-stagger"><button class="drawer-ldm-toggle" id="ldmToggle" type="button" aria-pressed="false" aria-label="${text('LDM 저사양 모드 켜기','Enable Low Detail Mode')}"><span class="ldm-copy"><b>LDM</b><small>Low Detail Mode</small></span><span class="ldm-state" id="ldmStatus">${text('끔','Off')}</span><span class="ldm-switch" aria-hidden="true"><i></i></span></button></div>
  <div class="drawer-foot drawer-common-foot drawer-stagger"><a href="https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4" target="_blank" rel="noopener noreferrer">YouTube ↗</a><a href="https://pointercrate.com/demonlist/" target="_blank" rel="noopener noreferrer">Pointercrate ↗</a></div>`;
}

export function applySiteMenu(document, language) {
  document.querySelector('.drawer-body').innerHTML = renderSiteMenu(language);
}
