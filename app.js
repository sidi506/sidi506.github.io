const SUPABASE_URL="https://borrohmwdpjyztpseskh.supabase.co";
const SUPABASE_KEY="sb_publishable_SmXK7FagRWi41V9vw1ns0g_eAPOFQb9";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);

const T={
ar:{title:"سوق موريتاني محلي",search:"ابحث عن منتج...",all:"الكل",allCities:"كل المدن",contact:"واتساب",map:"الخريطة",cur:"أوقية",none:"لا توجد نتائج",loading:"جارٍ التحميل...",login:"دخول",signup:"حساب جديد",logout:"خروج",email:"البريد الإلكتروني",pass:"كلمة المرور (6 أحرف على الأقل)",add:"أضف منتجاً",pname:"اسم المنتج",pdesc:"الوصف",pprice:"السعر",pplace:"الحي (اختياري)",pphone:"رقم واتساب (مثال: 22244241210)",pimg:"صورة المنتج",save:"نشر",saving:"جارٍ النشر...",del:"حذف",confirmDel:"هل تريد حذف هذا المنتج؟",errNet:"حدث خطأ، حاول مرة أخرى",errPhone:"رقم واتساب غير صحيح",checkMail:"تم إنشاء الحساب. تحقق من بريدك لتأكيده ثم سجّل الدخول.",cats:{phones:"هواتف",clothes:"ملابس",other:"أخرى"},cities:{nkc:"نواكشوط",ndb:"نواذيبو"}},
fr:{title:"Marché local mauritanien",search:"Rechercher un produit...",all:"Tout",allCities:"Toutes les villes",contact:"WhatsApp",map:"Carte",cur:"MRU",none:"Aucun résultat",loading:"Chargement...",login:"Connexion",signup:"Créer un compte",logout:"Déconnexion",email:"E-mail",pass:"Mot de passe (6 caractères min.)",add:"Ajouter un produit",pname:"Nom du produit",pdesc:"Description",pprice:"Prix",pplace:"Quartier (facultatif)",pphone:"Numéro WhatsApp (ex : 22244241210)",pimg:"Photo du produit",save:"Publier",saving:"Publication...",del:"Supprimer",confirmDel:"Supprimer ce produit ?",errNet:"Une erreur est survenue, réessayez",errPhone:"Numéro WhatsApp invalide",checkMail:"Compte créé. Vérifiez votre e-mail pour le confirmer, puis connectez-vous.",cats:{phones:"Téléphones",clothes:"Vêtements",other:"Autres"},cities:{nkc:"Nouakchott",ndb:"Nouadhibou"}},
en:{title:"Mauritanian Local Market",search:"Search a product...",all:"All",allCities:"All cities",contact:"WhatsApp",map:"Map",cur:"MRU",none:"No results",loading:"Loading...",login:"Log in",signup:"Sign up",logout:"Log out",email:"Email",pass:"Password (min. 6 characters)",add:"Add a product",pname:"Product name",pdesc:"Description",pprice:"Price",pplace:"Area (optional)",pphone:"WhatsApp number (e.g. 22244241210)",pimg:"Product photo",save:"Publish",saving:"Publishing...",del:"Delete",confirmDel:"Delete this product?",errNet:"Something went wrong, try again",errPhone:"Invalid WhatsApp number",checkMail:"Account created. Check your email to confirm it, then log in.",cats:{phones:"Phones",clothes:"Clothes",other:"Other"},cities:{nkc:"Nouakchott",ndb:"Nouadhibou"}}
};

let lang="ar",cat="all",city="all",products=null,user=null,isAdmin=false;
try{lang=localStorage.getItem("lang")||"ar"}catch(e){}
if(!T[lang])lang="ar";

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}



