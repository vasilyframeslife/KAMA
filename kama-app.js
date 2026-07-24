/* =============================================================================
   KAMA-APP.JS
   Сайт «Кама» — аренда квартир в Набережных Челнах.
   Вся логика интерфейса: состояние, рендер, обработчики событий.
   Использует данные из kama-data.js (ICONS, FILTER_DEFS, FAQ, APARTMENTS) —
   этот файл должен подключаться ПОСЛЕ kama-data.js.

   The "Kama" apartment-rental site (Naberezhnye Chelny).
   All UI logic: state, rendering, event handlers.
   Relies on data from kama-data.js (ICONS, FILTER_DEFS, FAQ, APARTMENTS) —
   this file must be linked AFTER kama-data.js.

   Подключается из index.html последним, перед </body>:
   Linked from index.html last, right before </body>:
     <script src="kama-data.js"></script>
     <script src="kama-app.js"></script>

   Структура файла (сверху вниз) / File structure (top to bottom):
     1. Глобальное состояние            — Global state
     2. Утилиты (цена, тост, скролл)    — Utilities (price, toast, scroll)
     3. Плашки-фильтры и живые счётчики — Filter pills & live counts
     4. FAQ-аккордеон                   — FAQ accordion
     5. Поиск и сброс                   — Search & reset
     6. Каталог: фильтрация/рендер      — Catalog: filtering/rendering
     7. Избранное                       — Favorites
     8. Галерея фото + свайп            — Photo gallery + swipe
     9. Открытие/закрытие страницы квартиры — Opening/closing the detail page
    10. Плавное сжатие шапки при скролле    — Continuous scroll-shrink header
    11. Сравнение квартир                   — Apartment comparison
    12. Форма записи на просмотр            — Booking form
    13. Запуск приложения (вызовы при загрузке) — App bootstrap (initial calls)
   ============================================================================= */

let favorites = new Set();
let activeFilters = new Set();
let viewedIds = [];
let searchState = {district:'', rooms:'', budget:null};
let currentDetailId = null;
let galleryIdx = 0;
let openModalsCount = 0;

// Форматирует цену в рубли с пробелами-разделителями тысяч.
// Formats a price in rubles with thousands separators.
function fmtPrice(p){ return p.toLocaleString('ru-RU') + ' ₽'; }

// Производительность: вместо одной фиксированной ширины фото — набор
// вариантов (srcset), браузер сам выбирает подходящий под экран и плотность
// пикселей, вместо того чтобы всегда грузить, например, 1200px на телефон
// с экраном 380px.
// Performance: instead of one fixed-width photo, offer a srcset — the browser
// picks the right size for the actual screen/pixel density, instead of always
// downloading e.g. a 1200px image onto a 380px-wide phone screen.
// Строит srcset для адаптивной загрузки фото (см. верх файла).
// Builds a srcset for responsive image loading (see top of file).
function srcsetFor(url){
  const widths = [480, 768, 1080, 1400];
  return widths.map(w => url.replace(/w=\d+/, 'w=' + w) + ' ' + w + 'w').join(', ');
}
const CARD_SIZES = '(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw';
// Возвращает подпись количества комнат с учётом склонения/студии.
// Returns a human-readable rooms label (handles the studio case).
function roomsLabel(r){ if(r===0) return 'Студия'; if(r===1) return '1 комната'; return r+' комнаты'; }

// Показывает всплывающее уведомление (тост) на 2.6 секунды.
// Shows a toast notification for 2.6 seconds.
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.classList.remove('show'), 2600);
}

// Плавно прокручивает к элементу по id, либо наверх, если id не передан.
// Smoothly scrolls to an element by id, or to the top if no id is given.
function scrollToId(id){
  if(!id) { window.scrollTo({top:0, behavior:'smooth'}); return; }
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}
// Возвращает на главную и затем (если нужно) докручивает к разделу — используется ссылками в хэдере/футере, которые должны работать из любого экрана.
// Goes home and then (if needed) scrolls to a section — used by header/footer links so they work from any screen.
function goHomeAndScroll(id){
  const alreadyHome = !document.getElementById('home-view').classList.contains('hidden');
  goHome(true);
  setTimeout(()=> scrollToId(id), alreadyHome ? 0 : 60);
}

// Открытие модального окна: включает лёгкое затемнение фона (appRoot.blurred).
// Opening a modal: turns on the background dim (appRoot.blurred).
function pushModalBlur(){ openModalsCount++; document.getElementById('appRoot').classList.add('blurred'); }
// Закрытие модального окна: считает открытые окна, чтобы не снять затемнение, если открыто ещё одно.
// Closing a modal: counts open modals so the dim isn't removed while another one is still open.
function popModalBlur(){ openModalsCount = Math.max(0, openModalsCount-1); if(openModalsCount===0) document.getElementById('appRoot').classList.remove('blurred'); }

