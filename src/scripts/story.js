import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { annotate } from 'rough-notation';
import { drawSignature } from './signature.js';

gsap.registerPlugin(ScrollTrigger);

/* scroll distance of the About story: viewport heights of scrolling per timeline unit (higher = slower) */
const ABOUT_SCROLL_PER_UNIT = 0.3;

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Theme toggle */
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  recolorAnnotations();
});

/* Preloader: the signature is drawn stroke by stroke, then fades. Click skips. */
const pre = document.getElementById('preloader');
let preDone = Promise.resolve();
if (pre) {
  if (reduced) pre.remove();
  else {
    preDone = new Promise((resolve) => {
      let finished = false;
      const hide = () => {
        if (finished) return;
        finished = true;
        pre.classList.add('done');
        resolve();
      };
      pre.addEventListener('click', hide);
      setTimeout(hide, 5000);
      drawSignature(document.getElementById('sig-canvas'), 2.1)
        .then(() => setTimeout(hide, 350))
        .catch(hide);
    });
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
  items.push({ el, scope: el.closest('.hero') ? 'hero' : 'about', a: null, fix: next && next.classList.contains('fix') ? next : null });
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

function collapseFixes(list) {
  list.filter((i) => i.fix).forEach((i) => {
    i.fixW = i.fix.scrollWidth;
    i.fixM = parseFloat(getComputedStyle(i.fix).marginLeft);
    gsap.set(i.fix, { maxWidth: 0, marginLeft: 0 });
  });
}

function addAnnotation(tl, i, drawDur) {
  const paths = [...(i.a._svg?.querySelectorAll('path') || [])];
  paths.forEach((path) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    tl.to(path, { strokeDashoffset: 0, duration: drawDur / paths.length + 0.1 });
  });
  if (i.fix) tl.to(i.fix, { maxWidth: i.fixW, marginLeft: i.fixM, duration: 0.6 });
}

let heroCtx = null;
/* Hero: plays once after the preloader (not scroll-driven; it is the intro) */
function buildHero() {
  const lines = [...document.querySelectorAll('.hero-line')];
  if (!lines.length) return;
  heroCtx = gsap.context(() => {
    const mine = items.filter((i) => i.scope === 'hero');
    // lock each line to its final width so corrections grow rightwards without shifting the text
    lines.forEach((l) => gsap.set(l, { width: Math.ceil(l.getBoundingClientRect().width) + 1 }));
    mine.forEach((entry) => { entry.a = make(entry.el); });
    collapseFixes(mine);
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.out' } });
    preDone.then(() => tl.delay(0.2).play());
    lines.forEach((l, k) => {
      tl.fromTo(l, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, k ? '+=0.3' : 0);
      mine.filter((i) => l.contains(i.el)).forEach((i) => { tl.to({}, { duration: 0.35 }); addAnnotation(tl, i, 0.7); });
    });
  });
}

let aboutCtx = null;
let aboutTl = null;
let aboutSt = null;
/* the About nav link lands on the personal story ("I came to this by building") */
const BIO_SCENE = 3;
const aboutTarget = () => {
  if (!aboutSt || !aboutTl) return null;
  const t = aboutTl.labels.bio ?? 0;
  return Math.round(aboutSt.start + (t / aboutTl.duration()) * (aboutSt.end - aboutSt.start));
};
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
    const aboutItems = items.filter((i) => i.scope === 'about');
    aboutItems.forEach((entry) => { entry.a = make(entry.el); });
    collapseFixes(aboutItems);

    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    gsap.set(paras, { opacity: 0 });

    paras.forEach((par, sceneIdx) => {
      const words = [...par.querySelectorAll('.w')];
      const lines = groupLines(words);
      const anns = items.filter((i) => par.contains(i.el));
      gsap.set(words, { opacity: 0, y: 10 });

      if (sceneIdx === 0) tl.set(par, { opacity: 1 });
      else tl.to(par, { opacity: 1, duration: 0.25 });
      lines.forEach((line, lineIdx) => {
        tl.to(line, { opacity: 1, y: 0, duration: 0.5, stagger: 0.5 / Math.max(line.length, 1) });
        anns.filter((i) => !i.done && [...i.el.querySelectorAll('.w')].pop() && line.includes([...i.el.querySelectorAll('.w')].pop())).forEach((i) => {
          i.done = true;
          addAnnotation(tl, i, 0.55);
        });
        if (sceneIdx === BIO_SCENE && lineIdx === 0) tl.addLabel('bio', '>+=0.2');
      });
      tl.to({}, { duration: 1 });
      tl.to(par, { opacity: 0, duration: 0.3 });
    });
    // last paragraph stays on screen as the section scrolls away
    tl.set(paras[paras.length - 1], { opacity: 1 }, '>').to({}, { duration: 0.6 });
    items.forEach((i) => { i.done = false; });

    aboutTl = tl;
    aboutSt = ScrollTrigger.create({
      trigger: about, start: 'top top', end: () => `+=${Math.round(tl.duration() * window.innerHeight * ABOUT_SCROLL_PER_UNIT)}`,
      pin: true, scrub: 0.4, animation: tl, refreshPriority: 1,
    });
  });
}

function destroyAbout() {
  aboutCtx?.revert();
  aboutCtx = null;
  aboutTl = null;
  aboutSt = null;
  heroCtx?.revert();
  heroCtx = null;
  items.forEach((i) => { i.a?.remove(); i.a = null; i.done = false; });
  root.classList.remove('about-pinned');
}

if (reduced) {
  items.forEach((entry) => { entry.a = make(entry.el); });
} else {
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    buildHero();
    buildAbout();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    if (location.hash === '#about') [60, 500].forEach((ms) => setTimeout(() => { const y = aboutTarget(); if (y !== null) window.scrollTo(0, y); }, ms));
    let lastW = window.innerWidth;
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        destroyAbout();
        buildHero();
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

  // the first project is already in place, so jumping to #projects never lands on an empty screen
  projects.forEach((p, i) => {
    gsap.set(p.querySelector('.polaroid'), { zIndex: i + 1 });
    if (i === 0) return;
    gsap.set(p.querySelector('.polaroid'), { autoAlpha: 0, y: '60vh', rotation: (i % 2 ? 1 : -1) * 14, scale: 1.1 });
    gsap.set([p.querySelector('.txt-l'), p.querySelector('.txt-r')], { autoAlpha: 0, y: 24 });
  });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: document.getElementById('projects'), start: 'top top', end: `+=${projects.length * 90}%`, pin: true, scrub: 0.6 },
  });
  projects.forEach((p, i) => {
    const pol = p.querySelector('.polaroid');
    const texts = [p.querySelector('.txt-l'), p.querySelector('.txt-r')];
    const rot = parseFloat(getComputedStyle(pol).getPropertyValue('--rot')) || 0;
    if (i === 0) { tl.to({}, { duration: 0.8 }); return; }
    {
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

/* About lands on the personal story; the nav link goes there instead of the top of the pinned section */
document.querySelectorAll('a[href="#about"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const y = aboutTarget();
    if (y === null) return;
    e.preventDefault();
    history.replaceState(null, '', '#about');
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* the "Scroll" hint fades out as soon as scrolling starts */
const hint = document.querySelector('.scroll-hint');
if (hint && !reduced) {
  gsap.to(hint, { opacity: 0, ease: 'none', scrollTrigger: { start: 0, end: 160, scrub: true } });
}
