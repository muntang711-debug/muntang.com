const html = "<!doctype html>\n<html lang=\"ko\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n  <meta name=\"theme-color\" content=\"#090909\">\n  <meta name=\"description\" content=\"문탕이의 영상 아카이브.\">\n  <meta property=\"og:type\" content=\"website\">\n  <meta property=\"og:title\" content=\"문탕닷컴 — 문탕이\">\n  <meta property=\"og:description\" content=\"문탕이의 영상 아카이브.\">\n  <title>문탕닷컴 — 문탕이</title>\n  <style>\n    :root{--orange:#ff7900;--hot:#ff4d00;--cream:#f7f0e5;--white:#fffaf2;--black:#090909;--panel:#151411;--line:rgba(255,250,242,.16);--muted:#9f9a91;--content:1320px}\n    *{box-sizing:border-box}\n    html{scroll-behavior:smooth;scroll-padding-top:84px;background:var(--black)}\n    body{margin:0;background:var(--black);color:var(--white);font-family:Pretendard,\"Apple SD Gothic Neo\",\"Malgun Gothic\",Arial,sans-serif;font-size:15px;line-height:1.55;letter-spacing:-.035em;overflow-x:hidden}\n    body.drawer-open{overflow:hidden}\n    a{color:inherit;text-decoration:none}\n    button,input{font:inherit}\n    button,a{-webkit-tap-highlight-color:transparent}\n    img{display:block;max-width:100%}\n    ::selection{color:var(--black);background:var(--orange)}\n    [hidden]{display:none!important}\n    .wrap{width:min(var(--content),calc(100% - 88px));margin-inline:auto}\n    .top-progress{position:fixed;z-index:90;left:0;top:0;width:100%;height:3px;pointer-events:none}\n    .top-progress span{display:block;width:100%;height:100%;background:linear-gradient(90deg,var(--orange),#ffd09a);transform:scaleX(0);transform-origin:left}\n    .header{position:fixed;z-index:40;left:0;right:0;top:3px;height:82px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(9,9,9,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}\n    .nav{height:100%;display:flex;align-items:center;justify-content:space-between}\n    .brand{display:inline-flex;align-items:baseline;gap:2px;font-size:25px;font-weight:950;letter-spacing:-.1em}\n    .brand-dot{color:var(--orange)}\n    .nav-right{display:flex;align-items:center;gap:23px}\n    .nav-channel{display:inline-flex;align-items:center;gap:10px;color:#d8d2c8;font-size:12px;font-weight:800;transition:color .2s}\n    .nav-channel:hover{color:var(--orange)}\n    .nav-channel svg{width:15px;height:15px}\n    .menu-trigger{position:relative;display:flex;align-items:center;justify-content:center;width:51px;height:51px;border:1px solid rgba(255,255,255,.24);background:transparent;color:var(--white);cursor:pointer;transition:background .28s,border-color .28s}\n    .menu-trigger:hover{border-color:var(--orange);background:rgba(255,121,0,.1)}\n    .hamburger{position:relative;display:block;width:19px;height:14px}\n    .hamburger i{position:absolute;left:0;width:100%;height:2px;background:currentColor;transition:top .35s cubic-bezier(.2,.8,.2,1),transform .35s cubic-bezier(.2,.8,.2,1),width .25s}\n    .hamburger i:nth-child(1){top:1px;width:100%}\n    .hamburger i:nth-child(2){top:6px;width:72%;left:auto;right:0}\n    .hamburger i:nth-child(3){top:11px;width:100%}\n    .menu-trigger:hover .hamburger i:nth-child(2){width:100%}\n    .menu-trigger[aria-expanded=\"true\"] .hamburger i:nth-child(1){top:6px;transform:rotate(45deg)}\n    .menu-trigger[aria-expanded=\"true\"] .hamburger i:nth-child(2){width:0}\n    .menu-trigger[aria-expanded=\"true\"] .hamburger i:nth-child(3){top:6px;transform:rotate(-45deg)}\n    .drawer-backdrop{position:fixed;z-index:60;inset:0;background:rgba(0,0,0,.74);opacity:0;visibility:hidden;transition:opacity .45s,visibility .45s;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}\n    .drawer-backdrop.is-open{opacity:1;visibility:visible}\n    .drawer{position:fixed;z-index:70;right:0;top:0;bottom:0;width:min(540px,100%);padding:32px 42px 36px;background:linear-gradient(145deg,#1d1b17,#10100f 62%);border-left:1px solid rgba(255,121,0,.28);transform:translate3d(105%,0,0);visibility:hidden;transition:transform .72s cubic-bezier(.22,1,.36,1),visibility .72s;overflow-y:auto;overscroll-behavior:contain;box-shadow:-30px 0 100px rgba(0,0,0,.4)}\n    .drawer.is-open{transform:translate3d(0,0,0);visibility:visible}\n    .drawer:before{content:\"\";position:absolute;z-index:-1;right:-110px;top:90px;width:420px;height:420px;border:1px solid rgba(255,121,0,.2);border-radius:50%;box-shadow:0 0 0 32px rgba(255,121,0,.025),0 0 0 70px rgba(255,121,0,.018);pointer-events:none}\n    .drawer-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:28px;border-bottom:1px solid var(--line)}\n    .drawer-head .brand{font-size:22px}\n    .drawer-close{display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(255,255,255,.22);background:transparent;color:var(--white);cursor:pointer;transition:background .22s,border-color .22s}.drawer-close:hover{background:var(--orange);border-color:var(--orange);color:var(--black)}\n    .drawer-body{padding-top:35px}\n    .drawer-overline{color:var(--orange);font-size:11px;font-weight:950;letter-spacing:.14em}\n    .drawer-links{display:flex;flex-direction:column;margin-top:13px}\n    .drawer-link{position:relative;display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 0;border-bottom:1px solid rgba(255,255,255,.12);overflow:hidden}\n    .drawer-link:before{content:\"\";position:absolute;z-index:0;left:0;right:100%;top:0;bottom:0;background:linear-gradient(90deg,rgba(255,121,0,.15),transparent);transition:right .42s cubic-bezier(.2,.8,.2,1)}\n    .drawer-link:hover:before{right:0}\n    .drawer-link span{position:relative;z-index:1;font-size:clamp(28px,4vw,39px);font-weight:900;letter-spacing:-.075em;transition:transform .4s cubic-bezier(.2,.8,.2,1),color .3s}\n    .drawer-link small{position:relative;z-index:1;color:#777168;font-size:10px;letter-spacing:.1em;font-weight:850}\n    .drawer-link em{position:relative;z-index:1;font-size:20px;font-style:normal;color:var(--orange);transform:translate(-7px,7px);opacity:0;transition:opacity .3s,transform .3s}\n    .drawer-link:hover span{transform:translateX(9px);color:var(--orange)}\n    .drawer-link:hover em{opacity:1;transform:translate(0,0)}\n    .drawer-foot{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:31px}\n    .drawer-channel{display:inline-flex;align-items:center;gap:11px;min-height:48px;padding:0 15px;background:var(--orange);color:#12100c;font-size:12px;font-weight:950;transition:background .25s,transform .25s}\n    .drawer-channel:hover{background:#ff9f47;transform:translateY(-2px)}\n    .drawer-social{color:#9f988d;font-size:11px}\n    .drawer-stagger{opacity:0;transform:translateX(30px);transition:opacity .45s,transform .55s cubic-bezier(.2,.8,.2,1)}\n    .drawer.is-open .drawer-stagger{opacity:1;transform:translateX(0)}\n    .drawer.is-open .drawer-stagger:nth-child(1){transition-delay:.14s}\n    .drawer.is-open .drawer-stagger:nth-child(2){transition-delay:.21s}\n    .drawer.is-open .drawer-stagger:nth-child(3){transition-delay:.28s}\n    .drawer.is-open .drawer-stagger:nth-child(4){transition-delay:.35s}\n    .hero{position:relative;min-height:900px;min-height:min(100svh,1040px);padding-top:83px;display:flex;align-items:center;isolation:isolate;overflow:hidden;background:radial-gradient(ellipse at 72% 45%,rgba(113,50,5,.2),transparent 37%),#090909}\n    .hero:before{content:\"\";position:absolute;z-index:-3;inset:0;background-image:linear-gradient(rgba(255,255,255,.032) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.032) 1px,transparent 1px);background-size:66px 66px;mask-image:linear-gradient(90deg,transparent,#000 40%,#000)}\n    .hero:after{content:\"\";position:absolute;z-index:-3;width:660px;height:660px;right:-160px;top:2%;border-radius:50%;border:1px solid rgba(255,121,0,.14);box-shadow:0 0 0 28px rgba(255,121,0,.025),0 0 0 83px rgba(255,121,0,.018),0 0 0 150px rgba(255,121,0,.012);pointer-events:none}\n    .hero-inner{position:relative;display:grid;grid-template-columns:.9fr 1.1fr;align-items:center;gap:14px;width:min(var(--content),calc(100% - 88px));margin:0 auto;padding:44px 0 72px}\n    .hero-copy{position:relative;z-index:8;padding-top:16px}\n    .eyebrow{display:flex;align-items:center;gap:12px;color:#ffa54d;font-size:11px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;animation:rise .9s .08s both}\n    .eyebrow:before{content:\"\";display:block;width:28px;height:2px;background:var(--orange)}\n    .hero-title{margin:29px 0 0;font-size:clamp(58px,7.1vw,105px);font-weight:950;line-height:.99;letter-spacing:-.105em;word-break:keep-all;animation:rise .95s .17s both}\n    .hero-title .line{display:block;white-space:nowrap}\n    .hero-title .accent{position:relative;z-index:0;color:var(--orange)}\n    .hero-title .accent:after{content:\"\";position:absolute;z-index:-1;left:0;right:0;bottom:2px;height:12px;background:rgba(255,121,0,.18);transform:scaleX(0);transform-origin:left;animation:paint .65s .95s both}\n    .hero-meta{display:flex;align-items:center;gap:14px;margin-top:29px;color:#a8a095;font-size:11px;font-weight:800;animation:rise .9s .3s both}\n    .hero-meta strong{color:var(--white)}\n    .meta-line{width:1px;height:13px;background:rgba(255,255,255,.24)}\n    .hero-cta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:36px;animation:rise .9s .4s both}\n    .cta-primary{display:inline-flex;align-items:center;justify-content:space-between;gap:24px;min-width:174px;min-height:53px;padding:0 17px;background:var(--orange);color:#100e0a;font-size:12px;font-weight:950;transition:background .22s,transform .22s}\n    .cta-primary:hover{background:#ff9a3b;transform:translateY(-3px)}\n    .cta-primary svg{width:15px;height:15px;transition:transform .22s}\n    .cta-primary:hover svg{transform:translate(3px,-3px)}\n    .cta-quiet{display:inline-flex;align-items:center;gap:10px;min-height:53px;padding:0 15px;border:1px solid rgba(255,255,255,.22);font-size:12px;font-weight:850;transition:background .22s,border-color .22s}\n    .cta-quiet:hover{background:rgba(255,255,255,.07);border-color:var(--orange)}\n    .hero-stage{position:relative;min-width:0;height:600px;perspective:1200px;isolation:isolate}\n    .hero-stage:before{content:\"\";position:absolute;z-index:-2;inset:10% 0 6%;background:radial-gradient(ellipse at 54% 48%,rgba(255,115,0,.18),rgba(255,81,0,.07) 32%,transparent 68%);filter:blur(24px)}\n    #hero3d{position:absolute;inset:-6% -13% -8% -10%;width:123%;height:114%;display:block;pointer-events:none;opacity:.98}\n    .scene-label{position:absolute;top:8%;right:4%;z-index:1;color:rgba(255,235,213,.56);font-size:9px;font-weight:850;letter-spacing:.2em}\n    .scene-label:before{content:\"\";display:inline-block;width:6px;height:6px;margin-right:8px;border-radius:50%;background:var(--orange);box-shadow:0 0 12px var(--orange);vertical-align:1px}\n    .feature-card{position:absolute;z-index:4;top:21%;right:-6%;width:min(70%,450px);padding:7px;background:#f7f2e9;color:#17130e;transform:rotateY(-10deg) rotateZ(2.1deg);transform-style:preserve-3d;box-shadow:0 26px 70px rgba(0,0,0,.58),18px 19px 0 rgba(255,121,0,.14);transition:transform .6s cubic-bezier(.2,.8,.2,1),box-shadow .4s;animation:card-in 1s .2s cubic-bezier(.2,.8,.2,1) both}\n    .feature-card:hover{transform:rotateY(-2deg) rotateZ(0) translateY(-6px);box-shadow:0 36px 85px rgba(0,0,0,.65),18px 19px 0 rgba(255,121,0,.22)}\n    .feature-image{position:relative;overflow:hidden;aspect-ratio:16/9;background:#25221d}\n    .feature-image img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.8,.2,1),filter .4s}\n    .feature-card:hover .feature-image img{transform:scale(1.045);filter:saturate(1.12)}\n    .feature-image:after{content:\"\";position:absolute;inset:43% 0 0;background:linear-gradient(0deg,rgba(0,0,0,.36),transparent)}\n    .feature-tag{position:absolute;z-index:2;top:13px;left:13px;padding:7px 9px;background:var(--orange);color:#14100a;font-size:9px;font-weight:950;letter-spacing:.06em}\n    .feature-play{position:absolute;z-index:3;right:14px;bottom:14px;display:grid;place-items:center;width:53px;height:53px;background:var(--orange);color:#14100a;transition:transform .25s}\n    .feature-play:before{content:\"\";position:absolute;inset:-7px;border:1px solid rgba(255,121,0,.9);animation:pulse 2.2s ease-out infinite}\n    .feature-play svg{width:19px;height:19px;margin-left:3px}\n    .feature-card:hover .feature-play{transform:scale(1.08)}\n    .feature-info{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 9px 13px}\n    .feature-small{font-size:9px;color:#8b4a10;font-weight:950;letter-spacing:.08em}\n    .feature-title{margin-top:5px;max-width:380px;font-size:clamp(13px,1.35vw,18px);font-weight:950;line-height:1.45;letter-spacing:-.045em;word-break:keep-all}\n    .feature-arrow{display:grid;place-items:center;flex:none;width:36px;height:36px;border:1px solid #d0c6b7;font-size:17px;transition:background .2s,border-color .2s}\n    .feature-card:hover .feature-arrow{background:var(--orange);border-color:var(--orange)}\n    .float-card{position:absolute;z-index:5;left:-2%;bottom:8%;width:26%;padding:5px;background:#f8f3e9;color:#16120e;transform:rotate(-9deg);box-shadow:0 20px 40px rgba(0,0,0,.55);transition:transform .45s cubic-bezier(.2,.8,.2,1);animation:float-in .95s .45s both}\n    .float-card:hover{transform:rotate(-3deg) translateY(-7px)}\n    .float-image{position:relative;overflow:hidden;aspect-ratio:16/9;background:#27231d}\n    .float-image img{width:100%;height:100%;object-fit:cover}\n    .float-tag{position:absolute;left:7px;top:7px;padding:3px 6px;background:var(--orange);font-size:8px;font-weight:950}\n    .float-info{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 4px 3px;font-size:9px;font-weight:950}\n    .float-info span:last-child{color:#8f490c}\n    .hero-index{position:absolute;z-index:5;right:4%;bottom:9%;display:flex;align-items:center;gap:8px;color:#8c8579;font-size:10px;font-variant-numeric:tabular-nums;font-weight:850}\n    .hero-index strong{color:var(--orange);font-size:16px}\n    .hero-index i{display:block;width:30px;height:1px;background:rgba(255,255,255,.25)}\n    .hero-bottom{position:absolute;z-index:4;left:0;right:0;bottom:0;padding:18px 0;border-top:1px solid rgba(255,255,255,.13)}\n    .hero-bottom-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;color:#8f897f;font-size:10px;font-weight:800;letter-spacing:.06em}\n    .hero-bottom-mark{display:flex;align-items:center;gap:10px}\n    .hero-bottom-mark:before{content:\"\";width:6px;height:6px;background:var(--orange);transform:rotate(45deg)}\n    .hero-bottom-scroll{display:flex;align-items:center;gap:11px;color:#c7c0b5}\n    .hero-bottom-scroll span{display:block;width:37px;height:1px;background:var(--orange);transform-origin:left;animation:line-sweep 2s ease-in-out infinite}\n    .archive{position:relative;padding:125px 0 130px;background:#f0eae0;color:#17140f;isolation:isolate}\n    .archive:before{content:\"\";position:absolute;z-index:-1;inset:0;background-image:linear-gradient(rgba(23,20,15,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(23,20,15,.035) 1px,transparent 1px);background-size:60px 60px;mask-image:linear-gradient(180deg,#000,transparent 85%)}\n    .archive-head{display:flex;align-items:end;justify-content:space-between;gap:32px;margin-bottom:37px;padding-bottom:24px;border-bottom:1px solid rgba(23,20,15,.24)}\n    .archive-kicker{display:flex;align-items:center;gap:10px;font-size:10px;font-weight:950;color:#94480a;letter-spacing:.12em}\n    .archive-kicker:before{content:\"\";width:20px;height:3px;background:var(--orange)}\n    .archive-title{margin:12px 0 0;font-size:clamp(42px,6vw,72px);line-height:1;letter-spacing:-.095em;font-weight:950}\n    .archive-title span{color:#ab4c00}\n    .archive-count{display:flex;align-items:center;gap:11px;color:#71695e;font-size:11px;font-weight:850}\n    .archive-count strong{font-size:28px;color:#15120f;letter-spacing:-.06em;font-weight:950;font-variant-numeric:tabular-nums}\n    .archive-tools{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:23px}\n    .archive-filter{display:flex;align-items:center;gap:8px;color:#766d61;font-size:11px;font-weight:850}\n    .archive-filter i{display:block;width:6px;height:6px;background:var(--orange);border-radius:50%}\n    .video-search{display:flex;align-items:center;gap:10px;width:min(290px,50%);height:41px;padding:0 12px;border-bottom:1px solid rgba(23,20,15,.35);transition:border-color .2s}\n    .video-search:focus-within{border-color:#a44a00}\n    .video-search svg{width:16px;height:16px;flex:none;color:#6b6256}\n    .video-search input{min-width:0;width:100%;outline:0;border:0;background:transparent;color:#1b1712;font-size:12px}\n    .video-search input::placeholder{color:#8c8376}\n    .video-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:37px 25px}\n    .video-card{display:block;min-width:0;opacity:0;transform:translateY(28px);transition:opacity .7s,transform .7s cubic-bezier(.2,.8,.2,1)}\n    .video-card.is-visible{opacity:1;transform:translateY(0)}\n    .video-frame{position:relative;overflow:hidden;aspect-ratio:16/9;background:#d9d0c3;isolation:isolate}\n    .video-frame:before{content:\"\";position:absolute;z-index:3;inset:0;border:0 solid var(--orange);transition:border-width .25s;pointer-events:none}\n    .video-frame:after{content:\"\";position:absolute;z-index:1;inset:55% 0 0;background:linear-gradient(0deg,rgba(0,0,0,.4),transparent)}\n    .video-frame img{width:100%;height:100%;object-fit:cover;transition:transform .65s cubic-bezier(.2,.8,.2,1),filter .5s}\n    .video-card:hover .video-frame img{transform:scale(1.055);filter:saturate(1.12)}\n    .video-card:hover .video-frame:before{border-width:4px}\n    .video-play{position:absolute;z-index:4;right:11px;bottom:11px;display:grid;place-items:center;width:39px;height:39px;background:var(--orange);color:#16120d;transition:transform .25s,background .25s}\n    .video-play svg{width:14px;height:14px;margin-left:2px}\n    .video-card:hover .video-play{transform:translate(-2px,-2px) scale(1.08);background:#ff9a3b}\n    .video-index{position:absolute;z-index:3;left:11px;top:11px;padding:5px 8px;background:rgba(12,11,9,.82);color:#fff1dc;font-size:9px;font-weight:950;backdrop-filter:blur(10px)}\n    .video-card-text{display:flex;align-items:flex-start;justify-content:space-between;gap:13px;padding:13px 0 14px;border-bottom:1px solid rgba(23,20,15,.2)}\n    .video-card-title{display:block;font-size:16px;line-height:1.48;font-weight:900;letter-spacing:-.04em;word-break:keep-all}\n    .video-card-date{display:block;margin-top:6px;color:#7b7164;font-size:10px;font-weight:750}\n    .video-card-arrow{flex:none;display:grid;place-items:center;width:29px;height:29px;border:1px solid rgba(23,20,15,.24);font-size:15px;transition:background .2s,border-color .2s,transform .2s}\n    .video-card:hover .video-card-arrow{background:var(--orange);border-color:var(--orange);transform:translate(2px,-2px)}\n    .video-empty{grid-column:1/-1;padding:50px 0;color:#776e62;font-size:13px}\n    .video-load-wrap{display:flex;justify-content:center;padding-top:52px}\n    .video-load{display:inline-flex;align-items:center;justify-content:center;gap:13px;min-width:175px;min-height:48px;padding:0 20px;border:1px solid rgba(23,20,15,.35);background:transparent;color:#17140f;font-size:11px;font-weight:950;cursor:pointer;transition:background .25s,border-color .25s}\n    .video-load:hover{background:var(--orange);border-color:var(--orange)}\n    .video-load svg{width:15px;height:15px;transition:transform .25s}\n    .video-load:hover svg{transform:translateY(3px)}\n    .video-load:disabled{opacity:.45;cursor:wait}\n    .footer{padding:30px 0;background:#090909;border-top:1px solid rgba(255,255,255,.14)}\n    .footer-inner{display:flex;align-items:center;justify-content:space-between;gap:20px}\n    .footer-brand{font-size:18px;font-weight:950;letter-spacing:-.1em}\n    .footer-brand span{color:var(--orange)}\n    .footer-right{display:flex;align-items:center;gap:22px;color:#a8a197;font-size:11px;font-weight:800}\n    .footer-right a{transition:color .2s}\n    .footer-right a:hover{color:var(--orange)}\n    [data-reveal]{opacity:0;transform:translateY(25px);transition:opacity .75s cubic-bezier(.2,.7,.25,1),transform .75s cubic-bezier(.2,.7,.25,1)}\n    [data-reveal].is-visible{opacity:1;transform:translateY(0)}\n    @keyframes rise{from{opacity:0;transform:translateY(25px)}to{opacity:1;transform:translateY(0)}}\n    @keyframes paint{from{transform:scaleX(0)}to{transform:scaleX(1)}}\n    @keyframes card-in{from{opacity:0;transform:translate3d(34px,24px,0) rotateY(-20deg) rotateZ(5deg) scale(.94)}to{opacity:1;transform:rotateY(-10deg) rotateZ(2.1deg) scale(1)}}\n    @keyframes float-in{from{opacity:0;transform:translate3d(-24px,22px,0) rotate(-14deg)}to{opacity:1;transform:rotate(-9deg)}}\n    @keyframes pulse{0%{transform:scale(.7);opacity:.8}100%{transform:scale(1.45);opacity:0}}\n    @keyframes line-sweep{0%,100%{transform:scaleX(.35);opacity:.4}50%{transform:scaleX(1);opacity:1}}\n    @media(max-width:1100px){.wrap,.hero-inner{width:calc(100% - 56px)}.hero-inner{grid-template-columns:.87fr 1.13fr;gap:0}.hero-title{font-size:clamp(55px,7.5vw,84px)}.hero-stage{height:560px}.feature-card{top:21%;right:-5%;width:76%}.float-card{left:-3%;bottom:10%;width:27%}.hero-index{right:0;bottom:7%}.video-grid{gap:30px 19px}.video-card-title{font-size:14px}}\n    @media(max-width:760px){.wrap,.hero-inner{width:calc(100% - 36px)}.header{height:70px}.brand{font-size:23px}.nav-right{gap:15px}.nav-channel{font-size:0;gap:0;width:38px;height:38px;justify-content:center;border:1px solid rgba(255,255,255,.18)}.nav-channel svg{width:16px;height:16px}.menu-trigger{width:44px;height:44px}.drawer{padding:24px 24px 28px;width:min(440px,100%)}.drawer-head{padding-bottom:22px}.drawer-body{padding-top:29px}.drawer-link{padding:15px 0}.drawer-link span{font-size:34px}.drawer-foot{align-items:flex-start;flex-direction:column}.hero{min-height:auto;padding-top:70px;display:block}.hero:before{background-size:45px 45px;mask-image:linear-gradient(180deg,transparent,#000 30%,#000)}.hero:after{width:430px;height:430px;right:-235px;top:37%}.hero-inner{display:flex;flex-direction:column;align-items:stretch;gap:4px;padding:69px 0 62px}.hero-copy{padding:0}.eyebrow{font-size:10px}.hero-title{font-size:clamp(51px,12.4vw,78px);margin-top:23px}.hero-meta{margin-top:20px;font-size:10px}.hero-cta{margin-top:27px;gap:9px}.cta-primary,.cta-quiet{min-height:47px}.hero-stage{height:clamp(350px,91vw,540px);margin-top:4px}.scene-label{top:4%;right:1%;font-size:8px}#hero3d{inset:-2% -18% 0 -18%;width:136%;height:103%}.feature-card{top:13%;right:0;width:82%;padding:5px;transform:rotateY(-5deg) rotateZ(1.8deg)}.feature-card:hover{transform:rotateY(0) rotateZ(0) translateY(-3px)}.feature-tag{left:9px;top:9px;padding:6px 7px;font-size:8px}.feature-play{width:43px;height:43px;right:10px;bottom:10px}.feature-info{padding:10px 7px 9px}.feature-small{font-size:8px}.feature-title{font-size:13px;margin-top:3px}.feature-arrow{width:30px;height:30px;font-size:15px}.float-card{left:0;bottom:9%;width:34%;padding:4px;transform:rotate(-7deg)}.float-card:hover{transform:rotate(-3deg) translateY(-4px)}.float-info{font-size:8px;padding:5px 3px 2px}.hero-index{right:0;bottom:5%;font-size:9px}.hero-index strong{font-size:14px}.hero-bottom{padding:13px 0}.hero-bottom-inner{font-size:8px}.hero-bottom-scroll{gap:7px}.hero-bottom-scroll span{width:20px}.archive{padding:78px 0 85px}.archive-head{align-items:flex-end;gap:15px;margin-bottom:27px;padding-bottom:19px}.archive-title{font-size:clamp(36px,9vw,54px)}.archive-kicker{font-size:9px}.archive-count{gap:7px;font-size:9px}.archive-count strong{font-size:22px}.archive-tools{align-items:flex-start;flex-direction:column;margin-bottom:20px;gap:13px}.video-search{width:100%;max-width:100%}.video-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 13px}.video-card-title{font-size:13px}.video-card-text{padding:10px 0 11px;gap:7px}.video-card-date{font-size:9px}.video-play{width:32px;height:32px;right:8px;bottom:8px}.video-index{left:8px;top:8px;padding:4px 6px;font-size:8px}.video-card-arrow{width:25px;height:25px;font-size:13px}.video-load-wrap{padding-top:37px}.footer-inner{align-items:flex-start;flex-direction:column;gap:15px}.footer-right{gap:17px;flex-wrap:wrap}}\n    @media(max-width:420px){.wrap,.hero-inner{width:calc(100% - 30px)}.nav-channel{display:none}.hero-title{font-size:clamp(48px,12.2vw,63px)}.hero-stage{height:350px}.feature-card{top:11%;width:83%;right:0}.float-card{bottom:7%;width:35%}.hero-index{bottom:3%}.archive-head{align-items:flex-start;flex-direction:column;gap:13px}.archive-count{align-self:flex-end;margin-top:-3px}.video-grid{gap:22px 10px}.video-card-title{font-size:12px}.video-card-arrow{width:23px;height:23px}.drawer{padding:20px 20px 24px}.drawer-link span{font-size:32px}}\n    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}[data-reveal],.video-card{opacity:1!important;transform:none!important}}\n  </style>\n</head>\n<body>\n  <div class=\"top-progress\" aria-hidden=\"true\"><span id=\"progressBar\"></span></div>\n  <header class=\"header\">\n    <nav class=\"nav wrap\" aria-label=\"주요 메뉴\">\n      <a href=\"#top\" class=\"brand\" aria-label=\"문탕닷컴 홈\">문탕닷컴<span class=\"brand-dot\">.</span></a>\n      <div class=\"nav-right\">\n        <a class=\"nav-channel\" href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"유튜브 채널 열기\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12s0 3.6.5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12s0-3.6-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z\"/></svg></a>\n        <button class=\"menu-trigger\" id=\"menuTrigger\" type=\"button\" aria-label=\"메뉴 열기\" aria-expanded=\"false\" aria-controls=\"siteDrawer\"><span class=\"hamburger\" aria-hidden=\"true\"><i></i><i></i><i></i></span></button>\n      </div>\n    </nav>\n  </header>\n  <div class=\"drawer-backdrop\" id=\"drawerBackdrop\"></div>\n  <aside class=\"drawer\" id=\"siteDrawer\" aria-hidden=\"true\" aria-label=\"사이트 메뉴\">\n    <div class=\"drawer-head\"><a href=\"#top\" class=\"brand\" data-close-drawer>문탕닷컴<span class=\"brand-dot\">.</span></a><button class=\"drawer-close\" id=\"drawerClose\" type=\"button\" aria-label=\"메뉴 닫기\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" aria-hidden=\"true\"><path d=\"m6 6 12 12M18 6 6 18\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg></button></div>\n    <div class=\"drawer-body\">\n      <div class=\"drawer-overline drawer-stagger\">바로 이동</div>\n      <nav class=\"drawer-links\" aria-label=\"사이트 메뉴\">\n        <a class=\"drawer-link drawer-stagger\" href=\"#top\"><span>홈</span><small>01</small><em>↗</em></a>\n        <a class=\"drawer-link drawer-stagger\" href=\"#videos\"><span>전체 영상</span><small>02</small><em>↗</em></a>\n        <a class=\"drawer-link drawer-stagger\" href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\"><span>유튜브 채널</span><small>03</small><em>↗</em></a>\n      </nav>\n      <div class=\"drawer-foot drawer-stagger\"><a class=\"drawer-channel\" href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">채널 바로가기 <span>↗</span></a><span class=\"drawer-social\">@문탕이</span></div>\n    </div>\n  </aside>\n  <main id=\"top\">\n    <section class=\"hero\">\n      <div class=\"hero-inner\">\n        <div class=\"hero-copy\">\n          <div class=\"eyebrow\">문탕이 · 유튜브</div>\n          <h1 class=\"hero-title\"><span class=\"line\">문탕이의</span><span class=\"line accent\">영상 세계.</span></h1>\n          <div class=\"hero-meta\"><strong>@문탕이</strong></div>\n          <div class=\"hero-cta\">\n            <a href=\"#videos\" class=\"cta-primary\">영상 둘러보기 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M5 12h14m-7-7 7 7-7 7\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></a>\n            <a href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" class=\"cta-quiet\" target=\"_blank\" rel=\"noopener noreferrer\">유튜브 ↗</a>\n          </div>\n        </div>\n        <div class=\"hero-stage\" id=\"heroStage\">\n          <canvas id=\"hero3d\" aria-hidden=\"true\"></canvas>\n          \n          <a class=\"feature-card\" id=\"heroVideo\" href=\"https://youtu.be/5D9M7hhDNlY\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"대표 영상 재생\">\n            <div class=\"feature-image\"><img id=\"heroThumbnail\" src=\"https://i.ytimg.com/vi/5D9M7hhDNlY/hqdefault.jpg\" alt=\"대표 영상 썸네일\"><span class=\"feature-tag\">대표 영상</span><span class=\"feature-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div>\n            <div class=\"feature-info\"><div><div class=\"feature-small\">대표 영상</div><div class=\"feature-title\" id=\"heroTitle\">영상 불러오는 중</div></div><span class=\"feature-arrow\">↗</span></div>\n          </a>\n          <a class=\"float-card\" id=\"heroPeek\" href=\"https://www.youtube.com/watch?v=JupaczQCTFk&amp;t=1s\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"다른 영상 재생\">\n            <div class=\"float-image\"><img id=\"peekThumbnail\" src=\"https://i.ytimg.com/vi/JupaczQCTFk/hqdefault.jpg\" alt=\"다른 영상 썸네일\"><span class=\"float-tag\">다른 영상</span></div><div class=\"float-info\"><span id=\"peekTitle\">다른 영상</span><span>↗</span></div>\n          </a>\n          <div class=\"hero-index\"><strong id=\"heroIndex\">01</strong><i></i><span id=\"heroTotal\">02</span></div>\n        </div>\n      </div>\n      <div class=\"hero-bottom\"><div class=\"hero-bottom-inner wrap\"><span class=\"hero-bottom-mark\">문탕닷컴</span><span class=\"hero-bottom-scroll\"><span></span> 아래로 스크롤</span></div></div>\n    </section>\n    <section class=\"archive\" id=\"videos\">\n      <div class=\"wrap\">\n        <div class=\"archive-head\" data-reveal>\n          <div><div class=\"archive-kicker\">문탕이의 영상</div><h2 class=\"archive-title\">전체 <span>영상</span></h2></div>\n          <div class=\"archive-count\"><strong id=\"videoCount\">—</strong><span>개 영상</span></div>\n        </div>\n        <div class=\"archive-tools\" data-reveal>\n          <span class=\"archive-filter\"><i></i><span id=\"archiveStatus\">영상 불러오는 중</span></span>\n          <label class=\"video-search\"><svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><circle cx=\"10.8\" cy=\"10.8\" r=\"6.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"m16 16 5 5\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg><input id=\"videoSearch\" type=\"search\" placeholder=\"영상 검색\" autocomplete=\"off\" aria-label=\"영상 검색\"></label>\n        </div>\n        <div class=\"video-grid\" id=\"videoGrid\">\n          <a class=\"video-card is-visible\" href=\"https://youtu.be/5D9M7hhDNlY\" target=\"_blank\" rel=\"noopener noreferrer\" data-video-id=\"5D9M7hhDNlY\">\n            <div class=\"video-frame\"><img src=\"https://i.ytimg.com/vi/5D9M7hhDNlY/hqdefault.jpg\" alt=\"영상 썸네일\"><span class=\"video-index\">01</span><span class=\"video-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div>\n            <div class=\"video-card-text\"><span class=\"video-card-title\">영상 불러오는 중</span><span class=\"video-card-arrow\">↗</span></div>\n          </a>\n          <a class=\"video-card is-visible\" href=\"https://www.youtube.com/watch?v=JupaczQCTFk&amp;t=1s\" target=\"_blank\" rel=\"noopener noreferrer\" data-video-id=\"JupaczQCTFk\">\n            <div class=\"video-frame\"><img src=\"https://i.ytimg.com/vi/JupaczQCTFk/hqdefault.jpg\" alt=\"영상 썸네일\"><span class=\"video-index\">02</span><span class=\"video-play\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-1.56l10.04-5.74A1.04 1.04 0 0 1 18.6V5.4Z\" style=\"display:none\"/><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg></span></div>\n            <div class=\"video-card-text\"><span class=\"video-card-title\">영상 불러오는 중</span><span class=\"video-card-arrow\">↗</span></div>\n          </a>\n        </div>\n        <div class=\"video-load-wrap\" id=\"videoLoadWrap\" hidden><button class=\"video-load\" id=\"loadMore\" type=\"button\">더 많은 영상 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 5v14m-7-7 7 7 7-7\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></button></div>\n      </div>\n    </section>\n  </main>\n  <footer class=\"footer\"><div class=\"footer-inner wrap\"><a href=\"#top\" class=\"footer-brand\">문탕닷컴<span>.</span></a><div class=\"footer-right\"><a href=\"#top\">맨 위로 ↑</a><a href=\"#videos\">전체 영상</a><a href=\"https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4\" target=\"_blank\" rel=\"noopener noreferrer\">유튜브 ↗</a></div></div></footer>\n  <script>\n    (function(){\n      var $=function(selector,root){return (root||document).querySelector(selector);};\n      var $$=function(selector,root){return Array.prototype.slice.call((root||document).querySelectorAll(selector));};\n      var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n\n      var trigger=$('#menuTrigger'),drawer=$('#siteDrawer'),backdrop=$('#drawerBackdrop'),drawerClose=$('#drawerClose');\n      var drawerOpen=false,previousFocus=null;\n      function setDrawer(open){\n        drawerOpen=!!open;\n        document.body.classList.toggle('drawer-open',drawerOpen);\n        trigger.setAttribute('aria-expanded',String(drawerOpen));\n        trigger.setAttribute('aria-label',drawerOpen?'메뉴 닫기':'메뉴 열기');\n        drawer.setAttribute('aria-hidden',String(!drawerOpen));\n        drawer.classList.toggle('is-open',drawerOpen);\n        backdrop.classList.toggle('is-open',drawerOpen);\n        if(drawerOpen){previousFocus=document.activeElement;window.setTimeout(function(){var first=$('.drawer-link',drawer);if(first)first.focus();},180);}\n        else if(previousFocus&&previousFocus.focus){previousFocus.focus();}\n      }\n      trigger.addEventListener('click',function(){setDrawer(!drawerOpen);});if(drawerClose)drawerClose.addEventListener('click',function(){setDrawer(false);});\n      backdrop.addEventListener('click',function(){setDrawer(false);});\n      $$('[data-close-drawer]',drawer).forEach(function(a){a.addEventListener('click',function(){setDrawer(false);});});\n      $$('.drawer-link',drawer).forEach(function(a){a.addEventListener('click',function(){if(a.target!=='_blank')setDrawer(false);});});\n      document.addEventListener('keydown',function(e){\n        if(e.key==='Escape'&&drawerOpen){setDrawer(false);return;}\n        if(e.key==='Tab'&&drawerOpen){\n          var focusables=$$('a[href],button:not(:disabled)',drawer).filter(function(el){return el.offsetParent!==null;});\n          if(!focusables.length)return;\n          var first=focusables[0],last=focusables[focusables.length-1];\n          if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}\n          else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}\n        }\n      });\n\n      var progress=$('#progressBar'),rafPending=false;\n      function scrollUpdate(){\n        var doc=document.documentElement,max=doc.scrollHeight-window.innerHeight;\n        if(progress)progress.style.transform='scaleX('+(max>0?Math.max(0,Math.min(1,window.scrollY/max)):0)+')';\n        rafPending=false;\n      }\n      window.addEventListener('scroll',function(){if(!rafPending){rafPending=true;requestAnimationFrame(scrollUpdate);}},{passive:true});\n      window.addEventListener('resize',scrollUpdate,{passive:true});scrollUpdate();\n\n      var revealObserver=null;\n      if(!reduced&&'IntersectionObserver' in window){\n        revealObserver=new IntersectionObserver(function(entries){\n          entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});\n        },{threshold:.08,rootMargin:'0px 0px -35px 0px'});\n        $$('[data-reveal]').forEach(function(el){revealObserver.observe(el);});\n      }else{$$('[data-reveal]').forEach(function(el){el.classList.add('is-visible');});}\n\n      // Lightweight WebGL scene: custom-generated 3D knot, orbit ring and metal spheres.\n      (function init3D(){\n        var canvas=$('#hero3d');if(!canvas)return;\n        var gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'})||canvas.getContext('experimental-webgl');\n        if(!gl){canvas.style.display='none';return;}\n        var vertexSource='attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uModel;uniform mat4 uVP;varying vec3 vNormal;varying vec3 vColor;varying vec3 vWorld;void main(){vec4 p=uModel*vec4(aPosition,1.0);vWorld=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);vColor=aColor;gl_Position=uVP*p;}';\n        var fragmentSource='precision mediump float;varying vec3 vNormal;varying vec3 vColor;varying vec3 vWorld;void main(){vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-0.45,0.78,0.62));vec3 v=normalize(vec3(0.0,0.0,5.0)-vWorld);vec3 h=normalize(l+v);float d=max(dot(n,l),0.0);float s=pow(max(dot(n,h),0.0),38.0);float rim=pow(1.0-max(dot(n,v),0.0),2.0);vec3 c=vColor*(0.22+d*0.86)+vec3(1.0,0.71,0.39)*s*0.95+vec3(1.0,0.17,0.015)*rim*0.36;gl_FragColor=vec4(c,1.0);}';\n        function shader(type,source){var s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}\n        var vs=shader(gl.VERTEX_SHADER,vertexSource),fs=shader(gl.FRAGMENT_SHADER,fragmentSource);\n        if(!vs||!fs){canvas.style.display='none';return;}\n        var program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);\n        if(!gl.getProgramParameter(program,gl.LINK_STATUS)){canvas.style.display='none';return;}\n        gl.useProgram(program);\n        var loc={p:gl.getAttribLocation(program,'aPosition'),n:gl.getAttribLocation(program,'aNormal'),c:gl.getAttribLocation(program,'aColor'),model:gl.getUniformLocation(program,'uModel'),vp:gl.getUniformLocation(program,'uVP')};\n        function buildMesh(positions,normals,colors,indices){var mesh={count:indices.length};\n          mesh.p=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);\n          mesh.n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);\n          mesh.c=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.c);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);\n          mesh.i=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);return mesh;}\n        function knotMesh(segments,sides,tube){\n          var p=[],n=[],c=[],ix=[];\n          for(var i=0;i<=segments;i++){\n            var u=i/segments*Math.PI*2,du=.001;\n            function center(t){return [(1.05+.43*Math.cos(3*t))*Math.cos(2*t),(1.05+.43*Math.cos(3*t))*Math.sin(2*t),.48*Math.sin(3*t)];}\n            var cp=center(u),cm=center(u-du),cn=center(u+du);\n            var tangent=[cn[0]-cm[0],cn[1]-cm[1],cn[2]-cm[2]];\n            var tl=Math.hypot(tangent[0],tangent[1],tangent[2])||1;tangent=tangent.map(function(v){return v/tl;});\n            var ref=Math.abs(tangent[2])>.92?[0,1,0]:[0,0,1];\n            var normal=[tangent[1]*ref[2]-tangent[2]*ref[1],tangent[2]*ref[0]-tangent[0]*ref[2],tangent[0]*ref[1]-tangent[1]*ref[0]];\n            var nl=Math.hypot(normal[0],normal[1],normal[2])||1;normal=normal.map(function(v){return v/nl;});\n            var binormal=[tangent[1]*normal[2]-tangent[2]*normal[1],tangent[2]*normal[0]-tangent[0]*normal[2],tangent[0]*normal[1]-tangent[1]*normal[0]];\n            for(var j=0;j<=sides;j++){\n              var v=j/sides*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v);\n              var no=[normal[0]*cv+binormal[0]*sv,normal[1]*cv+binormal[1]*sv,normal[2]*cv+binormal[2]*sv];\n              p.push(cp[0]+no[0]*tube,cp[1]+no[1]*tube,cp[2]+no[2]*tube);n.push(no[0],no[1],no[2]);\n              var blend=(Math.sin(u*2.5+v*1.2)+1)/2;\n              c.push(.78+.22*blend,.12+.37*blend,.012+.055*blend);\n            }\n          }\n          for(var a=0;a<segments;a++)for(var b=0;b<sides;b++){var k=a*(sides+1)+b;ix.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}\n          return buildMesh(p,n,c,ix);\n        }\n        function torusMesh(R,r,segments,sides,color){\n          var p=[],n=[],c=[],ix=[];\n          for(var i=0;i<=segments;i++){var u=i/segments*Math.PI*2,cu=Math.cos(u),su=Math.sin(u);\n            for(var j=0;j<=sides;j++){var v=j/sides*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v);\n              var no=[cv*cu,cv*su,sv];p.push((R+r*cv)*cu,(R+r*cv)*su,r*sv);n.push(no[0],no[1],no[2]);\n              var shine=(Math.sin(u*5)+1)/2;c.push(color[0]*(.7+.3*shine),color[1]*(.62+.38*shine),color[2]*(.75+.25*shine));\n            }\n          }\n          for(var a=0;a<segments;a++)for(var b=0;b<sides;b++){var k=a*(sides+1)+b;ix.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}\n          return buildMesh(p,n,c,ix);\n        }\n        function sphereMesh(segments,rings,color){\n          var p=[],n=[],c=[],ix=[];\n          for(var y=0;y<=rings;y++){var vv=y/rings*Math.PI,sy=Math.cos(vv),sr=Math.sin(vv);\n            for(var x=0;x<=segments;x++){var uu=x/segments*Math.PI*2,nx=sr*Math.cos(uu),nz=sr*Math.sin(uu);p.push(nx*sy,nx*0+sy,nz*sr*0+sr*Math.sin(uu));}\n          }\n          p=[];n=[];c=[];ix=[];\n          for(var y=0;y<=rings;y++){var vv=y/rings*Math.PI,sy=Math.cos(vv),sr=Math.sin(vv);\n            for(var x=0;x<=segments;x++){var uu=x/segments*Math.PI*2,nx=sr*Math.cos(uu),nz=sr*Math.sin(uu);var normal=[nx,sy,nz];p.push(nx,sy,nz);n.push(nx,sy,nz);var light=(sy+1)/2;c.push(color[0]*(.6+.4*light),color[1]*(.55+.45*light),color[2]*(.6+.4*light));}\n          }\n          for(var y=0;y<rings;y++)for(var x=0;x<segments;x++){var k=y*(segments+1)+x;ix.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}\n          return buildMesh(p,n,c,ix);\n        }\n        var knot=knotMesh(180,22,.19);\n        var orbit=torusMesh(1.95,.018,180,6,[.96,.43,.08]);\n        var orbit2=torusMesh(2.2,.009,160,5,[.42,.31,.2]);\n        var sphere=sphereMesh(18,12,[1,.33,.035]);\n        function ident(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}\n        function mul(a,b){var o=new Float32Array(16);for(var col=0;col<4;col++)for(var row=0;row<4;row++){var sum=0;for(var k=0;k<4;k++)sum+=a[k*4+row]*b[col*4+k];o[col*4+row]=sum;}return o;}\n        function tr(x,y,z){var m=ident();m[12]=x;m[13]=y;m[14]=z;return m;}\n        function rx(a){var m=ident(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m;}\n        function ry(a){var m=ident(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m;}\n        function rz(a){var m=ident(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m;}\n        function sc(x,y,z){var m=ident();m[0]=x;m[5]=y;m[10]=z;return m;}\n        function perspective(fov,aspect,near,far){var f=1/Math.tan(fov/2),nf=1/(near-far),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)*nf;m[11]=-1;m[14]=2*far*near*nf;return m;}\n        function draw(mesh,model,vp){gl.uniformMatrix4fv(loc.model,false,model);gl.uniformMatrix4fv(loc.vp,false,vp);\n          gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.enableVertexAttribArray(loc.p);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,0,0);\n          gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.enableVertexAttribArray(loc.n);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,0,0);\n          gl.bindBuffer(gl.ARRAY_BUFFER,mesh.c);gl.enableVertexAttribArray(loc.c);gl.vertexAttribPointer(loc.c,3,gl.FLOAT,false,0,0);\n          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);\n        }\n        var w=0,h=0,mouseX=0,mouseY=0,aimX=0,aimY=0,last=0,frame=0,visible=true;\n        var observer=('IntersectionObserver' in window)?new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(visible)requestAnimationFrame(render);}):null;\n        if(observer)observer.observe(canvas);\n        function resize(){var rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.5);w=Math.max(1,Math.round(rect.width*dpr));h=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}}\n        if(window.matchMedia('(pointer:fine)').matches){\n          $('#heroStage').addEventListener('pointermove',function(e){var r=this.getBoundingClientRect();aimX=((e.clientX-r.left)/r.width-.5)*.46;aimY=((e.clientY-r.top)/r.height-.5)*-.3;});\n          $('#heroStage').addEventListener('pointerleave',function(){aimX=0;aimY=0;});\n        }\n        function render(now){\n          if(document.hidden||(!visible&&observer))return;\n          if(now-last<30){requestAnimationFrame(render);return;}last=now;\n          resize();if(!w||!h)return;\n          mouseX+=(aimX-mouseX)*.035;mouseY+=(aimY-mouseY)*.035;\n          var t=reduced?0:now*.00022;\n          gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);\n          gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);\n          gl.useProgram(program);\n          var aspect=w/h,vp=perspective(Math.PI/3,aspect,.1,100);\n          var fit=window.innerWidth<760?.88:1.14;\n          var base=mul(tr(-.72,.08,-4.45),mul(ry(t*.6+mouseX),mul(rx(.52+t*.35+mouseY),sc(fit*1.12,fit*1.12,fit*1.12))));\n          draw(knot,base,vp);\n          var orb=mul(tr(-.62,.05,-4.45),mul(rz(-t*.8+mouseX*.3),mul(ry(.4),mul(rx(.95),sc(fit*1.35,fit*1.35,fit*1.35)))));\n          draw(orbit,orb,vp);\n          var orb2=mul(tr(-.62,.05,-4.45),mul(ry(t*.36),mul(rz(1.0),mul(rx(1.25),sc(fit*1.48,fit*1.48,fit*1.48)))));\n          draw(orbit2,orb2,vp);\n          var s1=mul(tr(-.62+1.85*Math.cos(t*.75),1.2*Math.sin(t*.75),-4.45+.4*Math.sin(t)),mul(ry(t),sc(.15,.15,.15)));\n          draw(sphere,s1,vp);\n          var s2=mul(tr(-.62-1.75*Math.cos(t*.52),1.4*Math.sin(t*.52),-4.45+.3*Math.cos(t)),mul(ry(-t),sc(.095,.095,.095)));\n          draw(sphere,s2,vp);\n          if(!reduced)requestAnimationFrame(render);\n        }\n        document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(render);});\n        window.addEventListener('resize',function(){resize();if(!reduced)requestAnimationFrame(render);},{passive:true});\n        resize();requestAnimationFrame(render);\n      })();\n\n      var fallback=[\n        {id:'5D9M7hhDNlY',title:'영상 01',thumbnail_url:'https://i.ytimg.com/vi/5D9M7hhDNlY/hqdefault.jpg',url:'https://www.youtube.com/watch?v=5D9M7hhDNlY'},\n        {id:'JupaczQCTFk',title:'영상 02',thumbnail_url:'https://i.ytimg.com/vi/JupaczQCTFk/hqdefault.jpg',url:'https://www.youtube.com/watch?v=JupaczQCTFk&t=1s'}\n      ];\n      var videos=[],nextContinuation='',loading=false,seen={},filtered=[];\n      var grid=$('#videoGrid'),count=$('#videoCount'),status=$('#archiveStatus'),loadWrap=$('#videoLoadWrap'),loadButton=$('#loadMore'),search=$('#videoSearch');\n      var playSvg='<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z\"/></svg>';\n      function create(tag,cls,text){var node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}\n      function normalize(v){\n        return {id:v.id||'',title:v.title||'',thumbnail_url:v.thumbnail_url||('https://i.ytimg.com/vi/'+encodeURIComponent(v.id)+'/hqdefault.jpg'),url:v.url||('https://www.youtube.com/watch?v='+encodeURIComponent(v.id)),publishedText:v.publishedText||'',published:v.published||''};\n      }\n      function observeCard(card){\n        if(!reduced&&'IntersectionObserver' in window){\n          var ob=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');ob.unobserve(entry.target);}});},{threshold:.06,rootMargin:'0px 0px -25px 0px'});\n          ob.observe(card);\n        }else{card.classList.add('is-visible');}\n      }\n      function cardFor(video,index){\n        var a=create('a','video-card');a.href=video.url;a.target='_blank';a.rel='noopener noreferrer';a.dataset.videoId=video.id;\n        var frame=create('div','video-frame'),img=document.createElement('img');img.src=video.thumbnail_url;img.alt=video.title+' 썸네일';img.loading='lazy';img.decoding='async';frame.appendChild(img);\n        frame.appendChild(create('span','video-index',String(index+1).padStart(2,'0')));\n        var play=create('span','video-play');play.innerHTML=playSvg;frame.appendChild(play);a.appendChild(frame);\n        var text=create('div','video-card-text'),words=create('span','video-card-title',video.title||'유튜브 영상');text.appendChild(words);\n        if(video.publishedText)words.appendChild(create('span','video-card-date',video.publishedText));\n        else if(video.published){var date=new Date(video.published);if(!isNaN(date.getTime()))words.appendChild(create('span','video-card-date',date.toLocaleDateString('ko-KR',{year:'numeric',month:'short',day:'numeric'})));}\n        text.appendChild(create('span','video-card-arrow','↗'));a.appendChild(text);observeCard(a);return a;\n      }\n      function renderVideos(){\n        var query=(search.value||'').trim().toLocaleLowerCase();\n        filtered=videos.filter(function(v){return !query||(v.title||'').toLocaleLowerCase().includes(query);});\n        grid.textContent='';\n        if(!filtered.length){grid.appendChild(create('div','video-empty',query?'검색 결과가 없습니다.':'공개된 영상이 없습니다.'));}\n        else filtered.forEach(function(v,i){grid.appendChild(cardFor(v,i));});\n        count.textContent=String(videos.length).padStart(2,'0');\n        status.textContent=query?'검색 결과 '+filtered.length+'개':(nextContinuation?'채널 영상 · 계속해서 불러올 수 있습니다':'채널 영상');\n        loadWrap.hidden=!nextContinuation||!!query;\n      }\n      function addVideos(list){\n        (Array.isArray(list)?list:[]).forEach(function(raw){\n          var v=normalize(raw);if(!v.id||seen[v.id])return;seen[v.id]=true;videos.push(v);\n        });\n      }\n      function setFeature(v,peek){\n        if(!v)return;\n        var feature=$('#heroVideo'),img=$('#heroThumbnail'),title=$('#heroTitle');\n        feature.href=v.url;feature.setAttribute('aria-label',(v.title||'대표 영상')+' 재생');\n        img.src=v.thumbnail_url;img.alt=(v.title||'대표 영상')+' 썸네일';title.textContent=v.title||'유튜브 영상';\n        if(peek){var p=$('#heroPeek'),pi=$('#peekThumbnail');p.href=peek.url;pi.src=peek.thumbnail_url;pi.alt=(peek.title||'다른 영상')+' 썸네일';$('#peekTitle').textContent=peek.title||'다른 영상';}\n        var index=videos.findIndex(function(item){return item.id===v.id;});\n        $('#heroIndex').textContent=String(Math.max(0,index)+1).padStart(2,'0');\n        $('#heroTotal').textContent=String(videos.length).padStart(2,'0');\n      }\n      async function loadMore(initial){\n        if(loading||(!initial&&!nextContinuation))return;\n        loading=true;if(loadButton){loadButton.disabled=true;loadButton.textContent='불러오는 중…';}\n        try{\n          var endpoint='/api/youtube';\n          if(!initial){endpoint+='?continuation='+encodeURIComponent(nextContinuation);}\n          var response=await fetch(endpoint,{headers:{'Accept':'application/json'}});\n          if(!response.ok)throw new Error('video source unavailable');\n          var data=await response.json();\n          if(initial){\n            var all=Array.isArray(data.videos)?data.videos:[];\n            if(!all.length)all=(Array.isArray(data.recent)?data.recent:[]);\n            if(!all.length)all=Array.isArray(data.featured)?data.featured:[];\n            addVideos(all);\n            if(data.featured&&data.featured.length){\n              var first=videos.find(function(v){return v.id===data.featured[0].id;})||normalize(data.featured[0]);\n              var second=videos.find(function(v){return v.id===data.featured[1]?.id;})||normalize(data.featured[1]||fallback[1]);\n              setFeature(first,second);\n            }else if(videos.length)setFeature(videos[0],videos[1]||videos[0]);\n          }else{addVideos(data.videos||[]);}\n          nextContinuation=data.nextContinuation||'';\n          if(!videos.length)addVideos(fallback);\n          renderVideos();\n        }catch(error){\n          if(initial&&!videos.length){addVideos(fallback);setFeature(videos[0],videos[1]);renderVideos();status.textContent='공유된 영상';}\n          else if(loadButton)loadButton.textContent='다시 시도';\n        }finally{\n          loading=false;\n          if(loadButton){loadButton.disabled=false;loadButton.innerHTML='더 많은 영상 <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 5v14m-7-7 7 7 7-7\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>';}\n        }\n      }\n      if(search)search.addEventListener('input',renderVideos);\n      if(loadButton)loadButton.addEventListener('click',function(){loadMore(false);});\n      loadMore(true);\n    })();\n  </script>\n</body>\n</html>";

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