// Рисует плашки-фильтры и сразу считает живые счётчики для них.
// Renders the filter pills and immediately computes their live counts.
function renderFilters(){
  const el = document.getElementById('filters');
  el.innerHTML = FILTER_DEFS.map((f,i) => `
    <button class="pill" style="animation-delay:${0.15+i*0.05}s" data-key="${f.key}" onclick="toggleFilter('${f.key}')">
      ${f.icon}<span>${f.label}</span><span class="pill-count" data-count-for="${f.key}"></span>
    </button>`).join('');
  updateFilterCounts();
}
// Проверяет квартиру на соответствие поиску (район/комнаты/бюджет), БЕЗ учёта плашек-фильтров — переиспользуется при подсчёте live-счётчиков.
// Checks an apartment against the search state (district/rooms/budget) WITHOUT the filter pills — reused when computing live counts.
function baseMatchesSearch(a){
  if(searchState.district && a.addr.indexOf(searchState.district) === -1) return false;
  if(searchState.rooms !== '' && String(a.rooms) !== searchState.rooms) return false;
  if(searchState.budget !== null && a.price > searchState.budget) return false;
  return true;
}
// Считает и показывает на каждой плашке, сколько квартир останется, если её включить.
// Computes and displays, on each pill, how many apartments would remain if it were turned on.
function updateFilterCounts(){
  FILTER_DEFS.forEach(f => {
    const preview = new Set(activeFilters);
    preview.add(f.key); // "if you also turn this one on"
    const n = APARTMENTS.filter(a => baseMatchesSearch(a) && [...preview].every(k => a.tags.includes(k))).length;
    const el = document.querySelector(`.pill-count[data-count-for="${f.key}"]`);
    if(el) el.textContent = activeFilters.has(f.key) ? '' : `· ${n}`;
  });
}
// Рисует список вопросов-ответов (FAQ) в свёрнутом виде.
// Renders the FAQ list, collapsed.
function renderFaq(){
  const el = document.getElementById('faqList');
  el.innerHTML = FAQ.map((item,i) => `
    <div class="faq-item" id="faqItem${i}">
      <button class="faq-q" onclick="toggleFaq(${i})">
        <span>${item.q}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="#1C1A16" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      <div class="faq-a" id="faqA${i}"><p>${item.a}</p></div>
    </div>`).join('');
}
// Разворачивает/сворачивает один пункт FAQ по клику.
// Expands/collapses a single FAQ item on click.
function toggleFaq(i){
  const item = document.getElementById('faqItem'+i);
  const a = document.getElementById('faqA'+i);
  const isOpen = item.classList.toggle('open');
  a.style.maxHeight = isOpen ? a.scrollHeight+'px' : '0px';
}

// Переключает плашку-фильтр и обновляет каталог + счётчики.
// Toggles a filter pill and refreshes the catalog + counts.
function toggleFilter(key){
  if(activeFilters.has(key)) activeFilters.delete(key); else activeFilters.add(key);
  document.querySelectorAll('.pill').forEach(p => p.classList.toggle('on', activeFilters.has(p.dataset.key)));
  renderCatalog();
  updateResetBtn();
  updateFilterCounts();
}
// Считывает поля поиска (район/комнаты/бюджет) и применяет их.
// Reads the search fields (district/rooms/budget) and applies them.
function applySearch(){
  searchState.district = document.getElementById('districtSelect').value;
  searchState.rooms = document.getElementById('roomsSelect').value;
  const b = parseInt(document.getElementById('budgetInput').value, 10);
  searchState.budget = isNaN(b) ? null : b;
  renderCatalog();
  updateResetBtn();
  updateFilterCounts();
  document.querySelector('.catalog-head').scrollIntoView({behavior:'smooth', block:'start'});
}
// true, если сейчас активен хотя бы один фильтр или параметр поиска.
// true if at least one filter or search parameter is currently active.
function hasActiveSearch(){
  return activeFilters.size > 0 || !!searchState.district || searchState.rooms !== '' || searchState.budget !== null;
}
// Показывает/прячет ссылку «Сбросить фильтры и поиск».
// Shows/hides the "Reset filters and search" link.
function updateResetBtn(){ document.getElementById('resetBtn').classList.toggle('visible', hasActiveSearch()); }
// Полностью сбрасывает поиск и фильтры к значениям по умолчанию.
// Fully resets search and filters back to their defaults.
function resetSearch(){
  activeFilters.clear();
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
  document.getElementById('districtSelect').value = '';
  document.getElementById('roomsSelect').value = '';
  document.getElementById('budgetInput').value = '';
  searchState = {district:'', rooms:'', budget:null};
  renderCatalog();
  updateResetBtn();
  updateFilterCounts();
  showToast('Фильтры и поиск сброшены');
}

// Основная функция фильтрации + сортировки каталога квартир.
// The core filter + sort function for the apartment catalog.
function filteredList(){
  let list = APARTMENTS.filter(a => {
    if(activeFilters.size && ![...activeFilters].every(f => a.tags.includes(f))) return false;
    if(searchState.district && a.addr.indexOf(searchState.district) === -1) return false;
    if(searchState.rooms !== '' && String(a.rooms) !== searchState.rooms) return false;
    if(searchState.budget !== null && a.price > searchState.budget) return false;
    return true;
  });
  const sort = document.getElementById('sortSelect') ? document.getElementById('sortSelect').value : 'rec';
  if(sort==='cheap') list = list.slice().sort((a,b)=>a.price-b.price);
  if(sort==='exp') list = list.slice().sort((a,b)=>b.price-a.price);
  return list;
}
// Возвращает текст "почему подходит" для активных фильтров конкретной квартиры.
// Returns the "why it matches" text for a given apartment's active filters.
function reasonText(a){
  if(activeFilters.size===0) return '';
  const parts = [...activeFilters].filter(f=>a.reasons[f]).map(f=>a.reasons[f]);
  return parts.length ? parts[0] : '';
}

