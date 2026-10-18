const html = "<!doctype html>\n<html lang=\"ko\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <meta name=\"theme-color\" content=\"#ff7700\">\n  <meta name=\"description\" content=\"문탕이의 유튜브 영상과 채널을 한 곳에서 만나는 문탕닷컴.\">\n  <meta property=\"og:type\" content=\"website\">\n  <meta property=\"og:title\" content=\"문탕닷컴 — 문탕이의 영상\">\n  <meta property=\"og:description\" content=\"문탕이의 유튜브 영상과 채널을 한 곳에서 만나보세요.\">\n  <title>문탕닷컴 — 문탕이의 영상</title>\n  <style>\n    :root{--orange:#ff7700;--ink:#15120f;--black:#0f0e0c;--paper:#f6f2eb;--paper2:#e8e1d7;--muted:#9d958c;--rule:rgba(255,255,255,.15);--max:1240px}\n    *{box-sizing:border-box}\n    html{scroll-behavior:smooth;scroll-padding-top:86px}\n    body{margin:0;background:var(--black);color:#f8f5f0;font-family:Pretendard,\"Apple SD Gothic Neo\",\"Malgun Gothic\",Inter,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;letter-spacing:-.035em;line-height:1.6}\n    a{color:inherit;text-decoration:none}\n    img{display:block;max-width:100%}\n    button{font:inherit}\n    ::selection{background:var(--orange);color:var(--ink)}\n    .wrap{width:min(var(--max),calc(100% - 72px));margin-inline:auto}\n    .topline{height:33px;display:flex;align-items:center;justify-content:center;background:var(--orange);color:#21150c;font-size:11px;font-weight:900;letter-spacing:.03em}\n    .topline a{text-decoration:underline;text-underline-offset:3px}\n    header{position:sticky;top:0;z-index:50;background:rgba(15,14,12,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--rule)}\n    .nav{height:76px;display:flex;align-items:center;justify-content:space-between;gap:25px}\n    .wordmark{display:inline-flex;align-items:center;font-size:24px;font-weight:950;letter-spacing:-.09em;white-space:nowrap}\n    .wordmark span{color:var(--orange)}\n    .navlinks{display:flex;align-items:center;gap:34px;font-size:13px;font-weight:700;color:#d8d1c7}\n    .navlinks a{transition:color .18s}\n    .navlinks a:hover{color:var(--orange)}\n    .navright{display:flex;align-items:center;gap:10px}\n    .channel-link{display:inline-flex;align-items:center;gap:10px;background:var(--orange);color:#21150c;padding:12px 16px;font-size:12px;font-weight:900;transition:background .2s,transform .2s}\n    .channel-link:hover{background:#ff9339;transform:translateY(-1px)}\n    .channel-link svg{width:16px;height:16px}\n    .menu-button{display:none;width:42px;height:42px;border:1px solid var(--rule);background:transparent;color:#fff;cursor:pointer}\n    .hero{position:relative;display:grid;grid-template-columns:.88fr 1.12fr;gap:55px;align-items:center;min-height:650px;padding-top:67px;padding-bottom:75px}\n    .hero-copy{position:relative;z-index:2}\n    .overline{display:flex;align-items:center;gap:10px;color:var(--orange);font-size:12px;font-weight:950;letter-spacing:.08em}\n    .overline:before{content:\"\";width:24px;height:3px;background:var(--orange)}\n    h1{margin:25px 0 23px;font-size:clamp(52px,6.7vw,88px);line-height:1.06;letter-spacing:-.092em;font-weight:950}\n    h1 .orange{color:var(--orange)}\n    .hero-desc{max-width:385px;margin:0;color:#c0b8ae;font-size:15px;line-height:1.9;word-break:keep-all}\n    .actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:31px}\n    .button{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:51px;padding:0 17px;font-size:12px;font-weight:900;transition:background .18s,color .18s,transform .18s}\n    .button:hover{transform:translateY(-2px)}\n    .button-primary{background:var(--orange);color:#21150c}\n    .button-primary:hover{background:#ff963f}\n    .button-plain{border:1px solid rgba(255,255,255,.26);color:#f8f5f0}\n    .button-plain:hover{background:#fff;color:#15120f}\n    .button svg{width:15px;height:15px}\n    .hero-foot{display:flex;align-items:center;gap:11px;margin-top:46px;color:#8b8379;font-size:11px;font-weight:700}\n    .hero-foot b{color:#f0e8dc;font-size:12px}\n    .hero-foot span{width:28px;height:1px;background:var(--orange)}\n    .hero-visual{min-width:0;position:relative;padding:0 0 25px 25px}\n    .hero-visual:before{content:\"\";position:absolute;top:-18px;left:0;width:38%;height:66%;border-top:4px solid var(--orange);border-left:4px solid var(--orange);pointer-events:none}\n    .feature-link{position:relative;z-index:1;display:block;background:#27211a;border:1px solid rgba(255,255,255,.14);overflow:hidden}\n    .feature-image{position:relative;aspect-ratio:16/10;overflow:hidden;background:#28211a}\n    .feature-image img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.8,.2,1),filter .4s}\n    .feature-link:hover .feature-image img{transform:scale(1.035);filter:brightness(.77)}\n    .feature-shade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.68),transparent 52%),linear-gradient(90deg,rgba(0,0,0,.15),transparent 40%)}\n    .play-button{position:absolute;left:25px;bottom:26px;width:56px;height:56px;display:grid;place-items:center;background:var(--orange);color:#1e140b;transition:transform .2s}\n    .play-button svg{width:20px;height:20px;margin-left:3px}\n    .feature-link:hover .play-button{transform:scale(1.08)}\n    .image-index{position:absolute;top:17px;left:17px;padding:7px 9px;background:var(--orange);color:#20140b;font-size:10px;line-height:1;font-weight:950;letter-spacing:.08em}\n    .feature-caption{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px 21px 21px;background:#1a1713;border-top:1px solid rgba(255,255,255,.1)}\n    .feature-label{display:block;color:var(--orange);font-size:10px;letter-spacing:.09em;font-weight:950}\n    .feature-title{display:block;margin-top:5px;font-size:19px;line-height:1.4;font-weight:900;letter-spacing:-.045em;word-break:keep-all}\n    .caption-arrow{display:grid;place-items:center;flex:none;width:40px;height:40px;border:1px solid rgba(255,255,255,.2);color:var(--orange)}\n    .caption-arrow svg{width:17px;height:17px}\n    .visual-note{position:absolute;right:-15px;bottom:3px;z-index:2;padding:9px 12px;background:var(--orange);color:#23150a;font-size:10px;font-weight:950;letter-spacing:.02em}\n    .rule-band{background:var(--orange);color:#20140b;overflow:hidden;border-top:1px solid #1b1209;border-bottom:1px solid #1b1209}\n    .rule-track{display:flex;align-items:center;gap:29px;width:max-content;padding:13px 0;animation:marquee 30s linear infinite;font-size:12px;letter-spacing:.08em;font-weight:950}\n    .rule-track span{display:flex;align-items:center;gap:29px}\n    .rule-track span:after{content:\"✳\";font-size:15px}\n    @keyframes marquee{to{transform:translateX(-50%)}}\n    .section{padding:104px 0}\n    .section-head{display:flex;align-items:end;justify-content:space-between;gap:25px;margin-bottom:34px}\n    .section-kicker{color:var(--orange);font-size:11px;font-weight:950;letter-spacing:.12em}\n    h2{margin:9px 0 0;font-size:clamp(33px,4vw,53px);line-height:1.15;font-weight:950;letter-spacing:-.08em}\n    .section-sub{max-width:340px;margin:0;color:#a9a096;font-size:13px;line-height:1.85;word-break:keep-all}\n    .feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}\n    .video-card{display:block;min-width:0;border:1px solid rgba(255,255,255,.15);background:#171512;transition:border-color .2s,transform .2s}\n    .video-card:hover{border-color:var(--orange);transform:translateY(-4px)}\n    .thumb{position:relative;aspect-ratio:16/9;overflow:hidden;background:#2b231b}\n    .thumb img{width:100%;height:100%;object-fit:cover;transition:transform .5s,filter .3s}\n    .video-card:hover .thumb img{transform:scale(1.035);filter:brightness(.78)}\n    .thumb:after{content:\"\";position:absolute;inset:45% 0 0;background:linear-gradient(0deg,rgba(0,0,0,.4),transparent);pointer-events:none}\n    .thumb-play{position:absolute;right:15px;bottom:15px;z-index:2;width:43px;height:43px;background:var(--orange);color:#20140b;display:grid;place-items:center}\n    .thumb-play svg{width:16px;height:16px;margin-left:2px}\n    .video-info{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:19px 18px}\n    .video-meta{font-size:10px;color:var(--orange);font-weight:950;letter-spacing:.09em}\n    .video-name{margin-top:6px;font-size:17px;line-height:1.5;font-weight:850;letter-spacing:-.04em;word-break:keep-all}\n    .video-go{color:#c8bfb3;font-size:11px;white-space:nowrap}\n    .video-go:after{content:\" ↗\";color:var(--orange)}\n    .latest-section{padding-top:0}\n    .latest-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}\n    .latest-grid .video-card .video-info{align-items:flex-start;padding:15px}\n    .latest-grid .video-name{font-size:14px;margin-top:5px}\n    .latest-grid .video-meta{font-size:9px}\n    .latest-empty{padding:26px;border:1px dashed rgba(255,255,255,.18);color:#9e968b;font-size:13px}\n    .about{display:grid;grid-template-columns:.7fr 1.3fr;background:var(--paper);color:var(--ink);gap:45px;padding:49px 52px}\n    .about .section-kicker{color:#b64f00}\n    .about h2{font-size:clamp(36px,4vw,54px)}\n    .about-copy{align-self:center;max-width:580px}\n    .about-copy p{margin:0;color:#4e4841;font-size:15px;line-height:2;word-break:keep-all}\n    .about-copy strong{color:#17130f}\n    .about-stamp{display:inline-block;margin-top:22px;border-bottom:2px solid var(--orange);padding-bottom:4px;font-size:11px;font-weight:950;letter-spacing:.06em}\n    .cta-section{padding:0 0 105px}\n    .cta{display:flex;align-items:center;justify-content:space-between;gap:28px;background:var(--orange);color:#21150b;padding:34px 39px}\n    .cta-kicker{font-size:10px;font-weight:950;letter-spacing:.12em}\n    .cta-title{margin-top:4px;font-size:clamp(25px,3.1vw,38px);line-height:1.2;font-weight:950;letter-spacing:-.07em}\n    .cta .button{background:#17130f;color:#fff;flex:none}\n    .cta .button:hover{background:#30241a}\n    footer{border-top:1px solid var(--rule);padding:24px 0 29px}\n    .footer-inner{display:flex;align-items:center;justify-content:space-between;gap:20px}\n    .footer-mark{font-size:17px;font-weight:950;letter-spacing:-.08em}\n    .footer-mark span{color:var(--orange)}\n    .footer-note{margin-top:3px;color:#847c72;font-size:10px}\n    .footer-links{display:flex;align-items:center;gap:21px;color:#a59c90;font-size:11px;font-weight:750}\n    .footer-links a:hover{color:var(--orange)}\n    .loading{color:#aaa197}\n    @media(max-width:950px){.wrap{width:calc(100% - 48px)}.hero{gap:30px;min-height:590px;padding-top:56px;padding-bottom:63px}.hero-visual{padding-left:17px}.hero-visual:before{top:-12px;border-width:3px}.visual-note{right:-8px}.navlinks{gap:20px}.latest-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.section{padding:82px 0}.latest-section{padding-top:0}.about{padding:38px;gap:28px}.cta-section{padding-bottom:82px}}\n    @media(max-width:680px){.wrap{width:calc(100% - 34px)}.topline{height:30px;font-size:10px}.nav{height:64px}.wordmark{font-size:22px}.navlinks{display:none;position:absolute;left:0;right:0;top:63px;padding:13px 17px 18px;background:#14120f;border-bottom:1px solid var(--rule);flex-direction:column;align-items:stretch;gap:0}.navlinks.open{display:flex}.navlinks a{padding:12px 3px}.channel-link{padding:10px 11px;font-size:11px}.channel-link svg{width:14px;height:14px}.menu-button{display:grid;place-items:center}.hero{grid-template-columns:1fr;gap:38px;min-height:0;padding-top:54px;padding-bottom:55px}.hero-copy{max-width:570px}.overline{font-size:11px}h1{font-size:clamp(51px,13vw,74px);margin:21px 0}.hero-desc{font-size:14px}.actions{margin-top:24px}.hero-foot{margin-top:28px}.hero-visual{padding:0 0 18px 13px;margin-right:8px}.hero-visual:before{top:-9px;width:43%;height:62%;border-width:3px}.feature-image{aspect-ratio:16/10}.feature-caption{padding:16px}.feature-title{font-size:16px}.play-button{left:16px;bottom:16px;width:48px;height:48px}.visual-note{right:-8px;bottom:-1px;font-size:9px}.rule-track{padding:11px 0;font-size:11px}.section{padding:70px 0}.section-head{display:block;margin-bottom:23px}.section-sub{margin-top:12px;font-size:12px}.feature-grid{grid-template-columns:1fr;gap:13px}.video-info{padding:15px}.video-name{font-size:15px}.latest-section{padding-top:0}.latest-grid{grid-template-columns:1fr 1fr;gap:10px}.latest-grid .video-info{display:block!important;padding:12px!important}.latest-grid .video-name{font-size:12px;line-height:1.55}.latest-grid .video-go{display:none}.about{grid-template-columns:1fr;gap:16px;padding:27px 22px}.about h2{font-size:39px}.about-copy p{font-size:13px}.about-stamp{margin-top:17px}.cta-section{padding-bottom:70px}.cta{align-items:flex-start;flex-direction:column;padding:26px 22px;gap:19px}.cta-title{font-size:30px}.cta .button{width:100%}.footer-inner{align-items:flex-start;flex-direction:column;gap:16px}.footer-links{gap:15px;flex-wrap:wrap}}\n    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}\n  </style>\n</head>\n<body>\n  <div class=\"topline\"><a href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">@문탕이</a>&nbsp; · &nbsp;유튜브 채널 바로가기&nbsp; ↗</div>\n  <header>\n    <nav class=\"nav wrap\" aria-label=\"주요 메뉴\">\n      <a class=\"wordmark\" href=\"#top\" aria-label=\"문탕닷컴 홈\">문탕닷컴<span>.</span></a>\n      <div class=\"navlinks\" id=\"navlinks\">\n        <a href=\"#videos\">영상</a>\n        <a href=\"#latest\">최근 업로드</a>\n        <a href=\"#about\">소개</a>\n      </div>\n      <div class=\"navright\">\n        <a class=\"channel-link\" href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">채널 보기 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M5 12h13M12 5l7 7-7 7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></a>\n        <button class=\"menu-button\" id=\"menubutton\" type=\"button\" aria-expanded=\"false\" aria-controls=\"navlinks\" aria-label=\"메뉴 열기\"><svg viewBox=\"0 0 24 24\" width=\"19\" height=\"19\" fill=\"none\" aria-hidden=\"true\"><path d=\"M4 7h16M4 12h16M4 17h16\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg></button>\n      </div>\n    </nav>\n  </header>\n  <main id=\"top\">\n    <section class=\"hero wrap\">\n      <div class=\"hero-copy\">\n        <div class=\"overline\">문탕이 유튜브</div>\n        <h1>보고 싶은 영상,<br><span class=\"orange\">여기서 골라 봐.</span></h1>\n        <p class=\"hero-desc\">문탕이의 영상과 채널을 한곳에 모아뒀어. 마음에 드는 영상을 누르면 유튜브에서 바로 볼 수 있어.</p>\n        <div class=\"actions\">\n          <a class=\"button button-primary\" href=\"#videos\">영상 둘러보기 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 5v14m-7-7 7 7 7-7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></a>\n          <a class=\"button button-plain\" href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">유튜브 채널 ↗</a>\n        </div>\n        <div class=\"hero-foot\"><span></span><b>문탕닷컴</b> <span style=\"width:1px;height:13px;background:rgba(255,255,255,.18)\"></span> 문탕이의 공간</div>\n      </div>\n      <div class=\"hero-visual\">\n        <a class=\"feature-link\" id=\"hero-video\" href=\"https://youtu.be/5D9M7hhDNlY\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"문탕이 추천 영상 재생\">\n          <div class=\"feature-image\"><img id=\"hero-thumb\" src=\"https://i.ytimg.com/vi/5D9M7hhDNlY/hqdefault.jpg\" alt=\"문탕이 영상 썸네일\"><span class=\"feature-shade\"></span><span class=\"image-index\">추천 영상</span><span class=\"play-button\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div>\n          <div class=\"feature-caption\"><span><span class=\"feature-label\">문탕이의 영상</span><span class=\"feature-title\" id=\"hero-title\">영상 불러오는 중…</span></span><span class=\"caption-arrow\"><svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M7 17 17 7M7 7h10v10\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></span></div>\n        </a>\n        <div class=\"visual-note\">채널 컬러 · #FF7700</div>\n      </div>\n    </section>\n    <div class=\"rule-band\" aria-label=\"문탕닷컴, 문탕이\">\n      <div class=\"rule-track\"><span>문탕닷컴</span><span>유튜브 @문탕이</span><span>영상 보러 가기</span><span>문탕닷컴</span><span>유튜브 @문탕이</span><span>영상 보러 가기</span><span>문탕닷컴</span><span>유튜브 @문탕이</span><span>영상 보러 가기</span><span>문탕닷컴</span><span>유튜브 @문탕이</span><span>영상 보러 가기</span></div>\n    </div>\n    <section class=\"section wrap\" id=\"videos\">\n      <div class=\"section-head\">\n        <div><div class=\"section-kicker\">먼저 볼 영상</div><h2>문탕이 영상 모음</h2></div>\n        <p class=\"section-sub\">공유해 준 영상부터 모아뒀어. 썸네일을 누르면 유튜브로 이동해.</p>\n      </div>\n      <div class=\"feature-grid\" id=\"featured-grid\">\n        <a class=\"video-card\" href=\"https://youtu.be/5D9M7hhDNlY\" target=\"_blank\" rel=\"noopener noreferrer\" data-featured-id=\"5D9M7hhDNlY\">\n          <div class=\"thumb\"><img src=\"https://i.ytimg.com/vi/5D9M7hhDNlY/hqdefault.jpg\" alt=\"영상 썸네일\" loading=\"lazy\"><span class=\"thumb-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div>\n          <div class=\"video-info\"><div><div class=\"video-meta\">추천 영상 01</div><div class=\"video-name\">유튜브에서 영상 보기</div></div><span class=\"video-go\">재생</span></div>\n        </a>\n        <a class=\"video-card\" href=\"https://www.youtube.com/watch?v=JupaczQCTFk&amp;t=1s\" target=\"_blank\" rel=\"noopener noreferrer\" data-featured-id=\"JupaczQCTFk\">\n          <div class=\"thumb\"><img src=\"https://i.ytimg.com/vi/JupaczQCTFk/hqdefault.jpg\" alt=\"영상 썸네일\" loading=\"lazy\"><span class=\"thumb-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div>\n          <div class=\"video-info\"><div><div class=\"video-meta\">추천 영상 02</div><div class=\"video-name\">유튜브에서 영상 보기</div></div><span class=\"video-go\">재생</span></div>\n        </a>\n      </div>\n    </section>\n    <section class=\"section latest-section wrap\" id=\"latest\" hidden>\n      <div class=\"section-head\">\n        <div><div class=\"section-kicker\">채널에서</div><h2>최근 업로드</h2></div>\n        <p class=\"section-sub\" id=\"latest-sub\">문탕이 채널의 최근 영상이 자동으로 표시돼.</p>\n      </div>\n      <div class=\"latest-grid\" id=\"latest-grid\"></div>\n    </section>\n    <section class=\"section wrap\" id=\"about\" style=\"padding-top:20px\">\n      <div class=\"about\">\n        <div><div class=\"section-kicker\">문탕닷컴 소개</div><h2>여기는<br>문탕이의 공간.</h2></div>\n        <div class=\"about-copy\"><p><strong>문탕닷컴</strong>은 문탕이의 유튜브 영상과 채널을 한곳에서 볼 수 있도록 만든 개인 사이트야. 새 영상은 이 페이지에서 확인하고, 영상 감상과 댓글은 유튜브에서 이어가면 돼.</p><div class=\"about-stamp\">YOUTUBE · @문탕이</div></div>\n      </div>\n    </section>\n    <section class=\"cta-section wrap\">\n      <div class=\"cta\"><div><div class=\"cta-kicker\">MUNTANG ON YOUTUBE</div><div class=\"cta-title\">새 영상은 유튜브에서 만나자.</div></div><a class=\"button\" href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">문탕이 채널 가기 ↗</a></div>\n    </section>\n  </main>\n  <footer><div class=\"footer-inner wrap\"><div><div class=\"footer-mark\">문탕닷컴<span>.</span></div><div class=\"footer-note\">© <span id=\"year\">2026</span> 문탕닷컴</div></div><div class=\"footer-links\"><a href=\"#top\">맨 위로 ↑</a><a href=\"#videos\">영상 모음</a><a href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">유튜브 ↗</a></div></div></footer>\n  <script>\n    (function(){\n      var channelUrl='https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4';\n      var featuredIds=['5D9M7hhDNlY','JupaczQCTFk'];\n      var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n      var menu=document.getElementById('navlinks');\n      var menuButton=document.getElementById('menubutton');\n      if(menu&&menuButton){\n        menuButton.addEventListener('click',function(){\n          var open=menu.classList.toggle('open');\n          menuButton.setAttribute('aria-expanded',String(open));\n          menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');\n        });\n        menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');});});\n      }\n      document.getElementById('year').textContent=String(new Date().getFullYear());\n      function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c];});}\n      function videoUrl(v){return 'https://www.youtube.com/watch?v='+encodeURIComponent(v.id);}\n      function thumbUrl(v){return v.thumbnail_url||('https://i.ytimg.com/vi/'+encodeURIComponent(v.id)+'/hqdefault.jpg');}\n      function card(v,index,small){\n        var href=esc(v.url||videoUrl(v));\n        var title=esc(v.title||'유튜브에서 영상 보기');\n        var date=v.published?new Date(v.published):null;\n        var dateText=date&&!isNaN(date.getTime())?date.toLocaleDateString('ko-KR',{year:'numeric',month:'short',day:'numeric'}):'문탕이 영상';\n        return '<a class=\"video-card\" href=\"'+href+'\" target=\"_blank\" rel=\"noopener noreferrer\"><div class=\"thumb\"><img src=\"'+esc(thumbUrl(v))+'\" alt=\"'+title+' 썸네일\" loading=\"lazy\"><span class=\"thumb-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div><div class=\"video-info\"><div><div class=\"video-meta\">'+esc(small?dateText:'추천 영상 '+String(index+1).padStart(2,'0'))+'</div><div class=\"video-name\">'+title+'</div></div><span class=\"video-go\">재생</span></div></a>';\n      }\n      async function loadVideos(){\n        try{\n          var response=await fetch('/api/youtube',{headers:{'Accept':'application/json'}});\n          if(!response.ok)throw new Error('metadata unavailable');\n          var data=await response.json();\n          var featured=Array.isArray(data.featured)?data.featured:[];\n          featured.forEach(function(v,index){\n            var cardElement=document.querySelector('[data-featured-id=\"'+v.id+'\"]');\n            if(cardElement){\n              var titleElement=cardElement.querySelector('.video-name');\n              var image=cardElement.querySelector('img');\n              if(titleElement&&v.title)titleElement.textContent=v.title;\n              if(image&&v.thumbnail_url){image.src=v.thumbnail_url;image.alt=v.title||'문탕이 영상 썸네일';}\n              if(v.url)cardElement.href=v.url;\n            }\n          });\n          var hero=(featured.length?featured[0]:null);\n          if(hero){\n            var heroImg=document.getElementById('hero-thumb');\n            var heroTitle=document.getElementById('hero-title');\n            var heroLink=document.getElementById('hero-video');\n            if(heroImg&&hero.thumbnail_url){heroImg.src=hero.thumbnail_url;heroImg.alt=hero.title||'문탕이 추천 영상 썸네일';}\n            if(heroTitle)heroTitle.textContent=hero.title||'문탕이의 유튜브 영상';\n            if(heroLink&&hero.url)heroLink.href=hero.url;\n          }\n          var recent=Array.isArray(data.recent)?data.recent:[];\n          var featuredSet={};\n          featuredIds.forEach(function(id){featuredSet[id]=true;});\n          var filtered=recent.filter(function(v){return v.id&&!featuredSet[v.id];}).slice(0,6);\n          if(filtered.length){\n            var latestSection=document.getElementById('latest');\n            var latestGrid=document.getElementById('latest-grid');\n            latestGrid.innerHTML=filtered.map(function(v,i){return card(v,i,true);}).join('');\n            latestSection.hidden=false;\n          }\n          if(data.channelTitle)document.title='문탕닷컴 — '+data.channelTitle;\n        }catch(error){\n          var title=document.getElementById('hero-title');\n          if(title)title.textContent='문탕이의 유튜브 영상';\n        }\n      }\n      if(!reduceMotion){\n        var track=document.querySelector('.rule-track');\n        if(track)track.style.animationDuration='34s';\n      }\n      loadVideos();\n    })();\n  </script>\n</body>\n</html>";