function parseEmbeddedJson(source, marker) {
  const text = String(source || "");
  const at = text.indexOf(marker);
  if (at < 0) return null;
  const start = text.indexOf("{", at + marker.length);
  if (start < 0) return null;
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') quoted = false;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch (_) { return null; }
      }
    }
  }
  return null;
}

function textFromYouTubeRuns(value) {
  if (!value) return "";
  if (typeof value.simpleText === "string") return value.simpleText;
  if (Array.isArray(value.runs)) return value.runs.map(function(run) { return run && run.text || ""; }).join("");
  return "";
}

function collectYouTubeVideos(data) {
  const videos = [];
  const seen = new Set();
  const stack = [data];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i--) stack.push(current[i]);
      continue;
    }
    const lockup = current.lockupViewModel || (current.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" ? current : null);
    if (lockup && typeof lockup.contentId === "string" &&
        /^[A-Za-z0-9_-]{11}$/.test(lockup.contentId) && !seen.has(lockup.contentId)) {
      const lockTitle = lockup.metadata && lockup.metadata.lockupMetadataViewModel &&
        lockup.metadata.lockupMetadataViewModel.title && lockup.metadata.lockupMetadataViewModel.title.content || "";
      const sources = lockup.contentImage && lockup.contentImage.thumbnailViewModel &&
        lockup.contentImage.thumbnailViewModel.image && lockup.contentImage.thumbnailViewModel.image.sources || [];
      const lockMeta = lockup.metadata && lockup.metadata.lockupMetadataViewModel &&
        lockup.metadata.lockupMetadataViewModel.metadata && lockup.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel &&
        lockup.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows || [];
      const metaParts = lockMeta.reduce(function(all, row) {
        return all.concat((row.metadataParts || []).map(function(part) {
          return part && part.text && part.text.content || "";
        }).filter(Boolean));
      }, []);
      const lockThumbnail = sources.length && sources[sources.length - 1].url ||
        ("https://i.ytimg.com/vi/" + lockup.contentId + "/hqdefault.jpg");
      if (lockTitle) {
        seen.add(lockup.contentId);
        videos.push({
          id: lockup.contentId,
          title: lockTitle,
          thumbnail_url: lockThumbnail,
          publishedText: metaParts.length ? metaParts[metaParts.length - 1] : "",
          url: "https://www.youtube.com/watch?v=" + encodeURIComponent(lockup.contentId)
        });
      }
    }
    const id = current.videoId;
    if (typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id) && current.title && current.thumbnail && !seen.has(id)) {
      const title = textFromYouTubeRuns(current.title);
      const thumbnails = current.thumbnail && current.thumbnail.thumbnails;
      const thumbnail = Array.isArray(thumbnails) && thumbnails.length
        ? (thumbnails[thumbnails.length - 1].url || "")
        : "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
      if (title) {
        seen.add(id);
        videos.push({
          id: id,
          title: title,
          thumbnail_url: thumbnail,
          publishedText: textFromYouTubeRuns(current.publishedTimeText),
          viewCountText: textFromYouTubeRuns(current.viewCountText || current.shortViewCountText),
          url: "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
        });
      }
    }
    const keys = Object.keys(current);
    for (let i = keys.length - 1; i >= 0; i--) {
      const value = current[keys[i]];
      if (value && typeof value === "object") stack.push(value);
    }
  }
  return videos;
}

