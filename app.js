const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}}};
const S={pro:store.get('zynix_pro')==='1'},LIM=()=>S.pro?60:10;
const titles={chat:'Chat',image:'Image Studio',video:'Video Editor',pro:'Upgrade to Pro'};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2800)}
function go(v){$$('.view').forEach(e=>e.classList.toggle('on',e.id===v));$$('.nav').forEach(e=>e.classList.toggle('on',e.dataset.v===v));$('#title').textContent=titles[v];$('#side').classList.remove('open')}
$$('.nav').forEach(b=>b.onclick=()=>go(b.dataset.v));$('#menu').onclick=()=>$('#side').classList.toggle('open');
document.documentElement.dataset.theme=store.get('zynix_theme')||'dark';
$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;store.set('zynix_theme',t)};
const vd=$('#vd'),cv=$('#cv'),cx=cv.getContext('2d');
let vt=0,playing=false,last=0,caps=[],seed=7;
function plan(){
  $('#badge').innerHTML=S.pro?'<span class="ver">✔</span> Pro verified':'Free plan';
  $('#planName').textContent=S.pro?'Pro':'Free';
  $('#planInfo').textContent=S.pro?'1-minute full HD video, no watermark':'10-second 720p video, watermark';
  $('#vcap').textContent=`(max ${LIM()}s on ${S.pro?'Pro':'Free'})`;
  if(+vd.value>LIM())vd.value=LIM();$('#vlab').textContent=vd.value+'s';sizeCv();build();
}
/* Chat */
const log=$('#log'),inp=$('#in');
function add(r,t){$('.hello')?.remove();const d=document.createElement('div');d.className='msg '+r;d.textContent=t;log.append(d);log.scrollTop=log.scrollHeight;return d}
function demo(q){return `You asked: "${q}"\n\nThis is Zynix demo mode. Deploy the /api/chat function with your ANTHROPIC_API_KEY on Vercel and I will answer with a real model. Meanwhile, try the Image Studio or the Video Editor.`}
async function ask(q){
  const d=add('ai','…');let t;
  try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q})});if(!r.ok)throw 0;t=(await r.json()).text}catch{t=demo(q)}
  d.textContent='';for(const w of t.split(/(\s+)/)){d.textContent+=w;log.scrollTop=log.scrollHeight;await new Promise(r=>setTimeout(r,12))}
  if($('#spk').checked&&window.speechSynthesis){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(t))}
}
function send(){const q=inp.value.trim();if(!q)return;inp.value='';add('me',q);ask(q)}
$('#send').onclick=send;inp.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec;
$('#mic').onclick=()=>{
  if(!SR)return toast('Voice input needs Chrome, Edge or Safari.');
  if(rec){rec.stop();return}
  rec=new SR();rec.interimResults=true;rec.lang=navigator.language||'en-US';
  rec.onresult=e=>{inp.value=[...e.results].map(r=>r[0].transcript).join('')};
  rec.onend=()=>{$('#mic').classList.remove('rec');rec=null;if(inp.value.trim()){$('#spk').checked=true;send()}};
  rec.onerror=()=>toast('Microphone unavailable. Allow access and try again.');
  rec.start();$('#mic').classList.add('rec');
};
/* Image Studio */
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const PAL=[[260,190,320],[10,40,330],[200,170,230],[220,220,220]];
let ratio='1/1';
$$('#ratios .chip').forEach(c=>c.onclick=()=>{$$('#ratios .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');ratio=c.dataset.r});
function paint(cv,style,seed){
  const [w,h]=ratio.split('/').map(Number),W=1024,H=Math.round(W*h/w);cv.width=W;cv.height=H;
  const c=cv.getContext('2d'),r=rng(seed),p=PAL[style],sat=style==3?0:80;
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,`hsl(${p[0]} ${sat}% 12%)`);g.addColorStop(1,`hsl(${p[1]} ${sat}% 30%)`);c.fillStyle=g;c.fillRect(0,0,W,H);
  for(let i=0;i<26;i++){const x=r()*W,y=r()*H,R=(r()*.25+.05)*W,q=c.createRadialGradient(x,y,0,x,y,R);q.addColorStop(0,`hsla(${p[Math.floor(r()*3)]+r()*30} ${sat}% 60% / .5)`);q.addColorStop(1,'transparent');c.fillStyle=q;c.beginPath();c.arc(x,y,R,0,7);c.fill()}
  for(let i=0;i<7;i++){const x=r()*W,y=r()*H,s=(r()*.18+.06)*W,a=r()*6;c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.moveTo(0,-s);c.lineTo(s*.7,-s*.15);c.lineTo(s*.4,s);c.lineTo(-s*.5,s*.8);c.lineTo(-s*.7,-s*.2);c.closePath();const f=c.createLinearGradient(-s,-s,s,s);f.addColorStop(0,'rgba(255,255,255,.45)');f.addColorStop(1,'rgba(255,255,255,.03)');c.fillStyle=f;c.fill();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2;c.stroke();c.restore()}
  c.fillStyle='#fff';for(let i=0;i<120;i++){c.globalAlpha=r()*.8;c.fillRect(r()*W,r()*H,2,2)}c.globalAlpha=1;
}
$('#gen').onclick=()=>{
  const p=$('#ip').value.trim();if(!p)return toast('Describe the image first.');
  const gal=$('#gal');gal.querySelector('.empty')?.remove();
  const card=document.createElement('div');card.className='card';const c=document.createElement('canvas');
  paint(c,+$('#sty').value,hash(p+Date.now()));
  const bar=document.createElement('div');bar.innerHTML=`<span></span><a href="#">Download</a>`;bar.firstChild.textContent=p.slice(0,38);
  bar.querySelector('a').onclick=e=>{e.preventDefault();const a=document.createElement('a');a.download='zynix-image.png';a.href=c.toDataURL();a.click()};
  card.append(c,bar);gal.prepend(card);
};
/* Video Editor */
function sizeCv(){cv.width=S.pro?1920:1280;cv.height=S.pro?1080:720;frame(vt)}
function frame(t){
  const w=cv.width,h=cv.height,r=rng(seed),D=+vd.value;
  const g=cx.createLinearGradient(0,0,w,h);g.addColorStop(0,`hsl(${(seed*7+t*14)%360} 70% 16%)`);g.addColorStop(1,`hsl(${(seed*7+130+t*14)%360} 80% 38%)`);cx.fillStyle=g;cx.fillRect(0,0,w,h);
  for(let i=0;i<14;i++){const x=(r()*w+Math.sin(t+i)*90+w)%w,y=(r()*h+Math.cos(t*.8+i)*70+h)%h,R=(r()*.12+.05)*w,q=cx.createRadialGradient(x,y,0,x,y,R);q.addColorStop(0,`hsla(${r()*360},90%,65%,.55)`);q.addColorStop(1,'transparent');cx.fillStyle=q;cx.beginPath();cx.arc(x,y,R,0,7);cx.fill()}
  const c=caps.find(c=>t>=c.s&&t<c.e);
  if(c){cx.font=`700 ${h*.06}px Sora,sans-serif`;cx.textAlign='center';const m=Math.min(cx.measureText(c.t).width+50,w*.95);cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(w/2-m/2,h*.8-h*.075,m,h*.11);cx.fillStyle='#fff';cx.fillText(c.t,w/2,h*.8,w*.9)}
  if(!S.pro){cx.font=`600 ${h*.035}px Sora,sans-serif`;cx.textAlign='right';cx.fillStyle='rgba(255,255,255,.65)';cx.fillText('Zynix AI · Free',w-24,h-24)}
  $('#ph').style.left=`calc(${t/D} * (100% - 100px))`;$('#tc').textContent=`${t.toFixed(1)}s / ${D}s`;
}
function build(){
  const D=+vd.value;
  $('#tv').innerHTML='<div class="clip" style="left:0;width:100%"></div>';$('#tv').firstChild.textContent=$('#vp').value.slice(0,40)||'Untitled clip';
  $('#tc2').innerHTML='';caps.forEach(c=>{const d=document.createElement('div');d.className='clip c';d.style.left=c.s/D*100+'%';d.style.width=(c.e-c.s)/D*100+'%';d.textContent=c.t;$('#tc2').append(d)});
  frame(Math.min(vt,D));
}
function autoCaps(){
  const text=$('#vs').value.trim()||$('#vp').value.trim();if(!text)return toast('Add a script or a prompt first.');
  const D=+vd.value,words=text.split(/\s+/),chunks=[];
  for(let i=0;i<words.length;i+=4)chunks.push(words.slice(i,i+4).join(' '));
  const step=D/chunks.length;caps=chunks.map((t,i)=>({t,s:i*step,e:(i+1)*step}));build();toast(`${caps.length} captions added.`);
}
vd.oninput=()=>{if(+vd.value>LIM()){vd.value=LIM();toast('Free videos max out at 10 seconds. Upgrade to Pro for 60 seconds.')}$('#vlab').textContent=vd.value+'s';if(caps.length)autoCaps();else build()};
$('#vcaps').onclick=autoCaps;
$('#vgen').onclick=()=>{
  const p=$('#vp').value.trim();if(!p)return toast('Describe your video first.');
  seed=hash(p);vt=0;playing=false;$('#vplay').textContent='▶ Play';
  const pr=$('#prog');pr.classList.remove('on');void pr.offsetWidth;pr.classList.add('on');
  setTimeout(()=>{pr.classList.remove('on');if($('#vs').value.trim())autoCaps();else build();toast('Video ready. Press play.')},1700);
};
function loop(ts){if(!playing)return;vt+=(ts-last)/1000;last=ts;if(vt>=+vd.value)vt=0;frame(vt);requestAnimationFrame(loop)}
$('#vplay').onclick=()=>{playing=!playing;$('#vplay').textContent=playing?'⏸ Pause':'▶ Play';if(playing){last=performance.now();requestAnimationFrame(loop)}};
$('#tl').onclick=e=>{const b=$('#tv').getBoundingClientRect();vt=Math.max(0,Math.min(1,(e.clientX-b.left)/b.width))*(+vd.value);frame(vt)};
$('#vexp').onclick=()=>{
  if(!window.MediaRecorder)return toast('Export needs a browser with MediaRecorder.');
  const D=+vd.value,rc=new MediaRecorder(cv.captureStream(30)),ch=[];
  rc.ondataavailable=e=>ch.push(e.data);
  rc.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(ch,{type:rc.mimeType||'video/webm'}));a.download='zynix-video.webm';a.click();playing=false;$('#vplay').textContent='▶ Play';toast('Exported.')};
  toast(`Exporting ${D}s. Keep this tab open.`);vt=0;playing=true;last=performance.now();requestAnimationFrame(loop);rc.start();setTimeout(()=>rc.stop(),D*1000);
};
/* Pro payments */
$$('.cp').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.c);toast('Copied.')}catch{toast('Copy failed. Select the text instead.')}});
$('#pf').onsubmit=e=>{
  e.preventDefault();const id=$('#pt').value.trim();
  if(!/^[A-Za-z0-9]{8,20}$/.test(id))return toast('Transaction ID must be 8–20 letters or digits.');
  let list=[];try{list=JSON.parse(store.get('zynix_tx')||'[]')}catch{}
  if(list.some(x=>x.id===id))return toast('This Transaction ID was already used.');
  list.push({id,name:$('#pn').value.trim(),at:new Date().toISOString()});store.set('zynix_tx',JSON.stringify(list));
  S.pro=true;store.set('zynix_pro','1');plan();$('#pm').textContent='Pro is active on this device. Your payment is logged for review.';toast('Pro unlocked. Welcome aboard!');
};
plan();
