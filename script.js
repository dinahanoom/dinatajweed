
// Splash screen: show the branded opening screen briefly, then reveal the app.
(function(){
  const splash=document.getElementById('splashScreen');
  if(!splash) return;
  const hideSplash=()=>{
    splash.classList.add('hide');
    setTimeout(()=>splash.remove(),650);
  };
  window.addEventListener('load',()=>setTimeout(hideSplash,700),{once:true});
  setTimeout(hideSplash,2600);
})();
const API='https://api.alquran.cloud/v1';
const juzNames=[
'Juz 1','Juz 2','Juz 3','Juz 4','Juz 5','Juz 6','Juz 7','Juz 8','Juz 9','Juz 10',
'Juz 11','Juz 12','Juz 13','Juz 14','Juz 15','Juz 16','Juz 17','Juz 18','Juz 19','Juz 20',
'Juz 21','Juz 22','Juz 23','Juz 24','Juz 25','Juz 26','Juz 27','Juz 28','Juz 29','Juz 30'
];
const key='alquran_hafalan_v1';
const prayerKey='alquran_prayer_v1';
const reciters={alafasy:{name:'Mishary Rashid Alafasy',folder:'Alafasy_128kbps'},yasser:{name:'Yasser Al-Dosari',folder:'Yasser_Ad-Dussary_128kbps'},sudais:{name:'Abdurrahman As-Sudais',folder:'Abdurrahmaan_As-Sudais_192kbps'}};
let prayerState=JSON.parse(localStorage.getItem(prayerKey)||'null')||{enabled:false,sound:'makkah',times:{},date:'',location:'',played:{}};
let state=JSON.parse(localStorage.getItem(key)||'null')||{
  completed:[], targets:[1], reviews:[], notes:[], streak:0, lastDate:'', lastRead:{surah:'Al-Fatihah',ayah:1}
};
function save(){localStorage.setItem(key,JSON.stringify(state)); updateAll();}
function savePrayer(){localStorage.setItem(prayerKey,JSON.stringify(prayerState));}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove('show'),2200)}
function show(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById(page).classList.remove('hidden');
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  const label={home:'Beranda',quran:"Al-Qur'an",hafalan:'Target Hafalan',murojaah:'Murojaah',catatan:'Catatan',kiblat:'Cari Kiblat'}[page];
  document.getElementById('crumb').textContent=label;
  document.getElementById('title').textContent=page==='home'?"Assalamu'alaikum 🌙":label;
  // Tutup sidebar mobile setelah pilih menu (fix dead-end)
  const sb=document.getElementById('sidebar');
  if(sb) sb.classList.remove('open');
  const ov=document.getElementById('sidebarOverlay');
  if(ov) ov.classList.remove('show');
  if(page==='hafalan') renderTargets();
  if(page==='murojaah') renderReviews();
  if(page==='catatan') renderNotes();
  if(page==='kiblat') initKiblat();
}
document.querySelectorAll('.nav,[data-go]').forEach(el=>el.addEventListener('click',()=>show(el.dataset.page||el.dataset.go)));
document.getElementById('menu').onclick=()=>{
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('sidebarOverlay');
  sb.classList.toggle('open');
  if(ov) ov.classList.toggle('show', sb.classList.contains('open'));
};
document.getElementById('sidebarOverlay')?.addEventListener('click',()=>{
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
});
document.getElementById('theme').onclick=()=>document.body.classList.toggle('dark');

function updateAll(){
  const done=state.completed.length, pct=Math.round(done/30*100), rev=state.reviews.length;
  document.getElementById('doneStat').textContent=done+' Juz';
  document.getElementById('doneSub').textContent='Dari 30 Juz';
  document.getElementById('targetStat').textContent=state.targets.length;
  document.getElementById('reviewStat').textContent=rev;
  document.getElementById('streakStat').textContent=state.streak+' hari';
  document.getElementById('progressPercent').textContent=pct+'%';
  document.getElementById('progressBar').style.width=pct+'%';
  document.getElementById('hafalanPercent').textContent=pct+'%';
  document.getElementById('hafalanBar').style.width=pct+'%';
  document.getElementById('hafalanDone').textContent=done;
  const rp=Math.round(rev/30*100);
  document.getElementById('reviewRing').style.setProperty('--p',(rp*3.6)+'deg');
  document.getElementById('reviewRing').textContent=rp+'%';
  document.getElementById('reviewRingLarge').style.setProperty('--p',(rp*3.6)+'deg');
  document.getElementById('reviewRingLarge').textContent=rp+'%';
  document.getElementById('reviewBar').style.width=rp+'%';
  document.getElementById('reviewText').textContent=rev?`${rev} juz sudah dimurojaah hari ini`:'Belum ada murojaah';
  document.getElementById('reviewSummaryText').textContent=`${rev} dari 30 juz sudah dimurojaah hari ini.`;
  const mini=document.getElementById('juzMini'); mini.innerHTML='';
  for(let i=1;i<=30;i++){const s=document.createElement('span');s.textContent=i;s.className=state.completed.includes(i)?'done':'';mini.appendChild(s)}
  document.getElementById('lastSurah').textContent=state.lastRead.surah;
  document.getElementById('lastAyah').textContent='Ayat '+state.lastRead.ayah;
}
function dateText(){return new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())}
document.getElementById('todayDate').textContent=dateText();