function findYouTubeContinuation(data) {
  const scan = [data];
  const seen = new Set();
  const roots = [];
  while (scan.length) {
    const current = scan.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i--) scan.push(current[i]);
      continue;
    }
    if (current.richGridRenderer) roots.push(current.richGridRenderer);
    if (current.richGridContinuation) roots.push(current.richGridContinuation);
    if (current.appendContinuationItemsAction &&
        Array.isArray(current.appendContinuationItemsAction.continuationItems)) {
      roots.push(current.appendContinuationItemsAction.continuationItems);
    }
    const keys = Object.keys(current);
    for (let i = keys.length - 1; i >= 0; i--) {
      const value = current[keys[i]];
      if (value && typeof value === "object") scan.push(value);
    }
  }

  for (const root of roots) {
    const pending = [root];
    const visited = new Set();
    let token = "";
    while (pending.length) {
      const current = pending.pop();
      if (!current || typeof current !== "object" || visited.has(current)) continue;
      visited.add(current);
      if (Array.isArray(current)) {
        for (let i = current.length - 1; i >= 0; i--) pending.push(current[i]);
        continue;
      }
      const item = current.continuationItemRenderer;
      if (item && item.continuationEndpoint && item.continuationEndpoint.continuationCommand &&
          item.continuationEndpoint.continuationCommand.token) {
        token = item.continuationEndpoint.continuationCommand.token;
      }
      if (current.nextContinuationData && current.nextContinuationData.continuation) {
        token = current.nextContinuationData.continuation;
      }
      if (Array.isArray(current.continuations)) {
        current.continuations.forEach(function(entry) {
          if (entry && entry.nextContinuationData && entry.nextContinuationData.continuation) {
            token = entry.nextContinuationData.continuation;
          }
        });
      }
      const keys = Object.keys(current);
      for (let i = keys.length - 1; i >= 0; i--) {
        const value = current[keys[i]];
        if (value && typeof value === "object") pending.push(value);
      }
    }
    if (token) return token;
  }
  return "";
}

