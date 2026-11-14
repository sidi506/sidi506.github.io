(function(){
var go=true;
try{if(sessionStorage.getItem("sp")==="1")go=false;else sessionStorage.setItem("sp","1");}catch(e){}
try{if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)go=false;}catch(e){}
if(go){
var sub={ar:"سوق موريتاني محلي",fr:"Marché local mauritanien",en:"Mauritanian Local Market"};
var l="ar";
try{l=localStorage.getItem("lang")||"ar";}catch(e){}
if(!sub[l])l="ar";
var css=`
#sp{position:fixed;top:0;left:0;right:0;bottom:0;z-index:100;background:linear-gradient(160deg,#064d23,#0d9a4a);display:flex;flex-direction:column;align-items:center;justify-content:center;direction:ltr;animation:spOut .45s ease 3.1s forwards}
#sp svg{width:min(80vw,340px);height:auto;overflow:visible}
#sp h1{margin:20px 0 0;font-size:48px;font-weight:800;color:#fff;font-family:"Segoe UI",Tahoma,"Noto Sans Arabic",system-ui,sans-serif;opacity:0;animation:spUp .7s ease 2s forwards}
#sp h1::after{content:"";display:block;width:60px;height:4px;background:#f2b705;border-radius:4px;margin:8px auto 0}
#sp p{margin:10px 0 0;font-size:17px;color:#d6efdf;font-family:"Segoe UI",Tahoma,"Noto Sans Arabic",system-ui,sans-serif;opacity:0;animation:spUp .7s ease 2.25s forwards}
#sp .gv{animation:spInR .8s cubic-bezier(.2,.8,.2,1) both,spBack .6s ease 1.8s forwards}
#sp .rc{animation:spInL .8s cubic-bezier(.2,.8,.2,1) both}
#sp .coin{animation:spCoin 1.1s ease-in 1s both}
#sp .spin{animation:spSpin .8s linear 1.15s both}
#sp .rip{fill:none;stroke:#f2b705;stroke-width:5;opacity:0;transform-box:fill-box;transform-origin:center}
#sp .r1{animation:spRip .9s ease-out 2.05s both}
#sp .r2{animation:spRip .9s ease-out 2.3s both}
@keyframes spOut{to{opacity:0;visibility:hidden}}
@keyframes spUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes spInR{from{transform:translateX(180px);opacity:0}to{transform:none;opacity:1}}
@keyframes spInL{from{transform:translateX(-180px);opacity:0}to{transform:none;opacity:1}}
@keyframes spBack{to{transform:translate(26px,-14px)}}
@keyframes spCoin{
0%{transform:translate(322px,182px) scale(0)}
14%{transform:translate(322px,182px) scale(1)}
55%{transform:translate(272px,214px) scale(1)}
80%{transform:translate(232px,292px) scale(1)}
90%{transform:translate(232px,280px) scale(1)}
100%{transform:translate(232px,292px) scale(1)}
}
@keyframes spSpin{0%{transform:scaleX(1)}25%{transform:scaleX(-1)}50%{transform:scaleX(1)}75%{transform:scaleX(-1)}100%{transform:scaleX(1)}}
@keyframes spRip{0%{transform:scale(.6);opacity:0}15%{opacity:.8}100%{transform:scale(3);opacity:0}}
`;
var st=document.createElement("style");
st.textContent=css;
document.head.appendChild(st);
var el=document.createElement("div");
el.id="sp";
el.innerHTML='<svg viewBox="40 100 440 360" aria-hidden="true"><defs><g id="sph" fill="#fff" stroke="#fff" stroke-linecap="round"><rect x="0" y="0" width="116" height="88" rx="30" stroke="none"/><g stroke-width="19" fill="none"><path d="M96 12H222"/><path d="M96 33H240"/><path d="M96 54H226"/><path d="M96 75H198"/></g><path d="M30 74L66 122" stroke-width="24" fill="none"/></g></defs>'+
'<circle class="rip r1" cx="232" cy="292" r="40"/><circle class="rip r2" cx="232" cy="292" r="40"/>'+
'<g class="rc"><use href="#sph" transform="translate(54 322) rotate(-7)"/></g>'+
'<g class="gv"><use href="#sph" transform="translate(458 138) scale(-1 1) rotate(7)"/></g>'+
'<g class="coin"><g class="spin"><circle r="40" fill="#f2b705" stroke="#c98f00" stroke-width="5"/><circle r="31" fill="none" stroke="#c98f00" stroke-width="2.5" opacity=".7"/><g transform="scale(1.22)"><circle cy="8" r="19" fill="#c98f00"/><circle cy="1" r="17.5" fill="#f2b705"/><path d="M0.0 -12.0L2.2 -6.1L8.6 -5.8L3.6 -1.8L5.3 4.3L0.0 0.8L-5.3 4.3L-3.6 -1.8L-8.6 -5.8L-2.2 -6.1Z" fill="#c98f00"/></g></g></g>'+
'</svg><h1>المرصة</h1><p>'+sub[l]+'</p>';
el.onclick=function(){el.style.display="none";};
document.documentElement.appendChild(el);
setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},3700);
}

document.addEventListener("DOMContentLoaded",function(){
try{
document.title="المرصة";
T.ar.title="المرصة";
T.fr.title="Al Marsa · marché local";
T.en.title="Al Marsa · Local Market";
render();
}catch(e){}
});
})();
