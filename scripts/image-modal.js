const imageModal = document.getElementById("image-modal");
const imageModalImg = document.getElementById("image-modal-img");
const imageModalClose = document.getElementById("image-modal-close");
const portfolioImages = document.getElementsByClassName("portfolio-image");

const imageUrls = [];
for (let i = 0; i < portfolioImages.length; i++) {
  imageUrls.push(portfolioImages[i].src.replace("_thumbnail", ""));
}

let currentImageIndex = 0;
let isAnimating = false;
const preloadCache = new Map();

imageModalImg.onload = () => imageModalImg.classList.add("loaded");

function preloadImage(url) {
  if (preloadCache.has(url)) return preloadCache.get(url);
  const img = new Image();
  img.src = url;
  preloadCache.set(url, img);
  return img;
}

function preloadAdjacent(index) {
  const prev = index === 0 ? imageUrls.length - 1 : index - 1;
  const next = index === imageUrls.length - 1 ? 0 : index + 1;
  preloadImage(imageUrls[prev]);
  preloadImage(imageUrls[next]);
}

// --- Drag state ---
let isDragging = false;
let dragAxis = null;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

function handleDragStart(e) {
  if (isAnimating) return;
  e.preventDefault();

  isDragging = true;
  dragAxis = null;
  startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
  startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
  currentX = startX;
  currentY = startY;

  imageModalImg.style.transition = 'none';

  if (e.type === 'mousedown') {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  } else {
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  }
}

function handleDragMove(e) {
  if (!isDragging) return;
  e.preventDefault();

  currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
  currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

  const deltaX = currentX - startX;
  const deltaY = currentY - startY;

  if (!dragAxis) {
    const threshold = 10;
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      dragAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    } else {
      return;
    }
  }

  if (dragAxis === 'vertical') {
    const dismissRange = window.innerHeight * 0.25;
    const opacity = Math.max(0, 1 - (Math.abs(deltaY) / dismissRange));
    imageModalImg.style.transform = `translateY(${deltaY}px)`;
    imageModalImg.style.opacity = opacity;
  } else {
    imageModalImg.style.transform = `translateX(${deltaX}px)`;
    const fadeRange = window.innerWidth * 0.5;
    imageModalImg.style.opacity = Math.max(0.4, 1 - (Math.abs(deltaX) / fadeRange));
  }
}

function handleDragEnd() {
  if (!isDragging) return;
  isDragging = false;

  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  document.removeEventListener('touchmove', handleDragMove);
  document.removeEventListener('touchend', handleDragEnd);

  const deltaX = currentX - startX;
  const deltaY = currentY - startY;

  if (dragAxis === 'vertical') {
    imageModalImg.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    const dismissThreshold = window.innerHeight * 0.05;
    if (Math.abs(deltaY) > dismissThreshold) {
      closeModal();
    } else {
      imageModalImg.style.transform = '';
      imageModalImg.style.opacity = '';
    }
  } else if (dragAxis === 'horizontal') {
    const swipeThreshold = 50;
    if (Math.abs(deltaX) > swipeThreshold) {
      deltaX < 0 ? navigateNext() : navigatePrev();
    } else {
      imageModalImg.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      imageModalImg.style.transform = '';
      imageModalImg.style.opacity = '';
    }
  } else {
    imageModalImg.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    imageModalImg.style.transform = '';
    imageModalImg.style.opacity = '';
  }
}

// --- Image navigation ---

function navigateNext() {
  if (isAnimating) return;
  const nextIndex = currentImageIndex === imageUrls.length - 1 ? 0 : currentImageIndex + 1;
  animateToImage(nextIndex, -1);
}

function navigatePrev() {
  if (isAnimating) return;
  const nextIndex = currentImageIndex === 0 ? imageUrls.length - 1 : currentImageIndex - 1;
  animateToImage(nextIndex, 1);
}

function animateToImage(nextIndex, slideDirection) {
  isAnimating = true;

  const slideOutX = slideDirection * window.innerWidth;
  const slideInX = -slideDirection * window.innerWidth;

  const preloaded = preloadImage(imageUrls[nextIndex]);

  imageModalImg.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
  imageModalImg.style.transform = `translateX(${slideOutX}px)`;
  imageModalImg.style.opacity = '0';

  setTimeout(() => {
    imageModalImg.classList.remove("loaded");
    imageModalImg.style.transition = 'none';
    imageModalImg.style.transform = `translateX(${slideInX}px)`;
    imageModalImg.style.opacity = '0';

    function slideIn() {
      imageModalImg.src = imageUrls[nextIndex];
      currentImageIndex = nextIndex;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          imageModalImg.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
          imageModalImg.style.transform = 'translateX(0)';
          imageModalImg.style.opacity = '1';

          setTimeout(() => {
            imageModalImg.classList.add("loaded");
            imageModalImg.style.transform = '';
            imageModalImg.style.opacity = '';
            imageModalImg.style.transition = '';
            isAnimating = false;
            preloadAdjacent(currentImageIndex);
          }, 320);
        });
      });
    }

    if (preloaded.complete && preloaded.naturalWidth > 0) {
      slideIn();
    } else {
      preloaded.onload = slideIn;
      preloaded.onerror = slideIn;
    }
  }, 300);
}

// --- Scroll prevention ---

function preventScroll(e) {
  if (imageModal.classList.contains("active")) {
    e.preventDefault();
  }
}

function addScrollPrevention() {
  document.addEventListener("wheel", preventScroll, { passive: false });
  document.addEventListener("touchmove", preventScroll, { passive: false });
}

function removeScrollPrevention() {
  document.removeEventListener("wheel", preventScroll);
  document.removeEventListener("touchmove", preventScroll);
}

// --- Modal open/close ---

function openModal() {
  imageModal.classList.add("active");
  addScrollPrevention();
  imageModalImg.addEventListener('mousedown', handleDragStart);
  imageModalImg.addEventListener('touchstart', handleDragStart);
}

function closeModal() {
  imageModal.classList.remove("active");
  removeScrollPrevention();
  imageModalImg.classList.remove("loaded");
  imageModalImg.style.transform = '';
  imageModalImg.style.opacity = '';
  imageModalImg.style.transition = '';
  imageModalImg.removeEventListener('mousedown', handleDragStart);
  imageModalImg.removeEventListener('touchstart', handleDragStart);
  isAnimating = false;
}

// --- Setup listeners ---

for (let i = 0; i < portfolioImages.length; i++) {
  portfolioImages[i].addEventListener("click", function () {
    currentImageIndex = i;
    imageModalImg.src = imageUrls[i];
    openModal();
    preloadAdjacent(i);
  });
}

imageModalClose.addEventListener("click", closeModal);
imageModal.addEventListener("click", function (event) {
  if (event.target === imageModal) {
    closeModal();
  }
});

document.addEventListener('keydown', function (event) {
  if (!imageModal.classList.contains("active")) return;
  switch (event.key) {
    case 'Escape':
      closeModal();
      break;
    case 'ArrowRight':
      navigateNext();
      break;
    case 'ArrowLeft':
      navigatePrev();
      break;
  }
});