/* price-tier sizing: the single priciest visible apartment gets the full-width
   "big" card, roughly the next third become "medium" (2 per row), the rest "small" (4 per row) */
// Решает, какой карточке какой размер (big/medium/small) — самая дорогая ИЛИ отмеченная как featured становится большой.
// Decides which card gets which size (big/medium/small) — the priciest OR the one flagged as featured becomes the big one.
function computeSizeTiers(list){
  const map = {};
  const n = list.length;
  if(n===0) return map;
  const byPrice = [...list].sort((a,b)=>b.price-a.price);
  const bigN = n>=3 ? 1 : 0;
  const rest = n - bigN;
  let medN = n>=3 ? Math.max(1, Math.round(rest*0.4)) : (n>=2?1:0);
  medN = Math.min(medN, rest);
  const smallN = rest - medN;
  // "big" slot goes to a deliberately curated listing (a.featured) if one is present
  // in this view, so the largest card means "we picked this one" rather than just
  // "this happens to be the most expensive one right now".
  const featuredPick = list.find(a => a.featured);
  const ordered = featuredPick ? [featuredPick, ...byPrice.filter(a => a.id !== featuredPick.id)] : byPrice;
  let idx=0;
  for(let i=0;i<bigN;i++) map[ordered[idx++].id]='big';
  for(let i=0;i<medN;i++) map[ordered[idx++].id]='medium';
  for(let i=0;i<smallN;i++) map[ordered[idx++].id]='small';
  return map;
}

