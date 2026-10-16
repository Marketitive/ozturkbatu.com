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
  rebuildShownAnnotations();
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

/* About: sentences fade in, annotations draw like a pen */
const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
const TYPES = { hl: 'highlight', ul: 'underline', ci: 'circle', x: 'strike-through' };
const items = [];

function make(el, animate) {
  const kind = el.dataset.ann;
  const type = TYPES[kind];
  const a = annotate(el, {
    type,
    color: kind === 'hl' ? css('--ann-hl') : css('--ann-pen'),
    animate,
    animationDuration: kind === 'ci' ? 900 : 700,
    strokeWidth: kind === 'hl' ? 1 : 2,
    padding: kind === 'ci' ? 6 : 2,
    iterations: kind === 'hl' ? 1 : 2,
    multiline: true,
  });
  a.show();
  return a;
}

function rebuildShownAnnotations() {
  items.forEach((entry) => {
    if (!entry.shown) return;
    entry.a?.remove();
    entry.a = make(entry.el, false);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

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

async function drawAnnotation(entry) {
  entry.shown = true;
  entry.a = make(entry.el, true);
  await sleep(750);
  if (entry.fix) {
    entry.fix.style.maxWidth = entry.fix.scrollWidth + 'px';
    entry.fix.classList.add('show');
    await sleep(700);
  }
}

async function waitUntilVisible(el) {
  while (el.getBoundingClientRect().top > window.innerHeight * 0.88) await sleep(80);
}

/* each paragraph plays line by line; lines are measured live so corrections that widen a line reflow correctly */
async function playParagraph(par) {
  const words = [...par.querySelectorAll('.w')];
  const anns = items.filter((i) => par.contains(i.el));
  let idx = 0;
  while (idx < words.length) {
    await waitUntilVisible(words[idx]);
    const top = words[idx].getBoundingClientRect().top;
    const tol = parseFloat(getComputedStyle(par).lineHeight) / 2 || 14;
    const line = [];
    while (idx < words.length && Math.abs(words[idx].getBoundingClientRect().top - top) < tol) line.push(words[idx++]);
    line.forEach((w, k) => setTimeout(() => w.classList.add('in'), k * 35));
    await sleep(line.length * 35 + 450);
    for (const entry of anns) {
      if (entry.shown) continue;
      const last = [...entry.el.querySelectorAll('.w')].pop();
      if (last && line.includes(last)) await drawAnnotation(entry);
    }
    await nextFrame();
  }
}

document.querySelectorAll('.ann').forEach((el) => {
  const next = el.nextElementSibling;
  items.push({ el, shown: false, a: null, fix: next && next.classList.contains('fix') ? next : null });
});

const paras = [...document.querySelectorAll('.para')];
paras.forEach(splitWords);
if (reduced) {
  document.querySelectorAll('.w').forEach((w) => w.classList.add('in'));
  items.forEach((entry) => { entry.shown = true; entry.a = make(entry.el, false); });
} else {
  (async () => {
    for (const par of paras) await playParagraph(par);
  })();
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