async function fetchChannelVideoPage(continuation) {
  try {
    const pageResponse = await fetch(channelHandleUrl + "/videos", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"
      },
      redirect: "follow"
    });
    if (!pageResponse.ok) return { videos: [], nextContinuation: "" };
    const pageHtml = await pageResponse.text();
    const apiKeyMatch = pageHtml.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/);
    const context = parseEmbeddedJson(pageHtml, '"INNERTUBE_CONTEXT":');
    let pageData = parseEmbeddedJson(pageHtml, "var ytInitialData =");
    if (!pageData) pageData = parseEmbeddedJson(pageHtml, '"ytInitialData":');
    let nextContinuation = "";

    if (continuation && apiKeyMatch && apiKeyMatch[1]) {
      const clientVersionMatch = pageHtml.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION"\s*:\s*"([^"]+)"/);
      const clientVersion = clientVersionMatch ? clientVersionMatch[1] :
        (context && context.client && context.client.clientVersion) || "2.20261018.01.00";
      const fallbackContext = {
        client: { clientName: "WEB", clientVersion: clientVersion, hl: "ko", gl: "KR" }
      };
      const response = await fetch("https://www.youtube.com/youtubei/v1/browse?key=" + encodeURIComponent(apiKeyMatch[1]), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Origin": "https://www.youtube.com",
          "Referer": channelHandleUrl + "/videos",
          "X-YouTube-Client-Name": "1",
          "X-YouTube-Client-Version": clientVersion
        },
        body: JSON.stringify({
          context: context || fallbackContext,
          continuation: continuation
        })
      });
      if (response.ok) pageData = await response.json();
      else pageData = null;
    }

    if (!pageData) return { videos: [], nextContinuation: "" };
    const videos = collectYouTubeVideos(pageData);
    nextContinuation = findYouTubeContinuation(pageData);
    return { videos: videos, nextContinuation: nextContinuation };
  } catch (_) {
    return { videos: [], nextContinuation: "" };
  }
}

