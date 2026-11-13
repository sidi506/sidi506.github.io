const SUPABASE_URL="https://borrohmwdpjyztpseskh.supabase.co";
const SUPABASE_KEY="sb_publishable_SmXK7FagRWi41V9vw1ns0g_eAPOFQb9";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);

const T={
ar:{title:"سوق موريتاني محلي",search:"ابحث عن منتج...",all:"الكل",allCities:"كل المدن",contact:"واتساب",map:"الخريطة",cur:"أوقية",none:"لا توجد نتائج",loading:"جارٍ التحميل...",login:"دخول",signup:"حساب جديد",logout:"خروج",email:"البريد الإلكتروني",pass:"كلمة المرور (6 أحرف على الأقل)",add:"أضف منتجاً",pname:"اسم المنتج",pdesc:"الوصف",pprice:"السعر",pplace:"الحي (اختياري)",pphone:"رقم واتساب (مثال: 22244241210)",pimg:"صورة المنتج",save:"نشر",saving:"جارٍ النشر...",del:"حذف",confirmDel:"هل تريد حذف هذا المنتج؟",errNet:"حدث خطأ، حاول مرة أخرى",errPhone:"رقم واتساب غير صحيح",checkMail:"تم إنشاء الحساب. تحقق من بريدك لتأكيده ثم سجّل الدخول.",cats:{phones:"هواتف",clothes:"ملابس",other:"أخرى"},cities:{nkc:"نواكشوط",ndb:"نواذيبو"}},
fr:{title:"Marché local mauritanien",search:"Rechercher un produit...",all:"Tout",allCities:"Toutes les villes",contact:"WhatsApp",map:"Carte",cur:"MRU",none:"Aucun résultat",loading:"Chargement...",login:"Connexion",signup:"Créer un compte",logout:"Déconnexion",email:"E-mail",pass:"Mot de passe (6 caractères min.)",add:"Ajouter un produit",pname:"Nom du produit",pdesc:"Description",pprice:"Prix",pplace:"Quartier (facultatif)",pphone:"Numéro WhatsApp (ex : 22244241210)",pimg:"Photo du produit",save:"Publier",saving:"Publication...",del:"Supprimer",confirmDel:"Supprimer ce produit ?",errNet:"Une erreur est survenue, réessayez",errPhone:"Numéro WhatsApp invalide",checkMail:"Compte créé. Vérifiez votre e-mail pour le confirmer, puis connectez-vous.",cats:{phones:"Téléphones",clothes:"Vêtements",other:"Autres"},cities:{nkc:"Nouakchott",ndb:"Nouadhibou"}},
en:{title:"Mauritanian Local Market",search:"Search a product...",all:"All",allCities:"All cities",contact:"WhatsApp",map:"Map",cur:"MRU",none:"No results",loading:"Loading...",login:"Log in",signup:"Sign up",logout:"Log out",email:"Email",pass:"Password (min. 6 characters)",add:"Add a product",pname:"Product name",pdesc:"Description",pprice:"Price",pplace:"Area (optional)",pphone:"WhatsApp number (e.g. 22244241210)",pimg:"Product photo",save:"Publish",saving:"Publishing...",del:"Delete",confirmDel:"Delete this product?",errNet:"Something went wrong, try again",errPhone:"Invalid WhatsApp number",checkMail:"Account created. Check your email to confirm it, then log in.",cats:{phones:"Phones",clothes:"Clothes",other:"Other"},cities:{nkc:"Nouakchott",ndb:"Nouadhibou"}}
};

let lang="ar",cat="all",city="all",products=null,user=null;
try{lang=localStorage.getItem("lang")||"ar"}catch(e){}
if(!T[lang])lang="ar";

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function card(p){
const t=T[lang];
const img=p.image_url?`<img src="${esc(p.image_url)}" alt="" loading="lazy">`:"";
const cn=t.cities[p.city]||"";
const where=cn+(p.place?(cn?" - ":"")+p.place:"");
const cityEn=T.en.cities[p.city]||"";
const mapUrl="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent((p.place?p.place+" ":"")+cityEn+" Mauritania");
const phone=String(p.phone||"").replace(/\D/g,"");
const mine=user&&p.user_id===user.id?`<button class="del" onclick="delProduct('${esc(p.id)}')">${t.del}</button>`:"";
return `<div class="item">${img}<h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="price">${esc(p.price)} ${t.cur}</div><div class="place">📍 ${esc(where)}</div><a class="btn" href="https://wa.me/${phone}">${t.contact}</a><a class="btn map" href="${mapUrl}">${t.map}</a>${mine}</div>`;
}

function renderUser(){
const t=T[lang];
$("acct").innerHTML=user?`<button onclick="openModal()">${t.add}</button><button onclick="logout()">${t.logout}</button>`:`<button onclick="openModal()">${t.login}</button>`;
}

