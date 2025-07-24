function dragSlider() {
  let galleryState = {
    container: null,
    track: null,
    items: null,
    images: null,
    draggable: null,
    totalItems: 0,
    itemMarginRight: 20,
    maxScroll: 0,
    containerWidth: 0,
    totalWidth: 0,
    parallaxFactors: [],
    parallaxEnabledFlags: [],
    parallaxActive: false,
  };

  const initializeElements = () => {
    galleryState.container = document.querySelector('.action-padding');
    galleryState.track = document.querySelector('.action-content__collection-list');
    galleryState.items = document.querySelectorAll('.action-content__collection-item');
    galleryState.images = document.querySelectorAll('.action-content__collection-image');

    galleryState.totalItems = galleryState.items.length;
    galleryState.totalWidth = galleryState.track.scrollWidth;
    galleryState.containerWidth = galleryState.container.offsetWidth;
    galleryState.maxScroll = -(galleryState.totalWidth - galleryState.containerWidth);

    if (galleryState.maxScroll > 0) {
      galleryState.maxScroll = 0;
    }
  };

  const setupParallax = () => {
    galleryState.parallaxFactors = [];
    galleryState.parallaxEnabledFlags = [];

    const widths = Array.from(galleryState.items).map((item) => item.offsetWidth);
    const minWidth = Math.min(...widths);
    const maxWidth = Math.max(...widths);

    galleryState.items.forEach((item, i) => {
      const width = item.offsetWidth;

      const normalized = (width - minWidth) / (maxWidth - minWidth || 1);
      const sizeFactor = 1 - normalized;

      const randomFactor = gsap.utils.random(0.8, 1.2);
      const movementFactor = sizeFactor * randomFactor;

      galleryState.parallaxFactors.push(movementFactor);
      galleryState.parallaxEnabledFlags.push(Math.random() < 0.6);

      gsap.set(item, {
        x: 0,
        transformOrigin: 'center center',
        force3D: true,
      });
    });
  };

  const updateParallax = () => {
    if (!galleryState.draggable || !galleryState.parallaxActive) return;

    const containerRect = galleryState.container.getBoundingClientRect();
    const currentX = galleryState.draggable.x;
    const maxScroll = galleryState.maxScroll || -1;

    const progress = gsap.utils.clamp(0, 1, Math.abs(currentX) / Math.abs(maxScroll));

    galleryState.items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const parallaxEnabled = galleryState.parallaxEnabledFlags[index];
      if (!parallaxEnabled) return;

      const isInViewport =
        itemRect.left < containerRect.right && itemRect.right > containerRect.left;

      const movementFactor = galleryState.parallaxFactors[index];
      const maxOffsetPx = 100;
      const offset = -maxOffsetPx * movementFactor * progress;

      gsap.to(item, {
        x: isInViewport ? offset : 0,
        duration: 0.3,
        ease: 'power2.out',
        force3D: true,
      });
    });
  };

  const activateParallaxAndUpdate = () => {
    if (!galleryState.parallaxActive) {
      galleryState.parallaxActive = true;
    }
    updateParallax();
  };

  const setupDraggable = () => {
    if (galleryState.draggable) {
      galleryState.draggable.kill();
    }

    galleryState.draggable = Draggable.create(galleryState.track, {
      type: 'x',
      bounds: {
        minX: galleryState.maxScroll,
        maxX: 0,
      },
      inertia: true,
      throwResistance: 500, // Lower = more inertia (default is ~1000)
      maxDuration: 2.5, // Maximum throw duration (increase to extend glide)
      minDuration: 0.5, // Minimum throw duration
      onDrag: activateParallaxAndUpdate,
      onThrowUpdate: activateParallaxAndUpdate,
      onThrowComplete: activateParallaxAndUpdate,
    })[0];

    gsap.set(galleryState.track, {
      transformOrigin: 'left center',
      force3D: true,
    });
  };

  const initGallery = () => {
    initializeElements();
    setupParallax();
    setupDraggable();

    window.addEventListener('resize', () => {
      initializeElements();
      setupDraggable();

      if (galleryState.draggable) {
        galleryState.draggable.x = gsap.utils.clamp(
          galleryState.maxScroll,
          0,
          galleryState.draggable.x,
        );
        gsap.set(galleryState.track, { x: galleryState.draggable.x });
        updateParallax();
      }
    });
  };

  const addEntranceAnimations = () => {
    gsap.from('.action-content__collection-item', {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.2,
    });

    gsap.from('.info-panel', {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });
  };

  initGallery();
  addEntranceAnimations();
}

dragSlider();
