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
  const label={home:'Beranda',quran:"Al-Qur'an",hafalan:'Target Hafalan',murojaah:'Murojaah',catatan:'Catatan'}[page];
  document.getElementById('crumb').textContent=label;
  document.getElementById('title').textContent=page==='home'?"Assalamu'alaikum 🌙":label;
  if(page==='hafalan') renderTargets();
  if(page==='murojaah') renderReviews();
  if(page==='catatan') renderNotes();
}
document.querySelectorAll('.nav,[data-go]').forEach(el=>el.addEventListener('click',()=>show(el.dataset.page||el.dataset.go)));
document.getElementById('menu').onclick=()=>document.getElementById('sidebar').classList.toggle('open');
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

async function loadJuz(juz){
  document.getElementById('readerJuz').textContent='Juz '+juz;
  document.getElementById('quranLoading').classList.remove('hidden');
  document.getElementById('ayahList').innerHTML='';
  hideAudio();
  try{
    const res=await fetch(`${API}/juz/${juz}/quran-uthmani`);
    if(!res.ok) throw new Error('Gagal');
    const json=await res.json(), ayahs=json.data.ayahs;
    const surahs=[...new Map(ayahs.map(a=>[a.surah.number,a.surah])).values()];
    document.getElementById('readerSurah').textContent=surahs.map(s=>`${s.name} (${s.englishName})`).join(' • ');
    const list=document.getElementById('ayahList');
    ayahs.forEach(a=>{
      const row=document.createElement('div');row.className='ayah';row.dataset.globalAyah=a.number;
      row.innerHTML=`<div class="ayah-meta"><span>${a.surah.name} • ${a.surah.englishName} • Ayat ${a.numberInSurah}</span><span>Juz ${a.juz}</span></div><div class="ayah-text">${a.text}</div><div class="surah-name">${a.surah.name} — ${a.surah.englishName}</div><div class="ayah-tools"><button class="tiny play-audio">▶ Murottal</button><button class="tiny" data-mark="${a.surah.englishName}|${a.numberInSurah}">☆ Tandai</button><button class="tiny" data-read="${a.surah.englishName}|${a.numberInSurah}">Simpan posisi</button></div>`;
      row.querySelector('.play-audio').onclick=()=>playAyah(a,row,ayahs);
      row.querySelector('[data-read]').onclick=()=>{state.lastRead={surah:a.surah.englishName,ayah:a.numberInSurah};save();toast('Posisi bacaan disimpan.');};
      row.querySelector('[data-mark]').onclick=()=>{state.lastRead={surah:a.surah.englishName,ayah:a.numberInSurah};save();toast('Ayat ditandai sebagai posisi bacaan.');};
      list.appendChild(row);
    });
    document.getElementById('quranLoading').classList.add('hidden');
    document.querySelectorAll('.juz-btn').forEach(b=>b.classList.toggle('active',+b.dataset.juz===juz));
  }catch(e){
    document.getElementById('quranLoading').textContent='Tidak dapat memuat Al-Qur’an. Pastikan perangkat terhubung ke internet, lalu coba lagi.';
  }
}

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
  try{const r=await fetch(`${API}/ayah/random/quran-uthmani`),j=await r.json();loadJuz(j.data.juz);toast(`Membuka Juz ${j.data.juz}, ${j.data.surah.englishName} ayat ${j.data.numberInSurah}.`)}
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
  if(num>=1&&num<=30){loadJuz(num)}
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
function adhanUrl(){return 'https://www.islamcan.com/audio/adhan/azan1.mp3'}
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

initJuz(); updateAll(); renderToday(); renderTargets(); renderReviews(); renderNotes(); loadJuz(1);