// Рисует горизонтальную ленту «Вы недавно смотрели».
// Renders the horizontal "recently viewed" rail.
function renderRecentRail(){
  const wrap = document.getElementById('recentRailWrap');
  if(viewedIds.length===0){ wrap.innerHTML=''; return; }
  const items = viewedIds.slice().reverse().map(id => APARTMENTS.find(a=>a.id===id)).filter(Boolean);
  wrap.innerHTML = `
    <div class="recent-rail">
      <div class="eyebrow" style="margin-bottom:14px;">Вы недавно смотрели</div>
      <div class="recent-rail-inner">
        ${items.map(a => `
          <div class="recent-chip" onclick="openDetail(${a.id})">
            <img src="${a.img}" srcset="${srcsetFor(a.img)}" sizes="180px" alt="${a.title}" loading="lazy">
            <div class="rc-label">${a.badge} · ${fmtPrice(a.price)}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

// Главный рендер каталога: список, пустое состояние, бейдж активных фильтров.
// Main catalog render: the list, the empty state, the active-filters badge.
function renderCatalog(){
  const list = filteredList();
  const n = list.length;
  document.getElementById('resultCount').textContent = `${n} вариант${n===1?'':(n>=2&&n<=4?'а':'ов')}`;
  const badge = document.getElementById('activeFiltersBadge');
  const activeCount = activeFilters.size + (searchState.district?1:0) + (searchState.rooms!==''?1:0) + (searchState.budget!==null?1:0);
  if(badge){
    badge.classList.toggle('show', activeCount>0);
    badge.textContent = activeCount>0 ? `Активно фильтров: ${activeCount} · сбросить` : '';
  }
  const el = document.getElementById('catalog');
  if(n===0){
    el.innerHTML = `<div class="empty-state">
      <h3>Пока ничего не подходит</h3>
      <p>Условия сочетаются одновременно — например «с питомцем» и «для семьи» вместе редко совпадают у одной квартиры. Попробуйте снять один из фильтров или увеличить бюджет.</p>
      <button class="detail-cta" style="width:auto; padding:14px 26px; margin-top:8px;" onclick="resetSearch()">Сбросить фильтры и поиск</button>
    </div>`;
    renderRecentRail();
    return;
  }
  const sizeMap = computeSizeTiers(list);
  el.innerHTML = list.map((a,i) => {
    const reason = reasonText(a);
    const isViewed = viewedIds.includes(a.id);
    const size = sizeMap[a.id] || 'small';
    return `
    <div class="card ${size} ${isViewed?'viewed':''}" style="animation-delay:${i*0.05}s" role="button" tabindex="0" aria-label="Открыть: ${a.title}, ${fmtPrice(a.price)} в месяц" onclick="openDetail(${a.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openDetail(${a.id});}">
      <div class="imgwrap">
        <img src="${a.img}" srcset="${srcsetFor(a.img)}" sizes="${CARD_SIZES}" alt="${a.title}" loading="lazy">
        <div class="card-badge ${isViewed?'viewed-badge':''}">${isViewed ? 'Вы уже смотрели' : a.badge}</div>
        <button class="card-fav ${favorites.has(a.id)?'on':''}" onclick="event.stopPropagation(); toggleFav(${a.id})" aria-label="${favorites.has(a.id)?'Убрать из избранного':'В избранное'}">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 20.5C12 20.5 3 15 3 8.7C3 5.7 5.3 3.5 8.2 3.5C10 3.5 11.3 4.4 12 5.6C12.7 4.4 14 3.5 15.8 3.5C18.7 3.5 21 5.7 21 8.7C21 15 12 20.5 12 20.5Z" stroke="#1C1A16" stroke-width="1.5"/></svg>
        </button>
      </div>
      <div class="card-body">
        <div class="card-caption">${a.caption}</div>
        <div class="card-context">${a.context}</div>
        ${reason ? `<div class="card-reason">${reason}</div>` : ''}
        <div class="card-meta">
          <span class="card-loc">${a.addr}</span>
          <span class="card-price">${fmtPrice(a.price)}<sup>/мес</sup></span>
        </div>
      </div>
    </div>`;
  }).join('');
  renderRecentRail();
}

// Рендер страницы «Избранное» + видимость кнопки «Сравнить».
// Renders the Favorites page + visibility of the "Compare" button.
function renderFavorites(){
  const el = document.getElementById('favCatalog');
  const list = APARTMENTS.filter(a => favorites.has(a.id));
  const compareBtn = document.getElementById('favCompareBtn');
  if(compareBtn) compareBtn.style.display = list.length>=2 ? 'block' : 'none';
  if(list.length===0){
    el.innerHTML = `<div class="empty-state">
      <h3>Список пока пуст</h3>
      <p>Нажмите на сердце на любой квартире — она появится здесь, и вы сможете вернуться к ней позже.</p>
    </div>`;
    return;
  }
  const sizeMap = computeSizeTiers(list);
  el.innerHTML = list.map(a => `
    <div class="card ${sizeMap[a.id]||'small'}" role="button" tabindex="0" aria-label="Открыть: ${a.title}, ${fmtPrice(a.price)} в месяц" onclick="openDetail(${a.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openDetail(${a.id});}">
      <div class="imgwrap">
        <img src="${a.img}" srcset="${srcsetFor(a.img)}" sizes="${CARD_SIZES}" alt="${a.title}" loading="lazy">
        <div class="card-badge">${a.badge}</div>
        <button class="card-fav on" onclick="event.stopPropagation(); toggleFav(${a.id}); renderFavorites();" aria-label="Убрать из избранного">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 20.5C12 20.5 3 15 3 8.7C3 5.7 5.3 3.5 8.2 3.5C10 3.5 11.3 4.4 12 5.6C12.7 4.4 14 3.5 15.8 3.5C18.7 3.5 21 5.7 21 8.7C21 15 12 20.5 12 20.5Z" stroke="#1C1A16" stroke-width="1.5"/></svg>
        </button>
      </div>
      <div class="card-body">
        <div class="card-caption">${a.caption}</div>
        <div class="card-context">${a.context}</div>
        <div class="card-meta">
          <span class="card-loc">${a.addr}</span>
          <span class="card-price">${fmtPrice(a.price)}<sup>/мес</sup></span>
        </div>
      </div>
    </div>`).join('');
}

// Добавляет/убирает квартиру из избранного, обновляет счётчик в шапке.
// Adds/removes an apartment from favorites, updates the header counter.
function toggleFav(id){
  if(favorites.has(id)){ favorites.delete(id); } else { favorites.add(id); showToast('Добавлено в избранное'); }
  document.getElementById('favCount').textContent = favorites.size;
  document.getElementById('favCount').classList.toggle('show', favorites.size>0);
  document.getElementById('favNavBtn').classList.toggle('active-fav', favorites.size>0);
  if(!document.getElementById('home-view').classList.contains('hidden')) renderCatalog();
  if(document.getElementById('fav-view').classList.contains('visible')) renderFavorites();
}
// Синхронизирует сердечко на странице квартиры с текущим состоянием избранного.
// Syncs the heart icon on the apartment page with the current favorites state.
function syncDetailFav(){ document.getElementById('detailFavBtn').classList.toggle('on', favorites.has(currentDetailId)); }

// Возврат на главную страницу (закрывает карточку квартиры, если она открыта).
// Returns to the home page (closes the apartment detail view if it's open).
function goHome(skipScrollReset){
  closeDetail(true);
  document.getElementById('fav-view').classList.remove('visible');
  document.getElementById('home-view').classList.remove('hidden');
  if(!skipScrollReset) window.scrollTo(0,0);
}
// Открывает страницу «Избранное».
// Opens the Favorites page.
function goFavorites(){
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('detail-view').classList.remove('visible');
  document.getElementById('fav-view').classList.add('visible');
  renderFavorites();
  window.scrollTo(0,0);
}

/* ---- gallery ---- */
// Рисует миниатюры фотогалереи квартиры.
// Renders the apartment photo-gallery thumbnails.
function renderGallery(a){
  galleryIdx = 0;
  document.getElementById('galleryThumbs').innerHTML = a.gallery.map((img,i) => `
    <button class="gallery-thumb ${i===0?'on':''}" data-i="${i}" onclick="setGallery(${i})">
      <img src="${img.replace(/w=\d+/,'w=400')}" alt="Фото ${i+1}">
    </button>`).join('');
}
// Переключает главное фото галереи по индексу (с зацикливанием).
// Switches the main gallery photo by index (wraps around).
function setGallery(idx){
  const a = APARTMENTS.find(x => x.id === currentDetailId);
  if(!a) return;
  galleryIdx = ((idx % a.gallery.length) + a.gallery.length) % a.gallery.length;
  document.getElementById('detailImg').src = a.gallery[galleryIdx].replace(/w=\d+/, 'w=1600');
  document.querySelectorAll('.gallery-thumb').forEach((el,i)=> el.classList.toggle('on', i===galleryIdx));
}
// Следующее фото в галерее.
// Next gallery photo.
function galleryNext(){ setGallery(galleryIdx+1); }
// Предыдущее фото в галерее.
// Previous gallery photo.
function galleryPrev(){ setGallery(galleryIdx-1); }

/* swipe left/right on the hero photo to move through the gallery */
(function(){
  const media = document.getElementById('detailHeroMedia');
  let startX = null, startY = null, dragging = false;
  // Начало жеста (свайп/зажатие мышью).
  // Start of a gesture (swipe or mouse-drag).
  function start(x,y){ startX = x; startY = y; dragging = true; }
  // Конец жеста — если сдвиг по горизонтали больше вертикального и достаточно большой, листаем фото.
  // End of a gesture — if the horizontal move is bigger than vertical and large enough, flip the photo.
  function end(x,y){
    if(!dragging || startX===null) { dragging=false; return; }
    const dx = x - startX, dy = y - startY;
    dragging = false;
    if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)){
      dx < 0 ? galleryNext() : galleryPrev();
    }
    startX = null;
  }
  media.addEventListener('touchstart', e => { const t=e.touches[0]; start(t.clientX, t.clientY); }, {passive:true});
  media.addEventListener('touchend', e => { const t=e.changedTouches[0]; end(t.clientX, t.clientY); }, {passive:true});
  media.addEventListener('pointerdown', e => { if(e.pointerType==='touch') return; start(e.clientX, e.clientY); });
  media.addEventListener('pointerup', e => { if(e.pointerType==='touch') return; end(e.clientX, e.clientY); });
})();

