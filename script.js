/* ---------------- reusable svg pieces ---------------- */
function sunSVG(cx,cy,s,id,active){
  return `<g id="${id}" class="sun-group ${active?'sun-active sun-warm':''}" transform="translate(${cx},${cy}) scale(${s})">
    <g class="rays">
      ${Array.from({length:8}).map((_,i)=>`<rect x="-4" y="-68" width="8" height="24" rx="4" fill="#FFD23F" transform="rotate(${i*45})"/>`).join('')}
    </g>
    <circle r="38" fill="#FFD23F"/>
    <circle r="38" fill="none" stroke="#FFA726" stroke-width="3"/>
    <circle cx="-12" cy="-6" r="4" fill="#E65100"/>
    <circle cx="12" cy="-6" r="4" fill="#E65100"/>
    <path d="M-12,10 Q0,18 12,10" stroke="#E65100" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>`;
}
function cloudSVG(cx,cy,s,id,dark){
  const colors=['#FFFFFF','#E3E6E8','#B0BEC5','#78909C'];
  const c=colors[dark]||colors[0];
  return `<g id="${id}" class="cloud-shape" data-dark="${dark}" transform="translate(${cx},${cy}) scale(${s})">
    <ellipse cx="-38" cy="12" rx="34" ry="24" fill="${c}"/>
    <ellipse cx="0" cy="-8" rx="44" ry="34" fill="${c}"/>
    <ellipse cx="42" cy="12" rx="36" ry="26" fill="${c}"/>
    <ellipse cx="0" cy="26" rx="66" ry="20" fill="${c}"/>
  </g>`;
}
function rainLinesSVG(cx,cy){
  let out='';
  for(let i=0;i<5;i++){
    out+=`<line class="rain-line" x1="${cx-40+i*20}" y1="${cy+20}" x2="${cx-46+i*20}" y2="${cy+45}" stroke="#4FC3F7" stroke-width="4" stroke-linecap="round" style="animation-delay:${i*0.15}s"/>`;
  }
  return out;
}
function dropSVG(cx,cy,s,id,mood,extraClass){
  mood=mood||'happy';
  const mouth = mood==='happy'
    ? '<path d="M-10,34 Q0,44 10,34" stroke="#01579B" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : '<circle cx="0" cy="36" r="5" fill="#01579B"/>';
  return `<g id="${id}" class="drop-char ${extraClass||''}" transform="translate(${cx},${cy}) scale(${s})">
    <path d="M0,-40 C20,-10 30,10 30,25 C30,45 15,58 0,58 C-15,58 -30,45 -30,25 C-30,10 -20,-10 0,-40 Z" fill="#4FC3F7" stroke="#0288D1" stroke-width="3"/>
    <ellipse cx="-14" cy="0" rx="6" ry="10" fill="#B3E5FC" opacity="0.7"/>
    <circle cx="-10" cy="18" r="5" fill="#01579B"/>
    <circle cx="10" cy="18" r="5" fill="#01579B"/>
    ${mouth}
  </g>`;
}
function seaSVG(color){
  return `<path d="M0,220 Q50,200 100,220 T200,220 T300,220 T400,220 V300 H0 Z" fill="${color}"/>`;
}
function mountainSVG(){
  return `<polygon points="0,230 90,100 160,230" fill="#8BC34A"/>
  <polygon points="120,230 220,90 320,230" fill="#7CB342"/>
  <polygon points="260,230 340,140 400,230" fill="#9CCC65"/>`;
}
function flowerSVG(cx,cy,id,bloomed){
  const petalColor = bloomed? '#F06292':'#F8BBD0';
  const scale = bloomed? 1:0.6;
  return `<g id="${id}" class="flower-shape ${bloomed?'flower-bloom':''}" transform="translate(${cx},${cy}) scale(${scale})">
    <line x1="0" y1="0" x2="0" y2="40" stroke="#4CAF50" stroke-width="5"/>
    <g>
      <ellipse cx="0" cy="-14" rx="10" ry="16" fill="${petalColor}"/>
      <ellipse cx="12" cy="-4" rx="10" ry="16" fill="${petalColor}" transform="rotate(72 12 -4)"/>
      <ellipse cx="7" cy="10" rx="10" ry="16" fill="${petalColor}" transform="rotate(144 7 10)"/>
      <ellipse cx="-7" cy="10" rx="10" ry="16" fill="${petalColor}" transform="rotate(216 -7 10)"/>
      <ellipse cx="-12" cy="-4" rx="10" ry="16" fill="${petalColor}" transform="rotate(288 -12 -4)"/>
      <circle r="8" fill="#FFEB3B"/>
    </g>
  </g>`;
}
function birdSVG(cx,cy){
  return `<path d="M${cx-10},${cy} Q${cx},${cy-10} ${cx+10},${cy} Q${cx},${cy-5} ${cx-10},${cy} Z" fill="#5D4037"/>`;
}
function sparkleSVG(cx,cy,id){
  return `<text id="${id}" class="sparkle" x="${cx}" y="${cy}" font-size="26">✨</text>`;
}

