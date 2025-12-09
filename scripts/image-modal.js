const imageModal = document.getElementById("image-modal");
const imageModalImg = document.getElementById("image-modal-img");
const imageModalClose = document.getElementById("image-modal-close");
const portfolioImages = document.getElementsByClassName("portfolio-image");

for (let i = 0; i < portfolioImages.length; i++) {
  let portfolioImage = portfolioImages.item(i);
  portfolioImage.addEventListener("click", function() {
    imageModalImg.src = this.src.replace("_thumbnail", "");
    imageModal.classList.add("active");
  });
}

function closeModal() {
  imageModal.classList.remove("active");
}

imageModal.addEventListener("click", closeModal);

imageModalClose.addEventListener("click", closeModal);

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});