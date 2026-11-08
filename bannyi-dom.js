'use strict';

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection?.saveData;
const films = new Map();

function updateFilm(film) {
  const { video, toggle } = film;
  const allowed = film.choice === 'play' || (film.choice !== 'pause' && !motion.matches && !saveData);
  if (!allowed || !film.visible || document.hidden) {
    video.pause();
    return;
  }
  if (!video.getAttribute('src')) video.src = video.dataset.src;
  video.play().catch(() => {
    if (film.visible) toggle.classList.add('is-paused');
  });
}

const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const film = films.get(entry.target);
    film.visible = entry.isIntersecting;
    updateFilm(film);
  }
}, { threshold: 0.16 }) : null;

for (const container of document.querySelectorAll('[data-film]')) {
  const video = container.querySelector('video');
  const toggle = container.querySelector('.film-toggle');
  const label = toggle.querySelector('.film-label');
  const subject = toggle.getAttribute('aria-label');
  const film = { video, toggle, visible: !observer, choice: '' };
  const setPlaying = (playing) => {
    toggle.classList.toggle('is-paused', !playing);
    label.textContent = playing ? 'Пауза' : 'Смотреть';
    toggle.setAttribute('aria-label', (playing ? 'Поставить на паузу: ' : 'Воспроизвести: ') + subject);
  };
  films.set(container, film);
  setPlaying(false);
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    film.choice = video.paused ? 'play' : 'pause';
    film.visible = true;
    updateFilm(film);
  });
  video.addEventListener('playing', () => {
    container.classList.add('has-frame');
    setPlaying(true);
  });
  video.addEventListener('pause', () => setPlaying(false));
  video.addEventListener('error', () => {
    container.classList.remove('has-frame');
    toggle.hidden = true;
  });
  if (observer) observer.observe(container);
  else updateFilm(film);
}

function refreshFilms() {
  for (const film of films.values()) updateFilm(film);
}
document.addEventListener('visibilitychange', refreshFilms);
motion.addEventListener('change', refreshFilms);

const procedureForm = document.getElementById('procedures-form');
if (procedureForm) {
  const selectionStatus = document.getElementById('selection-status');
  const showCount = () => {
    const count = new FormData(procedureForm).getAll('procedure').length;
    selectionStatus.textContent = count
      ? 'Выбрано процедур: ' + count
      : 'Можно просто посмотреть процедуры и обсудить их позже.';
  };
  procedureForm.addEventListener('change', showCount);
  window.addEventListener('pageshow', showCount);
}

const requestForm = document.getElementById('request-form');
if (requestForm) {
  const params = new URLSearchParams(location.search);
  const ritual = requestForm.elements.ritual;
  const procedures = params.getAll('procedure');
  if (procedures.length || params.get('from') === 'procedures') {
    ritual.value = procedures.slice(0, 8).join(', ').slice(0, 1200);
  } else {
    try {
      ritual.value = localStorage.getItem('private-sochi-ritual') || '';
    } catch {
      // The form also works when browser storage is disabled.
    }
  }
  if (params.get('for') === 'partner') requestForm.elements.audience.value = 'Партнер';

  const departure = requestForm.elements.departure;
  const flightDay = params.get('departure');
  if (flightDay === 'sunday' || flightDay === 'monday') departure.value = flightDay;

  const result = document.getElementById('request-result');
  const requestText = document.getElementById('request-text');
  const status = document.getElementById('form-status');
  const share = document.getElementById('share-request');
  requestForm.querySelector('.form-actions').hidden = false;
  share.hidden = typeof navigator.share !== 'function';

  function buildRequest() {
    const data = new FormData(requestForm);
    const value = (key) => (data.get(key) || '').trim();
    const options = [
      data.has('banya') && 'парение с пармастером',
      data.has('spa') && 'массаж и банные процедуры',
      data.has('dinner') && 'кухня и напитки под заказ',
    ].filter(Boolean);
    return [
      'Запрос на частный банный уикенд в Сочи',
      'Кто обращается: ' + value('audience'),
      value('dates') && 'Даты уикенда: ' + value('dates'),
      value('guests') && 'Гостей: ' + value('guests'),
      value('departure') && 'Обратный вылет: ' + departure.selectedOptions[0].textContent,
      value('hotel') && 'Гостиница: ' + value('hotel'),
      value('flights') && 'Рейсы и время: ' + value('flights'),
      options.length && 'В программе: ' + options.join(', '),
      value('ritual') && 'Процедуры и парение: ' + value('ritual'),
      value('cuisine') && 'Кухня: ' + value('cuisine'),
      value('drinks') && 'Напитки: ' + value('drinks'),
      value('avoid') && 'Исключить: ' + value('avoid'),
      value('notes') && 'Пожелания: ' + value('notes'),
    ].filter(Boolean).join('\n');
  }

  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    requestText.value = buildRequest();
    result.hidden = false;
    requestText.focus();
    status.textContent = 'Запрос готов. Его можно скопировать и передать организатору.';
  });
  requestForm.addEventListener('input', () => {
    if (!result.hidden) {
      requestText.value = buildRequest();
      status.textContent = '';
    }
  });
  document.getElementById('copy-request').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(requestText.value);
      status.textContent = 'Текст запроса скопирован.';
    } catch {
      requestText.select();
      status.textContent = 'Текст выделен. Скопируйте его через меню браузера.';
    }
  });
  share.addEventListener('click', async () => {
    try {
      await navigator.share({ title: 'Банный уикенд в Сочи', text: requestText.value });
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = 'Не удалось открыть меню. Скопируйте текст запроса.';
    }
  });
}