const featuredIds = ["5D9M7hhDNlY", "JupaczQCTFk"];
const channelHandleUrl = "https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4";

function decodeXml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function readTag(text, tag) {
  const expression = new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + tag + ">");
  const match = String(text || "").match(expression);
  return match ? decodeXml(match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim()) : "";
}

function jsonResponse(value, status, extraHeaders) {
  return new Response(JSON.stringify(value), {
    status: status || 200,
    headers: Object.assign({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*"
    }, extraHeaders || {})
  });
}

async function fetchOEmbed(id) {
  try {
    const target = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
    const endpoint = "https://www.youtube.com/oembed?url=" + encodeURIComponent(target) + "&format=json";
    const response = await fetch(endpoint, { headers: { "Accept": "application/json" } });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      id: id,
      title: data.title || "",
      author_name: data.author_name || "",
      author_url: data.author_url || "https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4",
      thumbnail_url: data.thumbnail_url || ("https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"),
      url: target
    };
  } catch (_) {
    return null;
  }
}

async function fetchChannelFeed() {
  let channelHtml = "";
  let channelTitle = "문탕이";
  let channelId = "";
  try {
    const channelResponse = await fetch(channelHandleUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MuntangSite/1.0)", "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8" },
      redirect: "follow"
    });
    if (channelResponse.ok) {
      channelHtml = await channelResponse.text();
      const idMatch = channelHtml.match(/"externalId"\s*:\s*"(UC[^"]+)"/) ||
        channelHtml.match(/"channelId"\s*:\s*"(UC[^"]+)"/) ||
        channelHtml.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/);
      if (idMatch) channelId = idMatch[1];
      const titleMatch = channelHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i) ||
        channelHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
      if (titleMatch && titleMatch[1]) channelTitle = decodeXml(titleMatch[1]).replace(/\s*-\s*YouTube\s*$/i, "");
    }
  } catch (_) {}

  if (!channelId) return { channelTitle: channelTitle, channelId: "", recent: [] };
  try {
    const feedResponse = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=" + encodeURIComponent(channelId), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MuntangSite/1.0)", "Accept": "application/atom+xml, application/xml;q=0.9, */*;q=0.8" }
    });
    if (!feedResponse.ok) return { channelTitle: channelTitle, channelId: channelId, recent: [] };
    const xml = await feedResponse.text();
    const recent = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map(function(match) {
      const entry = match[1];
      const id = readTag(entry, "yt:videoId");
      if (!id) return null;
      const published = readTag(entry, "published");
      return {
        id: id,
        title: readTag(entry, "title"),
        published: published,
        author_name: readTag(entry, "name"),
        thumbnail_url: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg",
        url: "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
      };
    }).filter(Boolean).slice(0, 12);
    const feedAuthor = xml.match(/<author>\s*<name>([\s\S]*?)<\/name>/);
    if (feedAuthor && feedAuthor[1]) channelTitle = decodeXml(feedAuthor[1]);
    return { channelTitle: channelTitle, channelId: channelId, recent: recent };
  } catch (_) {
    return { channelTitle: channelTitle, channelId: channelId, recent: [] };
  }
}

