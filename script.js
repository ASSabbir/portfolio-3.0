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
  var path = "M 10 100 Q 500 100 1390 100";
  var finalPath = "M 10 100 Q 500 100 1390 100";
  var string = document.querySelector(".string");
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

heroOpacity();
stringAnimation();
whatIDoanimation()