gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis();
requestAnimationFrame(function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
});

const heroOpacity = () => {
  const trigger = document.getElementById("hero-trigger");
  const imgs = document.querySelectorAll(".hero-img");
  const img1 = document.querySelector(".sub-img");
  gsap.to(imgs, {
    filter: "brightness(0.3)",
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: trigger,
      start: "top center",
      end: "bottom 40%",
      scrub: true,
    },
  });
  gsap.to(img1, {
    filter: "brightness(0.3)",
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: trigger,
      start: "top 40%",
      end: "bottom 20%",
      scrub: true,
    },
  });
};
const stringAnimation = () => {
  
  var strings = document.querySelectorAll(".string");
  strings.forEach(string=>{
    var path = "M 10 100 Q 500 100 1390 100";
  var finalPath = "M 10 100 Q 500 100 1390 100";
    string.addEventListener("mousemove", function (dets) {
    const rect = string.getBoundingClientRect(); // get div position
    const y = dets.clientY - rect.top; // convert to local Y

    path = `M 10 100 Q 500 ${y} 1390 100`;
    //  path =`M 10 100 Q 500 ${dets.y} 990 100`;
    gsap.to("svg path", {
      attr: { d: path },
      duration: 0.2,
    });
    //  console.log(path)
  });
  string.addEventListener("mouseleave", function (dets) {
    gsap.to("svg path", {
      attr: { d: finalPath },
      duration: 1.5,
      ease: "elastic.out(1.5,0.1)",
    });
    //  console.log(path)
  });

  })
  
};
const whatIDoanimation =()=>{
  const CARD_W   = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-w'));
    const GAP      = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
    const STEP     = () => CARD_W() + GAP();
    const DURATION = 0.65;
    const EASE     = 'power3.inOut';
 
    const track = document.getElementById('slider-track');
    const prev  = document.getElementById('btn-prev');
    const next  = document.getElementById('btn-next');
 
    /*
     * ── Infinite loop strategy ──
     * Clone one full set before and one after the real cards.
     * Track a logical index. After each animation completes,
     * if we're inside clone territory, instantly teleport
     * to the matching real card (same visual position, no jump).
     *
     * Layout:  [clone of 0..4] [real 0..4] [clone of 0..4]
     * Indices:       0-4            5-9          10-14
     * We start at index 5 (first real card).
     */
 
    const origCards = Array.from(track.children); // 5 real cards
    const total     = origCards.length;            // 5
 
    /* Build clones */
    const beforeClones = origCards.map(c => c.cloneNode(true));
    const afterClones  = origCards.map(c => c.cloneNode(true));
 
    /* Prepend before-clones (reversed so order stays correct) */
    beforeClones.slice().reverse().forEach(c => track.prepend(c));
    /* Append after-clones */
    afterClones.forEach(c => track.appendChild(c));
 
    /*
     * All cards in DOM order:
     *   indices 0..4        → before clones  (mirror of real 0..4)
     *   indices 5..9        → real cards
     *   indices 10..14      → after clones   (mirror of real 0..4)
     */
    const REAL_START = total;       // index 5
    const REAL_END   = total * 2 - 1; // index 9
 
    /* currentIndex always points to which DOM card is "active" */
    let currentIndex = REAL_START;  // start at first real card
    let animating    = false;
 
    function xForIndex(idx) {
      /* x position so card at idx is leftmost visible */
      return -(idx * STEP());
    }
 
    /* Init position — no animation */
    gsap.set(track, { x: xForIndex(currentIndex) });
 
    function slide(dir) {
      /* dir: +1 = next (go left), -1 = prev (go right) */
      if (animating) return;
      animating = true;
 
      const targetIndex = currentIndex + dir;
      const targetX     = xForIndex(targetIndex);
 
      gsap.to(track, {
        x: targetX,
        duration: DURATION,
        ease: EASE,
        onComplete: () => {
          currentIndex = targetIndex;
 
          /* If we've slid into clone territory, teleport to matching real card */
          if (currentIndex > REAL_END) {
            /* Went past last real → teleport to first real */
            currentIndex = REAL_START + (currentIndex - REAL_END - 1);
            gsap.set(track, { x: xForIndex(currentIndex) });
          } else if (currentIndex < REAL_START) {
            /* Went before first real → teleport to last real */
            currentIndex = REAL_END - (REAL_START - 1 - currentIndex);
            gsap.set(track, { x: xForIndex(currentIndex) });
          }
 
          animating = false;
        }
      });
    }
 
    next.addEventListener('click', () => slide(+1));
    prev.addEventListener('click', () => slide(-1));
 
    /* ── Drag to scroll ── */
    let dragStartX  = null;
    let dragBaseX   = 0;
 
    track.addEventListener('mousedown', e => {
      if (animating) return;
      dragStartX = e.clientX;
      dragBaseX  = xForIndex(currentIndex);
    });
    window.addEventListener('mousemove', e => {
      if (dragStartX === null) return;
      gsap.set(track, { x: dragBaseX + (e.clientX - dragStartX) });
    });
    window.addEventListener('mouseup', e => {
      if (dragStartX === null) return;
      const delta = e.clientX - dragStartX;
      dragStartX = null;
      if (Math.abs(delta) > 60) {
        slide(delta < 0 ? +1 : -1);
      } else {
        gsap.to(track, { x: xForIndex(currentIndex), duration: 0.4, ease: EASE });
      }
    });
 
    /* ── Touch ── */
    let touchStartX = null;
    track.addEventListener('touchstart', e => {
      if (animating) return;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(delta) > 50) slide(delta < 0 ? +1 : -1);
    }, { passive: true });
 
    /* ── Keyboard ── */
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') slide(+1);
      if (e.key === 'ArrowLeft')  slide(-1);
    });
 
    /* ── Entry animation on real cards only ── */
    gsap.from(origCards, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.2,
    });
}
const showReels = () => {
  const widget    = document.getElementById('showreel-widget');
  const backdrop  = document.getElementById('modal-backdrop');
  const modalCont = document.getElementById('modal-container');
  const modalVid  = document.getElementById('modal-video');
  const widgetVid = document.getElementById('widget-video');
  const closeBtn  = document.getElementById('modal-close');

  let isOpen      = false;
  let isAnimating = false;

  // ✅ Snapshot stored BEFORE widget is hidden
  // so closeModal always knows the true origin rect
  let widgetOriginRect = null;

  // ── Float ──
  gsap.to(widget, {
    y: -8, duration: 3, ease: 'sine.inOut',
    yoyo: true, repeat: -1,
  });

  // ── Magnetic cursor ──
  widget.addEventListener('mousemove', e => {
    const rect = widget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.18;
    const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.18;
    gsap.to(widget, { x: dx, y: dy - 8, duration: 0.4,
      ease: 'power2.out', overwrite: true });
  });
  widget.addEventListener('mouseleave', () => {
    gsap.to(widget, { x: 0, y: 0, duration: 0.6,
      ease: 'elastic.out(1, 0.5)', overwrite: true });
    gsap.to(widget, { y: -8, duration: 3, ease: 'sine.inOut',
      yoyo: true, repeat: -1, delay: 0.6 });
  });

  // ── Open modal ──
  function openModal() {
    if (isOpen || isAnimating) return;
    isOpen      = true;
    isAnimating = true;

    // ✅ Snapshot BEFORE hiding — captures real position
    widgetOriginRect = widget.getBoundingClientRect();

    const ww = window.innerWidth;
    const wh = window.innerHeight;

    // ✅ CHANGE THESE TWO LINES to adjust modal size
    const targetW = Math.min(ww * 0.92, 1600);   // ← wider  (was 0.82, 900)
    const targetH = targetW * (9 / 16);           // ← keeps 16:9 ratio

    const targetL = (ww - targetW) / 2;
    const targetT = (wh - targetH) / 2;

    gsap.set(modalCont, {
      left:         widgetOriginRect.left,
      top:          widgetOriginRect.top,
      width:        widgetOriginRect.width,
      height:       widgetOriginRect.height,
      borderRadius: 16,
      opacity:      1,
    });

    backdrop.classList.add('open');

    gsap.to(modalCont, {
      left: targetL, top: targetT,
      width: targetW, height: targetH,
      borderRadius: 20,
      duration: 0.65, ease: 'expo.inOut',
      onComplete: () => {
        modalCont.classList.add('open');
        modalVid.play();
        widgetVid.pause();
        isAnimating = false;
      }
    });

    gsap.to(widget, {
      opacity: 0, scale: 0.85,
      duration: 0.3, ease: 'power2.in'
    });
  }

  // ── Close modal ──
  function closeModal() {
    if (!isOpen || isAnimating) return;
    isAnimating = true;

    modalCont.classList.remove('open');
    backdrop.classList.remove('open');

    // ✅ Use snapshotted rect — widget is hidden so
    //    getBoundingClientRect() on it would be wrong
    const ox = widgetOriginRect.left;
    const oy = widgetOriginRect.top;
    const ow = widgetOriginRect.width;
    const oh = widgetOriginRect.height;

    gsap.to(modalCont, {
      left: ox, top: oy, width: ow, height: oh,
      borderRadius: 16,
      duration: 0.55, ease: 'expo.inOut',
      onComplete: () => {
        modalVid.pause();
        modalVid.currentTime = 0;
        gsap.set(modalCont, { opacity: 0 });
        widgetVid.play();
        isOpen      = false;
        isAnimating = false;
        widgetOriginRect = null;
        gsap.to(widget, {
          opacity: 1, scale: 1,
          duration: 0.4, ease: 'back.out(1.4)'
        });
      }
    });
  }

  widget.addEventListener('click', openModal);
  closeBtn.addEventListener('click', e => {
    e.stopPropagation(); closeModal();
  });
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeModal();
  });

  // ── Init ──
  gsap.set(modalCont, { opacity: 0, width: 0, height: 0 });
};
const techMarquee=()=>{
  const items = [
      { label: 'React',       color: '#61DAFB' },
      { label: 'Next.js',     color: '#ffffff' },
      { label: 'TypeScript',  color: '#3178C6' },
      { label: 'Tailwind',    color: '#38BDF8' },
      { label: 'Node.js',     color: '#6DA55F' },
      { label: 'Express.js',     color: '#6DA55F' },
      { label: 'GSAP',        color: '#88CE02' },
      { label: 'MongoDB',     color: '#4EA94B' },
      { label: 'framer motion',       color: '#F24E1E' },
      { label: 'Postgre SQL',  color: '#336791' },
      { label: 'JWT',      color: '#0DB7ED' },
      { label: 'Firebase',     color: '#E10098' },
      { label: 'Python',      color: '#FFD43B' },
      { label: 'Git & github',      color: '#FFD43B' },
    ];
 
    const DIAMOND = `<span style="display:inline-block;width:9px;height:9px;background:#a3e635;transform:rotate(45deg);flex-shrink:0;margin:0 28px;vertical-align:middle;border-radius:1px;"></span>`;
 
    const belt = document.getElementById('marquee-belt');
 
    function buildSet() {
      return items.map(item =>
        `<span style="
            display:inline-flex;
            align-items:center;
            
            letter-spacing:0.04em;
            text-transform:uppercase;
            color:white;
           
            line-height:1;
          ">${item.label}</span>${DIAMOND}`
      ).join('');
    }
 
    // Fill belt with enough sets for seamless loop
    for (let i = 0; i < 6; i++) belt.innerHTML += buildSet();
 
    // Measure one full set width
    requestAnimationFrame(() => {
      const totalW  = belt.scrollWidth;
      const sets    = 6;
      const setW    = totalW / sets;
 
      // Half-width loop trick
      const halfW = totalW / 2;
 
      gsap.set(belt, { x: 0 });
 
      gsap.to(belt, {
        x: -halfW,
        duration: halfW / 80,   // 80px/s — adjust speed here
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => {
            const pos = parseFloat(x);
            return pos <= -halfW ? pos + halfW : pos;
          })
        }
      });
    });
}