async function handleYouTubeApi() {
  const results = await Promise.all([
    Promise.all(featuredIds.map(fetchOEmbed)),
    fetchChannelFeed()
  ]);
  const fetchedFeatured = results[0].filter(Boolean);
  const featured = featuredIds.map(function(id) {
    return fetchedFeatured.find(function(video) { return video.id === id; }) || {
      id: id,
      title: "",
      author_name: "",
      author_url: channelHandleUrl,
      thumbnail_url: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
    };
  });
  const feed = results[1];
  return jsonResponse({
    ok: true,
    channelTitle: feed.channelTitle || (fetchedFeatured[0] && fetchedFeatured[0].author_name) || "문탕이",
    channelUrl: channelHandleUrl,
    featured: featured,
    recent: feed.recent || [],
    source: "YouTube public oEmbed and channel RSS",
    updatedAt: new Date().toISOString()
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/youtube") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return jsonResponse({ error: "Method Not Allowed" }, 405, { "Allow": "GET, HEAD" });
      }
      return handleYouTubeApi();
    }
    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\\nAllow: /\\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" }
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET, HEAD" } });
    }
    return new Response(request.method === "HEAD" ? null : html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Content-Security-Policy": "default-src 'self'; img-src 'self' https://i.ytimg.com data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"
      }
    });
  }
};
