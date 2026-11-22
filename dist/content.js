(function(){"use strict";function A(u,t){let e=0;const i=u.length;for(let a=0;a<i;a++){const n=u[a]-t[a];e+=n*n}return e}class q{constructor(t={}){this.k=t.k??5,this.maxDistance=t.maxDistance??2.2,this.minConfidence=t.minConfidence??.55,this.samples=[]}addSample(t,e){const i=String(t||"").trim().toUpperCase();return!i||!Array.isArray(e)||e.length===0?!1:(this.samples.push({label:i,vector:Array.from(e)}),!0)}removeLabel(t){const e=String(t||"").trim().toUpperCase(),i=this.samples.length;return this.samples=this.samples.filter(a=>a.label!==e),i-this.samples.length}clear(){this.samples=[]}getLabelCounts(){const t={};for(const e of this.samples)t[e.label]=(t[e.label]||0)+1;return t}get sampleCount(){return this.samples.length}predict(t,e="all"){var v;const i=typeof performance<"u"?performance.now():Date.now();if(!Array.isArray(t)||this.samples.length===0)return{label:null,confidence:0,distance:1/0,latencyMs:0};const a=e==="letters"?this.samples.filter(h=>h.label.length===1):e==="words"?this.samples.filter(h=>h.label.length>1):this.samples;if(a.length===0)return{label:null,confidence:0,distance:1/0,latencyMs:0};const n=Math.min(this.k,a.length),s=new Array(a.length),r=new Array(t.length);for(let h=0;h<t.length;h+=3)r[h]=-t[h],r[h+1]=t[h+1],r[h+2]=t[h+2];for(let h=0;h<a.length;h++){const g=a[h];if(g.vector.length!==t.length){s[h]={label:g.label,dist:1/0};continue}const y=A(t,g.vector),J=A(r,g.vector);s[h]={label:g.label,dist:Math.sqrt(Math.min(y,J))}}s.sort((h,g)=>h.dist-g.dist);const l=s.slice(0,n),d=((v=l[0])==null?void 0:v.dist)??1/0;if(d>this.maxDistance){const h=typeof performance<"u"?performance.now():Date.now();return{label:null,confidence:0,distance:d,latencyMs:h-i}}const c={};let o=0;const p=1e-4;for(const h of l){if(!Number.isFinite(h.dist))continue;const g=1/(h.dist+p);c[h.label]=(c[h.label]||0)+g,o+=g}let S=null,k=0;for(const[h,g]of Object.entries(c))g>k&&(k=g,S=h);const m=o>0?k/o:0,x=typeof performance<"u"?performance.now():Date.now();return m<this.minConfidence?{label:null,confidence:m,distance:d,latencyMs:x-i}:{label:S,confidence:m,distance:d,latencyMs:x-i}}exportDataset(){return{version:1,updatedAt:new Date().toISOString(),samples:this.samples}}importDataset(t,e=!1){if(!t||!Array.isArray(t.samples))return 0;e||(this.samples=[]);let i=0;for(const a of t.samples)a&&this.addSample(a.label,a.vector)&&i++;return i}}class U{constructor(t={}){this.windowSize=t.windowSize??7,this.minConsensus=t.minConsensus??5,this.cooldownMs=t.cooldownMs??1200,this.preventConsecutiveDuplicate=t.preventConsecutiveDuplicate??!1,this.maxMotionDelta=t.maxMotionDelta??.22,this.buffer=[],this.prevVector=null,this.lastCommittedLabel=null,this.lastCommittedAt=0}_computeMotion(t){if(!Array.isArray(t)||t.length===0)return this.prevVector=null,0;if(!this.prevVector||this.prevVector.length!==t.length)return this.prevVector=t,0;const e=A(t,this.prevVector);return this.prevVector=t,Math.sqrt(e/21)}push(t,e=Date.now(),i=null){const a=i?this._computeMotion(i):0;if(i&&a>this.maxMotionDelta)return{stableLabel:null,committed:!1,holdProgress:0,candidateLabel:t};if(this.buffer.push(t),this.buffer.length>this.windowSize&&this.buffer.shift(),!t)return this.buffer.every(o=>o===null)&&(this.lastCommittedLabel=null),{stableLabel:null,committed:!1,holdProgress:0,candidateLabel:null};const n={};for(const o of this.buffer)o&&(n[o]=(n[o]||0)+1);let s=null,r=0;for(const[o,p]of Object.entries(n))p>r&&(r=p,s=o);const l=Math.min(1,r/Math.max(1,this.minConsensus));if(!s||r<this.minConsensus)return{stableLabel:null,committed:!1,holdProgress:l,candidateLabel:s};const d=s===this.lastCommittedLabel;return d&&e-this.lastCommittedAt<this.cooldownMs||this.preventConsecutiveDuplicate&&d?{stableLabel:s,committed:!1,holdProgress:1,candidateLabel:s}:(this.lastCommittedLabel=s,this.lastCommittedAt=e,{stableLabel:s,committed:!0,holdProgress:1,candidateLabel:s})}reset(){this.buffer=[],this.prevVector=null,this.lastCommittedLabel=null,this.lastCommittedAt=0}}const E={air:"signs/words/air.mp4",belajar:"signs/words/belajar.mp4",cari:"signs/words/cari.mp4",hari:"signs/words/hari.mp4",ingat:"signs/words/ingat.mp4",lagi:"signs/words/lagi.mp4",maaf:"signs/words/maaf.mp4",makan:"signs/words/makan.mp4",motor:"signs/words/motor.mp4",saya:"signs/words/saya.mp4",aku:"signs/words/saya.mp4",terima:"signs/words/terima.mp4",tuli:"signs/words/tuli.mp4",apa:"signs/words/apa.mp4",siapa:"signs/words/siapa.mp4",kapan:"signs/words/kapan.mp4",dimana:"signs/words/dimana.mp4",mana:"signs/words/dimana.mp4",mengapa:"signs/words/mengapa.mp4",kenapa:"signs/words/mengapa.mp4",bagaimana:"signs/words/bagaimana.mp4",merah:"signs/words/merah.mp4",kuning:"signs/words/kuning.mp4",hijau:"signs/words/hijau.mp4",hitam:"signs/words/hitam.mp4",dengar:"signs/words/dengar.mp4",berangkat:"signs/words/berangkat.mp4",pergi:"signs/words/berangkat.mp4",datang:"signs/words/datang.mp4",teman:"signs/words/teman.mp4",keluarga:"signs/words/keluarga.mp4",rumah:"signs/words/rumah.mp4",pagi:"signs/words/pagi.mp4",siang:"signs/words/siang.mp4",sore:"signs/words/sore.mp4",malam:"signs/words/malam.mp4"},f={air:{label:"AIR",cue:'Isyarat BISINDO untuk "Air"',icon:"💧"},cari:{label:"CARI",cue:'Isyarat BISINDO untuk "Cari"',icon:"🔍"},hari:{label:"HARI",cue:'Isyarat BISINDO untuk "Hari"',icon:"📅"},lagi:{label:"LAGI",cue:'Isyarat BISINDO untuk "Lagi"',icon:"🔁"},motor:{label:"MOTOR",cue:'Isyarat BISINDO untuk "Motor"',icon:"🏍️"},tuli:{label:"TULI",cue:'Isyarat BISINDO untuk "Tuli"',icon:"🤟"},mengapa:{label:"MENGAPA",cue:'Isyarat BISINDO untuk "Mengapa"',icon:"🤔"},merah:{label:"MERAH",cue:'Isyarat BISINDO untuk warna "Merah"',icon:"🔴"},kuning:{label:"KUNING",cue:'Isyarat BISINDO untuk warna "Kuning"',icon:"🟡"},hijau:{label:"HIJAU",cue:'Isyarat BISINDO untuk warna "Hijau"',icon:"🟢"},hitam:{label:"HITAM",cue:'Isyarat BISINDO untuk warna "Hitam"',icon:"⚫"},berangkat:{label:"BERANGKAT",cue:'Isyarat BISINDO untuk "Berangkat"',icon:"🚶"},aku:{label:"AKU",cue:"Tunjuk dada sendiri dengan jari telunjuk",icon:"☝️"},saya:{label:"SAYA",cue:"Tunjuk dada sendiri dengan jari telunjuk",icon:"☝️"},kamu:{label:"KAMU",cue:"Tunjuk ke arah lawan bicara dengan jari telunjuk",icon:"👉"},anda:{label:"ANDA",cue:"Arahkan telapak tangan terbuka ke arah lawan bicara",icon:"🫱"},kita:{label:"KITA",cue:"Gerakkan jari telunjuk melingkar dari bahu kanan ke bahu kiri",icon:"🤝"},kami:{label:"KAMI",cue:"Sentuh bahu kanan lalu bahu kiri dengan jari telunjuk",icon:"👥"},dia:{label:"DIA",cue:"Tunjuk ke samping dengan jari telunjuk",icon:"👈"},mereka:{label:"MEREKA",cue:"Sapukan jari telunjuk menyamping mencakup beberapa orang",icon:"👥"},halo:{label:"HALO",cue:"Lambaikan telapak tangan terbuka di samping kepala",icon:"👋"},hai:{label:"HAI",cue:"Lambaikan telapak tangan terbuka ke arah lawan bicara",icon:"👋"},selamat:{label:"SELAMAT",cue:"Tepuk kedua tangan atau rangkul tangan di depan dada",icon:"🎉"},terima:{label:"TERIMA KASIH",cue:"Sentuh dagu dengan ujung jari lalu gerakkan maju",icon:"🙏"},sama:{label:"SAMA-SAMA",cue:"Arahkan kedua telapak tangan terbuka bergantian ke depan",icon:"🤲"},maaf:{label:"MAAF",cue:"Kepalkan tangan dan putar lembut di depan dada",icon:"🤝"},tolong:{label:"TOLONG",cue:"Letakkan kepalan tangan dengan ibu jari ke atas di atas telapak tangan lain, angkat bersama",icon:"🤲"},permisi:{label:"PERMISI",cue:"Usap punggung tangan kiri dengan ujung jari kanan ke depan",icon:"🙇"},suka:{label:"SUKA",cue:"Letakkan ibu jari & jari tengah di dada lalu tarik maju sambil menguncup",icon:"💚"},cinta:{label:"CINTA",cue:"Silangkan kedua tangan di depan dada seperti memeluk",icon:"🫶"},sayang:{label:"SAYANG",cue:"Silangkan kedua tangan di dada dengan lembut",icon:"❤️"},senang:{label:"SENANG",cue:"Usap dada ke atas dengan telapak tangan terbuka sambil tersenyum",icon:"😊"},bahagia:{label:"BAHAGIA",cue:"Gerakkan kedua telapak tangan ke atas di depan dada berulang kali",icon:"😄"},sedih:{label:"SEDIH",cue:"Turunkan kedua telapak tangan di depan wajah secara perlahan",icon:"😢"},marah:{label:"MARAH",cue:"Tekuk jari seperti cakar di depan wajah lalu tarik ke depan",icon:"😠"},takut:{label:"TAKUT",cue:"Buka kedua tangan di depan dada lalu getarkan sedikit ke dalam",icon:"😨"},capek:{label:"CAPEK",cue:"Letakkan kedua tangan di dada lalu turunkan bahu sambil menghela",icon:"😮‍💨"},sakit:{label:"SAKIT",cue:"Putar kedua jari telunjuk saling berhadapan di dekat bagian yang sakit",icon:"🤕"},lapar:{label:"LAPAR",cue:"Bentuk tangan huruf C lalu turunkan dari dada ke perut",icon:"🍽️"},haus:{label:"HAUS",cue:"Tarik jari telunjuk turun di sepanjang leher",icon:"💧"},ya:{label:"YA",cue:"Kepalkan tangan lalu anggukkan pergelangan tangan ke bawah",icon:"👍"},iya:{label:"IYA",cue:"Kepalkan tangan lalu anggukkan pergelangan tangan ke bawah",icon:"👍"},oke:{label:"OKE",cue:"Temukan ujung ibu jari & telunjuk membentuk lingkaran O, 3 jari lain tegak",icon:"👌"},tidak:{label:"TIDAK",cue:"Gelengkan telapak tangan atau jari telunjuk ke kiri dan kanan",icon:"🙅"},bukan:{label:"BUKAN",cue:"Letakkan ibu jari di bawah dagu lalu jentikkan ke depan",icon:"🚫"},bagus:{label:"BAGUS",cue:"Acungkan ibu jari ke atas dengan mantap",icon:"👍"},baik:{label:"BAIK",cue:"Sentuh dagu dengan telapak tangan lalu turunkan ke telapak tangan lain",icon:"✨"},buruk:{label:"BURUK",cue:"Sentuh dagu lalu balikkan telapak tangan mengarah ke bawah",icon:"👎"},besar:{label:"BESAR",cue:"Rentangkan kedua tangan menjauh ke kiri dan kanan",icon:"↔️"},kecil:{label:"KECIL",cue:"Dekatkan kedua telapak tangan saling berhadapan",icon:"🤏"},banyak:{label:"BANYAK",cue:"Buka kedua kepalan tangan melebar berkali-kali",icon:"🙌"},sedikit:{label:"SEDIKIT",cue:"Jepit tipis ujung ibu jari dan jari telunjuk",icon:"🤏"},cepat:{label:"CEPAT",cue:"Tarik kedua tangan bentuk L ke belakang dengan cepat",icon:"⚡"},pelan:{label:"PELAN",cue:"Usap punggung tangan kiri perlahan ke atas dengan tangan kanan",icon:"🐢"},mau:{label:"MAU",cue:"Buka kedua telapak tangan menghadap atas lalu tarik ke arah tubuh",icon:"🙋"},ingin:{label:"INGIN",cue:"Tarik kedua tangan terbuka ke arah dada",icon:"🙋"},bisa:{label:"BISA",cue:"Kepalkan kedua tangan lalu turunkan bersamaan dengan mantap",icon:"💪"},makan:{label:"MAKAN",cue:"Kuncupkan jari lalu arahkan ke mulut dua kali",icon:"🍽️"},minum:{label:"MINUM",cue:"Bentuk huruf C dengan tangan lalu miringkan ke arah mulut",icon:"🥤"},tidur:{label:"TIDUR",cue:"Tempelkan kedua telapak tangan di samping pipi sambil memiringkan kepala",icon:"😴"},bangun:{label:"BANGUN",cue:"Buka ibu jari & telunjuk di dekat mata seperti kelopak mata terbuka",icon:"👀"},pergi:{label:"PERGI",cue:"Arahkan kedua jari telunjuk maju menjauh dari tubuh",icon:"🚶"},datang:{label:"DATANG",cue:"Gerakkan jari telunjuk dari depan menuju ke arah tubuh",icon:"👋"},pulang:{label:"PULANG",cue:"Kuncupkan jari sentuh pipi lalu arahkan ke bentuk atap rumah",icon:"🏠"},kerja:{label:"KERJA",cue:"Ketukkan pergelangan kepalan tangan kanan di atas kepalan tangan kiri",icon:"💼"},belajar:{label:"BELAJAR",cue:"Buka telapak tangan kiri seperti buku, tangan kanan mengambil ke arah dahi",icon:"📖"},tunggu:{label:"TUNGGU",cue:"Angkat kedua telapak tangan terbuka menghadap atas lalu gerakkan jari ringan",icon:"⏳"},lihat:{label:"LIHAT",cue:"Bentuk huruf V dengan telunjuk & jari tengah, arahkan dari mata ke depan",icon:"👁️"},dengar:{label:"DENGAR",cue:"Tunjuk atau lengkungkan tangan di belakang telinga",icon:"👂"},bicara:{label:"BICARA",cue:"Gerakkan jari telunjuk memutar kecil di depan mulut",icon:"🗣️"},paham:{label:"PAHAM",cue:"Jentikkan jari telunjuk tegak di samping pelipis",icon:"💡"},erti:{label:"MENGERTI",cue:"Jentikkan jari telunjuk tegak di samping pelipis",icon:"💡"},tahu:{label:"TAHU",cue:"Ketuk pelipis dahi dengan ujung jari-jari tangan kanan",icon:"🧠"},ingat:{label:"INGAT",cue:"Sentuh dahi dengan ibu jari lalu tempelkan ke ibu jari tangan kiri",icon:"💭"},lupa:{label:"LUPA",cue:"Usap dahi dari kiri ke kanan lalu kuncupkan jari",icon:"🤷"},apa:{label:"APA",cue:"Buka kedua telapak tangan menghadap atas sambil digoyangkan ringan",icon:"❓"},siapa:{label:"SIAPA",cue:"Lingkarkan jari telunjuk di sekitar dagu/mulut",icon:"❓"},dimana:{label:"DI MANA",cue:"Angkat jari telunjuk lalu goyangkan ke kiri dan kanan",icon:"📍"},mana:{label:"MANA",cue:"Angkat jari telunjuk lalu goyangkan ke kiri dan kanan",icon:"📍"},kapan:{label:"KAPAN",cue:"Putar jari telunjuk kanan mengelilingi ujung telunjuk kiri lalu sentuhkan",icon:"🕒"},kenapa:{label:"KENAPA",cue:"Sentuh dahi lalu tarik tangan keluar membentuk huruf Y",icon:"🤔"},bagaimana:{label:"BAGAIMANA",cue:"Temukan punggung kedua tangan lalu putar terbuka ke atas",icon:"❓"},nama:{label:"NAMA",cue:"Ketukkan jari telunjuk & tengah kanan di atas jari telunjuk & tengah kiri",icon:"🏷️"},kabar:{label:"KABAR",cue:"Buka kedua telapak tangan dari dada ke arah depan",icon:"💬"},pagi:{label:"PAGI",cue:"Angkat lengan kanan seperti matahari terbit di atas lengan kiri",icon:"🌅"},siang:{label:"SIANG",cue:"Tegakkan lengan kanan di atas lengan kiri seperti matahari di atas kepala",icon:"☀️"},sore:{label:"SORE",cue:"Miringkan lengan kanan turun perlahan di atas lengan kiri",icon:"🌇"},malam:{label:"MALAM",cue:"Lengkungkan telapak tangan kanan turun melewati pergelangan tangan kiri",icon:"🌙"},rumah:{label:"RUMAH",cue:"Temukan ujung jari kedua tangan membentuk atap segitiga",icon:"🏠"},sekolah:{label:"SEKOLAH",cue:"Tepukkan kedua telapak tangan dua kali dengan ritmis",icon:"🏫"},teman:{label:"TEMAN",cue:"Kaitkan kedua jari telunjuk saling bertautan bergantian",icon:"🤝"},keluarga:{label:"KELUARGA",cue:"Bentuk huruf F dengan kedua tangan lalu buat lingkaran ke depan",icon:"👨‍👩‍👧‍👦"},ibu:{label:"IBU",cue:"Sentuh dagu dengan ibu jari dari telapak tangan terbuka",icon:"👩"},ayah:{label:"AYAH",cue:"Sentuh dahi dengan ibu jari dari telapak tangan terbuka",icon:"👨"}},N=[{phrase:"terima kasih",key:"terima"},{phrase:"sama sama",key:"sama"},{phrase:"apa kabar",key:"kabar"},{phrase:"di mana",key:"dimana"}],L=/(lah|kah|tah|pun|nya|ku|mu)$/,_=/(kan|an|i)$/;function H(u){let t=String(u||"").toLowerCase().replace(/[^a-z-]/g,"");if(!t)return"";if(t.includes("-")){const a=t.split("-").filter(Boolean);a.length===2&&a[0]===a[1]?t=a[0]:t=a[0]||""}if(f[t]||t.length<=3)return t;if(L.test(t)){const a=t.replace(L,"");if(a.length>=3&&(t=a,f[t]))return t}const e=[[/^meny([aiueo])/,"s$1"],[/^meng([aiueo])/,"$1"],[/^meng/,""],[/^men([aiueo])/,"t$1"],[/^men/,""],[/^mem([aiueo])/,"p$1"],[/^mem/,""],[/^me/,""],[/^peng/,""],[/^pen/,""],[/^pem/,""],[/^ber/,""],[/^ter/,""],[/^di/,""],[/^ke/,""],[/^se/,""]];let i=null;for(const[a,n]of e)if(a.test(t)){const s=t.replace(a,n);if(s.length>=3){if(f[s])return s;i===null&&(i=s)}}if(i!==null&&(t=i),_.test(t)){const a=t.replace(_,"");if(a.length>=3){if(f[a])return a;t=a}}return t}const j={a:{fingers:[1,0,0,0,0],hint:"Kepal, ibu jari di sisi"},b:{fingers:[0,1,1,1,1],hint:"4 jari tegak, ibu jari lipat"},c:{fingers:[.5,.5,.5,.5,.5],hint:"Tangan melengkung bentuk C"},d:{fingers:[.5,1,0,0,0],hint:"Telunjuk tegak, jari lain melingkar"},e:{fingers:[0,.5,.5,.5,.5],hint:"Ujung jari menekuk ke telapak"},f:{fingers:[.5,.5,1,1,1],hint:"Ibu jari & telunjuk bertemu, 3 tegak"},g:{fingers:[.5,1,0,0,0],hint:"Telunjuk & ibu jari sejajar ke samping"},h:{fingers:[0,1,1,0,0],hint:"Telunjuk & tengah lurus ke samping"},i:{fingers:[0,0,0,0,1],hint:"Kelingking tegak, jari lain kepal"},j:{fingers:[0,0,0,0,1],hint:"Kelingking tegak lalu lengkungkan J"},k:{fingers:[.5,1,1,0,0],hint:"Telunjuk & tengah V, ibu jari di tengah"},l:{fingers:[1,1,0,0,0],hint:"Ibu jari & telunjuk bentuk L"},m:{fingers:[0,.5,.5,.5,0],hint:"3 jari menutupi ibu jari"},n:{fingers:[0,.5,.5,0,0],hint:"2 jari menutupi ibu jari"},o:{fingers:[.5,.5,.5,.5,.5],hint:"Semua ujung jari bertemu bentuk O"},p:{fingers:[.5,1,.5,0,0],hint:"Seperti K mengarah ke bawah"},q:{fingers:[.5,.5,0,0,0],hint:"Seperti G mengarah ke bawah"},r:{fingers:[0,1,1,0,0],hint:"Telunjuk & jari tengah menyilang"},s:{fingers:[.5,0,0,0,0],hint:"Kepalan erat, ibu jari di depan"},t:{fingers:[.5,.5,0,0,0],hint:"Ibu jari diselipkan di bawah telunjuk"},u:{fingers:[0,1,1,0,0],hint:"Telunjuk & tengah rapat tegak"},v:{fingers:[0,1,1,0,0],hint:"Telunjuk & tengah terbuka bentuk V"},w:{fingers:[0,1,1,1,0],hint:"3 jari tengah terbuka bentuk W"},x:{fingers:[0,.5,0,0,0],hint:"Telunjuk melengkung seperti kait"},y:{fingers:[1,0,0,0,1],hint:"Ibu jari & kelingking terbuka"},z:{fingers:[0,1,0,0,0],hint:"Telunjuk menggambar huruf Z di udara"}};function B(u){const t=String(u||"a").toLowerCase(),e=j[t]||j.a,[i,a,n,s,r]=e.fingers,l=o=>o===1?38:o===.5?22:10,d=o=>o===1?"#4d7c6f":o===.5?"#789d91":"#d6d3cd",c=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><rect width="120" height="120" rx="20" fill="#ffffff" stroke="#e7e5e4" stroke-width="2"/><rect x="8" y="8" width="28" height="28" rx="8" fill="#4d7c6f"/><text x="22" y="27" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#ffffff">${t.toUpperCase()}</text><g transform="translate(22, 18)"><rect x="${i===1?4:12}" y="${i===1?48:56}" width="11" height="${i===1?26:16}" rx="5.5" transform="rotate(${i===1?-35:-15} 10 60)" fill="${d(i)}"/><rect x="20" y="${54-l(a)}" width="11" height="${l(a)}" rx="5.5" fill="${d(a)}"/><rect x="34" y="${52-l(n)}" width="11" height="${l(n)}" rx="5.5" fill="${d(n)}"/><rect x="48" y="${54-l(s)}" width="11" height="${l(s)}" rx="5.5" fill="${d(s)}"/><rect x="62" y="${58-l(r)}" width="10" height="${l(r)}" rx="5" fill="${d(r)}"/><rect x="18" y="50" width="54" height="32" rx="14" fill="#e7e5e4" stroke="#a8a29e" stroke-width="1.2"/></g></svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(c)}`}function $(u){var e;const t=String(u||"").match(/^signs\/([a-z])\.svg$/i);return t?B(t[1]):typeof chrome<"u"&&((e=chrome==null?void 0:chrome.runtime)!=null&&e.getURL)?chrome.runtime.getURL(u):u}function K(u,t=$){let e=String(u||"").toLowerCase().replace(/[^\p{L}\s-]/gu," ").replace(/\s+/g," ").trim();if(!e)return[];for(const{phrase:n,key:s}of N){const r=new RegExp(`\\b${n}\\b`,"g");e=e.replace(r,`__phrase_${s}__`)}const i=e.split(" ").filter(Boolean),a=[];for(const n of i){const s=n.match(/^__phrase_([a-z]+)__$/);if(s){const c=s[1],o=f[c];if(o){const p=E[c];a.push({type:"word",label:o.label,sourceWord:o.label.toLowerCase(),cue:o.cue,icon:o.icon,videoPath:p,videoUrl:p?t(p):void 0,durationMs:p?2600:1400});continue}}const r=H(n),l=f[n]?n:f[r]?r:null,d=l?f[l]:null;if(d){const c=E[l];a.push({type:"word",label:d.label,sourceWord:n,cue:d.cue,icon:d.icon,videoPath:c,videoUrl:c?t(c):void 0,durationMs:c?2600:1300})}else{const c=n.replace(/[^a-z]/g,"");for(const o of c)a.push({type:"letter",label:o.toUpperCase(),sourceWord:n,cue:`Eja huruf "${o.toUpperCase()}" (SIBI/BISINDO)`,assetUrl:t(`signs/${o}.svg`),durationMs:800})}}return a}const T=["aku","saya","kamu","anda","kita","kami","dia","mereka","halo","hai","selamat","pagi","siang","sore","malam","terima","kasih","sama","maaf","tolong","permisi","suka","cinta","sayang","senang","bahagia","sedih","marah","takut","capek","lelah","sakit","sehat","lapar","haus","baik","bagus","buruk","hebat","mantap","keren","cantik","ganteng","ya","iya","oke","siap","tidak","bukan","belum","sudah","lagi","masih","sedang","akan","bisa","mau","ingin","harus","boleh","jangan","ada","tiada","banyak","sedikit","semua","ini","itu","sini","situ","sana","dan","atau","tapi","karena","kalau","jika","untuk","dari","ke","di","dengan","makan","minum","tidur","bangun","mandi","pergi","berangkat","datang","pulang","jalan","lari","duduk","berdiri","masuk","keluar","kerja","belajar","baca","tulis","hitung","main","tunggu","cari","lihat","nonton","dengar","bicara","ngobrol","tanya","jawab","paham","mengerti","tahu","kenal","ingat","lupa","beli","bayar","bantu","punya","pakai","buka","tutup","apa","siapa","dimana","mana","kapan","kenapa","mengapa","bagaimana","berapa","nama","kabar","teman","sahabat","keluarga","ibu","mama","ayah","bapak","papa","kakak","adik","anak","orang","guru","dosen","dokter","tuli","dengar","rumah","sekolah","kampus","kantor","kelas","kamar","jalan","kota","indonesia","air","nasi","roti","kopi","teh","susu","obat","uang","buku","hp","telepon","motor","mobil","jam","hari","minggu","bulan","tahun","sekarang","besok","kemarin","nanti","merah","kuning","hijau","biru","hitam","putih","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh"],w=new Set(T),O=[...T].filter(u=>u.length>=2).sort((u,t)=>t.length-u.length);function I(u){const t=String(u||"").toLowerCase();if(t.length<=2)return t;let e=t.replace(/(.)\1{2,}/g,"$1");if(w.has(e))return e;const i=e.replace(/(.)\1+/g,"$1");return w.has(i)?i:e}function V(u,t){if(u===t)return 0;const e=u.length,i=t.length;if(Math.abs(e-i)>2)return 99;const a=Array.from({length:e+1},()=>new Array(i+1).fill(0));for(let n=0;n<=e;n++)a[n][0]=n;for(let n=0;n<=i;n++)a[0][n]=n;for(let n=1;n<=e;n++)for(let s=1;s<=i;s++){const r=u[n-1]===t[s-1]?0:1;a[n][s]=Math.min(a[n-1][s]+1,a[n][s-1]+1,a[n-1][s-1]+r)}return a[e][i]}function P(u,t=!1){var s;const e=I(String(u||"").replace(/[^a-zA-Z]/g,""));if(!e)return[];if(w.has(e))return[e];const i=e.length,a=new Array(i+1).fill(null);a[0]={cost:0,words:[]};for(let r=0;r<i;r++){if(!a[r])continue;for(const c of O){const o=r+c.length;if(o<=i&&e.slice(r,o)===c){const p=a[r].cost+.1;(!a[o]||p<a[o].cost)&&(a[o]={cost:p,words:[...a[r].words,c]})}}const l=r+1,d=a[r].cost+1.2;if(!a[l]||d<a[l].cost){const c=[...a[r].words],o=c[c.length-1];o&&!w.has(o)?c[c.length-1]=o+e[r]:c.push(e[r]),a[l]={cost:d,words:c}}}let n=((s=a[i])==null?void 0:s.words)||[e];return t&&(n=n.map(r=>{const l=I(r);if(w.has(l)||l.length<3)return l;let d=l,c=2;for(const o of T){if(Math.abs(o.length-l.length)>1||o[0]!==l[0])continue;const p=V(l,o);p===1&&p<c&&(c=p,d=o)}return d})),n}function z(u,t=!1){if(!Array.isArray(u)||u.length===0)return"";const e=[];let i="";const a=n=>{if(!i)return;const s=P(i,n);for(const r of s)r&&e.push(r.toUpperCase());i=""};for(const n of u){if(n===" "){a(!0);continue}const s=String(n||"").trim();s&&(s.length===1&&/^[A-Za-z]$/.test(s)?i+=s:(a(!0),e[e.length-1]!==s.toUpperCase()&&e.push(s.toUpperCase())))}return a(t),e.join(" ").replace(/\s+/g," ").trim()}class G{constructor(t={}){this.callbacks=t,this.host=null,this.shadow=null,this.subtitleHost=null,this.subtitleShadow=null,this.subtitleEnabled=!0,this.isCollapsed=!1,this.activeTab="sign-to-text",this.transcriptTokens=[],this.signSequence=[],this.signIndex=0,this.signTimer=null,this.isPlayingSign=!1,this._videoBlobCache=new Map,this.recognition=null,this.isListeningVoice=!1,this._voiceAutoRestart=!1,this._userPausedVoice=!1,this._mount()}_mount(){const t=document.getElementById("isyarat-live-root");t&&t.remove(),this.host=document.createElement("div"),this.host.id="isyarat-live-root",this.host.style.cssText="position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;",this.shadow=this.host.attachShadow({mode:"open"}),this.shadow.innerHTML=this._template(),document.documentElement.appendChild(this.host),this._mountSubtitle(),this._bindEvents(),this._bindDrag()}_mountSubtitle(){const t=document.getElementById("isyarat-live-subtitle-root");t&&t.remove(),this.subtitleHost=document.createElement("div"),this.subtitleHost.id="isyarat-live-subtitle-root",this.subtitleHost.style.cssText="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483646;pointer-events:none;max-width:80vw;transition:top 0.12s linear,left 0.12s linear;",this.subtitleShadow=this.subtitleHost.attachShadow({mode:"open"}),this.subtitleShadow.innerHTML=`
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
        }
        .cc-wrap {
          display: none;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        .cc-wrap.visible {
          display: flex;
        }
        .cc-box {
          background: rgba(28, 25, 23, 0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #fafaf9;
          padding: 9px 20px;
          border-radius: 14px;
          font-size: 19px;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.01em;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
          max-width: 680px;
          word-break: break-word;
        }
        .cc-tag {
          font-size: 11px;
          font-weight: 500;
          color: #e7e5e4;
          background: rgba(28, 25, 23, 0.72);
          backdrop-filter: blur(8px);
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
      </style>
      <div class="cc-wrap" id="cc-wrap">
        <span class="cc-tag" id="cc-live-tag" style="display:none"></span>
        <div class="cc-box" id="cc-text"></div>
      </div>
    `,document.documentElement.appendChild(this.subtitleHost)}_template(){return`
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
          color: #1c1917;
        }
        * {
          box-sizing: border-box;
        }
        .panel {
          width: 344px;
          background: rgba(252, 251, 249, 0.96);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(28, 25, 23, 0.09);
          border-radius: 18px;
          box-shadow: 0 18px 44px rgba(28, 25, 23, 0.14), 0 2px 6px rgba(28, 25, 23, 0.06);
          overflow: hidden;
          color: #1c1917;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .panel.hidden {
          display: none;
        }
        .pill {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(252, 251, 249, 0.96);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(28, 25, 23, 0.1);
          color: #1c1917;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(28, 25, 23, 0.12);
          user-select: none;
        }
        .pill.visible {
          display: inline-flex;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a8a29e;
          flex-shrink: 0;
        }
        .dot.live {
          background: #4d7c6f;
        }
        .dot.warn {
          background: #c28a3d;
        }
        .dot.err {
          background: #b95656;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px 10px;
          background: transparent;
          cursor: grab;
          user-select: none;
        }
        .header:active {
          cursor: grabbing;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #1c1917;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .icon-btn {
          background: transparent;
          border: none;
          color: #78716c;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.15s, color 0.15s;
        }
        .icon-btn:hover {
          background: #efece6;
          color: #1c1917;
        }
        .tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin: 0 14px;
          padding: 3px;
          background: #efece6;
          border-radius: 11px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          color: #78716c;
          font-size: 11.5px;
          font-weight: 500;
          padding: 6px 6px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tab-btn.active {
          background: #ffffff;
          color: #1c1917;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(28, 25, 23, 0.08);
        }
        .body {
          padding: 14px;
        }
        .tab-pane {
          display: none;
        }
        .tab-pane.active {
          display: block;
        }
        .mode-switch {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          background: #efece6;
          padding: 3px;
          border-radius: 9px;
          margin-bottom: 9px;
        }
        .mode-btn {
          background: transparent;
          border: none;
          color: #78716c;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 6px;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.14s ease;
        }
        .mode-btn.active {
          background: #ffffff;
          color: #2f5d50;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(28, 25, 23, 0.08);
        }
        .status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 11.5px;
          color: #78716c;
          margin-bottom: 10px;
        }
        .select {
          background: #f5f3ef;
          color: #44403c;
          border: 1px solid rgba(28, 25, 23, 0.09);
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 11px;
          max-width: 162px;
          outline: none;
        }
        .live-card {
          background: #f5f3ef;
          border: 1px solid rgba(28, 25, 23, 0.06);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .source-strip {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .source-thumb {
          position: relative;
          width: 74px;
          height: 52px;
          border-radius: 9px;
          overflow: hidden;
          background: #e7e5e4;
          border: 2px solid transparent;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
        }
        .source-thumb.active {
          border-color: #4d7c6f;
          box-shadow: 0 2px 8px rgba(77, 124, 111, 0.25);
        }
        .source-thumb canvas {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
        .source-badge {
          position: absolute;
          left: 3px;
          bottom: 3px;
          right: 3px;
          background: rgba(28, 25, 23, 0.75);
          color: #fafaf9;
          font-size: 9px;
          font-weight: 500;
          padding: 1px 4px;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
        .live-info {
          flex: 1;
          min-width: 0;
          text-align: left;
        }
        .live-label {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #2f5d50;
          min-height: 34px;
        }
        .live-sub {
          font-size: 11.5px;
          color: #78716c;
          margin-top: 4px;
        }
        .conf-bar {
          height: 4px;
          background: rgba(28, 25, 23, 0.08);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 10px;
        }
        .conf-fill {
          height: 100%;
          width: 0%;
          background: #4d7c6f;
          border-radius: 999px;
          transition: width 0.14s ease;
        }
        .transcript-box {
          background: #ffffff;
          border: 1px solid rgba(28, 25, 23, 0.09);
          border-radius: 12px;
          padding: 10px 12px;
          min-height: 58px;
          max-height: 92px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.5;
          color: #1c1917;
          word-break: break-word;
          margin-bottom: 10px;
        }
        .btn-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .btn {
          flex: 1;
          background: #f5f3ef;
          color: #44403c;
          border: 1px solid rgba(28, 25, 23, 0.08);
          border-radius: 10px;
          padding: 7px 10px;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .btn:hover {
          background: #eae6de;
        }
        .btn.primary {
          background: #4d7c6f;
          border-color: #4d7c6f;
          color: #ffffff;
          font-weight: 600;
        }
        .btn.primary:hover {
          background: #3f685d;
        }
        .btn.danger {
          background: #fdf2f2;
          border-color: rgba(185, 86, 86, 0.22);
          color: #a84848;
        }
        .btn.danger:hover {
          background: #fae5e5;
        }
        .btn.listening {
          background: #b95656;
          border-color: #b95656;
          color: #ffffff;
        }
        .input {
          width: 100%;
          background: #ffffff;
          border: 1px solid rgba(28, 25, 23, 0.12);
          border-radius: 10px;
          padding: 8px 11px;
          color: #1c1917;
          font-size: 12.5px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #4d7c6f;
        }
        .input::placeholder {
          color: #a8a29e;
        }
        .chips {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin: 9px 0;
        }
        .chip {
          background: #f5f3ef;
          border: 1px solid rgba(28, 25, 23, 0.08);
          color: #57534e;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .chip:hover {
          background: #e8f1ee;
          border-color: rgba(77, 124, 111, 0.28);
          color: #2f5d50;
        }
        .sign-stage {
          background: #f5f3ef;
          border: 1px solid rgba(28, 25, 23, 0.06);
          border-radius: 14px;
          padding: 14px;
          min-height: 165px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: 8px 0;
        }
        .sign-stage img {
          width: 96px;
          height: 96px;
          object-fit: contain;
          margin-bottom: 8px;
          border-radius: 12px;
        }
        .sign-stage video {
          width: 248px;
          height: 152px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid rgba(28, 25, 23, 0.08);
          background: #1c1917;
          margin-bottom: 8px;
        }
        .sign-word-icon {
          font-size: 40px;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .sign-stage-title {
          font-size: 14.5px;
          font-weight: 600;
          color: #2f5d50;
          letter-spacing: -0.01em;
        }
        .sign-stage-cue {
          font-size: 11.5px;
          color: #78716c;
          margin-top: 4px;
          line-height: 1.45;
        }
        .seq-strip {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-bottom: 10px;
          max-height: 52px;
          overflow-y: auto;
        }
        .seq-item {
          font-size: 10.5px;
          padding: 3px 8px;
          border-radius: 7px;
          background: #efece6;
          color: #57534e;
          font-weight: 500;
        }
        .seq-item.current {
          background: #4d7c6f;
          color: #ffffff;
          font-weight: 600;
        }
        .train-list {
          max-height: 112px;
          overflow-y: auto;
          margin: 8px 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .train-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f5f3ef;
          border-radius: 9px;
          padding: 6px 10px;
          font-size: 11.5px;
          color: #44403c;
        }
        .train-del {
          background: transparent;
          border: none;
          color: #a84848;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
        }
        .hint {
          font-size: 11.5px;
          color: #78716c;
          line-height: 1.45;
          margin: 6px 0;
        }
      </style>

      <div class="pill" id="collapsed-pill" title="Buka Isyarat-Live">
        <span class="dot" id="pill-dot"></span>
        <span>Isyarat-Live</span>
      </div>

      <div class="panel" id="main-panel">
        <div class="header" id="drag-handle">
          <div class="brand">
            <span class="dot" id="header-dot"></span>
            <span>Isyarat-Live</span>
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="btn-collapse" title="Minimalkan">—</button>
          </div>
        </div>

        <div class="tabs">
          <button class="tab-btn active" data-tab="sign-to-text">Sign → Teks</button>
          <button class="tab-btn" data-tab="text-to-sign">Teks → Sign</button>
          <button class="tab-btn" data-tab="quick-train">Latih Kata</button>
        </div>

        <div class="body">
          <!-- TAB 1: SIGN -> TEKS -->
          <div class="tab-pane active" id="pane-sign-to-text">
            <div class="status-row">
              <span id="status-text">Mencari video call...</span>
              <div style="display:flex;gap:4px;align-items:center;">
                <select class="select" id="video-select" title="Pilih sumber video">
                  <option value="auto">Auto (Lawan Bicara)</option>
                </select>
                <button class="btn" id="btn-swap-video" style="flex:0 0 auto;padding:4px 8px;font-size:11px;" title="Tukar sumber video (Lawan Bicara / Kamera Saya)">Tukar</button>
              </div>
            </div>

            <div class="mode-switch" title="Pilih mode deteksi: Kata + Huruf A-Z, Huruf A-Z saja, atau Kata saja">
              <button class="mode-btn active" data-mode="all">Kata + A–Z</button>
              <button class="mode-btn" data-mode="letters">Huruf A–Z</button>
              <button class="mode-btn" data-mode="words">Kata Saja</button>
            </div>

            <div class="source-strip" id="source-strip" title="Klik thumbnail untuk memilih video yang ingin diterjemahkan"></div>

            <div class="live-card">
              <div class="live-info" style="text-align:center;">
                <div class="live-label" id="live-sign">—</div>
                <div class="live-sub" id="live-meta">Menunggu gerakan tangan lawan bicara</div>
                <div class="conf-bar"><div class="conf-fill" id="conf-fill"></div></div>
              </div>
            </div>

            <div class="transcript-box" id="transcript-box">
              <span style="color:#a8a29e">Hasil terjemahan kalimat akan muncul di sini...</span>
            </div>

            <div class="hint" style="margin:0 0 8px;font-size:10.5px;">
              Mendukung <b>Huruf A–Z</b> (mis. <b>A</b> kepal jempol di samping, <b>B</b> 4 jari rapat, <b>L</b>, <b>O</b>, <b>U</b>, <b>V</b>, <b>W</b>, <b>Y</b>) & <b>Kata</b> (<b>SAYA</b> tangan di dada · <b>SUKA</b> 🤟 · <b>KAMU</b> ☝️ · <b>HALO</b> ✋ · <b>BAGUS</b> 👍 · <b>TERIMA KASIH</b> 🤚)
            </div>

            <div class="btn-row">
              <button class="btn primary" id="btn-cc" title="Tampilkan subtitle di bawah video">CC: ON</button>
              <button class="btn" id="btn-space">Spasi</button>
              <button class="btn" id="btn-speak">Baca</button>
              <button class="btn" id="btn-copy">Salin</button>
              <button class="btn danger" id="btn-clear">Hapus</button>
            </div>
          </div>

          <!-- TAB 2: TEKS / SUARA -> SIGN -->
          <div class="tab-pane" id="pane-text-to-sign">
            <div style="display:flex;gap:6px;">
              <input class="input" id="tts-input" type="text" placeholder="Bicara langsung atau ketik kata..." />
              <button class="btn" id="btn-voice-sign" style="flex:0 0 auto;min-width:74px;" title="Suara ke Isyarat (id-ID)">Suara</button>
            </div>
            <div class="chips">
              <button class="chip" data-phrase="Saya belajar di rumah">Saya belajar di rumah</button>
              <button class="chip" data-phrase="Terima kasih teman">Terima kasih teman</button>
              <button class="chip" data-phrase="Maaf saya makan">Maaf saya makan</button>
              <button class="chip" data-phrase="Pagi keluarga">Pagi keluarga</button>
            </div>

            <div class="sign-stage" id="sign-stage">
              <div class="sign-stage-cue">Suara otomatis didengarkan saat tab ini dibuka, atau ketik kalimat lalu klik <b>Terjemahkan</b>.</div>
            </div>

            <div class="seq-strip" id="seq-strip"></div>

            <div class="btn-row">
              <button class="btn primary" id="btn-translate-sign">Terjemahkan</button>
              <button class="btn" id="btn-replay-sign">Ulangi</button>
            </div>
          </div>

          <!-- TAB 3: QUICK-TRAIN -->
          <div class="tab-pane" id="pane-quick-train">
            <div class="hint">
              Pilih kata preset atau ketik label sendiri, lalu klik <b>Rekam</b> agar kata tersambung di subtitle bawah video.
            </div>
            <div class="chips" id="word-presets">
              <button class="chip train-preset" data-word="AKU">AKU</button>
              <button class="chip train-preset" data-word="SUKA">SUKA</button>
              <button class="chip train-preset" data-word="KAMU">KAMU</button>
              <button class="chip train-preset" data-word="KITA">KITA</button>
              <button class="chip train-preset" data-word="HALO">HALO</button>
              <button class="chip train-preset" data-word="TERIMA KASIH">TERIMA KASIH</button>
              <button class="chip train-preset" data-word="MAAF">MAAF</button>
              <button class="chip train-preset" data-word="TOLONG">TOLONG</button>
              <button class="chip train-preset" data-word="YA">YA</button>
              <button class="chip train-preset" data-word="TIDAK">TIDAK</button>
            </div>
            <div style="display:flex;gap:6px;margin-bottom:8px;">
              <input class="input" id="train-label" type="text" maxlength="24" placeholder="Label kata (mis. AKU, SUKA)" />
              <button class="btn primary" id="btn-record" style="flex:0 0 auto;min-width:102px;">Rekam (15x)</button>
            </div>
            <div class="hint" id="train-status">Siap merekam sampel tangan.</div>
            <div class="train-list" id="train-list"></div>
            <div class="btn-row">
              <button class="btn" id="btn-load-default" title="Muat ulang dataset bawaan (32 Kata WL-BISINDO)">Muat Default</button>
              <button class="btn" id="btn-export">Export</button>
              <button class="btn" id="btn-import">Import</button>
              <button class="btn danger" id="btn-clear-dataset">Reset</button>
            </div>
            <input type="file" id="import-file" accept="application/json" style="display:none" />
          </div>
        </div>
      </div>
    `}_q(t){return this.shadow.querySelector(t)}_bindEvents(){this._q("#btn-collapse").addEventListener("click",()=>this.setCollapsed(!0)),this._q("#collapsed-pill").addEventListener("click",()=>this.setCollapsed(!1)),this.shadow.querySelectorAll(".tab-btn").forEach(e=>{e.addEventListener("click",()=>this.switchTab(e.dataset.tab))}),this.shadow.querySelectorAll(".mode-btn").forEach(e=>{e.addEventListener("click",()=>{var i,a;this.shadow.querySelectorAll(".mode-btn").forEach(n=>n.classList.toggle("active",n===e)),(a=(i=this.callbacks).onSelectRecognitionMode)==null||a.call(i,e.dataset.mode)})}),this._q("#video-select").addEventListener("change",e=>{var i,a;(a=(i=this.callbacks).onSelectVideo)==null||a.call(i,e.target.value)}),this._q("#btn-swap-video").addEventListener("click",()=>{var e,i;(i=(e=this.callbacks).onCycleVideo)==null||i.call(e)}),this._q("#btn-cc").addEventListener("click",()=>{this.subtitleEnabled=!this.subtitleEnabled;const e=this._q("#btn-cc");e.textContent=this.subtitleEnabled?"CC: ON":"CC: OFF",e.classList.toggle("primary",this.subtitleEnabled),this._renderSubtitle()}),this._q("#btn-space").addEventListener("click",()=>{this.appendTranscript(" ")}),this._q("#btn-clear").addEventListener("click",()=>{this.transcriptTokens=[],this._renderTranscript()}),this._q("#btn-copy").addEventListener("click",async()=>{const e=this.getTranscriptText();if(e)try{await navigator.clipboard.writeText(e),this.setMeta("Teks disalin ke clipboard")}catch{this.setMeta("Gagal menyalin teks")}}),this._q("#btn-speak").addEventListener("click",()=>{const e=this.getTranscriptText();if(!e||typeof speechSynthesis>"u")return;const i=new SpeechSynthesisUtterance(e);i.lang="id-ID",speechSynthesis.cancel(),speechSynthesis.speak(i)});const t=()=>{const e=this._q("#tts-input").value.trim();e&&this.playTextToSign(e)};this._q("#btn-translate-sign").addEventListener("click",t),this._q("#btn-voice-sign").addEventListener("click",()=>this._toggleVoiceToSign()),this._q("#tts-input").addEventListener("keydown",e=>{e.key==="Enter"&&t()}),this._q("#btn-replay-sign").addEventListener("click",()=>{this.signSequence.length>0&&(this.signIndex=0,this._startSignPlayback())}),this.shadow.querySelectorAll(".chip").forEach(e=>{e.addEventListener("click",()=>{this._q("#tts-input").value=e.dataset.phrase,this.playTextToSign(e.dataset.phrase)})}),this.shadow.querySelectorAll(".train-preset").forEach(e=>{e.addEventListener("click",()=>{this._q("#train-label").value=e.dataset.word,this.setTrainStatus(`Label "${e.dataset.word}" dipilih. Klik Rekam (15x) sambil tahan isyaratnya.`)})}),this._q("#btn-load-default").addEventListener("click",()=>{var e,i;(i=(e=this.callbacks).onLoadDefaultDataset)==null||i.call(e)}),this._q("#btn-record").addEventListener("click",()=>{var i,a;const e=this._q("#train-label").value.trim();if(!e){this.setTrainStatus("Masukkan label terlebih dahulu (contoh: A atau HALO).");return}(a=(i=this.callbacks).onRecordLabel)==null||a.call(i,e)}),this._q("#btn-export").addEventListener("click",()=>{var e,i;(i=(e=this.callbacks).onExportDataset)==null||i.call(e)}),this._q("#btn-import").addEventListener("click",()=>{this._q("#import-file").click()}),this._q("#import-file").addEventListener("change",async e=>{var a,n,s;const i=(a=e.target.files)==null?void 0:a[0];if(i){try{const r=JSON.parse(await i.text());(s=(n=this.callbacks).onImportDataset)==null||s.call(n,r)}catch{this.setTrainStatus("File JSON tidak valid.")}e.target.value=""}}),this._q("#btn-clear-dataset").addEventListener("click",()=>{var e,i;(i=(e=this.callbacks).onClearDataset)==null||i.call(e)})}_bindDrag(){const t=this._q("#drag-handle");let e=!1,i=0,a=0;t.addEventListener("pointerdown",s=>{if(s.target.closest("button"))return;e=!0;const r=this.host.getBoundingClientRect();i=s.clientX-r.left,a=s.clientY-r.top,this.host.style.right="auto",this.host.style.bottom="auto",this.host.style.left=`${r.left}px`,this.host.style.top=`${r.top}px`,t.setPointerCapture(s.pointerId)}),t.addEventListener("pointermove",s=>{if(!e)return;const r=Math.max(0,window.innerWidth-this.host.offsetWidth),l=Math.max(0,window.innerHeight-this.host.offsetHeight),d=Math.min(Math.max(0,s.clientX-i),r),c=Math.min(Math.max(0,s.clientY-a),l);this.host.style.left=`${d}px`,this.host.style.top=`${c}px`});const n=()=>{e=!1};t.addEventListener("pointerup",n),t.addEventListener("pointercancel",n)}setVisible(t){this.host.style.display=t?"block":"none",this.subtitleHost&&(this.subtitleHost.style.display=t?"block":"none")}setCollapsed(t){this.isCollapsed=t,this._q("#main-panel").classList.toggle("hidden",t),this._q("#collapsed-pill").classList.toggle("visible",t)}switchTab(t){this.activeTab=t,this.shadow.querySelectorAll(".tab-btn").forEach(e=>{e.classList.toggle("active",e.dataset.tab===t)}),this.shadow.querySelectorAll(".tab-pane").forEach(e=>{e.classList.toggle("active",e.id===`pane-${t}`)}),t==="text-to-sign"&&!this.isListeningVoice&&!this._userPausedVoice&&this.startVoiceAutoListen()}setStatus(t,e="idle"){this._q("#status-text").textContent=t;for(const i of["#header-dot","#pill-dot"]){const a=this._q(i);a.className="dot",e==="live"&&a.classList.add("live"),e==="warn"&&a.classList.add("warn"),e==="err"&&a.classList.add("err")}}setMeta(t){this._q("#live-meta").textContent=t}drawVideoPreview(t){}drawAllVideoPreviews(t,e){const i=this._q("#source-strip");i&&(i.children.length!==t.length&&(i.innerHTML="",t.forEach((a,n)=>{const s=document.createElement("button");s.className="source-thumb",s.type="button",s.title=`Klik untuk pantau ${a.label||`Video #${n+1}`}`,s.innerHTML=`
          <canvas width="88" height="62"></canvas>
          <span class="source-badge">${a.label||`Video #${n+1}`}</span>
        `,s.addEventListener("click",()=>{var r,l;this._q("#video-select").value=String(n),(l=(r=this.callbacks).onSelectVideo)==null||l.call(r,String(n))}),i.appendChild(s)})),Array.from(i.children).forEach((a,n)=>{var l;a.classList.toggle("active",n===e);const s=a.querySelector("canvas"),r=(l=t[n])==null?void 0:l.video;if(s&&r)try{s.getContext("2d").drawImage(r,0,0,s.width,s.height)}catch{}}))}updateLivePrediction(t,e=0,i=0,a=0){this._q("#live-sign").textContent=t||"—";const n=Math.round(Math.max(0,Math.min(1,a))*100),s=Math.round(Math.max(0,Math.min(1,e))*100);this._q("#conf-fill").style.width=`${t?Math.max(15,n):0}%`,t?this._q("#live-meta").textContent=n<100?`Tahan pose "${t}" (${n}%) • Keyakinan ${s}%`:`Terkunci "${t}" ✓ • Keyakinan ${s}%`:this._q("#live-meta").textContent="Menunggu gerakan tangan yang stabil",this._renderSubtitle(n>=75?t:null)}updateVideoOptions(t,e){const i=this._q("#video-select"),a=e||i.value;i.innerHTML='<option value="auto">Auto (Lawan Bicara)</option>',t.forEach((n,s)=>{const r=n.video||n,l=n.label||(n.isSelf?"Kamera Saya (PiP)":"Lawan Bicara (Utama)"),d=r.videoWidth||r.width||0,c=r.videoHeight||r.height||0,o=document.createElement("option");o.value=String(s),o.textContent=`#${s+1} ${l} (${d}×${c})`,i.appendChild(o)}),[...i.options].some(n=>n.value===a)&&(i.value=a)}appendTranscript(t){t===" "?this.transcriptTokens.length>0&&this.transcriptTokens[this.transcriptTokens.length-1]!==" "&&this.transcriptTokens.push(" "):this.transcriptTokens.push(t),this._renderTranscript()}finalizeCurrentWord(){this.transcriptTokens.length>0&&this.transcriptTokens[this.transcriptTokens.length-1]!==" "&&(this.transcriptTokens.push(" "),this._renderTranscript())}getTranscriptText(){const t=this.transcriptTokens[this.transcriptTokens.length-1]===" ";return z(this.transcriptTokens,t)}_renderTranscript(){const t=this._q("#transcript-box"),e=this.getTranscriptText();t.textContent=e||"Hasil terjemahan kalimat akan muncul di sini...",t.scrollTop=t.scrollHeight,this._renderSubtitle()}_renderSubtitle(t=null){if(!this.subtitleShadow)return;const e=this.subtitleShadow.querySelector("#cc-wrap"),i=this.subtitleShadow.querySelector("#cc-text"),a=this.subtitleShadow.querySelector("#cc-live-tag"),n=this.getTranscriptText().toLowerCase();if(!this.subtitleEnabled||!n&&!t){e.classList.remove("visible");return}t&&t!=="✋"?(a.style.display="inline-block",a.textContent=`Terdeteksi: ${t}`):a.style.display="none";const r=(n?n.split(/\s+/):[]).slice(-10).join(" ");i.textContent=r||(t&&t!=="✋"?t.toLowerCase():""),e.classList.toggle("visible",!!i.textContent)}syncSubtitlePosition(t){if(!this.subtitleHost)return;if(!t){this.subtitleHost.style.left="50%",this.subtitleHost.style.top="auto",this.subtitleHost.style.bottom="28px",this.subtitleHost.style.transform="translateX(-50%)";return}const e=t.getBoundingClientRect();if(e.width<80||e.height<80)return;const i=Math.min(Math.max(e.left+e.width/2,160),window.innerWidth-160),a=Math.min(Math.max(e.bottom-56,20),window.innerHeight-64);this.subtitleHost.style.left=`${Math.round(i)}px`,this.subtitleHost.style.top=`${Math.round(a)}px`,this.subtitleHost.style.bottom="auto",this.subtitleHost.style.transform="translateX(-50%)"}playTextToSign(t){if(clearTimeout(this.signTimer),this.signSequence=K(t),this.signIndex=0,this.signSequence.length===0){this._q("#sign-stage").innerHTML='<div class="sign-stage-cue">Tidak ada kata/huruf yang dapat diterjemahkan.</div>',this._q("#seq-strip").innerHTML="";return}this._renderSeqStrip(),this._startSignPlayback()}_renderSeqStrip(){const t=this._q("#seq-strip");t.innerHTML="",this.signSequence.forEach((e,i)=>{const a=document.createElement("span");a.className=`seq-item${i===this.signIndex?" current":""}`,a.textContent=e.label,t.appendChild(a)})}async _resolveVideoBlobUrl(t,e){if(!t)return e;if(this._videoBlobCache.has(t))return this._videoBlobCache.get(t);try{const i=await chrome.runtime.sendMessage({type:"GET_ASSET_DATA_URL",path:t});if(i!=null&&i.ok&&i.dataUrl){const n=await(await fetch(i.dataUrl)).blob(),s=URL.createObjectURL(n);return this._videoBlobCache.set(t,s),s}}catch{}return e}async _startSignPlayback(){if(clearTimeout(this.signTimer),this.signIndex>=this.signSequence.length){this.isPlayingSign=!1;return}this.isPlayingSign=!0;const t=this.signIndex,e=this.signSequence[t],i=this._q("#sign-stage");if(e.type==="letter"&&e.assetUrl)i.innerHTML=`
        <img src="${e.assetUrl}" alt="Isyarat huruf ${e.label}" />
        <div class="sign-stage-title">Huruf ${e.label}</div>
        <div class="sign-stage-cue">${e.cue}</div>
      `;else if(e.videoPath||e.videoUrl){const a=await this._resolveVideoBlobUrl(e.videoPath,e.videoUrl);if(this.signIndex!==t)return;i.innerHTML=`
        <video src="${a}" autoplay muted loop playsinline></video>
        <div class="sign-stage-title">${e.label}</div>
        <div class="sign-stage-cue">${e.cue}</div>
      `}else i.innerHTML=`
        <div class="sign-word-icon">${e.icon||"🤟"}</div>
        <div class="sign-stage-title">${e.label}</div>
        <div class="sign-stage-cue">${e.cue}</div>
      `;this._renderSeqStrip(),this.signTimer=setTimeout(()=>{this.signIndex++,this.signIndex<this.signSequence.length?this._startSignPlayback():this.isPlayingSign=!1},e.durationMs)}setTrainStatus(t){this._q("#train-status").textContent=t}renderDatasetList(t){const e=this._q("#train-list"),i=Object.entries(t).sort((a,n)=>a[0].localeCompare(n[0]));if(i.length===0){e.innerHTML='<div class="hint">Belum ada sampel. Rekam minimal 2 label agar KNN dapat membedakan isyarat.</div>';return}e.innerHTML="";for(const[a,n]of i){const s=document.createElement("div");s.className="train-row",s.innerHTML=`
        <span><b>${a}</b> — ${n} sampel</span>
        <button class="train-del" data-label="${a}">Hapus</button>
      `,s.querySelector(".train-del").addEventListener("click",()=>{var r,l;(l=(r=this.callbacks).onDeleteLabel)==null||l.call(r,a)}),e.appendChild(s)}}_toggleVoiceToSign(){if(this.isListeningVoice&&this.recognition){this._userPausedVoice=!0,this._voiceAutoRestart=!1,this.recognition.stop();return}this._userPausedVoice=!1,this.startVoiceAutoListen()}startVoiceAutoListen(){const t=window.SpeechRecognition||window.webkitSpeechRecognition;if(!t){this._q("#sign-stage").innerHTML='<div class="sign-stage-cue">Browser ini tidak mendukung Web Speech API (SpeechRecognition).</div>';return}if(this.isListeningVoice)return;const e=this._q("#btn-voice-sign"),i=this._q("#tts-input"),a=this._q("#sign-stage"),n=new t;n.lang="id-ID",n.interimResults=!0,n.continuous=!0,n.maxAlternatives=1,this.recognition=n,this._voiceAutoRestart=!0,n.onstart=()=>{this.isListeningVoice=!0,e.classList.add("listening"),e.textContent="Stop",a.innerHTML='<div class="sign-stage-title">Mendengarkan suara...</div><div class="sign-stage-cue">Suara yang terdengar otomatis dikonversi menjadi isyarat tangan.</div>'},n.onresult=s=>{let r="",l="";for(let c=s.resultIndex;c<s.results.length;c++){const o=s.results[c][0].transcript;s.results[c].isFinal?l+=o:r+=o}const d=(l||r).trim();d&&(i.value=d),l.trim()&&this.playTextToSign(l.trim())},n.onerror=s=>{if(s.error==="no-speech")return;this._voiceAutoRestart=!1;const r=s.error==="not-allowed"?"Izin mikrofon ditolak. Aktifkan izin mic di situs ini.":`Gagal mengenali suara (${s.error}).`;a.innerHTML=`<div class="sign-stage-cue">${r}</div>`},n.onend=()=>{if(this._voiceAutoRestart)try{n.start();return}catch{this._voiceAutoRestart=!1}this.isListeningVoice=!1,e.classList.remove("listening"),e.textContent="Suara"};try{n.start()}catch{this.isListeningVoice=!1,e.classList.remove("listening"),e.textContent="Suara"}}destroy(){if(clearTimeout(this.signTimer),this.recognition){try{this.recognition.stop()}catch{}this.recognition=null}this.host&&(this.host.remove(),this.host=null),this.subtitleHost&&(this.subtitleHost.remove(),this.subtitleHost=null)}}const b={ENABLED:"isyarat_enabled",DATASET:"isyarat_knn_dataset",DATASET_VERSION:"isyarat_dataset_version"},M=3,F=1e3/16,C=256,D=192;function R(u){if(!u||!u.getBoundingClientRect)return 0;const t=u.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}function W(){const u=[],t=[];for(const e of document.querySelectorAll("video"))e.readyState>=2&&e.videoWidth>0&&e.videoHeight>0&&!e.paused&&!e.ended&&u.push(e);for(const e of document.querySelectorAll("canvas")){const i=e.getBoundingClientRect();e.width>=100&&e.height>=100&&i.width>=100&&i.height>=100&&i.width<=window.innerWidth*.92&&t.push(e)}return{videos:u,canvases:t}}function Y(u,t){const e=[];if(u.length===1){const i=t.length>0;e.push({video:u[0],isSelf:i,label:i?"Kamera Saya (#1)":"Video #1"})}else if(u.length>1){const i=Math.max(...u.map(R));u.forEach((a,n)=>{let s=!1;i>2500?s=R(a)<i*.6:u.some(l=>!l.muted)?s=!!a.muted:s=n===0,e.push({video:a,isSelf:s,label:s?`Kamera Saya (#${n+1})`:`Lawan Bicara (#${n+1})`})})}return t.forEach((i,a)=>{e.push({video:i,isSelf:!1,isCanvas:!0,label:`Layar Call #${a+1}`})}),e.sort((i,a)=>Number(i.isSelf)-Number(a.isSelf)),e}class X{constructor(){this.enabled=!0,this.detectorReady=!1,this.detectorInitializing=!1,this.inFlight=!1,this.classifier=new q({k:5,maxDistance:1.45,minConfidence:.68}),this.stability=new U({windowSize:7,minConsensus:5,cooldownMs:1200,preventConsecutiveDuplicate:!0,maxMotionDelta:.24}),this.noHandFrames=0,this.ui=null,this.videoEntries=[],this.selectedVideoMode="auto",this.recognitionMode="all",this.observer=null,this.rafId=null,this.lastFrameTime=0,this.modelError=null,this.captureCanvas=document.createElement("canvas"),this.captureCanvas.width=C,this.captureCanvas.height=D,this.captureCtx=this.captureCanvas.getContext("2d",{willReadFrequently:!1}),this.recording=null}async start(){var e,i;const t=await chrome.storage.local.get([b.ENABLED,b.DATASET,b.DATASET_VERSION]);this.enabled=typeof t[b.ENABLED]=="boolean"?t[b.ENABLED]:!0,((i=(e=t[b.DATASET])==null?void 0:e.samples)==null?void 0:i.length)>0&&t[b.DATASET_VERSION]===M?this.classifier.importDataset(t[b.DATASET],!1):await this._loadDefaultDataset(!1),this.ui=new G({onSelectVideo:a=>{this.selectedVideoMode=a},onSelectRecognitionMode:a=>{this.recognitionMode=a,this.stability.reset()},onCycleVideo:()=>this._cycleVideoSource(),onRecordLabel:a=>this._startRecording(a),onDeleteLabel:a=>this._deleteLabel(a),onExportDataset:()=>this._exportDataset(),onImportDataset:a=>this._importDataset(a),onClearDataset:()=>this._clearDataset(),onLoadDefaultDataset:()=>this._loadDefaultDataset(!0)}),this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setVisible(this.enabled),this._listenMessages(),this._watchVideos(),this.enabled&&(await this._ensureDetector(),this._startLoop())}_listenMessages(){chrome.runtime.onMessage.addListener((t,e,i)=>t!=null&&t.type?t.type==="TOGGLE_ENABLED"?(this.setEnabled(!!t.enabled),i({ok:!0}),!0):t.type==="OPEN_QUICK_TRAIN"?(this.setEnabled(!0),this.ui.setCollapsed(!1),this.ui.switchTab("quick-train"),i({ok:!0}),!0):t.type==="GET_STATUS"?(i({ok:!0,enabled:this.enabled,videoCount:this.videoEntries.length,detectorReady:this.detectorReady,sampleCount:this.classifier.sampleCount}),!0):!1:!1)}async setEnabled(t){var e;this.enabled=t,(e=this.ui)==null||e.setVisible(t),t?(await this._ensureDetector(),this._startLoop()):this._stopLoop()}async _ensureDetector(){if(!(this.detectorReady||this.detectorInitializing)){this.detectorInitializing=!0,this.ui.setStatus("Memuat MediaPipe lokal...","warn");try{const t=await chrome.runtime.sendMessage({type:"ENSURE_OFFSCREEN"});if(!(t!=null&&t.ok))throw new Error((t==null?void 0:t.error)||"Gagal membuat offscreen engine.");const e=await chrome.runtime.sendMessage({type:"OFFSCREEN_INIT"});if(!(e!=null&&e.ok))throw new Error((e==null?void 0:e.error)||"Gagal inisialisasi HandLandmarker.");this.detectorReady=!0,this.modelError=null,this.ui.setStatus("Model lokal siap","live"),this.ui.setMeta("Menunggu video call lawan bicara...")}catch(t){this.modelError=(t==null?void 0:t.message)||String(t),this.ui.setStatus("Gagal memuat model","err"),this.ui.setMeta(`Error: ${this.modelError}`)}finally{this.detectorInitializing=!1}}}_scanVideos(){var n;const{videos:t,canvases:e}=W(),i=Y(t,e),a=i.length!==this.videoEntries.length||i.some((s,r)=>{var l,d;return s.video!==((l=this.videoEntries[r])==null?void 0:l.video)||s.isSelf!==((d=this.videoEntries[r])==null?void 0:d.isSelf)});this.videoEntries=i,a&&((n=this.ui)==null||n.updateVideoOptions(this.videoEntries,this.selectedVideoMode))}_getActiveVideoEntry(){if(this.videoEntries.length===0)return null;if(this.selectedVideoMode!=="auto"){const e=Number(this.selectedVideoMode);if(this.videoEntries[e])return this.videoEntries[e]}if(this.recording){const e=this.videoEntries.find(i=>i.isSelf);if(e)return e}return this.videoEntries.find(e=>!e.isSelf)||this.videoEntries[0]}_cycleVideoSource(){var a;if(this.videoEntries.length<=1)return;const t=this._getActiveVideoEntry(),i=(this.videoEntries.indexOf(t)+1)%this.videoEntries.length;this.selectedVideoMode=String(i),(a=this.ui)==null||a.updateVideoOptions(this.videoEntries,this.selectedVideoMode)}_watchVideos(){this._scanVideos();let t=!1;this.observer=new MutationObserver(()=>{t||(t=!0,setTimeout(()=>{t=!1,this._scanVideos()},1200))}),this.observer.observe(document.documentElement,{childList:!0,subtree:!0}),setInterval(()=>this._scanVideos(),2e3)}_startLoop(){if(this.rafId!==null)return;const t=e=>{this.rafId=requestAnimationFrame(t),this.enabled&&(e-this.lastFrameTime<F||this.inFlight||(this.lastFrameTime=e,this._processFrame()))};this.rafId=requestAnimationFrame(t)}_stopLoop(){this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)}async _processFrame(){if(this.modelError||!this.detectorReady)return;const t=this._getActiveVideoEntry();if(this.ui.syncSubtitlePosition((t==null?void 0:t.video)||null),!t){this.ui.setStatus("Menunggu video call aktif...","warn");return}const e=this.videoEntries.indexOf(t),i=t.label||(t.isSelf?"Kamera Saya":"Lawan Bicara");this.ui.setStatus(`Aktif • ${i} (${this.videoEntries.length} sumber)`,"live"),this.ui.drawAllVideoPreviews(this.videoEntries,e);let a;try{const m=t.video.videoWidth||t.video.width||C,x=t.video.videoHeight||t.video.height||D,v=256,h=Math.min(v/m,v/x,1),g=Math.max(64,Math.round(m*h)),y=Math.max(64,Math.round(x*h));(this.captureCanvas.width!==g||this.captureCanvas.height!==y)&&(this.captureCanvas.width=g,this.captureCanvas.height=y),this.captureCtx.drawImage(t.video,0,0,g,y),this.ui.drawVideoPreview(t.video),a=this.captureCanvas.toDataURL("image/jpeg",.7)}catch{return}this.inFlight=!0;let n;try{n=await chrome.runtime.sendMessage({type:"OFFSCREEN_DETECT_FRAME",dataUrl:a})}catch{this.inFlight=!1;return}if(this.inFlight=!1,!(n!=null&&n.ok)||!n.vectors||n.vectors.length===0){this.noHandFrames++,this.noHandFrames===24&&this.ui.finalizeCurrentWord(),this.stability.push(null,Date.now(),null),this.ui.updateLivePrediction(null,0,0,0);return}this.noHandFrames=0;const s=n.vectors[0];if(this.recording&&this.recording.remaining>0){if(this.classifier.addSample(this.recording.label,s),this.recording.remaining--,this.recording.captured++,this.ui.setTrainStatus(`Merekam "${this.recording.label}": ${this.recording.captured}/${this.recording.total} sampel...`),this.recording.remaining===0){const m=this.recording.label,x=this.recording.captured;this.recording=null,this._saveDataset().then(()=>{this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus(`Selesai! ${x} sampel "${m}" disimpan ke chrome.storage.local.`)})}return}const r=this.recognitionMode||"all",l=this.classifier.predict(s,r),d=n.geometricSign,c=n.geometricLetter;let o=null,p=0;const S=l.latencyMs||.2;if(r==="letters")c!=null&&c.label?(o=c.label,p=c.confidence):l.label&&(o=l.label,p=l.confidence);else if(r==="words")l.label&&l.distance<=.65&&l.confidence>=.82?(o=l.label,p=l.confidence):d!=null&&d.label?(o=d.label,p=d.confidence):l.label&&(o=l.label,p=l.confidence);else{const m=new Set(["A","B","C","E","L","M","N","O","P","Q","R","S","T","U","X"]);c!=null&&c.label&&m.has(c.label)?(o=c.label,p=c.confidence):d!=null&&d.label?(o=d.label,p=d.confidence):c!=null&&c.label?(o=c.label,p=c.confidence):l.label&&(o=l.label,p=l.confidence)}const k=this.stability.push(o,Date.now(),s);this.ui.updateLivePrediction(o,p,S,k.holdProgress??0),k.committed&&k.stableLabel&&this.ui.appendTranscript(k.stableLabel)}_startRecording(t){const e=t.trim().toUpperCase();if(e){if(!this.detectorReady){this.ui.setTrainStatus("Model MediaPipe belum siap.");return}this.recording={label:e,remaining:15,total:15,captured:0},this.ui.setTrainStatus(`Tahan pose "${e}" di depan kamera...`)}}async _deleteLabel(t){this.classifier.removeLabel(t),await this._saveDataset(),this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus(`Label "${t}" dihapus.`)}async _clearDataset(){this.classifier.clear(),await this._saveDataset(),this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus("Semua sampel dataset telah dihapus.")}async _importDataset(t){const e=this.classifier.importDataset(t,!0);await this._saveDataset(),this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus(`Berhasil mengimpor ${e} sampel.`)}_exportDataset(){const t=this.classifier.exportDataset(),e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),i=URL.createObjectURL(e),a=document.createElement("a");a.href=i,a.download="isyarat-live-dataset.json",a.click(),setTimeout(()=>URL.revokeObjectURL(i),1e3),this.ui.setTrainStatus("Dataset diekspor sebagai isyarat-live-dataset.json.")}async _loadDefaultDataset(t=!0){try{const e=await chrome.runtime.sendMessage({type:"LOAD_DEFAULT_DATASET"});if(!(e!=null&&e.ok)||!e.dataset)throw new Error("Dataset kosong");const i=this.classifier.importDataset(e.dataset,!1);await this._saveDataset(),t&&this.ui&&(this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus(`Dataset bawaan (${i} sampel Huruf A-Z & Kata) berhasil dimuat.`))}catch{t&&this.ui&&this.ui.setTrainStatus("Dataset bawaan tidak ditemukan.")}}async _saveDataset(){await chrome.storage.local.set({[b.DATASET]:this.classifier.exportDataset(),[b.DATASET_VERSION]:M})}}window.__ISYARAT_LIVE_BOOTED__||(window.__ISYARAT_LIVE_BOOTED__=!0,new X().start())})();