const loaderAnimation = () => {
  document.body.style.overflow = "hidden";

  const loaderText = document.querySelector(".loader-text");

  let progress = { value: 0 };

  const tl = gsap.timeline({
    onComplete: () => {
      document.getElementById("loader").remove();
      document.body.style.overflow = "auto";
    },
  });

  // line animation + percentage together
  tl.to(progress, {
    value: 100,
    duration: 1.5,
    ease: "none",
    snap: "value",
    onUpdate: () => {
      loaderText.innerHTML = `${progress.value}%`;
    },
  }, 0)

  .to(
    "#loaderLine",
    {
      width: "100%",
      duration:2,
      ease: "power3.inOut",
    },
    0
  )

  // exit animation
  .to("#loaderTop", {
    yPercent: -100,
    duration: 1.3,
    ease: "power4.inOut",
  })

  .to(
    "#loaderBottom",
    {
      yPercent: 100,
      duration: 1.3,
      ease: "power4.inOut",
    },
    "<"
  )

  .to(
    [".loader-text", "#loaderLine"],
    {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      display:'none'
    },
    "<"
  )
  .from('.banner img',{
    scale:1.8,
    duration:1.2,
    ease: "power4.inOut",
  },"<")
  
};
 
loaderAnimation();
techMarquee()
showReels()
heroOpacity();
stringAnimation();
whatIDoanimation()

