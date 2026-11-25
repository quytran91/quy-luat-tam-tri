(function(){
if(document.body.classList.contains('home'))return;
var KEY='qltt.'+(document.body.dataset.slug||'home');
function ls(k,v){try{if(v===undefined)return localStorage.getItem(KEY+':'+k);localStorage.setItem(KEY+':'+k,v)}catch(e){return null}}
var root=document.documentElement,$=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

/* chuyển động */
var still=false;
try{still=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
if(ls('still')==='1')still=true;
function setStill(v){still=v;root.classList.toggle('still',v);$('#b-still').classList.toggle('on',v);ls('still',v?'1':'0');
  $$('.fig svg').forEach(function(s){try{v?s.pauseAnimations():s.unpauseAnimations()}catch(e){}})}
function startSmil(svg){
  if(svg.dataset.go)return;svg.dataset.go='1';
  $$('animate,animateMotion,animateTransform',svg).forEach(function(a){
    try{a.beginElementAt(parseFloat(a.getAttribute('data-off')||'0'))}catch(e){}});
  if(still){try{svg.pauseAnimations()}catch(e){}}
}
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){
  if(e.isIntersecting){e.target.classList.add('in');var s=e.target.querySelector&&e.target.querySelector(':scope > svg');if(e.target.classList.contains('fig')&&s)startSmil(s);io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08}):null;
$$('.rv').forEach(function(el){io?io.observe(el):el.classList.add('in')});
if(!io)$$('.fig svg').forEach(startSmil);
setStill(still);
$('#b-more').onclick=function(){$('#fabs').classList.toggle('open')};
$('#b-still').onclick=function(){setStill(!still)};

/* tiến độ + đọc tiếp */
var prog=$('#prog'),saveT=0;
function onScroll(){var h=document.documentElement.scrollHeight-innerHeight;var p=h>0?scrollY/h:0;prog.style.width=(p*100)+'%';
  clearTimeout(saveT);saveT=setTimeout(function(){ls('pos',String(p))},400)}
addEventListener('scroll',onScroll,{passive:true});onScroll();
var saved=parseFloat(ls('pos')||'0');
if(saved>0.04&&saved<0.97){$('#toast-t').textContent='Bạn đã đọc tới '+Math.round(saved*100)+'%.';$('#toast').classList.add('open');
  setTimeout(function(){$('#toast').classList.remove('open')},12000)}
$('#toast-go').onclick=function(){var h=document.documentElement.scrollHeight-innerHeight;scrollTo(0,saved*h);$('#toast').classList.remove('open')};
$('#toast-x').onclick=function(){$('#toast').classList.remove('open')};

/* nút */
$('#b-top').onclick=function(){scrollTo({top:0,behavior:still?'auto':'smooth'})};
var sizes=[17,19,21,23],fi=sizes.indexOf(parseInt(ls('fs')||'19',10));if(fi<0)fi=1;
function setFs(){root.style.setProperty('--fs',sizes[fi]+'px');ls('fs',String(sizes[fi]))}setFs();
$('#b-font').onclick=function(){fi=(fi+1)%sizes.length;setFs()};
function closePanels(){$$('.panel').forEach(function(p){p.classList.remove('open')});$('#b-find').classList.remove('on')}
$$('.pclose').forEach(function(b){b.onclick=function(){closePanels();if(b.closest('#p-pen'))setPen(false)}});

/* tìm chữ */
var hits=[],hi=-1,main=$('main');
function clearHits(){$$('mark.hit').forEach(function(m){var t=document.createTextNode(m.textContent);m.parentNode.replaceChild(t,m);t.parentNode.normalize()});hits=[];hi=-1}
function fold(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase()}
function find(q){clearHits();$('#qn').textContent='';if(q.length<2)return;var fq=fold(q);
  var w=document.createTreeWalker(main,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentNode.closest('svg,script')?2:1}}),ns=[],n;
  while(n=w.nextNode())ns.push(n);
  ns.forEach(function(n){var t=n.nodeValue,f=fold(t),i=f.indexOf(fq);if(i<0||f.length!==t.length)return;var frag=document.createDocumentFragment(),last=0;
    while(i>=0){frag.appendChild(document.createTextNode(t.slice(last,i)));var m=document.createElement('mark');m.className='hit';m.textContent=t.slice(i,i+q.length);frag.appendChild(m);hits.push(m);last=i+q.length;i=f.indexOf(fq,last)}
    frag.appendChild(document.createTextNode(t.slice(last)));n.parentNode.replaceChild(frag,n)});
  $('#qn').textContent=hits.length?'0/'+hits.length:'0';if(hits.length)go(0)}
