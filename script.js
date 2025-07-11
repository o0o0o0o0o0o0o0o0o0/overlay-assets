function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }
  offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
  offsetY = typeof offsetY === 'number' ? offsetY : 0.5;
  offsetX = Math.max(0, Math.min(1, offsetX));
  offsetY = Math.max(0, Math.min(1, offsetY));
  var iw = img.width,
    ih = img.height,
    r = Math.min(w / iw, h / ih),
    nw = iw * r,
    nh = ih * r,
    cx,
    cy,
    cw,
    ch,
    ar = 1;
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  nw *= ar;
  nh *= ar;
  cw = iw / (nw / w);
  ch = ih / (nh / h);
  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;
  cx = Math.max(0, cx);
  cy = Math.max(0, cy);
  cw = Math.min(iw, cw);
  ch = Math.min(ih, ch);
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

function drawImageContain(ctx, img, x = 0, y = 0, w, h, offsetX = 0.5, offsetY = 0.5) {
  if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return;
  w = w || ctx.canvas.width;
  h = h || ctx.canvas.height;
  offsetX = Math.min(Math.max(offsetX, 0), 1);
  offsetY = Math.min(Math.max(offsetY, 0), 1);
  const iw = img.width;
  const ih = img.height;
  const scale = Math.min(w / iw, h / ih);
  const nw = iw * scale;
  const nh = ih * scale;
  const dx = x + (w - nw) * offsetX;
  const dy = y + (h - nh) * offsetY;
  ctx.drawImage(img, dx, dy, nw, nh);
}

document.querySelectorAll('.sections-wrapper').forEach((element) => {
  const canvas = element.querySelector('canvas') || document.createElement('canvas');
  const embed = element.querySelector('.embed') || element; // fallback to section if no .embed
  const context = canvas.getContext('2d');
  if (!canvas.parentNode) element.appendChild(canvas);

  const fit = element.getAttribute('data-fit');
  const behavior = element.getAttribute('data-behavior');
  const speed = parseFloat(element.getAttribute('data-speed')) || 1;

  function setCanvasSize() {
    canvas.width = embed.clientWidth;
    canvas.height = embed.clientHeight;
  }

  setCanvasSize();

  const frameCount = parseInt(element.getAttribute('total-frames'));
  const urlStart = element.getAttribute('url-start');
  const urlEnd = element.getAttribute('url-end');
  const floatingZeros = parseInt(element.getAttribute('floating-zeros'));
  const currentFrame = (i) => `${urlStart}${i.toString().padStart(floatingZeros, '0')}${urlEnd}`;

  const images = [];
  const imageFrames = { frame: 0 };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const img = images[imageFrames.frame];
    if (fit === 'contain') {
      drawImageContain(context, img, 0, 0, canvas.width, canvas.height, 0.5, 0.5);
    } else {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  if (behavior === 'loop') {
    let frame = 0;
    let lastTime = 0;
    const frameInterval = 1000 / (frameCount * speed);

    function animate(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;

      if (delta >= frameInterval) {
        imageFrames.frame = frame;
        render();
        frame = (frame + 1) % frameCount;
        lastTime = timestamp;
      }

      requestAnimationFrame(animate);
    }

    images[0].onload = () => requestAnimationFrame(animate);
  } else {
    gsap.to(imageFrames, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: element.getAttribute('scroll-start'),
        end: element.getAttribute('scroll-end'),
        scrub: 0,
      },
      onUpdate: render,
    });

    images[0].onload = render;
  }

  const iOS = /iPhone|iPad|iPod/.test(navigator.platform);
  let resizeTimer;
  window.addEventListener('resize', () => {
    if (iOS) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setCanvasSize();
        render();
      }, 250);
    } else {
      setCanvasSize();
      render();
    }
  });
});