function card(p,storeTheme){

const t=T[lang];
const img=p.image_url?`<img src="${esc(p.image_url)}" alt="" loading="lazy">`:"";
const cn=t.cities[p.city]||"";
const where=cn+(p.place?(cn?" - ":"")+p.place:"");
const mine=user&&p.user_id===user.id?`<button class="del" onclick="event.stopPropagation();delProduct('${esc(p.id)}')">${t.del}</button>`:"";

const primary=storeTheme?.primary;
const accent=storeTheme?.accent;

const style=primary?
`style="border:1px solid ${accent};background:linear-gradient(180deg,${accent}12,transparent);"`:"";

const titleStyle=primary?`style="color:${primary}"`:"";
const priceStyle=primary?`style="color:${primary};"`:"";

return `<div class="item" ${style} onclick="openProduct('${esc(p.id)}')">
${img}
<h3 ${titleStyle}>${esc(p.title)}</h3>
<div class="price" ${priceStyle}>${esc(p.price)} ${t.cur}</div>
<div class="place">📍 ${esc(where)}</div>
${mine}
</div>`;
}


window.showProductImage=function(direction){
const images=window.productImages;
if(!images||!images.length)return;

window.productImageIndex=(window.productImageIndex+direction+images.length)%images.length;

$("productMainImage").src=images[window.productImageIndex];
$("productImageCount").textContent=(window.productImageIndex+1)+" / "+images.length;
};

window.openProduct=async function(id){

const p=products?.find(x=>String(x.id)===String(id));
if(!p)return;

const t=T[lang];
const cn=t.cities[p.city]||"";
const where=cn+(p.place?(cn?" - ":"")+p.place:"");
const cityEn=T.en.cities[p.city]||"";

const mapUrl="https://www.google.com/maps/search/?api=1&query="+
encodeURIComponent((p.place?p.place+" ":"")+cityEn+" Mauritania");

const phone=String(p.phone||"").replace(/\D/g,"");
const storeResult=await sb.from("seller_stores")
.select("id")
.eq("user_id",p.user_id)
.eq("is_published",true)
.maybeSingle();

const storeButton=storeResult.data?
`<button class="btn" onclick="openStore('${esc(storeResult.data.id)}')">
🏪 زيارة متجر البائع
</button>`:"";
  
const images=Array.isArray(p.image_urls)&&p.image_urls.length
?p.image_urls.filter(Boolean)
:(p.image_url?[p.image_url]:[]);

window.productImages=images;
window.productImageIndex=0;

const gallery=images.length?`
<div style="text-align:center">
<img id="productMainImage"
src="${esc(images[0])}"
alt="${esc(p.title)}"
style="width:100%;max-height:300px;object-fit:contain;border-radius:12px">

${images.length>1?`
<div style="display:flex;justify-content:center;align-items:center;gap:20px;margin:12px">
<button onclick="showProductImage(-1)">❮</button>
<span id="productImageCount">1 / ${images.length}</span>
<button onclick="showProductImage(1)">❯</button>
</div>`:""}

</div>`:"";

$("modalbody").innerHTML=`
<div class="product-details">

${gallery}

<h2>${esc(p.title)}</h2>

<p>${esc(p.description||"")}</p>

<div class="price">${esc(p.price)} ${t.cur}</div>

<div class="place">📍 ${esc(where)}</div>

${phone?`
<a class="btn" target="_blank" rel="noopener"
href="https://wa.me/${phone}">${t.contact}</a>`:""}

<a class="btn map" target="_blank" rel="noopener"
href="${mapUrl}">${t.map}</a>

</div>`;

$("modal").style.display="block";
};

  




async function openAdmin(){
if(!isAdmin)return;

$("list").innerHTML=`
<div style="padding:20px">
<h2>👑 لوحة تحكم المدير</h2>
<p>مرحباً بك في إدارة المرصة</p>
<div id="adminStats">جارٍ تحميل الإحصائيات...</div>
</div>
`;

const r=await sb.rpc("admin_dashboard_stats");

if(r.error){
$("adminStats").textContent="تعذر تحميل الإحصائيات: "+r.error.message;
return;
}

const s=r.data[0];

$("adminStats").innerHTML=`
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">

<div onclick="adminShowStores()" style="cursor:pointer;padding:18px;background:#fff3e0;border-radius:12px">
<h3>🏪 المتاجر</h3>
<strong>${s.stores_count}</strong>
<p>اضغط لعرض المتاجر ←</p>
</div>

<div onclick="adminShowUsers()" style="cursor:pointer;padding:18px;background:#e8f5e9;border-radius:12px">
<h3>👥 المستخدمون</h3>
<strong>${s.users_count}</strong>
<p>اضغط لعرض المسجلين ←</p>
</div>

<div onclick="adminShowProducts()" style="cursor:pointer;padding:18px;background:#e3f2fd;border-radius:12px">
<h3>📦 المنتجات</h3>
<strong>${s.products_count}</strong>
<p>اضغط لإدارة المنتجات ←</p>
</div>

</div>
`;
  }


