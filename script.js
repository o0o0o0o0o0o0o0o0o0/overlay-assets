const gallery = document.querySelector('.gallery');

function cardsScrollGallery() {
  const originalCards = document.querySelectorAll('.card');
  const section = document.querySelector('.section.is--sticky-section');
  const sectionTriggers = section.querySelectorAll('.vision-block');
  const galleryTriggerHeight = section.offsetHeight / sectionTriggers.length;

  const getResponsiveConfig = () => {
    const width = window.innerWidth;

    if (width <= 768) {
      return {
        imageCount: 26,
        radius: 980,
        initialRotation: -90,
        endRotation: -270,
      };
    } else {
      return {
        imageCount: 18,
        radius: 980,
        initialRotation: -130,
        endRotation: -310,
      };
    }
  };

  let config = getResponsiveConfig();
  let scrollTrigger;
  // Clone elements if needed
  const cards = [];
  const originalCount = originalCards.length;

  // Add original cards first
  originalCards.forEach((card) => cards.push(card));

  // Clone cards if we need more to reach imageCount
  if (originalCount < config.imageCount) {
    console.log(originalCount);
    const neededClones = config.imageCount - originalCount;

    for (let i = 0; i < neededClones; i++) {
      const sourceIndex = i % originalCount; // Cycle through original cards
      const originalCard = originalCards[sourceIndex];
      const clonedCard = originalCard.cloneNode(true);

      // Add a class to identify clones (optional, for styling or debugging)
      clonedCard.classList.add('card-clone');

      // Append to gallery
      gallery.appendChild(clonedCard);
      cards.push(clonedCard);
    }
  }

  const transformState = [];

  // Position all cards (originals + clones) in a circle
  cards.forEach((card, index) => {
    const angle = (index / config.imageCount) * Math.PI * 2;
    const x = Math.cos(angle) * config.radius;
    const y = Math.sin(angle) * config.radius;

    gsap.set(card, {
      x: x,
      y: y,
      z: 0,
      rotation: (angle * 180) / Math.PI + 90,
      transformPerspective: 800,
      transformOrigin: 'center center',
    });

    transformState.push({ angle });
  });

  const updateAnimation = () => {
    config = getResponsiveConfig();

    // Kill existing ScrollTrigger
    if (scrollTrigger) {
      scrollTrigger.kill();
    }

    // Reset initial state
    gsap.set(gallery, {
      rotation: config.initialRotation,
      scale: config.scale,
      y: config.yPosition,
    });

    // Create new animation
    scrollTrigger = gsap.to(gallery, {
      rotation: config.endRotation,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: '2% top',
        end: '50% bottom',
        scrub: true,
      },
    });
  };

  // Initial setup
  updateAnimation();

  // Update on resize
  window.addEventListener('resize', () => {
    updateAnimation();
  });
}

cardsScrollGallery();
