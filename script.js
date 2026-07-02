const menuToggle = document.querySelector('#menuToggle');
const siteNav = document.querySelector('#siteNav');

if (menuToggle && siteNav) {
  const closeMenu = () => {
    siteNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '×' : '☰';
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const revealTargets = document.querySelectorAll('.section, .hero-content, .profile-panel');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((target) => {
    target.classList.add('reveal');
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add('visible'));
}

const firstPaperFigure = document.querySelector('.publication-list .publication.paper-card:first-child .publication-media img');

if (firstPaperFigure) {
  const figureParts = Array.from(
    { length: 12 },
    (_, index) => `assets/tpf-framework-20260702.part${index}.txt?v=20260702`
  );

  Promise.all(
    figureParts.map((src) =>
      fetch(src, { cache: 'force-cache' }).then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${src}`);
        return response.text();
      })
    )
  )
    .then((parts) => {
      firstPaperFigure.removeAttribute('srcset');
      firstPaperFigure.src = `data:image/jpeg;base64,${parts.join('').trim()}`;
    })
    .catch(() => {});
}
