const imageModal = document.getElementById("image-modal");
const imageModalImg = document.getElementById("image-modal-img");
const imageModalClose = document.getElementById("image-modal-close");
const portfolioImages = document.getElementsByClassName("portfolio-image");

imageModalImg.onload = () => imageModalImg.classList.add("loaded");

let isDragging = false;
let startY = 0;
let currentY = 0;

function handleDragStart(e) {
  // Prevent default image dragging behavior
  e.preventDefault();
  
  isDragging = true;
  startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
  currentY = startY;
  
  // Remove transition while dragging
  imageModalImg.style.transition = 'none';
  
  // Add move and end event listeners
  if (e.type === 'mousedown') {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  } else {
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  }
}

function handleDragMove(e) {
  if (!isDragging) return;
  
  // Prevent default to avoid scrolling
  e.preventDefault();
  
  currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
  const deltaY = currentY - startY;
  const dismissThreshold = window.innerHeight * 0.25; // 25% of viewport height
  
  // Apply transform and opacity changes
  const opacity = Math.max(0, 1 - (Math.abs(deltaY) / dismissThreshold));
  imageModalImg.style.transform = `translateY(${deltaY}px)`;
  imageModalImg.style.opacity = opacity;
}

function handleDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  
  // Remove move and end event listeners
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  document.removeEventListener('touchmove', handleDragMove);
  document.removeEventListener('touchend', handleDragEnd);
  
  // Restore transition
  imageModalImg.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
  
  const deltaY = currentY - startY;
  const dismissThreshold = window.innerHeight * 0.05; // 5% of viewport height
  
  // If dragged far enough, close the modal
  if (Math.abs(deltaY) > dismissThreshold) {
    closeModal();
  } else {
    // Spring back
    imageModalImg.style.transform = '';
    imageModalImg.style.opacity = '';
  }
}

function preventScroll(e) {
  if (imageModal.classList.contains("active")) {
    e.preventDefault();
  }
}

function addScrollPrevention() {
  // For mouse wheel and trackpad two-finger scroll
  document.addEventListener("wheel", preventScroll, { passive: false });
  // For trackpad momentum scrolling and touch devices
  document.addEventListener("touchmove", preventScroll, { passive: false });
}

function removeScrollPrevention() {
  document.removeEventListener("wheel", preventScroll);
  document.removeEventListener("touchmove", preventScroll);
}

function openModal() {
  imageModal.classList.add("active");
  addScrollPrevention();
  
  // Add drag handlers
  imageModalImg.addEventListener('mousedown', handleDragStart);
  imageModalImg.addEventListener('touchstart', handleDragStart);
}

function closeModal() {
  imageModal.classList.remove("active");
  removeScrollPrevention();
  imageModalImg.classList.remove("loaded");
  
  // Reset styles and remove drag handlers
  imageModalImg.style.transform = '';
  imageModalImg.style.opacity = '';
  imageModalImg.style.transition = '';
  imageModalImg.removeEventListener('mousedown', handleDragStart);
  imageModalImg.removeEventListener('touchstart', handleDragStart);
}

// Setup click listeners for the images in the main grid
for (let i = 0; i < portfolioImages.length; i++) {
  let portfolioImage = portfolioImages.item(i);
  portfolioImage.addEventListener("click", function() {
    imageModalImg.src = this.src.replace("_thumbnail", "");
    openModal();
  });
}


// Dismiss the modal when the 'X' button, esc key, or clicking outside the image
imageModalClose.addEventListener("click", closeModal);
imageModal.addEventListener("click", function(event) {
  // Close only if clicking the modal background (not the image)
  if (event.target === imageModal) {
    closeModal();
  }
});
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});
