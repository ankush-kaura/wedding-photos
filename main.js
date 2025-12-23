// CONFIG
const IMAGE_FOLDER = "assets";
const BATCH_SIZE = 20;

let images = [];
let allLoadedImages = [];
let currentImageIndex = 0;

const masonry = document.getElementById("masonry");
const overlay = document.getElementById("fullscreen-overlay");
const fullscreenImage = document.getElementById("fullscreen-image");
const closeBtn = document.getElementById("close-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

async function loadImageManifest() {
  try {
    const res = await fetch(`${ IMAGE_FOLDER }/manifest.json`);
    images = await res.json(); // manifest should be an array of filenames
    loadBatch(); // trigger first batch once manifest is loaded
  } catch (err) {
    console.error("Failed to load image manifest:", err);
  }
}

loadImageManifest();

let cursor = 0;

function loadBatch() {
  const slice = (images || []).slice(cursor, cursor + BATCH_SIZE);
  const startingIndex = cursor;
  cursor += BATCH_SIZE;

  slice.forEach((src, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = src;
    img.decoding = "async";

    const imageIndex = startingIndex + i;
    allLoadedImages.push(src);
    wrapper.dataset.index = imageIndex;


    wrapper.addEventListener('click', () => {
        openFullscreen(imageIndex);
    });

    wrapper.appendChild(img);
    masonry.appendChild(wrapper);
  });
}

function openFullscreen(index) {
    currentImageIndex = index;
    fullscreenImage.src = allLoadedImages[currentImageIndex];
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % allLoadedImages.length;
    fullscreenImage.src = allLoadedImages[currentImageIndex];
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + allLoadedImages.length) % allLoadedImages.length;
    fullscreenImage.src = allLoadedImages[currentImageIndex];
}


// infinite scroll pipeline
function onScroll() {
  const threshold = 300;
  const scrollPos = window.innerHeight + window.scrollY;

  if (scrollPos >= document.body.offsetHeight - threshold) {
    loadBatch();
  }
}

window.addEventListener("scroll", onScroll);
closeBtn.addEventListener('click', closeFullscreen);
nextBtn.addEventListener('click', showNextImage);
prevBtn.addEventListener('click', showPrevImage);

document.addEventListener('keydown', (e) => {
    if (overlay.style.display === 'flex') {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
        if (e.key === 'ArrowRight') {
            showNextImage();
        }
        if (e.key === 'ArrowLeft') {
            showPrevImage();
        }
    }
});

let touchStartX = 0;
let touchEndX = 0;

overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

overlay.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50; // minimum distance for a swipe
    if (touchEndX < touchStartX - swipeThreshold) {
        showNextImage();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        showPrevImage();
    }
}