/* ---------------- narrator (text-to-speech) ---------------- */
const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let narratorOn = true;
let arabicVoice = null;
let userInteracted = false;
let speechConfirmedWorking = false;

function loadVoices(){
  if(!speechSupported) return;
  const voices = speechSynthesis.getVoices();
  arabicVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ar')) || null;
}
if(speechSupported){
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
} else {
  const bar = document.getElementById('narratorBar');
  if(bar) bar.style.display = 'none';
  showNarratorNotice('الصوت غير مدعوم في هذا العارض. افتح الملف في متصفح مثل Chrome أو Safari لتفعيل الراوي.');
}

function showNarratorNotice(msg){
  // تم تعطيل ظهور نصوص التنبيه بجانب أيقونة الراوي بطلب المستخدم.
  return;
}
function hideNarratorNotice(){
  const n = document.getElementById('narrNotice');
  if(n) n.style.display = 'none';
}

function speakText(text){
  if(!speechSupported || !text) return;
  try{
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ar-SA';
    if(arabicVoice) utter.voice = arabicVoice;
    utter.rate = 0.92;
    utter.pitch = 1.05;
    utter.volume = 1;
    const btn = document.getElementById('narrToggleBtn');
    let started = false;
    utter.onstart = ()=>{ started = true; speechConfirmedWorking = true; hideNarratorNotice(); if(btn) btn.classList.add('speaking'); };
    utter.onend = ()=>{ if(btn) btn.classList.remove('speaking'); };
    utter.onerror = ()=>{
      if(btn) btn.classList.remove('speaking');
      showNarratorNotice('تعذّر تشغيل الصوت. جرّب فتح الملف مباشرة في متصفح (خارج المعاينة) والضغط على زر الراوي 🔊.');
    };
    speechSynthesis.speak(utter);
    // Some sandboxed environments accept speak() silently but never fire onstart.
    setTimeout(()=>{
      if(!started && !speechConfirmedWorking){
        showNarratorNotice('لم يبدأ الصوت. جرّب تنزيل الملف وفتحه مباشرة في متصفح، ثم اضغط 🔊.');
      }
    }, 1200);
  } catch(err){
    showNarratorNotice('تعذّر تشغيل الصوت في هذا العارض. افتح الملف في متصفح مثل Chrome لتفعيل الراوي.');
  }
}

function narrationTextForCurrentPage(){
  const p = pages[current];
  let text = `${p.title}. ${p.text}`;
  if(p.quiz && p.question) text += ` ${p.question}`;
  return text;
}

function narrateCurrentPage(){
  if(!narratorOn || !userInteracted) return;
  speakText(narrationTextForCurrentPage());
}

function markInteracted(){ userInteracted = true; }

document.getElementById('narrToggleBtn')?.addEventListener('click', ()=>{
  markInteracted();
  narratorOn = !narratorOn;
  const btn = document.getElementById('narrToggleBtn');
  if(narratorOn){
    btn.textContent = '🔊';
    btn.classList.remove('muted');
    narrateCurrentPage();
  } else {
    btn.textContent = '🔇';
    btn.classList.add('muted');
    if(speechSupported) speechSynthesis.cancel();
  }
});

document.getElementById('narrReplayBtn')?.addEventListener('click', ()=>{
  markInteracted();
  speakText(narrationTextForCurrentPage());
});

