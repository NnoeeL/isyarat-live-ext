(function(){"use strict";function le(t,e){let n=0;const i=t.length;for(let a=0;a<i;a++){const r=t[a]-e[a];n+=r*r}return n}class Ui{constructor(e={}){this.k=e.k??5,this.maxDistance=e.maxDistance??2.2,this.minConfidence=e.minConfidence??.55,this.samples=[]}addSample(e,n){const i=String(e||"").trim().toUpperCase();return!i||!Array.isArray(n)||n.length===0?!1:(this.samples.push({label:i,vector:Array.from(n)}),!0)}removeLabel(e){const n=String(e||"").trim().toUpperCase(),i=this.samples.length;return this.samples=this.samples.filter(a=>a.label!==n),i-this.samples.length}clear(){this.samples=[]}getLabelCounts(){const e={};for(const n of this.samples)e[n.label]=(e[n.label]||0)+1;return e}get sampleCount(){return this.samples.length}predict(e,n="all"){var Q;const i=typeof performance<"u"?performance.now():Date.now();if(!Array.isArray(e)||this.samples.length===0)return{label:null,confidence:0,distance:1/0,latencyMs:0};const a=n==="letters"?this.samples.filter(f=>f.label.length===1):n==="words"?this.samples.filter(f=>f.label.length>1):this.samples;if(a.length===0)return{label:null,confidence:0,distance:1/0,latencyMs:0};const r=Math.min(this.k,a.length),s=new Array(a.length),o=new Array(e.length);for(let f=0;f<e.length;f+=3)o[f]=-e[f],o[f+1]=e[f+1],o[f+2]=e[f+2];for(let f=0;f<a.length;f++){const S=a[f];if(S.vector.length!==e.length){s[f]={label:S.label,dist:1/0};continue}const Nt=le(e,S.vector),Br=le(o,S.vector);s[f]={label:S.label,dist:Math.sqrt(Math.min(Nt,Br))}}s.sort((f,S)=>f.dist-S.dist);const l=s.slice(0,r),d=((Q=l[0])==null?void 0:Q.dist)??1/0;if(d>this.maxDistance){const f=typeof performance<"u"?performance.now():Date.now();return{label:null,confidence:0,distance:d,latencyMs:f-i}}const c={};let u=0;const h=1e-4;for(const f of l){if(!Number.isFinite(f.dist))continue;const S=1/(f.dist+h);c[f.label]=(c[f.label]||0)+S,u+=S}let y=null,m=0;for(const[f,S]of Object.entries(c))S>m&&(m=S,y=f);const R=u>0?m/u:0,P=typeof performance<"u"?performance.now():Date.now();return R<this.minConfidence?{label:null,confidence:R,distance:d,latencyMs:P-i}:{label:y,confidence:R,distance:d,latencyMs:P-i}}exportDataset(){return{version:1,updatedAt:new Date().toISOString(),samples:this.samples}}importDataset(e,n=!1){if(!e||!Array.isArray(e.samples))return 0;n||(this.samples=[]);let i=0;for(const a of e.samples)a&&this.addSample(a.label,a.vector)&&i++;return i}}class Ri{constructor(e={}){this.windowSize=e.windowSize??7,this.minConsensus=e.minConsensus??5,this.cooldownMs=e.cooldownMs??1200,this.globalCooldownMs=e.globalCooldownMs??0,this.preventConsecutiveDuplicate=e.preventConsecutiveDuplicate??!1,this.maxMotionDelta=e.maxMotionDelta??.22,this.buffer=[],this.prevVector=null,this.lastCommittedLabel=null,this.lastCommittedAt=0}_computeMotion(e){if(!Array.isArray(e)||e.length===0)return this.prevVector=null,0;if(!this.prevVector||this.prevVector.length!==e.length)return this.prevVector=e,0;const n=le(e,this.prevVector);return this.prevVector=e,Math.sqrt(n/21)}push(e,n=Date.now(),i=null){const a=i?this._computeMotion(i):0;if(this.globalCooldownMs>0&&this.lastCommittedAt>0&&n-this.lastCommittedAt<this.globalCooldownMs)return this.buffer=[],{stableLabel:this.lastCommittedLabel,committed:!1,holdProgress:0,candidateLabel:e,inCooldown:!0};if(i&&a>this.maxMotionDelta)return{stableLabel:null,committed:!1,holdProgress:0,candidateLabel:e,inCooldown:!1};if(this.buffer.push(e),this.buffer.length>this.windowSize&&this.buffer.shift(),!e)return this.buffer.every(u=>u===null)&&(this.lastCommittedLabel=null),{stableLabel:null,committed:!1,holdProgress:0,candidateLabel:null};const r={};for(const u of this.buffer)u&&(r[u]=(r[u]||0)+1);let s=null,o=0;for(const[u,h]of Object.entries(r))h>o&&(o=h,s=u);const l=Math.min(1,o/Math.max(1,this.minConsensus));if(!s||o<this.minConsensus)return{stableLabel:null,committed:!1,holdProgress:l,candidateLabel:s};const d=s===this.lastCommittedLabel;return d&&n-this.lastCommittedAt<this.cooldownMs||this.preventConsecutiveDuplicate&&d?{stableLabel:s,committed:!1,holdProgress:1,candidateLabel:s}:(this.lastCommittedLabel=s,this.lastCommittedAt=n,{stableLabel:s,committed:!0,holdProgress:1,candidateLabel:s})}reset(){this.buffer=[],this.prevVector=null,this.lastCommittedLabel=null,this.lastCommittedAt=0}}const Ve={air:"signs/words/air.mp4",belajar:"signs/words/belajar.mp4",cari:"signs/words/cari.mp4",hari:"signs/words/hari.mp4",ingat:"signs/words/ingat.mp4",lagi:"signs/words/lagi.mp4",maaf:"signs/words/maaf.mp4",makan:"signs/words/makan.mp4",motor:"signs/words/motor.mp4",saya:"signs/words/saya.mp4",aku:"signs/words/saya.mp4",terima:"signs/words/terima.mp4",tuli:"signs/words/tuli.mp4",apa:"signs/words/apa.mp4",siapa:"signs/words/siapa.mp4",kapan:"signs/words/kapan.mp4",dimana:"signs/words/dimana.mp4",mana:"signs/words/dimana.mp4",mengapa:"signs/words/mengapa.mp4",kenapa:"signs/words/mengapa.mp4",bagaimana:"signs/words/bagaimana.mp4",merah:"signs/words/merah.mp4",kuning:"signs/words/kuning.mp4",hijau:"signs/words/hijau.mp4",hitam:"signs/words/hitam.mp4",dengar:"signs/words/dengar.mp4",berangkat:"signs/words/berangkat.mp4",pergi:"signs/words/berangkat.mp4",datang:"signs/words/datang.mp4",teman:"signs/words/teman.mp4",keluarga:"signs/words/keluarga.mp4",rumah:"signs/words/rumah.mp4",pagi:"signs/words/pagi.mp4",siang:"signs/words/siang.mp4",sore:"signs/words/sore.mp4",malam:"signs/words/malam.mp4"},V={air:{label:"AIR",cue:'Isyarat BISINDO untuk "Air"',icon:"💧"},cari:{label:"CARI",cue:'Isyarat BISINDO untuk "Cari"',icon:"🔍"},hari:{label:"HARI",cue:'Isyarat BISINDO untuk "Hari"',icon:"📅"},lagi:{label:"LAGI",cue:'Isyarat BISINDO untuk "Lagi"',icon:"🔁"},motor:{label:"MOTOR",cue:'Isyarat BISINDO untuk "Motor"',icon:"🏍️"},tuli:{label:"TULI",cue:'Isyarat BISINDO untuk "Tuli"',icon:"🤟"},mengapa:{label:"MENGAPA",cue:'Isyarat BISINDO untuk "Mengapa"',icon:"🤔"},merah:{label:"MERAH",cue:'Isyarat BISINDO untuk warna "Merah"',icon:"🔴"},kuning:{label:"KUNING",cue:'Isyarat BISINDO untuk warna "Kuning"',icon:"🟡"},hijau:{label:"HIJAU",cue:'Isyarat BISINDO untuk warna "Hijau"',icon:"🟢"},hitam:{label:"HITAM",cue:'Isyarat BISINDO untuk warna "Hitam"',icon:"⚫"},berangkat:{label:"BERANGKAT",cue:'Isyarat BISINDO untuk "Berangkat"',icon:"🚶"},aku:{label:"AKU",cue:"Tunjuk dada sendiri dengan jari telunjuk",icon:"☝️"},saya:{label:"SAYA",cue:"Tunjuk dada sendiri dengan jari telunjuk",icon:"☝️"},kamu:{label:"KAMU",cue:"Tunjuk ke arah lawan bicara dengan jari telunjuk",icon:"👉"},anda:{label:"ANDA",cue:"Arahkan telapak tangan terbuka ke arah lawan bicara",icon:"🫱"},kita:{label:"KITA",cue:"Gerakkan jari telunjuk melingkar dari bahu kanan ke bahu kiri",icon:"🤝"},kami:{label:"KAMI",cue:"Sentuh bahu kanan lalu bahu kiri dengan jari telunjuk",icon:"👥"},dia:{label:"DIA",cue:"Tunjuk ke samping dengan jari telunjuk",icon:"👈"},mereka:{label:"MEREKA",cue:"Sapukan jari telunjuk menyamping mencakup beberapa orang",icon:"👥"},halo:{label:"HALO",cue:"Lambaikan telapak tangan terbuka di samping kepala",icon:"👋"},hai:{label:"HAI",cue:"Lambaikan telapak tangan terbuka ke arah lawan bicara",icon:"👋"},selamat:{label:"SELAMAT",cue:"Tepuk kedua tangan atau rangkul tangan di depan dada",icon:"🎉"},terima:{label:"TERIMA KASIH",cue:"Sentuh dagu dengan ujung jari lalu gerakkan maju",icon:"🙏"},sama:{label:"SAMA-SAMA",cue:"Arahkan kedua telapak tangan terbuka bergantian ke depan",icon:"🤲"},maaf:{label:"MAAF",cue:"Kepalkan tangan dan putar lembut di depan dada",icon:"🤝"},tolong:{label:"TOLONG",cue:"Letakkan kepalan tangan dengan ibu jari ke atas di atas telapak tangan lain, angkat bersama",icon:"🤲"},permisi:{label:"PERMISI",cue:"Usap punggung tangan kiri dengan ujung jari kanan ke depan",icon:"🙇"},suka:{label:"SUKA",cue:"Letakkan ibu jari & jari tengah di dada lalu tarik maju sambil menguncup",icon:"💚"},cinta:{label:"CINTA",cue:"Silangkan kedua tangan di depan dada seperti memeluk",icon:"🫶"},sayang:{label:"SAYANG",cue:"Silangkan kedua tangan di dada dengan lembut",icon:"❤️"},senang:{label:"SENANG",cue:"Usap dada ke atas dengan telapak tangan terbuka sambil tersenyum",icon:"😊"},bahagia:{label:"BAHAGIA",cue:"Gerakkan kedua telapak tangan ke atas di depan dada berulang kali",icon:"😄"},sedih:{label:"SEDIH",cue:"Turunkan kedua telapak tangan di depan wajah secara perlahan",icon:"😢"},marah:{label:"MARAH",cue:"Tekuk jari seperti cakar di depan wajah lalu tarik ke depan",icon:"😠"},takut:{label:"TAKUT",cue:"Buka kedua tangan di depan dada lalu getarkan sedikit ke dalam",icon:"😨"},capek:{label:"CAPEK",cue:"Letakkan kedua tangan di dada lalu turunkan bahu sambil menghela",icon:"😮‍💨"},sakit:{label:"SAKIT",cue:"Putar kedua jari telunjuk saling berhadapan di dekat bagian yang sakit",icon:"🤕"},lapar:{label:"LAPAR",cue:"Bentuk tangan huruf C lalu turunkan dari dada ke perut",icon:"🍽️"},haus:{label:"HAUS",cue:"Tarik jari telunjuk turun di sepanjang leher",icon:"💧"},ya:{label:"YA",cue:"Kepalkan tangan lalu anggukkan pergelangan tangan ke bawah",icon:"👍"},iya:{label:"IYA",cue:"Kepalkan tangan lalu anggukkan pergelangan tangan ke bawah",icon:"👍"},oke:{label:"OKE",cue:"Temukan ujung ibu jari & telunjuk membentuk lingkaran O, 3 jari lain tegak",icon:"👌"},tidak:{label:"TIDAK",cue:"Gelengkan telapak tangan atau jari telunjuk ke kiri dan kanan",icon:"🙅"},bukan:{label:"BUKAN",cue:"Letakkan ibu jari di bawah dagu lalu jentikkan ke depan",icon:"🚫"},bagus:{label:"BAGUS",cue:"Acungkan ibu jari ke atas dengan mantap",icon:"👍"},baik:{label:"BAIK",cue:"Sentuh dagu dengan telapak tangan lalu turunkan ke telapak tangan lain",icon:"✨"},buruk:{label:"BURUK",cue:"Sentuh dagu lalu balikkan telapak tangan mengarah ke bawah",icon:"👎"},besar:{label:"BESAR",cue:"Rentangkan kedua tangan menjauh ke kiri dan kanan",icon:"↔️"},kecil:{label:"KECIL",cue:"Dekatkan kedua telapak tangan saling berhadapan",icon:"🤏"},banyak:{label:"BANYAK",cue:"Buka kedua kepalan tangan melebar berkali-kali",icon:"🙌"},sedikit:{label:"SEDIKIT",cue:"Jepit tipis ujung ibu jari dan jari telunjuk",icon:"🤏"},cepat:{label:"CEPAT",cue:"Tarik kedua tangan bentuk L ke belakang dengan cepat",icon:"⚡"},pelan:{label:"PELAN",cue:"Usap punggung tangan kiri perlahan ke atas dengan tangan kanan",icon:"🐢"},mau:{label:"MAU",cue:"Buka kedua telapak tangan menghadap atas lalu tarik ke arah tubuh",icon:"🙋"},ingin:{label:"INGIN",cue:"Tarik kedua tangan terbuka ke arah dada",icon:"🙋"},bisa:{label:"BISA",cue:"Kepalkan kedua tangan lalu turunkan bersamaan dengan mantap",icon:"💪"},makan:{label:"MAKAN",cue:"Kuncupkan jari lalu arahkan ke mulut dua kali",icon:"🍽️"},minum:{label:"MINUM",cue:"Bentuk huruf C dengan tangan lalu miringkan ke arah mulut",icon:"🥤"},tidur:{label:"TIDUR",cue:"Tempelkan kedua telapak tangan di samping pipi sambil memiringkan kepala",icon:"😴"},bangun:{label:"BANGUN",cue:"Buka ibu jari & telunjuk di dekat mata seperti kelopak mata terbuka",icon:"👀"},pergi:{label:"PERGI",cue:"Arahkan kedua jari telunjuk maju menjauh dari tubuh",icon:"🚶"},datang:{label:"DATANG",cue:"Gerakkan jari telunjuk dari depan menuju ke arah tubuh",icon:"👋"},pulang:{label:"PULANG",cue:"Kuncupkan jari sentuh pipi lalu arahkan ke bentuk atap rumah",icon:"🏠"},kerja:{label:"KERJA",cue:"Ketukkan pergelangan kepalan tangan kanan di atas kepalan tangan kiri",icon:"💼"},belajar:{label:"BELAJAR",cue:"Buka telapak tangan kiri seperti buku, tangan kanan mengambil ke arah dahi",icon:"📖"},tunggu:{label:"TUNGGU",cue:"Angkat kedua telapak tangan terbuka menghadap atas lalu gerakkan jari ringan",icon:"⏳"},lihat:{label:"LIHAT",cue:"Bentuk huruf V dengan telunjuk & jari tengah, arahkan dari mata ke depan",icon:"👁️"},dengar:{label:"DENGAR",cue:"Tunjuk atau lengkungkan tangan di belakang telinga",icon:"👂"},bicara:{label:"BICARA",cue:"Gerakkan jari telunjuk memutar kecil di depan mulut",icon:"🗣️"},paham:{label:"PAHAM",cue:"Jentikkan jari telunjuk tegak di samping pelipis",icon:"💡"},erti:{label:"MENGERTI",cue:"Jentikkan jari telunjuk tegak di samping pelipis",icon:"💡"},tahu:{label:"TAHU",cue:"Ketuk pelipis dahi dengan ujung jari-jari tangan kanan",icon:"🧠"},ingat:{label:"INGAT",cue:"Sentuh dahi dengan ibu jari lalu tempelkan ke ibu jari tangan kiri",icon:"💭"},lupa:{label:"LUPA",cue:"Usap dahi dari kiri ke kanan lalu kuncupkan jari",icon:"🤷"},apa:{label:"APA",cue:"Buka kedua telapak tangan menghadap atas sambil digoyangkan ringan",icon:"❓"},siapa:{label:"SIAPA",cue:"Lingkarkan jari telunjuk di sekitar dagu/mulut",icon:"❓"},dimana:{label:"DI MANA",cue:"Angkat jari telunjuk lalu goyangkan ke kiri dan kanan",icon:"📍"},mana:{label:"MANA",cue:"Angkat jari telunjuk lalu goyangkan ke kiri dan kanan",icon:"📍"},kapan:{label:"KAPAN",cue:"Putar jari telunjuk kanan mengelilingi ujung telunjuk kiri lalu sentuhkan",icon:"🕒"},kenapa:{label:"KENAPA",cue:"Sentuh dahi lalu tarik tangan keluar membentuk huruf Y",icon:"🤔"},bagaimana:{label:"BAGAIMANA",cue:"Temukan punggung kedua tangan lalu putar terbuka ke atas",icon:"❓"},nama:{label:"NAMA",cue:"Ketukkan jari telunjuk & tengah kanan di atas jari telunjuk & tengah kiri",icon:"🏷️"},kabar:{label:"KABAR",cue:"Buka kedua telapak tangan dari dada ke arah depan",icon:"💬"},pagi:{label:"PAGI",cue:"Angkat lengan kanan seperti matahari terbit di atas lengan kiri",icon:"🌅"},siang:{label:"SIANG",cue:"Tegakkan lengan kanan di atas lengan kiri seperti matahari di atas kepala",icon:"☀️"},sore:{label:"SORE",cue:"Miringkan lengan kanan turun perlahan di atas lengan kiri",icon:"🌇"},malam:{label:"MALAM",cue:"Lengkungkan telapak tangan kanan turun melewati pergelangan tangan kiri",icon:"🌙"},rumah:{label:"RUMAH",cue:"Temukan ujung jari kedua tangan membentuk atap segitiga",icon:"🏠"},sekolah:{label:"SEKOLAH",cue:"Tepukkan kedua telapak tangan dua kali dengan ritmis",icon:"🏫"},teman:{label:"TEMAN",cue:"Kaitkan kedua jari telunjuk saling bertautan bergantian",icon:"🤝"},keluarga:{label:"KELUARGA",cue:"Bentuk huruf F dengan kedua tangan lalu buat lingkaran ke depan",icon:"👨‍👩‍👧‍👦"},ibu:{label:"IBU",cue:"Sentuh dagu dengan ibu jari dari telapak tangan terbuka",icon:"👩"},ayah:{label:"AYAH",cue:"Sentuh dahi dengan ibu jari dari telapak tangan terbuka",icon:"👨"}},Oi=[{phrase:"terima kasih",key:"terima"},{phrase:"sama sama",key:"sama"},{phrase:"apa kabar",key:"kabar"},{phrase:"di mana",key:"dimana"}],ze=/(lah|kah|tah|pun|nya|ku|mu)$/,Fe=/(kan|an|i)$/;function qi(t){let e=String(t||"").toLowerCase().replace(/[^a-z-]/g,"");if(!e)return"";if(e.includes("-")){const a=e.split("-").filter(Boolean);a.length===2&&a[0]===a[1]?e=a[0]:e=a[0]||""}if(V[e]||e.length<=3)return e;if(ze.test(e)){const a=e.replace(ze,"");if(a.length>=3&&(e=a,V[e]))return e}const n=[[/^meny([aiueo])/,"s$1"],[/^meng([aiueo])/,"$1"],[/^meng/,""],[/^men([aiueo])/,"t$1"],[/^men/,""],[/^mem([aiueo])/,"p$1"],[/^mem/,""],[/^me/,""],[/^peng/,""],[/^pen/,""],[/^pem/,""],[/^ber/,""],[/^ter/,""],[/^di/,""],[/^ke/,""],[/^se/,""]];let i=null;for(const[a,r]of n)if(a.test(e)){const s=e.replace(a,r);if(s.length>=3){if(V[s])return s;i===null&&(i=s)}}if(i!==null&&(e=i),Fe.test(e)){const a=e.replace(Fe,"");if(a.length>=3){if(V[a])return a;e=a}}return e}const Ge={a:{fingers:[1,0,0,0,0],hint:"Kepal, ibu jari di sisi"},b:{fingers:[0,1,1,1,1],hint:"4 jari tegak, ibu jari lipat"},c:{fingers:[.5,.5,.5,.5,.5],hint:"Tangan melengkung bentuk C"},d:{fingers:[.5,1,0,0,0],hint:"Telunjuk tegak, jari lain melingkar"},e:{fingers:[0,.5,.5,.5,.5],hint:"Ujung jari menekuk ke telapak"},f:{fingers:[.5,.5,1,1,1],hint:"Ibu jari & telunjuk bertemu, 3 tegak"},g:{fingers:[.5,1,0,0,0],hint:"Telunjuk & ibu jari sejajar ke samping"},h:{fingers:[0,1,1,0,0],hint:"Telunjuk & tengah lurus ke samping"},i:{fingers:[0,0,0,0,1],hint:"Kelingking tegak, jari lain kepal"},j:{fingers:[0,0,0,0,1],hint:"Kelingking tegak lalu lengkungkan J"},k:{fingers:[.5,1,1,0,0],hint:"Telunjuk & tengah V, ibu jari di tengah"},l:{fingers:[1,1,0,0,0],hint:"Ibu jari & telunjuk bentuk L"},m:{fingers:[0,.5,.5,.5,0],hint:"3 jari menutupi ibu jari"},n:{fingers:[0,.5,.5,0,0],hint:"2 jari menutupi ibu jari"},o:{fingers:[.5,.5,.5,.5,.5],hint:"Semua ujung jari bertemu bentuk O"},p:{fingers:[.5,1,.5,0,0],hint:"Seperti K mengarah ke bawah"},q:{fingers:[.5,.5,0,0,0],hint:"Seperti G mengarah ke bawah"},r:{fingers:[0,1,1,0,0],hint:"Telunjuk & jari tengah menyilang"},s:{fingers:[.5,0,0,0,0],hint:"Kepalan erat, ibu jari di depan"},t:{fingers:[.5,.5,0,0,0],hint:"Ibu jari diselipkan di bawah telunjuk"},u:{fingers:[0,1,1,0,0],hint:"Telunjuk & tengah rapat tegak"},v:{fingers:[0,1,1,0,0],hint:"Telunjuk & tengah terbuka bentuk V"},w:{fingers:[0,1,1,1,0],hint:"3 jari tengah terbuka bentuk W"},x:{fingers:[0,.5,0,0,0],hint:"Telunjuk melengkung seperti kait"},y:{fingers:[1,0,0,0,1],hint:"Ibu jari & kelingking terbuka"},z:{fingers:[0,1,0,0,0],hint:"Telunjuk menggambar huruf Z di udara"}};function Ki(t){const e=String(t||"a").toLowerCase(),n=Ge[e]||Ge.a,[i,a,r,s,o]=n.fingers,l=u=>u===1?38:u===.5?22:10,d=u=>u===1?"#4d7c6f":u===.5?"#789d91":"#d6d3cd",c=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><rect width="120" height="120" rx="20" fill="#ffffff" stroke="#e7e5e4" stroke-width="2"/><rect x="8" y="8" width="28" height="28" rx="8" fill="#4d7c6f"/><text x="22" y="27" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#ffffff">${e.toUpperCase()}</text><g transform="translate(22, 18)"><rect x="${i===1?4:12}" y="${i===1?48:56}" width="11" height="${i===1?26:16}" rx="5.5" transform="rotate(${i===1?-35:-15} 10 60)" fill="${d(i)}"/><rect x="20" y="${54-l(a)}" width="11" height="${l(a)}" rx="5.5" fill="${d(a)}"/><rect x="34" y="${52-l(r)}" width="11" height="${l(r)}" rx="5.5" fill="${d(r)}"/><rect x="48" y="${54-l(s)}" width="11" height="${l(s)}" rx="5.5" fill="${d(s)}"/><rect x="62" y="${58-l(o)}" width="10" height="${l(o)}" rx="5" fill="${d(o)}"/><rect x="18" y="50" width="54" height="32" rx="14" fill="#e7e5e4" stroke="#a8a29e" stroke-width="1.2"/></g></svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(c)}`}function Hi(t){var n;const e=String(t||"").match(/^signs\/([a-z])\.svg$/i);return e?Ki(e[1]):typeof chrome<"u"&&((n=chrome==null?void 0:chrome.runtime)!=null&&n.getURL)?chrome.runtime.getURL(t):t}function $i(t,e=Hi){let n=String(t||"").toLowerCase().replace(/[^\p{L}\s-]/gu," ").replace(/\s+/g," ").trim();if(!n)return[];for(const{phrase:r,key:s}of Oi){const o=new RegExp(`\\b${r}\\b`,"g");n=n.replace(o,`__phrase_${s}__`)}const i=n.split(" ").filter(Boolean),a=[];for(const r of i){const s=r.match(/^__phrase_([a-z]+)__$/);if(s){const c=s[1],u=V[c];if(u){const h=Ve[c];a.push({type:"word",label:u.label,sourceWord:u.label.toLowerCase(),cue:u.cue,icon:u.icon,videoPath:h,videoUrl:h?e(h):void 0,durationMs:h?2600:1400});continue}}const o=qi(r),l=V[r]?r:V[o]?o:null,d=l?V[l]:null;if(d){const c=Ve[l];a.push({type:"word",label:d.label,sourceWord:r,cue:d.cue,icon:d.icon,videoPath:c,videoUrl:c?e(c):void 0,durationMs:c?2600:1300})}else{const c=r.replace(/[^a-z]/g,"");for(const u of c)a.push({type:"letter",label:u.toUpperCase(),sourceWord:r,cue:`Eja huruf "${u.toUpperCase()}" (SIBI/BISINDO)`,assetUrl:e(`signs/${u}.svg`),durationMs:800})}}return a}const Dt=["aku","saya","kamu","anda","kita","kami","dia","mereka","halo","hai","selamat","pagi","siang","sore","malam","terima","kasih","sama","maaf","tolong","permisi","suka","cinta","sayang","senang","bahagia","sedih","marah","takut","capek","lelah","sakit","sehat","lapar","haus","baik","bagus","buruk","hebat","mantap","keren","cantik","ganteng","ya","iya","oke","siap","tidak","bukan","belum","sudah","lagi","masih","sedang","akan","bisa","mau","ingin","harus","boleh","jangan","ada","tiada","banyak","sedikit","semua","ini","itu","sini","situ","sana","dan","atau","tapi","karena","kalau","jika","untuk","dari","ke","di","dengan","makan","minum","tidur","bangun","mandi","pergi","berangkat","datang","pulang","jalan","lari","duduk","berdiri","masuk","keluar","kerja","belajar","baca","tulis","hitung","main","tunggu","cari","lihat","nonton","dengar","bicara","ngobrol","tanya","jawab","paham","mengerti","tahu","kenal","ingat","lupa","beli","bayar","bantu","punya","pakai","buka","tutup","apa","siapa","dimana","mana","kapan","kenapa","mengapa","bagaimana","berapa","nama","kabar","teman","sahabat","keluarga","ibu","mama","ayah","bapak","papa","kakak","adik","anak","orang","guru","dosen","dokter","tuli","dengar","rumah","sekolah","kampus","kantor","kelas","kamar","jalan","kota","indonesia","air","nasi","roti","kopi","teh","susu","obat","uang","buku","hp","telepon","motor","mobil","jam","hari","minggu","bulan","tahun","sekarang","besok","kemarin","nanti","merah","kuning","hijau","biru","hitam","putih","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh"],xt=new Set(Dt),Pi=[...Dt].filter(t=>t.length>=2).sort((t,e)=>e.length-t.length);function We(t){const e=String(t||"").toLowerCase();if(e.length<=2)return e;let n=e.replace(/(.)\1{2,}/g,"$1");if(xt.has(n))return n;const i=n.replace(/(.)\1+/g,"$1");return xt.has(i)?i:n}function Vi(t,e){if(t===e)return 0;const n=t.length,i=e.length;if(Math.abs(n-i)>2)return 99;const a=Array.from({length:n+1},()=>new Array(i+1).fill(0));for(let r=0;r<=n;r++)a[r][0]=r;for(let r=0;r<=i;r++)a[0][r]=r;for(let r=1;r<=n;r++)for(let s=1;s<=i;s++){const o=t[r-1]===e[s-1]?0:1;a[r][s]=Math.min(a[r-1][s]+1,a[r][s-1]+1,a[r-1][s-1]+o)}return a[n][i]}function zi(t,e=!1){var s;const n=We(String(t||"").replace(/[^a-zA-Z]/g,""));if(!n)return[];if(xt.has(n))return[n];const i=n.length,a=new Array(i+1).fill(null);a[0]={cost:0,words:[]};for(let o=0;o<i;o++){if(!a[o])continue;for(const c of Pi){const u=o+c.length;if(u<=i&&n.slice(o,u)===c){const h=a[o].cost+.1;(!a[u]||h<a[u].cost)&&(a[u]={cost:h,words:[...a[o].words,c]})}}const l=o+1,d=a[o].cost+1.2;if(!a[l]||d<a[l].cost){const c=[...a[o].words],u=c[c.length-1];u&&!xt.has(u)?c[c.length-1]=u+n[o]:c.push(n[o]),a[l]={cost:d,words:c}}}let r=((s=a[i])==null?void 0:s.words)||[n];return e&&(r=r.map(o=>{const l=We(o);if(xt.has(l)||l.length<3)return l;let d=l,c=2;for(const u of Dt){if(Math.abs(u.length-l.length)>1||u[0]!==l[0])continue;const h=Vi(l,u);h===1&&h<c&&(c=h,d=u)}return d})),r}function Fi(t,e=!1){if(!Array.isArray(t)||t.length===0)return"";const n=[];let i="";const a=r=>{if(!i)return;const s=zi(i,r);for(const o of s)o&&n.push(o.toUpperCase());i=""};for(const r of t){if(r===" "){a(!0);continue}const s=String(r||"").trim();s&&(s.length===1&&/^[A-Za-z]$/.test(s)?i+=s:(a(!0),n[n.length-1]!==s.toUpperCase()&&n.push(s.toUpperCase())))}return a(e),n.join(" ").replace(/\s+/g," ").trim()}function Gi(t,e=4){const n=String(t||"").toLowerCase().replace(/[^a-z]/g,"");if(n.length<1)return[];const i=[];for(const a of Dt)if(a.startsWith(n)&&a!==n&&(i.push(a.toUpperCase()),i.length>=e))break;return i}var tt=typeof self<"u"?self:{};function Je(t,e){t:{for(var n=["CLOSURE_FLAGS"],i=tt,a=0;a<n.length;a++)if((i=i[n[a]])==null){n=null;break t}n=i}return(t=n&&n[t])!=null?t:e}function Y(){throw Error("Invalid UTF8")}function Ye(t,e){return e=String.fromCharCode.apply(null,e),t==null?e:t+e}let Bt,ue;const Wi=typeof TextDecoder<"u";let Ji;const Yi=typeof TextEncoder<"u";function Xe(t){if(Yi)t=(Ji||(Ji=new TextEncoder)).encode(t);else{let n=0;const i=new Uint8Array(3*t.length);for(let a=0;a<t.length;a++){var e=t.charCodeAt(a);if(e<128)i[n++]=e;else{if(e<2048)i[n++]=e>>6|192;else{if(e>=55296&&e<=57343){if(e<=56319&&a<t.length){const r=t.charCodeAt(++a);if(r>=56320&&r<=57343){e=1024*(e-55296)+r-56320+65536,i[n++]=e>>18|240,i[n++]=e>>12&63|128,i[n++]=e>>6&63|128,i[n++]=63&e|128;continue}a--}e=65533}i[n++]=e>>12|224,i[n++]=e>>6&63|128}i[n++]=63&e|128}}t=n===i.length?i:i.subarray(0,n)}return t}function Ze(t){tt.setTimeout((()=>{throw t}),0)}var ce,Xi=Je(610401301,!1),Qe=Je(748402147,!0);function tn(){var t=tt.navigator;return t&&(t=t.userAgent)?t:""}const en=tt.navigator;function Ut(t){return Ut[" "](t),t}ce=en&&en.userAgentData||null,Ut[" "]=function(){};const nn={};let At=null;function Zi(t){const e=t.length;let n=3*e/4;n%3?n=Math.floor(n):"=.".indexOf(t[e-1])!=-1&&(n="=.".indexOf(t[e-2])!=-1?n-2:n-1);const i=new Uint8Array(n);let a=0;return(function(r,s){function o(d){for(;l<r.length;){const c=r.charAt(l++),u=At[c];if(u!=null)return u;if(!/^[\s\xa0]*$/.test(c))throw Error("Unknown base64 encoding at char: "+c)}return d}an();let l=0;for(;;){const d=o(-1),c=o(0),u=o(64),h=o(64);if(h===64&&d===-1)break;s(d<<2|c>>4),u!=64&&(s(c<<4&240|u>>2),h!=64&&s(u<<6&192|h))}})(t,(function(r){i[a++]=r})),a!==n?i.subarray(0,a):i}function an(){if(!At){At={};var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),e=["+/=","+/","-_=","-_.","-_"];for(let n=0;n<5;n++){const i=t.concat(e[n].split(""));nn[n]=i;for(let a=0;a<i.length;a++){const r=i[a];At[r]===void 0&&(At[r]=a)}}}}var Qi=typeof Uint8Array<"u",rn=!(!(Xi&&ce&&ce.brands.length>0)&&(tn().indexOf("Trident")!=-1||tn().indexOf("MSIE")!=-1))&&typeof btoa=="function";const sn=/[-_.]/g,ta={"-":"+",_:"/",".":"="};function ea(t){return ta[t]||""}function on(t){if(!rn)return Zi(t);t=sn.test(t)?t.replace(sn,ea):t,t=atob(t);const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}function na(t){return Qi&&t!=null&&t instanceof Uint8Array}var Rt={};function de(){return ia||(ia=new et(null,Rt))}function he(t){ln(Rt);var e=t.g;return(e=e==null||na(e)?e:typeof e=="string"?on(e):null)==null?e:t.g=e}var et=class{h(){return new Uint8Array(he(this)||0)}constructor(t,e){if(ln(e),this.g=t,t!=null&&t.length===0)throw Error("ByteString should be constructed with non-empty values")}};let ia,aa;function ln(t){if(t!==Rt)throw Error("illegal external caller")}function un(t,e){t.__closure__error__context__984382||(t.__closure__error__context__984382={}),t.__closure__error__context__984382.severity=e}function ra(t){return un(t=Error(t),"warning"),t}function nt(t,e){if(t!=null){var n=aa??(aa={}),i=n[t]||0;i>=e||(n[t]=i+1,un(t=Error(),"incident"),Ze(t))}}function it(){return typeof BigInt=="function"}var at=typeof Symbol=="function"&&typeof Symbol()=="symbol";function O(t,e,n=!1){return typeof Symbol=="function"&&typeof Symbol()=="symbol"?n&&Symbol.for&&t?Symbol.for(t):t!=null?Symbol(t):Symbol():e}var sa=O("jas",void 0,!0),cn=O(void 0,"0di"),St=O(void 0,"1oa"),z=O(void 0,Symbol()),oa=O(void 0,"0ub"),la=O(void 0,"0ubs"),ge=O(void 0,"0ubsb"),ua=O(void 0,"0actk"),rt=O("m_m","Pa",!0),dn=O();const hn={Ga:{value:0,configurable:!0,writable:!0,enumerable:!1}},gn=Object.defineProperties,g=at?sa:"Ga";var fe;const fn=[];function Tt(t,e){at||g in t||gn(t,hn),t[g]|=e}function M(t,e){at||g in t||gn(t,hn),t[g]=e}function Et(t){return Tt(t,34),t}function _t(t){return Tt(t,8192),t}M(fn,7),fe=Object.freeze(fn);var st={};function F(t,e){return e===void 0?t.h!==ot&&!!(2&(0|t.v[g])):!!(2&e)&&t.h!==ot}const ot={};class pn{constructor(e,n,i){this.g=e,this.h=n,this.l=i}next(){const e=this.g.next();return e.done||(e.value=this.h.call(this.l,e.value)),e}[Symbol.iterator](){return this}}function ca(t,e,n){const i=128&e?0:-1,a=t.length;var r;(r=!!a)&&(r=(r=t[a-1])!=null&&typeof r=="object"&&r.constructor===Object);const s=a+(r?-1:0);for(e=128&e?1:0;e<s;e++)n(e-i,t[e]);if(r){t=t[a-1];for(const o in t)!isNaN(o)&&n(+o,t[o])}}var bn={};function It(t){return 128&t?bn:void 0}function Ot(t){return t.Na=!0,t}var da=Ot((t=>typeof t=="number")),mn=Ot((t=>typeof t=="string")),ha=Ot((t=>typeof t=="boolean")),qt=typeof tt.BigInt=="function"&&typeof tt.BigInt(0)=="bigint";function I(t){var e=t;if(mn(e)){if(!/^\s*(?:-?[1-9]\d*|0)?\s*$/.test(e))throw Error(String(e))}else if(da(e)&&!Number.isSafeInteger(e))throw Error(String(e));return qt?BigInt(t):t=ha(t)?t?"1":"0":mn(t)?t.trim()||"0":String(t)}var ga=Ot((t=>qt?t>=pa&&t<=ma:t[0]==="-"?kn(t,fa):kn(t,ba)));const fa=Number.MIN_SAFE_INTEGER.toString(),pa=qt?BigInt(Number.MIN_SAFE_INTEGER):void 0,ba=Number.MAX_SAFE_INTEGER.toString(),ma=qt?BigInt(Number.MAX_SAFE_INTEGER):void 0;function kn(t,e){if(t.length>e.length)return!1;if(t.length<e.length||t===e)return!0;for(let n=0;n<t.length;n++){const i=t[n],a=e[n];if(i>a)return!1;if(i<a)return!0}}const ka=typeof Uint8Array.prototype.slice=="function";let va,p=0,w=0;function vn(t){const e=t>>>0;p=e,w=(t-e)/4294967296>>>0}function lt(t){if(t<0){vn(-t);const[e,n]=me(p,w);p=e>>>0,w=n>>>0}else vn(t)}function pe(t){const e=va||(va=new DataView(new ArrayBuffer(8)));e.setFloat32(0,+t,!0),w=0,p=e.getUint32(0,!0)}function yn(t,e){const n=4294967296*e+(t>>>0);return Number.isSafeInteger(n)?n:Lt(t,e)}function ya(t,e){return I(it()?BigInt.asUintN(64,(BigInt(e>>>0)<<BigInt(32))+BigInt(t>>>0)):Lt(t,e))}function wn(t,e){return it()?I(BigInt.asIntN(64,(BigInt.asUintN(32,BigInt(e))<<BigInt(32))+BigInt.asUintN(32,BigInt(t)))):I(be(t,e))}function Lt(t,e){if(t>>>=0,(e>>>=0)<=2097151)var n=""+(4294967296*e+t);else it()?n=""+(BigInt(e)<<BigInt(32)|BigInt(t)):(t=(16777215&t)+6777216*(n=16777215&(t>>>24|e<<8))+6710656*(e=e>>16&65535),n+=8147497*e,e*=2,t>=1e7&&(n+=t/1e7>>>0,t%=1e7),n>=1e7&&(e+=n/1e7>>>0,n%=1e7),n=e+xn(n)+xn(t));return n}function xn(t){return t=String(t),"0000000".slice(t.length)+t}function be(t,e){if(2147483648&e)if(it())t=""+(BigInt(0|e)<<BigInt(32)|BigInt(t>>>0));else{const[n,i]=me(t,e);t="-"+Lt(n,i)}else t=Lt(t,e);return t}function Kt(t){if(t.length<16)lt(Number(t));else if(it())t=BigInt(t),p=Number(t&BigInt(4294967295))>>>0,w=Number(t>>BigInt(32)&BigInt(4294967295));else{const e=+(t[0]==="-");w=p=0;const n=t.length;for(let i=e,a=(n-e)%6+e;a<=n;i=a,a+=6){const r=Number(t.slice(i,a));w*=1e6,p=1e6*p+r,p>=4294967296&&(w+=Math.trunc(p/4294967296),w>>>=0,p>>>=0)}if(e){const[i,a]=me(p,w);p=i,w=a}}}function me(t,e){return e=~e,t?t=1+~t:e+=1,[t,e]}function jt(t){return Array.prototype.slice.call(t)}const Ht=typeof BigInt=="function"?BigInt.asIntN:void 0,wa=typeof BigInt=="function"?BigInt.asUintN:void 0,X=Number.isSafeInteger,ke=Number.isFinite,ut=Math.trunc,xa=I(0);function ve(t){return t==null||typeof t=="number"?t:t==="NaN"||t==="Infinity"||t==="-Infinity"?Number(t):void 0}function Aa(t){return t==null||typeof t=="boolean"?t:typeof t=="number"?!!t:void 0}const Sa=/^-?([1-9][0-9]*|0)(\.[0-9]+)?$/;function $t(t){switch(typeof t){case"bigint":return!0;case"number":return ke(t);case"string":return Sa.test(t);default:return!1}}function Pt(t){if(t==null)return t;if(typeof t=="string"&&t)t=+t;else if(typeof t!="number")return;return ke(t)?0|t:void 0}function An(t){if(t==null)return t;if(typeof t=="string"&&t)t=+t;else if(typeof t!="number")return;return ke(t)?t>>>0:void 0}function Sn(t){const e=t.length;return(t[0]==="-"?e<20||e===20&&t<="-9223372036854775808":e<19||e===19&&t<="9223372036854775807")?t:(Kt(t),be(p,w))}function Tn(t){if(t=ut(t),!X(t)){lt(t);var e=p,n=w;(t=2147483648&n)&&(n=~n>>>0,(e=1+~e>>>0)==0&&(n=n+1>>>0)),t=typeof(e=yn(e,n))=="number"?t?-e:e:t?"-"+e:e}return t}function Ta(t){var e=ut(Number(t));return X(e)?String(e):((e=t.indexOf("."))!==-1&&(t=t.substring(0,e)),Sn(t))}function En(t){var e=ut(Number(t));return X(e)?I(e):((e=t.indexOf("."))!==-1&&(t=t.substring(0,e)),it()?I(Ht(64,BigInt(t))):I(Sn(t)))}function _n(t){return X(t)?t=I(Tn(t)):(t=ut(t),X(t)?t=String(t):(lt(t),t=be(p,w)),t=I(t)),t}function Ea(t){const e=typeof t;return t==null?t:e==="bigint"?I(Ht(64,t)):$t(t)?e==="string"?En(t):_n(t):void 0}function In(t){return t==null||typeof t=="string"?t:void 0}function Ln(t,e,n,i){return t!=null&&t[rt]===st?t:Array.isArray(t)?((i=(n=0|t[g])|32&i|2&i)!==n&&M(t,i),new e(t)):(n?2&i?((t=e[cn])||(Et((t=new e).v),t=e[cn]=t),e=t):e=new e:e=void 0,e)}function _a(t,e,n){if(e)t:{if(!$t(e=t))throw ra("int64");switch(typeof e){case"string":e=En(e);break t;case"bigint":e=I(Ht(64,e));break t;default:e=_n(e)}}else e=Ea(t);return(t=e)==null?n?xa:void 0:t}const Ia={};let La=(function(){try{return Ut(new class extends Map{constructor(){super()}}),!1}catch{return!0}})();class ye{constructor(){this.g=new Map}get(e){return this.g.get(e)}set(e,n){return this.g.set(e,n),this.size=this.g.size,this}delete(e){return e=this.g.delete(e),this.size=this.g.size,e}clear(){this.g.clear(),this.size=this.g.size}has(e){return this.g.has(e)}entries(){return this.g.entries()}keys(){return this.g.keys()}values(){return this.g.values()}forEach(e,n){return this.g.forEach(e,n)}[Symbol.iterator](){return this.entries()}}const ja=La?(Object.setPrototypeOf(ye.prototype,Map.prototype),Object.defineProperties(ye.prototype,{size:{value:0,configurable:!0,enumerable:!0,writable:!0}}),ye):class extends Map{constructor(){super()}};function jn(t){return t}function we(t){if(2&t.J)throw Error("Cannot mutate an immutable Map")}var $=class extends ja{constructor(t,e,n=jn,i=jn){super(),this.J=0|t[g],this.K=e,this.S=n,this.fa=this.K?Ma:i;for(let a=0;a<t.length;a++){const r=t[a],s=n(r[0],!1,!0);let o=r[1];e?o===void 0&&(o=null):o=i(r[1],!1,!0,void 0,void 0,this.J),super.set(s,o)}}V(t){return _t(Array.from(super.entries(),t))}clear(){we(this),super.clear()}delete(t){return we(this),super.delete(this.S(t,!0,!1))}entries(){if(this.K){var t=super.keys();t=new pn(t,Ca,this)}else t=super.entries();return t}values(){if(this.K){var t=super.keys();t=new pn(t,$.prototype.get,this)}else t=super.values();return t}forEach(t,e){this.K?super.forEach(((n,i,a)=>{t.call(e,a.get(i),i,a)})):super.forEach(t,e)}set(t,e){return we(this),(t=this.S(t,!0,!1))==null?this:e==null?(super.delete(t),this):super.set(t,this.fa(e,!0,!0,this.K,!1,this.J))}Ma(t){const e=this.S(t[0],!1,!0);t=t[1],t=this.K?t===void 0?null:t:this.fa(t,!1,!0,void 0,!1,this.J),super.set(e,t)}has(t){return super.has(this.S(t,!1,!1))}get(t){t=this.S(t,!1,!1);const e=super.get(t);if(e!==void 0){var n=this.K;return n?((n=this.fa(e,!1,!0,n,this.ra,this.J))!==e&&super.set(t,n),n):e}}[Symbol.iterator](){return this.entries()}};function Ma(t,e,n,i,a,r){return t=Ln(t,i,n,r),a&&(t=On(t)),t}function Ca(t){return[t,this.get(t)]}let Na;function Mn(){return Na||(Na=new $(Et([]),void 0,void 0,void 0,Ia))}function Cn(t){return z?t[z]:void 0}function xe(t,e){for(const n in t)!isNaN(n)&&e(t,+n,t[n])}$.prototype.toJSON=void 0;var Nn=class{};const Da={Ka:!0};function Ba(t,e){e<100||nt(la,1)}function Ae(t,e,n,i){const a=i!==void 0;i=!!i;var r,s=z;!a&&at&&s&&(r=t[s])&&xe(r,Ba),s=[];var o=t.length;let l;r=4294967295;let d=!1;const c=!!(64&e),u=c?128&e?0:-1:void 0;1&e||(l=o&&t[o-1],l!=null&&typeof l=="object"&&l.constructor===Object?r=--o:l=void 0,!c||128&e||a||(d=!0,r=r-u+u)),e=void 0;for(var h=0;h<o;h++){let y=t[h];if(y!=null&&(y=n(y,i))!=null)if(c&&h>=r){const m=h-u;(e??(e={}))[m]=y}else s[h]=y}if(l)for(let y in l){if((o=l[y])==null||(o=n(o,i))==null)continue;let m;h=+y,c&&!Number.isNaN(h)&&(m=h+u)<r?s[m]=o:(e??(e={}))[y]=o}return e&&(d?s.push(e):s[r]=e),a&&z&&(t=Cn(t))&&t instanceof Nn&&(s[z]=(function(y){const m=new Nn;return xe(y,((R,P,Q)=>{m[P]=jt(Q)})),m.da=y.da,m})(t)),s}function Ua(t){return t[0]=Vt(t[0]),t[1]=Vt(t[1]),t}function Vt(t){switch(typeof t){case"number":return Number.isFinite(t)?t:""+t;case"bigint":return ga(t)?Number(t):""+t;case"boolean":return t?1:0;case"object":if(Array.isArray(t)){var e=0|t[g];return t.length===0&&1&e?void 0:Ae(t,e,Vt)}if(t!=null&&t[rt]===st)return Dn(t);if(t instanceof et){if((e=t.g)==null)t="";else if(typeof e=="string")t=e;else{if(rn){for(var n="",i=0,a=e.length-10240;i<a;)n+=String.fromCharCode.apply(null,e.subarray(i,i+=10240));n+=String.fromCharCode.apply(null,i?e.subarray(i):e),e=btoa(n)}else{n===void 0&&(n=0),an(),n=nn[n],i=Array(Math.floor(e.length/3)),a=n[64]||"";let d=0,c=0;for(;d<e.length-2;d+=3){var r=e[d],s=e[d+1],o=e[d+2],l=n[r>>2];r=n[(3&r)<<4|s>>4],s=n[(15&s)<<2|o>>6],o=n[63&o],i[c++]=l+r+s+o}switch(l=0,o=a,e.length-d){case 2:o=n[(15&(l=e[d+1]))<<2]||a;case 1:e=e[d],i[c]=n[e>>2]+n[(3&e)<<4|l>>4]+o+a}e=i.join("")}t=t.g=e}return t}return t instanceof $?t=t.size!==0?t.V(Ua):void 0:void 0}return t}let Ra,Oa;function Dn(t){return Ae(t=t.v,0|t[g],Vt)}function ct(t,e){return Bn(t,e[0],e[1])}function Bn(t,e,n,i=0){if(t==null){var a=32;n?(t=[n],a|=128):t=[],e&&(a=-16760833&a|(1023&e)<<14)}else{if(!Array.isArray(t))throw Error("narr");if(a=0|t[g],Qe&&1&a)throw Error("rfarr");if(2048&a&&!(2&a)&&(function(){if(Qe)throw Error("carr");nt(ua,5)})(),256&a)throw Error("farr");if(64&a)return(a|i)!==a&&M(t,a|i),t;if(n&&(a|=128,n!==t[0]))throw Error("mid");t:{a|=64;var r=(n=t).length;if(r){var s=r-1;const l=n[s];if(l!=null&&typeof l=="object"&&l.constructor===Object){if((s-=e=128&a?0:-1)>=1024)throw Error("pvtlmt");for(var o in l)(r=+o)<s&&(n[r+e]=l[o],delete l[o]);a=-16760833&a|(1023&s)<<14;break t}}if(e){if((o=Math.max(e,r-(128&a?0:-1)))>1024)throw Error("spvt");a=-16760833&a|(1023&o)<<14}}}return M(t,64|a|i),t}function qa(t,e){if(typeof t!="object")return t;if(Array.isArray(t)){var n=0|t[g];return t.length===0&&1&n?void 0:Un(t,n,e)}if(t!=null&&t[rt]===st)return Rn(t);if(t instanceof $){if(2&(e=t.J))return t;if(!t.size)return;if(n=Et(t.V()),t.K)for(t=0;t<n.length;t++){const i=n[t];let a=i[1];a=a==null||typeof a!="object"?void 0:a!=null&&a[rt]===st?Rn(a):Array.isArray(a)?Un(a,0|a[g],!!(32&e)):void 0,i[1]=a}return n}return t instanceof et?t:void 0}function Un(t,e,n){return 2&e||(!n||4096&e||16&e?t=dt(t,e,!1,n&&!(16&e)):(Tt(t,34),4&e&&Object.freeze(t))),t}function Se(t,e,n){return t=new t.constructor(e),n&&(t.h=ot),t.m=ot,t}function Rn(t){const e=t.v,n=0|e[g];return F(t,n)?t:Te(t,e,n)?Se(t,e):dt(e,n)}function dt(t,e,n,i){return i??(i=!!(34&e)),t=Ae(t,e,qa,i),i=32,n&&(i|=2),M(t,e=16769217&e|i),t}function On(t){const e=t.v,n=0|e[g];return F(t,n)?Te(t,e,n)?Se(t,e,!0):new t.constructor(dt(e,n,!1)):t}function zt(t){if(t.h!==ot)return!1;var e=t.v;return Tt(e=dt(e,0|e[g]),2048),t.v=e,t.h=void 0,t.m=void 0,!0}function Ka(t){if(!zt(t)&&F(t,0|t.v[g]))throw Error()}function Ft(t,e){e===void 0&&(e=0|t[g]),32&e&&!(4096&e)&&M(t,4096|e)}function Te(t,e,n){return!!(2&n)||!(!(32&n)||4096&n)&&(M(e,2|n),t.h=ot,!0)}I(0);function ht(t,e,n,i){if(e===-1)return null;const a=e+(n?0:-1),r=t.length-1;let s,o;if(!(r<1+(n?0:-1))){if(a>=r)if(s=t[r],s!=null&&typeof s=="object"&&s.constructor===Object)n=s[e],o=!0;else{if(a!==r)return;n=s}else n=t[a];if(i&&n!=null){if((i=i(n))==null)return i;if(!Object.is(i,n))return o?s[e]=i:t[a]=i,i}return n}}function Ha(t,e,n,i){Ka(t),N(t=t.v,0|t[g],e,n,i)}function N(t,e,n,i,a){const r=n+(a?0:-1);var s=t.length-1;if(s>=1+(a?0:-1)&&r>=s){const o=t[s];if(o!=null&&typeof o=="object"&&o.constructor===Object)return o[n]=i,e}return r<=s?(t[r]=i,e):(i!==void 0&&(n>=(s=(e??(e=0|t[g]))>>14&1023||536870912)?i!=null&&(t[s+(a?0:-1)]={[n]:i}):t[r]=i),e)}function $a(t,e,n){return t=ht(t,e,n),Array.isArray(t)?t:fe}function Pa(t,e){return 2&e&&(t|=2),1|t}function qn(t){return!!(2&t)&&!!(4&t)||!!(256&t)}function Kn(t){t=jt(t);for(let e=0;e<t.length;e++){const n=t[e]=jt(t[e]);Array.isArray(n[1])&&(n[1]=Et(n[1]))}return _t(t)}function gt(t,e,n){if(2&e)throw Error();const i=It(e);let a=$a(t,n,i),r=a===fe?7:0|a[g],s=Pa(r,e);return(2&s||qn(s)||16&s)&&(s===r||qn(s)||M(a,s),a=jt(a),r=0,s=Ya(s,e),N(t,e,n,a,i)),s&=-13,s!==r&&M(a,s),a}function Va(t){if(at)return t[St]??(t[St]=new Map);if(St in t)return t[St];const e=new Map;return Object.defineProperty(t,St,{value:e}),e}function za(t,e,n,i,a){const r=Va(t),s=Fa(r,t,e,n,a);return s!==i&&(s&&(e=N(t,e,s,void 0,a)),r.set(n,i)),e}function Fa(t,e,n,i,a){let r=t.get(i);if(r!=null)return r;r=0;for(let s=0;s<i.length;s++){const o=i[s];ht(e,o,a)!=null&&(r!==0&&(n=N(e,n,r,void 0,a)),r=o)}return t.set(i,r),r}function Ee(t,e,n){let i=0|t[g];const a=It(i),r=ht(t,n,a);let s;if(r!=null&&r[rt]===st){if(!F(r))return zt(r),r.v;s=r.v}else Array.isArray(r)&&(s=r);if(s){const o=0|s[g];2&o&&(s=dt(s,o))}return s=ct(s,e),s!==r&&N(t,i,n,s,a),s}function Ga(t,e,n,i,a){let r=!1;if((i=ht(t,i,a,(s=>{const o=Ln(s,n,!1,e);return r=o!==s&&o!=null,o})))!=null)return r&&!F(i)&&Ft(t,e),i}function Wa(t,e,n,i){let a=t.v,r=0|a[g];if((e=Ga(a,r,e,n,i))==null)return e;if(r=0|a[g],!F(t,r)){const s=On(e);s!==e&&(zt(t)&&(a=t.v,r=0|a[g]),r=N(a,r,n,e=s,i),Ft(a,r))}return e}function Ja(t){return t==null&&(t=void 0),t}function Hn(t,e,n,i,a){return Ha(t,n,i=Ja(i),a),i&&!F(i)&&Ft(t.v),t}function Ya(t,e){return-273&(2&e?2|t:-3&t)}var ft=class{constructor(t,e,n){if(this.buffer=t,n&&!e)throw Error();this.g=e}};function $n(t,e){if(typeof t=="string")return new ft(on(t),e);if(Array.isArray(t))return new ft(new Uint8Array(t),e);if(t.constructor===Uint8Array)return new ft(t,!1);if(t.constructor===ArrayBuffer)return t=new Uint8Array(t),new ft(t,!1);if(t.constructor===et)return e=he(t)||new Uint8Array(0),new ft(e,!0,t);if(t instanceof Uint8Array)return t=t.constructor===Uint8Array?t:new Uint8Array(t.buffer,t.byteOffset,t.byteLength),new ft(t,!1);throw Error()}function _e(t,e){let n,i=0,a=0,r=0;const s=t.h;let o=t.g;do n=s[o++],i|=(127&n)<<r,r+=7;while(r<32&&128&n);if(r>32)for(a|=(127&n)>>4,r=3;r<32&&128&n;r+=7)n=s[o++],a|=(127&n)<<r;if(Wt(t,o),!(128&n))return e(i>>>0,a>>>0);throw Error()}function Pn(t){let e=0,n=t.g;const i=n+10,a=t.h;for(;n<i;){const r=a[n++];if(e|=r,(128&r)==0)return Wt(t,n),!!(127&e)}throw Error()}function G(t){const e=t.h;let n=t.g,i=e[n++],a=127&i;if(128&i&&(i=e[n++],a|=(127&i)<<7,128&i&&(i=e[n++],a|=(127&i)<<14,128&i&&(i=e[n++],a|=(127&i)<<21,128&i&&(i=e[n++],a|=i<<28,128&i&&128&e[n++]&&128&e[n++]&&128&e[n++]&&128&e[n++]&&128&e[n++])))))throw Error();return Wt(t,n),a}function W(t){return G(t)>>>0}function Gt(t){var e=t.h;const n=t.g;var i=e[n],a=e[n+1];const r=e[n+2];return e=e[n+3],Wt(t,t.g+4),t=2*((a=(i<<0|a<<8|r<<16|e<<24)>>>0)>>31)+1,i=a>>>23&255,a&=8388607,i==255?a?NaN:t*(1/0):i==0?1401298464324817e-60*t*a:t*Math.pow(2,i-150)*(a+8388608)}function Xa(t){return G(t)}function Wt(t,e){if(t.g=e,e>t.l)throw Error()}function Vn(t,e){if(e<0)throw Error();const n=t.g;if((e=n+e)>t.l)throw Error();return t.g=e,n}function Za(t,e){if(e==0)return de();var n=Vn(t,e);return t.Y&&t.j?n=t.h.subarray(n,n+e):(t=t.h,n=n===(e=n+e)?new Uint8Array(0):ka?t.slice(n,e):new Uint8Array(t.subarray(n,e))),n.length==0?de():new et(n,Rt)}function Mt(t,e,n){const i=t.g.l;var a=W(t.g);let r=(a=t.g.g+a)-i;if(r<=0&&(t.g.l=a,n(e,t,void 0,void 0,void 0),r=a-t.g.g),r)throw Error();return t.g.g=a,t.g.l=i,e}function Ie(t){var e=W(t.g),n=Vn(t=t.g,e);if(t=t.h,Wi){var i,a=t;(i=ue)||(i=ue=new TextDecoder("utf-8",{fatal:!0})),e=n+e,a=n===0&&e===a.length?a:a.subarray(n,e);try{var r=i.decode(a)}catch(o){if(Bt===void 0){try{i.decode(new Uint8Array([128]))}catch{}try{i.decode(new Uint8Array([97])),Bt=!0}catch{Bt=!1}}throw!Bt&&(ue=void 0),o}}else{e=(r=n)+e,n=[];let o,l=null;for(;r<e;){var s=t[r++];s<128?n.push(s):s<224?r>=e?Y():(o=t[r++],s<194||(192&o)!=128?(r--,Y()):n.push((31&s)<<6|63&o)):s<240?r>=e-1?Y():(o=t[r++],(192&o)!=128||s===224&&o<160||s===237&&o>=160||(192&(i=t[r++]))!=128?(r--,Y()):n.push((15&s)<<12|(63&o)<<6|63&i)):s<=244?r>=e-2?Y():(o=t[r++],(192&o)!=128||o-144+(s<<28)>>30!=0||(192&(i=t[r++]))!=128||(192&(a=t[r++]))!=128?(r--,Y()):(s=(7&s)<<18|(63&o)<<12|(63&i)<<6|63&a,s-=65536,n.push(55296+(s>>10&1023),56320+(1023&s)))):Y(),n.length>=8192&&(l=Ye(l,n),n.length=0)}r=Ye(l,n)}return r}function zn(t){const e=W(t.g);return Za(t.g,e)}function Jt(t,e,n){var i=W(t.g);for(i=t.g.g+i;t.g.g<i;)n.push(e(t.g))}function Fn(t){return t?/^\d+$/.test(t)?(Kt(t),new Le(p,w)):null:Qa||(Qa=new Le(0,0))}var Le=class{constructor(t,e){this.h=t>>>0,this.g=e>>>0}};let Qa;function Gn(t){return t?/^-?\d+$/.test(t)?(Kt(t),new je(p,w)):null:tr||(tr=new je(0,0))}var je=class{constructor(t,e){this.h=t>>>0,this.g=e>>>0}};let tr;function pt(t,e,n){for(;n>0||e>127;)t.g.push(127&e|128),e=(e>>>7|n<<25)>>>0,n>>>=7;t.g.push(e)}function bt(t,e){for(;e>127;)t.g.push(127&e|128),e>>>=7;t.g.push(e)}function Yt(t,e){if(e>=0)bt(t,e);else{for(let n=0;n<9;n++)t.g.push(127&e|128),e>>=7;t.g.push(1)}}function Me(t){var e=p;t.g.push(e>>>0&255),t.g.push(e>>>8&255),t.g.push(e>>>16&255),t.g.push(e>>>24&255)}function mt(t,e){e.length!==0&&(t.l.push(e),t.h+=e.length)}function C(t,e,n){bt(t.g,8*e+n)}function Ce(t,e){return C(t,e,2),e=t.g.end(),mt(t,e),e.push(t.h),e}function Ne(t,e){var n=e.pop();for(n=t.h+t.g.length()-n;n>127;)e.push(127&n|128),n>>>=7,t.h++;e.push(n),t.h++}function Xt(t,e,n){C(t,e,2),bt(t.g,n.length),mt(t,t.g.end()),mt(t,n)}function Zt(t,e,n,i){n!=null&&(e=Ce(t,e),i(n,t),Ne(t,e))}function q(){const t=class{constructor(){throw Error()}};return Object.setPrototypeOf(t,t.prototype),t}var De=q(),Wn=q(),Be=q(),Ue=q(),Re=q(),Jn=q(),er=q(),Qt=q(),Yn=q(),Xn=q(),D=class{constructor(t,e){this.v=Bn(t,e,void 0,2048)}toJSON(){return Dn(this)}j(){var a;var t=yr,e=this.v,n=t.g,i=z;if(at&&i&&((a=e[i])==null?void 0:a[n])!=null&&nt(oa,3),e=t.g,dn&&z&&dn===void 0&&(i=(n=this.v)[z])&&(i=i.da))try{i(n,e,Da)}catch(r){Ze(r)}return t.h?t.m(this,t.h,t.g,t.l):t.m(this,t.g,t.defaultValue,t.l)}clone(){const t=this.v,e=0|t[g];return Te(this,t,e)?Se(this,t,!0):new this.constructor(dt(t,e,!1))}};D.prototype[rt]=st,D.prototype.toString=function(){return this.v.toString()};var kt=class{constructor(t,e,n){this.g=t,this.h=e,t=De,this.l=!!t&&n===t||!1}};function te(t,e){return new kt(t,e,De)}function Zn(t,e,n,i,a){Zt(t,n,ei(e,i),a)}const nr=te((function(t,e,n,i,a){return t.h===2&&(Mt(t,Ee(e,i,n),a),!0)}),Zn),ir=te((function(t,e,n,i,a){return t.h===2&&(Mt(t,Ee(e,i,n),a),!0)}),Zn);var ee=Symbol(),Qn=Symbol();let ti;function ne(t,e,n,i){var a=i[t];if(a)return a;(a={}).qa=i,a.T=(function(u){switch(typeof u){case"boolean":return Ra||(Ra=[0,void 0,!0]);case"number":return u>0?void 0:u===0?Oa||(Oa=[0,void 0]):[-u,void 0];case"string":return[0,u];case"object":return u}})(i[0]);var r=i[1];let s=1;r&&r.constructor===Object&&(a.ba=r,typeof(r=i[++s])=="function"&&(a.ma=!0,ti??(ti=i[s+1]),r=i[s+=2]));const o={};for(;r&&Array.isArray(r)&&r.length&&typeof r[0]=="number"&&r[0]>0;){for(var l=0;l<r.length;l++)o[r[l]]=r;r=i[++s]}for(l=1;r!==void 0;){let u;typeof r=="number"&&(l+=r,r=i[++s]);var d=void 0;if(r instanceof kt?u=r:(u=nr,s--),u==null?void 0:u.l){r=i[++s],d=i;var c=s;typeof r=="function"&&(r=r(),d[c]=r),d=r}for(c=l+1,typeof(r=i[++s])=="number"&&r<0&&(c-=r,r=i[++s]);l<c;l++){const h=o[l];d?n(a,l,u,d,h):e(a,l,u,h)}}return i[t]=a}function ar(t){return Array.isArray(t)?t[0]instanceof kt?t:[ir,t]:[t,void 0]}function ei(t,e){return t instanceof D?t.v:Array.isArray(t)?ct(t,e):void 0}function ie(t,e,n){t[e]=n.h}function ae(t,e,n,i){let a,r;const s=n.h;t[e]=(o,l,d)=>s(o,l,d,r||(r=ne(ee,ie,ae,i).T),a||(a=ni(i)))}function ni(t){let e=t[Qn];if(!e){const n=ne(ee,ie,ae,t);e=(i,a)=>ii(i,a,n),t[Qn]=e}return e}function ii(t,e,n){ca(t,0|t[g],((i,a)=>{if(a!=null){var r=(function(s,o){var l=s[o];if(l)return l;if((l=s.ba)&&(l=l[o])){var d=(l=ar(l))[0].h;if(l=l[1]){const c=ni(l),u=ne(ee,ie,ae,l).T;l=s.ma?ti(u,c):(h,y,m)=>d(h,y,m,u,c)}else l=d;return s[o]=l}})(n,i);r?r(e,a,i):i<500||nt(ge,3)}})),(t=Cn(t))&&xe(t,((i,a,r)=>{for(mt(e,e.g.end()),i=0;i<r.length;i++)mt(e,he(r[i])||new Uint8Array(0))}))}const rr=I(0);function vt(t,e){if(Array.isArray(e)){var n=0|e[g];if(4&n)return e;for(var i=0,a=0;i<e.length;i++){const r=t(e[i]);r!=null&&(e[a++]=r)}return a<i&&(e.length=a),(t=-1537&(5|n))!==n&&M(e,t),2&t&&Object.freeze(e),e}}function T(t,e,n){return new kt(t,e,n)}function yt(t,e,n){return new kt(t,e,n)}function E(t,e,n){N(t,0|t[g],e,n,It(0|t[g]))}var sr=te((function(t,e,n,i,a){if(t.h!==2)return!1;if(t=jt(t=Mt(t,ct([void 0,void 0],i),a)),a=It(i=0|e[g]),2&i)throw Error();let r=ht(e,n,a);if(r instanceof $)(2&r.J)!=0?(r=r.V(),r.push(t),N(e,i,n,r,a)):r.Ma(t);else if(Array.isArray(r)){var s=0|r[g];8192&s||M(r,s|=8192),2&s&&(r=Kn(r),N(e,i,n,r,a)),r.push(t)}else N(e,i,n,_t([t]),a);return!0}),(function(t,e,n,i,a){if(e instanceof $)e.forEach(((r,s)=>{Zt(t,n,ct([s,r],i),a)}));else if(Array.isArray(e)){for(let r=0;r<e.length;r++){const s=e[r];Array.isArray(s)&&Zt(t,n,ct(s,i),a)}_t(e)}}));function ai(t,e,n){(e=ve(e))!=null&&(C(t,n,5),t=t.g,pe(e),Me(t))}function ri(t,e,n){if(e=(function(i){if(i==null)return i;const a=typeof i;if(a==="bigint")return String(Ht(64,i));if($t(i)){if(a==="string")return Ta(i);if(a==="number")return Tn(i)}})(e),e!=null&&(typeof e=="string"&&Gn(e),e!=null))switch(C(t,n,0),typeof e){case"number":t=t.g,lt(e),pt(t,p,w);break;case"bigint":n=BigInt.asUintN(64,e),n=new je(Number(n&BigInt(4294967295)),Number(n>>BigInt(32))),pt(t.g,n.h,n.g);break;default:n=Gn(e),pt(t.g,n.h,n.g)}}function si(t,e,n){(e=Pt(e))!=null&&e!=null&&(C(t,n,0),Yt(t.g,e))}function oi(t,e,n){(e=Aa(e))!=null&&(C(t,n,0),t.g.g.push(e?1:0))}function li(t,e,n){(e=In(e))!=null&&Xt(t,n,Xe(e))}function ui(t,e,n,i,a){Zt(t,n,ei(e,i),a)}function ci(t,e,n){(e=e==null||typeof e=="string"||e instanceof et?e:void 0)!=null&&Xt(t,n,$n(e,!0).buffer)}function di(t,e,n){(e=An(e))!=null&&e!=null&&(C(t,n,0),bt(t.g,e))}function hi(t,e,n){return(t.h===5||t.h===2)&&(e=gt(e,0|e[g],n),t.h==2?Jt(t,Gt,e):e.push(Gt(t.g)),!0)}var L=T((function(t,e,n){return t.h===5&&(E(e,n,Gt(t.g)),!0)}),ai,Qt);yt(hi,(function(t,e,n){if((e=vt(ve,e))!=null)for(let s=0;s<e.length;s++){var i=t,a=n,r=e[s];r!=null&&(C(i,a,5),i=i.g,pe(r),Me(i))}}),Qt),yt(hi,(function(t,e,n){if((e=vt(ve,e))!=null&&e.length){C(t,n,2),bt(t.g,4*e.length);for(let i=0;i<e.length;i++)n=t.g,pe(e[i]),Me(n)}}),Qt);var or=T((function(t,e,n){return t.h===5&&(E(e,n,(t=Gt(t.g))===0?void 0:t),!0)}),ai,Qt),re=T((function(t,e,n){return t.h!==0?t=!1:(E(e,n,_e(t.g,wn)),t=!0),t}),ri,Jn),Oe=T((function(t,e,n){return t.h!==0?e=!1:(E(e,n,(t=_e(t.g,wn))===rr?void 0:t),e=!0),e}),ri,Jn),lr=T((function(t,e,n){return t.h!==0?t=!1:(E(e,n,_e(t.g,ya)),t=!0),t}),(function(t,e,n){if(e=(function(i){if(i==null)return i;var a=typeof i;if(a==="bigint")return String(wa(64,i));if($t(i)){if(a==="string")return a=ut(Number(i)),X(a)&&a>=0?i=String(a):((a=i.indexOf("."))!==-1&&(i=i.substring(0,a)),(a=i[0]!=="-"&&((a=i.length)<20||a===20&&i<="18446744073709551615"))||(Kt(i),i=Lt(p,w))),i;if(a==="number")return(i=ut(i))>=0&&X(i)||(lt(i),i=yn(p,w)),i}})(e),e!=null&&(typeof e=="string"&&Fn(e),e!=null))switch(C(t,n,0),typeof e){case"number":t=t.g,lt(e),pt(t,p,w);break;case"bigint":n=BigInt.asUintN(64,e),n=new Le(Number(n&BigInt(4294967295)),Number(n>>BigInt(32))),pt(t.g,n.h,n.g);break;default:n=Fn(e),pt(t.g,n.h,n.g)}}),er),B=T((function(t,e,n){return t.h===0&&(E(e,n,G(t.g)),!0)}),si,Ue),se=yt((function(t,e,n){return(t.h===0||t.h===2)&&(e=gt(e,0|e[g],n),t.h==2?Jt(t,G,e):e.push(G(t.g)),!0)}),(function(t,e,n){if((e=vt(Pt,e))!=null&&e.length){n=Ce(t,n);for(let i=0;i<e.length;i++)Yt(t.g,e[i]);Ne(t,n)}}),Ue),wt=T((function(t,e,n){return t.h===0&&(E(e,n,(t=G(t.g))===0?void 0:t),!0)}),si,Ue),b=T((function(t,e,n){return t.h===0&&(E(e,n,Pn(t.g)),!0)}),oi,Wn),Z=T((function(t,e,n){return t.h===0&&(E(e,n,(t=Pn(t.g))===!1?void 0:t),!0)}),oi,Wn),_=yt((function(t,e,n){return t.h===2&&(t=Ie(t),gt(e,0|e[g],n).push(t),!0)}),(function(t,e,n){if((e=vt(In,e))!=null)for(let s=0;s<e.length;s++){var i=t,a=n,r=e[s];r!=null&&Xt(i,a,Xe(r))}}),Be),J=T((function(t,e,n){return t.h===2&&(E(e,n,(t=Ie(t))===""?void 0:t),!0)}),li,Be),k=T((function(t,e,n){return t.h===2&&(E(e,n,Ie(t)),!0)}),li,Be),K=(function(t,e,n=De){return new kt(t,e,n)})((function(t,e,n,i,a){return t.h===2&&(i=ct(void 0,i),gt(e,0|e[g],n).push(i),Mt(t,i,a),!0)}),(function(t,e,n,i,a){if(Array.isArray(e)){for(let r=0;r<e.length;r++)ui(t,e[r],n,i,a);1&(t=0|e[g])||M(e,1|t)}})),v=te((function(t,e,n,i,a,r){if(t.h!==2)return!1;let s=0|e[g];return za(e,s,r,n,It(s)),Mt(t,e=Ee(e,i,n),a),!0}),ui),ur=T((function(t,e,n){return t.h===2&&(E(e,n,zn(t)),!0)}),ci,Yn);yt((function(t,e,n){return(t.h===0||t.h===2)&&(e=gt(e,0|e[g],n),t.h==2?Jt(t,W,e):e.push(W(t.g)),!0)}),(function(t,e,n){if((e=vt(An,e))!=null)for(let s=0;s<e.length;s++){var i=t,a=n,r=e[s];r!=null&&(C(i,a,0),bt(i.g,r))}}),Re);var cr=T((function(t,e,n){return t.h===0&&(E(e,n,(t=W(t.g))===0?void 0:t),!0)}),di,Re),j=T((function(t,e,n){return t.h===0&&(E(e,n,G(t.g)),!0)}),(function(t,e,n){(e=Pt(e))!=null&&(e=parseInt(e,10),C(t,n,0),Yt(t.g,e))}),Xn);class dr{constructor(e,n){var i=gr;this.g=e,this.h=n,this.m=Wa,this.j=Hn,this.defaultValue=void 0,this.l=i.Oa!=null?bn:void 0}register(){Ut(this)}}function hr(t,e){return new dr(t,e)}function oe(t){return function(){const e=new class{constructor(){this.l=[],this.h=0,this.g=new class{constructor(){this.g=[]}length(){return this.g.length}end(){const s=this.g;return this.g=[],s}}}};ii(this.v,e,ne(ee,ie,ae,t)),mt(e,e.g.end());const n=new Uint8Array(e.h),i=e.l,a=i.length;let r=0;for(let s=0;s<a;s++){const o=i[s];n.set(o,r),r+=o.length}return e.l=[n],n}}var gi=[0,J,T((function(t,e,n){return t.h===2&&(E(e,n,(t=zn(t))===de()?void 0:t),!0)}),(function(t,e,n){if(e!=null){if(e instanceof D){const i=e.Ra;return void(i?(e=i(e),e!=null&&Xt(t,n,$n(e,!0).buffer)):nt(ge,3))}if(Array.isArray(e))return void nt(ge,3)}ci(t,e,n)}),Yn)],fi=[0,B,j,b,-1,se,j,-1,b],pi=[0,b,k,b,j,-1,yt((function(t,e,n){return(t.h===0||t.h===2)&&(e=gt(e,0|e[g],n),t.h==2?Jt(t,Xa,e):e.push(G(t.g)),!0)}),(function(t,e,n){if((e=vt(Pt,e))!=null&&e.length){n=Ce(t,n);for(let i=0;i<e.length;i++)Yt(t.g,e[i]);Ne(t,n)}}),Xn),k,-1,[0,b,-1],j,b,-1],bi=[0,3,b,-1,2,[0,[2],B,v,[0,T((function(t,e,n){return t.h===0&&(E(e,n,W(t.g)),!0)}),di,Re)]],[0,j,b,j,b,j,b,k,-1],[0,[3,4],k,-1,v,[0,B],v,[0,j]],[0]],mi=[0,k,-2],ki=[0],vi=[0,B,b,1,b,-4],gr=class extends D{constructor(t){super(t,2)}},A={};A[336783863]=[0,k,b,-1,B,[0,[1,2,3,4,5,6,7,8,9],v,ki,v,pi,v,mi,v,vi,v,fi,v,[0,k,-2],v,[0,k,j],v,bi,v,[0,j,-1,b]],[0,k],b,[0,[1,3],[2,4],v,[0,se],-1,v,[0,_],-1,K,[0,k,-1]],k];var yi=[0,Oe,-1,Z,-3,Oe,se,J,wt,Oe,-1,Z,wt,Z,-2,J],Ct=[-1,{}],wi=[0,k,1,Ct],xi=[0,k,_,Ct],fr=class extends D{constructor(t){super(t,500)}o(t){return Hn(this,0,1001,t)}},pr=[-500,K,[-500,J,-1,_,-3,[-2,A,b],K,gi,wt,-1,wi,xi,K,[0,J,Z],J,yi,wt,_,987,_],4,K,[-500,k,-1,[-1,{}],998,k],K,[-500,k,_,-1,[-2,{},b],997,_,-1],wt,K,[-500,k,_,Ct,998,_],_,wt,wi,xi,K,[0,J,-1,Ct],_,-2,yi,J,-1,Z,[0,Z,cr],978,Ct,K,gi];fr.prototype.g=oe(pr);var br=class extends D{constructor(t){super(t)}};br.prototype.g=oe([0,L,-4,re]);var Ai=[0,k,B,L,_,-1],mr=[0,b,-1],kr=[1,2,3,4,5,6],Si=[0,ur,k,[0,B,re,-1],[0,lr,re]],x=[0,Si,b,[0,kr,v,vi,v,pi,v,fi,v,ki,v,mi,v,bi],j],qe=[0,x,L,-1,B];A[502141897]=qe;var Ke=[0,x,L,[0,x],b];A[508968150]=[0,x,qe,Ke,L,[0,[0,Si]]],A[508968149]=Ke;var Ti=[0,x,Ai];A[478825465]=Ti;var Ei=[0,x,[0,x],Ti,-1],_i=[0,x,L,B],He=[0,x,L],Ii=[0,x,_i,He,L];A[479097054]=[0,x,Ii,Ei],A[463370452]=Ei,A[464864288]=_i,A[462713202]=Ii,A[474472470]=He;var vr=class extends D{constructor(t){super(t)}},$e=[0,x,L,-1,B],Pe=[0,x,L,b];vr.prototype.g=oe([0,x,He,[0,x],qe,Ke,$e,Pe]),A[456383383]=[0,x,Ai],A[476348187]=[0,x,mr];var Li=class extends D{constructor(t){super(t)}},ji=[0,j,-1],yr=hr(458105876,class extends D{constructor(t){super(t)}g(){let t;var e=this.v;const n=0|e[g];return t=F(this,n),e=(function(i,a,r,s){var o=Li;!s&&zt(i)&&(r=0|(a=i.v)[g]);var l=ht(a,2);if(i=!1,l==null){if(s)return Mn();l=[]}else if(l.constructor===$){if(!(2&l.J)||s)return l;l=l.V()}else Array.isArray(l)?i=!!(2&(0|l[g])):l=[];if(s){if(!l.length)return Mn();i||(i=!0,Et(l))}else i&&(i=!1,_t(l),l=Kn(l));return!i&&32&r&&Tt(l,32),r=N(a,r,2,s=new $(l,o,_a,void 0)),i||Ft(a,r),s})(this,e,n,t),!t&&Li&&(e.ra=!0),e}});A[458105876]=[0,ji,sr,[!0,re,[0,k,-1,_]],[0,se,b,j]],A[458105758]=[0,x,k,ji];var Mi=[0,or,-1,Z],wr=class extends D{constructor(t){super(t)}},xr=[1,2];wr.prototype.g=oe([0,xr,v,Mi,v,[0,K,Mi]]),A[443442058]=[0,x,k,B,L,_,-1,b,L],A[514774813]=$e,A[516587230]=[0,x,$e,Pe,L],A[518928384]=Pe;function U(...t){return t.map((([e,n])=>({start:e,end:n})))}var Ar=U([61,146],[146,91],[91,181],[181,84],[84,17],[17,314],[314,405],[405,321],[321,375],[375,291],[61,185],[185,40],[40,39],[39,37],[37,0],[0,267],[267,269],[269,270],[270,409],[409,291],[78,95],[95,88],[88,178],[178,87],[87,14],[14,317],[317,402],[402,318],[318,324],[324,308],[78,191],[191,80],[80,81],[81,82],[82,13],[13,312],[312,311],[311,310],[310,415],[415,308]),Sr=U([263,249],[249,390],[390,373],[373,374],[374,380],[380,381],[381,382],[382,362],[263,466],[466,388],[388,387],[387,386],[386,385],[385,384],[384,398],[398,362]),Tr=U([276,283],[283,282],[282,295],[295,285],[300,293],[293,334],[334,296],[296,336]);U([474,475],[475,476],[476,477],[477,474]);var Er=U([33,7],[7,163],[163,144],[144,145],[145,153],[153,154],[154,155],[155,133],[33,246],[246,161],[161,160],[160,159],[159,158],[158,157],[157,173],[173,133]),_r=U([46,53],[53,52],[52,65],[65,55],[70,63],[63,105],[105,66],[66,107]);U([469,470],[470,471],[471,472],[472,469]);var Ir=U([10,338],[338,297],[297,332],[332,284],[284,251],[251,389],[389,356],[356,454],[454,323],[323,361],[361,288],[288,397],[397,365],[365,379],[379,378],[378,400],[400,377],[377,152],[152,148],[148,176],[176,149],[149,150],[150,136],[136,172],[172,58],[58,132],[132,93],[93,234],[234,127],[127,162],[162,21],[21,54],[54,103],[103,67],[67,109],[109,10]);[...Ar,...Sr,...Tr,...Er,..._r,...Ir],U([127,34],[34,139],[139,127],[11,0],[0,37],[37,11],[232,231],[231,120],[120,232],[72,37],[37,39],[39,72],[128,121],[121,47],[47,128],[232,121],[121,128],[128,232],[104,69],[69,67],[67,104],[175,171],[171,148],[148,175],[118,50],[50,101],[101,118],[73,39],[39,40],[40,73],[9,151],[151,108],[108,9],[48,115],[115,131],[131,48],[194,204],[204,211],[211,194],[74,40],[40,185],[185,74],[80,42],[42,183],[183,80],[40,92],[92,186],[186,40],[230,229],[229,118],[118,230],[202,212],[212,214],[214,202],[83,18],[18,17],[17,83],[76,61],[61,146],[146,76],[160,29],[29,30],[30,160],[56,157],[157,173],[173,56],[106,204],[204,194],[194,106],[135,214],[214,192],[192,135],[203,165],[165,98],[98,203],[21,71],[71,68],[68,21],[51,45],[45,4],[4,51],[144,24],[24,23],[23,144],[77,146],[146,91],[91,77],[205,50],[50,187],[187,205],[201,200],[200,18],[18,201],[91,106],[106,182],[182,91],[90,91],[91,181],[181,90],[85,84],[84,17],[17,85],[206,203],[203,36],[36,206],[148,171],[171,140],[140,148],[92,40],[40,39],[39,92],[193,189],[189,244],[244,193],[159,158],[158,28],[28,159],[247,246],[246,161],[161,247],[236,3],[3,196],[196,236],[54,68],[68,104],[104,54],[193,168],[168,8],[8,193],[117,228],[228,31],[31,117],[189,193],[193,55],[55,189],[98,97],[97,99],[99,98],[126,47],[47,100],[100,126],[166,79],[79,218],[218,166],[155,154],[154,26],[26,155],[209,49],[49,131],[131,209],[135,136],[136,150],[150,135],[47,126],[126,217],[217,47],[223,52],[52,53],[53,223],[45,51],[51,134],[134,45],[211,170],[170,140],[140,211],[67,69],[69,108],[108,67],[43,106],[106,91],[91,43],[230,119],[119,120],[120,230],[226,130],[130,247],[247,226],[63,53],[53,52],[52,63],[238,20],[20,242],[242,238],[46,70],[70,156],[156,46],[78,62],[62,96],[96,78],[46,53],[53,63],[63,46],[143,34],[34,227],[227,143],[123,117],[117,111],[111,123],[44,125],[125,19],[19,44],[236,134],[134,51],[51,236],[216,206],[206,205],[205,216],[154,153],[153,22],[22,154],[39,37],[37,167],[167,39],[200,201],[201,208],[208,200],[36,142],[142,100],[100,36],[57,212],[212,202],[202,57],[20,60],[60,99],[99,20],[28,158],[158,157],[157,28],[35,226],[226,113],[113,35],[160,159],[159,27],[27,160],[204,202],[202,210],[210,204],[113,225],[225,46],[46,113],[43,202],[202,204],[204,43],[62,76],[76,77],[77,62],[137,123],[123,116],[116,137],[41,38],[38,72],[72,41],[203,129],[129,142],[142,203],[64,98],[98,240],[240,64],[49,102],[102,64],[64,49],[41,73],[73,74],[74,41],[212,216],[216,207],[207,212],[42,74],[74,184],[184,42],[169,170],[170,211],[211,169],[170,149],[149,176],[176,170],[105,66],[66,69],[69,105],[122,6],[6,168],[168,122],[123,147],[147,187],[187,123],[96,77],[77,90],[90,96],[65,55],[55,107],[107,65],[89,90],[90,180],[180,89],[101,100],[100,120],[120,101],[63,105],[105,104],[104,63],[93,137],[137,227],[227,93],[15,86],[86,85],[85,15],[129,102],[102,49],[49,129],[14,87],[87,86],[86,14],[55,8],[8,9],[9,55],[100,47],[47,121],[121,100],[145,23],[23,22],[22,145],[88,89],[89,179],[179,88],[6,122],[122,196],[196,6],[88,95],[95,96],[96,88],[138,172],[172,136],[136,138],[215,58],[58,172],[172,215],[115,48],[48,219],[219,115],[42,80],[80,81],[81,42],[195,3],[3,51],[51,195],[43,146],[146,61],[61,43],[171,175],[175,199],[199,171],[81,82],[82,38],[38,81],[53,46],[46,225],[225,53],[144,163],[163,110],[110,144],[52,65],[65,66],[66,52],[229,228],[228,117],[117,229],[34,127],[127,234],[234,34],[107,108],[108,69],[69,107],[109,108],[108,151],[151,109],[48,64],[64,235],[235,48],[62,78],[78,191],[191,62],[129,209],[209,126],[126,129],[111,35],[35,143],[143,111],[117,123],[123,50],[50,117],[222,65],[65,52],[52,222],[19,125],[125,141],[141,19],[221,55],[55,65],[65,221],[3,195],[195,197],[197,3],[25,7],[7,33],[33,25],[220,237],[237,44],[44,220],[70,71],[71,139],[139,70],[122,193],[193,245],[245,122],[247,130],[130,33],[33,247],[71,21],[21,162],[162,71],[170,169],[169,150],[150,170],[188,174],[174,196],[196,188],[216,186],[186,92],[92,216],[2,97],[97,167],[167,2],[141,125],[125,241],[241,141],[164,167],[167,37],[37,164],[72,38],[38,12],[12,72],[38,82],[82,13],[13,38],[63,68],[68,71],[71,63],[226,35],[35,111],[111,226],[101,50],[50,205],[205,101],[206,92],[92,165],[165,206],[209,198],[198,217],[217,209],[165,167],[167,97],[97,165],[220,115],[115,218],[218,220],[133,112],[112,243],[243,133],[239,238],[238,241],[241,239],[214,135],[135,169],[169,214],[190,173],[173,133],[133,190],[171,208],[208,32],[32,171],[125,44],[44,237],[237,125],[86,87],[87,178],[178,86],[85,86],[86,179],[179,85],[84,85],[85,180],[180,84],[83,84],[84,181],[181,83],[201,83],[83,182],[182,201],[137,93],[93,132],[132,137],[76,62],[62,183],[183,76],[61,76],[76,184],[184,61],[57,61],[61,185],[185,57],[212,57],[57,186],[186,212],[214,207],[207,187],[187,214],[34,143],[143,156],[156,34],[79,239],[239,237],[237,79],[123,137],[137,177],[177,123],[44,1],[1,4],[4,44],[201,194],[194,32],[32,201],[64,102],[102,129],[129,64],[213,215],[215,138],[138,213],[59,166],[166,219],[219,59],[242,99],[99,97],[97,242],[2,94],[94,141],[141,2],[75,59],[59,235],[235,75],[24,110],[110,228],[228,24],[25,130],[130,226],[226,25],[23,24],[24,229],[229,23],[22,23],[23,230],[230,22],[26,22],[22,231],[231,26],[112,26],[26,232],[232,112],[189,190],[190,243],[243,189],[221,56],[56,190],[190,221],[28,56],[56,221],[221,28],[27,28],[28,222],[222,27],[29,27],[27,223],[223,29],[30,29],[29,224],[224,30],[247,30],[30,225],[225,247],[238,79],[79,20],[20,238],[166,59],[59,75],[75,166],[60,75],[75,240],[240,60],[147,177],[177,215],[215,147],[20,79],[79,166],[166,20],[187,147],[147,213],[213,187],[112,233],[233,244],[244,112],[233,128],[128,245],[245,233],[128,114],[114,188],[188,128],[114,217],[217,174],[174,114],[131,115],[115,220],[220,131],[217,198],[198,236],[236,217],[198,131],[131,134],[134,198],[177,132],[132,58],[58,177],[143,35],[35,124],[124,143],[110,163],[163,7],[7,110],[228,110],[110,25],[25,228],[356,389],[389,368],[368,356],[11,302],[302,267],[267,11],[452,350],[350,349],[349,452],[302,303],[303,269],[269,302],[357,343],[343,277],[277,357],[452,453],[453,357],[357,452],[333,332],[332,297],[297,333],[175,152],[152,377],[377,175],[347,348],[348,330],[330,347],[303,304],[304,270],[270,303],[9,336],[336,337],[337,9],[278,279],[279,360],[360,278],[418,262],[262,431],[431,418],[304,408],[408,409],[409,304],[310,415],[415,407],[407,310],[270,409],[409,410],[410,270],[450,348],[348,347],[347,450],[422,430],[430,434],[434,422],[313,314],[314,17],[17,313],[306,307],[307,375],[375,306],[387,388],[388,260],[260,387],[286,414],[414,398],[398,286],[335,406],[406,418],[418,335],[364,367],[367,416],[416,364],[423,358],[358,327],[327,423],[251,284],[284,298],[298,251],[281,5],[5,4],[4,281],[373,374],[374,253],[253,373],[307,320],[320,321],[321,307],[425,427],[427,411],[411,425],[421,313],[313,18],[18,421],[321,405],[405,406],[406,321],[320,404],[404,405],[405,320],[315,16],[16,17],[17,315],[426,425],[425,266],[266,426],[377,400],[400,369],[369,377],[322,391],[391,269],[269,322],[417,465],[465,464],[464,417],[386,257],[257,258],[258,386],[466,260],[260,388],[388,466],[456,399],[399,419],[419,456],[284,332],[332,333],[333,284],[417,285],[285,8],[8,417],[346,340],[340,261],[261,346],[413,441],[441,285],[285,413],[327,460],[460,328],[328,327],[355,371],[371,329],[329,355],[392,439],[439,438],[438,392],[382,341],[341,256],[256,382],[429,420],[420,360],[360,429],[364,394],[394,379],[379,364],[277,343],[343,437],[437,277],[443,444],[444,283],[283,443],[275,440],[440,363],[363,275],[431,262],[262,369],[369,431],[297,338],[338,337],[337,297],[273,375],[375,321],[321,273],[450,451],[451,349],[349,450],[446,342],[342,467],[467,446],[293,334],[334,282],[282,293],[458,461],[461,462],[462,458],[276,353],[353,383],[383,276],[308,324],[324,325],[325,308],[276,300],[300,293],[293,276],[372,345],[345,447],[447,372],[352,345],[345,340],[340,352],[274,1],[1,19],[19,274],[456,248],[248,281],[281,456],[436,427],[427,425],[425,436],[381,256],[256,252],[252,381],[269,391],[391,393],[393,269],[200,199],[199,428],[428,200],[266,330],[330,329],[329,266],[287,273],[273,422],[422,287],[250,462],[462,328],[328,250],[258,286],[286,384],[384,258],[265,353],[353,342],[342,265],[387,259],[259,257],[257,387],[424,431],[431,430],[430,424],[342,353],[353,276],[276,342],[273,335],[335,424],[424,273],[292,325],[325,307],[307,292],[366,447],[447,345],[345,366],[271,303],[303,302],[302,271],[423,266],[266,371],[371,423],[294,455],[455,460],[460,294],[279,278],[278,294],[294,279],[271,272],[272,304],[304,271],[432,434],[434,427],[427,432],[272,407],[407,408],[408,272],[394,430],[430,431],[431,394],[395,369],[369,400],[400,395],[334,333],[333,299],[299,334],[351,417],[417,168],[168,351],[352,280],[280,411],[411,352],[325,319],[319,320],[320,325],[295,296],[296,336],[336,295],[319,403],[403,404],[404,319],[330,348],[348,349],[349,330],[293,298],[298,333],[333,293],[323,454],[454,447],[447,323],[15,16],[16,315],[315,15],[358,429],[429,279],[279,358],[14,15],[15,316],[316,14],[285,336],[336,9],[9,285],[329,349],[349,350],[350,329],[374,380],[380,252],[252,374],[318,402],[402,403],[403,318],[6,197],[197,419],[419,6],[318,319],[319,325],[325,318],[367,364],[364,365],[365,367],[435,367],[367,397],[397,435],[344,438],[438,439],[439,344],[272,271],[271,311],[311,272],[195,5],[5,281],[281,195],[273,287],[287,291],[291,273],[396,428],[428,199],[199,396],[311,271],[271,268],[268,311],[283,444],[444,445],[445,283],[373,254],[254,339],[339,373],[282,334],[334,296],[296,282],[449,347],[347,346],[346,449],[264,447],[447,454],[454,264],[336,296],[296,299],[299,336],[338,10],[10,151],[151,338],[278,439],[439,455],[455,278],[292,407],[407,415],[415,292],[358,371],[371,355],[355,358],[340,345],[345,372],[372,340],[346,347],[347,280],[280,346],[442,443],[443,282],[282,442],[19,94],[94,370],[370,19],[441,442],[442,295],[295,441],[248,419],[419,197],[197,248],[263,255],[255,359],[359,263],[440,275],[275,274],[274,440],[300,383],[383,368],[368,300],[351,412],[412,465],[465,351],[263,467],[467,466],[466,263],[301,368],[368,389],[389,301],[395,378],[378,379],[379,395],[412,351],[351,419],[419,412],[436,426],[426,322],[322,436],[2,164],[164,393],[393,2],[370,462],[462,461],[461,370],[164,0],[0,267],[267,164],[302,11],[11,12],[12,302],[268,12],[12,13],[13,268],[293,300],[300,301],[301,293],[446,261],[261,340],[340,446],[330,266],[266,425],[425,330],[426,423],[423,391],[391,426],[429,355],[355,437],[437,429],[391,327],[327,326],[326,391],[440,457],[457,438],[438,440],[341,382],[382,362],[362,341],[459,457],[457,461],[461,459],[434,430],[430,394],[394,434],[414,463],[463,362],[362,414],[396,369],[369,262],[262,396],[354,461],[461,457],[457,354],[316,403],[403,402],[402,316],[315,404],[404,403],[403,315],[314,405],[405,404],[404,314],[313,406],[406,405],[405,313],[421,418],[418,406],[406,421],[366,401],[401,361],[361,366],[306,408],[408,407],[407,306],[291,409],[409,408],[408,291],[287,410],[410,409],[409,287],[432,436],[436,410],[410,432],[434,416],[416,411],[411,434],[264,368],[368,383],[383,264],[309,438],[438,457],[457,309],[352,376],[376,401],[401,352],[274,275],[275,4],[4,274],[421,428],[428,262],[262,421],[294,327],[327,358],[358,294],[433,416],[416,367],[367,433],[289,455],[455,439],[439,289],[462,370],[370,326],[326,462],[2,326],[326,370],[370,2],[305,460],[460,455],[455,305],[254,449],[449,448],[448,254],[255,261],[261,446],[446,255],[253,450],[450,449],[449,253],[252,451],[451,450],[450,252],[256,452],[452,451],[451,256],[341,453],[453,452],[452,341],[413,464],[464,463],[463,413],[441,413],[413,414],[414,441],[258,442],[442,441],[441,258],[257,443],[443,442],[442,257],[259,444],[444,443],[443,259],[260,445],[445,444],[444,260],[467,342],[342,445],[445,467],[459,458],[458,250],[250,459],[289,392],[392,290],[290,289],[290,328],[328,460],[460,290],[376,433],[433,435],[435,376],[250,290],[290,392],[392,250],[411,416],[416,433],[433,411],[341,463],[463,464],[464,341],[453,464],[464,465],[465,453],[357,465],[465,412],[412,357],[343,412],[412,399],[399,343],[360,363],[363,440],[440,360],[437,399],[399,456],[456,437],[420,456],[456,363],[363,420],[401,435],[435,288],[288,401],[372,383],[383,353],[353,372],[339,255],[255,249],[249,339],[448,261],[261,255],[255,448],[133,243],[243,190],[190,133],[133,155],[155,112],[112,133],[33,246],[246,247],[247,33],[33,130],[130,25],[25,33],[398,384],[384,286],[286,398],[362,398],[398,414],[414,362],[362,463],[463,341],[341,362],[263,359],[359,467],[467,263],[263,249],[249,255],[255,263],[466,467],[467,260],[260,466],[75,60],[60,166],[166,75],[238,239],[239,79],[79,238],[162,127],[127,139],[139,162],[72,11],[11,37],[37,72],[121,232],[232,120],[120,121],[73,72],[72,39],[39,73],[114,128],[128,47],[47,114],[233,232],[232,128],[128,233],[103,104],[104,67],[67,103],[152,175],[175,148],[148,152],[119,118],[118,101],[101,119],[74,73],[73,40],[40,74],[107,9],[9,108],[108,107],[49,48],[48,131],[131,49],[32,194],[194,211],[211,32],[184,74],[74,185],[185,184],[191,80],[80,183],[183,191],[185,40],[40,186],[186,185],[119,230],[230,118],[118,119],[210,202],[202,214],[214,210],[84,83],[83,17],[17,84],[77,76],[76,146],[146,77],[161,160],[160,30],[30,161],[190,56],[56,173],[173,190],[182,106],[106,194],[194,182],[138,135],[135,192],[192,138],[129,203],[203,98],[98,129],[54,21],[21,68],[68,54],[5,51],[51,4],[4,5],[145,144],[144,23],[23,145],[90,77],[77,91],[91,90],[207,205],[205,187],[187,207],[83,201],[201,18],[18,83],[181,91],[91,182],[182,181],[180,90],[90,181],[181,180],[16,85],[85,17],[17,16],[205,206],[206,36],[36,205],[176,148],[148,140],[140,176],[165,92],[92,39],[39,165],[245,193],[193,244],[244,245],[27,159],[159,28],[28,27],[30,247],[247,161],[161,30],[174,236],[236,196],[196,174],[103,54],[54,104],[104,103],[55,193],[193,8],[8,55],[111,117],[117,31],[31,111],[221,189],[189,55],[55,221],[240,98],[98,99],[99,240],[142,126],[126,100],[100,142],[219,166],[166,218],[218,219],[112,155],[155,26],[26,112],[198,209],[209,131],[131,198],[169,135],[135,150],[150,169],[114,47],[47,217],[217,114],[224,223],[223,53],[53,224],[220,45],[45,134],[134,220],[32,211],[211,140],[140,32],[109,67],[67,108],[108,109],[146,43],[43,91],[91,146],[231,230],[230,120],[120,231],[113,226],[226,247],[247,113],[105,63],[63,52],[52,105],[241,238],[238,242],[242,241],[124,46],[46,156],[156,124],[95,78],[78,96],[96,95],[70,46],[46,63],[63,70],[116,143],[143,227],[227,116],[116,123],[123,111],[111,116],[1,44],[44,19],[19,1],[3,236],[236,51],[51,3],[207,216],[216,205],[205,207],[26,154],[154,22],[22,26],[165,39],[39,167],[167,165],[199,200],[200,208],[208,199],[101,36],[36,100],[100,101],[43,57],[57,202],[202,43],[242,20],[20,99],[99,242],[56,28],[28,157],[157,56],[124,35],[35,113],[113,124],[29,160],[160,27],[27,29],[211,204],[204,210],[210,211],[124,113],[113,46],[46,124],[106,43],[43,204],[204,106],[96,62],[62,77],[77,96],[227,137],[137,116],[116,227],[73,41],[41,72],[72,73],[36,203],[203,142],[142,36],[235,64],[64,240],[240,235],[48,49],[49,64],[64,48],[42,41],[41,74],[74,42],[214,212],[212,207],[207,214],[183,42],[42,184],[184,183],[210,169],[169,211],[211,210],[140,170],[170,176],[176,140],[104,105],[105,69],[69,104],[193,122],[122,168],[168,193],[50,123],[123,187],[187,50],[89,96],[96,90],[90,89],[66,65],[65,107],[107,66],[179,89],[89,180],[180,179],[119,101],[101,120],[120,119],[68,63],[63,104],[104,68],[234,93],[93,227],[227,234],[16,15],[15,85],[85,16],[209,129],[129,49],[49,209],[15,14],[14,86],[86,15],[107,55],[55,9],[9,107],[120,100],[100,121],[121,120],[153,145],[145,22],[22,153],[178,88],[88,179],[179,178],[197,6],[6,196],[196,197],[89,88],[88,96],[96,89],[135,138],[138,136],[136,135],[138,215],[215,172],[172,138],[218,115],[115,219],[219,218],[41,42],[42,81],[81,41],[5,195],[195,51],[51,5],[57,43],[43,61],[61,57],[208,171],[171,199],[199,208],[41,81],[81,38],[38,41],[224,53],[53,225],[225,224],[24,144],[144,110],[110,24],[105,52],[52,66],[66,105],[118,229],[229,117],[117,118],[227,34],[34,234],[234,227],[66,107],[107,69],[69,66],[10,109],[109,151],[151,10],[219,48],[48,235],[235,219],[183,62],[62,191],[191,183],[142,129],[129,126],[126,142],[116,111],[111,143],[143,116],[118,117],[117,50],[50,118],[223,222],[222,52],[52,223],[94,19],[19,141],[141,94],[222,221],[221,65],[65,222],[196,3],[3,197],[197,196],[45,220],[220,44],[44,45],[156,70],[70,139],[139,156],[188,122],[122,245],[245,188],[139,71],[71,162],[162,139],[149,170],[170,150],[150,149],[122,188],[188,196],[196,122],[206,216],[216,92],[92,206],[164,2],[2,167],[167,164],[242,141],[141,241],[241,242],[0,164],[164,37],[37,0],[11,72],[72,12],[12,11],[12,38],[38,13],[13,12],[70,63],[63,71],[71,70],[31,226],[226,111],[111,31],[36,101],[101,205],[205,36],[203,206],[206,165],[165,203],[126,209],[209,217],[217,126],[98,165],[165,97],[97,98],[237,220],[220,218],[218,237],[237,239],[239,241],[241,237],[210,214],[214,169],[169,210],[140,171],[171,32],[32,140],[241,125],[125,237],[237,241],[179,86],[86,178],[178,179],[180,85],[85,179],[179,180],[181,84],[84,180],[180,181],[182,83],[83,181],[181,182],[194,201],[201,182],[182,194],[177,137],[137,132],[132,177],[184,76],[76,183],[183,184],[185,61],[61,184],[184,185],[186,57],[57,185],[185,186],[216,212],[212,186],[186,216],[192,214],[214,187],[187,192],[139,34],[34,156],[156,139],[218,79],[79,237],[237,218],[147,123],[123,177],[177,147],[45,44],[44,4],[4,45],[208,201],[201,32],[32,208],[98,64],[64,129],[129,98],[192,213],[213,138],[138,192],[235,59],[59,219],[219,235],[141,242],[242,97],[97,141],[97,2],[2,141],[141,97],[240,75],[75,235],[235,240],[229,24],[24,228],[228,229],[31,25],[25,226],[226,31],[230,23],[23,229],[229,230],[231,22],[22,230],[230,231],[232,26],[26,231],[231,232],[233,112],[112,232],[232,233],[244,189],[189,243],[243,244],[189,221],[221,190],[190,189],[222,28],[28,221],[221,222],[223,27],[27,222],[222,223],[224,29],[29,223],[223,224],[225,30],[30,224],[224,225],[113,247],[247,225],[225,113],[99,60],[60,240],[240,99],[213,147],[147,215],[215,213],[60,20],[20,166],[166,60],[192,187],[187,213],[213,192],[243,112],[112,244],[244,243],[244,233],[233,245],[245,244],[245,128],[128,188],[188,245],[188,114],[114,174],[174,188],[134,131],[131,220],[220,134],[174,217],[217,236],[236,174],[236,198],[198,134],[134,236],[215,177],[177,58],[58,215],[156,143],[143,124],[124,156],[25,110],[110,7],[7,25],[31,228],[228,25],[25,31],[264,356],[356,368],[368,264],[0,11],[11,267],[267,0],[451,452],[452,349],[349,451],[267,302],[302,269],[269,267],[350,357],[357,277],[277,350],[350,452],[452,357],[357,350],[299,333],[333,297],[297,299],[396,175],[175,377],[377,396],[280,347],[347,330],[330,280],[269,303],[303,270],[270,269],[151,9],[9,337],[337,151],[344,278],[278,360],[360,344],[424,418],[418,431],[431,424],[270,304],[304,409],[409,270],[272,310],[310,407],[407,272],[322,270],[270,410],[410,322],[449,450],[450,347],[347,449],[432,422],[422,434],[434,432],[18,313],[313,17],[17,18],[291,306],[306,375],[375,291],[259,387],[387,260],[260,259],[424,335],[335,418],[418,424],[434,364],[364,416],[416,434],[391,423],[423,327],[327,391],[301,251],[251,298],[298,301],[275,281],[281,4],[4,275],[254,373],[373,253],[253,254],[375,307],[307,321],[321,375],[280,425],[425,411],[411,280],[200,421],[421,18],[18,200],[335,321],[321,406],[406,335],[321,320],[320,405],[405,321],[314,315],[315,17],[17,314],[423,426],[426,266],[266,423],[396,377],[377,369],[369,396],[270,322],[322,269],[269,270],[413,417],[417,464],[464,413],[385,386],[386,258],[258,385],[248,456],[456,419],[419,248],[298,284],[284,333],[333,298],[168,417],[417,8],[8,168],[448,346],[346,261],[261,448],[417,413],[413,285],[285,417],[326,327],[327,328],[328,326],[277,355],[355,329],[329,277],[309,392],[392,438],[438,309],[381,382],[382,256],[256,381],[279,429],[429,360],[360,279],[365,364],[364,379],[379,365],[355,277],[277,437],[437,355],[282,443],[443,283],[283,282],[281,275],[275,363],[363,281],[395,431],[431,369],[369,395],[299,297],[297,337],[337,299],[335,273],[273,321],[321,335],[348,450],[450,349],[349,348],[359,446],[446,467],[467,359],[283,293],[293,282],[282,283],[250,458],[458,462],[462,250],[300,276],[276,383],[383,300],[292,308],[308,325],[325,292],[283,276],[276,293],[293,283],[264,372],[372,447],[447,264],[346,352],[352,340],[340,346],[354,274],[274,19],[19,354],[363,456],[456,281],[281,363],[426,436],[436,425],[425,426],[380,381],[381,252],[252,380],[267,269],[269,393],[393,267],[421,200],[200,428],[428,421],[371,266],[266,329],[329,371],[432,287],[287,422],[422,432],[290,250],[250,328],[328,290],[385,258],[258,384],[384,385],[446,265],[265,342],[342,446],[386,387],[387,257],[257,386],[422,424],[424,430],[430,422],[445,342],[342,276],[276,445],[422,273],[273,424],[424,422],[306,292],[292,307],[307,306],[352,366],[366,345],[345,352],[268,271],[271,302],[302,268],[358,423],[423,371],[371,358],[327,294],[294,460],[460,327],[331,279],[279,294],[294,331],[303,271],[271,304],[304,303],[436,432],[432,427],[427,436],[304,272],[272,408],[408,304],[395,394],[394,431],[431,395],[378,395],[395,400],[400,378],[296,334],[334,299],[299,296],[6,351],[351,168],[168,6],[376,352],[352,411],[411,376],[307,325],[325,320],[320,307],[285,295],[295,336],[336,285],[320,319],[319,404],[404,320],[329,330],[330,349],[349,329],[334,293],[293,333],[333,334],[366,323],[323,447],[447,366],[316,15],[15,315],[315,316],[331,358],[358,279],[279,331],[317,14],[14,316],[316,317],[8,285],[285,9],[9,8],[277,329],[329,350],[350,277],[253,374],[374,252],[252,253],[319,318],[318,403],[403,319],[351,6],[6,419],[419,351],[324,318],[318,325],[325,324],[397,367],[367,365],[365,397],[288,435],[435,397],[397,288],[278,344],[344,439],[439,278],[310,272],[272,311],[311,310],[248,195],[195,281],[281,248],[375,273],[273,291],[291,375],[175,396],[396,199],[199,175],[312,311],[311,268],[268,312],[276,283],[283,445],[445,276],[390,373],[373,339],[339,390],[295,282],[282,296],[296,295],[448,449],[449,346],[346,448],[356,264],[264,454],[454,356],[337,336],[336,299],[299,337],[337,338],[338,151],[151,337],[294,278],[278,455],[455,294],[308,292],[292,415],[415,308],[429,358],[358,355],[355,429],[265,340],[340,372],[372,265],[352,346],[346,280],[280,352],[295,442],[442,282],[282,295],[354,19],[19,370],[370,354],[285,441],[441,295],[295,285],[195,248],[248,197],[197,195],[457,440],[440,274],[274,457],[301,300],[300,368],[368,301],[417,351],[351,465],[465,417],[251,301],[301,389],[389,251],[394,395],[395,379],[379,394],[399,412],[412,419],[419,399],[410,436],[436,322],[322,410],[326,2],[2,393],[393,326],[354,370],[370,461],[461,354],[393,164],[164,267],[267,393],[268,302],[302,12],[12,268],[312,268],[268,13],[13,312],[298,293],[293,301],[301,298],[265,446],[446,340],[340,265],[280,330],[330,425],[425,280],[322,426],[426,391],[391,322],[420,429],[429,437],[437,420],[393,391],[391,326],[326,393],[344,440],[440,438],[438,344],[458,459],[459,461],[461,458],[364,434],[434,394],[394,364],[428,396],[396,262],[262,428],[274,354],[354,457],[457,274],[317,316],[316,402],[402,317],[316,315],[315,403],[403,316],[315,314],[314,404],[404,315],[314,313],[313,405],[405,314],[313,421],[421,406],[406,313],[323,366],[366,361],[361,323],[292,306],[306,407],[407,292],[306,291],[291,408],[408,306],[291,287],[287,409],[409,291],[287,432],[432,410],[410,287],[427,434],[434,411],[411,427],[372,264],[264,383],[383,372],[459,309],[309,457],[457,459],[366,352],[352,401],[401,366],[1,274],[274,4],[4,1],[418,421],[421,262],[262,418],[331,294],[294,358],[358,331],[435,433],[433,367],[367,435],[392,289],[289,439],[439,392],[328,462],[462,326],[326,328],[94,2],[2,370],[370,94],[289,305],[305,455],[455,289],[339,254],[254,448],[448,339],[359,255],[255,446],[446,359],[254,253],[253,449],[449,254],[253,252],[252,450],[450,253],[252,256],[256,451],[451,252],[256,341],[341,452],[452,256],[414,413],[413,463],[463,414],[286,441],[441,414],[414,286],[286,258],[258,441],[441,286],[258,257],[257,442],[442,258],[257,259],[259,443],[443,257],[259,260],[260,444],[444,259],[260,467],[467,445],[445,260],[309,459],[459,250],[250,309],[305,289],[289,290],[290,305],[305,290],[290,460],[460,305],[401,376],[376,435],[435,401],[309,250],[250,392],[392,309],[376,411],[411,433],[433,376],[453,341],[341,464],[464,453],[357,453],[453,465],[465,357],[343,357],[357,412],[412,343],[437,343],[343,399],[399,437],[344,360],[360,440],[440,344],[420,437],[437,456],[456,420],[360,420],[420,363],[363,360],[361,401],[401,288],[288,361],[265,372],[372,353],[353,265],[390,339],[339,249],[249,390],[339,448],[448,255],[255,339]),U([0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]),U([0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],[11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[17,19],[12,14],[14,16],[16,18],[16,20],[16,22],[18,20],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,29],[28,30],[29,31],[30,32],[27,31],[28,32]);const Lr=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]];class jr{constructor(e={}){this.callbacks=e,this.host=null,this.shadow=null,this.subtitleHost=null,this.subtitleShadow=null,this.subtitleEnabled=!0,this.isCollapsed=!1,this.activeTab="sign-to-text",this.transcriptTokens=[],this.signSequence=[],this.signIndex=0,this.signTimer=null,this.isPlayingSign=!1,this._videoBlobCache=new Map,this.recognition=null,this.isListeningVoice=!1,this._voiceAutoRestart=!1,this._userPausedVoice=!1,this._mount()}_mount(){const e=document.getElementById("isyarat-live-root");e&&e.remove(),this.host=document.createElement("div"),this.host.id="isyarat-live-root",this.host.style.cssText="position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;",this.shadow=this.host.attachShadow({mode:"open"}),this.shadow.innerHTML=this._template(),document.documentElement.appendChild(this.host),this._mountSubtitle(),this._bindEvents(),this._bindDrag()}_mountSubtitle(){const e=document.getElementById("isyarat-live-subtitle-root");e&&e.remove(),this.subtitleHost=document.createElement("div"),this.subtitleHost.id="isyarat-live-subtitle-root",this.subtitleHost.style.cssText="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483646;pointer-events:none;max-width:80vw;transition:top 0.12s linear,left 0.12s linear;",this.subtitleShadow=this.subtitleHost.attachShadow({mode:"open"}),this.subtitleShadow.innerHTML=`
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
        .suggest-bar {
          display: none;
          gap: 5px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .suggest-bar.visible {
          display: flex;
        }
        .suggest-chip {
          background: #e8f1ee;
          border: 1px solid rgba(77, 124, 111, 0.28);
          color: #2f5d50;
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.14s;
        }
        .suggest-chip:hover {
          background: #d6e7e1;
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

            <div class="suggest-bar" id="suggest-bar" title="Klik saran kata untuk melengkapi ejaan"></div>

            <div class="transcript-box" id="transcript-box">
              <span style="color:#a8a29e">Hasil terjemahan kalimat akan muncul di sini...</span>
            </div>

            <div class="hint" style="margin:0 0 8px;font-size:10.5px;">
              Mendukung <b>Huruf A–Z</b> (mis. <b>A</b> kepal jempol di samping, <b>B</b> 4 jari rapat, <b>C</b>, <b>L</b>, <b>O</b>, <b>U</b>, <b>V</b>, <b>W</b>, <b>Y</b>) & <b>Kata</b> (<b>SAYA</b> tangan di dada · <b>SUKA</b> 🤟 · <b>KAMU</b> ☝️ · <b>HALO</b> ✋ · <b>BAGUS</b> 👍 · <b>TERIMA KASIH</b> 🤚)
            </div>

            <div class="btn-row">
              <button class="btn primary" id="btn-cc" title="Tampilkan subtitle di bawah video">CC: ON</button>
              <button class="btn" id="btn-backspace" title="Hapus 1 huruf/kata terakhir">⌫</button>
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
    `}_q(e){return this.shadow.querySelector(e)}_bindEvents(){this._q("#btn-collapse").addEventListener("click",()=>this.setCollapsed(!0)),this._q("#collapsed-pill").addEventListener("click",()=>this.setCollapsed(!1)),this.shadow.querySelectorAll(".tab-btn").forEach(n=>{n.addEventListener("click",()=>this.switchTab(n.dataset.tab))}),this.shadow.querySelectorAll(".mode-btn").forEach(n=>{n.addEventListener("click",()=>{var i,a;this.shadow.querySelectorAll(".mode-btn").forEach(r=>r.classList.toggle("active",r===n)),(a=(i=this.callbacks).onSelectRecognitionMode)==null||a.call(i,n.dataset.mode)})}),this._q("#video-select").addEventListener("change",n=>{var i,a;(a=(i=this.callbacks).onSelectVideo)==null||a.call(i,n.target.value)}),this._q("#btn-swap-video").addEventListener("click",()=>{var n,i;(i=(n=this.callbacks).onCycleVideo)==null||i.call(n)}),this._q("#btn-cc").addEventListener("click",()=>{this.subtitleEnabled=!this.subtitleEnabled;const n=this._q("#btn-cc");n.textContent=this.subtitleEnabled?"CC: ON":"CC: OFF",n.classList.toggle("primary",this.subtitleEnabled),this._renderSubtitle()}),this._q("#btn-backspace").addEventListener("click",()=>{this.backspaceTranscript()}),this._q("#btn-space").addEventListener("click",()=>{this.appendTranscript(" ")}),this._q("#btn-clear").addEventListener("click",()=>{this.transcriptTokens=[],this._renderTranscript()}),this._q("#btn-copy").addEventListener("click",async()=>{const n=this.getTranscriptText();if(n)try{await navigator.clipboard.writeText(n),this.setMeta("Teks disalin ke clipboard")}catch{this.setMeta("Gagal menyalin teks")}}),this._q("#btn-speak").addEventListener("click",()=>{const n=this.getTranscriptText();if(!n||typeof speechSynthesis>"u")return;const i=new SpeechSynthesisUtterance(n);i.lang="id-ID",speechSynthesis.cancel(),speechSynthesis.speak(i)});const e=()=>{const n=this._q("#tts-input").value.trim();n&&this.playTextToSign(n)};this._q("#btn-translate-sign").addEventListener("click",e),this._q("#btn-voice-sign").addEventListener("click",()=>this._toggleVoiceToSign()),this._q("#tts-input").addEventListener("keydown",n=>{n.key==="Enter"&&e()}),this._q("#btn-replay-sign").addEventListener("click",()=>{this.signSequence.length>0&&(this.signIndex=0,this._startSignPlayback())}),this.shadow.querySelectorAll(".chip").forEach(n=>{n.addEventListener("click",()=>{this._q("#tts-input").value=n.dataset.phrase,this.playTextToSign(n.dataset.phrase)})}),this.shadow.querySelectorAll(".train-preset").forEach(n=>{n.addEventListener("click",()=>{this._q("#train-label").value=n.dataset.word,this.setTrainStatus(`Label "${n.dataset.word}" dipilih. Klik Rekam (15x) sambil tahan isyaratnya.`)})}),this._q("#btn-load-default").addEventListener("click",()=>{var n,i;(i=(n=this.callbacks).onLoadDefaultDataset)==null||i.call(n)}),this._q("#btn-record").addEventListener("click",()=>{var i,a;const n=this._q("#train-label").value.trim();if(!n){this.setTrainStatus("Masukkan label terlebih dahulu (contoh: A atau HALO).");return}(a=(i=this.callbacks).onRecordLabel)==null||a.call(i,n)}),this._q("#btn-export").addEventListener("click",()=>{var n,i;(i=(n=this.callbacks).onExportDataset)==null||i.call(n)}),this._q("#btn-import").addEventListener("click",()=>{this._q("#import-file").click()}),this._q("#import-file").addEventListener("change",async n=>{var a,r,s;const i=(a=n.target.files)==null?void 0:a[0];if(i){try{const o=JSON.parse(await i.text());(s=(r=this.callbacks).onImportDataset)==null||s.call(r,o)}catch{this.setTrainStatus("File JSON tidak valid.")}n.target.value=""}}),this._q("#btn-clear-dataset").addEventListener("click",()=>{var n,i;(i=(n=this.callbacks).onClearDataset)==null||i.call(n)})}_bindDrag(){const e=this._q("#drag-handle");let n=!1,i=0,a=0;e.addEventListener("pointerdown",s=>{if(s.target.closest("button"))return;n=!0;const o=this.host.getBoundingClientRect();i=s.clientX-o.left,a=s.clientY-o.top,this.host.style.right="auto",this.host.style.bottom="auto",this.host.style.left=`${o.left}px`,this.host.style.top=`${o.top}px`,e.setPointerCapture(s.pointerId)}),e.addEventListener("pointermove",s=>{if(!n)return;const o=Math.max(0,window.innerWidth-this.host.offsetWidth),l=Math.max(0,window.innerHeight-this.host.offsetHeight),d=Math.min(Math.max(0,s.clientX-i),o),c=Math.min(Math.max(0,s.clientY-a),l);this.host.style.left=`${d}px`,this.host.style.top=`${c}px`});const r=()=>{n=!1};e.addEventListener("pointerup",r),e.addEventListener("pointercancel",r)}setVisible(e){this.host.style.display=e?"block":"none",this.subtitleHost&&(this.subtitleHost.style.display=e?"block":"none")}setCollapsed(e){this.isCollapsed=e,this._q("#main-panel").classList.toggle("hidden",e),this._q("#collapsed-pill").classList.toggle("visible",e)}switchTab(e){this.activeTab=e,this.shadow.querySelectorAll(".tab-btn").forEach(n=>{n.classList.toggle("active",n.dataset.tab===e)}),this.shadow.querySelectorAll(".tab-pane").forEach(n=>{n.classList.toggle("active",n.id===`pane-${e}`)}),e==="text-to-sign"&&!this.isListeningVoice&&!this._userPausedVoice&&this.startVoiceAutoListen()}setStatus(e,n="idle"){this._q("#status-text").textContent=e;for(const i of["#header-dot","#pill-dot"]){const a=this._q(i);a.className="dot",n==="live"&&a.classList.add("live"),n==="warn"&&a.classList.add("warn"),n==="err"&&a.classList.add("err")}}setMeta(e){this._q("#live-meta").textContent=e}drawVideoPreview(e){}drawAllVideoPreviews(e,n,i=null){const a=this._q("#source-strip");a&&(a.children.length!==e.length&&(a.innerHTML="",e.forEach((r,s)=>{const o=document.createElement("button");o.className="source-thumb",o.type="button",o.title=`Klik untuk pantau ${r.label||`Video #${s+1}`}`,o.innerHTML=`
          <canvas width="88" height="62"></canvas>
          <span class="source-badge">${r.label||`Video #${s+1}`}</span>
        `,o.addEventListener("click",()=>{var l,d;this._q("#video-select").value=String(s),(d=(l=this.callbacks).onSelectVideo)==null||d.call(l,String(s))}),a.appendChild(o)})),Array.from(a.children).forEach((r,s)=>{var d;r.classList.toggle("active",s===n);const o=r.querySelector("canvas"),l=(d=e[s])==null?void 0:d.video;if(o&&l)try{const c=o.getContext("2d");if(c.drawImage(l,0,0,o.width,o.height),s===n&&Array.isArray(i)&&i.length===21){c.strokeStyle="rgba(77, 196, 155, 0.9)",c.lineWidth=1.4,c.beginPath();for(const[u,h]of Lr){const y=i[u],m=i[h];c.moveTo(y[0]*o.width,y[1]*o.height),c.lineTo(m[0]*o.width,m[1]*o.height)}c.stroke(),c.fillStyle="#ffffff";for(const u of i)c.beginPath(),c.arc(u[0]*o.width,u[1]*o.height,1.3,0,Math.PI*2),c.fill()}}catch{}}))}updateLivePrediction(e,n=0,i=0,a=0,r=!1){this._q("#live-sign").textContent=e||"—";const s=Math.round(Math.max(0,Math.min(1,a))*100),o=Math.round(Math.max(0,Math.min(1,n))*100);this._q("#conf-fill").style.width=`${r?100:e?Math.max(12,s):0}%`,r?this._q("#live-meta").textContent="Jeda sebentar — silakan ganti pose berikutnya":e?this._q("#live-meta").textContent=s<100?`Tahan pose "${e}" (${s}%) • Keyakinan ${o}%`:`Terkunci "${e}" ✓ • Keyakinan ${o}%`:this._q("#live-meta").textContent="Menunggu gerakan tangan yang stabil",this._renderSubtitle(!r&&s>=75?e:null)}updateVideoOptions(e,n){const i=this._q("#video-select"),a=n||i.value;i.innerHTML='<option value="auto">Auto (Lawan Bicara)</option>',e.forEach((r,s)=>{const o=r.video||r,l=r.label||(r.isSelf?"Kamera Saya (PiP)":"Lawan Bicara (Utama)"),d=o.videoWidth||o.width||0,c=o.videoHeight||o.height||0,u=document.createElement("option");u.value=String(s),u.textContent=`#${s+1} ${l} (${d}×${c})`,i.appendChild(u)}),[...i.options].some(r=>r.value===a)&&(i.value=a)}appendTranscript(e){e===" "?this.transcriptTokens.length>0&&this.transcriptTokens[this.transcriptTokens.length-1]!==" "&&this.transcriptTokens.push(" "):this.transcriptTokens.push(e),this._renderTranscript()}finalizeCurrentWord(){this.transcriptTokens.length>0&&this.transcriptTokens[this.transcriptTokens.length-1]!==" "&&(this.transcriptTokens.push(" "),this._renderTranscript())}getTranscriptText(){const e=this.transcriptTokens[this.transcriptTokens.length-1]===" ";return Fi(this.transcriptTokens,e)}backspaceTranscript(){this.transcriptTokens.length!==0&&(this.transcriptTokens[this.transcriptTokens.length-1]===" "&&this.transcriptTokens.pop(),this.transcriptTokens.length>0&&this.transcriptTokens.pop(),this._renderTranscript())}_getCurrentLetterPrefix(){let e="";for(let n=this.transcriptTokens.length-1;n>=0;n--){const i=this.transcriptTokens[n];if(i===" "||i.length!==1)break;e=i+e}return e}_applyWordSuggestion(e){for(;this.transcriptTokens.length>0&&this.transcriptTokens[this.transcriptTokens.length-1]!==" "&&this.transcriptTokens[this.transcriptTokens.length-1].length===1;)this.transcriptTokens.pop();this.transcriptTokens.push(e," "),this._renderTranscript()}_renderSuggestions(){const e=this._q("#suggest-bar");if(!e)return;const n=this._getCurrentLetterPrefix(),i=Gi(n,4);if(i.length===0){e.classList.remove("visible"),e.innerHTML="";return}e.innerHTML="";for(const a of i){const r=document.createElement("button");r.className="suggest-chip",r.type="button",r.textContent=a,r.addEventListener("click",()=>this._applyWordSuggestion(a)),e.appendChild(r)}e.classList.add("visible")}_renderTranscript(){const e=this._q("#transcript-box"),n=this.getTranscriptText();e.textContent=n||"Hasil terjemahan kalimat akan muncul di sini...",e.scrollTop=e.scrollHeight,this._renderSuggestions(),this._renderSubtitle()}_renderSubtitle(e=null){if(!this.subtitleShadow)return;const n=this.subtitleShadow.querySelector("#cc-wrap"),i=this.subtitleShadow.querySelector("#cc-text"),a=this.subtitleShadow.querySelector("#cc-live-tag"),r=this.getTranscriptText().toLowerCase();if(!this.subtitleEnabled||!r&&!e){n.classList.remove("visible");return}e&&e!=="✋"?(a.style.display="inline-block",a.textContent=`Terdeteksi: ${e}`):a.style.display="none";const o=(r?r.split(/\s+/):[]).slice(-10).join(" ");i.textContent=o||(e&&e!=="✋"?e.toLowerCase():""),n.classList.toggle("visible",!!i.textContent)}syncSubtitlePosition(e){if(!this.subtitleHost)return;if(!e){this.subtitleHost.style.left="50%",this.subtitleHost.style.top="auto",this.subtitleHost.style.bottom="28px",this.subtitleHost.style.transform="translateX(-50%)";return}const n=e.getBoundingClientRect();if(n.width<80||n.height<80)return;const i=Math.min(Math.max(n.left+n.width/2,160),window.innerWidth-160),a=Math.min(Math.max(n.bottom-56,20),window.innerHeight-64);this.subtitleHost.style.left=`${Math.round(i)}px`,this.subtitleHost.style.top=`${Math.round(a)}px`,this.subtitleHost.style.bottom="auto",this.subtitleHost.style.transform="translateX(-50%)"}playTextToSign(e){if(clearTimeout(this.signTimer),this.signSequence=$i(e),this.signIndex=0,this.signSequence.length===0){this._q("#sign-stage").innerHTML='<div class="sign-stage-cue">Tidak ada kata/huruf yang dapat diterjemahkan.</div>',this._q("#seq-strip").innerHTML="";return}this._renderSeqStrip(),this._startSignPlayback()}_renderSeqStrip(){const e=this._q("#seq-strip");e.innerHTML="",this.signSequence.forEach((n,i)=>{const a=document.createElement("span");a.className=`seq-item${i===this.signIndex?" current":""}`,a.textContent=n.label,e.appendChild(a)})}async _resolveVideoBlobUrl(e,n){if(!e)return n;if(this._videoBlobCache.has(e))return this._videoBlobCache.get(e);try{const i=await chrome.runtime.sendMessage({type:"GET_ASSET_DATA_URL",path:e});if(i!=null&&i.ok&&i.dataUrl){const r=await(await fetch(i.dataUrl)).blob(),s=URL.createObjectURL(r);return this._videoBlobCache.set(e,s),s}}catch{}return n}async _startSignPlayback(){if(clearTimeout(this.signTimer),this.signIndex>=this.signSequence.length){this.isPlayingSign=!1;return}this.isPlayingSign=!0;const e=this.signIndex,n=this.signSequence[e],i=this._q("#sign-stage");if(n.type==="letter"&&n.assetUrl)i.innerHTML=`
        <img src="${n.assetUrl}" alt="Isyarat huruf ${n.label}" />
        <div class="sign-stage-title">Huruf ${n.label}</div>
        <div class="sign-stage-cue">${n.cue}</div>
      `;else if(n.videoPath||n.videoUrl){const a=await this._resolveVideoBlobUrl(n.videoPath,n.videoUrl);if(this.signIndex!==e)return;i.innerHTML=`
        <video src="${a}" autoplay muted loop playsinline></video>
        <div class="sign-stage-title">${n.label}</div>
        <div class="sign-stage-cue">${n.cue}</div>
      `}else i.innerHTML=`
        <div class="sign-word-icon">${n.icon||"🤟"}</div>
        <div class="sign-stage-title">${n.label}</div>
        <div class="sign-stage-cue">${n.cue}</div>
      `;this._renderSeqStrip(),this.signTimer=setTimeout(()=>{this.signIndex++,this.signIndex<this.signSequence.length?this._startSignPlayback():this.isPlayingSign=!1},n.durationMs)}setTrainStatus(e){this._q("#train-status").textContent=e}renderDatasetList(e){const n=this._q("#train-list"),i=Object.entries(e).sort((a,r)=>a[0].localeCompare(r[0]));if(i.length===0){n.innerHTML='<div class="hint">Belum ada sampel. Rekam minimal 2 label agar KNN dapat membedakan isyarat.</div>';return}n.innerHTML="";for(const[a,r]of i){const s=document.createElement("div");s.className="train-row",s.innerHTML=`
        <span><b>${a}</b> — ${r} sampel</span>
        <button class="train-del" data-label="${a}">Hapus</button>
      `,s.querySelector(".train-del").addEventListener("click",()=>{var o,l;(l=(o=this.callbacks).onDeleteLabel)==null||l.call(o,a)}),n.appendChild(s)}}_toggleVoiceToSign(){if(this.isListeningVoice&&this.recognition){this._userPausedVoice=!0,this._voiceAutoRestart=!1,this.recognition.stop();return}this._userPausedVoice=!1,this.startVoiceAutoListen()}startVoiceAutoListen(){const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(!e){this._q("#sign-stage").innerHTML='<div class="sign-stage-cue">Browser ini tidak mendukung Web Speech API (SpeechRecognition).</div>';return}if(this.isListeningVoice)return;const n=this._q("#btn-voice-sign"),i=this._q("#tts-input"),a=this._q("#sign-stage"),r=new e;r.lang="id-ID",r.interimResults=!0,r.continuous=!0,r.maxAlternatives=1,this.recognition=r,this._voiceAutoRestart=!0,r.onstart=()=>{this.isListeningVoice=!0,n.classList.add("listening"),n.textContent="Stop",a.innerHTML='<div class="sign-stage-title">Mendengarkan suara...</div><div class="sign-stage-cue">Suara yang terdengar otomatis dikonversi menjadi isyarat tangan.</div>'},r.onresult=s=>{let o="",l="";for(let c=s.resultIndex;c<s.results.length;c++){const u=s.results[c][0].transcript;s.results[c].isFinal?l+=u:o+=u}const d=(l||o).trim();d&&(i.value=d),l.trim()&&this.playTextToSign(l.trim())},r.onerror=s=>{if(s.error==="no-speech")return;this._voiceAutoRestart=!1;const o=s.error==="not-allowed"?"Izin mikrofon ditolak. Aktifkan izin mic di situs ini.":`Gagal mengenali suara (${s.error}).`;a.innerHTML=`<div class="sign-stage-cue">${o}</div>`},r.onend=()=>{if(this._voiceAutoRestart)try{r.start();return}catch{this._voiceAutoRestart=!1}this.isListeningVoice=!1,n.classList.remove("listening"),n.textContent="Suara"};try{r.start()}catch{this.isListeningVoice=!1,n.classList.remove("listening"),n.textContent="Suara"}}destroy(){if(clearTimeout(this.signTimer),this.recognition){try{this.recognition.stop()}catch{}this.recognition=null}this.host&&(this.host.remove(),this.host=null),this.subtitleHost&&(this.subtitleHost.remove(),this.subtitleHost=null)}}const H={ENABLED:"isyarat_enabled",DATASET:"isyarat_knn_dataset",DATASET_VERSION:"isyarat_dataset_version"},Ci=3,Mr=1e3/16,Ni=256,Di=192;function Bi(t){if(!t||!t.getBoundingClientRect)return 0;const e=t.getBoundingClientRect();return Math.max(0,e.width)*Math.max(0,e.height)}function Cr(){const t=[],e=[];for(const n of document.querySelectorAll("video"))n.readyState>=2&&n.videoWidth>0&&n.videoHeight>0&&!n.paused&&!n.ended&&t.push(n);for(const n of document.querySelectorAll("canvas")){const i=n.getBoundingClientRect();n.width>=100&&n.height>=100&&i.width>=100&&i.height>=100&&i.width<=window.innerWidth*.92&&e.push(n)}return{videos:t,canvases:e}}function Nr(t,e){const n=[];if(t.length===1){const i=e.length>0;n.push({video:t[0],isSelf:i,label:i?"Kamera Saya (#1)":"Video #1"})}else if(t.length>1){const i=Math.max(...t.map(Bi));t.forEach((a,r)=>{let s=!1;i>2500?s=Bi(a)<i*.6:t.some(l=>!l.muted)?s=!!a.muted:s=r===0,n.push({video:a,isSelf:s,label:s?`Kamera Saya (#${r+1})`:`Lawan Bicara (#${r+1})`})})}return e.forEach((i,a)=>{n.push({video:i,isSelf:!1,isCanvas:!0,label:`Layar Call #${a+1}`})}),n.sort((i,a)=>Number(i.isSelf)-Number(a.isSelf)),n}class Dr{constructor(){this.enabled=!0,this.detectorReady=!1,this.detectorInitializing=!1,this.inFlight=!1,this.classifier=new Ui({k:5,maxDistance:1.45,minConfidence:.68}),this.stability=new Ri({windowSize:8,minConsensus:6,cooldownMs:1600,globalCooldownMs:1100,preventConsecutiveDuplicate:!0,maxMotionDelta:.22}),this.noHandFrames=0,this.ui=null,this.videoEntries=[],this.selectedVideoMode="auto",this.recognitionMode="all",this.observer=null,this.rafId=null,this.lastFrameTime=0,this.modelError=null,this.captureCanvas=document.createElement("canvas"),this.captureCanvas.width=Ni,this.captureCanvas.height=Di,this.captureCtx=this.captureCanvas.getContext("2d",{willReadFrequently:!1}),this.recording=null}async start(){var n,i;const e=await chrome.storage.local.get([H.ENABLED,H.DATASET,H.DATASET_VERSION]);this.enabled=typeof e[H.ENABLED]=="boolean"?e[H.ENABLED]:!0,((i=(n=e[H.DATASET])==null?void 0:n.samples)==null?void 0:i.length)>0&&e[H.DATASET_VERSION]===Ci?this.classifier.importDataset(e[H.DATASET],!1):await this._loadDefaultDataset(!1),this.ui=new jr({onSelectVideo:a=>{this.selectedVideoMode=a},onSelectRecognitionMode:a=>{this.recognitionMode=a,this.stability.reset()},onCycleVideo:()=>this._cycleVideoSource(),onRecordLabel:a=>this._startRecording(a),onDeleteLabel:a=>this._deleteLabel(a),onExportDataset:()=>this._exportDataset(),onImportDataset:a=>this._importDataset(a),onClearDataset:()=>this._clearDataset(),onLoadDefaultDataset:()=>this._loadDefaultDataset(!0)}),this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setVisible(this.enabled),this._listenMessages(),this._watchVideos(),this.enabled&&(await this._ensureDetector(),this._startLoop())}_listenMessages(){chrome.runtime.onMessage.addListener((e,n,i)=>e!=null&&e.type?e.type==="TOGGLE_ENABLED"?(this.setEnabled(!!e.enabled),i({ok:!0}),!0):e.type==="OPEN_QUICK_TRAIN"?(this.setEnabled(!0),this.ui.setCollapsed(!1),this.ui.switchTab("quick-train"),i({ok:!0}),!0):e.type==="GET_STATUS"?(i({ok:!0,enabled:this.enabled,videoCount:this.videoEntries.length,detectorReady:this.detectorReady,sampleCount:this.classifier.sampleCount}),!0):!1:!1)}async setEnabled(e){var n;this.enabled=e,(n=this.ui)==null||n.setVisible(e),e?(await this._ensureDetector(),this._startLoop()):this._stopLoop()}async _ensureDetector(){if(!(this.detectorReady||this.detectorInitializing)){this.detectorInitializing=!0,this.ui.setStatus("Memuat MediaPipe lokal...","warn");try{const e=await chrome.runtime.sendMessage({type:"ENSURE_OFFSCREEN"});if(!(e!=null&&e.ok))throw new Error((e==null?void 0:e.error)||"Gagal membuat offscreen engine.");const n=await chrome.runtime.sendMessage({type:"OFFSCREEN_INIT"});if(!(n!=null&&n.ok))throw new Error((n==null?void 0:n.error)||"Gagal inisialisasi HandLandmarker.");this.detectorReady=!0,this.modelError=null,this.ui.setStatus("Model lokal siap","live"),this.ui.setMeta("Menunggu video call lawan bicara...")}catch(e){this.modelError=(e==null?void 0:e.message)||String(e),this.ui.setStatus("Gagal memuat model","err"),this.ui.setMeta(`Error: ${this.modelError}`)}finally{this.detectorInitializing=!1}}}_scanVideos(){var r;const{videos:e,canvases:n}=Cr(),i=Nr(e,n),a=i.length!==this.videoEntries.length||i.some((s,o)=>{var l,d;return s.video!==((l=this.videoEntries[o])==null?void 0:l.video)||s.isSelf!==((d=this.videoEntries[o])==null?void 0:d.isSelf)});this.videoEntries=i,a&&((r=this.ui)==null||r.updateVideoOptions(this.videoEntries,this.selectedVideoMode))}_getActiveVideoEntry(){if(this.videoEntries.length===0)return null;if(this.selectedVideoMode!=="auto"){const n=Number(this.selectedVideoMode);if(this.videoEntries[n])return this.videoEntries[n]}if(this.recording){const n=this.videoEntries.find(i=>i.isSelf);if(n)return n}return this.videoEntries.find(n=>!n.isSelf)||this.videoEntries[0]}_cycleVideoSource(){var a;if(this.videoEntries.length<=1)return;const e=this._getActiveVideoEntry(),i=(this.videoEntries.indexOf(e)+1)%this.videoEntries.length;this.selectedVideoMode=String(i),(a=this.ui)==null||a.updateVideoOptions(this.videoEntries,this.selectedVideoMode)}_watchVideos(){this._scanVideos();let e=!1;this.observer=new MutationObserver(()=>{e||(e=!0,setTimeout(()=>{e=!1,this._scanVideos()},1200))}),this.observer.observe(document.documentElement,{childList:!0,subtree:!0}),setInterval(()=>this._scanVideos(),2e3)}_startLoop(){if(this.rafId!==null)return;const e=n=>{this.rafId=requestAnimationFrame(e),this.enabled&&(n-this.lastFrameTime<Mr||this.inFlight||(this.lastFrameTime=n,this._processFrame()))};this.rafId=requestAnimationFrame(e)}_stopLoop(){this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)}async _processFrame(){if(this.modelError||!this.detectorReady)return;const e=this._getActiveVideoEntry();if(this.ui.syncSubtitlePosition((e==null?void 0:e.video)||null),!e){this.ui.setStatus("Menunggu video call aktif...","warn");return}const n=this.videoEntries.indexOf(e),i=e.label||(e.isSelf?"Kamera Saya":"Lawan Bicara");this.ui.setStatus(`Aktif • ${i} (${this.videoEntries.length} sumber)`,"live"),this.ui.drawAllVideoPreviews(this.videoEntries,n,this.lastPreviewPoints);let a;try{const R=e.video.videoWidth||e.video.width||Ni,P=e.video.videoHeight||e.video.height||Di,Q=256,f=Math.min(Q/R,Q/P,1),S=Math.max(64,Math.round(R*f)),Nt=Math.max(64,Math.round(P*f));(this.captureCanvas.width!==S||this.captureCanvas.height!==Nt)&&(this.captureCanvas.width=S,this.captureCanvas.height=Nt),this.captureCtx.drawImage(e.video,0,0,S,Nt),this.ui.drawVideoPreview(e.video),a=this.captureCanvas.toDataURL("image/jpeg",.7)}catch{return}this.inFlight=!0;let r;try{r=await chrome.runtime.sendMessage({type:"OFFSCREEN_DETECT_FRAME",dataUrl:a})}catch{this.inFlight=!1;return}if(this.inFlight=!1,!(r!=null&&r.ok)||!r.vectors||r.vectors.length===0){this.lastPreviewPoints=null,this.noHandFrames++,this.noHandFrames===24&&this.ui.finalizeCurrentWord(),this.stability.push(null,Date.now(),null),this.ui.updateLivePrediction(null,0,0,0);return}this.noHandFrames=0,this.lastPreviewPoints=r.previewPoints||null;const s=r.vectors[0];if(this.recording&&this.recording.remaining>0){if(this.classifier.addSample(this.recording.label,s),this.recording.remaining--,this.recording.captured++,this.ui.setTrainStatus(`Merekam "${this.recording.label}": ${this.recording.captured}/${this.recording.total} sampel...`),this.recording.remaining===0){const R=this.recording.label,P=this.recording.captured;this.recording=null,this._saveDataset().then(()=>{this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus(`Selesai! ${P} sampel "${R}" disimpan ke chrome.storage.local.`)})}return}const o=this.recognitionMode||"all",l=this.classifier.predict(s,o),d=r.geometricSign,c=r.geometricLetter;let u=null,h=0;const y=l.latencyMs||.2;if(o==="letters")c!=null&&c.label?(u=c.label,h=c.confidence):l.label&&(u=l.label,h=l.confidence);else if(o==="words")l.label&&l.distance<=.65&&l.confidence>=.82?(u=l.label,h=l.confidence):d!=null&&d.label?(u=d.label,h=d.confidence):l.label&&(u=l.label,h=l.confidence);else{const R=new Set(["A","B","C","E","L","M","N","O","P","Q","R","S","T","U","X"]);c!=null&&c.label&&R.has(c.label)?(u=c.label,h=c.confidence):d!=null&&d.label?(u=d.label,h=d.confidence):c!=null&&c.label?(u=c.label,h=c.confidence):l.label&&(u=l.label,h=l.confidence)}const m=this.stability.push(u,Date.now(),s);this.ui.updateLivePrediction(u,h,y,m.holdProgress??0,!!m.inCooldown),m.committed&&m.stableLabel&&this.ui.appendTranscript(m.stableLabel)}_startRecording(e){const n=e.trim().toUpperCase();if(n){if(!this.detectorReady){this.ui.setTrainStatus("Model MediaPipe belum siap.");return}this.recording={label:n,remaining:15,total:15,captured:0},this.ui.setTrainStatus(`Tahan pose "${n}" di depan kamera...`)}}async _deleteLabel(e){this.classifier.removeLabel(e),await this._saveDataset(),this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus(`Label "${e}" dihapus.`)}async _clearDataset(){this.classifier.clear(),await this._saveDataset(),this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus("Semua sampel dataset telah dihapus.")}async _importDataset(e){const n=this.classifier.importDataset(e,!0);await this._saveDataset(),this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus(`Berhasil mengimpor ${n} sampel.`)}_exportDataset(){const e=this.classifier.exportDataset(),n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),i=URL.createObjectURL(n),a=document.createElement("a");a.href=i,a.download="isyarat-live-dataset.json",a.click(),setTimeout(()=>URL.revokeObjectURL(i),1e3),this.ui.setTrainStatus("Dataset diekspor sebagai isyarat-live-dataset.json.")}async _loadDefaultDataset(e=!0){try{const n=await chrome.runtime.sendMessage({type:"LOAD_DEFAULT_DATASET"});if(!(n!=null&&n.ok)||!n.dataset)throw new Error("Dataset kosong");const i=this.classifier.importDataset(n.dataset,!1);await this._saveDataset(),e&&this.ui&&(this.ui.renderDatasetList(this.classifier.getLabelCounts()),this.ui.setTrainStatus(`Dataset bawaan (${i} sampel Huruf A-Z & Kata) berhasil dimuat.`))}catch{e&&this.ui&&this.ui.setTrainStatus("Dataset bawaan tidak ditemukan.")}}async _saveDataset(){await chrome.storage.local.set({[H.DATASET]:this.classifier.exportDataset(),[H.DATASET_VERSION]:Ci})}}window.__ISYARAT_LIVE_BOOTED__||(window.__ISYARAT_LIVE_BOOTED__=!0,new Dr().start())})();