function go(d){if(!hits.length)return;if(hits[hi])hits[hi].classList.remove('cur');hi=(hi+d+hits.length)%hits.length;var m=hits[hi];m.classList.add('cur');
  var r=m.closest('.rv');if(r)r.classList.add('in');m.scrollIntoView({block:'center'});$('#qn').textContent=(hi+1)+'/'+hits.length}
var qt;$('#q').addEventListener('input',function(e){clearTimeout(qt);qt=setTimeout(function(){find(e.target.value.trim())},250)});
$('#qx').onclick=function(){go(1)};$('#qp').onclick=function(){go(-1)};
$('#b-find').onclick=function(){var p=$('#p-find'),o=!p.classList.contains('open');closePanels();setPen(false);if(o){p.classList.add('open');this.classList.add('on');$('#q').focus()}else clearHits()};

/* bút tô của người đọc */
var marks=[];try{marks=JSON.parse(ls('marks')||'[]')}catch(e){marks=[]}
var penOn=false;
function setPen(v){penOn=v;document.body.classList.toggle('pen',v);$('#b-pen').classList.toggle('on',v);if(v){closePanels();$('#p-pen').classList.add('open');listMarks()}else $('#p-pen').classList.remove('open')}
$('#b-pen').onclick=function(){setPen(!penOn)};
function textOffset(p,node,off){var w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),n,c=0;while(n=w.nextNode()){if(n===node)return c+off;c+=n.nodeValue.length}return -1}
function wrap(p,s,e,id){var w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),n,c=0,list=[];while(n=w.nextNode())list.push(n);
  list.forEach(function(n){var L=n.nodeValue.length,a=Math.max(s,c),b=Math.min(e,c+L);if(a<b){var r=document.createRange();r.setStart(n,a-c);r.setEnd(n,b-c);var m=document.createElement('mark');m.className='umark';m.dataset.mid=id;try{r.surroundContents(m)}catch(x){}}c+=L})}
function apply(){marks.forEach(function(k){var p=document.querySelector('[data-pid="'+k.p+'"]');if(p)wrap(p,k.s,k.e,k.id)})}
function save(){ls('marks',JSON.stringify(marks))}
function listMarks(){var L=$('#penlist');L.innerHTML='';if(!marks.length){L.innerHTML='<p class="pen-tip">Chưa có chỗ tô nào.</p>';return}
  marks.forEach(function(k){var a=document.createElement('a');a.href='#';a.textContent='“'+k.t.slice(0,80)+(k.t.length>80?'…':'')+'”';a.onclick=function(ev){ev.preventDefault();var m=document.querySelector('mark[data-mid="'+k.id+'"]');if(m){var r=m.closest('.rv');if(r)r.classList.add('in');m.scrollIntoView({block:'center'})}};L.appendChild(a)})}
function tryMark(){if(!penOn)return;var sel=getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount)return;var r=sel.getRangeAt(0);
  var p1=r.startContainer.parentNode.closest('[data-pid]'),p2=r.endContainer.parentNode.closest('[data-pid]');if(!p1||p1!==p2)return;
  var s=textOffset(p1,r.startContainer,r.startOffset),e=textOffset(p1,r.endContainer,r.endOffset);if(s<0||e<=s)return;
  var k={id:'m'+Date.now(),p:p1.dataset.pid,s:s,e:e,t:r.toString()};marks.push(k);save();sel.removeAllRanges();wrap(p1,s,e,k.id);listMarks()}
var mt;document.addEventListener('selectionchange',function(){if(!penOn)return;clearTimeout(mt);mt=setTimeout(tryMark,900)});
document.addEventListener('mouseup',function(){if(penOn)setTimeout(tryMark,30)});
document.addEventListener('click',function(ev){var m=ev.target.closest&&ev.target.closest('mark.umark');if(!m||!penOn)return;var id=m.dataset.mid;
  marks=marks.filter(function(k){return k.id!==id});save();$$('mark[data-mid="'+id+'"]').forEach(function(x){var t=document.createTextNode(x.textContent);var par=x.parentNode;par.replaceChild(t,x);par.normalize()});listMarks()});