/* ---- open / close detail — simple fade + scale on an inner media wrapper only,
   so the sticky hero container itself never animates (that was the source of the
   jitter — animating transform/opacity directly on a position:sticky element). ---- */
// Открывает страницу квартиры: заполняет все блоки данными и запускает анимацию появления.
// Opens the apartment detail page: fills in every block with data and starts the entrance animation.
function openDetail(id){
  const a = APARTMENTS.find(x => x.id === id);
  if(!a) return;
  currentDetailId = id;

  viewedIds = viewedIds.filter(v => v !== id);
  viewedIds.push(id);
  if(viewedIds.length > 5) viewedIds.shift();

  renderGallery(a);
  const img = document.getElementById('detailImg');
  img.style.transform = '';
  img.src = a.gallery[0].replace(/w=\d+/, 'w=1600');
  document.getElementById('detailTitle').textContent = a.title;
  document.getElementById('detailAddr').textContent = a.addr;
  document.getElementById('detailPrice').innerHTML = fmtPrice(a.price) + '<span>в месяц</span>';
  syncDetailFav();

  document.getElementById('detailFacts').innerHTML = `
    <div class="fi"><div class="fi-label">Комнат</div><div class="fi-value">${roomsLabel(a.rooms)}</div></div>
    <div class="fi"><div class="fi-label">Площадь</div><div class="fi-value">${a.area} м²</div></div>
    <div class="fi"><div class="fi-label">Этаж</div><div class="fi-value">${a.floor} из ${a.floors}</div></div>
    <div class="fi"><div class="fi-label">Заселение</div><div class="fi-value">${a.availableFrom}</div></div>`;

  document.getElementById('detailAbout').textContent = a.about;
  document.getElementById('detailDistrict').textContent = a.aboutDistrict;
  document.getElementById('detailLikes').innerHTML = a.likes.map(l => `<div class="chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13L9.5 17.5L19 7" stroke="#1E2D4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${l}</div>`).join('');
  document.getElementById('detailNearby').innerHTML = a.nearby.map(([name,dist]) => `
    <div class="nearby-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 19 14.6 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 14.6 12 21 12 21Z" stroke="#1C1A16" stroke-width="1.5"/></svg><span>${name}</span><span class="dist">${dist}</span></div>`).join('');
  document.getElementById('detailIdeal').textContent = a.ideal;
  document.getElementById('detailImportant').innerHTML = a.important.map(i => `<div class="important-item"><div class="dot"></div><p>${i}</p></div>`).join('');

  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('fav-view').classList.remove('visible');
  const dv = document.getElementById('detail-view');
  const hero = document.getElementById('detailHero');
  const media = document.getElementById('detailHeroMedia');
  const body = document.getElementById('detailBody');

  hero.classList.remove('compact');
  heroCompact = false;
  hero.style.height = '';
  hero.dataset.animating = '1';
  body.classList.remove('show');
  ['detailBackBtn','detailFavBtn'].forEach(id => { const el=document.getElementById(id); if(el){ el.style.height=''; el.style.width=''; el.style.top=''; el.style.right=''; el.style.opacity=''; el.style.visibility=''; el.style.pointerEvents=''; } });
  const infoReset = document.getElementById('detailHeroInfo'); if(infoReset){ infoReset.style.padding=''; infoReset.style.alignItems=''; }
  const titleReset = document.getElementById('detailTitle'); if(titleReset) titleReset.style.fontSize='';
  const priceReset = document.getElementById('detailPrice'); if(priceReset) priceReset.style.fontSize='';
  const addrReset = document.getElementById('detailAddr'); if(addrReset){ addrReset.style.opacity=''; addrReset.style.maxHeight=''; }
  const labelReset = document.getElementById('detailBackLabel'); if(labelReset){ labelReset.style.opacity=''; labelReset.style.maxWidth=''; labelReset.style.marginLeft=''; }

  dv.classList.add('visible');
  document.getElementById('mainNav').style.display = 'none';
  window.scrollTo(0,0);

  media.classList.remove('entering');
  void media.offsetWidth; // restart animation
  media.classList.add('entering');

  setTimeout(() => { body.classList.add('show'); hero.dataset.animating='0'; }, 300);
  setTimeout(updateCompareFab, 50);
}

