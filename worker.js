const html = "<!doctype html>\n<html lang=\"ko\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <meta name=\"theme-color\" content=\"#f1ede6\">\n  <meta name=\"description\" content=\"문탕이의 유튜브 영상과 채널을 모아 놓은 문탕닷컴.\">\n  <meta property=\"og:type\" content=\"website\">\n  <meta property=\"og:title\" content=\"문탕닷컴 — 문탕이\">\n  <meta property=\"og:description\" content=\"문탕이의 영상과 유튜브 채널.\">\n  <title>문탕닷컴 — 문탕이</title>\n  <style>\n    :root{--orange:#ff7700;--paper:#f1ede6;--paper-light:#faf8f4;--ink:#191816;--muted:#756f67;--line:#d7d0c6;--dark:#191816;--white:#fffdf8;--content:1160px}\n    *{box-sizing:border-box}\n    html{scroll-behavior:smooth;scroll-padding-top:80px}\n    body{margin:0;background:var(--paper);color:var(--ink);font-family:Pretendard,\"Apple SD Gothic Neo\",\"Malgun Gothic\",Arial,sans-serif;font-size:15px;line-height:1.6;letter-spacing:-.03em}\n    a{color:inherit;text-decoration:none}\n    img{display:block;max-width:100%}\n    button{font:inherit}\n    ::selection{background:var(--orange);color:var(--ink)}\n    .wrap{width:min(var(--content),calc(100% - 64px));margin-inline:auto}\n    .top-strip{height:5px;background:var(--orange)}\n    .site-header{position:sticky;top:0;z-index:20;background:rgba(250,248,244,.97);border-bottom:1px solid var(--line)}\n    .nav{height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}\n    .brand{font-size:23px;line-height:1;font-weight:950;letter-spacing:-.09em;white-space:nowrap}\n    .brand em{font-style:normal;color:var(--orange)}\n    .nav-links{display:flex;align-items:center;gap:31px;color:#4f4a44;font-size:13px;font-weight:750}\n    .nav-links a{padding:9px 0;border-bottom:2px solid transparent}\n    .nav-links a:hover{border-color:var(--orange)}\n    .nav-channel{display:inline-flex;align-items:center;gap:9px;padding:11px 15px;background:var(--orange);color:#191816;font-size:12px;font-weight:900;transition:background .16s}\n    .nav-channel:hover{background:#ff9234}\n    .nav-channel svg{width:15px;height:15px}\n    .menu-button{display:none;width:39px;height:39px;border:1px solid var(--line);background:transparent;color:var(--ink)}\n    .hero{display:grid;grid-template-columns:.86fr 1.14fr;align-items:stretch;gap:42px;padding-top:72px;padding-bottom:72px}\n    .hero-copy{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:10px 0}\n    .eyebrow{display:flex;align-items:center;gap:9px;color:#7e3b07;font-size:12px;font-weight:900}\n    .eyebrow:before{content:\"\";width:22px;height:3px;background:var(--orange)}\n    h1{margin:25px 0 21px;font-size:clamp(51px,6vw,78px);line-height:1.05;letter-spacing:-.09em;font-weight:950}\n    h1 .highlight{display:inline;box-shadow:inset 0 -17px 0 var(--orange)}\n    .hero-copy p{max-width:360px;margin:0;color:#5f5951;font-size:15px;line-height:1.95;word-break:keep-all}\n    .hero-buttons{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:29px}\n    .button{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:45px;padding:0 16px;font-size:12px;font-weight:900;transition:background .18s,color .18s}\n    .button-primary{background:var(--ink);color:var(--white)}\n    .button-primary:hover{background:var(--orange);color:var(--ink)}\n    .button-text{border:1px solid #c9c1b6;color:var(--ink)}\n    .button-text:hover{background:#fffaf2}\n    .button svg{width:14px;height:14px}\n    .hero-caption{margin-top:auto;padding-top:43px;display:flex;align-items:center;gap:10px;color:#777066;font-size:11px;font-weight:750}\n    .hero-caption strong{color:var(--ink);font-weight:900}\n    .hero-caption .dot{width:5px;height:5px;background:var(--orange)}\n    .hero-feature{align-self:center;min-width:0;background:var(--dark);color:#fffdf8}\n    .hero-image{position:relative;overflow:hidden;aspect-ratio:16/10;background:#27231e}\n    .hero-image img{width:100%;height:100%;object-fit:cover}\n    .hero-image:after{content:\"\";position:absolute;inset:35% 0 0;background:linear-gradient(0deg,rgba(0,0,0,.55),transparent)}\n    .hero-image-label{position:absolute;top:14px;left:14px;z-index:2;background:var(--orange);color:var(--ink);padding:6px 9px;font-size:10px;line-height:1;font-weight:950}\n    .hero-play{position:absolute;right:18px;bottom:17px;z-index:3;display:grid;place-items:center;width:48px;height:48px;background:var(--orange);color:var(--ink)}\n    .hero-play svg{width:18px;height:18px;margin-left:2px}\n    .hero-video-info{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:19px 21px 21px;border-top:1px solid #37332d}\n    .hero-video-kicker{font-size:10px;letter-spacing:.05em;color:#ff9a45;font-weight:900}\n    .hero-video-title{margin-top:5px;font-size:17px;line-height:1.45;font-weight:850;letter-spacing:-.04em;word-break:keep-all}\n    .hero-arrow{color:#ff9a45;font-size:20px;flex:none}\n    .channel-line{background:var(--orange);color:var(--ink)}\n    .channel-line-inner{min-height:57px;display:flex;align-items:center;justify-content:space-between;gap:18px;font-size:12px;font-weight:850}\n    .channel-line-inner span:first-child{display:flex;align-items:center;gap:11px}\n    .channel-line-mark{display:grid;place-items:center;width:24px;height:24px;border:1px solid rgba(0,0,0,.4);font-size:11px;font-weight:950}\n    .channel-line a{display:inline-flex;align-items:center;gap:7px;border-bottom:1px solid rgba(0,0,0,.55);padding-bottom:2px}\n    .channel-line svg{width:13px;height:13px}\n    .section{padding:88px 0}\n    .section-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding-bottom:22px;margin-bottom:25px;border-bottom:1px solid var(--ink)}\n    .section-title{margin:0;font-size:clamp(29px,3.8vw,43px);font-weight:950;line-height:1.15;letter-spacing:-.08em}\n    .section-note{margin:0;max-width:360px;color:#706960;font-size:12px;line-height:1.8;word-break:keep-all}\n    .video-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}\n    .video-card{display:block;min-width:0}\n    .video-image{position:relative;overflow:hidden;aspect-ratio:16/9;background:#ded6ca}\n    .video-image img{width:100%;height:100%;object-fit:cover;transition:transform .35s}\n    .video-card:hover .video-image img{transform:scale(1.025)}\n    .video-image:after{content:\"\";position:absolute;inset:50% 0 0;background:linear-gradient(0deg,rgba(0,0,0,.28),transparent)}\n    .video-number{position:absolute;z-index:2;top:12px;left:12px;background:var(--paper-light);color:var(--ink);padding:5px 8px;font-size:10px;font-weight:900}\n    .video-play{position:absolute;z-index:2;right:13px;bottom:13px;display:grid;place-items:center;width:38px;height:38px;background:var(--orange);color:var(--ink)}\n    .video-play svg{width:15px;height:15px;margin-left:2px}\n    .video-text{padding:14px 0 0;display:flex;justify-content:space-between;align-items:flex-start;gap:17px;border-bottom:1px solid var(--line);padding-bottom:15px}\n    .video-label{color:#8a4a17;font-size:10px;font-weight:900}\n    .video-title{margin-top:5px;font-size:17px;line-height:1.5;font-weight:850;letter-spacing:-.04em;word-break:keep-all}\n    .video-open{padding-top:10px;color:#645d55;font-size:10px;white-space:nowrap}\n    .video-open span{color:#a94d00;font-size:15px}\n    .latest-section{padding-top:0}\n    .latest-list{border-top:1px solid var(--ink)}\n    .latest-item{display:grid;grid-template-columns:40px 132px minmax(0,1fr) auto;align-items:center;gap:18px;padding:15px 0;border-bottom:1px solid var(--line)}\n    .latest-num{align-self:start;padding-top:5px;color:#a84e05;font-size:11px;font-weight:900}\n    .latest-thumb{display:block;overflow:hidden;aspect-ratio:16/9;background:#ddd5ca}\n    .latest-thumb img{width:100%;height:100%;object-fit:cover}\n    .latest-date{font-size:10px;color:#71695f;font-weight:750}\n    .latest-title{margin-top:4px;font-size:15px;font-weight:850;line-height:1.45;word-break:keep-all}\n    .latest-link{padding:8px 0 8px 12px;font-size:11px;font-weight:900;white-space:nowrap}\n    .latest-link span{color:#a94d00;font-size:15px}\n    .latest-status{padding:18px 0;color:#777067;font-size:12px}\n    .about-section{background:var(--dark);color:var(--white)}\n    .about-inner{display:grid;grid-template-columns:.85fr 1.15fr;align-items:start;gap:50px}\n    .about-overline{color:#ff963d;font-size:11px;font-weight:900}\n    .about-title{margin:12px 0 0;font-size:clamp(31px,4vw,49px);line-height:1.2;letter-spacing:-.075em;font-weight:950}\n    .about-copy{padding-top:5px;color:#c7c0b6;font-size:14px;line-height:2;word-break:keep-all}\n    .about-copy p{margin:0 0 15px}\n    .about-copy strong{color:#fffdf8}\n    .about-link{display:inline-flex;align-items:center;gap:8px;margin-top:7px;border-bottom:1px solid var(--orange);padding-bottom:5px;color:#ff9a45;font-size:12px;font-weight:900}\n    .about-link svg{width:14px;height:14px}\n    .footer{padding:24px 0;background:var(--paper-light)}\n    .footer-inner{display:flex;align-items:center;justify-content:space-between;gap:20px}\n    .footer-brand{font-size:16px;font-weight:950;letter-spacing:-.07em}\n    .footer-brand span{color:var(--orange)}\n    .footer-small{margin-top:3px;font-size:10px;color:#797168}\n    .footer-links{display:flex;align-items:center;gap:20px;color:#5e584f;font-size:11px;font-weight:750}\n    .footer-links a:hover{color:#a84e05}\n    [hidden]{display:none!important}\n    @media(max-width:850px){.wrap{width:calc(100% - 44px)}.hero{gap:25px;padding:56px 0}.nav-links{gap:20px}.hero-copy p{font-size:14px}.hero-caption{padding-top:28px}.section{padding:70px 0}.about-inner{gap:30px}}\n    @media(max-width:620px){.wrap{width:calc(100% - 34px)}.nav{height:62px}.brand{font-size:21px}.nav-links{display:none;position:absolute;top:61px;left:0;right:0;padding:10px 17px 16px;background:var(--paper-light);border-bottom:1px solid var(--line);flex-direction:column;align-items:stretch;gap:0}.nav-links.open{display:flex}.nav-links a{padding:12px 2px}.nav-channel{padding:10px 11px;font-size:11px}.menu-button{display:grid;place-items:center}.hero{grid-template-columns:1fr;gap:30px;padding:44px 0 42px}.hero-copy{padding:0}.eyebrow{font-size:11px}h1{font-size:clamp(48px,13vw,70px);margin:20px 0 18px}.hero-copy p{max-width:420px;font-size:14px}.hero-buttons{margin-top:22px}.hero-caption{padding-top:24px}.hero-video-info{padding:14px 15px 16px}.hero-video-title{font-size:15px}.hero-play{width:42px;height:42px}.channel-line-inner{min-height:52px;font-size:11px}.channel-line-mark{width:22px;height:22px}.section{padding:62px 0}.section-header{display:block;padding-bottom:17px;margin-bottom:19px}.section-title{font-size:32px}.section-note{margin-top:10px;font-size:12px}.video-grid{grid-template-columns:1fr;gap:25px}.video-title{font-size:16px}.video-text{padding-top:12px}.latest-section{padding-top:0}.latest-item{grid-template-columns:24px 91px minmax(0,1fr);gap:11px;padding:13px 0}.latest-title{font-size:12px}.latest-date{font-size:9px}.latest-link{display:none}.about-inner{grid-template-columns:1fr;gap:18px}.about-title{font-size:35px}.about-copy{font-size:13px}.footer-inner{align-items:flex-start;flex-direction:column;gap:15px}.footer-links{gap:15px;flex-wrap:wrap}}\n    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important}}\n  </style>\n</head>\n<body>\n  <div class=\"top-strip\"></div>\n  <header class=\"site-header\">\n    <nav class=\"nav wrap\" aria-label=\"주요 메뉴\">\n      <a href=\"#top\" class=\"brand\" aria-label=\"문탕닷컴 홈\">문탕닷컴<em>.</em></a>\n      <div class=\"nav-links\" id=\"navLinks\">\n        <a href=\"#videos\">영상</a>\n        <a href=\"#latest\">최근 업로드</a>\n        <a href=\"#about\">소개</a>\n      </div>\n      <div style=\"display:flex;align-items:center;gap:9px\">\n        <a class=\"nav-channel\" href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">유튜브 채널 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M5 12h13M12 5l7 7-7 7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></a>\n        <button class=\"menu-button\" id=\"menuButton\" type=\"button\" aria-expanded=\"false\" aria-controls=\"navLinks\" aria-label=\"메뉴 열기\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" aria-hidden=\"true\"><path d=\"M4 7h16M4 12h16M4 17h16\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg></button>\n      </div>\n    </nav>\n  </header>\n  <main id=\"top\">\n    <section class=\"hero wrap\">\n      <div class=\"hero-copy\">\n        <div class=\"eyebrow\">유튜브 채널 · 문탕이</div>\n        <h1>문탕이의<br><span class=\"highlight\">영상 모아보기.</span></h1>\n        <p>영상과 채널 소식을 이곳에 모아뒀어. 보고 싶은 영상을 골라서 유튜브에서 보면 돼.</p>\n        <div class=\"hero-buttons\">\n          <a href=\"#videos\" class=\"button button-primary\">영상 보기 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 5v14m-7-7 7 7 7-7\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></a>\n          <a href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" class=\"button button-text\" target=\"_blank\" rel=\"noopener noreferrer\">채널로 이동 ↗</a>\n        </div>\n        <div class=\"hero-caption\"><strong>@문탕이</strong><span class=\"dot\"></span><span>문탕닷컴</span></div>\n      </div>\n      <a class=\"hero-feature\" id=\"heroVideo\" href=\"https://youtu.be/5D9M7hhDNlY\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"추천 영상 유튜브에서 보기\">\n        <div class=\"hero-image\">\n          <img id=\"heroThumbnail\" src=\"https://i.ytimg.com/vi/5D9M7hhDNlY/hqdefault.jpg\" alt=\"문탕이 추천 영상 썸네일\">\n          <span class=\"hero-image-label\">대표 영상</span>\n          <span class=\"hero-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span>\n        </div>\n        <div class=\"hero-video-info\"><div><div class=\"hero-video-kicker\">문탕이의 영상</div><div id=\"heroTitle\" class=\"hero-video-title\">영상 01</div></div><span class=\"hero-arrow\">↗</span></div>\n      </a>\n    </section>\n    <div class=\"channel-line\">\n      <div class=\"channel-line-inner wrap\"><span><span class=\"channel-line-mark\">문</span> 문탕닷컴 · 유튜브 채널 @문탕이</span><a href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">채널 방문 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M5 12h13M12 5l7 7-7 7\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></a></div>\n    </div>\n    <section class=\"section wrap\" id=\"videos\">\n      <div class=\"section-header\">\n        <h2 class=\"section-title\">영상</h2>\n        <p class=\"section-note\">공유한 영상부터 정리했어. 썸네일이나 제목을 누르면 유튜브로 이동해.</p>\n      </div>\n      <div class=\"video-grid\" id=\"videoGrid\">\n        <a class=\"video-card\" href=\"https://youtu.be/5D9M7hhDNlY\" target=\"_blank\" rel=\"noopener noreferrer\" data-video-id=\"5D9M7hhDNlY\">\n          <div class=\"video-image\"><img src=\"https://i.ytimg.com/vi/5D9M7hhDNlY/hqdefault.jpg\" alt=\"영상 01 썸네일\" loading=\"lazy\"><span class=\"video-number\">영상 01</span><span class=\"video-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div>\n          <div class=\"video-text\"><div><div class=\"video-label\">문탕이 · 유튜브</div><div class=\"video-title\">영상 01</div></div><div class=\"video-open\">보러 가기 <span>↗</span></div></div>\n        </a>\n        <a class=\"video-card\" href=\"https://www.youtube.com/watch?v=JupaczQCTFk&amp;t=1s\" target=\"_blank\" rel=\"noopener noreferrer\" data-video-id=\"JupaczQCTFk\">\n          <div class=\"video-image\"><img src=\"https://i.ytimg.com/vi/JupaczQCTFk/hqdefault.jpg\" alt=\"영상 02 썸네일\" loading=\"lazy\"><span class=\"video-number\">영상 02</span><span class=\"video-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div>\n          <div class=\"video-text\"><div><div class=\"video-label\">문탕이 · 유튜브</div><div class=\"video-title\">영상 02</div></div><div class=\"video-open\">보러 가기 <span>↗</span></div></div>\n        </a>\n      </div>\n    </section>\n    <section class=\"section latest-section wrap\" id=\"latest\" hidden>\n      <div class=\"section-header\">\n        <h2 class=\"section-title\">최근 업로드</h2>\n        <p class=\"section-note\">채널 피드에서 최근 영상을 가져와 보여 줘.</p>\n      </div>\n      <div class=\"latest-list\" id=\"latestList\"></div>\n    </section>\n    <section class=\"section about-section\" id=\"about\">\n      <div class=\"about-inner wrap\">\n        <div><div class=\"about-overline\">ABOUT</div><h2 class=\"about-title\">문탕닷컴은<br>문탕이의 홈페이지.</h2></div>\n        <div class=\"about-copy\"><p><strong>문탕닷컴</strong>은 문탕이의 유튜브 채널과 영상을 모아 놓은 개인 사이트야.</p><p>영상은 여기서 찾아보고, 재생과 댓글은 유튜브에서 이어가면 돼.</p><a class=\"about-link\" href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">유튜브 채널 보기 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M5 12h13M12 5l7 7-7 7\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></a></div>\n      </div>\n    </section>\n  </main>\n  <footer class=\"footer\"><div class=\"footer-inner wrap\"><div><div class=\"footer-brand\">문탕닷컴<span>.</span></div><div class=\"footer-small\">© <span id=\"year\">2026</span> 문탕닷컴</div></div><div class=\"footer-links\"><a href=\"#top\">맨 위로 ↑</a><a href=\"#videos\">영상</a><a href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">유튜브 ↗</a></div></div></footer>\n  <script>\n    (function(){\n      document.getElementById('year').textContent=String(new Date().getFullYear());\n      var menu=document.getElementById('navLinks');\n      var menuButton=document.getElementById('menuButton');\n      if(menu&&menuButton){\n        menuButton.addEventListener('click',function(){\n          var open=menu.classList.toggle('open');\n          menuButton.setAttribute('aria-expanded',String(open));\n          menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');\n        });\n        menu.querySelectorAll('a').forEach(function(link){link.addEventListener('click',function(){menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');});});\n      }\n      function element(tag,cls,text){var el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}\n      function makeRecentItem(video,index){\n        var link=element('a','latest-item');link.href=video.url||('https://www.youtube.com/watch?v='+encodeURIComponent(video.id));link.target='_blank';link.rel='noopener noreferrer';\n        link.appendChild(element('span','latest-num',String(index+1).padStart(2,'0')));\n        var thumb=element('span','latest-thumb');var img=document.createElement('img');img.src=video.thumbnail_url||('https://i.ytimg.com/vi/'+encodeURIComponent(video.id)+'/hqdefault.jpg');img.alt='';img.loading='lazy';thumb.appendChild(img);link.appendChild(thumb);\n        var text=element('span','');var date=video.published?new Date(video.published):null;var dateText=date&&!isNaN(date.getTime())?date.toLocaleDateString('ko-KR',{year:'numeric',month:'short',day:'numeric'}):'문탕이 영상';text.appendChild(element('span','latest-date',dateText));text.appendChild(element('span','latest-title',video.title||'유튜브 영상'));link.appendChild(text);\n        var go=element('span','latest-link','영상 보기 ');go.appendChild(element('span','','↗'));link.appendChild(go);return link;\n      }\n      async function loadVideos(){\n        try{\n          var response=await fetch('/api/youtube',{headers:{'Accept':'application/json'}});\n          if(!response.ok)throw new Error('YouTube metadata unavailable');\n          var data=await response.json();\n          var featured=Array.isArray(data.featured)?data.featured:[];\n          featured.forEach(function(video){\n            var card=document.querySelector('[data-video-id=\"'+video.id+'\"]');\n            if(card){\n              if(video.title){var title=card.querySelector('.video-title');if(title)title.textContent=video.title;}\n              if(video.thumbnail_url){var thumb=card.querySelector('img');if(thumb){thumb.src=video.thumbnail_url;thumb.alt=(video.title||'영상')+' 썸네일';}}\n              if(video.url)card.href=video.url;\n            }\n          });\n          var mainVideo=featured[0];\n          if(mainVideo){\n            var heroLink=document.getElementById('heroVideo');var heroImg=document.getElementById('heroThumbnail');var heroTitle=document.getElementById('heroTitle');\n            if(heroLink&&mainVideo.url)heroLink.href=mainVideo.url;\n            if(heroImg&&mainVideo.thumbnail_url){heroImg.src=mainVideo.thumbnail_url;heroImg.alt=(mainVideo.title||'문탕이 영상')+' 썸네일';}\n            if(heroTitle)heroTitle.textContent=mainVideo.title||'영상 01';\n          }\n          var pinned={'5D9M7hhDNlY':true,'JupaczQCTFk':true};\n          var recent=Array.isArray(data.recent)?data.recent.filter(function(video){return video.id&&!pinned[video.id];}).slice(0,6):[];\n          if(recent.length){\n            var section=document.getElementById('latest');var list=document.getElementById('latestList');\n            recent.forEach(function(video,index){list.appendChild(makeRecentItem(video,index));});\n            section.hidden=false;\n          }\n          if(data.channelTitle)document.title='문탕닷컴 — '+data.channelTitle;\n        }catch(error){\n          var title=document.getElementById('heroTitle');if(title)title.textContent='영상 01';\n        }\n      }\n      loadVideos();\n    })();\n  </script>\n</body>\n</html>";

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
