// script.js — handles intro, lock/unlock, snapping, order free-scroll
document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  const navbar = document.getElementById('navbar');
  const learnMoreBtn = document.getElementById('learnMoreBtn');
  const orderSection = document.getElementById('order');

  const startOverlay = document.getElementById('startOverlay');
  const overlayBtn = document.getElementById('overlayStartBtn');
  const intro = document.getElementById('intro');
  const video = document.getElementById('introVideo');

  let unlocked = false;   // after Learn More
  let introPlayed = false;

  function enableSnap() {
    htmlEl.classList.add('snap');
    htmlEl.classList.remove('free');
  }
  function enableFree() {
    htmlEl.classList.add('free');
    htmlEl.classList.remove('snap');
  }
  function setLocked(lock) {
    bodyEl.classList.toggle('locked', lock);
  }

  // ---------- Intro ----------
  if (overlayBtn && startOverlay && intro && video) {
    overlayBtn.addEventListener('click', () => {
      overlayBtn.disabled = true;
      startOverlay.classList.add('fade-out');

      startOverlay.addEventListener('transitionend', function done(e) {
        if (e.propertyName !== 'opacity') return;
        startOverlay.removeEventListener('transitionend', done);
        startOverlay.style.display = 'none';

        video.classList.add('visible');
        try { video.muted = false; } catch {}
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }, { once: true });
    });

video.addEventListener('ended', () => {
  video.classList.remove('visible');
  video.addEventListener('transitionend', function fade(e) {
    if (e.propertyName !== 'opacity') return;
    video.removeEventListener('transitionend', fade);
    intro.style.display = 'none';
    introPlayed = true;

    // 🔥 Show navbar once intro video is done
    navbar?.classList.add('show');
  }, { once: true });
});

  } else {
    unlocked = true;
    setLocked(false);
    navbar?.classList.add('show');
  }

  // ---------- Learn More ----------
  learnMoreBtn?.addEventListener('click', () => {
    unlocked = true;
    setLocked(false);
    navbar?.classList.add('show');
    enableSnap();
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ---------- Nav / goto ----------
  document.querySelectorAll('#navbar a[href^="#"], [data-goto]').forEach(el => {
    el.addEventListener('click', ev => {
      ev.preventDefault();
      const href = el.getAttribute('href');
      const id = href?.startsWith('#') ? href.slice(1) : el.dataset.goto;
      const target = id && document.getElementById(id);
      if (!target) return;
      if (id === 'order') enableFree(); else enableSnap();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ---------- Intersection Observer for Order ----------
  if (orderSection) {
    const io = new IntersectionObserver(entries => {
      if (!unlocked) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) enableFree();
        else enableSnap();
      });
    }, { threshold: 0.6 });
    io.observe(orderSection);
  }

  // ---------- Payment toggle ----------
  const paymentSelect = document.getElementById('payment');
  paymentSelect?.addEventListener('change', e => {
    const info = document.getElementById('paymentInfo');
    if (!info) return;
    const val = e.target.value;
    info.style.display = (val === 'GCash' || val === 'PayMaya') ? 'block' : 'none';
  });

  // initial state: locked until Learn More
  if (!unlocked) {
    setLocked(true);
    htmlEl.classList.remove('snap', 'free');
  }
});

// Only initialize review form if it exists
const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');

if (reviewForm && reviewsList) {
  const savedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  savedReviews.forEach(addReviewToDOM);

  reviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('reviewName').value;
    const message = document.getElementById('reviewText').value;
    const stars = document.querySelector('input[name="stars"]:checked').value;

    const review = { name, message, stars };
    addReviewToDOM(review);

    savedReviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(savedReviews));
    reviewForm.reset();
    document.getElementById('star1').checked = true;
  });

  function addReviewToDOM(review) {
    const div = document.createElement('div');
    div.className = 'review-card';
    div.innerHTML = `
      <div class="review-stars">${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}</div>
      <strong>${review.name}</strong>
      <p>${review.message}</p>
    `;
    reviewsList.prepend(div);
  }
}
