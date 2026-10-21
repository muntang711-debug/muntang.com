
    (function(){
      var $=function(selector,root){return (root||document).querySelector(selector);};
      var $$=function(selector,root){return Array.prototype.slice.call((root||document).querySelectorAll(selector));};
      var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var ldmEnabled=false;
      try{ldmEnabled=window.localStorage.getItem('muntang-ldm')==='1';}catch(_){}
      document.body.classList.toggle('ldm-mode',ldmEnabled);

      var trigger=$('#menuTrigger'),drawer=$('#siteDrawer'),backdrop=$('#drawerBackdrop');
      document.body.appendChild(trigger);
      var drawerOpen=false,previousFocus=null;
      function setDrawer(open){
        drawerOpen=!!open;
        document.body.classList.toggle('drawer-open',drawerOpen);
        document.documentElement.classList.toggle('drawer-open',drawerOpen);
        trigger.setAttribute('aria-expanded',String(drawerOpen));
        trigger.setAttribute('aria-label',drawerOpen?'메뉴 닫기':'메뉴 열기');
        drawer.setAttribute('aria-hidden',String(!drawerOpen));
        drawer.inert=!drawerOpen;
        drawer.classList.toggle('is-open',drawerOpen);
        backdrop.classList.toggle('is-open',drawerOpen);
        if(drawerOpen){previousFocus=document.activeElement;window.setTimeout(function(){var first=$('.drawer-link',drawer);if(first)first.focus();},180);}
        else if(previousFocus&&previousFocus.focus){previousFocus.focus();}
      }
      trigger.addEventListener('click',function(){setDrawer(!drawerOpen);});
      backdrop.addEventListener('click',function(){setDrawer(false);});
      $$('.drawer-link',drawer).forEach(function(a){a.addEventListener('click',function(){if(a.target!=='_blank')setDrawer(false);});});
      document.addEventListener('keydown',function(e){
        if(e.key==='Escape'&&drawerOpen){setDrawer(false);return;}
        if(e.key==='Tab'&&drawerOpen){
          var focusables=$$('a[href],button:not(:disabled)',drawer).filter(function(el){return el.offsetParent!==null;});
          if(!focusables.length)return;
          var first=focusables[0],last=focusables[focusables.length-1];
          if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
          else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
        }
      });

      var progress=$('#progressBar'),rafPending=false;
      function scrollUpdate(){
        var doc=document.documentElement,max=doc.scrollHeight-window.innerHeight;
        if(progress)progress.style.transform='scaleX('+(max>0?Math.max(0,Math.min(1,window.scrollY/max)):0)+')';
        rafPending=false;
      }
      window.addEventListener('scroll',function(){if(!rafPending){rafPending=true;requestAnimationFrame(scrollUpdate);}},{passive:true});
      window.addEventListener('resize',scrollUpdate,{passive:true});scrollUpdate();

      var revealObserver=null;
      if(!reduced&&'IntersectionObserver' in window){
        revealObserver=new IntersectionObserver(function(entries){
          entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});
        },{threshold:.08,rootMargin:'0px 0px -35px 0px'});
        $$('[data-reveal]').forEach(function(el){revealObserver.observe(el);});
      }else{$$('[data-reveal]').forEach(function(el){el.classList.add('is-visible');});}

      // Lightweight WebGL scene: custom-generated 3D knot, orbit ring and metal spheres.
      (function init3D(){
        var canvas=$('#hero3d');if(!canvas)return;
        var gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'})||canvas.getContext('experimental-webgl');
        if(!gl){canvas.style.display='none';return;}
        var vertexSource='attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uModel;uniform mat4 uVP;varying vec3 vNormal;varying vec3 vColor;varying vec3 vWorld;void main(){vec4 p=uModel*vec4(aPosition,1.0);vWorld=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);vColor=aColor;gl_Position=uVP*p;}';
        var fragmentSource='precision mediump float;varying vec3 vNormal;varying vec3 vColor;varying vec3 vWorld;void main(){vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-0.45,0.78,0.62));vec3 v=normalize(vec3(0.0,0.0,5.0)-vWorld);vec3 h=normalize(l+v);float d=max(dot(n,l),0.0);float s=pow(max(dot(n,h),0.0),38.0);float rim=pow(1.0-max(dot(n,v),0.0),2.0);vec3 c=vColor*(0.22+d*0.86)+vec3(1.0,0.71,0.39)*s*0.95+vec3(1.0,0.17,0.015)*rim*0.36;gl_FragColor=vec4(c,1.0);}';
        function shader(type,source){var s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
        var vs=shader(gl.VERTEX_SHADER,vertexSource),fs=shader(gl.FRAGMENT_SHADER,fragmentSource);
        if(!vs||!fs){canvas.style.display='none';return;}
        var program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS)){canvas.style.display='none';return;}
        gl.useProgram(program);
        var loc={p:gl.getAttribLocation(program,'aPosition'),n:gl.getAttribLocation(program,'aNormal'),c:gl.getAttribLocation(program,'aColor'),model:gl.getUniformLocation(program,'uModel'),vp:gl.getUniformLocation(program,'uVP')};
gl.enableVertexAttribArray(loc.p);gl.enableVertexAttribArray(loc.n);gl.enableVertexAttribArray(loc.c);
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
        function buildMesh(positions,normals,colors,indices){var mesh={count:indices.length};
          mesh.p=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
          mesh.n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);
          mesh.c=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.c);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);
          mesh.i=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);return mesh;}
        function knotMesh(segments,sides,tube){
          var p=[],n=[],c=[],ix=[];
          for(var i=0;i<=segments;i++){
            var u=i/segments*Math.PI*2,du=.001;
            function center(t){return [(1.05+.43*Math.cos(3*t))*Math.cos(2*t),(1.05+.43*Math.cos(3*t))*Math.sin(2*t),.48*Math.sin(3*t)];}
            var cp=center(u),cm=center(u-du),cn=center(u+du);
            var tangent=[cn[0]-cm[0],cn[1]-cm[1],cn[2]-cm[2]];
            var tl=Math.hypot(tangent[0],tangent[1],tangent[2])||1;tangent=tangent.map(function(v){return v/tl;});
            var ref=Math.abs(tangent[2])>.92?[0,1,0]:[0,0,1];
            var normal=[tangent[1]*ref[2]-tangent[2]*ref[1],tangent[2]*ref[0]-tangent[0]*ref[2],tangent[0]*ref[1]-tangent[1]*ref[0]];
            var nl=Math.hypot(normal[0],normal[1],normal[2])||1;normal=normal.map(function(v){return v/nl;});
            var binormal=[tangent[1]*normal[2]-tangent[2]*normal[1],tangent[2]*normal[0]-tangent[0]*normal[2],tangent[0]*normal[1]-tangent[1]*normal[0]];
            for(var j=0;j<=sides;j++){
              var v=j/sides*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v);
              var no=[normal[0]*cv+binormal[0]*sv,normal[1]*cv+binormal[1]*sv,normal[2]*cv+binormal[2]*sv];
              p.push(cp[0]+no[0]*tube,cp[1]+no[1]*tube,cp[2]+no[2]*tube);n.push(no[0],no[1],no[2]);
              var blend=(Math.sin(u*2.5+v*1.2)+1)/2;
              c.push(.78+.22*blend,.12+.37*blend,.012+.055*blend);
            }
          }
          for(var a=0;a<segments;a++)for(var b=0;b<sides;b++){var k=a*(sides+1)+b;ix.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
          return buildMesh(p,n,c,ix);
        }
        function torusMesh(R,r,segments,sides,color){
          var p=[],n=[],c=[],ix=[];
          for(var i=0;i<=segments;i++){var u=i/segments*Math.PI*2,cu=Math.cos(u),su=Math.sin(u);
            for(var j=0;j<=sides;j++){var v=j/sides*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v);
              var no=[cv*cu,cv*su,sv];p.push((R+r*cv)*cu,(R+r*cv)*su,r*sv);n.push(no[0],no[1],no[2]);
              var shine=(Math.sin(u*5)+1)/2;c.push(color[0]*(.7+.3*shine),color[1]*(.62+.38*shine),color[2]*(.75+.25*shine));
            }
          }
          for(var a=0;a<segments;a++)for(var b=0;b<sides;b++){var k=a*(sides+1)+b;ix.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
          return buildMesh(p,n,c,ix);
        }
        function sphereMesh(segments,rings,color){
          var p=[],n=[],c=[],ix=[];
          for(var y=0;y<=rings;y++){var vv=y/rings*Math.PI,sy=Math.cos(vv),sr=Math.sin(vv);
            for(var x=0;x<=segments;x++){var uu=x/segments*Math.PI*2,nx=sr*Math.cos(uu),nz=sr*Math.sin(uu);p.push(nx*sy,nx*0+sy,nz*sr*0+sr*Math.sin(uu));}
          }
          p=[];n=[];c=[];ix=[];
          for(var y=0;y<=rings;y++){var vv=y/rings*Math.PI,sy=Math.cos(vv),sr=Math.sin(vv);
            for(var x=0;x<=segments;x++){var uu=x/segments*Math.PI*2,nx=sr*Math.cos(uu),nz=sr*Math.sin(uu);var normal=[nx,sy,nz];p.push(nx,sy,nz);n.push(nx,sy,nz);var light=(sy+1)/2;c.push(color[0]*(.6+.4*light),color[1]*(.55+.45*light),color[2]*(.6+.4*light));}
          }
          for(var y=0;y<rings;y++)for(var x=0;x<segments;x++){var k=y*(segments+1)+x;ix.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}
          return buildMesh(p,n,c,ix);
        }
        var knot=knotMesh(180,22,.19);
        var orbit=torusMesh(1.95,.018,180,6,[.96,.43,.08]);
        var orbit2=torusMesh(2.2,.009,160,5,[.42,.31,.2]);
        var sphere=sphereMesh(18,12,[1,.33,.035]);
        function ident(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
        function mul(a,b){var o=new Float32Array(16);for(var col=0;col<4;col++)for(var row=0;row<4;row++){var sum=0;for(var k=0;k<4;k++)sum+=a[k*4+row]*b[col*4+k];o[col*4+row]=sum;}return o;}
        function tr(x,y,z){var m=ident();m[12]=x;m[13]=y;m[14]=z;return m;}
        function rx(a){var m=ident(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m;}
        function ry(a){var m=ident(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m;}
        function rz(a){var m=ident(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m;}
        function sc(x,y,z){var m=ident();m[0]=x;m[5]=y;m[10]=z;return m;}
        function perspective(fov,aspect,near,far){var f=1/Math.tan(fov/2),nf=1/(near-far),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)*nf;m[11]=-1;m[14]=2*far*near*nf;return m;}
        function draw(mesh,model,vp){gl.uniformMatrix4fv(loc.model,false,model);gl.uniformMatrix4fv(loc.vp,false,vp);
          gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,0,0);
          gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,0,0);
          gl.bindBuffer(gl.ARRAY_BUFFER,mesh.c);gl.vertexAttribPointer(loc.c,3,gl.FLOAT,false,0,0);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);
        }
        var w=0,h=0,mouseX=0,mouseY=0,aimX=0,aimY=0,last=0,frame=0,visible=true,rafId=0;
        function schedule(){if(!rafId)rafId=requestAnimationFrame(render);}
        var observer=('IntersectionObserver' in window)?new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(visible)schedule();}):null;
        if(observer)observer.observe(canvas);
        function resize(){var rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.5);var nextW=Math.max(1,Math.round(rect.width*dpr)),nextH=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==nextW||canvas.height!==nextH){w=nextW;h=nextH;canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}}
        if(window.matchMedia('(pointer:fine)').matches){
          $('#heroStage').addEventListener('pointermove',function(e){var r=this.getBoundingClientRect();aimX=((e.clientX-r.left)/r.width-.5)*.46;aimY=((e.clientY-r.top)/r.height-.5)*-.3;});
          $('#heroStage').addEventListener('pointerleave',function(){aimX=0;aimY=0;});
        }
        function render(now){
          rafId=0;
          if(document.hidden||(!visible&&observer)||document.body.classList.contains('video-modal-open'))return;
          if(now-last<30){schedule();return;}last=now;
          if(!w||!h)return;
          mouseX+=(aimX-mouseX)*.035;mouseY+=(aimY-mouseY)*.035;
          var t=(reduced||ldmEnabled)?0:now*.00022;
          gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
          var aspect=w/h,vp=perspective(Math.PI/3,aspect,.1,100);
          var fit=window.innerWidth<760?.88:1.14;
          var base=mul(tr(-.72,.08,-4.45),mul(ry(t*.6+mouseX),mul(rx(.52+t*.35+mouseY),sc(fit*1.12,fit*1.12,fit*1.12))));
          draw(knot,base,vp);
          var orb=mul(tr(-.62,.05,-4.45),mul(rz(-t*.8+mouseX*.3),mul(ry(.4),mul(rx(.95),sc(fit*1.35,fit*1.35,fit*1.35)))));
          draw(orbit,orb,vp);
          var orb2=mul(tr(-.62,.05,-4.45),mul(ry(t*.36),mul(rz(1.0),mul(rx(1.25),sc(fit*1.48,fit*1.48,fit*1.48)))));
          draw(orbit2,orb2,vp);
          var s1=mul(tr(-.62+1.85*Math.cos(t*.75),1.2*Math.sin(t*.75),-4.45+.4*Math.sin(t)),mul(ry(t),sc(.15,.15,.15)));
          draw(sphere,s1,vp);
          var s2=mul(tr(-.62-1.75*Math.cos(t*.52),1.4*Math.sin(t*.52),-4.45+.3*Math.cos(t)),mul(ry(-t),sc(.095,.095,.095)));
          draw(sphere,s2,vp);
          if(!reduced&&!ldmEnabled)schedule();
        }
        document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule();});
        window.addEventListener('ldmchange',function(){last=0;if(ldmEnabled){if(rafId){cancelAnimationFrame(rafId);rafId=0;}render(performance.now());}else schedule();});
        window.addEventListener('video-modalchange',function(){last=0;if(!document.hidden&&!document.body.classList.contains('video-modal-open'))schedule();else if(rafId){cancelAnimationFrame(rafId);rafId=0;}});
        window.addEventListener('resize',function(){resize();if(!reduced&&!ldmEnabled)schedule();},{passive:true});
        var canvasSizeObserver=('ResizeObserver' in window)?new ResizeObserver(function(){resize();}):null;
        if(canvasSizeObserver)canvasSizeObserver.observe(canvas);
        resize();schedule();
      })();


      // A single menu control moves above the drawer, so its own three strokes morph into an X.
      var fallback=[
        {id:'5D9M7hhDNlY',title:'영상 01',thumbnail_url:'https://i.ytimg.com/vi/5D9M7hhDNlY/hqdefault.jpg',url:'https://www.youtube.com/watch?v=5D9M7hhDNlY'},
        {id:'JupaczQCTFk',title:'영상 02',thumbnail_url:'https://i.ytimg.com/vi/JupaczQCTFk/hqdefault.jpg',url:'https://www.youtube.com/watch?v=JupaczQCTFk&t=1s'}
      ];
      var videos=[],nextContinuation='',loading=false,seen={},filtered=[];
      var grid=$('#videoGrid'),count=$('#videoCount'),status=$('#archiveStatus'),loadWrap=$('#videoLoadWrap'),loadButton=$('#loadMore'),search=$('#videoSearch');

      var storySection=$('#showreel'),storySticky=$('#storySticky'),storyTrack=$('#storyTrack');
      var storyCurrent=$('#storyCurrent'),storyTotal=$('#storyTotal'),storyProgress=$('#storyProgress'),storyProgressDot=$('#storyProgressDot');
      var storyRaf=false,storyPanels=[],storyPanelCenters=[],storyMaxTranslate=0,storySectionTop=0,storyScrollRange=0,storyViewportWidth=0,activeStoryPanelIndex=-1;
      function updateStoryPanelState(progress){
        if(!storyTrack)return;
        var center=storyMaxTranslate*progress+storyViewportWidth/2;
        var nearest=0,nearestDistance=Infinity;
        for(var i=0;i<storyPanelCenters.length;i++){
          var d=Math.abs(storyPanelCenters[i]-center);
          if(d<nearestDistance){nearestDistance=d;nearest=i;}
        }
        if(nearest!==activeStoryPanelIndex){
          if(activeStoryPanelIndex>=0&&storyPanels[activeStoryPanelIndex])storyPanels[activeStoryPanelIndex].classList.remove('is-active');
          if(storyPanels[nearest])storyPanels[nearest].classList.add('is-active');
          activeStoryPanelIndex=nearest;
        }
        var currentText=String(nearest+1).padStart(2,'0');
        var totalText=String(storyPanels.length).padStart(2,'0');
        if(storyCurrent&&storyCurrent.textContent!==currentText)storyCurrent.textContent=currentText;
        if(storyTotal&&storyTotal.textContent!==totalText)storyTotal.textContent=totalText;
        var pct=Math.max(0,Math.min(1,progress||0));
        if(storyProgress)storyProgress.style.transform='scaleX('+Math.max(.02,pct)+')';
        if(storyProgressDot)storyProgressDot.style.left=(pct*100)+'%';
      }
      function fitStory(){
        if(!storySection||!storySticky||!storyTrack)return;
        var sectionRect=storySection.getBoundingClientRect();
        storySectionTop=sectionRect.top+window.scrollY;
        var stickyHeight=storySticky.clientHeight;
        storyViewportWidth=storySticky.clientWidth;
        storyMaxTranslate=Math.max(0,storyTrack.scrollWidth-storyViewportWidth);
        storyScrollRange=storyMaxTranslate;
        storyPanels=Array.prototype.slice.call(storyTrack.querySelectorAll('[data-story-item],.story-panel--video'));
        storyPanelCenters=storyPanels.map(function(panel){return panel.offsetLeft+panel.offsetWidth/2;});
        activeStoryPanelIndex=-1;
        storySection.style.height=(stickyHeight+storyMaxTranslate)+'px';
        var progress=storyScrollRange>0?Math.max(0,Math.min(1,(window.scrollY-storySectionTop)/storyScrollRange)):0;
        storyTrack.style.transform='translate3d('+(-storyMaxTranslate*progress)+'px,0,0)';
        updateStoryPanelState(progress);
      }
      function scheduleStoryUpdate(){
        if(storyRaf)return;
        storyRaf=true;
        requestAnimationFrame(function(){
          storyRaf=false;
          if(!storySection||!storySticky||!storyTrack)return;
          var p=storyScrollRange>0?Math.max(0,Math.min(1,(window.scrollY-storySectionTop)/storyScrollRange)):0;
          storyTrack.style.transform='translate3d('+(-storyMaxTranslate*p)+'px,0,0)';
          updateStoryPanelState(p);
        });
      }
      window.addEventListener('scroll',scheduleStoryUpdate,{passive:true});
      window.addEventListener('resize',function(){fitStory();},{passive:true});
      window.addEventListener('load',function(){fitStory();},{once:true});
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){fitStory();});
      if('ResizeObserver' in window&&storyTrack){
        var storyResize=new ResizeObserver(function(){fitStory();});
        storyResize.observe(storyTrack);
      }
      // Pause hidden horizontal panels while keeping their original animation clocks,
      // durations and easing. The animation resumes in the same state when visible.
      if(storySection&&storySticky&&'IntersectionObserver' in window){
        var storyVisibilityObserver=new IntersectionObserver(function(entries){
          var entry=entries[0];
          storySection.classList.toggle('story-in-view',!!(entry&&entry.isIntersecting));
        },{threshold:0});
        storyVisibilityObserver.observe(storySticky);
      }else if(storySection){
        storySection.classList.add('story-in-view');
      }
      function renderStoryVideos(){ if(storyTrack)fitStory(); }

      var playSvg='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z"/></svg>';
      function create(tag,cls,text){var node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
      function normalize(v){
        return {id:v.id||'',title:v.title||'',thumbnail_url:v.thumbnail_url||('https://i.ytimg.com/vi/'+encodeURIComponent(v.id)+'/hqdefault.jpg'),url:v.url||('https://www.youtube.com/watch?v='+encodeURIComponent(v.id)),publishedText:v.publishedText||'',published:v.published||''};
      }
      function observeCard(card){
        if(!reduced&&'IntersectionObserver' in window){
          var ob=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');ob.unobserve(entry.target);}});},{threshold:.06,rootMargin:'0px 0px -25px 0px'});
          ob.observe(card);
        }else{card.classList.add('is-visible');}
      }
      function setVideoThumbnail(img,video){
        var id=video&&video.id;
        if(!img||!id)return;
        var candidates=[
          'https://i.ytimg.com/vi/'+encodeURIComponent(id)+'/hqdefault.jpg',
          'https://i.ytimg.com/vi/'+encodeURIComponent(id)+'/mqdefault.jpg',
          'https://i.ytimg.com/vi/'+encodeURIComponent(id)+'/default.jpg',
          'https://i.ytimg.com/vi_webp/'+encodeURIComponent(id)+'/hqdefault.webp'
        ];
        img.dataset.thumbnailAttempt='0';
        img.onerror=function(){
          var next=Number(img.dataset.thumbnailAttempt||0)+1;
          img.dataset.thumbnailAttempt=String(next);
          if(next<candidates.length)img.src=candidates[next];
          else img.onerror=null;
        };
        img.src=video.thumbnail_url||candidates[0];
      }
      function cardFor(video,index){
        var card=create('div','video-card'),frame=create('div','video-frame');
        frame.setAttribute('role','button');frame.tabIndex=0;frame.dataset.videoId=video.id;frame.dataset.videoTitle=video.title||'';frame.setAttribute('aria-label',(video.title||'영상')+' 페이지 안에서 재생');
        var img=document.createElement('img');setVideoThumbnail(img,video);img.alt=(video.title||'영상')+' 썸네일';img.loading='lazy';img.decoding='async';frame.appendChild(img);
        frame.appendChild(create('span','video-index',String(index+1).padStart(2,'0')));
        var play=create('span','video-play');play.innerHTML=playSvg;frame.appendChild(play);card.appendChild(frame);
        var text=create('div','video-card-text'),title=create('div','video-card-title',video.title||'유튜브 영상');
        if(video.publishedText)title.appendChild(create('span','video-card-date',video.publishedText));
        else if(video.published){var date=new Date(video.published);if(!isNaN(date.getTime()))title.appendChild(create('span','video-card-date',date.toLocaleDateString('ko-KR',{year:'numeric',month:'short',day:'numeric'})));}
        text.appendChild(title);
        var external=create('a','video-card-arrow','↗');external.href=video.url||('https://www.youtube.com/watch?v='+encodeURIComponent(video.id));external.target='_blank';external.rel='noopener noreferrer';external.setAttribute('aria-label','유튜브에서 영상 열기');external.title='유튜브에서 열기';
        text.appendChild(external);card.appendChild(text);observeCard(card);return card;
      }
      function renderVideos(){
        renderStoryVideos();
        var query=(search.value||'').trim().toLocaleLowerCase();
        filtered=videos.filter(function(v){return !query||(v.title||'').toLocaleLowerCase().includes(query);});
        grid.textContent='';
        if(!filtered.length){grid.appendChild(create('div','video-empty',query?'검색 결과가 없습니다.':'공개된 영상이 없습니다.'));}
        else filtered.forEach(function(v,i){grid.appendChild(cardFor(v,i));});
        count.textContent=String(videos.length).padStart(2,'0');
        status.textContent=query?'검색 결과 '+filtered.length+'개':(nextContinuation?'채널 영상 · 계속해서 불러올 수 있습니다':'채널 영상');
        loadWrap.hidden=!nextContinuation||!!query;
      }
      function addVideos(list){
        (Array.isArray(list)?list:[]).forEach(function(raw){
          var v=normalize(raw);if(!v.id||seen[v.id])return;seen[v.id]=true;videos.push(v);
        });
      }
      var videoModal=$('#videoModal'),videoDialog=$('#videoDialog'),videoModalFrame=$('#videoModalFrame'),videoModalTitle=$('#videoModalTitle'),videoModalExternal=$('#videoModalExternal'),videoModalId=$('#videoModalId');
      var ldmToggle=$('#ldmToggle'),ldmStatus=$('#ldmStatus'),ldmSuggestion=$('#ldmSuggestion'),ldmSuggestionDetail=$('#ldmSuggestionDetail');
      var ldmToggleCount=0,cssEasterEggTriggered=false;
      function triggerCssEasterEgg(){
        if(cssEasterEggTriggered)return;
        cssEasterEggTriggered=true;
        document.querySelectorAll('link[rel~="stylesheet"],style').forEach(function(node){
          try{if(node.sheet)node.sheet.disabled=true;}catch(_){}
          if(node.tagName==='LINK')node.disabled=true;
          else node.media='not all';
        });
        document.querySelectorAll('[style]').forEach(function(node){node.removeAttribute('style');});
      }
      var carouselIndex=0,heroTransitionBusy=false,modalReturnFocus=null,modalCloseTimer=0,modalOpen=false;
      var heroTransitionTimers=[];
      function clearHeroTransitionTimers(){(heroTransitionTimers||[]).forEach(function(timer){window.clearTimeout(timer);});heroTransitionTimers=[];}
      function scheduleHeroTransitionTimeout(callback,delay){var timer=window.setTimeout(function(){heroTransitionTimers=heroTransitionTimers.filter(function(item){return item!==timer;});callback();},delay);heroTransitionTimers.push(timer);return timer;}
      function settleHeroCarouselForLdm(){
        if(!heroTransitionBusy)return;
        clearHeroTransitionTimers();
        var cards=$$('#heroStage .feature-card, #heroStage .float-card');
        if(cards.length<2){heroTransitionBusy=false;return;}
        cards.forEach(function(card){card.classList.remove('hero-handoff-flight');card.removeAttribute('style');});
        var current=videos[carouselIndex],following=videos.length>1?videos[(carouselIndex+1)%videos.length]:null;
        if(current)renderHeroRole(cards[0],current,'main',true,false);
        if(following)renderHeroRole(cards[1],following,'small',true,false);
        heroTransitionBusy=false;
      }
      function setLdmEnabled(enabled){
        ldmEnabled=!!enabled;
        document.body.classList.toggle('ldm-mode',ldmEnabled);
        if(ldmEnabled)settleHeroCarouselForLdm();
        if(ldmToggle){ldmToggle.setAttribute('aria-pressed',String(ldmEnabled));ldmToggle.setAttribute('aria-label',ldmEnabled?'LDM 저사양 모드 끄기':'LDM 저사양 모드 켜기');}
        if(ldmStatus)ldmStatus.textContent=ldmEnabled?'켬':'끔';
        try{window.localStorage.setItem('muntang-ldm',ldmEnabled?'1':'0');}catch(_){}
        if(ldmEnabled&&ldmSuggestion)ldmSuggestion.hidden=true;
        window.dispatchEvent(new Event('ldmchange'));
        if(!ldmEnabled)startFpsMonitor();
      }
      function openVideoModal(card,id,title){
        if(!id||!/^[A-Za-z0-9_-]{11}$/.test(id)||!videoModal||!videoModalFrame)return;
        if(modalCloseTimer){window.clearTimeout(modalCloseTimer);modalCloseTimer=0;}
        modalReturnFocus=card||document.activeElement;
        if(videoModalTitle)videoModalTitle.textContent=title||'유튜브 영상';
        if(videoModalExternal)videoModalExternal.href='https://www.youtube.com/watch?v='+encodeURIComponent(id);
        if(videoModalId)videoModalId.textContent='VIDEO / '+id;
        videoModalFrame.title=(title||'유튜브 영상')+' 플레이어';
        videoModalFrame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0&playsinline=1&controls=1';
        videoModal.hidden=false;
        videoModal.setAttribute('aria-hidden','false');
        document.body.classList.add('video-modal-open');
        modalOpen=true;
        window.dispatchEvent(new Event('video-modalchange'));
        requestAnimationFrame(function(){videoModal.classList.add('is-open');});
        window.setTimeout(function(){if(modalOpen&&videoDialog)videoDialog.focus({preventScroll:true});},80);
      }
      function closeVideoModal(){
        if(!videoModal||videoModal.hidden)return;
        modalOpen=false;
        videoModal.classList.remove('is-open');
        videoModal.setAttribute('aria-hidden','true');
        document.body.classList.remove('video-modal-open');
        window.dispatchEvent(new Event('video-modalchange'));
        if(modalCloseTimer)window.clearTimeout(modalCloseTimer);
        modalCloseTimer=window.setTimeout(function(){
          videoModal.hidden=true;
          videoModalFrame.src='about:blank';
          syncHeroCarouselClock();
          modalCloseTimer=0;
          if(modalReturnFocus&&modalReturnFocus.isConnected&&modalReturnFocus.focus)modalReturnFocus.focus({preventScroll:true});
          modalReturnFocus=null;
        },ldmEnabled?0:360);
      }
      videoModal.addEventListener('click',function(event){
        if(event.target===videoModal||event.target.closest('[data-modal-dismiss]'))closeVideoModal();
      });
      $('#videoModalClose').addEventListener('click',closeVideoModal);
      document.addEventListener('click',function(event){
        if(event.target.closest&&event.target.closest('[data-external-video]'))return;
        var card=event.target.closest&&event.target.closest('[data-video-id]');
        if(!card)return;
        event.preventDefault();
        openVideoModal(card,card.dataset.videoId,card.dataset.videoTitle||card.getAttribute('aria-label')||'유튜브 영상');
      });
      document.addEventListener('keydown',function(event){
        if(event.key==='Escape'&&modalOpen){event.preventDefault();closeVideoModal();return;}
        if(modalOpen&&event.key==='Tab'&&videoDialog){
          var focusables=$$('button:not(:disabled),a[href],iframe',videoDialog).filter(function(el){return el.offsetParent!==null;});
          if(focusables.length){
            var first=focusables[0],last=focusables[focusables.length-1];
            if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
          }
          return;
        }
        var hero=event.target.closest&&event.target.closest('#heroVideo,#heroPeek');
        if(hero&&(event.key==='Enter'||event.key===' ')){event.preventDefault();hero.click();}
        var frame=event.target.closest&&event.target.closest('.video-frame[role="button"]');
        if(frame&&(event.key==='Enter'||event.key===' ')){event.preventDefault();frame.click();}
      });
      if(ldmToggle)ldmToggle.addEventListener('click',function(){ldmToggleCount++;setLdmEnabled(!ldmEnabled);if(ldmToggleCount>=10)triggerCssEasterEgg();});
      $('#ldmSuggestionEnable').addEventListener('click',function(){setLdmEnabled(true);});
      $('#ldmSuggestionDismiss').addEventListener('click',function(){if(ldmSuggestion)ldmSuggestion.hidden=true;fpsPromptDismissed=true;});
      if(ldmEnabled)setLdmEnabled(true);
      var fpsWatchRunning=false,fpsLast=0,fpsFrames=0,fpsLowWindows=0,fpsPromptDismissed=false,fpsLastEstimate=60;
      function startFpsMonitor(){
        if(fpsWatchRunning||ldmEnabled||document.hidden)return;
        fpsWatchRunning=true;fpsLast=0;fpsFrames=0;fpsLowWindows=0;
        requestAnimationFrame(sampleFrameRate);
      }
      function sampleFrameRate(now){
        if(ldmEnabled||document.hidden){fpsWatchRunning=false;fpsLast=0;fpsFrames=0;return;}
        if(!fpsLast){fpsLast=now;fpsFrames=0;requestAnimationFrame(sampleFrameRate);return;}
        fpsFrames++;
        var elapsed=now-fpsLast;
        if(elapsed>=2500){
          fpsLastEstimate=Math.round(fpsFrames*1000/elapsed);
          fpsLast=now;fpsFrames=0;
          if(fpsLastEstimate<42)fpsLowWindows++;else fpsLowWindows=0;
          if(fpsLowWindows>=2&&!fpsPromptDismissed&&ldmSuggestion&&!modalOpen){
            ldmSuggestionDetail.textContent='현재 약 '+fpsLastEstimate+' FPS예요. LDM을 켤까요?';
            ldmSuggestion.hidden=false;
          }
        }
        requestAnimationFrame(sampleFrameRate);
      }
      document.addEventListener('visibilitychange',function(){
        if(document.hidden){fpsWatchRunning=false;fpsLast=0;fpsFrames=0;}
        else if(!ldmEnabled)startFpsMonitor();
      });
      startFpsMonitor();
      function renderHeroRole(card,video,role,suppressEntrance,stagedUI){
        if(!card||!video)return;
        var keepFlight=card.classList.contains('hero-handoff-flight');
        var main=role==='main';
        card.id=main?'heroVideo':'heroPeek';
        card.className=main?'feature-card':'float-card';
        if(keepFlight)card.classList.add('hero-handoff-flight');
        if(suppressEntrance)card.classList.add('hero-card-live');
        var retainedImage=card.querySelector('img');
        card.removeAttribute('href');
        card.dataset.videoId=video.id;
        card.dataset.videoTitle=video.title||'';
        card.setAttribute('role','button');
        card.setAttribute('tabindex','0');
        card.setAttribute('aria-label',(video.title||'영상')+' 재생');
        card.textContent='';
        var imageWrap=create('div',main?'feature-image':'float-image');
        if(stagedUI&&!main)imageWrap.classList.add('hero-preview-enter');
        var image=(retainedImage&&(retainedImage.getAttribute('src')===video.thumbnail_url||retainedImage.src===video.thumbnail_url))?retainedImage:document.createElement('img');
        image.id=main?'heroThumbnail':'peekThumbnail';
        setVideoThumbnail(image,video);
        image.alt=(video.title||'영상')+' 썸네일';
        image.decoding='async';
        imageWrap.appendChild(image);
        if(main){
          var play=create('span','feature-play');
          play.innerHTML=playSvg;
          if(stagedUI)play.classList.add('hero-ui-enter','hero-play-enter');
          imageWrap.appendChild(play);
        }else{
          imageWrap.appendChild(create('span','float-orb',''));
        }
        card.appendChild(imageWrap);
        if(main){
          var info=create('div','feature-info');
          var title=create('div','feature-title',video.title||'유튜브 영상');
          title.id='heroTitle';
          if(stagedUI)title.classList.add('hero-ui-enter','hero-title-enter');
          info.appendChild(title);
          var external=create('a','feature-arrow','↗');
          external.href='https://www.youtube.com/watch?v='+encodeURIComponent(video.id);
          external.target='_blank';
          external.rel='noopener noreferrer';
          external.dataset.externalVideo='true';
          external.setAttribute('aria-label','유튜브에서 영상 보기');
          if(stagedUI)external.classList.add('hero-ui-enter','hero-arrow-enter');
          info.appendChild(external);
          card.appendChild(info);
        }else{
          var infoSmall=create('div','float-info');
          var smallTitle=create('span','peek-video-title',video.title||'유튜브 영상');
          smallTitle.id='peekTitle';
          var no=create('span','float-index','');
          no.id='peekIndex';
          infoSmall.appendChild(smallTitle);
          infoSmall.appendChild(no);
          if(stagedUI){infoSmall.classList.add('hero-preview-enter');smallTitle.classList.add('hero-preview-enter');no.classList.add('hero-preview-enter');}
          card.appendChild(infoSmall);
        }
        if(stagedUI){
          requestAnimationFrame(function(){
            requestAnimationFrame(function(){
              card.querySelectorAll('.hero-ui-enter,.hero-preview-enter').forEach(function(node){node.classList.add('is-entered');});
            });
          });
        }
      }
      function setFeature(video,peek){
        if(!video)return;
        var main=$('#heroVideo'),small=$('#heroPeek'),index=videos.findIndex(function(item){return item.id===video.id;});carouselIndex=Math.max(0,index);
        if(!peek&&videos.length>1)peek=videos[(carouselIndex+1)%videos.length];
        renderHeroRole(main,video,'main',false);if(peek)renderHeroRole(small,peek,'small',false);
        $('#heroIndex').textContent=String(carouselIndex+1).padStart(2,'0');$('#heroTotal').textContent=String(videos.length).padStart(2,'0');
        if(peek)$('#peekIndex').textContent=String((videos.findIndex(function(item){return item.id===peek.id;})+1)||2).padStart(2,'0');
      }
      function advanceHero(){
        if(heroTransitionBusy||videos.length<2||document.visibilityState==='hidden')return false;
        if(modalOpen||document.body.classList.contains('video-modal-open'))return false;
        var main=$('#heroVideo'),small=$('#heroPeek');
        if(!main||!small)return false;
        var nextIndex=(carouselIndex+1)%videos.length;
        var nextVideo=videos[nextIndex],following=videos[(nextIndex+1)%videos.length];
        if(ldmEnabled){
          carouselIndex=nextIndex;
          setFeature(nextVideo,following);
          return true;
        }
        preloadHeroThumbnail(following);
        var origin={left:small.offsetLeft,top:small.offsetTop,width:small.offsetWidth,height:small.offsetHeight};
        var target={left:main.offsetLeft,top:main.offsetTop,width:main.offsetWidth,height:main.offsetHeight};
        heroTransitionBusy=true;
        // Update the counter as soon as the next card starts moving.
        carouselIndex=nextIndex;
        var heroIndexNode=$('#heroIndex');
        if(heroIndexNode)heroIndexNode.textContent=String(nextIndex+1).padStart(2,'0');
        small.style.position='absolute';
        small.style.left=origin.left+'px';small.style.top=origin.top+'px';
        small.style.right='auto';small.style.bottom='auto';
        small.style.width=origin.width+'px';small.style.height=origin.height+'px';
        small.style.margin='0';small.style.boxSizing='border-box';
        small.style.transformOrigin='center center';
        small.style.transform='rotate(-9deg)';
        small.style.transition='none';
        small.style.animation='none';
        small.style.zIndex='12';
        small.style.pointerEvents='none';
        void small.offsetWidth;
        small.style.transition='left .82s cubic-bezier(.2,.8,.2,1),top .82s cubic-bezier(.2,.8,.2,1),width .82s cubic-bezier(.2,.8,.2,1),height .82s cubic-bezier(.2,.8,.2,1),transform .82s cubic-bezier(.2,.8,.2,1),padding .82s cubic-bezier(.2,.8,.2,1),box-shadow .82s cubic-bezier(.2,.8,.2,1)';
        small.classList.add('hero-handoff-flight');
        main.style.transition='opacity .62s ease,transform .82s cubic-bezier(.2,.8,.2,1)';
        main.style.pointerEvents='none';
        requestAnimationFrame(function(){
          small.style.left=target.left+'px';small.style.top=target.top+'px';
          small.style.width=target.width+'px';small.style.height=target.height+'px';
          small.style.transform='rotateY(-10deg) rotateZ(2.1deg)';
          main.style.opacity='0';
          main.style.transform='translate3d(-14px,8px,0) scale(.975)';
        });
        scheduleHeroTransitionTimeout(function(){
          var oldInfo=small.querySelector('.float-info');
          var oldOrb=small.querySelector('.float-orb');
          [oldInfo,oldOrb].forEach(function(node){
            if(!node)return;
            node.style.transition='opacity .18s ease,transform .22s ease,filter .22s ease';
            node.style.opacity='0';
            node.style.transform='translate3d(0,8px,0) scale(.94)';
            node.style.filter='blur(3px)';
          });
        },500);
        scheduleHeroTransitionTimeout(function(){
          main.id='heroVideo-outgoing';
          renderHeroRole(small,nextVideo,'main',true,true);
        },620);
        scheduleHeroTransitionTimeout(function(){
          small.classList.remove('hero-handoff-flight');
          small.removeAttribute('style');
          main.removeAttribute('style');
          main.id='heroPeek';
          renderHeroRole(main,following,'small',true,true);
          main.style.opacity='0';
          main.style.transform='translate3d(0,13px,0) scale(.9) rotate(-5deg)';
          main.style.transition='opacity .48s ease,transform .58s cubic-bezier(.2,.8,.2,1)';
          requestAnimationFrame(function(){
            main.style.opacity='1';
            main.style.transform='rotate(-9deg)';
          });
          var heroTotalNode=$('#heroTotal'),peekIndexNode=$('#peekIndex');
          if(heroTotalNode)heroTotalNode.textContent=String(videos.length).padStart(2,'0');
          if(peekIndexNode)peekIndexNode.textContent=String((videos.findIndex(function(item){return item.id===following.id;})+1)||1).padStart(2,'0');
          preloadHeroThumbnail(videos[(carouselIndex+2)%videos.length]);
          scheduleHeroTransitionTimeout(function(){
            main.removeAttribute('style');
            heroTransitionBusy=false;
          },620);
        },900);
        return true;
      }
      var heroPreloadedThumbnails=Object.create(null);
      function preloadHeroThumbnail(video){
        if(!video||!video.id||!video.thumbnail_url||heroPreloadedThumbnails[video.id])return;
        var image=new Image();
        image.decoding='async';
        heroPreloadedThumbnails[video.id]=image;
        image.src=video.thumbnail_url;
        if(image.decode)image.decode().catch(function(){});
      }
      var HERO_CYCLE_DURATION=6400,heroTimer=0,heroClockRunning=false,heroCycleStartedAt=0,heroElapsed=0,heroCarouselInitialized=false;
      function paintHeroProgress(fraction){
        var progress=$('#heroTimerProgress');
        if(progress)progress.style.transform='scaleX('+Math.max(0,Math.min(1,fraction||0))+')';
      }
      function pauseHeroCarouselClock(){
        if(!heroClockRunning)return;
        var now=performance.now();
        if(heroCycleStartedAt)heroElapsed=Math.min(HERO_CYCLE_DURATION,Math.max(0,heroElapsed+now-heroCycleStartedAt));
        heroCycleStartedAt=0;
        heroClockRunning=false;
        if(heroTimer)cancelAnimationFrame(heroTimer);
        heroTimer=0;
        paintHeroProgress(heroElapsed/HERO_CYCLE_DURATION);
      }
      function heroCarouselTick(now){
        if(!heroClockRunning)return;
        if(document.hidden||modalOpen||(videoModal&&!videoModal.hidden)){
          pauseHeroCarouselClock();
          return;
        }
        var elapsed=heroElapsed+Math.max(0,now-heroCycleStartedAt);
        if(elapsed>=HERO_CYCLE_DURATION){
          if(advanceHero()){
            heroElapsed=0;
            heroCycleStartedAt=now;
            paintHeroProgress(0);
          }else{
            heroElapsed=HERO_CYCLE_DURATION;
            heroCycleStartedAt=now;
            paintHeroProgress(1);
          }
        }else{
          paintHeroProgress(elapsed/HERO_CYCLE_DURATION);
        }
        heroTimer=requestAnimationFrame(heroCarouselTick);
      }
      function syncHeroCarouselClock(){
        if(!heroCarouselInitialized)return;
        var blocked=document.hidden||modalOpen||(videoModal&&!videoModal.hidden);
        if(blocked){pauseHeroCarouselClock();return;}
        if(heroClockRunning)return;
        heroClockRunning=true;
        heroCycleStartedAt=performance.now();
        heroTimer=requestAnimationFrame(heroCarouselTick);
      }
      function startHeroCarousel(){
        if(videos.length>2)preloadHeroThumbnail(videos[(carouselIndex+2)%videos.length]);
        heroCarouselInitialized=true;
        heroElapsed=0;
        heroCycleStartedAt=0;
        paintHeroProgress(0);
        syncHeroCarouselClock();
      }
      // One clock drives both the progress bar and image handoff.
      window.addEventListener('ldmchange',syncHeroCarouselClock);
      window.addEventListener('video-modalchange',syncHeroCarouselClock);
      document.addEventListener('visibilitychange',syncHeroCarouselClock);


      async function loadMore(initial){
        if(loading||(!initial&&!nextContinuation))return;
        loading=true;if(loadButton){loadButton.disabled=true;loadButton.textContent='불러오는 중…';}
        try{
          var endpoint='/api/youtube';
          if(!initial){endpoint+='?continuation='+encodeURIComponent(nextContinuation);}
          var response=await fetch(endpoint,{headers:{'Accept':'application/json'}});
          if(!response.ok)throw new Error('video source unavailable');
          var data=await response.json();
          if(initial){
            var all=Array.isArray(data.videos)?data.videos:[];
            if(!all.length)all=(Array.isArray(data.recent)?data.recent:[]);
            if(!all.length)all=Array.isArray(data.featured)?data.featured:[];
            addVideos(all);
            if(data.featured&&data.featured.length){
              var first=videos.find(function(v){return v.id===data.featured[0].id;})||normalize(data.featured[0]);
              setFeature(first);
            }else if(videos.length)setFeature(videos[0]);
          }else{addVideos(data.videos||[]);}
          nextContinuation=data.nextContinuation||'';
          if(!videos.length)addVideos(fallback);
          renderVideos();
        }catch(error){
          if(initial&&!videos.length){addVideos(fallback);setFeature(videos[0]);renderVideos();status.textContent='공유된 영상';}
          else if(loadButton)loadButton.textContent='다시 시도';
        }finally{
          loading=false;
          if(loadButton){loadButton.disabled=false;loadButton.innerHTML='더 많은 영상 <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14m-7-7 7 7 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
          if(initial&&videos.length>1)startHeroCarousel();
        }
      }
      if(search)search.addEventListener('input',renderVideos);
      if(loadButton)loadButton.addEventListener('click',function(){loadMore(false);});
      renderStoryVideos();
      loadMore(true);
      fitStory();
    })();
  