apply();
})();

/* ===== Quy luật tâm trí: tiến độ cả cuốn, đánh dấu xong, phóng ảnh ===== */
var Q=(function(){
  var P='qltt.';
  function get(k,d){try{var v=localStorage.getItem(P+k);return v==null?d:JSON.parse(v)}catch(e){return d}}
  function set(k,v){try{localStorage.setItem(P+k,JSON.stringify(v))}catch(e){}}
  function dkey(d){d=d||new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  function markDay(){var days=get('days',[]),k=dkey();if(days.indexOf(k)<0){days.push(k);set('days',days.slice(-400))}}
  function streak(){var days=get('days',[]),n=0,d=new Date();if(days.indexOf(dkey(d))<0)d.setDate(d.getDate()-1);while(days.indexOf(dkey(d))>=0){n++;d.setDate(d.getDate()-1)}return n}
  var lastAct=Date.now();
  ['scroll','touchstart','keydown','click'].forEach(function(ev){addEventListener(ev,function(){lastAct=Date.now()},{passive:true})});
  setInterval(function(){if(document.visibilityState!=='visible'||Date.now()-lastAct>180000)return;
    var s=get('sec',{}),k=dkey();s[k]=(s[k]||0)+15;set('sec',s);if(s[k]>=120)markDay();if(Q.onTick)Q.onTick()},15000);
  return {get:get,set:set,dkey:dkey,markDay:markDay,streak:streak};
})();
(function(){
  var body=document.body,slug=body.dataset.slug,still=function(){return document.documentElement.classList.contains('still')};
  /* phóng ảnh */
  var lb=document.getElementById('lightbox');
  if(lb){var li=lb.querySelector('img');
    document.querySelectorAll('figure.photo button').forEach(function(b){b.addEventListener('click',function(){var im=b.querySelector('img');li.src=im.currentSrc||im.src;li.alt=im.alt;lb.classList.add('open')})});
    lb.addEventListener('click',function(){lb.classList.remove('open');li.removeAttribute('src')});}
  if(!slug||body.classList.contains('home'))return;
  /* vị trí đọc cuối cùng */
  var t=0;addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){var h=document.documentElement.scrollHeight-innerHeight;Q.set('last',{slug:slug,f:h>0?Math.min(1,scrollY/h):0})},500)},{passive:true});
  if(location.hash==='#tiep'){var sv=parseFloat(localStorage.getItem('qltt.'+slug+':pos')||'0');if(sv>0)setTimeout(function(){scrollTo(0,sv*(document.documentElement.scrollHeight-innerHeight))},350)}
  /* đánh dấu đã đọc xong */
  var mk=document.querySelector('.mark');
  if(mk){var done=Q.get('done',{});mk.setAttribute('aria-pressed',done[slug]?'true':'false');
    mk.addEventListener('click',function(){var d=Q.get('done',{}),on=!d[slug];if(on){d[slug]=Date.now();Q.markDay();burst(mk)}else delete d[slug];Q.set('done',d);mk.setAttribute('aria-pressed',on?'true':'false')})}
  function burst(el){if(still())return;var r=el.getBoundingClientRect(),C=['#e9bd43','#b34d70','#176d78','#bd4b17','#2864a0','#477347'];
    for(var i=0;i<16;i++){var s=document.createElement('i'),a=(-175+Math.random()*170)*Math.PI/180,d=60+Math.random()*90;
      s.className='burst';s.style.background=C[i%C.length];s.style.left=(r.left+r.width/2)+'px';s.style.top=(r.top+r.height/2)+'px';
      s.style.setProperty('--dx',(Math.cos(a)*d).toFixed(0)+'px');s.style.setProperty('--dy',(Math.sin(a)*d).toFixed(0)+'px');
      if(i%2)s.style.borderRadius='50%';document.body.appendChild(s);setTimeout(function(x){x.remove()}.bind(null,s),1100)}}
})();