/* ---------------- page data ---------------- */
const pages = [
{
  bg:['#bfe9ff','#7fd1ff'], title:'رحلة قطرة المطر الصغيرة',
  text:'قصة تعليمية ممتعة نتعرّف فيها على دورة الماء في الطبيعة. اضغطي/اضغط على الصورة لنبدأ!',
  hint:'👇 اضغط على قطورة للانطلاق',
  svg:(P)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#bfe9ff"/>
    ${sunSVG(340,55,0.9,'p0sun',false)}
    ${seaSVG('#29ABE2')}
    ${dropSVG(190,180,1.3,'p0drop','happy','bounce')}
    <text x="200" y="270" text-anchor="middle" font-family="Marhey" font-size="26" fill="#0b3d5c">قِطورة</text>
  </svg>`,
  onClick:(id)=>{ if(id==='p0drop') bounceEl('p0drop'); }
},
{
  bg:['#a6e3ff','#5cc5f2'], title:'في البحر الكبير',
  text:'تعيش «قِطورة» وهي قطرة ماء صغيرة وسعيدة، في قلب البحر الكبير الأزرق، بين موجاته اللطيفة.',
  hint:'👇 اضغط على قطورة',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#a6e3ff"/>
    ${seaSVG('#1E88E5')}
    ${dropSVG(200,190,1.4,'p1drop','happy','')}
    <circle cx="90" cy="230" r="10" fill="#64B5F6" opacity="0.7"/>
    <circle cx="320" cy="245" r="14" fill="#64B5F6" opacity="0.7"/>
  </svg>`,
  onClick:(id)=>{ if(id==='p1drop') bounceEl('p1drop'); }
},
{
  bg:['#fff3c4','#ffd76a'], title:'شمس دافئة',
  text:'في يوم مشمس جدًا، أرسلت الشمس أشعتها الذهبية الدافئة نحو الماء.',
  hint:'☀️ اضغط على الشمس',
  svg:(active)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#fff3c4"/>
    ${seaSVG('#1E88E5')}
    ${sunSVG(160,90,1.5,'p2sun',active)}
    ${dropSVG(280,210,1.2,'p2drop','happy','')}
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p2sun'){
      state.sunOn = !state.sunOn;
      renderStage(state);
    }
  }
},
{
  bg:['#ffe4b5','#ffb347'], title:'تحوّل ساحر',
  text:'سخّنت الشمس قِطورة رويدًا رويدًا، فتحوّلت إلى بخار خفيف يطير في الهواء!',
  hint:'💨 اضغط على قِطورة لتطير',
  svg:(state)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#ffe4b5"/>
    ${seaSVG('#1E88E5')}
    ${sunSVG(320,70,1.1,'p3sun',true)}
    ${dropSVG(180,200,1.2,'p3drop','happy', state.flew?'float-up':'')}
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p3drop' && !state.flew){ state.flew=true; renderStage(state); }
  }
},
{
  bg:['#ffe9c7','#ffd28a'], title:'ما هو التبخّر؟',
  text:'هذه المرحلة تُسمى «التبخّر»: يتحوّل الماء من سائل إلى بخار خفيف، ويطير عاليًا في السماء.',
  hint:'',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#ffe9c7"/>
    ${sunSVG(200,110,1.6,'p4sun',true)}
    <path d="M150,220 Q170,180 150,150 Q130,120 150,90" stroke="#B3E5FC" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M250,230 Q270,190 250,160 Q230,130 250,100" stroke="#B3E5FC" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.8"/>
    ${seaSVG('#1E88E5')}
  </svg>`,
  onClick:()=>{}
},
{
  bg:['#d7f0ff','#a9dcff'], title:'في السماء العالية',
  text:'طارت قِطورة عاليًا في السماء، وقابلت هناك آلاف القطرات الصغيرة الأخرى.',
  hint:'👇 اضغط لتجمع القطرات',
  svg:(state)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#d7f0ff"/>
    ${dropSVG(200,150,1.2,'p5center','happy','')}
    ${Array.from({length: state.gathered||0}).map((_,i)=>dropSVG(200+Math.cos(i*1.2)*70,150+Math.sin(i*1.2)*50,0.5,'g'+i,'happy','bounce')).join('')}
    ${birdSVG(80,60)}${birdSVG(110,50)}
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p5center'){
      state.gathered = Math.min((state.gathered||0)+1, 6);
      renderStage(state);
    }
  }
},
{
  bg:['#eef2f5','#cfd9df'], title:'ولادة السحابة',
  text:'تجمّعت كل القطرات معًا، وشكّلت سحابة بيضاء ناعمة كالقطن!',
  hint:'☁️ اضغط على السحابة',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#eef2f5"/>
    ${cloudSVG(200,130,1.6,'p6cloud',0)}
    ${dropSVG(200,220,1,'p6drop','happy','')}
  </svg>`,
  onClick:(id)=>{ if(id==='p6cloud') bounceEl('p6cloud'); }
},
{
  bg:['#e6eef2','#b9c6cd'], title:'السحابة تكبر',
  text:'كبرت السحابة وامتلأت بالماء، حتى صار لونها رماديًا داكنًا.',
  hint:'☁️ اضغط على السحابة عدّة مرات',
  svg:(state)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#e6eef2"/>
    ${cloudSVG(200,140,1.7,'p7cloud', Math.min(state.darkness||0,3))}
    ${dropSVG(90,240,0.8,'p7drop','worried','')}
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p7cloud'){
      state.darkness = Math.min((state.darkness||0)+1,3);
      renderStage(state);
    }
  }
},
{
  bg:['#dfe7ea','#a9b7bd'], title:'ما هو التكاثف؟',
  text:'هذه المرحلة تُسمى «التكاثف»: تتجمّع قطرات الماء الصغيرة داخل السحابة حتى تصبح ثقيلة.',
  hint:'',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#dfe7ea"/>
    ${cloudSVG(120,110,1.3,'a',3)}
    ${cloudSVG(260,150,1.5,'b',3)}
    ${mountainSVG()}
  </svg>`,
  onClick:()=>{}
},
{
  bg:['#8fa6b3','#5c7482'], title:'تبدأ الأمطار',
  text:'صارت السحابة ثقيلة جدًا، فبدأت تسقط منها قطرات المطر ببطء… ثم بسرعة!',
  hint:'🌧️ اضغط على السحابة لتُمطر',
  svg:(state)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#8fa6b3"/>
    <g id="p9cloudGroup" class="${state.raining?'raining':''}">
      ${cloudSVG(200,110,1.6,'p9cloud',3)}
      ${rainLinesSVG(200,140)}
    </g>
    ${mountainSVG()}
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p9cloud' || id==='p9cloudGroup'){ state.raining = true; renderStage(state); }
  }
},
{
  bg:['#c9dfc0','#9cc48a'], title:'على قمة الجبل',
  text:'سقطت قِطورة برفق على قمة جبل عالٍ أخضر، بين الأوراق وحبات الندى.',
  hint:'👇 اضغط على قِطورة',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#c9dfc0"/>
    ${mountainSVG()}
    ${dropSVG(160,110,1,'p10drop','happy','')}
  </svg>`,
  onClick:(id)=>{ if(id==='p10drop') bounceEl('p10drop'); }
},
{
  bg:['#c3ddc4','#8fc48f'], title:'انزلاقة ممتعة',
  text:'انزلقت قِطورة بسرعة وفرح على سفح الجبل الأخضر، متجهةً نحو الأسفل!',
  hint:'⛷️ اضغط على قِطورة لتنزلق',
  svg:(state)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#c3ddc4"/>
    ${mountainSVG()}
    ${dropSVG(120,110,1,'p11drop','happy', state.slid?'slide-target slide-active':'slide-target')}
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p11drop' && !state.slid){ state.slid=true; renderStage(state); }
  }
},
{
  bg:['#bfe3ea','#7fc9d6'], title:'نهر صغير',
  text:'انضمّت قِطورة إلى قطراتٍ أخرى، وتشكّل نهرٌ صغير يجري بمرح بين الصخور.',
  hint:'',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#bfe3ea"/>
    <path d="M40,60 Q160,120 120,200 Q90,260 220,280" stroke="#4FC3F7" stroke-width="34" fill="none" stroke-linecap="round"/>
    ${dropSVG(120,150,0.9,'p12drop','happy','bounce')}
    ${flowerSVG(300,220,'p12flower',true)}
  </svg>`,
  onClick:(id)=>{ if(id==='p12drop') bounceEl('p12drop'); }
},
{
  bg:['#d7ecd0','#a8d79a'], title:'حديقة عطشى',
  text:'مرّ النهر بجانب حديقة جميلة، ورأت قِطورة أزهارًا عطشى تنتظر قطرات الماء.',
  hint:'🌸 اضغط على الزهرة لتُزهر',
  svg:(state)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#d7ecd0"/>
    <path d="M0,240 Q200,220 400,240 V300 H0 Z" fill="#4FC3F7"/>
    ${flowerSVG(140,180,'p13flower', !!state.bloomed)}
    ${flowerSVG(230,190,'p13flower2', !!state.bloomed)}
    ${dropSVG(320,230,0.8,'p13drop','happy','')}
    ${state.bloomed? sparkleSVG(180,120,'sp1').replace('class="sparkle"','class="sparkle show-sparkle"'):''}
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p13flower' || id==='p13flower2'){ state.bloomed = true; renderStage(state); }
  }
},
{
  bg:['#e3f3da','#bfe3ac'], title:'الماء سرّ الحياة',
  text:'الماء يساعد النباتات والأزهار على النمو والازدهار، وتشرب منه الحيوانات أيضًا لتعيش بصحة جيدة.',
  hint:'',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#e3f3da"/>
    ${flowerSVG(110,180,'f1',true)}
    ${flowerSVG(200,190,'f2',true)}
    ${flowerSVG(290,175,'f3',true)}
    <path d="M0,240 Q200,220 400,240 V300 H0 Z" fill="#4FC3F7"/>
  </svg>`,
  onClick:()=>{}
},
{
  bg:['#ffe9c0','#ffd48a'], title:'قرية صغيرة',
  text:'مرّ النهر بقرية صغيرة، فملأ السكان أكوابهم وسقوا حقولهم بالماء النظيف.',
  hint:'🥤 اضغط لتصبّ الماء في الكوب',
  svg:(state)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#ffe9c0"/>
    <polygon points="120,180 120,120 170,90 220,120 220,180" fill="#EF9A5A"/>
    <polygon points="120,120 170,80 220,120" fill="#C1694B"/>
    <path d="M0,240 Q200,225 400,240 V300 H0 Z" fill="#4FC3F7"/>
    <g id="p15cup" transform="translate(280,200)">
      <rect x="-20" y="-10" width="40" height="55" rx="6" fill="#ffffff" stroke="#333" stroke-width="3"/>
      <rect x="-16" y="${state.poured?5:41}" width="32" height="${state.poured?40:0}" fill="#4FC3F7" style="transition:all 0.6s ease"/>
    </g>
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p15cup'){ state.poured = true; renderStage(state); }
  }
},
{
  bg:['#bfe0ee','#7cc0dc'], title:'العودة إلى البحر',
  text:'استمر النهر في جريانه، حتى وصل أخيرًا… إلى البحر الكبير! عادت قِطورة إلى بيتها الأول.',
  hint:'👇 اضغط على قِطورة',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#bfe0ee"/>
    ${seaSVG('#1E88E5')}
    ${dropSVG(200,190,1.4,'p16drop','happy','')}
    ${birdSVG(80,60)}
  </svg>`,
  onClick:(id)=>{ if(id==='p16drop') bounceEl('p16drop'); }
},
{
  bg:['#eaf6ff','#c5e6f9'], title:'دورة تتكرر',
  text:'وهكذا تتكرر الرحلة من جديد: بحر، ثم بخار، ثم سحاب، ثم مطر، ثم نهر… وأخيرًا بحر من جديد!',
  hint:'🔄 اضغط على الدائرة لتدور',
  svg:(state)=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#eaf6ff"/>
    <g id="p17cycle" class="cycle-group ${state.spin?'cycle-spin':''}">
      ${sunSVG(200,60,0.7,'',false)}
      ${cloudSVG(320,120,0.8,'',1)}
      <path d="M200,150 A90,90 0 1 1 199,150" fill="none" stroke="#90A4AE" stroke-width="4" stroke-dasharray="10 8"/>
      ${dropSVG(90,150,0.6,'','happy','')}
      ${seaSVG('#1E88E5')}
    </g>
  </svg>`,
  onClick:(id,stage,state)=>{
    if(id==='p17cycle'){ state.spin=true; renderStage(state); }
  }
},
{
  bg:['#fff6e0','#ffe6a8'], title:'نعمة غالية',
  text:'تذكّروا يا أصدقائي: الماء نعمة غالية جدًا، فلنحافظ عليه، ولا نُبذّره أبدًا، ونشكر الله عليه!',
  hint:'',
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#fff6e0"/>
    ${dropSVG(140,160,1.1,'','happy','')}
    ${flowerSVG(260,190,'ff',true)}
    ${sunSVG(320,70,0.9,'',false)}
  </svg>`,
  onClick:()=>{}
},
{
  bg:['#ffe0ec','#ffb8d4'], title:'أحسنت! 🎉',
  text:'أنهيتِ/أنهيت القصة بنجاح! والآن أجب عن هذا السؤال الصغير:',
  hint:'',
  quiz:true,
  question:'ماذا يحدث للماء عندما تُسخّنه الشمس؟',
  options:[
    {t:'يتجمّد', ok:false},
    {t:'يتبخّر ويطير في الهواء', ok:true},
    {t:'يختفي إلى الأبد', ok:false}
  ],
  svg:()=>`<svg viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#ffe0ec"/>
    ${dropSVG(200,150,1.5,'','happy','bounce')}
  </svg>`,
  onClick:()=>{}
}
];

/* ---------------- state & rendering ---------------- */
let current = 0;
const pageStates = pages.map(()=>({}));

function bounceEl(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('bounce');
  requestAnimationFrame(()=>{ el.classList.add('bounce'); });
}

function renderStage(state){
  const p = pages[current];
  document.getElementById('stage').innerHTML = p.svg(state);
}

function renderPage(){
  const p = pages[current];
  const book = document.getElementById('book');
  const stageWrap = document.getElementById('stageWrap');
  book.style.background = `linear-gradient(180deg, #fffaf0, #fffaf0)`;
  stageWrap.style.background = `linear-gradient(180deg, ${p.bg[0]}, ${p.bg[1]})`;

  document.getElementById('pageTitle').textContent = p.title;
  document.getElementById('pageText').textContent = p.text;
  document.getElementById('hint').textContent = p.hint || '';

  renderStage(pageStates[current]);

  // quiz area
  const quizArea = document.getElementById('quizArea');
  quizArea.innerHTML = '';
  if(p.quiz){
    const wrap = document.createElement('div');
    wrap.className = 'quiz-wrap';
    const q = document.createElement('div');
    q.style.fontWeight = '800';
    q.style.textAlign = 'center';
    q.style.color = 'var(--ink)';
    q.style.marginBottom = '4px';
    q.textContent = p.question;
    wrap.appendChild(q);
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    p.options.forEach((opt)=>{
      const btn = document.createElement('button');
      btn.className = 'quiz-btn';
      btn.textContent = opt.t;
      btn.onclick = ()=>{
        if(opt.ok){
          btn.classList.add('correct');
          feedback.textContent = 'إجابة صحيحة! أحسنت يا بطل 🌟';
          launchConfetti();
          if(narratorOn) speakText(feedback.textContent);
        } else {
          btn.classList.add('wrong');
          feedback.textContent = 'حاول مرة أخرى!';
          if(narratorOn) speakText(feedback.textContent);
          setTimeout(()=>btn.classList.remove('wrong'), 500);
        }
      };
      wrap.appendChild(btn);
    });
    wrap.appendChild(feedback);
    quizArea.appendChild(wrap);
  }

  // dots
  const dots = document.getElementById('dots');
  dots.innerHTML = '';
  pages.forEach((_,i)=>{
    const d = document.createElement('div');
    d.className = 'dot' + (i===current?' active':'');
    dots.appendChild(d);
  });

  document.getElementById('counter').textContent = `صفحة ${current+1} من ${pages.length}`;
  document.getElementById('prevBtn').disabled = current===0;
  document.getElementById('nextBtn').disabled = current===pages.length-1;

  narrateCurrentPage();
}

function launchConfetti(){
  const wrap = document.createElement('div');
  wrap.className = 'confetti';
  const emojis = ['🎉','✨','🌟','💧','🎊'];
  for(let i=0;i<24;i++){
    const s = document.createElement('span');
    s.textContent = emojis[i%emojis.length];
    s.style.left = Math.random()*100+'%';
    s.style.animationDelay = (Math.random()*0.6)+'s';
    wrap.appendChild(s);
  }
  document.getElementById('book').appendChild(wrap);
  setTimeout(()=>wrap.remove(), 2200);
}

/* stage click delegation */
document.getElementById('stage').addEventListener('click', (e)=>{
  markInteracted();
  let el = e.target;
  while(el && el !== e.currentTarget){
    if(el.id){
      const p = pages[current];
      if(p.onClick) p.onClick(el.id, el, pageStates[current]);
      return;
    }
    el = el.parentElement;
  }
});

document.getElementById('prevBtn').addEventListener('click', ()=>{
  markInteracted();
  if(current>0){ current--; renderPage(); }
});
document.getElementById('nextBtn').addEventListener('click', ()=>{
  markInteracted();
  if(current<pages.length-1){ current++; renderPage(); }
});
document.addEventListener('keydown', (e)=>{
  markInteracted();
  if(e.key==='ArrowLeft' && current<pages.length-1){ current++; renderPage(); }
  if(e.key==='ArrowRight' && current>0){ current--; renderPage(); }
});

renderPage();
