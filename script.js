document.addEventListener('DOMContentLoaded', () => {

  // ─── Jaar invullen ───────────────────────────────────────────────────────
  const huidigJaar = new Date().getFullYear();
  const jaarEl = document.getElementById('jaarActief');
  if (jaarEl) jaarEl.textContent = huidigJaar - 1998;
  const agendaJaarEl = document.getElementById('agendaJaar');
  if (agendaJaarEl) agendaJaarEl.textContent = huidigJaar;
  const footerJaarEl = document.getElementById('footerJaar');
  if (footerJaarEl) footerJaarEl.textContent = huidigJaar;

  // ─── Navbar scroll effect ───────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ─── Hamburger menu ──────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      navMobile.classList.toggle('open');
    });
    navMobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navMobile.classList.remove('open'));
    });
  }

  // ─── Smooth scroll ───────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── Quote slideshow (geladen uit JSON) ──────────────────────────────────
  async function laadQuotes() {
    const sliderEl = document.getElementById('quoteSlider');
    const dotsEl   = document.getElementById('quoteDots');
    if (!sliderEl) return;
    try {
      const res  = await fetch('/content/quotes.json');
      const data = await res.json();
      const items = data.items || [];
      if (items.length === 0) return;

      sliderEl.innerHTML = items.map((q, i) => `
        <div class="quote-slide${i === 0 ? ' active' : ''}">
          <blockquote>"${q.tekst}"</blockquote>
          ${q.bron ? `<cite>— ${q.bron}</cite>` : ''}
        </div>`).join('');

      dotsEl.innerHTML = items.map((_, i) => `
        <button class="dot${i === 0 ? ' active' : ''}" data-index="${i}"></button>`).join('');

      const slides = sliderEl.querySelectorAll('.quote-slide');
      const dots   = dotsEl.querySelectorAll('.dot');
      let current  = 0;
      let timer;

      function showSlide(index) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
      }

      function startAuto() { timer = setInterval(() => showSlide(current + 1), 5000); }
      function resetAuto()  { clearInterval(timer); startAuto(); }

      dots.forEach(dot => {
        dot.addEventListener('click', () => { showSlide(parseInt(dot.dataset.index)); resetAuto(); });
      });

      // Swipe-ondersteuning op mobiel
      let touchStartX = 0;
      sliderEl.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
      sliderEl.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { showSlide(diff > 0 ? current + 1 : current - 1); resetAuto(); }
      }, { passive: true });

      startAuto();
    } catch (e) { /* sectie blijft leeg */ }
  }

  // ─── Scroll fade-in animaties ────────────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  function applyFadeIn(elements) {
    elements.forEach((el, i) => {
      el.classList.add('fade-in');
      el.style.transitionDelay = `${(i % 4) * 0.08}s`;
      observer.observe(el);
    });
  }

  applyFadeIn(document.querySelectorAll(
    '.text-block, .image-block, .agenda-item, .optreden-card, .stat, .contact-details, .form-block'
  ));

  // ─── Contact formulier → mailto ──────────────────────────────────────────
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const naam      = document.getElementById('name').value;
      const email     = document.getElementById('email').value;
      const onderwerp = document.getElementById('onderwerp').value;
      const bericht   = document.getElementById('bericht').value;
      const subject   = encodeURIComponent(onderwerp || 'Bericht via website');
      const body      = encodeURIComponent(
        `Naam: ${naam}\nE-mail: ${email}\n\n${bericht}`
      );
      window.location.href = `mailto:kabaal@live.nl?subject=${subject}&body=${body}`;
    });
  }

  // ─── Agenda laden uit JSON ────────────────────────────────────────────
  async function laadAgenda() {
    const container = document.getElementById('agendaList');
    if (!container) return;
    try {
      const res = await fetch('/content/agenda.json');
      const data = await res.json();
      const items = (data.items || []).sort((a, b) => a.datum.localeCompare(b.datum));
      if (items.length === 0) {
        container.innerHTML = '<p class="loading-tekst">Geen aankomende evenementen.</p>';
        return;
      }
      container.innerHTML = items.map(renderAgendaItem).join('');
      applyFadeIn(container.querySelectorAll('.agenda-item'));
    } catch (e) {
      container.innerHTML = '<p class="loading-tekst">Agenda kon niet worden geladen.</p>';
    }
  }

  function renderAgendaItem(item) {
    const d = new Date(item.datum);
    const dag = String(d.getDate()).padStart(2, '0');
    const maanden = ['JAN','FEB','MRT','APR','MEI','JUN','JUL','AUG','SEP','OKT','NOV','DEC'];
    const maand = maanden[d.getMonth()];
    const isHoofd = item.hoofd ? 'highlight' : '';
    const labelHtml = item.label ? `<span class="tag tag-red">${item.label}</span>` : '';
    const tijdHtml = item.tijdstip ? `<span class="agenda-time">🕑 ${item.tijdstip}</span>` : '';
    const beschrijvingHtml = item.beschrijving ? `<p>${item.beschrijving}</p>` : '';
    return `
    <div class="agenda-item ${isHoofd}">
      <div class="agenda-date-block">
        <span class="a-day">${dag}</span>
        <span class="a-month">${maand}</span>
      </div>
      <div class="agenda-body">
        <div class="agenda-meta">
          ${labelHtml}
          <span class="agenda-location">📍 ${item.locatie}</span>
        </div>
        <h3>${item.titel}</h3>
        ${beschrijvingHtml}
        ${tijdHtml}
      </div>
    </div>`;
  }

  // ─── Evenementen laden uit JSON ───────────────────────────────────────
  async function laadEvenementen() {
    const container = document.getElementById('optredensGrid');
    if (!container) return;
    try {
      const res = await fetch('/content/evenementen.json');
      const data = await res.json();
      const items = (data.items || []).sort((a, b) => b.datum.localeCompare(a.datum));
      if (items.length === 0) {
        container.innerHTML = '<p class="loading-tekst">Nog geen evenementen.</p>';
        return;
      }
      container.innerHTML = items.map(renderEvenementCard).join('');
      applyFadeIn(container.querySelectorAll('.optreden-card'));
    } catch (e) {
      container.innerHTML = '<p class="loading-tekst">Evenementen konden niet worden geladen.</p>';
    }
  }

  function renderEvenementCard(item) {
    const d = new Date(item.datum);
    const dagNaam = d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    const aantalFotos = item.fotos ? item.fotos.length : 0;
    const fotoTekst = aantalFotos > 0
      ? `<span class="optreden-count">${aantalFotos} foto's →</span>`
      : `<span class="optreden-count muted">Foto's volgen binnenkort</span>`;
    const img = item.omslagfoto || '/images/optreden-placeholder.svg';
    return `
    <a href="optredens/evenement.html?id=${item.id}" class="optreden-card">
      <div class="optreden-img-wrap">
        <img src="${img}" alt="${item.titel}" />
        <div class="optreden-overlay">
          <span class="overlay-icon">🖼</span>
          <span class="overlay-text">Bekijk foto's</span>
        </div>
      </div>
      <div class="optreden-info">
        <span class="optreden-date">${dagNaam}</span>
        <h3>${item.titel}</h3>
        ${item.locatie ? `<p>${item.locatie}</p>` : ''}
        ${fotoTekst}
      </div>
    </a>`;
  }

  // ─── Over ons slideshow ──────────────────────────────────────────────
  async function laadOverOns() {
    const wrap = document.getElementById('overOnsSlideshow');
    if (!wrap) return;
    try {
      const res = await fetch('/content/over-ons.json');
      const data = await res.json();
      const fotos = data.afbeeldingen || [];
      if (fotos.length === 0) return;

      // Placeholder verwijderen
      const ph = wrap.querySelector('.over-ons-placeholder');
      if (ph) ph.remove();

      // Afbeeldingen injecteren
      fotos.forEach((f, i) => {
        const img = document.createElement('img');
        img.src = f.afbeelding;
        img.alt = f.alt || 'Bêentels Kabaal';
        if (i === 0) img.classList.add('active');
        wrap.insertBefore(img, wrap.querySelector('.oos-prev'));
      });

      const imgs = wrap.querySelectorAll('img');
      const dotsEl = document.getElementById('oosDots');
      let idx = 0;

      // Dots aanmaken
      if (imgs.length > 1) {
        imgs.forEach((_, i) => {
          const d = document.createElement('button');
          d.className = 'oos-dot' + (i === 0 ? ' active' : '');
          d.addEventListener('click', () => { goTo(i); resetOosTimer(); });
          dotsEl.appendChild(d);
        });
      } else {
        wrap.querySelector('.oos-prev').classList.add('hidden');
        wrap.querySelector('.oos-next').classList.add('hidden');
      }

      function goTo(n) {
        imgs[idx].classList.remove('active');
        dotsEl.querySelectorAll('.oos-dot')[idx]?.classList.remove('active');
        idx = (n + imgs.length) % imgs.length;
        imgs[idx].classList.add('active');
        dotsEl.querySelectorAll('.oos-dot')[idx]?.classList.add('active');
      }

      document.getElementById('oosPrev').addEventListener('click', () => { goTo(idx - 1); resetOosTimer(); });
      document.getElementById('oosNext').addEventListener('click', () => { goTo(idx + 1); resetOosTimer(); });

      let oosTimer = imgs.length > 1 ? setInterval(() => goTo(idx + 1), 4000) : null;
      function resetOosTimer() {
        if (!oosTimer) return;
        clearInterval(oosTimer);
        oosTimer = setInterval(() => goTo(idx + 1), 4000);
      }
    } catch (e) { /* placeholder blijft zichtbaar */ }
  }

  // ─── Repertoire laden uit JSON ───────────────────────────────────────
  async function laadRepertoire() {
    const container = document.getElementById('repertoireGrid');
    if (!container) return;
    try {
      const res = await fetch('/content/repertoire.json');
      const data = await res.json();
      const sets = data.sets || [];
      const los  = data.los  || [];
      container.innerHTML = `
        <div class="repertoire-block">
          <h4>Nummers</h4>
          <ol class="repertoire-list">
            ${sets.map(s => `<li>${s}</li>`).join('')}
          </ol>
        </div>
        <div class="repertoire-block">
          <h4>Losse nummers</h4>
          <ul class="repertoire-los">
            ${los.map(n => `<li>${n}</li>`).join('')}
          </ul>
        </div>`;
    } catch (e) {
      container.innerHTML = '<p class="loading-tekst">Repertoire kon niet worden geladen.</p>';
    }
  }

  laadAgenda();
  laadEvenementen();
  laadOverOns();
  laadQuotes();
  laadRepertoire();

});