async function handleYouTubeApi(request) {
  const requestUrl = new URL(request.url);
  const continuation = requestUrl.searchParams.get("continuation") || "";
  if (continuation) {
    const page = await fetchChannelVideoPage(continuation);
    return jsonResponse({
      ok: true,
      videos: page.videos,
      nextContinuation: page.nextContinuation,
      source: "YouTube channel videos"
    });
  }

  const results = await Promise.all([
    Promise.all(featuredIds.map(fetchOEmbed)),
    fetchChannelFeed(),
    fetchChannelVideoPage("")
  ]);
  const fetchedFeatured = results[0].filter(Boolean);
  const feed = results[1];
  const page = results[2];
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
  let videos = page.videos || [];
  if (!videos.length) {
    videos = (feed.recent || []).slice();
    featured.forEach(function(video) {
      if (!videos.some(function(item) { return item.id === video.id; })) videos.push(video);
    });
  }
  return jsonResponse({
    ok: true,
    channelTitle: feed.channelTitle || (fetchedFeatured[0] && fetchedFeatured[0].author_name) || "문탕이",
    channelUrl: channelHandleUrl,
    featured: featured,
    videos: videos,
    nextContinuation: page.nextContinuation || "",
    source: "YouTube channel videos, public oEmbed and channel RSS",
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
      return handleYouTubeApi(request);
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