function renderToday(){
  const box=document.getElementById('todayList');
  const targets=state.targets.slice(0,3);
  if(!targets.length){box.innerHTML='<div class="today-item"><div><b>Belum ada target</b><span>Tambahkan target hafalan.</span></div></div>';return}
  box.innerHTML=targets.map(j=>`<div class="today-item"><button class="check ${state.completed.includes(j)?'done':''}" data-juz="${j}">${state.completed.includes(j)?'✓':''}</button><div><b>Hafalan Juz ${j}</b><span>${state.completed.includes(j)?'Sudah ditandai selesai':'Target hafalan hari ini'}</span></div></div>`).join('');
  box.querySelectorAll('.check').forEach(b=>b.onclick=()=>toggleCompleted(+b.dataset.juz));
}
function toggleCompleted(j){
  if(state.completed.includes(j)) state.completed=state.completed.filter(x=>x!==j); else state.completed.push(j);
  save(); renderTargets(); renderToday();
}
function renderTargets(){
  const box=document.getElementById('targetCards');box.innerHTML='';
  for(let i=1;i<=30;i++){
    const done=state.completed.includes(i);
    const target=state.targets.includes(i);
    const el=document.createElement('div');el.className='target-card '+(done?'done':'');
    el.innerHTML=`<div class="target-top"><span class="juz-number">JUZ ${i}</span>${target?'<span class="status">TARGET</span>':''}</div><h4>${done?'Alhamdulillah, selesai!':'Target hafalan Juz '+i}</h4><p>${done?'Tandai ulang jika ingin mengulang target.':target?'Sedang menjadi target hafalan.':'Belum masuk target.'}</p><button data-j="${i}">${done?'✓ Selesai — Batalkan':' '+(target?'Hapus dari target':'Jadikan target')+' '}</button></div>`;
    el.querySelector('button').onclick=()=>{
      if(done){state.completed=state.completed.filter(x=>x!==i)}
      else if(target){state.targets=state.targets.filter(x=>x!==i)}
      else {state.targets.push(i)}
      save();renderTargets();renderToday();
    };box.appendChild(el);
  }
}
document.getElementById('addTarget').onclick=()=>{
  const next=[...Array(30)].map((_,i)=>i+1).find(i=>!state.targets.includes(i));
  if(next){state.targets.push(next);save();renderTargets();toast('Juz '+next+' ditambahkan ke target.')}else toast('Semua juz sudah menjadi target.');
};

function renderReviews(){
  const box=document.getElementById('reviewGrid');box.innerHTML='';
  for(let i=1;i<=30;i++){
    const done=state.reviews.includes(i), el=document.createElement('div');el.className='review-juz';
    el.innerHTML=`<b>Juz ${i}</b><span>${done?'Sudah murojaah hari ini':'Belum dimurojaah'}</span><button class="${done?'done':''}" data-j="${i}">${done?'✓ Sudah':'Tandai selesai'}</button>`;
    el.querySelector('button').onclick=()=>{state.reviews=done?state.reviews.filter(x=>x!==i):[...state.reviews,i]; save();renderReviews();};
    box.appendChild(el);
  }
}
document.getElementById('resetReview').onclick=()=>{if(confirm('Reset semua tanda murojaah hari ini?')){state.reviews=[];save();renderReviews();}};

let currentAudioAyah=null;
let autoNext=true;
let readerMode='surah';
let currentSurahNumber=1;
let currentJuzNumber=1;
let surahCatalogue=[];
const tafsirCache={};

function setReaderMode(mode){
  readerMode=mode;
  document.getElementById('surahChooser').classList.toggle('hidden',mode!=='surah');
  document.getElementById('juzChooser').classList.toggle('hidden',mode!=='juz');
  document.getElementById('surahTab').classList.toggle('active',mode==='surah');
  document.getElementById('juzTab').classList.toggle('active',mode==='juz');
  document.getElementById('tafsirSurahBtn').classList.toggle('hidden',mode!=='surah');
}
document.getElementById('surahTab').onclick=()=>setReaderMode('surah');
document.getElementById('juzTab').onclick=()=>setReaderMode('juz');

