import * as THREE from './assets/three.module.min.js';
const canvas=document.querySelector('#artifact'), stage=document.querySelector('#artifact-stage'), control=document.querySelector('#artifact-control');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const intro=document.querySelector('#site-intro');
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(37,1,.1,50);camera.position.set(0,.1,7);
// A generated studio environment gives the metal a broad, readable reflection.
const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;const envCtx=envCanvas.getContext('2d');const envGradient=envCtx.createLinearGradient(0,0,0,512);envGradient.addColorStop(0,'#b9c8e2');envGradient.addColorStop(.45,'#667a98');envGradient.addColorStop(.52,'#111c2b');envGradient.addColorStop(1,'#364a67');envCtx.fillStyle=envGradient;envCtx.fillRect(0,0,1024,512);envCtx.fillStyle='#e9edf5';envCtx.fillRect(110,35,170,150);envCtx.fillStyle='#a7b8ea';envCtx.fillRect(700,70,80,250);const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromEquirectangular(envTexture);scene.environment=environment.texture;envTexture.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xb5c8eb,0x151c2c,2));const key=new THREE.DirectionalLight(0xd5e1ff,4);key.position.set(-3,5,4);scene.add(key);const rim=new THREE.DirectionalLight(0x7e9cec,4);rim.position.set(4,1,-2);scene.add(rim);const warm=new THREE.DirectionalLight(0xc7bba5,1.4);warm.position.set(-2,-2,3);scene.add(warm);
const pivot=new THREE.Group();pivot.rotation.set(.3,-.4,-.35);pivot.position.set(-.05,-.05,0);scene.add(pivot);
const geometry=new THREE.TorusKnotGeometry(1.02,.29,144,4,2,3);geometry.computeVertexNormals();
const uniform={uBrush:{value:new THREE.Vector3(0,0,1)},uExposure:{value:0},uTime:{value:0},uRadius:{value:1.1},uPointColor:{value:new THREE.Vector3(.55,.67,.86)},uPointHighlight:{value:new THREE.Vector3(.9,.86,.73)}};
const erosion='float brushDistance=length(vRest-uBrush)/uRadius; float grainNoise=sin(vRest.x*19.0+sin(vRest.z*13.0))*sin(vRest.y*17.0)*0.07; float threshold=brushDistance+grainNoise;';
const material=new THREE.MeshPhysicalMaterial({color:0x93a0b8,metalness:.8,roughness:.35,clearcoat:.25,flatShading:true});
material.onBeforeCompile=shader=>{Object.assign(shader.uniforms,uniform);shader.vertexShader='varying vec3 vRest;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRest=position;');shader.fragmentShader='uniform vec3 uBrush;uniform float uExposure;uniform float uRadius;varying vec3 vRest;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n'+erosion+'\nif(uExposure>0.005 && threshold<uExposure) discard;');};
const mesh=new THREE.Mesh(geometry,material);pivot.add(mesh);
// Retain the intact geometry as a stable picking target through the dissolve.
const pickMesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({visible:false}));pivot.add(pickMesh);
const wireMat=new THREE.LineBasicMaterial({color:0xb5c5e9,transparent:true,opacity:.065});const wire=new THREE.LineSegments(new THREE.WireframeGeometry(geometry),wireMat);pivot.add(wire);
// Triangle area weighting keeps surface density even across the knot.
const source=geometry.index?geometry.toNonIndexed():geometry.clone();const positions=source.attributes.position,normals=source.attributes.normal;const areas=[],triangles=[];let total=0;const va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3(),cross=new THREE.Vector3();
for(let i=0;i<positions.count;i+=3){va.fromBufferAttribute(positions,i);vb.fromBufferAttribute(positions,i+1);vc.fromBufferAttribute(positions,i+2);cross.subVectors(vb,va).cross(new THREE.Vector3().subVectors(vc,va));total+=cross.length()*.5;areas.push(total);triangles.push(i);}
const count=matchMedia('(max-width:760px)').matches?11000:24000;const pointPositions=new Float32Array(count*3),pointNormals=new Float32Array(count*3),seeds=new Float32Array(count);
let seed=46721;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
for(let i=0;i<count;i++){const target=random()*total;let lo=0,hi=areas.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(areas[mid]<target)lo=mid+1;else hi=mid;}const tri=triangles[lo],u=Math.sqrt(random()),v=random(),weights=[1-u,u*(1-v),u*v];for(let c=0;c<3;c++){let p=0,n=0;for(let k=0;k<3;k++){p+=positions.array[(tri+k)*3+c]*weights[k];n+=normals.array[(tri+k)*3+c]*weights[k];}pointPositions[i*3+c]=p;pointNormals[i*3+c]=n;}seeds[i]=random();}
source.dispose();const pointsGeometry=new THREE.BufferGeometry();pointsGeometry.setAttribute('position',new THREE.BufferAttribute(pointPositions,3));pointsGeometry.setAttribute('aNormal',new THREE.BufferAttribute(pointNormals,3));pointsGeometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
const pointsMaterial=new THREE.ShaderMaterial({uniforms:uniform,transparent:true,depthWrite:false,vertexShader:`uniform vec3 uBrush;uniform float uExposure;uniform float uRadius;uniform float uTime;attribute vec3 aNormal;attribute float aSeed;varying float vAlpha;varying float vSeed;void main(){vec3 vRest=position;${erosion} float exposed=smoothstep(threshold-.08,threshold+.03,uExposure)*step(.005,uExposure);float drift=aSeed<.65?.08:(aSeed<.91?.28:.65);vec3 flow=vec3(sin(uTime*.5+aSeed*23.),cos(uTime*.4+aSeed*31.),sin(uTime*.35+aSeed*15.));vec3 moved=position+(normalize(aNormal)*.15+flow*drift)*exposed*uExposure;vec4 mv=modelViewMatrix*vec4(moved,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((1.4+aSeed*1.3)*6./-mv.z,1.,4.);vAlpha=exposed*.85;vSeed=aSeed;}`,fragmentShader:'uniform vec3 uPointColor;uniform vec3 uPointHighlight;varying float vAlpha;varying float vSeed;void main(){float d=length(gl_PointCoord-.5);if(d>.5||vAlpha<.005)discard;vec3 color=mix(uPointColor,uPointHighlight,step(.95,vSeed));gl_FragColor=vec4(color,vAlpha*smoothstep(.5,.18,d));}'});pivot.add(new THREE.Points(pointsGeometry,pointsMaterial));
// A quiet ring anchors the floating sculpture without covering the scenery.
const ring=new THREE.Mesh(new THREE.TorusGeometry(1.35,.005,6,100),new THREE.MeshBasicMaterial({color:0xa2b8e6,transparent:true,opacity:.18}));ring.rotation.x=Math.PI/2;ring.position.y=-1.8;scene.add(ring);
const dustGeo=new THREE.BufferGeometry();const dust=new Float32Array(90*3);for(let i=0;i<dust.length;i++)dust[i]=(random()-.5)*6;dustGeo.setAttribute('position',new THREE.BufferAttribute(dust,3));const dustPoints=new THREE.Points(dustGeo,new THREE.PointsMaterial({size:.012,color:0xb6caeb,transparent:true,opacity:.35,depthWrite:false}));scene.add(dustPoints);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(-10,-10),brushTarget=new THREE.Vector3();let inside=false,exposureTarget=0,previewUntil=0,visible=true,last=0,frame=0,rotationX=.3,rotationY=-.4;
function resize(){const rect=stage.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();if(reduced.matches)render(performance.now());}
new ResizeObserver(resize).observe(stage);
canvas.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||reduced.matches)return;const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);inside=true;});
const release=()=>{inside=false;exposureTarget=0;};canvas.addEventListener('pointerleave',release);canvas.addEventListener('pointercancel',release);window.addEventListener('blur',release);
control.addEventListener('click',()=>{if(reduced.matches){pivot.rotation.y+=Math.PI/6;render(performance.now());return;}previewUntil=performance.now()+1800;uniform.uBrush.value.set(.7,.2,.7);brushTarget.copy(uniform.uBrush.value);});
function render(now,once=false){frame=0;if((intro?.open&&!once)||document.hidden||!visible){stage.dataset.animationActive='false';return;}stage.dataset.animationActive=String(!reduced.matches&&!once);const dt=Math.min((now-last)/1000||.016,.05);last=now;const time=now/1000;uniform.uTime.value=time;
if(!reduced.matches){pivot.rotation.y=rotationY+Math.sin(time*.16)*.23;pivot.rotation.x=rotationX+Math.sin(time*.21)*.08;pivot.position.y=Math.sin(time*.6)*.06;dustPoints.rotation.y=time*.015;}
scene.updateMatrixWorld();if(inside&&!reduced.matches){raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObject(pickMesh,false)[0];if(hit){brushTarget.copy(pivot.worldToLocal(hit.point));exposureTarget=1;}else exposureTarget=0;}else exposureTarget=now<previewUntil?1:0;
if(reduced.matches)exposureTarget=0;uniform.uBrush.value.lerp(brushTarget,1-Math.exp(-16*dt));uniform.uExposure.value+=(exposureTarget-uniform.uExposure.value)*(1-Math.exp(-(exposureTarget>uniform.uExposure.value?7.5:3.5)*dt));wire.material.opacity=.065*(1-uniform.uExposure.value);renderer.render(scene,camera);stage.classList.add('loaded');control.hidden=false;if(!once&&!reduced.matches&&visible&&!document.hidden&&!intro?.open)frame=requestAnimationFrame(loop);}
function loop(now){frame=0;render(now);}
function resume(){
 cancelAnimationFrame(frame);frame=0;stage.dataset.animationActive='false';
 if(document.hidden||!visible||intro?.open)return;
 last=performance.now();
 if(reduced.matches)render(last,true);else frame=requestAnimationFrame(loop);
}
const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();},{rootMargin:'80px'});visibilityObserver.observe(stage);
document.addEventListener('visibilitychange',resume);
reduced.addEventListener('change',()=>{uniform.uExposure.value=0;resume();});
document.addEventListener('arrivalstart',()=>{cancelAnimationFrame(frame);frame=0;stage.dataset.animationActive='false';});
document.addEventListener('arrivalreveal',()=>render(performance.now(),true));
document.addEventListener('arrivalcomplete',resume);
resize();

function applyArtifactTheme(){
 const light=document.documentElement.dataset.theme==='light';
 material.color.setHex(light?0x5e7193:0x93a0b8);
 wireMat.color.setHex(light?0x526f9c:0xb5c5e9);
 ring.material.color.setHex(light?0x416493:0xa2b8e6);
 dustPoints.material.color.setHex(light?0x506f9c:0xb6caeb);
 uniform.uPointColor.value.set(...(light?[.24,.34,.53]:[.55,.67,.86]));
 uniform.uPointHighlight.value.set(...(light?[.48,.4,.3]:[.9,.86,.73]));
 if(reduced.matches)render(performance.now());
}
applyArtifactTheme();
document.addEventListener('themechange',applyArtifactTheme);
