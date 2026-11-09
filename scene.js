
export function build(THREE,ctx){
 const {scene,camera,state:st}=ctx;
 camera.position.set(.3,1.2,13.5);camera.lookAt(.3,-.2,0);
 scene.add(new THREE.HemisphereLight(0xfff0d8,0x2a1a10,1.5));const key=new THREE.DirectionalLight(0xffe0b0,3.2);key.position.set(-4,8,8);scene.add(key);const rim=new THREE.DirectionalLight(0xffa860,1.3);rim.position.set(6,2,-4);scene.add(rim);
 const root=new THREE.Group();scene.add(root);
 // plank texture
 const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');g.fillStyle='#9a7a52';g.fillRect(0,0,1024,256);
 for(let i=0;i<170;i++){g.strokeStyle=`rgba(${60+Math.random()*40|0},${40+Math.random()*30|0},20,${.08+Math.random()*.18})`;g.lineWidth=1+Math.random()*3;g.beginPath();const y=Math.random()*256;g.moveTo(0,y);g.bezierCurveTo(300,y+Math.random()*16-8,700,y+Math.random()*16-8,1024,y+Math.random()*10-5);g.stroke()}
 const wt=new THREE.CanvasTexture(c);wt.colorSpace=THREE.SRGBColorSpace;
 const plank=new THREE.Mesh(new THREE.BoxGeometry(6.4,.5,3),new THREE.MeshStandardMaterial({map:wt,roughness:.85}));plank.position.set(0,-1.2,0);root.add(plank);
 const steel=new THREE.MeshStandardMaterial({color:0xb8bcc0,metalness:.9,roughness:.3});
 const nail=new THREE.Group();root.add(nail);
 const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.06,.04,1.4,10),steel);shaft.position.y=-.7;nail.add(shaft);
 const nh=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.06,20),steel);nail.add(nh);
 const topY=-.95,fullH=1.0;
 // hammer
 const hammer=new THREE.Group();root.add(hammer);
 const wood=new THREE.MeshStandardMaterial({color:0xb98a4e,roughness:.6});const dark=new THREE.MeshStandardMaterial({color:0x2a2a2e,metalness:.85,roughness:.35});
 const hand=new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,2.7,24),wood);hand.position.y=1.35;hammer.add(hand);
 const grip=new THREE.Mesh(new THREE.CylinderGeometry(.18,.19,1.1,24),new THREE.MeshStandardMaterial({color:0x7b2a22,roughness:.7}));grip.position.y=.55;hammer.add(grip);
 const hd=new THREE.Mesh(new THREE.BoxGeometry(1.05,.55,.55),dark);hd.position.set(-.4,2.75,0);hammer.add(hd);
 const face=new THREE.Mesh(new THREE.CylinderGeometry(.3,.28,.18,24),steel);face.rotation.z=Math.PI/2;face.position.set(-1.0,2.75,0);hammer.add(face);
 const claw=new THREE.Mesh(new THREE.ConeGeometry(.26,.9,16),dark);claw.rotation.z=-Math.PI/2;claw.position.set(.48,2.75,0);hammer.add(claw);
 const gx=2.7;let depth=0,depthT=0,seq=null;const sl=document.querySelector('#val');
 const FACE=[-.95,2.75];
 function pose(phi,headY){hammer.rotation.z=phi;const cs=Math.cos(phi),sn=Math.sin(phi);const fx=cs*FACE[0]-sn*FACE[1],fy=sn*FACE[0]+cs*FACE[1];hammer.position.set(gx,headY-fy,0)}
 // sparks
 const N=30,pos=new Float32Array(N*3),vel=new Float32Array(N*3),life=new Float32Array(N);for(let i=0;i<N;i++)pos[i*3+1]=-99;
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pos,3));const sp=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffd27a,size:.14,transparent:true,depthWrite:false}));sp.frustumCulled=false;root.add(sp);
 function burst(y){for(let i=0;i<N;i++){pos[i*3]=0;pos[i*3+1]=y;pos[i*3+2]=0;vel[i*3]=(Math.random()-.5)*4;vel[i*3+1]=Math.random()*3+1;vel[i*3+2]=(Math.random()-.5)*3;life[i]=.4+Math.random()*.3}}
 function headY(d){return topY+fullH*(1-d)+.0}
 const raisedPhi=-.25,strikePhi=1.0;let shake=0;
 if(sl)sl.addEventListener('input',()=>{depthT=parseFloat(sl.value);seq=null});
 if(st.reduced){depth=depthT}
 return{onAction(){if(!seq){if(depthT>=.999)return;seq={t:0,from:depthT,to:Math.min(1,Math.round(depthT*3+1)/3)}}},onReset(){depthT=0;seq=null;if(sl)sl.value=0},
  update(dt,s){
   let phi=raisedPhi+Math.sin(s.t*1.2)*(s.reduced?0:.03);let hY=headY(depth)+1.1;
   if(seq){seq.t+=dt/(s.reduced?.3:.9);const t=seq.t;
    if(t<.55){const k=1-Math.pow(1-t/.55,2);phi=raisedPhi-.15*(1-k)+(.0);phi=raisedPhi+(-.3)*Math.sin(Math.min(1,t/.2)*Math.PI/2)*(t<.2?1:0)+( t>=.2?(-.3*(1-(t-.2)/.35)):0);hY=headY(seq.from)+1.1}
    else if(t<.68){const k=(t-.55)/.13;phi=raisedPhi-0+(strikePhi-raisedPhi)*(k*k);hY=headY(seq.from)+1.1*(1-k*k)+0*k}
    else if(t<1){if(!seq.hit){seq.hit=true;depthT=seq.to;if(sl)sl.value=depthT.toFixed(2);burst(headY(seq.from)-.1);shake=.25}phi=strikePhi;hY=headY(depth)}
    else{seq=null;phi=raisedPhi;hY=headY(depth)+1.1}
   }
   const out=document.querySelector('#val-out');depth+=(depthT-depth)*Math.min(1,dt*(seq&&seq.hit?30:(s.reduced?30:8)));
   nail.position.y=headY(depth);if(out)out.textContent=Math.round(depth*100)+'%';
   if(seq&&seq.t>=.68){hY=headY(depth)}
   pose(phi,hY);
   for(let i=0;i<N;i++){if(life[i]>0){life[i]-=dt;vel[i*3+1]-=9*dt;pos[i*3]+=vel[i*3]*dt;pos[i*3+1]+=vel[i*3+1]*dt;pos[i*3+2]+=vel[i*3+2]*dt;if(life[i]<=0)pos[i*3+1]=-99}}sg.attributes.position.needsUpdate=true;
   shake=Math.max(0,shake-dt);root.position.y=s.reduced?0:Math.sin(shake*80)*.05*shake*4;
   root.rotation.y=-.35+s.px*.2+s.dragY*.6+(s.sp-.5)*.5;root.rotation.x=.18+s.py*.05+s.dragX*.3;}}
}