async function initSurahs(){
  const grid=document.getElementById('surahGrid');
  grid.innerHTML='<div class="loading">Memuat daftar surah...</div>';
  try{
    const res=await fetch(`${API}/surah`);
    if(!res.ok) throw new Error('Daftar surah gagal dimuat');
    const json=await res.json(); surahCatalogue=json.data||[];
    renderSurahGrid();
  }catch(e){grid.innerHTML='<p class="surah-list-error">Daftar surah belum dapat dimuat. Periksa koneksi internet.</p>'}
}
function renderSurahGrid(filter=''){
  const grid=document.getElementById('surahGrid');
  const q=filter.trim().toLowerCase();
  const items=surahCatalogue.filter(s=>!q||String(s.number).includes(q)||s.name.toLowerCase().includes(q)||s.englishName.toLowerCase().includes(q)||s.englishNameTranslation.toLowerCase().includes(q));
  grid.innerHTML='';
  if(!items.length){grid.innerHTML='<p class="surah-list-error">Surah tidak ditemukan.</p>';return}
  items.forEach(s=>{
    const item=document.createElement('div');item.className='surah-item';
    const b=document.createElement('button');b.type='button';b.className='surah-btn'+(readerMode==='surah'&&s.number===currentSurahNumber?' active':'');
    b.innerHTML=`<span class="surah-number">${s.number}</span><span class="surah-btn-info"><b>${escapeHtml(s.englishName)}</b><small>${s.numberOfAyahs} ayat</small></span><span class="surah-btn-ar" lang="ar" dir="rtl">${escapeHtml(s.name)}</span>`;
    b.onclick=()=>{setReaderMode('surah');loadSurah(s.number)};
    const tafsir=document.createElement('button');tafsir.type='button';tafsir.className='surah-list-tafsir';tafsir.textContent='Tafsir';tafsir.title=`Buka tafsir Surah ${s.englishName}`;
    tafsir.onclick=async()=>{await loadSurah(s.number);document.getElementById('tafsirSurahBtn').click()};
    item.append(b,tafsir);grid.appendChild(item);
  });
}
document.getElementById('surahFilter').addEventListener('input',e=>renderSurahGrid(e.target.value));

function normalizeAyah(a, fallbackSurah){
  return {...a,surah:a.surah||fallbackSurah};
}
function renderAyahs(ayahs, mode){
  const list=document.getElementById('ayahList');list.innerHTML='';
  ayahs.forEach(raw=>{
    const a=normalizeAyah(raw, raw.surah||null);
    const row=document.createElement('div');row.className='ayah';row.dataset.globalAyah=a.number;
    const surahName=a.surah?.name||''; const englishName=a.surah?.englishName||'';
    row.innerHTML=`<div class="ayah-meta"><span>${escapeHtml(surahName)} • ${escapeHtml(englishName)} • Ayat ${a.numberInSurah}</span><span>Juz ${a.juz}</span></div><div class="ayah-text" lang="ar" dir="rtl">${a.text}</div><div class="surah-name">${escapeHtml(surahName)} — ${escapeHtml(englishName)}</div><div class="ayah-tools"><button class="tiny play-audio" type="button">▶ Murottal</button><button class="tiny tafsir-ayah-btn" type="button">📖 Tafsir Ayat</button><button class="tiny" data-mark="${escapeHtml(englishName)}|${a.numberInSurah}" type="button">☆ Tandai</button><button class="tiny" data-read="${escapeHtml(englishName)}|${a.numberInSurah}" type="button">Simpan posisi</button></div><div class="tafsir-ayah-panel hidden" aria-live="polite"></div>`;
    row.querySelector('.play-audio').onclick=()=>playAyah(a,row,ayahs.map(x=>normalizeAyah(x,x.surah||a.surah)));
    row.querySelector('.tafsir-ayah-btn').onclick=()=>toggleAyahTafsir(a,row);
    row.querySelector('[data-read]').onclick=()=>{state.lastRead={surah:englishName,ayah:a.numberInSurah};save();toast('Posisi bacaan disimpan.');};
    row.querySelector('[data-mark]').onclick=()=>{state.lastRead={surah:englishName,ayah:a.numberInSurah};save();toast('Ayat ditandai sebagai posisi bacaan.');};
    list.appendChild(row);
  });
  document.getElementById('quranLoading').classList.add('hidden');
}

