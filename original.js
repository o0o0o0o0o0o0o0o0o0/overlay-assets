function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }
  offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
  offsetY = typeof offsetY === 'number' ? offsetY : 0.5;
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;
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
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;
  cw = iw / (nw / w);
  ch = ih / (nh / h);
  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

// Apply interaction to all elements with this class
document.querySelectorAll('.sections-wrapper').forEach((element) => {
  const canvas = element.querySelector('canvas');
  const embed = element.querySelector('.embed');
  const context = canvas.getContext('2d');

  function setCanvasSize() {
    // Get the parent element's dimensions
    var parentWidth = embed.clientWidth;
    var parentHeight = embed.clientHeight;

    // Calculate canvas size in pixels based on percentages
    var canvasWidth = parentWidth * 1; // 50% of parent width
    var canvasHeight = parentHeight * 1; // 95% of parent height

    // Set the canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  setCanvasSize();

  const frameCount = element.getAttribute('total-frames');
  const urlStart = element.getAttribute('url-start');
  const urlEnd = element.getAttribute('url-end');
  const floatingZeros = element.getAttribute('floating-zeros');

  const currentFrame = (i) => `${urlStart}${i.toString().padStart(floatingZeros, '0')}${urlEnd}`;

  console.log(currentFrame);

  const images = [];
  const imageFrames = {
    frame: 0,
  };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

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

  function render() {
    context.clearRect(0, 0, embed.offsetWidth, embed.offsetHeight);
    drawImageProp(
      context,
      images[imageFrames.frame],
      0,
      0,
      embed.offsetWidth,
      embed.offsetHeight,
      0.5,
      0.5,
    );
  }

  let iOS = !!navigator.platform.match(/iPhone|iPod|iPad/);
  let resizeTimer;
  window.addEventListener('resize', function (e) {
    if (iOS) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setCanvasSize();
        render();
      }, 250);
    } else {
      setCanvasSize();
      render();
    }
  });
});