window.openAdmin=openAdmin;

window.adminShowUsers=async function(){
if(!isAdmin)return;

$("list").innerHTML=`
<div style="padding:20px">
<h2>👥 المستخدمون المسجلون</h2>
<p>جارٍ تحميل المستخدمين...</p>
</div>
`;

const r=await sb.rpc("admin_list_users");

if(r.error){
$("list").innerHTML=`
<div style="padding:20px">
<p>تعذر تحميل المستخدمين: ${esc(r.error.message)}</p>
<button onclick="openAdmin()">عودة</button>
</div>`;
return;
}

const users=r.data||[];

$("list").innerHTML=`
<div style="padding:20px">
<button onclick="openAdmin()">⬅ العودة للوحة المدير</button>
<h2>👥 المستخدمون (${users.length})</h2>
${users.length?users.map(u=>`
<div style="padding:14px;margin:10px 0;background:#e8f5e9;border-radius:10px;direction:ltr;text-align:left">
<strong>${esc(u.email||"بدون بريد")}</strong>
<p>تاريخ التسجيل: ${esc(u.created_at||"")}</p>
</div>
`).join(""):'<p>لا يوجد مستخدمون</p>'}
</div>
`;
};

window.adminShowProducts=async function(){
if(!isAdmin)return;

$("list").innerHTML=`
<div style="padding:20px">
<h2>📦 إدارة المنتجات</h2>
<p>جارٍ تحميل المنتجات...</p>
</div>
`;

const r=await sb.from("products")
.select("*")
.order("created_at",{ascending:false})
.limit(200);

if(r.error){
$("list").innerHTML=`
<div style="padding:20px">
<p>تعذر تحميل المنتجات: ${esc(r.error.message)}</p>
<button onclick="openAdmin()">عودة</button>
</div>`;
return;
}

const items=r.data||[];

$("list").innerHTML=`
<div style="padding:20px">
<button onclick="openAdmin()">⬅ العودة للوحة المدير</button>
<h2>📦 المنتجات (${items.length})</h2>

${items.length?items.map(p=>`
<div style="padding:14px;margin:12px 0;background:#e3f2fd;border-radius:12px">
${p.image_url?`<img src="${esc(p.image_url)}" style="width:90px;height:90px;object-fit:cover;border-radius:8px">`:""}
<h3>${esc(p.title)}</h3>
<p>${esc(p.price)} أوقية</p>
<p>${esc(p.description||"")}</p>
<button onclick="openProduct('${esc(p.id)}')">عرض التفاصيل</button>
<button style="background:#b71c1c;color:white" onclick="adminDeleteProduct('${esc(p.id)}')">حذف المنتج</button>
</div>
`).join(""):'<p>لا توجد منتجات</p>'}
</div>
`;
};
window.adminShowStores=async function(){
if(!isAdmin)return;

$("list").innerHTML=`
<div style="padding:20px">
<h2>🏪 المتاجر المسجلة</h2>
<p>جارٍ تحميل المتاجر...</p>
</div>
`;

const r=await sb.from("seller_stores")
.select("*")
.order("created_at",{ascending:false})
.limit(200);

if(r.error){
$("list").innerHTML=`
<div style="padding:20px">
<p>تعذر تحميل المتاجر: ${esc(r.error.message)}</p>
<button onclick="openAdmin()">⬅ العودة</button>
</div>`;
return;
}

const items=r.data||[];

$("list").innerHTML=`
<div style="padding:20px">
<button onclick="openAdmin()">⬅ العودة للوحة المدير</button>
<h2>🏪 المتاجر (${items.length})</h2>

${items.length?items.map(s=>`
<div style="padding:14px;margin:12px 0;background:#fff3e0;border-radius:12px">
${s.logo_url?`<img src="${esc(s.logo_url)}" style="width:75px;height:75px;object-fit:cover;border-radius:10px">`:""}
<h3>${esc(s.store_name)}</h3>
<p>📍 ${esc(T.ar.cities[s.city]||s.city||"")}</p>
<p>${s.is_published?"🟢 منشور":"⚪ غير منشور"}</p>
<p>${s.is_featured?"⭐ متجر مميز":"متجر عادي"}</p>
</div>
`).join(""):'<p>لا توجد متاجر مسجلة</p>'}
</div>
`;
};

