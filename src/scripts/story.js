import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { annotate } from 'rough-notation';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Theme toggle */
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  recolorAnnotations();
});

/* Preloader: signature draws, then fades. Click skips. */
const pre = document.getElementById('preloader');
if (pre) {
  const hide = () => pre.classList.add('done');
  if (reduced) pre.remove();
  else {
    setTimeout(hide, 1700);
    pre.addEventListener('click', hide);
  }
}

/* About: pinned and scroll-driven. One paragraph at a time, centred; scrolling reveals it line by line,
   draws the pen annotations and writes the corrections. Scrolling back undoes everything. */
const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
const TYPES = { hl: 'highlight', ul: 'underline', ci: 'circle', x: 'strike-through' };
const colorFor = (kind) => css(kind === 'hl' ? '--ann-hl' : '--ann-pen');
const items = [];

function make(el) {
  const kind = el.dataset.ann;
  const a = annotate(el, {
    type: TYPES[kind],
    color: colorFor(kind),
    animate: false,
    strokeWidth: kind === 'hl' ? 1 : 2,
    padding: kind === 'ci' ? 6 : 2,
    iterations: kind === 'hl' ? 1 : 2,
    multiline: true,
  });
  a.show();
  a.detachListeners?.(); // we own the drawing state; the library must not redraw it
  a._ro?.disconnect();
  return a;
}

function recolorAnnotations() {
  items.forEach((entry) => {
    entry.a?._svg?.querySelectorAll('path').forEach((path) => path.setAttribute('stroke', colorFor(entry.el.dataset.ann)));
  });
}

/* wrap every word of a paragraph so lines can be revealed one by one */
function splitWords(par) {
  const walker = document.createTreeWalker(par, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement.closest('ins.fix') || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const w = document.createElement('span');
      w.className = 'w';
      w.textContent = part;
      frag.append(w);
    });
    node.replaceWith(frag);
  });
}

const paras = [...document.querySelectorAll('.para')];
paras.forEach(splitWords);
document.querySelectorAll('.ann').forEach((el) => {
  const next = el.nextElementSibling;
  items.push({ el, a: null, fix: next && next.classList.contains('fix') ? next : null });
});

const groupLines = (words) => {
  const lines = [];
  let top = null;
  words.forEach((w) => {
    const t = w.getBoundingClientRect().top;
    if (top === null || Math.abs(t - top) > 12) { lines.push([]); top = t; }
    lines[lines.length - 1].push(w);
  });
  return lines;
};

let aboutCtx = null;
function buildAbout() {
  const about = document.getElementById('about');
  if (!about || !paras.length) return;
  root.classList.add('about-pinned');

  aboutCtx = gsap.context(() => {
    // shrink any paragraph that would not fit the screen
    paras.forEach((par) => {
      const fs = parseFloat(getComputedStyle(par).fontSize);
      const max = window.innerHeight * 0.74;
      if (par.offsetHeight > max) gsap.set(par, { fontSize: fs * Math.sqrt(max / par.offsetHeight) * 0.97 });
    });

    // measure in the final layout (corrections written), then collapse the corrections
    items.forEach((entry) => { entry.a = make(entry.el); });
    const fixes = items.filter((i) => i.fix).map((i) => {
      const cs = getComputedStyle(i.fix);
      i.fixW = i.fix.scrollWidth;
      i.fixM = parseFloat(cs.marginLeft);
      return i;
    });

    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    gsap.set(paras, { opacity: 0 });
    fixes.forEach((i) => gsap.set(i.fix, { maxWidth: 0, marginLeft: 0 }));

    paras.forEach((par) => {
      const words = [...par.querySelectorAll('.w')];
      const lines = groupLines(words);
      const anns = items.filter((i) => par.contains(i.el));
      gsap.set(words, { opacity: 0, y: 10 });

      tl.to(par, { opacity: 1, duration: 0.25 });
      lines.forEach((line) => {
        tl.to(line, { opacity: 1, y: 0, duration: 0.5, stagger: 0.5 / Math.max(line.length, 1) });
        anns.filter((i) => !i.done && [...i.el.querySelectorAll('.w')].pop() && line.includes([...i.el.querySelectorAll('.w')].pop())).forEach((i) => {
          i.done = true;
          const paths = [...(i.a._svg?.querySelectorAll('path') || [])];
          paths.forEach((path) => {
            const len = path.getTotalLength();
            gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
            tl.to(path, { strokeDashoffset: 0, duration: 0.55 / paths.length + 0.1 });
          });
          if (i.fix) tl.to(i.fix, { maxWidth: i.fixW, marginLeft: i.fixM, duration: 0.6 });
        });
      });
      tl.to({}, { duration: 1 });
      tl.to(par, { opacity: 0, duration: 0.3 });
    });
    // last paragraph stays on screen as the section scrolls away
    tl.set(paras[paras.length - 1], { opacity: 1 }, '>').to({}, { duration: 0.6 });
    items.forEach((i) => { i.done = false; });

    ScrollTrigger.create({
      trigger: about, start: 'top top', end: () => `+=${Math.round(tl.duration() * window.innerHeight * 0.24)}`,
      pin: true, scrub: 0.4, animation: tl, refreshPriority: 1,
    });
  });
}

function destroyAbout() {
  aboutCtx?.revert();
  aboutCtx = null;
  items.forEach((i) => { i.a?.remove(); i.a = null; i.done = false; });
  root.classList.remove('about-pinned');
}

if (reduced) {
  items.forEach((entry) => { entry.a = make(entry.el); });
} else {
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    buildAbout();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    let lastW = window.innerWidth;
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        destroyAbout();
        buildAbout();
        ScrollTrigger.refresh();
      }, 300);
    });
  });
}

/* Projects: polaroids land and stack while the section is pinned (desktop only) */
const mm = gsap.matchMedia();
mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
  const stage = document.getElementById('stage');
  const projects = gsap.utils.toArray('.project');
  if (!stage || !projects.length) return;

  projects.forEach((p, i) => {
    gsap.set(p.querySelector('.polaroid'), { autoAlpha: 0, y: '60vh', rotation: (i % 2 ? 1 : -1) * 14, scale: 1.1, zIndex: i + 1 });
    gsap.set([p.querySelector('.txt-l'), p.querySelector('.txt-r')], { autoAlpha: 0, y: 24 });
  });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: document.getElementById('projects'), start: 'top top', end: `+=${projects.length * 90}%`, pin: true, scrub: 0.6 },
  });
  projects.forEach((p, i) => {
    const pol = p.querySelector('.polaroid');
    const texts = [p.querySelector('.txt-l'), p.querySelector('.txt-r')];
    const rot = parseFloat(getComputedStyle(pol).getPropertyValue('--rot')) || 0;
    if (i > 0) {
      const prev = projects[i - 1];
      tl.to([prev.querySelector('.txt-l'), prev.querySelector('.txt-r')], { autoAlpha: 0, y: -24, duration: 0.4 }, '>');
    }
    tl.to(pol, { autoAlpha: 1, y: 0, rotation: rot, scale: 1, duration: 1, ease: 'power3.out' }, '>-0.1')
      .to(texts, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, '<0.3')
      .to({}, { duration: 0.8 });
  });
});

/* Mobile and reduced motion: simple fade-in per project */
mm.add('(max-width: 768px), (prefers-reduced-motion: reduce)', () => {
  if (reduced) return;
  gsap.utils.toArray('.project').forEach((p) => {
    gsap.from(p, { autoAlpha: 0, y: 40, duration: 0.7, scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
  });
});