async function loadSurah(number){
  currentSurahNumber=Number(number);setReaderMode('surah');
  document.getElementById('readerJuz').textContent='Surah ke-'+number;
  document.getElementById('quranLoading').textContent='Memuat ayat Al-Qur\'an...';
  document.getElementById('quranLoading').classList.remove('hidden');
  document.getElementById('ayahList').innerHTML='';document.getElementById('tafsirSurahPanel').classList.add('hidden');hideAudio();
  try{
    const res=await fetch(`${API}/surah/${number}/quran-uthmani`);if(!res.ok)throw new Error('Gagal memuat surah');
    const json=await res.json(), data=json.data;
    document.getElementById('readerSurah').textContent=`${data.englishName} — ${data.name}`;
    document.getElementById('readerJuz').textContent=`Surah ${data.number} • ${data.numberOfAyahs} ayat`;
    renderAyahs(data.ayahs.map(a=>normalizeAyah(a,data)), 'surah');
    document.querySelectorAll('.surah-btn').forEach(b=>b.classList.toggle('active',Number(b.querySelector('.surah-number')?.textContent)===currentSurahNumber));
    document.querySelectorAll('.juz-btn').forEach(b=>b.classList.remove('active'));
  }catch(e){document.getElementById('quranLoading').textContent='Tidak dapat memuat surah. Pastikan perangkat terhubung ke internet, lalu coba lagi.';}
}

async function loadJuz(juz){
  currentJuzNumber=Number(juz);setReaderMode('juz');
  document.getElementById('readerJuz').textContent='Juz '+juz;
  document.getElementById('quranLoading').textContent='Memuat ayat Al-Qur\'an...';
  document.getElementById('quranLoading').classList.remove('hidden');
  document.getElementById('ayahList').innerHTML='';document.getElementById('tafsirSurahPanel').classList.add('hidden');hideAudio();
  try{
    const res=await fetch(`${API}/juz/${juz}/quran-uthmani`);if(!res.ok)throw new Error('Gagal');
    const json=await res.json(), ayahs=json.data.ayahs;
    const surahs=[...new Map(ayahs.map(a=>[a.surah.number,a.surah])).values()];
    document.getElementById('readerSurah').textContent=surahs.map(s=>`${s.name} (${s.englishName})`).join(' • ');
    renderAyahs(ayahs,'juz');
    document.querySelectorAll('.juz-btn').forEach(b=>b.classList.toggle('active',+b.dataset.juz===Number(juz)));
    document.querySelectorAll('.surah-btn').forEach(b=>b.classList.remove('active'));
  }catch(e){document.getElementById('quranLoading').textContent='Tidak dapat memuat Al-Qur’an. Pastikan perangkat terhubung ke internet, lalu coba lagi.';}
}

async function getSurahTafsir(number){
  if(tafsirCache[number])return tafsirCache[number];
  const res=await fetch(`https://equran.id/api/v2/tafsir/${number}`);
  if(!res.ok)throw new Error('Tafsir belum tersedia');
  const json=await res.json();
  const data=json.data;
  if(!data||!Array.isArray(data.tafsir))throw new Error('Format tafsir tidak dikenali');
  tafsirCache[number]=data;return data;
}
function showTafsirText(container, title, text){
  container.innerHTML='';
  const heading=document.createElement('b');heading.className='tafsir-title';heading.textContent=title;
  const paragraph=document.createElement('p');paragraph.textContent=text||'Tafsir untuk ayat ini belum tersedia.';
  container.append(heading,paragraph);container.classList.remove('hidden');
}
async function toggleAyahTafsir(a,row){
  const panel=row.querySelector('.tafsir-ayah-panel');
  if(!panel.classList.contains('hidden')){panel.classList.add('hidden');return}
  panel.classList.remove('hidden');panel.innerHTML='<span class="tafsir-loading">Memuat tafsir ayat...</span>';
  try{
    const number=a.surah.number;const data=await getSurahTafsir(number);
    const tafsir=data.tafsir.find(t=>Number(t.ayat)===Number(a.numberInSurah));
    showTafsirText(panel,`Tafsir ${data.namaLatin||a.surah.englishName} · Ayat ${a.numberInSurah}`,tafsir?.teks||'Tafsir untuk ayat ini belum tersedia.');
  }catch(e){panel.innerHTML='<p class="tafsir-error">Tafsir belum dapat dimuat. Periksa koneksi internet lalu coba lagi.</p>'}
}
document.getElementById('tafsirSurahBtn').onclick=async()=>{
  const panel=document.getElementById('tafsirSurahPanel');
  if(!panel.classList.contains('hidden')){panel.classList.add('hidden');return}
  panel.classList.remove('hidden');panel.innerHTML='<div class="tafsir-loading">Memuat tafsir surah...</div>';
  try{
    const data=await getSurahTafsir(currentSurahNumber);panel.innerHTML='';
    const heading=document.createElement('h4');heading.textContent=`Tafsir Surah ${data.namaLatin||data.nama||''}`;panel.appendChild(heading);
    const intro=document.createElement('p');intro.className='tafsir-intro';intro.textContent=data.arti?`Arti: ${data.arti}`:'Penjelasan tafsir per ayat';panel.appendChild(intro);
    data.tafsir.forEach(t=>{const item=document.createElement('div');item.className='tafsir-surah-item';const h=document.createElement('b');h.textContent=`Ayat ${t.ayat}`;const p=document.createElement('p');p.textContent=t.teks||'';item.append(h,p);panel.appendChild(item)});
  }catch(e){panel.innerHTML='<p class="tafsir-error">Tafsir surah belum dapat dimuat. Periksa koneksi internet lalu coba lagi.</p>'}
};