window.adminDeleteProduct=async function(id){
if(!isAdmin)return;
if(!confirm("هل تريد حذف هذا المنتج نهائياً؟"))return;

const r=await sb.from("products").delete().eq("id",id);

if(r.error){
alert("تعذر حذف المنتج: "+r.error.message);
return;
}

await loadProducts();
adminShowProducts();
};



function renderUser(){
const t=T[lang];

$("acct").innerHTML=user?
`
${isAdmin?'<span style="background:#d4edda;color:#155724;padding:7px 12px;border-radius:20px;font-weight:bold">👑 المدير</span><button onclick="openAdmin()">لوحة التحكم</button>':""}
<button onclick="openMyStore()">🏪 متجري</button>
<button onclick="openModal()">${t.add}</button>
<button onclick="logout()">${t.logout}</button>
`:
`<button onclick="openModal()">${t.login}</button>`;
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
<input name="pimages" type="file" accept="image/*" multiple>
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

const files=Array.from(f.elements["pimages"].files);
if(files.length>5){
$("note").textContent="الحد الأقصى 5 صور";
return;
}

const btn=f.querySelector("button");
btn.disabled=true;
btn.textContent=t.saving;

try{
const image_urls=[];

for(let i=0;i<files.length;i++){
const blob=await resize(files[i]);
const path=user.id+"/"+Date.now()+"-"+i+".jpg";

const up=await sb.storage.from("product-images").upload(
path,blob,{contentType:"image/jpeg"}
);
if(up.error)throw up.error;

const url=sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;
image_urls.push(url);
}

const ins=await sb.from("products").insert({
title:g("ptitle").trim(),
description:g("pdesc").trim(),
price:Number(g("pprice")),
category:g("pcat"),
city:g("pcity"),
place:g("pplace").trim(),
phone:phone,
image_url:image_urls[0]||null,
image_urls:image_urls
});

if(ins.error)throw ins.error;

closeModal();
await loadProducts();

}catch(e){
$("note").textContent=t.errNet+" ("+(e.message||"")+")";
btn.disabled=false;
btn.textContent=t.save;
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


async function checkAdmin(){
isAdmin=false;
if(!user)return;

const r=await sb.from("user_roles")
.select("user_id")
.eq("user_id",user.id)
.maybeSingle();

isAdmin=!r.error&&!!r.data;
render();
  renderStores();
}

sb.auth.onAuthStateChange((e,s)=>{
user=s?s.user:null;
  checkAdmin();
render();
if($("modal").style.display==="block")renderModal();
});

render();
loadProducts();

// ===== نظام المتاجر =====

let stores = [];

function storeCard(s){
const t=T[lang];
const cn=t.cities[s.city]||s.city||"";
const logo=s.logo_url
?`<img src="${esc(s.logo_url)}" alt="">`
:`<div class="store-logo">🏬</div>`;

const featureButton=isAdmin
?`<button onclick="event.stopPropagation();toggleFeaturedStore('${esc(s.id)}',${!s.is_featured})">
${s.is_featured?"⭐ إزالة التمييز":"☆ تمييز المتجر"}
</button>`
:"";

return `
<div class="store-card" onclick="openStore('${esc(s.id)}')" style="cursor:pointer">
${logo}
<h3>${esc(s.store_name)}</h3>
<p>📍 ${esc(cn)}</p>
${isAdmin?`<div>${featureButton}</div>`:""}
</div>`;
}

function renderStores(){
const box=$("storesList");
if(!box)return;

if(!stores.length){
box.innerHTML='<p class="msg">لا توجد متاجر منشورة حالياً</p>';
return;
}

const featured=stores.filter(s=>s.is_featured);
const normal=stores.filter(s=>!s.is_featured);

box.innerHTML=[...featured,...normal]
.slice(0,8)
.map(storeCard)
.join("");
}

async function loadStores(){
const r=await sb.from("seller_stores")
.select("*")
.eq("is_published",true)
.order("created_at",{ascending:false})
.limit(100);

stores=r.error?[]:r.data;
renderStores();
}


window.openStore=async function(id){

const s=typeof id==="object"?id:stores.find(x=>String(x.id)===String(id));
if(!s)return;

const primary=/^#[0-9a-fA-F]{6}$/.test(s.theme_color||"")
?s.theme_color:"#0a7d3b";

const accent=/^#[0-9a-fA-F]{6}$/.test(s.accent_color||"")
?s.accent_color:"#d6ad4b";

$("modalbody").innerHTML=`
<div style="text-align:center;padding:12px">
<p>جارٍ تحميل المتجر...</p>
</div>`;

$("modal").style.display="flex";

const r=await sb.from("products")
.select("*")
.eq("user_id",s.user_id)
.order("created_at",{ascending:false})
.limit(100);

if(r.error){
$("modalbody").innerHTML=`
<h2>${esc(s.store_name)}</h2>
<p>تعذر تحميل منتجات المتجر.</p>
<button onclick="closeModal()">إغلاق</button>`;
return;
}

const items=r.data||[];

if(!Array.isArray(products))products=[];

items.forEach(p=>{
if(!products.some(x=>String(x.id)===String(p.id))){
products.push(p);
}
});

const cover=s.cover_url
?`<img src="${esc(s.cover_url)}" style="width:100%;height:160px;object-fit:cover;border-radius:12px">`
:"";

const logo=s.logo_url
?`<img src="${esc(s.logo_url)}" style="width:90px;height:90px;object-fit:cover;border-radius:50%;border:4px solid ${accent};margin-top:-45px;background:white">`
:`<div style="font-size:55px;margin-top:-40px">🏬</div>`;

const phone=String(s.phone||"").replace(/\D/g,"");

$("modalbody").innerHTML=`
<div style="padding:12px;--store-primary:${primary};--store-accent:${accent}">

${cover}

<div style="text-align:center">
${logo}

<h2 style="color:${primary}">${esc(s.store_name)}</h2>

<p>${esc(s.description||"")}</p>

<p>📍 ${esc(T[lang].cities[s.city]||s.city||"")}</p>

${phone?`<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${phone}" style="background:${primary}">واتساب المتجر</a>`:""}
</div>

<hr style="border:0;border-top:2px solid ${accent};margin:18px 0">

<h3 style="color:${primary}">🛍️ منتجات المتجر (${items.length})</h3>

<div class="products-grid">
${items.length?items.map(p=>card(p,{primary,accent})).join(""):'<p class="msg">لا توجد منتجات في هذا المتجر حالياً</p>'}
</div>

<button onclick="closeModal()" style="margin-top:15px;background:${primary}">إغلاق المتجر</button>

</div>`;
};


window.showAllStores=function(){
if(!stores.length)return;

$("modalbody").innerHTML=`
<h2>جميع المتاجر</h2>
<div class="all-stores">
${stores.map(storeCard).join("")}
</div>`;

$("modal").style.display="block";
};

window.toggleFeaturedStore=async function(id,featured){

if(!isAdmin){
alert("ليس لديك صلاحية تنفيذ هذا الإجراء");
return;
}

const r=await sb.from("seller_stores")
.update({is_featured:featured})
.eq("id",id)
.select();

if(r.error){
alert("تعذر تحديث المتجر: "+r.error.message);
return;
}

if(!r.data||!r.data.length){
alert("لم يتم تحديث المتجر");
return;
}

await loadStores();

alert(featured?"تم تمييز المتجر بنجاح ⭐":"تم إلغاء تمييز المتجر");
};

window.openMyStore = async function(){

if(!user){
alert("يجب تسجيل الدخول أولاً");
return;
}

$("modalbody").innerHTML=`
<div style="padding:15px;text-align:center">
<p>جارٍ تحميل بيانات متجرك...</p>
</div>`;

$("modal").style.display="flex";

const r=await sb.from("seller_stores")
.select("*")
.eq("user_id",user.id)
.maybeSingle();

if(r.error){
$("modalbody").innerHTML=`
<p>تعذر تحميل المتجر: ${esc(r.error.message)}</p>
<button onclick="closeModal()">إغلاق</button>`;
return;
}

if(r.data){
window.editMyStore(r.data);
}else{
window.showCreateStore();
}

};


window.showCreateStore = function(){

$("modalbody").innerHTML=`
<div style="padding:15px">
<h2>🏪 إنشاء متجري</h2>

<form onsubmit="saveMyStore(event)">

<label>اسم المتجر</label>
<input name="store_name" maxlength="80" required placeholder="مثلاً: متجر آبو">

<label>رابط المتجر المختصر</label>
<input name="slug" maxlength="50" placeholder="abou-store">

<label>وصف المتجر</label>
<textarea name="description" maxlength="500" placeholder="عرّف الزبائن بمتجرك"></textarea>

<label>رقم واتساب</label>
<input name="phone" type="tel" placeholder="222XXXXXXXX">

<label>المدينة</label>
<select name="city" required>
<option value="nkc">نواكشوط</option>
<option value="ndb">نواذيبو</option>
</select>

<hr>
<h3>🎨 هوية المتجر</h3>

<label>شعار المتجر</label>
<input name="store_logo" type="file" accept="image/*">

<label>صورة غلاف المتجر</label>
<input name="store_cover" type="file" accept="image/*">

<button type="submit">إنشاء المتجر</button>
<button type="button" onclick="closeModal()">إلغاء</button>

</form>
<div id="storeNote" class="note"></div>
</div>
`;

};


window.uploadStoreImage = async function(file,kind){

if(!file)return null;

const blob=await resize(file);
const path=user.id+"/store-"+kind+"-"+Date.now()+".jpg";

const up=await sb.storage.from("product-images").upload(
path,blob,
{contentType:"image/jpeg",upsert:true}
);

if(up.error)throw up.error;

return sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;

};

  

window.saveMyStore = async function(ev){

ev.preventDefault();

if(!user){
alert("يجب تسجيل الدخول أولاً");
return;
}

const f=ev.target;
const g=n=>f.elements[n].value.trim();

const name=g("store_name");
const rawSlug=g("slug");

const slug=rawSlug
.toLowerCase()
.replace(/[^a-z0-9-]+/g,"-")
.replace(/^-|-$/g,"") || "store-"+user.id.slice(0,8);

const btn=f.querySelector('button[type="submit"]');
btn.disabled=true;
btn.textContent="جارٍ رفع الصور وإنشاء المتجر...";

try{

const logo=await uploadStoreImage(
f.elements["store_logo"].files[0],"logo"
);

const cover=await uploadStoreImage(
f.elements["store_cover"].files[0],"cover"
);

const r=await sb.from("seller_stores").insert({
user_id:user.id,
store_name:name,
slug:slug,
description:g("description"),
phone:g("phone"),
city:g("city"),
logo_url:logo,
cover_url:cover,
is_published:false,
is_featured:false
});

if(r.error)throw r.error;

$("modalbody").innerHTML=`
<div style="padding:20px;text-align:center">
<h2>🎉 تم إنشاء متجرك!</h2>
<p>تم حفظ بيانات المتجر وصوره، وينتظر النشر ليظهر للزوار.</p>
<button onclick="closeModal()">حسناً</button>
</div>`;

}catch(e){

$("storeNote").textContent="تعذر إنشاء المتجر: "+e.message;
btn.disabled=false;
btn.textContent="إنشاء المتجر";

}

};

  

window.editMyStore = function(s){

$("modalbody").innerHTML=`
<div style="padding:15px">
<h2>🏪 تعديل متجري</h2>

<form onsubmit="updateMyStore(event,'${esc(s.id)}')">

<label>اسم المتجر</label>
<input name="store_name" maxlength="80" required value="${esc(s.store_name)}">

<label>رابط المتجر المختصر</label>
<input name="slug" maxlength="50" value="${esc(s.slug||"")}">

<label>وصف المتجر</label>
<textarea name="description" maxlength="500">${esc(s.description||"")}</textarea>

<label>رقم واتساب</label>
<input name="phone" type="tel" value="${esc(s.phone||"")}">

<label>المدينة</label>
<select name="city">
<option value="nkc" ${s.city==="nkc"?"selected":""}>نواكشوط</option>
<option value="ndb" ${s.city==="ndb"?"selected":""}>نواذيبو</option>
</select>

<hr>
<h3>🎨 ألوان وهوية المتجر</h3>

<label>اللون الأساسي</label>
<input name="theme_color" type="color" value="${esc(s.theme_color||"#0a7d3b")}">

<label>اللون الثانوي</label>
<input name="accent_color" type="color" value="${esc(s.accent_color||"#d6ad4b")}">


<hr>
<h3>🎨 هوية المتجر</h3>

<label>الشعار الحالي</label>
${s.logo_url?`<img src="${esc(s.logo_url)}" style="width:90px;height:90px;object-fit:cover;border-radius:12px">`:"<p>لا يوجد شعار حالياً</p>"}

<label>تغيير الشعار</label>
<input name="store_logo" type="file" accept="image/*">

<label>صورة الغلاف الحالية</label>
${s.cover_url?`<img src="${esc(s.cover_url)}" style="width:100%;max-height:130px;object-fit:cover;border-radius:12px">`:"<p>لا توجد صورة غلاف حالياً</p>"}

<label>تغيير صورة الغلاف</label>
<input name="store_cover" type="file" accept="image/*">

<p>${s.is_published?"🟢 المتجر منشور":"⚪ المتجر غير منشور"}</p>

<button type="button" onclick='openStore(${JSON.stringify(s).replace(/'/g,"&#39;")})'>
👁️ معاينة متجري
</button>
<button type="submit">حفظ التعديلات</button>
<button type="button" onclick="closeModal()">إلغاء</button>

