const imageModal = document.getElementById("image-modal");
const imageModalImg = document.getElementById("image-modal-img");
const imageModalClose = document.getElementById("image-modal-close");
const portfolioImages = document.getElementsByClassName("portfolio-image");

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
}

function closeModal() {
  imageModal.classList.remove("active");
  removeScrollPrevention();
}

for (let i = 0; i < portfolioImages.length; i++) {
  let portfolioImage = portfolioImages.item(i);
  portfolioImage.addEventListener("click", function() {
    imageModalImg.src = this.src.replace("_thumbnail", "");
    openModal();
  });
}

imageModal.addEventListener("click", closeModal);
imageModalClose.addEventListener("click", closeModal);

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});
