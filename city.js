(() => {
 const canvas=document.getElementById("renderCanvas");if(!canvas||!window.BABYLON)return;
 const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,adaptToDeviceRatio:true});
 const scene=new BABYLON.Scene(engine);scene.clearColor=new BABYLON.Color4(.055,.05,.065,1);
 const camera=new BABYLON.FollowCamera("thirdPersonCamera",new BABYLON.Vector3(0,5,-12),scene);camera.radius=11;camera.heightOffset=4;camera.rotationOffset=180;camera.cameraAcceleration=.05;camera.maxCameraSpeed=12;camera.lowerRadiusLimit=7;camera.upperRadiusLimit=15;
 const hemi=new BABYLON.HemisphericLight("ambient",new BABYLON.Vector3(0,1,0),scene);hemi.intensity=.8;
 const key=new BABYLON.DirectionalLight("lateSun",new BABYLON.Vector3(-.4,-1,.5),scene);key.position=new BABYLON.Vector3(-10,20,-10);key.intensity=1.2;
 const mat=(name,color,rough=.8)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.12,.12,.12);return m};
 const road=mat("wet asphalt","#29262b"),side=mat("stone","#51464a"),wall=mat("aged brick","#594449"),dark=mat("dark windows","#171b21"),gold=mat("brass","#a98454"),coat=mat("player coat","#26242a");
 const ground=BABYLON.MeshBuilder.CreateGround("street",{width:90,height:90},scene);ground.material=road;
 for(let i=-3;i<=3;i++){let curb=BABYLON.MeshBuilder.CreateBox("pavement",{width:90,height:.25,depth:5},scene);curb.position.set(0,.05,i*15+7);curb.material=side}
 function building(x,z,w,d,h){let b=BABYLON.MeshBuilder.CreateBox("city building",{width:w,height:h,depth:d},scene);b.position.set(x,h/2,z);b.material=wall;for(let y=2;y<h-1;y+=3){for(let xx=-w/2+1;xx<w/2-0.5;xx+=2.5){let win=BABYLON.MeshBuilder.CreateBox("window",{width:.9,height:1.35,depth:.08},scene);win.position.set(x+xx,y,z-d/2-.05);win.material=dark}}let roof=BABYLON.MeshBuilder.CreateBox("roof ledge",{width:w+.3,height:.35,depth:d+.3},scene);roof.position.set(x,h,z);roof.material=side}
 building(-13,12,10,10,17);building(12,13,12,10,22);building(-15,-13,9,9,14);building(14,-14,11,10,18);building(0,27,16,9,13);
 // Street lamps and warm practical lights.
 for(let x of [-8,8])for(let z of [-18,-4,10,24]){let pole=BABYLON.MeshBuilder.CreateCylinder("lamp post",{height:5,diameter:.12},scene);pole.position.set(x,2.5,z);pole.material=gold;let bulb=BABYLON.MeshBuilder.CreateSphere("lamp",{diameter:.45},scene);bulb.position.set(x,5,z);bulb.material=gold}
 // Player character: simple low-poly placeholder, intentionally restrained rather than cartoonish.
 const player=new BABYLON.TransformNode("player",scene);const torso=BABYLON.MeshBuilder.CreateCapsule("player body",{height:2.1,radius:.42},scene);torso.parent=player;torso.position.y=1.2;torso.material=coat;
 const head=BABYLON.MeshBuilder.CreateSphere("player head",{diameter:.62,segments:16},scene);head.parent=player;head.position.y=2.55;head.material=mat("skin","#a8785f");
 const legMat=mat("trousers","#17171b");for(let x of [-.2,.2]){let leg=BABYLON.MeshBuilder.CreateCylinder("leg",{height:1,diameter:.22},scene);leg.parent=player;leg.position.set(x,.45,0);leg.material=legMat}
 player.position.set(0,0,0);camera.lockedTarget=player;
 const move={x:0,z:0,sprint:false};let last=0;
 function step(){const dt=engine.getDeltaTime()/1000;let speed=move.sprint?7:3.8;let forward=move.z*speed*dt,right=move.x*speed*dt;player.position.x+=right;player.position.z+=forward;player.position.x=Math.max(-30,Math.min(30,player.position.x));player.position.z=Math.max(-30,Math.min(30,player.position.z));if(Math.abs(move.x)+Math.abs(move.z)>.05){player.rotation.y=Math.atan2(move.x,move.z)}}
 scene.onBeforeRenderObservable.add(step);
 // Touch joystick plus keyboard support.
 const joy=document.getElementById("joystick"),stick=document.getElementById("stick");
 if(joy){let active=false;const update=e=>{const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,max=30,len=Math.hypot(dx,dy)||1;if(len>max){dx=dx/len*max;dy=dy/len*max}move.x=dx/max;move.z=-dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`};joy.addEventListener("pointerdown",e=>{active=true;joy.setPointerCapture(e.pointerId);update(e)});joy.addEventListener("pointermove",e=>{if(active)update(e)});const end=()=>{active=false;move.x=0;move.z=0;stick.style.transform="translate(0,0)"};joy.addEventListener("pointerup",end);joy.addEventListener("pointercancel",end)}
 document.getElementById("sprint-btn")?.addEventListener("pointerdown",()=>move.sprint=true);["pointerup","pointercancel","pointerleave"].forEach(ev=>document.getElementById("sprint-btn")?.addEventListener(ev,()=>move.sprint=false));
 document.getElementById("interact-btn")?.addEventListener("click",()=>{const m=document.getElementById("scene-message");m.textContent="Your businesses are waiting. Choose a district below.";});
 window.addEventListener("keydown",e=>{if(e.key==="w"||e.key==="ArrowUp")move.z=1;if(e.key==="s"||e.key==="ArrowDown")move.z=-1;if(e.key==="a"||e.key==="ArrowLeft")move.x=-1;if(e.key==="d"||e.key==="ArrowRight")move.x=1});window.addEventListener("keyup",e=>{if(["w","s","ArrowUp","ArrowDown"].includes(e.key))move.z=0;if(["a","d","ArrowLeft","ArrowRight"].includes(e.key))move.x=0});
 engine.runRenderLoop(()=>scene.render());window.addEventListener("resize",()=>engine.resize());
})();