(function(){
var E={
ar:{edit:"تعديل",title:"تعديل المنتج",keep:"اترك خانة الصورة فارغة للإبقاء على الصورة الحالية",save:"حفظ التعديلات",saving:"جارٍ الحفظ...",noperm:"لا تملك صلاحية تعديل هذا المنتج"},
fr:{edit:"Modifier",title:"Modifier le produit",keep:"Laissez vide pour garder la photo actuelle",save:"Enregistrer",saving:"Enregistrement...",noperm:"Vous n'avez pas l'autorisation de modifier ce produit"},
en:{edit:"Edit",title:"Edit product",keep:"Leave empty to keep the current photo",save:"Save changes",saving:"Saving...",noperm:"You do not have permission to edit this product"}
};
var editingId=null;
var _card=window.card,_rm=window.renderModal,_om=window.openModal,_cm=window.closeModal;

var st=document.createElement("style");
st.textContent=".edit{display:block;width:100%;margin:8px 0 0;background:#e8f0fe;color:#1a56c4;border:1px solid #c5d6f5;padding:10px 12px;border-radius:12px;font-weight:bold;font-size:14px}.box h2{margin:0 0 8px;font-size:18px;color:#07672f}";
document.head.appendChild(st);

function tx(){return E[lang]||E.ar;}

window.card=function(p){
var h=_card(p);
if(user&&p.user_id===user.id){
var b='<button class="edit" onclick="event.stopPropagation();editProduct(\''+esc(p.id)+'\')">'+tx().edit+'</button>';
h=h.replace('<button class="del"',function(m){return b+m;});
}
return h;
};

window.editProduct=function(id){
var p=(products||[]).find(function(x){return x.id===id;});
if(!p||!user)return;
editingId=id;
$("modal").style.display="block";
window.renderModal();
};

window.openModal=function(){editingId=null;_om();};
window.closeModal=function(){editingId=null;_cm();};

window.renderModal=function(){
if(editingId&&user){renderEdit();}else{editingId=null;_rm();}
};


function renderEdit(){

var p=(products||[]).find(function(x){
return x.id===editingId;
});

if(!p){
editingId=null;
_rm();
return;
}

var t=T[lang],e=tx();

function opts(o,sel){
return Object.keys(o).map(function(k){
return '<option value="'+k+'"'+
(k===sel?' selected':'')+'>'+o[k]+'</option>';
}).join("");
}

var images=Array.isArray(p.image_urls)&&p.image_urls.length
?p.image_urls.filter(Boolean)
:(p.image_url?[p.image_url]:[]);

window.editProductImages=images.slice();

function imageHTML(){
return window.editProductImages.map(function(url,i){
return '<div style="display:inline-block;position:relative;margin:5px">'+
'<img src="'+esc(url)+'" style="width:75px;height:75px;object-fit:cover;border-radius:9px">'+
'<button type="button" onclick="removeEditImage('+i+')" style="position:absolute;top:-7px;right:-7px;background:#c62828;color:white;border:0;border-radius:50%;width:25px;height:25px">×</button>'+
'</div>';
}).join("");
}

$("modalbody").innerHTML=
'<h2>'+e.title+'</h2>'+
'<form onsubmit="saveEdit(event)">'+

'<input name="ptitle" placeholder="'+t.pname+'" maxlength="100" value="'+esc(p.title)+'" required>'+

'<textarea name="pdesc" placeholder="'+t.pdesc+'" maxlength="500">'+esc(p.description)+'</textarea>'+

'<input name="pprice" type="number" min="0" step="any" placeholder="'+t.pprice+'" value="'+esc(p.price)+'" required>'+

'<select name="pcat">'+opts(t.cats,p.category)+'</select>'+

'<select name="pcity">'+opts(t.cities,p.city)+'</select>'+

'<input name="pplace" placeholder="'+t.pplace+'" maxlength="60" value="'+esc(p.place)+'">'+

'<input name="pphone" type="tel" placeholder="'+t.pphone+'" value="'+esc(p.phone)+'" required>'+

'<hr><h3>📷 صور المنتج</h3>'+
  '<div id="editImagesPreview">'+imageHTML()+'</div>'+

'<div id="editImagesPreview">'+imageHTML()+'</div>'+

'<label>إضافة صور جديدة (الحد الأقصى 5 صور إجمالاً)</label>'+

'<input name="pimages" type="file" accept="image/*" multiple>'+

'<div class="note" style="color:#5f6b64">يمكنك حذف أي صورة بالضغط على ×، والاحتفاظ ببقية الصور.</div>'+

'<button type="submit">'+e.save+'</button>'+
'</form>'+
'<div id="note" class="note"></div>';

window.removeEditImage=function(index){

window.editProductImages.splice(index,1);

$("editImagesPreview").innerHTML=imageHTML();

};

}
  


window.saveEdit=async function(ev){

ev.preventDefault();

var t=T[lang],e=tx(),f=ev.target;

function g(n){
return f.elements[n].value;
}

var phone=g("pphone").replace(/\D/g,"");

if(phone.length<8){
$("note").textContent=t.errPhone;
return;
}

var p=(products||[]).find(function(x){
return x.id===editingId;
});

if(!p)return;

var oldImages=Array.isArray(p.image_urls)&&p.image_urls.length
?p.image_urls.filter(Boolean)
:(p.image_url?[p.image_url]:[]);

var keepImages=(window.editProductImages||[]).filter(Boolean);

var files=Array.from(f.elements["pimages"].files||[]);

if(keepImages.length+files.length>5){
$("note").textContent="الحد الأقصى 5 صور. احذف بعض الصور أولاً.";
return;
}

var btn=f.querySelector("button[type=submit]");

btn.disabled=true;
btn.textContent=e.saving;

var newPaths=[];
var saved=false;

try{

var finalImages=keepImages.slice();

for(var i=0;i<files.length;i++){

var blob=await resize(files[i]);

var path=user.id+"/"+Date.now()+"-"+i+".jpg";

var up=await sb.storage.from("product-images").upload(
path,blob,{contentType:"image/jpeg"}
);

if(up.error)throw up.error;

newPaths.push(path);

var url=sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;

finalImages.push(url);

}

var r=await sb.from("products").update({

title:g("ptitle").trim(),
description:g("pdesc").trim(),
price:Number(g("pprice")),
category:g("pcat"),
city:g("pcity"),
place:g("pplace").trim(),
phone:phone,
image_url:finalImages[0]||null,
image_urls:finalImages

}).eq("id",editingId).select();

if(r.error)throw r.error;

if(!r.data||!r.data.length)throw new Error(e.noperm);

saved=true;

function storagePath(url){

var marker="/product-images/";
var i=url.indexOf(marker);

if(i<0)return null;

try{
return decodeURIComponent(url.slice(i+marker.length).split("?")[0]);
}catch(x){
return url.slice(i+marker.length).split("?")[0];
}

}

var removed=oldImages.filter(function(url){
return !finalImages.includes(url);
});

var paths=removed.map(storagePath).filter(Boolean);

if(paths.length){
try{
await sb.storage.from("product-images").remove(paths);
}catch(x){}
}

window.editProductImages=finalImages.slice();

editingId=null;

closeModal();

await loadProducts();

}catch(err){

if(!saved&&newPaths.length){
try{
await sb.storage.from("product-images").remove(newPaths);
}catch(x){}
}

$("note").textContent=t.errNet+" ("+(err.message||"")+")";

btn.disabled=false;
btn.textContent=e.save;

}

};
  

if(typeof render==="function"&&products)render();
})();
