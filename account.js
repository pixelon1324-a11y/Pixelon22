(function(){
if(!window.sb)return;
AU.sk.ck="Poslali sme ti overovací email. Klikni na odkaz v ňom a potom sa prihlás.";AU.en.ck="We sent you a verification email. Click the link in it, then log in.";
["signUp","signInWithPassword"].forEach(function(n){var f=sb.auth[n].bind(sb.auth);sb.auth[n]=function(a){return f(a).then(function(r){var m=r.error?" ("+r.error.message+")":"";AU.sk.bad="Neplatné údaje alebo chyba."+m;AU.en.bad="Invalid details or an error."+m;return r})}});
var L={sk:{acc:"Môj účet",ord:"Nová objednávka",dt:"Opis zadania (platforma, dĺžka, štýl, termín…)",go:"Odoslať objednávku",my:"Moje objednávky",none:"Zatiaľ žiadne objednávky.",ok:"Uložené.",err:"Nepodarilo sa uložiť.",adm:"Administrácia: všetky objednávky",sv:"Uložiť",cl:"Zavrieť",pr:"Postup %",cu:"Individuálna ponuka",note:"Platba zatiaľ nie je zapnutá. Cenu potvrdíme po prijatí objednávky.",st:{new:"Nová objednávka",waiting_payment:"Čaká na platbu",waiting_materials:"Čaká na materiály",assigned:"Priradená editorovi",in_progress:"Prebieha strih",review:"Kontrola",revisions:"Požadované revízie",done:"Dokončená",cancelled:"Zrušená"}},en:{acc:"My account",ord:"New order",dt:"Describe your request (platform, length, style, deadline…)",go:"Send order",my:"My orders",none:"No orders yet.",ok:"Saved.",err:"Could not save.",adm:"Admin: all orders",sv:"Save",cl:"Close",pr:"Progress %",cu:"Custom offer",note:"Payment is not enabled yet. We confirm the price after receiving your order.",st:{new:"New order",waiting_payment:"Waiting for payment",waiting_materials:"Waiting for materials",assigned:"Assigned to editor",in_progress:"Editing",review:"Review",revisions:"Revisions requested",done:"Completed",cancelled:"Cancelled"}}};
function T2(){return L[lang]}
var ST=["new","waiting_payment","waiting_materials","assigned","in_progress","review","revisions","done","cancelled"];
var PK=["basic","pro","premium","custom"];
function PKN(k){return k==="custom"?T2().cu:k.charAt(0).toUpperCase()+k.slice(1)}
var cb=document.createElement("button");cb.className="btn";cb.textContent="👤";cb.title="Account";cb.style.cssText="padding:6px 10px;min-height:36px;font-size:14px;display:none";
var nv=document.querySelector("nav");nv.insertBefore(cb,nv.querySelector(".btn"));
var bp=document.createElement("div");bp.className="own-p";bp.hidden=true;document.body.appendChild(bp);
var uid=null,adm=false,lst;
function E(p,t,x,c){var e=document.createElement(t);if(x!=null&&x!=="")e.textContent=x;if(c)e.className=c;p.appendChild(e);return e}
function render(){var t=T2();bp.textContent="";E(bp,"h3",t.acc);
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
if(adm){E(c,"div","user: "+o.user_id.slice(0,8),"note");
var s=E(c,"select");ST.forEach(function(k){var op=E(s,"option",t.st[k]);op.value=k;if(k===o.status)op.selected=true});
var p=E(c,"input");p.type="number";p.min=0;p.max=100;p.value=o.progress;p.setAttribute("aria-label",t.pr);
var b=E(c,"button",t.sv,"btn");b.style.marginTop="8px";
b.onclick=function(){sb.from("orders").update({status:s.value,progress:Math.max(0,Math.min(100,parseInt(p.value)||0))}).eq("id",o.id).then(function(x){b.textContent=x.error?t.err:t.ok;setTimeout(load,800)})}}
})})}
function sess(s){uid=s&&s.user?s.user.id:null;cb.style.display=uid?"":"none";if(!uid)bp.hidden=true}
sb.auth.getSession().then(function(r){sess(r.data&&r.data.session)});
sb.auth.onAuthStateChange(function(e,s){sess(s)});
cb.onclick=function(){bp.hidden=false;sb.from("profiles").select("role").eq("id",uid).maybeSingle().then(function(r){adm=!!(r.data&&r.data.role==="admin");render()})};
document.querySelectorAll(".lang button").forEach(function(b){b.addEventListener("click",function(){if(!bp.hidden)render()})});
})();