function audioUrl(a){
  const r=reciters[document.getElementById('reciterSelect')?.value||'alafasy'];
  const pad=n=>String(n).padStart(3,'0');
  return `https://everyayah.com/data/${r.folder}/${pad(a.surah.number)}${pad(a.numberInSurah)}.mp3`;
}
function playAyah(a,row,ayahs){
  const audio=document.getElementById('murottalAudio');
  const player=document.getElementById('audioPlayer');
  const reciter=reciters[document.getElementById('reciterSelect')?.value||'alafasy'];
  document.querySelectorAll('.ayah.playing').forEach(x=>x.classList.remove('playing'));
  row.classList.add('playing'); currentAudioAyah=a.number;
  document.getElementById('audioTitle').textContent='Murottal • '+reciter.name;
  document.getElementById('audioSub').textContent=`${a.surah.name} • ${a.surah.englishName} • Ayat ${a.numberInSurah}`;
  audio.src=audioUrl(a); player.classList.add('show');
  audio.play().catch(()=>toast('Tekan tombol play pada pemutar audio untuk memulai.'));
  row.scrollIntoView({behavior:'smooth',block:'center'});
  audio.onended=()=>{if(!autoNext)return;const idx=ayahs.findIndex(x=>x.number===a.number);if(idx>=0&&idx<ayahs.length-1){const next=ayahs[idx+1],nextRow=document.querySelector(`[data-global-ayah="${next.number}"]`);if(nextRow)playAyah(next,nextRow,ayahs)}else row.classList.remove('playing')};
}
function hideAudio(){
  const audio=document.getElementById('murottalAudio');
  audio.pause(); audio.removeAttribute('src'); audio.load();
  document.getElementById('audioPlayer').classList.remove('show');
  document.querySelectorAll('.ayah.playing').forEach(x=>x.classList.remove('playing'));
}
document.getElementById('closeAudio').onclick=hideAudio;

function initJuz(){
  const grid=document.getElementById('juzGrid');
  for(let i=1;i<=30;i++){const b=document.createElement('button');b.className='juz-btn';b.dataset.juz=i;b.textContent='Juz '+i;b.onclick=()=>loadJuz(i);grid.appendChild(b)}
}
document.getElementById('randomAyah').onclick=async()=>{
  try{const r=await fetch(`${API}/ayah/random/quran-uthmani`),j=await r.json();loadSurah(j.data.surah.number);toast(`Membuka Surah ${j.data.surah.englishName} ayat ${j.data.numberInSurah}.`)}
  catch(e){toast('Ayat acak belum bisa dimuat.')}
};

function renderNotes(){
  const box=document.getElementById('notesList');
  box.innerHTML=state.notes.length?state.notes.slice().reverse().map((n,idx)=>`<div class="note"><b>${escapeHtml(n.title)}</b><small>${escapeHtml(n.date)}</small><p>${escapeHtml(n.body)}</p></div>`).join(''):'<p style="font-size:9px;color:var(--muted)">Belum ada catatan.</p>';
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
document.getElementById('saveNote').onclick=()=>{
  const title=document.getElementById('noteTitle').value.trim(), body=document.getElementById('noteBody').value.trim();
  if(!title||!body){toast('Isi judul dan catatan terlebih dahulu.');return}
  state.notes.push({title,body,date:dateText()});document.getElementById('noteTitle').value='';document.getElementById('noteBody').value='';save();renderNotes();toast('Catatan disimpan. 🤍');
};
document.getElementById('search').addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();
  if(!q)return;
  show('quran');
  const num=parseInt(q.replace(/\D/g,''),10);
  if(/^juz\s*\d+$/i.test(q)&&num>=1&&num<=30){loadJuz(num);return;}
  if(surahCatalogue.length){
    document.getElementById('surahFilter').value=q;renderSurahGrid(q);setReaderMode('surah');
    const exact=surahCatalogue.find(s=>s.englishName.toLowerCase()===q||s.name.toLowerCase()===q||String(s.number)===q);
    if(exact)loadSurah(exact.number);
  }
});
document.getElementById('readerTop').onclick=()=>document.getElementById('quran').scrollIntoView({behavior:'smooth'});

