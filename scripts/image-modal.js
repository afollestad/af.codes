(function () {
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

  // --- Zoom state ---

  let zoomScale = 1;
  let panX = 0;
  let panY = 0;
  const MAX_ZOOM = 5;

  function isZoomed() {
    return zoomScale > 1.01;
  }

  function applyZoomTransform(extraTx, extraTy) {
    const tx = panX + (extraTx || 0);
    const ty = panY + (extraTy || 0);
    imageModalImg.style.transform = `translate(${tx}px, ${ty}px) scale(${zoomScale})`;
  }

  function resetZoom(animate) {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    if (animate) {
      imageModalImg.style.transition = 'transform 0.3s ease-out';
      imageModalImg.style.transform = '';
    }
  }

  function setZoomAtPoint(newScale, pointX, pointY) {
    newScale = Math.min(MAX_ZOOM, Math.max(1, newScale));
    if (Math.abs(newScale - zoomScale) < 0.001) return;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const ratio = newScale / zoomScale;

    panX = panX * ratio + (pointX - cx) * (1 - ratio);
    panY = panY * ratio + (pointY - cy) * (1 - ratio);
    zoomScale = newScale;

    if (zoomScale < 1.01) {
      zoomScale = 1;
      panX = 0;
      panY = 0;
      imageModalImg.style.transform = '';
    } else {
      applyZoomTransform();
    }
  }

  function touchDistance(a, b) {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // --- Drag state ---

  let isDragging = false;
  let dragAxis = null;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;

  // --- Pinch state ---

  let isPinching = false;
  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let lastMidX = 0;
  let lastMidY = 0;

  // --- Double-tap / double-click zoom ---

  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;
  const DOUBLE_TAP_DELAY = 300;
  const DOUBLE_TAP_DISTANCE = 30;

  function handleDoubleZoom(x, y) {
    if (isAnimating) return;
    const newScale = zoomScale * 2;
    if (newScale > MAX_ZOOM) {
      resetZoom(true);
    } else {
      imageModalImg.style.transition = 'transform 0.3s ease-out';
      setZoomAtPoint(newScale, x, y);
    }
  }

  function handleDoubleClick(e) {
    e.preventDefault();
    handleDoubleZoom(e.clientX, e.clientY);
  }

  function cleanupDragListeners() {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  }

  function handleDragStart(e) {
    if (isAnimating || isDragging || isPinching) return;
    if (e.type === 'touchstart' && e.touches.length > 1) return;
    e.preventDefault();

    isDragging = true;
    dragAxis = isZoomed() ? 'pan' : null;
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
    e.preventDefault();

    // Two-finger touch → pinch zoom
    if (e.type === 'touchmove' && e.touches.length >= 2) {
      if (!isPinching) {
        const dist = touchDistance(e.touches[0], e.touches[1]);
        if (dist < 1) return;
        isPinching = true;
        isDragging = false;
        dragAxis = null;
        pinchStartDist = dist;
        pinchStartScale = zoomScale;
        lastMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        lastMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        imageModalImg.style.transition = 'none';
        imageModalImg.style.opacity = '';
        if (isZoomed()) {
          applyZoomTransform();
        } else {
          imageModalImg.style.transform = '';
        }
        return;
      }

      const dist = touchDistance(e.touches[0], e.touches[1]);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      setZoomAtPoint(pinchStartScale * (dist / pinchStartDist), midX, midY);

      panX += midX - lastMidX;
      panY += midY - lastMidY;
      lastMidX = midX;
      lastMidY = midY;
      if (isZoomed()) applyZoomTransform();
      return;
    }

    if (!isDragging) return;

    currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Zoomed: free pan
    if (dragAxis === 'pan') {
      applyZoomTransform(deltaX, deltaY);
      return;
    }

    // Not zoomed: detect axis
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

  function handleDragEnd(e) {
    if (isPinching) {
      if (e.touches && e.touches.length >= 2) return;
      isPinching = false;
      if (!isZoomed()) resetZoom(true);
      if (e.touches && e.touches.length > 0) return;
      cleanupDragListeners();
      return;
    }

    if (!isDragging) {
      if (!e.touches || e.touches.length === 0) cleanupDragListeners();
      return;
    }

    isDragging = false;
    cleanupDragListeners();

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (e.type === 'touchend') {
      const totalMove = Math.abs(deltaX) + Math.abs(deltaY);
      if (totalMove < 10) {
        const now = Date.now();
        const timeDiff = now - lastTapTime;
        const distDiff = Math.abs(currentX - lastTapX) + Math.abs(currentY - lastTapY);
        lastTapTime = now;
        lastTapX = currentX;
        lastTapY = currentY;
        if (timeDiff < DOUBLE_TAP_DELAY && distDiff < DOUBLE_TAP_DISTANCE) {
          lastTapTime = 0;
          handleDoubleZoom(currentX, currentY);
          return;
        }
      }
    }

    if (dragAxis === 'pan') {
      panX += deltaX;
      panY += deltaY;
      applyZoomTransform();
      return;
    }

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

  // --- Trackpad / mouse wheel zoom ---

  function handleWheel(e) {
    if (!imageModal.classList.contains("active")) return;
    e.preventDefault();
    if (isAnimating) return;

    if (e.ctrlKey) {
      imageModalImg.style.transition = 'none';
      const newScale = zoomScale * (1 - e.deltaY * 0.02);
      setZoomAtPoint(newScale, e.clientX, e.clientY);
    } else if (isZoomed()) {
      imageModalImg.style.transition = 'none';
      panX -= e.deltaX;
      panY -= e.deltaY;
      applyZoomTransform();
    }
  }

  // Safari gesture events
  let gestureBaseScale = 1;

  function handleGestureStart(e) {
    if (!imageModal.classList.contains("active")) return;
    e.preventDefault();
    gestureBaseScale = zoomScale;
    imageModalImg.style.transition = 'none';
  }

  function handleGestureChange(e) {
    if (!imageModal.classList.contains("active")) return;
    e.preventDefault();
    setZoomAtPoint(gestureBaseScale * e.scale, window.innerWidth / 2, window.innerHeight / 2);
  }

  function handleGestureEnd(e) {
    if (!imageModal.classList.contains("active")) return;
    e.preventDefault();
    if (!isZoomed()) resetZoom(true);
  }

  // --- Image navigation ---

  function navigateNext() {
    if (isAnimating) return;
    if (isZoomed()) resetZoom(false);
    const nextIndex = currentImageIndex === imageUrls.length - 1 ? 0 : currentImageIndex + 1;
    animateToImage(nextIndex, -1);
  }

  function navigatePrev() {
    if (isAnimating) return;
    if (isZoomed()) resetZoom(false);
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

  function preventTouchScroll(e) {
    if (imageModal.classList.contains("active")) {
      e.preventDefault();
    }
  }

  function addScrollPrevention() {
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("touchmove", preventTouchScroll, { passive: false });
    document.addEventListener("gesturestart", handleGestureStart);
    document.addEventListener("gesturechange", handleGestureChange);
    document.addEventListener("gestureend", handleGestureEnd);
  }

  function removeScrollPrevention() {
    document.removeEventListener("wheel", handleWheel);
    document.removeEventListener("touchmove", preventTouchScroll);
    document.removeEventListener("gesturestart", handleGestureStart);
    document.removeEventListener("gesturechange", handleGestureChange);
    document.removeEventListener("gestureend", handleGestureEnd);
  }

  // --- Modal open/close ---

  function openModal() {
    imageModal.classList.add("active");
    addScrollPrevention();
    imageModalImg.addEventListener('mousedown', handleDragStart);
    imageModalImg.addEventListener('touchstart', handleDragStart);
    imageModalImg.addEventListener('dblclick', handleDoubleClick);
  }

  function closeModal() {
    imageModal.classList.remove("active");
    removeScrollPrevention();
    imageModalImg.classList.remove("loaded");
    resetZoom(false);
    imageModalImg.style.transform = '';
    imageModalImg.style.opacity = '';
    imageModalImg.style.transition = '';
    imageModalImg.removeEventListener('mousedown', handleDragStart);
    imageModalImg.removeEventListener('touchstart', handleDragStart);
    imageModalImg.removeEventListener('dblclick', handleDoubleClick);
    isAnimating = false;
    isDragging = false;
    isPinching = false;
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
})();
