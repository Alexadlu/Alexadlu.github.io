document.documentElement.classList.add('js');
const menuToggle = document.querySelector('#menuToggle');
const siteNav = document.querySelector('#siteNav');
const mobileMenu = window.matchMedia('(max-width: 860px)');

if (menuToggle && siteNav) {
  const closeMenu = () => {
    siteNav.hidden = mobileMenu.matches;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航');
    menuToggle.textContent = '☰';
  };
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    siteNav.hidden = !isOpen;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
    menuToggle.textContent = isOpen ? '×' : '☰';
  });
  siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
  if (mobileMenu.addEventListener) mobileMenu.addEventListener('change', closeMenu);
  else mobileMenu.addListener(closeMenu);
  menuToggle.hidden = false;
  closeMenu();
}

const tools = document.querySelector('#publicationTools');
const search = document.querySelector('#publicationSearch');
const resultCount = document.querySelector('#resultCount');
const emptyState = document.querySelector('#emptyState');
const papers = Array.from(document.querySelectorAll('.publication'));
let selectedYear = 'all';

if (tools && search && resultCount && emptyState) {
  const searchable = papers.map(paper => ({
    paper,
    year: paper.dataset.year,
    text: paper.textContent.toLocaleLowerCase().replace(/\s+/g, ' ')
  }));
  const filterPapers = () => {
    const words = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    searchable.forEach(({paper, year, text}) => {
      const yearMatch = selectedYear === 'all' ||
        (selectedYear === 'earlier' ? Number(year) <= 2024 : year === selectedYear);
      paper.hidden = !(yearMatch && words.every(word => text.includes(word)));
      if (!paper.hidden) visible += 1;
    });
    resultCount.textContent = '显示 ' + visible + ' / ' + papers.length + ' 项成果';
    emptyState.hidden = visible !== 0;
  };
  tools.querySelectorAll('[data-year]').forEach(button => {
    button.addEventListener('click', () => {
      selectedYear = button.dataset.year;
      tools.querySelectorAll('[data-year]').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      filterPapers();
    });
  });
  search.addEventListener('input', filterPapers);
  tools.hidden = false;
  resultCount.hidden = false;
  filterPapers();
}

// Keep section content visible without JavaScript or browser animation support.
if ('IntersectionObserver' in window && siteNav) {
  const sections = document.querySelectorAll('main > section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      siteNav.querySelectorAll('a').forEach(link => {
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, {rootMargin: '-15% 0px -65% 0px', threshold: 0});
  sections.forEach(section => observer.observe(section));
}