async function loadPrayerTimes(){
  const loc=document.getElementById('prayerLocation'); loc.textContent='Memuat lokasi dan jadwal shalat...';
  try{
    const pos=await new Promise((resolve,reject)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:8000,maximumAge:600000}):reject());
    const {latitude,longitude}=pos.coords;
    const res=await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=20`);
    const json=await res.json(); const t=json.data.timings;
    prayerState.times={Fajr:t.Fajr,Dhuhr:t.Dhuhr,Asr:t.Asr,Maghrib:t.Maghrib,Isha:t.Isha};
    prayerState.date=json.data.date.gregorian.date; prayerState.location='Lokasi perangkat • jadwal otomatis'; savePrayer();
  }catch(e){
    const now=new Date(); const res=await fetch(`https://api.aladhan.com/v1/timingsByCity?city=Bekasi&country=Indonesia&method=20`); const json=await res.json(); const t=json.data.timings;
    prayerState.times={Fajr:t.Fajr,Dhuhr:t.Dhuhr,Asr:t.Asr,Maghrib:t.Maghrib,Isha:t.Isha}; prayerState.date=json.data.date.gregorian.date; prayerState.location='Bekasi, Indonesia'; savePrayer();
  }
  renderPrayer();
}
function renderPrayer(){
  const box=document.getElementById('prayerTimes'), loc=document.getElementById('prayerLocation');
  loc.textContent=prayerState.location||'Jadwal shalat';
  const names={Fajr:'Subuh',Dhuhr:'Dzuhur',Asr:'Ashar',Maghrib:'Maghrib',Isha:'Isya'};
  box.innerHTML=Object.entries(prayerState.times||{}).map(([k,v])=>`<div class="prayer-time"><b>${names[k]}</b><span>${String(v).slice(0,5)}</span></div>`).join('')||'<div class="loading">Jadwal belum tersedia.</div>';
  document.getElementById('adhanEnabled').checked=!!prayerState.enabled;
  document.getElementById('adhanSound').value='marwan'; prayerState.sound='marwan';
}
function adhanUrl(){return './audio/adhan-madina.mp3'}
function playAdhan(manual=false){const a=document.getElementById('adhanAudio');a.src=adhanUrl();a.play().then(()=>{if(manual)toast('Adzan diputar.');}).catch(()=>toast('Browser memerlukan interaksi untuk memulai audio.'))}
function checkPrayerTimes(){
  if(!prayerState.enabled||!prayerState.times)return; const now=new Date(); const hm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'); const today=now.toDateString();
  Object.entries(prayerState.times).forEach(([name,time])=>{const key=today+'_'+name;if(String(time).slice(0,5)===hm&&!prayerState.played[key]){prayerState.played[key]=true;savePrayer();playAdhan();toast('Masuk waktu '+({Fajr:'Subuh',Dhuhr:'Dzuhur',Asr:'Ashar',Maghrib:'Maghrib',Isha:'Isya'}[name])+'.')}})
}
document.getElementById('adhanEnabled').onchange=e=>{prayerState.enabled=e.target.checked;savePrayer();toast(e.target.checked?'Mode adzan otomatis aktif.':'Mode adzan otomatis dimatikan.')};
document.getElementById('adhanSound').onchange=e=>{prayerState.sound='marwan';savePrayer();toast('Suara adzan Muhammad Marwan Al-Qassas dipilih.')};
document.getElementById('testAdhan').onclick=()=>playAdhan(true);
document.getElementById('refreshPrayer').onclick=loadPrayerTimes;
document.getElementById('reciterSelect').onchange=()=>toast('Qari diganti ke '+reciters[document.getElementById('reciterSelect').value].name+'.');
loadPrayerTimes(); setInterval(checkPrayerTimes,30000); setTimeout(checkPrayerTimes,1000);

initJuz(); initSurahs(); setReaderMode('surah'); updateAll(); renderToday(); renderTargets(); renderReviews(); renderNotes(); loadSurah(1);



/* ===== CARI KIBLAT (kompas responsif + mode laptop drag) ===== */
const KAABA = { lat: 21.422487, lng: 39.826206 };
let kiblatWatchId = null;
let kiblatOrientationHandler = null;
let currentHeading = 0;
let qiblaBearing = 0;
let userLat = null, userLng = null;
let smoothedHeading = 0;
let lastOrientTs = 0;
let hasRealCompass = false;
let dragActive = false;
let dragStartAngle = 0;
let dragStartHeading = 0;

function toRad(d){ return d * Math.PI / 180; }
function toDeg(r){ return r * 180 / Math.PI; }

function calculateQibla(lat, lng){
  const φ1 = toRad(lat), φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
  let θ = toDeg(Math.atan2(y, x));
  return (θ + 360) % 360;
}