function render(){
const t=T[lang];
document.documentElement.lang=lang;
document.documentElement.dir=lang==="ar"?"rtl":"ltr";
$("title").textContent=t.title;
$("search").placeholder=t.search;
const q=$("search").value.toLowerCase();
$("city").innerHTML=["all",...Object.keys(t.cities)].map(c=>`<option value="${c}" ${c===city?"selected":""}>${c==="all"?t.allCities:t.cities[c]}</option>`).join("");
$("cats").innerHTML=["all",...Object.keys(t.cats)].map(c=>`<button class="${c===cat?"on":""}" onclick="setCat('${c}')">${c==="all"?t.all:t.cats[c]}</button>`).join("");
renderUser();
if(products===null){$("list").innerHTML=`<p class="msg">${t.loading}</p>`;return}
const list=products.filter(p=>(cat==="all"||p.category===cat)&&(city==="all"||p.city===city)&&((p.title||"")+" "+(p.description||"")+" "+(p.place||"")).toLowerCase().includes(q));
$("list").innerHTML=list.length?list.map(card).join(""):`<p class="msg">${t.none}</p>`;
}

function renderModal(){
const t=T[lang];
const opts=o=>Object.keys(o).map(k=>`<option value="${k}">${o[k]}</option>`).join("");
$("modalbody").innerHTML=user?
`<h2>${t.add}</h2><form onsubmit="addProduct(event)">
<input name="ptitle" placeholder="${t.pname}" maxlength="100" required>
<textarea name="pdesc" placeholder="${t.pdesc}" maxlength="500"></textarea>
<input name="pprice" type="number" min="0" step="any" placeholder="${t.pprice}" required>
<select name="pcat">${opts(t.cats)}</select>
<select name="pcity">${opts(t.cities)}</select>
<input name="pplace" placeholder="${t.pplace}" maxlength="60">
<input name="pphone" type="tel" placeholder="${t.pphone}" required>
<label>${t.pimg}</label>
<input name="pimage" type="file" accept="image/*">
<button type="submit">${t.save}</button></form><div id="note" class="note"></div>`
:
`<h2>${t.login}</h2>
<input id="aemail" type="email" placeholder="${t.email}">
<input id="apass" type="password" placeholder="${t.pass}">
<button onclick="authAct('login')">${t.login}</button>
<button class="alt" onclick="authAct('signup')">${t.signup}</button>
<div id="note" class="note"></div>`;
}

function openModal(){$("modal").style.display="block";renderModal()}
function closeModal(){$("modal").style.display="none"}
function setCat(c){cat=c;render()}
function setCity(c){city=c;render()}
function setLang(l){lang=l;try{localStorage.setItem("lang",l)}catch(e){}render();if($("modal").style.display==="block")renderModal()}

async function authAct(mode){
const t=T[lang];
const email=$("aemail").value.trim(),password=$("apass").value;
$("note").textContent="...";
const r=mode==="signup"?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});
if(r.error){$("note").textContent=r.error.message;return}
if(mode==="signup"&&!r.data.session){$("note").textContent=t.checkMail}
}

async function logout(){await sb.auth.signOut();closeModal()}

function resize(file){
return new Promise((ok,fail)=>{
const img=new Image();
img.onload=()=>{
const k=Math.min(1,800/Math.max(img.width,img.height));
const c=document.createElement("canvas");
c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
c.getContext("2d").drawImage(img,0,0,c.width,c.height);
c.toBlob(b=>b?ok(b):fail(new Error("image")),"image/jpeg",0.7);
};
img.onerror=()=>fail(new Error("image"));
img.src=URL.createObjectURL(file);
});
}

async function addProduct(ev){
ev.preventDefault();
const t=T[lang];
const f=ev.target;
const g=n=>f.elements[n].value;
const phone=g("pphone").replace(/\D/g,"");
if(phone.length<8){$("note").textContent=t.errPhone;return}
const btn=f.querySelector("button");
btn.disabled=true;btn.textContent=t.saving;
try{
let image_url=null;
const file=f.elements["pimage"].files[0];
if(file){
const blob=await resize(file);
const path=user.id+"/"+Date.now()+".jpg";
const up=await sb.storage.from("product-images").upload(path,blob,{contentType:"image/jpeg"});
if(up.error)throw up.error;
image_url=sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
const ins=await sb.from("products").insert({title:g("ptitle").trim(),description:g("pdesc").trim(),price:Number(g("pprice")),category:g("pcat"),city:g("pcity"),place:g("pplace").trim(),phone:phone,image_url:image_url});
if(ins.error)throw ins.error;
closeModal();
await loadProducts();
}catch(e){
$("note").textContent=t.errNet+" ("+(e.message||"")+")";
btn.disabled=false;btn.textContent=t.save;
}
}

async function delProduct(id){
if(!confirm(T[lang].confirmDel))return;
const p=products.find(x=>x.id===id);
const r=await sb.from("products").delete().eq("id",id);
if(r.error)return;
if(p&&p.image_url){
const i=p.image_url.indexOf("/product-images/");
if(i>=0)await sb.storage.from("product-images").remove([decodeURIComponent(p.image_url.slice(i+16))]);
}
loadProducts();
}

async function loadProducts(){
const r=await sb.from("products").select("*").order("created_at",{ascending:false}).limit(100);
products=r.error?[]:r.data;
render();
}

sb.auth.onAuthStateChange((e,s)=>{
user=s?s.user:null;
render();
if($("modal").style.display==="block")renderModal();
});

render();
loadProducts();
// END
