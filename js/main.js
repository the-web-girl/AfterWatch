/* ============================================
   AfterWatch — JavaScript principal
   RGAA 4.1 — Navigation & Carousel accessibles
   ============================================ */

'use strict';

/* ===== CAROUSEL ===== */
(function initCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  let current = 0;
  let autoTimer;

  function goTo(index) {
    const total = slides.length;
    // Wrapping
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;

    // Update track position
    track.style.transform = `translateX(-${index * 100}%)`;

    // Update aria-hidden on slides
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i !== index ? 'true' : 'false');
    });

    // Update dots
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    current = index;
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  // Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Keyboard navigation on carousel
  const carousel = document.getElementById('carousel');
  if (carousel) {
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { goTo(current - 1); stopAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); }
    });
  }

  // Pause on hover / focus (RGAA motion / WCAG 2.2.2)
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);
  }

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    startAuto();
  } else {
    // Disable transition for reduced motion users
    if (track) track.style.transition = 'none';
  }

  // Init
  goTo(0);
})();


/* ===== NAVIGATION MOBILE ===== */
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.setAttribute('aria-label', expanded ? 'Ouvrir le menu de navigation' : 'Fermer le menu de navigation');
    nav.classList.toggle('open', !expanded);
  });

  // Fermer le menu si on clique en dehors
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
      nav.classList.remove('open');
    }
  });

  // Fermer avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
      nav.classList.remove('open');
      toggle.focus();
    }
  });
})();


/* ===== FORMULAIRES — Validation accessible ===== */
(function initForms() {
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      let valid = true;

      // Effacer les erreurs précédentes
      form.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
      form.querySelectorAll('.form-control').forEach(el => {
        el.classList.remove('is-invalid');
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
      });

      // Valider les champs requis
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('is-invalid');
          field.setAttribute('aria-invalid', 'true');
          const errorId = field.id + '-error';
          const errorEl = document.getElementById(errorId);
          if (errorEl) {
            errorEl.textContent = 'Ce champ est obligatoire.';
            errorEl.classList.add('visible');
            field.setAttribute('aria-describedby', errorId);
          }
        }
      });

      // Valider email
      form.querySelectorAll('input[type="email"]').forEach(field => {
        if (field.value && !field.value.includes('@')) {
          valid = false;
          field.classList.add('is-invalid');
          field.setAttribute('aria-invalid', 'true');
          const errorId = field.id + '-error';
          const errorEl = document.getElementById(errorId);
          if (errorEl) {
            errorEl.textContent = 'Veuillez saisir une adresse e-mail valide.';
            errorEl.classList.add('visible');
            field.setAttribute('aria-describedby', errorId);
          }
        }
      });

      // Valider confirmation mot de passe
      const pwd = form.querySelector('#mot-de-passe');
      const confirm = form.querySelector('#confirmation');
      if (pwd && confirm && pwd.value && pwd.value !== confirm.value) {
        valid = false;
        confirm.classList.add('is-invalid');
        confirm.setAttribute('aria-invalid', 'true');
        const errorEl = document.getElementById('confirmation-error');
        if (errorEl) {
          errorEl.textContent = 'Les mots de passe ne correspondent pas.';
          errorEl.classList.add('visible');
          confirm.setAttribute('aria-describedby', 'confirmation-error');
        }
      }

      if (!valid) {
        e.preventDefault();
        // Déplacer le focus sur le premier champ invalide
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
      }
    });

    // Validation en temps réel (retrait de l'erreur dès que corrigé)
    form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => {
        if (field.value.trim()) {
          field.classList.remove('is-invalid');
          field.removeAttribute('aria-invalid');
          const errorId = field.id + '-error';
          const errorEl = document.getElementById(errorId);
          if (errorEl) errorEl.classList.remove('visible');
        }
      });
    });
  });
})();
