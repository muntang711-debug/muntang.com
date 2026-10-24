export function initScene(query, isReduced, isLowDetail) {
const $ = query;

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
          if(document.hidden||(!visible&&observer)||(document.body.classList.contains('video-playing')||document.body.classList.contains('drawer-open')))return;
          if(now-last<30){schedule();return;}last=now;
          if(!w||!h)return;
          mouseX+=(aimX-mouseX)*.035;mouseY+=(aimY-mouseY)*.035;
          var t=(isReduced()||isLowDetail())?0:now*.00022;
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
          if(!isReduced()&&!isLowDetail())schedule();
        }
        document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule();});
        window.addEventListener('ldmchange',function(){last=0;if(isLowDetail()){if(rafId){cancelAnimationFrame(rafId);rafId=0;}render(performance.now());}else schedule();});
        window.addEventListener('scene-visibilitychange',function(){last=0;if(!document.hidden&&!document.body.classList.contains('video-playing')&&!document.body.classList.contains('drawer-open'))schedule();else if(rafId){cancelAnimationFrame(rafId);rafId=0;}});
        window.addEventListener('resize',function(){resize();if(!isReduced()&&!isLowDetail())schedule();},{passive:true});
        var canvasSizeObserver=('ResizeObserver' in window)?new ResizeObserver(function(){resize();}):null;
        if(canvasSizeObserver)canvasSizeObserver.observe(canvas);
        resize();schedule();

}