// Закрывает страницу квартиры (плавное затухание) и возвращает каталог.
// Closes the apartment detail page (fade out) and returns to the catalog.
function closeDetail(skipAnim){
  const dv = document.getElementById('detail-view');
  if(!dv.classList.contains('visible')) return;
  const body = document.getElementById('detailBody');
  const media = document.getElementById('detailHeroMedia');
  body.classList.remove('show');
  media.classList.remove('entering');

  const finish = () => {
    dv.classList.remove('visible');
    document.getElementById('mainNav').style.display = '';
    document.getElementById('home-view').classList.remove('hidden');
    renderCatalog();
    window.scrollTo(0,0);
    document.getElementById('detailHero').style.height='';
    setTimeout(updateCompareFab, 60);
  };
  if(skipAnim){ finish(); return; }
  dv.style.transition = 'opacity .3s var(--ease)';
  dv.style.opacity = '0';
  setTimeout(() => { dv.style.opacity=''; dv.style.transition=''; finish(); }, 300);
}

/* smooth cinematic hero shrink on scroll — everything (button size/position, side
   padding, title/price font-size, address fade) is interpolated continuously from
   the same t value, so nothing ever snaps or drifts out of sync with anything else */
let heroCompact = false;
// CSS-правило "@media (prefers-reduced-motion: reduce)" не может погасить
// эту анимацию — она управляется через requestAnimationFrame в JS, а не через
// CSS-transition. Поэтому проверяем предпочтение явно и, если оно включено,
// сразу переключаем в конечное состояние без плавного пути между кадрами.
// The CSS "prefers-reduced-motion" rule can't reach this animation — it's
// driven by requestAnimationFrame in JS, not a CSS transition. So we check
// the preference explicitly and, if set, jump straight to the end state
// instead of interpolating frame by frame.
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroTicking = false;
// Простая линейная интерполяция между двумя числами по t (0..1).
// Simple linear interpolation between two numbers by t (0..1).
function lerp(a,b,t){ return a + (b-a)*t; }
// Главная функция плавного «сжатия» фото при скролле — см. подробный комментарий внутри.
// The main continuous hero-shrink-on-scroll function — see the detailed comment inside.
function updateHeroScroll(){
  heroTicking = false;
  const dv = document.getElementById('detail-view');
  if(!dv.classList.contains('visible')) return;
  const hero = document.getElementById('detailHero');
  if(hero.dataset.animating === '1') return;
  const MAX_H = Math.round(window.innerHeight * 0.66);
  const MIN_H = 84;
  const range = Math.max(1, MAX_H - MIN_H);
  const y = Math.max(0, window.scrollY);
  let t = Math.min(1, y / MAX_H); // t=1 exactly when the flow spacer (height:66vh) has fully scrolled past
  if(prefersReducedMotion){ t = y > MAX_H * 0.5 ? 1 : 0; } // no glide — snap between two states
  hero.style.height = (MAX_H - t * range) + 'px';
  hero.classList.toggle('compact', t > 0.96);

  const img = document.getElementById('detailImg');
  if(img) img.style.transform = `scale(${1 + t * 0.05})`;

  const back = document.getElementById('detailBackBtn');
  const fav = document.getElementById('detailFavBtn');
  const info = document.getElementById('detailHeroInfo');
  const title = document.getElementById('detailTitle');
  const addr = document.getElementById('detailAddr');
  const price = document.getElementById('detailPrice');
  const label = document.getElementById('detailBackLabel');
  if(back && fav && info && title && price){
    const btnH = lerp(44, 36, t);
    const btnTop = lerp(24, 12, t);
    back.style.height = btnH + 'px';
    back.style.top = btnTop + 'px';
    fav.style.height = btnH + 'px';
    fav.style.width = btnH + 'px';
    fav.style.top = btnTop + 'px';
    const sidePad = lerp(40, 84, t);
    info.style.padding = `${lerp(30,16,t)}px ${sidePad}px ${lerp(34,16,t)}px ${sidePad}px`;
    info.style.alignItems = t > 0.6 ? 'center' : 'flex-end';
    title.style.fontSize = lerp(38, 17, t) + 'px';
    price.style.fontSize = lerp(22, 15, t) + 'px';
    if(addr){ const aOpacity = Math.max(0, 1 - t*2.2); addr.style.opacity = aOpacity; addr.style.maxHeight = aOpacity < 0.05 ? '0px' : '20px'; }
    if(label){ const lw = Math.max(0, 1 - t*2.2); label.style.opacity = lw; label.style.maxWidth = lw < 0.05 ? '0px' : '80px'; label.style.marginLeft = lw < 0.05 ? '-6px' : '0px'; }
  }

  if(!heroCompact && t > 0.92) heroCompact = true;
  else if(heroCompact && t < 0.78) heroCompact = false;
}
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 4);
  if(!heroTicking){ heroTicking = true; requestAnimationFrame(updateHeroScroll); }
}, {passive:true});

