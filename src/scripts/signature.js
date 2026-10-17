import { gsap } from 'gsap';

/* Draws the signature stroke by stroke. signature-time.png encodes, per pixel, when the pen
   reaches it (starting at the top of the O, ending with the long crossbar). */
const load = (src) => new Promise((res, rej) => {
  const img = new Image();
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = src;
});

const pixels = (img) => {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height);
};

export async function drawSignature(canvas, duration = 2.1) {
  const [shape, time] = await Promise.all([load('/sig/signature-small.png'), load('/sig/signature-time.png')]);
  const src = pixels(shape), t = pixels(time);
  canvas.width = src.width; canvas.height = src.height;
  const ctx = canvas.getContext('2d');
  const out = ctx.createImageData(src.width, src.height);
  out.data.set(src.data);
  const n = src.width * src.height;
  const soft = 4;
  const render = (p) => {
    const thr = p * (255 + soft);
    for (let i = 0; i < n; i++) {
      const k = (thr - t.data[i * 4]) / soft;
      out.data[i * 4 + 3] = k >= 1 ? src.data[i * 4 + 3] : k <= 0 ? 0 : src.data[i * 4 + 3] * k;
    }
    ctx.putImageData(out, 0, 0);
  };
  render(0);
  const state = { p: 0 };
  return new Promise((resolve) => {
    gsap.to(state, { p: 1, duration, ease: 'none', onUpdate: () => render(state.p), onComplete: resolve });
  });
}
