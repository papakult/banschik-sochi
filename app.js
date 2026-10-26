const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const hero = document.querySelector('.hero');
const video = document.querySelector('.hero-video');
const motionButton = document.querySelector('.motion-control');
const motionLabel = motionButton.querySelector('.motion-label');
const motionIcon = motionButton.querySelector('.motion-icon');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateMotion(paused) {
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Включить видео' : 'Остановить видео');
  motionLabel.textContent = paused ? 'Смотреть' : 'Пауза';
  motionIcon.textContent = paused ? '▷' : 'Ⅱ';
}
video.addEventListener('error', () => { hero.classList.add('video-failed'); motionButton.hidden = true; });
video.querySelector('source').addEventListener('error', () => { hero.classList.add('video-failed'); motionButton.hidden = true; });
if (reducedMotion.matches) { video.pause(); updateMotion(true); }
motionButton.addEventListener('click', () => {
  if (video.paused) video.play().then(() => updateMotion(false)).catch(() => updateMotion(true));
  else { video.pause(); updateMotion(true); }
});

document.querySelectorAll('.day').forEach(button => button.addEventListener('click', () => {
  const panel = button.nextElementSibling;
  const wasOpen = button.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.day').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-expanded', 'false'); b.querySelector('.day-sign').textContent = '+'; });
  document.querySelectorAll('.day-panel').forEach(p => p.classList.remove('open'));
  if (!wasOpen) { button.classList.add('active'); button.setAttribute('aria-expanded', 'true'); button.querySelector('.day-sign').textContent = '−'; panel.classList.add('open'); }
}));

const planner = document.getElementById('planner');
const status = document.getElementById('planner-status');
const interestNames = {banya:'баня с мастером',stay:'проживание',routes:'поездки по Сочи',transfer:'трансфер'};
document.querySelectorAll('[data-open-planner]').forEach(button => button.addEventListener('click', () => {
  const interest = button.dataset.interest;
  if (interest) planner.querySelector(`input[value="${interest}"]`).checked = true;
  status.textContent = '';
  planner.showModal();
}));
planner.addEventListener('click', event => { if (event.target === planner) planner.close(); });
function planText() {
  const dates = document.getElementById('dates').value.trim();
  const guests = document.getElementById('guests').value.trim();
  const notes = document.getElementById('notes').value.trim();
  const wants = [...planner.querySelectorAll('input[type="checkbox"]:checked')].map(i => interestNames[i.value]);
  return ['Запрос на частное банное путешествие в Сочи', dates && `Даты: ${dates}`, guests && `Гостей: ${guests}`, `Интересует: ${wants.length ? wants.join(', ') : 'обсудить программу'}`, notes && `Пожелания: ${notes}`].filter(Boolean).join('\n');
}
document.getElementById('copy-plan').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(planText()); status.textContent = 'Запрос скопирован. Его можно отправить организатору или партнеру.'; }
  catch { status.textContent = 'Копирование недоступно в этом браузере. Попробуйте кнопку "Поделиться".'; }
});
document.getElementById('share-plan').addEventListener('click', async () => {
  if (navigator.share) {
    try { await navigator.share({title:'Частное банное путешествие в Сочи',text:planText()}); status.textContent = 'Запрос передан в меню отправки.'; }
    catch (error) { if (error.name !== 'AbortError') status.textContent = 'Не удалось открыть меню отправки.'; }
  } else {
    try { await navigator.clipboard.writeText(planText()); status.textContent = 'Запрос скопирован, так как меню отправки недоступно.'; }
    catch { status.textContent = 'Меню отправки недоступно в этом браузере.'; }
  }
});