/* ---- compare FAB + modal ---- */
// Показывает/прячет плавающую кнопку сравнения.
// Shows/hides the floating compare button.
function updateCompareFab(){
  const fab = document.getElementById('compareFab');
  if(document.getElementById('detail-view').classList.contains('visible') || viewedIds.length < 2){
    fab.classList.remove('show'); return;
  }
  fab.classList.add('show');
}
// Заполняет два выпадающих списка в окне сравнения, сгруппированных по району.
// Fills the two dropdowns in the compare modal, grouped by district.
function populateCompareSelects(defA, defB){
  const byDistrict = {};
  APARTMENTS.forEach(a => { (byDistrict[a.addr] = byDistrict[a.addr] || []).push(a); });
  const opts = Object.keys(byDistrict).map(addr => `
    <optgroup label="${addr}">
      ${byDistrict[addr].map(a => `<option value="${a.id}">${a.title} — ${fmtPrice(a.price)}</option>`).join('')}
    </optgroup>`).join('');
  const selA = document.getElementById('compareSelectA');
  const selB = document.getElementById('compareSelectB');
  selA.innerHTML = opts; selB.innerHTML = opts;
  selA.value = defA; selB.value = defB;
}
// Открывает окно сравнения с последними двумя просмотренными квартирами.
// Opens the compare modal with the last two viewed apartments.
function openCompareModal(){
  const ids = viewedIds.length>=2 ? viewedIds.slice(-2) : [APARTMENTS[0].id, APARTMENTS[1].id];
  populateCompareSelects(ids[0], ids[1]);
  renderCompare();
  document.getElementById('compareOverlay').classList.add('show');
  pushModalBlur();
}
// Открывает окно сравнения с двумя первыми избранными квартирами.
// Opens the compare modal with the first two favorited apartments.
function openCompareFromFavorites(){
  const favIds = APARTMENTS.filter(a => favorites.has(a.id)).map(a=>a.id).slice(0,2);
  if(favIds.length<2) return;
  populateCompareSelects(favIds[0], favIds[1]);
  renderCompare();
  document.getElementById('compareOverlay').classList.add('show');
  pushModalBlur();
}
// Закрывает окно сравнения.
// Closes the compare modal.
function closeCompareModal(){
  document.getElementById('compareOverlay').classList.remove('show');
  popModalBlur();
}
// Возвращает читаемую подпись фильтра по его ключу (для чипов «плюсы»).
// Returns a filter's human-readable label by key (for the "pros" chips).
function labelForTag(t){ const f = FILTER_DEFS.find(x=>x.key===t); return f ? f.label : t; }
// Рисует таблицу сравнения двух выбранных квартир (цена/площадь/район/плюсы).
// Renders the comparison table for the two selected apartments (price/area/district/pros).
function renderCompare(){
  const aId = parseInt(document.getElementById('compareSelectA').value,10);
  const bId = parseInt(document.getElementById('compareSelectB').value,10);
  const a = APARTMENTS.find(x=>x.id===aId), b = APARTMENTS.find(x=>x.id===bId);
  if(!a || !b) return;
  const winPrice = a.price===b.price ? [false,false] : (a.price<b.price ? [true,false] : [false,true]);
  const winArea = a.area===b.area ? [false,false] : (a.area>b.area ? [true,false] : [false,true]);
  document.getElementById('compareBody').innerHTML = `
    <div class="compare-titles"><div>${a.title}</div><div style="text-align:right">${b.title}</div></div>
    <div class="compare-metric">
      <div class="cm-label">Цена в месяц</div>
      <div class="cm-values"><div class="cm-val ${winPrice[0]?'win':''}">${fmtPrice(a.price)}</div><div class="cm-val ${winPrice[1]?'win':''}" style="text-align:right">${fmtPrice(b.price)}</div></div>
    </div>
    <div class="compare-metric">
      <div class="cm-label">Площадь</div>
      <div class="cm-values"><div class="cm-val ${winArea[0]?'win':''}">${a.area} м²</div><div class="cm-val ${winArea[1]?'win':''}" style="text-align:right">${b.area} м²</div></div>
    </div>
    <div class="compare-metric">
      <div class="cm-label">Комнат</div>
      <div class="cm-values"><div class="cm-val">${roomsLabel(a.rooms)}</div><div class="cm-val" style="text-align:right">${roomsLabel(b.rooms)}</div></div>
    </div>
    <div class="compare-metric">
      <div class="cm-label">Район</div>
      <div class="cm-values"><div class="cm-val">${a.addr}</div><div class="cm-val" style="text-align:right">${b.addr}</div></div>
    </div>
    <div class="compare-pros">
      <div><div class="cp-head">Плюсы «${a.title.split(' ').slice(0,2).join(' ')}»</div>${a.tags.map(t=>`<div class="chip">${labelForTag(t)}</div>`).join('')}</div>
      <div><div class="cp-head">Плюсы «${b.title.split(' ').slice(0,2).join(' ')}»</div>${b.tags.map(t=>`<div class="chip">${labelForTag(t)}</div>`).join('')}</div>
    </div>`;
}

