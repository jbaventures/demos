
(function(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.documentElement.classList.add("reduced");

  /* Reveal ------------------------------------------------------ */
  var els = document.querySelectorAll("[data-rev]");
  if (els.length && !reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(!e.isIntersecting) return;
        var el=e.target, d=Number(el.getAttribute("data-delay")||0);
        setTimeout(function(){ el.classList.add("in"); }, d);
        io.unobserve(el);
      });
    },{threshold:.12, rootMargin:"0px 0px -8% 0px"});
    Array.prototype.forEach.call(els,function(el){io.observe(el)});
  } else {
    Array.prototype.forEach.call(els,function(el){el.classList.add("in")});
  }

  /* Hero heading ------------------------------------------------ */
  var h1=document.getElementById("h1");
  if(h1){ if(reduce) h1.classList.add("in"); else setTimeout(function(){h1.classList.add("in")},140); }

  /* Counters ---------------------------------------------------- */
  var counts=document.querySelectorAll(".count");
  if(counts.length && !reduce && "IntersectionObserver" in window){
    var io3=new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(!e.isIntersecting) return;
        var el=e.target,to=Number(el.getAttribute("data-to")),t0=null,dur=1700;
        function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1);
          el.textContent=Math.round(to*(1-Math.pow(1-p,3))).toLocaleString("en-GB");
          if(p<1) requestAnimationFrame(step); }
        requestAnimationFrame(step); io3.unobserve(el);
      });
    },{threshold:.55});
    Array.prototype.forEach.call(counts,function(c){io3.observe(c)});
  }

  /* Duplicate the marquee so the loop is seamless ---------------- */
  var marq=document.getElementById("marq");
  if(marq && !reduce){ marq.innerHTML += marq.innerHTML; }

  /* Horizontal rail --------------------------------------------- */
  var rail=document.querySelector(".rail"), track=document.getElementById("track"), railbar=document.getElementById("railbar");
  function sizeRail(){
    if(!rail||!track||reduce||window.innerWidth<768) return;
    var dist = track.scrollWidth - window.innerWidth + 88;
    rail.style.height = (window.innerHeight + Math.max(dist,0)) + "px";
  }
  function moveRail(){
    if(!rail||!track||reduce||window.innerWidth<768) return;
    var r=rail.getBoundingClientRect();
    var total=rail.offsetHeight - window.innerHeight;
    var p = total>0 ? Math.min(Math.max(-r.top/total,0),1) : 0;
    var dist = track.scrollWidth - window.innerWidth + 88;
    track.style.transform = "translate3d(" + (-p*Math.max(dist,0)) + "px,0,0)";
    if(railbar) railbar.style.width = (p*100)+"%";
  }

  /* On narrow screens the rail is a native scroller; keep the meter honest. */
  if(track && railbar){
    track.addEventListener("scroll",function(){
      if(window.innerWidth>=768 && !reduce) return;
      var max=track.scrollWidth-track.clientWidth;
      railbar.style.width = (max>0 ? (track.scrollLeft/max)*100 : 0) + "%";
    },{passive:true});
  }

  /* Plates parallax --------------------------------------------- */
  var plates=Array.prototype.slice.call(document.querySelectorAll("[data-plate]"));
  function paintPlates(){
    if(reduce) return;
    var vh=window.innerHeight;
    plates.forEach(function(p){
      var r=p.getBoundingClientRect();
      if(r.bottom<-240||r.top>vh+240) return;
      var k=Number(p.getAttribute("data-parallax")||0.1);
      var mid=r.top+r.height/2-vh/2;
      var m=p.firstElementChild;
      if(m) m.style.transform="scale(1.2) translate3d(0,"+(-mid*k)+"px,0)";
    });
  }

  /* Progress + header ------------------------------------------- */
  var prog=document.getElementById("prog"), hdr=document.getElementById("hdr");
  function paintChrome(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    if(prog) prog.style.width = (max>0 ? (h.scrollTop/max)*100 : 0) + "%";
    if(hdr) hdr.classList.toggle("stuck", window.scrollY>8);
  }

  var queued=false;
  function onScroll(){
    if(queued) return; queued=true;
    requestAnimationFrame(function(){ queued=false; paintChrome(); paintPlates(); moveRail(); });
  }
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",function(){ sizeRail(); onScroll(); },{passive:true});
  sizeRail(); paintChrome(); paintPlates(); moveRail();

  /* Cursor light + card spotlights ------------------------------ */
  if(!reduce && window.matchMedia("(hover: hover) and (min-width: 900px)").matches){
    var cur=document.getElementById("cursor");
    var cards=Array.prototype.slice.call(document.querySelectorAll(".card"));
    var px=0,py=0,q=false;
    function paintCursor(){
      q=false;
      if(cur){ cur.style.setProperty("--cx",px+"px"); cur.style.setProperty("--cy",py+"px"); cur.style.opacity="1"; }
      for(var i=0;i<cards.length;i++){
        var r=cards[i].getBoundingClientRect();
        if(r.bottom<-200||r.top>window.innerHeight+200) continue;
        cards[i].style.setProperty("--mx",(px-r.left)+"px");
        cards[i].style.setProperty("--my",(py-r.top)+"px");
      }
    }
    window.addEventListener("pointermove",function(e){
      px=e.clientX; py=e.clientY;
      if(!q){ q=true; requestAnimationFrame(paintCursor); }
    },{passive:true});
    document.addEventListener("pointerleave",function(){ if(cur) cur.style.opacity="0"; });
  }

  /* Plate videos: slow, and paused when off screen --------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".plate video"),function(v){
    v.playbackRate=0.55;
    if(reduce){ v.removeAttribute("autoplay"); v.pause(); return; }
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(en){
        en.forEach(function(e){ e.isIntersecting ? v.play().catch(function(){}) : v.pause(); });
      },{threshold:.05}).observe(v);
    }
  });

  /* Header menu ------------------------------------------------- */
  var burger=document.getElementById("burger"), menu=document.getElementById("menu");
  if(burger&&menu){
    burger.addEventListener("click",function(){
      var open=burger.getAttribute("aria-expanded")==="true";
      burger.setAttribute("aria-expanded",String(!open));
      menu.classList.toggle("open",!open);
    });
    Array.prototype.forEach.call(menu.querySelectorAll("a"),function(a){
      a.addEventListener("click",function(){burger.setAttribute("aria-expanded","false");menu.classList.remove("open")});
    });
  }

  var yr=document.getElementById("yr"); if(yr) yr.textContent=String(new Date().getFullYear());
})();

/* WS-01: hero image loop */
(function(){
  var box=document.querySelector(".slides"); if(!box) return;
  var items=box.children, i=0; if(!items.length) return;
  items[0].classList.add("on");
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||items.length<2) return;
  if(items[0].tagName==="IMG") items[0].classList.add("mv");
  function show(el){
    if(el.tagName==="IMG"){ el.classList.remove("mv"); void el.offsetWidth; el.classList.add("mv"); }
    el.classList.add("on");
  }
  setInterval(function(){
    items[i].classList.remove("on"); i=(i+1)%items.length; show(items[i]);
  },6500);
})();