function angleDiff(a, b){
  return (b - a + 540) % 360 - 180;
}

function setHeading(h){
  currentHeading = ((h % 360) + 360) % 360;
  smoothedHeading = currentHeading;
  updateKiblatUI();
  const slider = document.getElementById('kiblatSlider');
  if(slider && document.activeElement !== slider) slider.value = Math.round(currentHeading);
}

function updateKiblatUI(){
  const needle = document.getElementById('kiblatNeedle');
  const compass = document.getElementById('kiblatCompass');
  const degEl = document.getElementById('kiblatDegree');
  const dirEl = document.getElementById('kiblatDirection');
  const liveEl = document.getElementById('kiblatLiveHeading');
  if(!needle) return;

  const relative = (qiblaBearing - smoothedHeading + 360) % 360;
  needle.style.transform = `rotate(${relative}deg)`;
  if(compass) compass.style.transform = `rotate(${-smoothedHeading}deg)`;

  if(degEl) degEl.textContent = Math.round(qiblaBearing) + '°';
  const dirs = ['Utara','Timur Laut','Timur','Tenggara','Selatan','Barat Daya','Barat','Barat Laut'];
  const idx = Math.round(((qiblaBearing % 360) + 360) % 360 / 45) % 8;
  if(dirEl) dirEl.textContent = dirs[idx];
  if(liveEl) liveEl.textContent = Math.round(smoothedHeading) + '°';
}

function handleDeviceOrientation(e){
  let heading = null;
  if(typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)){
    heading = e.webkitCompassHeading;
  } else if(e.absolute === true && typeof e.alpha === 'number'){
    heading = (360 - e.alpha) % 360;
  } else if(typeof e.alpha === 'number'){
    heading = (360 - e.alpha) % 360;
  }
  if(heading == null || isNaN(heading)) return;

  hasRealCompass = true;
  const now = performance.now();
  const dt = Math.min(100, now - (lastOrientTs || now));
  lastOrientTs = now;
  const alpha = Math.min(0.35, dt / 40);
  const delta = angleDiff(smoothedHeading, heading);
  smoothedHeading = (smoothedHeading + delta * (0.45 + alpha * 0.4) + 360) % 360;
  currentHeading = heading;
  updateKiblatUI();

  const status = document.getElementById('kiblatStatus');
  if(status && status.dataset.mode !== 'ok'){
    status.dataset.mode = 'ok';
    status.textContent = 'Kompas sensor aktif — putar HP, jarum mengikuti';
  }
  // Sembunyikan kontrol manual kalau sensor beneran ada
  const manual = document.getElementById('kiblatManual');
  if(manual) manual.classList.add('hidden');
}

function startOrientation(){
  const status = document.getElementById('kiblatStatus');
  stopOrientationOnly();
  kiblatOrientationHandler = handleDeviceOrientation;

  function attach(){
    window.addEventListener('deviceorientationabsolute', handleDeviceOrientation, true);
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
  }

  if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
    DeviceOrientationEvent.requestPermission()
      .then(state=>{
        if(state === 'granted'){
          attach();
          if(status) status.textContent = 'Kompas aktif — putar HP';
        } else {
          enableManualMode('Izin sensor ditolak. Pakai mode manual (geser / slider) di bawah.');
        }
      })
      .catch(()=> enableManualMode('Gagal minta izin. Pakai mode manual di bawah.'));
  } else if(window.DeviceOrientationEvent){
    attach();
    // Setelah 1.5 detik kalau belum dapat event → laptop / tidak ada sensor
    setTimeout(()=>{
      if(!hasRealCompass) enableManualMode('Tidak terdeteksi sensor kompas (laptop?). Geser kompas atau pakai slider untuk memutar.');
    }, 1500);
  } else {
    enableManualMode('Perangkat tidak mendukung sensor. Geser kompas atau pakai slider.');
  }
}

function enableManualMode(msg){
  const status = document.getElementById('kiblatStatus');
  const manual = document.getElementById('kiblatManual');
  if(status){
    status.dataset.mode = 'manual';
    status.textContent = msg || 'Mode manual: geser kompas atau geser slider.';
  }
  if(manual) manual.classList.remove('hidden');
  setupDragAndSlider();
}

function stopOrientationOnly(){
  if(kiblatOrientationHandler){
    window.removeEventListener('deviceorientationabsolute', kiblatOrientationHandler, true);
    window.removeEventListener('deviceorientation', kiblatOrientationHandler, true);
    kiblatOrientationHandler = null;
  }
}

function stopKiblat(){
  stopOrientationOnly();
  if(kiblatWatchId != null && navigator.geolocation){
    navigator.geolocation.clearWatch(kiblatWatchId);
    kiblatWatchId = null;
  }
  hasRealCompass = false;
}