/* booking modal */
// Открывает модальное окно записи на просмотр.
// Opens the booking (viewing request) modal.
function openBooking(){
  const a = APARTMENTS.find(x=>x.id===currentDetailId);
  resetBookingForm();
  document.getElementById('modalSub').textContent = a ? `«${a.title}» — оставьте контакты, и менеджер согласует удобное время просмотра.` : 'Оставьте контакты — менеджер перезвонит и согласует удобное время.';
  document.getElementById('bookingOverlay').classList.add('show');
  pushModalBlur();
}
// Закрывает модальное окно записи на просмотр.
// Closes the booking modal.
function closeBooking(){
  document.getElementById('bookingOverlay').classList.remove('show');
  popModalBlur();
}
// Восстанавливает форму записи (после успешной отправки) и подключает слоты времени.
// Restores the booking form (after a successful submission) and wires up the time slots.
function resetBookingForm(){
  const inner = document.getElementById('modalInner');
  if(!document.getElementById('bookingForm')){
    inner.innerHTML = `
      <div class="modal-head">
        <h3>Запись на просмотр</h3>
        <button class="modal-close" onclick="closeBooking()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 5L19 19M19 5L5 19" stroke="#1C1A16" stroke-width="1.8" stroke-linecap="round"/></svg></button>
      </div>
      <p class="sub" id="modalSub">Оставьте контакты — менеджер перезвонит и согласует удобное время.</p>
      <form id="bookingForm" onsubmit="submitBooking(event)">
        <label>Имя</label><input type="text" id="bookingName" required placeholder="Как к вам обращаться">
        <label>Телефон</label><input type="tel" id="bookingPhone" required placeholder="+7 900 000-00-00">
        <label>Когда удобно посмотреть</label>
        <div class="slot-row" id="slotRow">
          <button type="button" class="slot on" data-slot="Сегодня вечером">Сегодня вечером</button>
          <button type="button" class="slot" data-slot="Завтра днём">Завтра днём</button>
          <button type="button" class="slot" data-slot="В выходные">В выходные</button>
          <button type="button" class="slot" data-slot="Другое время">Другое время</button>
        </div>
        <label>Комментарий (необязательно)</label><textarea id="bookingComment" placeholder="Что-то ещё, что стоит знать менеджеру"></textarea>
        <button type="submit" class="detail-cta">Отправить заявку</button>
      </form>`;
  }
  wireSlotRow();
}
// Делает кнопки-слоты времени взаимоисключающими (выбор одного варианта).
// Makes the time-slot buttons mutually exclusive (single choice).
function wireSlotRow(){
  const row = document.getElementById('slotRow');
  if(!row) return;
  row.querySelectorAll('.slot').forEach(btn => {
    btn.onclick = () => row.querySelectorAll('.slot').forEach(b => b.classList.toggle('on', b===btn));
  });
}
// Обрабатывает отправку формы записи и показывает подтверждение.
// Handles the booking form submission and shows a confirmation.
function submitBooking(e){
  e.preventDefault();
  const name = document.getElementById('bookingName').value.trim();
  const activeSlot = document.querySelector('#slotRow .slot.on');
  const slotText = activeSlot ? activeSlot.dataset.slot : null;
  const inner = document.getElementById('modalInner');
  inner.innerHTML = `
    <div class="modal-head"><span></span><button class="modal-close" onclick="closeBooking()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 5L19 19M19 5L5 19" stroke="#1C1A16" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>
    <div class="modal-success">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1E2D4E" stroke-width="1.5"/><path d="M7.5 12.5L10.5 15.5L16.5 8.5" stroke="#1E2D4E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <h3>Заявка отправлена</h3>
      <p class="sub">${name ? name+', мы' : 'Мы'} свяжемся с вами${slotText ? ' — вы выбрали: «'+slotText+'»' : ''} и подтвердим точное время.</p>
    </div>`;
  setTimeout(closeBooking, 2200);
}

renderFilters();
renderFaq();
renderCatalog();
