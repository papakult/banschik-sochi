(() => {
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav');
  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ambientVideos = Array.from(document.querySelectorAll('.ambient-video'));
  const syncAmbientVideo = video => {
    if (reducedMotion || document.hidden) { video.pause(); return; }
    const bounds = video.getBoundingClientRect();
    const visible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
    if (!visible) { video.pause(); return; }
    const source = video.querySelector('source[data-src]');
    if (source) {
      source.src = source.dataset.src;
      delete source.dataset.src;
      video.load();
    }
    video.play().catch(() => {});
  };
  if ('IntersectionObserver' in window) {
    const ambientObserver = new IntersectionObserver(entries => entries.forEach(entry => syncAmbientVideo(entry.target)), { threshold: [0, .1] });
    ambientVideos.forEach(video => ambientObserver.observe(video));
  } else {
    window.addEventListener('scroll', () => ambientVideos.forEach(syncAmbientVideo), { passive: true });
    ambientVideos.forEach(syncAmbientVideo);
  }
  document.addEventListener('visibilitychange', () => ambientVideos.forEach(syncAmbientVideo));
  const films = Array.from(document.querySelectorAll('.film'));
  const userPaused = new WeakSet();
  const setFilmControl = (button, paused) => {
    button.querySelector('.pause-icon').textContent = paused ? '▶' : 'Ⅱ';
    button.setAttribute('aria-label', paused ? 'Воспроизвести видео' : 'Остановить видео');
    button.setAttribute('aria-pressed', String(paused));
  };
  const inViewport = film => {
    const rect = film.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
  };
  const loadFilm = video => {
    const source = video.querySelector('source[data-src]');
    if (!source) return;
    source.src = source.dataset.src;
    delete source.dataset.src;
    video.load();
  };
  const syncFilm = film => {
    const video = film.querySelector('video');
    const button = film.querySelector('.film-toggle');
    if (!video || !button) return;
    if (document.hidden || !inViewport(film) || userPaused.has(film) || reducedMotion) {
      video.pause();
      if (userPaused.has(film) || reducedMotion) setFilmControl(button, true);
      return;
    }
    loadFilm(video);
    video.play().then(() => setFilmControl(button, video.paused)).catch(() => setFilmControl(button, true));
  };
  films.forEach(film => {
    const video = film.querySelector('video');
    const button = film.querySelector('.film-toggle');
    if (!video || !button) return;
    button.addEventListener('click', () => {
      if (video.paused) {
        userPaused.delete(film);
        loadFilm(video);
        video.play().then(() => setFilmControl(button, video.paused)).catch(() => setFilmControl(button, true));
      } else {
        userPaused.add(film);
        video.pause();
        setFilmControl(button, true);
      }
    });
  });
  if ('IntersectionObserver' in window) {
    const filmObserver = new IntersectionObserver(entries => entries.forEach(entry => syncFilm(entry.target)), { threshold: [0, 0.01, 0.25] });
    films.forEach(film => filmObserver.observe(film));
  } else {
    const syncVisibleFilms = () => films.forEach(syncFilm);
    window.addEventListener('scroll', syncVisibleFilms, { passive: true });
    syncVisibleFilms();
  }
  document.addEventListener('visibilitychange', () => films.forEach(syncFilm));

  if (!reducedMotion) {
    const headings = document.querySelectorAll('.home-content h1, .page-lead-copy h1, .request-hero h1, .folio-hero h1, .banya-cover h1, .hotel-catalog-cover h1, .hotel-detail-cover h1, .route-cover h1, .route-detail-cover h1, .journey-cover h1, .partner-cover h1, .extra-cover h1, .extra-detail-cover h1, .ritual-hero h1, main section h2, .footer h2');
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
      : null;

    headings.forEach(heading => {
      const label = heading.innerText.replace(/\s+/g, ' ').trim();
      if (!label) return;
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      let letterIndex = 0;
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        node.textContent.match(/\s+|[^\s]+/gu)?.forEach(part => {
          if (/^\s+$/u.test(part)) {
            fragment.append(document.createTextNode(part));
            return;
          }
          const word = document.createElement('span');
          word.className = 'reveal-word';
          word.setAttribute('aria-hidden', 'true');
          Array.from(part).forEach(character => {
            const letter = document.createElement('span');
            letter.className = 'reveal-letter';
            letter.style.setProperty('--letter-delay', Math.min(letterIndex * 8, 220) + 'ms');
            letter.textContent = character;
            word.append(letter);
            letterIndex++;
          });
          fragment.append(word);
        });
        node.replaceWith(fragment);
      });
      heading.setAttribute('aria-label', label);
      heading.classList.add('reveal-ready');
      if (observer) observer.observe(heading);
      else heading.classList.add('reveal-visible');
    });
  }

  const experienceButtons = document.querySelectorAll('.experience-tab');
  const experiencePanel = document.querySelector('.experience-panel');
  if (experienceButtons.length && experiencePanel) {
    const scene = experiencePanel.querySelector('video');
    const sceneSource = scene?.querySelector('source');
    const sceneFilm = experiencePanel.querySelector('.film');
    experienceButtons.forEach((button, index) => button.addEventListener('click', () => {
      if (button.classList.contains('is-active')) return;
      experienceButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      experiencePanel.querySelector('#experience-kicker').textContent = button.dataset.kicker;
      experiencePanel.querySelector('#experience-heading').textContent = button.dataset.title;
      experiencePanel.querySelector('#experience-copy').textContent = button.dataset.copy;
      const link = experiencePanel.querySelector('#experience-link');
      link.href = button.dataset.link;
      link.textContent = button.dataset.linkLabel;
      experiencePanel.querySelector('.experience-count').textContent = String(index + 1).padStart(2, '0') + ' / 03';
      if (scene && sceneSource) {
        scene.poster = 'assets/' + button.dataset.poster;
        scene.setAttribute('aria-label', button.dataset.videoLabel);
        sceneSource.removeAttribute('src');
        sceneSource.dataset.src = 'assets/' + button.dataset.video;
        scene.load();
        syncFilm(sceneFilm);
      }
      experiencePanel.classList.remove('has-changed');
      void experiencePanel.offsetWidth;
      experiencePanel.classList.add('has-changed');
    }));
  }

  document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    localStorage.setItem('private-sochi-hotel', button.dataset.choice);
    window.location.href = 'request.html';
  }));

  document.querySelectorAll('[data-experience]').forEach(button => button.addEventListener('click', () => {
    localStorage.setItem('private-sochi-experience', button.dataset.experience);
    window.location.href = 'request.html';
  }));

  const ritualOptions = Array.from(document.querySelectorAll('[data-ritual-option]'));
  if (ritualOptions.length) {
    const saved = (localStorage.getItem('private-sochi-ritual') || '').split(',').map(x => x.trim()).filter(Boolean);
    const updateRitualCount = () => {
      const count = ritualOptions.filter(button => button.getAttribute('aria-pressed') === 'true').length;
      document.getElementById('ritual-selection-count').textContent = count ? `Выбрано процедур: ${count}` : 'Ничего не выбрано';
    };
    ritualOptions.forEach(button => {
      if (saved.includes(button.dataset.ritualOption)) button.setAttribute('aria-pressed', 'true');
      button.addEventListener('click', () => {
        button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
        updateRitualCount();
      });
    });
    updateRitualCount();
    document.getElementById('ritual-add')?.addEventListener('click', () => {
      const picked = ritualOptions.filter(button => button.getAttribute('aria-pressed') === 'true').map(button => button.dataset.ritualOption);
      localStorage.setItem('private-sochi-ritual', picked.join(', '));
      window.location.href = 'request.html';
    });
  }

  const hotelField = document.querySelector('[name="hotel"]');
  if (hotelField) {
    const saved = localStorage.getItem('private-sochi-hotel');
    if (saved && Array.from(hotelField.options).some(option => option.value === saved)) hotelField.value = saved;
  }
  const experienceField = document.querySelector('[name="experience"]');
  if (experienceField) {
    const saved = localStorage.getItem('private-sochi-experience');
    if (saved && Array.from(experienceField.options).some(option => option.value === saved)) experienceField.value = saved;
  }
  const ritualField = document.querySelector('[name="ritual"]');
  if (ritualField) ritualField.value = localStorage.getItem('private-sochi-ritual') || '';

  const dataNode = document.getElementById('days-data');
  if (dataNode) {
    const days = JSON.parse(dataNode.textContent);
    document.querySelectorAll('.day-tab').forEach(tab => tab.addEventListener('click', () => {
      const n = Number(tab.dataset.day);
      document.querySelectorAll('.day-tab').forEach(item => { item.classList.toggle('active', item === tab); item.setAttribute('aria-selected', String(item === tab)); });
      document.getElementById('day-index').textContent = `ДЕНЬ ${days[n][0]} / 05`;
      document.getElementById('day-title').textContent = days[n][1];
      document.getElementById('day-copy').textContent = days[n][2];
      document.getElementById('day-progress').style.width = `${(n + 1) * 20}%`;
    }));
  }

  const form = document.getElementById('request-form');
  if (!form) return;
  if (new URLSearchParams(window.location.search).get('for') === 'partner') {
    const partnerOption = form.querySelector('[name="audience"][value="Партнер"]');
    if (partnerOption) partnerOption.checked = true;
  }
  const status = document.getElementById('form-status');
  const buildText = () => {
    const d = new FormData(form);
    const included = [d.has('banya') && 'баня с мастером', d.has('spa') && 'массаж и SPA-ритуалы', d.has('stay') && 'размещение', d.has('routes') && 'поездки по Сочи', d.has('transfer') && 'трансфер'].filter(Boolean);
    return ['Запрос на частную поездку в Сочи', `Кто обращается: ${d.get('audience') || 'гость'}`, `Даты: ${d.get('dates') || 'уточним'}`, `Гостей: ${d.get('guests') || 'уточним'}`, `Длительность: ${d.get('duration')}`, `В программе: ${included.join(', ') || 'обсудим'}`, `Проживание: ${d.get('hotel') || 'подобрать варианты'}`, `Яхта или полет: ${d.get('experience') || 'не выбрали'}`, `Процедуры для обсуждения: ${d.get('ritual') || 'подобрать с мастером'}`, `Исключить из парения и ухода: ${d.get('avoid') || 'уточним'}`, `Пожелания: ${d.get('notes') || 'уточним'}`].join('\n');
  };
  document.getElementById('copy-request')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(buildText()); status.textContent = 'Запрос скопирован. Теперь его можно отправить партнеру или организатору.'; }
    catch { status.textContent = 'Копирование недоступно в этом браузере. Можно воспользоваться кнопкой Поделиться.'; }
  });
  document.getElementById('share-request')?.addEventListener('click', async () => {
    if (!navigator.share) { status.textContent = 'В этом браузере нет меню Поделиться. Скопируйте текст запроса.'; return; }
    try { await navigator.share({ title: 'Поездка в Сочи', text: buildText() }); status.textContent = 'Меню отправки открыто.'; }
    catch { status.textContent = 'Отправка отменена.'; }
  });
})();