</form>
<div id="storeNote" class="note"></div>
</div>
`;

};



window.updateMyStore = async function(ev,id){

ev.preventDefault();

if(!user)return;

const f=ev.target;
const g=n=>f.elements[n].value.trim();

const rawSlug=g("slug");
const slug=rawSlug
.toLowerCase()
.replace(/[^a-z0-9-]+/g,"-")
.replace(/^-|-$/g,"") || "store-"+user.id.slice(0,8);

const btn=f.querySelector('button[type="submit"]');
btn.disabled=true;
btn.textContent="جارٍ رفع الصور وحفظ التعديلات...";

try{

const old=await sb.from("seller_stores")
.select("logo_url,cover_url")
.eq("id",id)
.eq("user_id",user.id)
.single();

if(old.error)throw old.error;

let logo=old.data.logo_url;
let cover=old.data.cover_url;

const logoFile=f.elements["store_logo"].files[0];
const coverFile=f.elements["store_cover"].files[0];

if(logoFile){
logo=await uploadStoreImage(logoFile,"logo");
}

if(coverFile){
cover=await uploadStoreImage(coverFile,"cover");
}

const r=await sb.from("seller_stores")
.update({
store_name:g("store_name"),
slug:slug,
description:g("description"),
phone:g("phone"),
city:g("city"),
  theme_color:g("theme_color"),
accent_color:g("accent_color"),
logo_url:logo,
cover_url:cover,
updated_at:new Date().toISOString()
})
.eq("id",id)
.eq("user_id",user.id)
.select();

if(r.error)throw r.error;

if(!r.data||!r.data.length){
throw new Error("لم يتم تحديث المتجر. تحقق من الصلاحيات.");
}

$("modalbody").innerHTML=`
<div style="padding:20px;text-align:center">
<h2>✅ تم تحديث متجرك</h2>
<p>تم حفظ البيانات والصور بنجاح.</p>
<button onclick="closeModal()">حسناً</button>
</div>`;

}catch(e){

$("storeNote").textContent="تعذر حفظ التعديلات: "+e.message;
btn.disabled=false;
btn.textContent="حفظ التعديلات";

}

};
  



// ===== نهاية نظام المتاجر =====

loadStores();
// END
  
