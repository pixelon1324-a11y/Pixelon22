(function(){
if(!window.sb)return;
AU.sk.ck="Poslali sme ti overovací email. Klikni na odkaz v ňom a potom sa prihlás.";AU.en.ck="We sent you a verification email. Click the link in it, then log in.";
function bad(a,b){AU.sk.bad=a;AU.en.bad=b}
var su=sb.auth.signUp.bind(sb.auth);
sb.auth.signUp=function(a){var inp=document.getElementById("pxname");var nm=inp?inp.value.trim():"";
return sb.rpc("name_status",{n:nm}).then(function(r){var s=r.error?"err":r.data;
if(s!=="ok"){var M={invalid:["Neplatné meno (3–20 znakov: písmená, čísla, medzera, _).","Invalid name (3–20 characters: letters, numbers, space, _)."],reserved:["Toto meno je vyhradené, zvoľ iné.","This name is reserved, choose another."],taken:["Toto meno je už obsadené.","This name is already taken."],err:["Meno sa nepodarilo overiť.","Could not check the name."]}[s]||["Chyba.","Error."];bad(M[0],M[1]);return {data:null,error:{message:s}}}
a.options={data:{display_name:nm}};
return su(a).then(function(x){if(x.error)bad("Neplatné údaje alebo chyba. ("+x.error.message+")","Invalid details or an error. ("+x.error.message+")");return x})})};
["signInWithPassword"].forEach(function(n){var f=sb.auth[n].bind(sb.auth);sb.auth[n]=function(a){return f(a).then(function(r){var m=r.error?" ("+r.error.message+")":"";bad("Neplatné údaje alebo chyba."+m,"Invalid details or an error."+m);return r})}});
var rp=sb.auth.resetPasswordForEmail.bind(sb.auth);sb.auth.resetPasswordForEmail=function(e,o){return rp(e,o).then(function(r){AU.sk.rs=r.error?"Nepodarilo sa odoslať ("+r.error.message+")":"Ak účet existuje, poslali sme odkaz na obnovu hesla.";AU.en.rs=r.error?"Could not send ("+r.error.message+")":"If the account exists, we sent a reset link.";return r})};
var P0=panel;panel=function(m){P0(m);if(m==="reg"&&sb){var pw=ap.querySelector("input[type=password]");if(!pw)return;var l=document.createElement("label");l.textContent=lang==="sk"?"Zobrazované meno (3–20 znakov)":"Display name (3–20 characters)";var i=document.createElement("input");i.id="pxname";i.maxLength=20;i.autocomplete="nickname";l.appendChild(i);ap.insertBefore(l,pw.parentNode)}};
var L={sk:{acc:"Môj účet",ord:"Nová objednávka",dt:"Opis zadania (platforma, dĺžka, štýl, termín…)",go:"Odoslať objednávku",my:"Moje objednávky",none:"Zatiaľ žiadne objednávky.",ok:"Uložené.",err:"Nepodarilo sa uložiť.",adm:"Administrácia: všetky objednávky",sv:"Uložiť",cl:"Zavrieť",pr:"Postup %",cu:"Individuálna ponuka",note:"Platba zatiaľ nie je zapnutá. Cenu potvrdíme po prijatí objednávky.",ch:"💬 Chat",snd:"Poslať",ph:"Napíš správu…",you:"Ty",cust:"Zákazník",nm:"Zobrazované meno",nph:"Meno (3–20 znakov)",code:"Tajný kód (voliteľné)",nmsg:{ok:"Uložené.",reserved:"Toto meno je vyhradené. Zadaj tajný kód, ak ti patrí.",taken:"Meno je už obsadené.",invalid:"Neplatné meno (3–20 znakov: písmená, čísla, medzera, _).",bad_code:"Zlý kód.",locked:"Príliš veľa pokusov, zadávanie kódu je zamknuté.",auth:"Prihlás sa.",err:"Nepodarilo sa uložiť."},st:{new:"Nová objednávka",waiting_payment:"Čaká na platbu",waiting_materials:"Čaká na materiály",assigned:"Priradená editorovi",in_progress:"Prebieha strih",review:"Kontrola",revisions:"Požadované revízie",done:"Dokončená",cancelled:"Zrušená"}},en:{acc:"My account",ord:"New order",dt:"Describe your request (platform, length, style, deadline…)",go:"Send order",my:"My orders",none:"No orders yet.",ok:"Saved.",err:"Could not save.",adm:"Admin: all orders",sv:"Save",cl:"Close",pr:"Progress %",cu:"Custom offer",note:"Payment is not enabled yet. We confirm the price after receiving your order.",ch:"💬 Chat",snd:"Send",ph:"Write a message…",you:"You",cust:"Customer",nm:"Display name",nph:"Name (3–20 characters)",code:"Secret code (optional)",nmsg:{ok:"Saved.",reserved:"This name is reserved. Enter the secret code if it is yours.",taken:"This name is already taken.",invalid:"Invalid name (3–20 characters: letters, numbers, space, _).",bad_code:"Wrong code.",locked:"Too many attempts, code entry is locked.",auth:"Please log in.",err:"Could not save."},st:{new:"New order",waiting_payment:"Waiting for payment",waiting_materials:"Waiting for materials",assigned:"Assigned to editor",in_progress:"Editing",review:"Review",revisions:"Revisions requested",done:"Completed",cancelled:"Cancelled"}}};
function T2(){return L[lang]}
var ST=["new","waiting_payment","waiting_materials","assigned","in_progress","review","revisions","done","cancelled"];
var PK=["basic","pro","premium","custom"];
function PKN(k){return k==="custom"?T2().cu:k.charAt(0).toUpperCase()+k.slice(1)}
var cb=document.createElement("button");cb.className="btn";cb.textContent="👤";cb.title="Account";cb.style.cssText="padding:6px 10px;min-height:36px;font-size:14px;display:none";
var nv=document.querySelector("nav");nv.insertBefore(cb,nv.querySelector(".btn"));
var bp=document.createElement("div");bp.className="own-p";bp.hidden=true;document.body.appendChild(bp);
var uid=null,adm=false,lst,myname="";
function E(p,t,x,c){var e=document.createElement(t);if(x!=null&&x!=="")e.textContent=x;if(c)e.className=c;p.appendChild(e);return e}
function badge(){if(!uid)return;sb.from("messages").select("order_id,sender_id,created_at").neq("sender_id",uid).then(function(m){sb.from("chat_reads").select("order_id,last_read").then(function(r){var lr={};(r.data||[]).forEach(function(x){lr[x.order_id]=x.last_read});var n=0;(m.data||[]).forEach(function(x){if(!lr[x.order_id]||Date.parse(x.created_at)>Date.parse(lr[x.order_id]))n++});cb.textContent="👤"+(n?" "+n:"")})})}
function chat(c,o,t){var box=E(c,"div","","panel");box.style.marginTop="10px";var ml=E(box,"div");ml.style.cssText="max-height:220px;overflow:auto;margin-bottom:8px";var ta=E(box,"input");ta.maxLength=2000;ta.placeholder=t.ph;var sd=E(box,"button",t.snd,"btn main");sd.style.marginTop="8px";var tm=null;
function ld(){sb.from("messages").select("*").eq("order_id",o.id).order("created_at").then(function(r){ml.textContent="";(r.data||[]).forEach(function(m){var d=E(ml,"div","","note");d.style.margin="6px 0";d.textContent=(m.sender_id===uid?t.you:(m.sender_name||(adm?t.cust:"PIXELON")))+": "+m.body+" · "+new Date(m.created_at).toLocaleString()});ml.scrollTop=ml.scrollHeight;sb.from("chat_reads").upsert({order_id:o.id,last_read:new Date().toISOString()},{onConflict:"order_id,user_id"}).then(badge)})}
sd.onclick=function(){var v=ta.value.trim();if(!v)return;sd.disabled=true;sb.from("messages").insert({order_id:o.id,body:v}).then(function(r){sd.disabled=false;if(!r.error){ta.value="";ld()}})};
ld();tm=setInterval(function(){if(!document.body.contains(box)){clearInterval(tm);return}ld()},10000)}
function render(){var t=T2();bp.textContent="";E(bp,"h3",t.acc);
var pf=E(bp,"div","","panel");pf.style.marginBottom="14px";
E(pf,"h4",t.nm).style.margin="0 0 8px";
var ni=E(pf,"input");ni.maxLength=20;ni.value=myname||"";ni.placeholder=t.nph;
var cd=E(pf,"input");cd.type="password";cd.placeholder=t.code;cd.style.marginTop="8px";cd.autocomplete="off";
var pm=E(pf,"div","","note");
var ps=E(pf,"button",t.sv,"btn main");ps.style.marginTop="8px";
ps.onclick=function(){var v=ni.value.trim();pm.textContent="…";
var run=cd.value?sb.rpc("claim_reserved_name",{code:cd.value,n:v}).then(function(r){return r.error?"err":r.data}):sb.from("profiles").update({display_name:v}).eq("id",uid).then(function(r){var m=r.error?r.error.message:"";return r.error?(/reserved/.test(m)?"reserved":/duplicate|unique/.test(m)?"taken":/invalid/.test(m)?"invalid":"err"):"ok"});
run.then(function(s){pm.textContent=t.nmsg[s]||t.err;if(s==="ok"){myname=v;cd.value=""}})};
var f=E(bp,"div","","panel");f.style.marginBottom="14px";
E(f,"h4",t.ord).style.margin="0 0 8px";
var sl=E(f,"select");PK.forEach(function(k){var o=E(sl,"option",PKN(k));o.value=k});
sl.style.cssText="width:100%;padding:12px;border-radius:8px;border:1px solid var(--line);background:#060d1c;color:var(--text);margin-bottom:8px";
var ta=E(f,"textarea");ta.rows=4;ta.placeholder=t.dt;ta.maxLength=4000;
var msg=E(f,"div","","note");
var go=E(f,"button",t.go,"btn main");go.style.marginTop="8px";
E(f,"div",t.note,"note");
go.onclick=function(){var d=ta.value.trim();if(!d){msg.textContent=t.err;return}go.disabled=true;
sb.from("orders").insert({package:sl.value,details:d}).then(function(r){go.disabled=false;if(r.error){msg.textContent=t.err;return}ta.value="";msg.textContent=t.ok;load()}).catch(function(){go.disabled=false;msg.textContent=t.err})};
E(bp,"h4",adm?t.adm:t.my);
lst=E(bp,"div");
var cl=E(bp,"button",t.cl,"btn");cl.style.marginTop="12px";cl.onclick=function(){bp.hidden=true};
load()}
function load(){var t=T2();sb.from("orders").select("*").order("created_at",{ascending:false}).then(function(r){lst.textContent="";var d=r.data||[];if(r.error||!d.length){E(lst,"p",t.none);return}
d.forEach(function(o){var c=E(lst,"div","","panel");c.style.marginBottom="10px";
E(c,"strong",PKN(o.package)+" · "+o.id.slice(0,8));
E(c,"div",t.st[o.status]+" · "+o.progress+" %","note");
E(c,"p",o.details);
if(adm){E(c,"div","user: "+(o.customer_name||o.user_id.slice(0,8)),"note");
var s=E(c,"select");ST.forEach(function(k){var op=E(s,"option",t.st[k]);op.value=k;if(k===o.status)op.selected=true});
var p=E(c,"input");p.type="number";p.min=0;p.max=100;p.value=o.progress;p.setAttribute("aria-label",t.pr);
var b=E(c,"button",t.sv,"btn");b.style.marginTop="8px";
b.onclick=function(){sb.from("orders").update({status:s.value,progress:Math.max(0,Math.min(100,parseInt(p.value)||0))}).eq("id",o.id).then(function(x){b.textContent=x.error?t.err:t.ok;setTimeout(load,800)})}}
var ob=E(c,"button",t.ch,"btn");ob.style.marginTop="8px";ob.style.marginLeft="8px";var op2=false;ob.onclick=function(){if(!op2){op2=true;chat(c,o,t)}}
})})}
function sess(s){uid=s&&s.user?s.user.id:null;cb.style.display=uid?"":"none";if(!uid)bp.hidden=true;else badge()}
sb.auth.getSession().then(function(r){sess(r.data&&r.data.session)});
sb.auth.onAuthStateChange(function(e,s){sess(s)});
setInterval(badge,30000);
cb.onclick=function(){bp.hidden=false;sb.from("profiles").select("role,display_name").eq("id",uid).maybeSingle().then(function(r){adm=!!(r.data&&r.data.role==="admin");myname=r.data&&r.data.display_name?r.data.display_name:"";render()})};
document.querySelectorAll(".lang button").forEach(function(b){b.addEventListener("click",function(){if(!bp.hidden)render()})});
})();
(function(){
var f=document.getElementById("f");if(!f)return;
var X={sk:{ok:"Správa odoslaná, ďakujeme. Ozveme sa na tvoj email.",err:"Nepodarilo sa odoslať. Skús znova.",note:"Správa príde priamo nám, odpovieme na tvoj email."},en:{ok:"Message sent, thank you. We will reply to your email.",err:"Could not send. Please try again.",note:"Your message goes straight to us and we reply to your email."}};
T.sk.demoNote=X.sk.note;T.en.demoNote=X.en.note;setL(lang);
f.onsubmit=function(e){e.preventDefault();var m=document.getElementById("msg"),b=f.querySelector("button");b.disabled=true;m.textContent="…";
fetch("https://formspree.io/f/mbgggqyz",{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json"},body:JSON.stringify({name:f.n.value,email:f.e.value,message:f.m.value})}).then(function(r){b.disabled=false;if(r.ok){f.reset();m.textContent=X[lang].ok}else{m.textContent=X[lang].err}}).catch(function(){b.disabled=false;m.textContent=X[lang].err})};
})();