function getAngleFromEvent(e, el){
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const dx = clientX - cx;
  const dy = clientY - cy;
  // 0 = atas (utara visual), naik searah jarum jam
  let ang = Math.atan2(dx, -dy) * 180 / Math.PI;
  return (ang + 360) % 360;
}

function setupDragAndSlider(){
  const wrap = document.getElementById('kiblatCompassWrap') || document.querySelector('.kiblat-compass-wrap');
  const slider = document.getElementById('kiblatSlider');
  if(!wrap || wrap.dataset.dragReady) return;
  wrap.dataset.dragReady = '1';
  wrap.style.cursor = 'grab';

  function onStart(e){
    if(hasRealCompass) return;
    e.preventDefault();
    dragActive = true;
    wrap.style.cursor = 'grabbing';
    dragStartAngle = getAngleFromEvent(e, wrap);
    dragStartHeading = currentHeading;
  }
  function onMove(e){
    if(!dragActive || hasRealCompass) return;
    e.preventDefault();
    const ang = getAngleFromEvent(e, wrap);
    const delta = angleDiff(dragStartAngle, ang);
    // Geser jarum jari = putar heading berlawanan (biar terasa natural)
    setHeading(dragStartHeading - delta);
  }
  function onEnd(){
    dragActive = false;
    if(wrap) wrap.style.cursor = 'grab';
  }

  wrap.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  wrap.addEventListener('touchstart', onStart, {passive:false});
  window.addEventListener('touchmove', onMove, {passive:false});
  window.addEventListener('touchend', onEnd);

  if(slider && !slider.dataset.ready){
    slider.dataset.ready = '1';
    slider.addEventListener('input', ()=>{
      if(hasRealCompass) return;
      setHeading(Number(slider.value));
    });
  }
}

function initKiblat(){
  const status = document.getElementById('kiblatStatus');
  const locEl = document.getElementById('kiblatLocation');
  if(!status) return;

  status.dataset.mode = '';
  status.textContent = 'Mencari lokasi GPS...';
  stopKiblat();
  smoothedHeading = 0;
  currentHeading = 0;
  updateKiblatUI();

  // Setup drag lebih awal supaya langsung bisa diputar di laptop
  setupDragAndSlider();

  if(!navigator.geolocation){
    // Fallback lokasi default (Jakarta) supaya bearing tetap ada
    userLat = -6.2088; userLng = 106.8456;
    qiblaBearing = calculateQibla(userLat, userLng);
    if(locEl) locEl.textContent = 'Default: Jakarta (izinkan GPS di HP)';
    const bearingEl = document.getElementById('kiblatBearing');
    if(bearingEl) bearingEl.textContent = Math.round(qiblaBearing) + '° dari Utara';
    updateKiblatUI();
    enableManualMode('GPS tidak tersedia. Mode manual aktif — geser kompas atau slider.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos=>{
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      qiblaBearing = calculateQibla(userLat, userLng);
      if(locEl) locEl.textContent = userLat.toFixed(5) + ', ' + userLng.toFixed(5);
      const bearingEl = document.getElementById('kiblatBearing');
      if(bearingEl) bearingEl.textContent = Math.round(qiblaBearing) + '° dari Utara';
      updateKiblatUI();
      startOrientation();
      kiblatWatchId = navigator.geolocation.watchPosition(p=>{
        userLat = p.coords.latitude;
        userLng = p.coords.longitude;
        qiblaBearing = calculateQibla(userLat, userLng);
        if(bearingEl) bearingEl.textContent = Math.round(qiblaBearing) + '° dari Utara';
        if(locEl) locEl.textContent = userLat.toFixed(5) + ', ' + userLng.toFixed(5);
        updateKiblatUI();
      }, null, { enableHighAccuracy: true, maximumAge: 8000, timeout: 15000 });
    },
    err=>{
      // Tetap kasih bearing dari lokasi default biar jarum ada arti
      userLat = -6.2088; userLng = 106.8456;
      qiblaBearing = calculateQibla(userLat, userLng);
      if(locEl) locEl.textContent = 'Perkiraan: Jakarta (izinkan lokasi untuk akurat)';
      const bearingEl = document.getElementById('kiblatBearing');
      if(bearingEl) bearingEl.textContent = Math.round(qiblaBearing) + '° dari Utara';
      updateKiblatUI();
      let msg = 'Lokasi ditolak/gagal. ';
      if(err.code === 1) msg += 'Izinkan lokasi di browser. ';
      msg += 'Mode manual aktif — geser kompas atau slider.';
      enableManualMode(msg);
      startOrientation(); // tetap coba sensor
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}

document.getElementById('startKiblat')?.addEventListener('click', initKiblat);
