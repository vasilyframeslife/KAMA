/* =============================================================================
   KAMA-DATA.JS
   Сайт «Кама» — аренда квартир в Набережных Челнах.
   ТОЛЬКО данные: иконки фильтров, вопросы FAQ, каталог квартир (48 штук).
   Никакой логики интерфейса здесь нет — это сделано специально, чтобы данные
   и поведение сайта не были перемешаны в одном файле.

   The "Kama" apartment-rental site (Naberezhnye Chelny).
   DATA ONLY: filter icons, FAQ questions, the apartment catalog (48 units).
   No UI logic lives here on purpose — keeping data and behaviour apart makes
   both easier to change independently.

   Подключается из index.html ПЕРЕД kama-app.js (app.js использует эти
   переменные как глобальные):
   Linked from index.html BEFORE kama-app.js (app.js relies on these as
   globals):
     <script src="kama-data.js"></script>
     <script src="kama-app.js"></script>

   Экспортируемые переменные (глобальные, без модулей) / Exposed variables
   (global, no ES modules):
     ICONS        — SVG-иконки для плашек фильтров / SVG icons for filter pills
     FILTER_DEFS  — описания плашек-фильтров / filter-pill definitions
     FAQ          — вопросы и ответы / question/answer pairs
     APARTMENTS   — массив всех квартир (18 вручную + 30 сгенерировано)
                    array of all apartments (18 hand-written + 30 generated)
   ============================================================================= */

// Инлайн-SVG-иконки для плашек-фильтров (без внешних иконных библиотек).
// Inline SVG icons for the filter pills (no external icon library needed).
const ICONS = {
  pet: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="14" r="4.5" stroke="currentColor" stroke-width="1.5"/><circle cx="6" cy="7" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="7" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="4.5" r="1.6" stroke="currentColor" stroke-width="1.5"/><circle cx="15" cy="4.5" r="1.6" stroke="currentColor" stroke-width="1.5"/></svg>`,
  transport: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="12" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M7 20L8.5 17M17 20L15.5 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="12.5" r="1" fill="currentColor"/><circle cx="16" cy="12.5" r="1" fill="currentColor"/></svg>`,
  remote: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 21H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  park: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3L17 11H14L18 17H6L10 11H7L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 17V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  family: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="2.4" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 20C4.3 16.8 6.4 15 9 15C11.6 15 13.7 16.8 14.5 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M14.5 15.5C16.6 15.5 18.5 17 19.2 19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
};
// Список плашек-фильтров на главной странице: ключ (используется в тегах
// квартир), подпись для пользователя, иконка.
// The filter-pill definitions on the homepage: key (matched against each
// apartment's tags), user-facing label, icon.
const FILTER_DEFS = [
  {key:'pet', label:'Подойдёт с питомцем', icon:ICONS.pet},
  {key:'transport', label:'До остановки < 10 минут', icon:ICONS.transport},
  {key:'remote', label:'Хорошо для удалённой работы', icon:ICONS.remote},
  {key:'park', label:'Рядом парк', icon:ICONS.park},
  {key:'family', label:'Хороший район для семьи', icon:ICONS.family},
];

// Вопросы-ответы для раздела FAQ на главной странице.
// Question/answer pairs for the homepage FAQ accordion.
const FAQ = [
  {q:'Нужен ли залог?', a:'Да, в большинстве квартир — депозит в размере половины или полной месячной оплаты. Точная сумма указана в карточке квартиры, в разделе «Что важно знать».'},
  {q:'Можно ли заселиться с животным?', a:'У части квартир в описании отдельно указано, что заезд с питомцем разрешён. Отфильтровать такие варианты можно кнопкой «Подойдёт с питомцем» на главной.'},
  {q:'Как быстро отвечает менеджер после заявки?', a:'Обычно в течение рабочего дня — с 9:00 до 21:00. Если заявка оставлена ночью, перезвонят с утра.'},
  {q:'Можно ли посмотреть квартиру без риелтора?', a:'Просмотр организует менеджер сервиса — так удобнее согласовать время и для арендатора, и для собственника.'},
  {q:'Что если ничего не подошло по фильтрам?', a:'Попробуйте снять один фильтр или увеличить бюджет — кнопка «Сбросить фильтры и поиск» под фильтрами вернёт к полному списку.'}
];

/* 18 квартир, набранных вручную (ниже добавляются ещё 30 сгенерированных).
   Все адреса, районы и ориентиры — реальные места Набережных Челнов.
   Расстояния, планировки, цены и сами квартиры — вымышленный демонстрационный каталог.
   Фотографии — стоковые: реальных фотографий конкретных объектов не существует.

   18 hand-written apartments (30 more are generated further below).
   Every address, district and landmark is a real place in Naberezhnye Chelny.
   Distances, layouts, prices and the listings themselves are a fictional demo
   catalogue. Photos are stock images — no real photos of specific units exist. */
const APARTMENTS = [
  {
    id:1, rooms:2, area:54, floor:3, floors:9, availableFrom:'20 июля',
    title:'Двухкомнатная у Парка Победы', caption:'Утром солнце попадает прямо в гостиную.',
    addr:'Проспект Мира', price:38000, badge:'Проспект Мира',
    img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'],
    tags:['park','remote'],
    context:'6 минут до Парка Победы',
    reasons:{park:'6 минут пешком до Парка Победы', remote:'Рядом кофейня с рабочими местами и вайфаем'},
    about:'Гостиная объединена с кухней аркой — вместе получается 24 м² общего пространства. Высокие потолки (2,7 м) визуально увеличивают комнату, а окна на проспект Мира дают свет большую часть дня.',
    aboutDistrict:'Проспект Мира соединяет Новый город с центром и считается одной из спокойных зелёных улиц — вдоль него растут липы, а Парк Победы в шести минутах ходьбы подходит и для утренней пробежки, и для вечерней прогулки.',
    likes:['Окна выходят на проспект Мира, светло весь день', 'Кухня отделена аркой от гостиной', 'Балкон с видом на липовую аллею'],
    nearby:[['Парк Победы','6 мин пешком'],['Остановка «Проспект Мира»','3 мин пешком'],['Продуктовый магазин у дома','2 мин пешком']],
    ideal:'Тех, кто работает удалённо и любит гулять в парке в обеденный перерыв.',
    important:['Депозит — один месяц','Мебель и техника есть','Можно заселиться в течение недели']
  },
  {
    id:2, rooms:1, area:38, floor:1, floors:5, availableFrom:'сейчас',
    title:'Однокомнатная в Новом городе', caption:'Из окна видно детскую площадку во дворе.',
    addr:'Новый город, рядом ЗЯБ', price:26000, badge:'Новый город',
    img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    gallery:['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'],
    tags:['pet','family'],
    context:'7 минут до ТЦ «Торговый квартал»',
    reasons:{pet:'Во дворе есть выгул для собак, рядом зелёная зона ЗЯБ', family:'Двор закрытого типа, тихо и спокойно для детей'},
    about:'Свежий ремонт делали в этом году: тёплые полы в санузле, новая проводка, стеклопакеты. Комната одна, но за счёт продуманной расстановки в ней помещается полноценная зона сна и рабочий стол.',
    aboutDistrict:'Двор находится в стороне от проезжей части, рядом с ЗЯБ — районом с закрытыми дворами и невысокой застройкой. До ТЦ «Торговый квартал» с супермаркетом и аптекой — семь минут спокойным шагом.',
    likes:['Тихий двор без сквозного проезда', 'Свежий ремонт, тёплые полы в санузле'],
    nearby:[['ТЦ «Торговый квартал»','7 мин пешком'],['Двор с детской площадкой','во дворе'],['Остановка в районе ЗЯБ','5 мин пешком']],
    ideal:'Пары с собакой или семьи с ребёнком, которым важен тихий двор.',
    important:['Можно с животными','Первый этаж','Депозит — половина месяца']
  },
  {
    id:3, rooms:0, area:29, floor:7, floors:16, availableFrom:'25 июля',
    title:'Студия в Sunrise City', caption:'До Майдана — пять минут спокойным шагом.',
    addr:'Sunrise City', price:31000, badge:'Sunrise City',
    img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    gallery:['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'],
    tags:['remote','transport'],
    context:'5 минут до Майдана',
    reasons:{remote:'В доме есть коворкинг-зона для жильцов', transport:'Остановка у самого дома, автобусы в центр каждые 10 минут'},
    about:'Кухня-остров вынесена в центр студии, вокруг — продуманное скрытое хранение от пола до потолка. Панорамное окно во всю стену выходит на юг, поэтому вечером в комнате тепло от заходящего солнца.',
    aboutDistrict:'Sunrise City — один из новых жилых комплексов рядом с Майданом, главной пешеходной площадью города. Здесь всегда людно по выходным: рядом кафе, каток зимой и вечерние прогулки летом.',
    likes:['Кухня-остров, продумано хранение', 'Панорамное окно во всю стену'],
    nearby:[['Майдан','5 мин пешком'],['Остановка у ЖК','1 мин пешком'],['Ледовый дворец','12 мин пешком']],
    ideal:'Тех, кому важна компактность и близость к центру города.',
    important:['Студия, без разделения на комнаты','Кондиционер установлен','Заезд день в день']
  },
  {
    id:4, rooms:2, area:57, floor:2, floors:5, availableFrom:'сейчас',
    title:'Двухкомнатная у Прибрежного парка', caption:'Из кухни видно зелень Прибрежного парка.',
    addr:'Проспект Чулман', price:35000, badge:'Проспект Чулман',
    img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    gallery:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'],
    tags:['park','family'],
    context:'4 минуты до Прибрежного парка',
    reasons:{park:'Прибрежный парк в четырёх минутах, есть велодорожка', family:'Рядом детская поликлиника и школа микрорайона'},
    about:'Вторая комната изолирована от гостиной — можно устроить кабинет или детскую. Прихожая шире обычной, с местом под полноценную гардеробную систему хранения.',
    aboutDistrict:'Проспект Чулман идёт вдоль Прибрежного парка — одной из главных зелёных зон города с велодорожкой и видом на Каму. По выходным здесь катаются семьями на самокатах и велосипедах.',
    likes:['Вторая комната подойдёт под кабинет или детскую', 'Просторная прихожая с гардеробной'],
    nearby:[['Прибрежный парк','4 мин пешком'],['Остановка «Проспект Чулман»','3 мин пешком'],['Школа микрорайона','6 мин пешком']],
    ideal:'Семей с ребёнком, которым нужна вторая комната и парк рядом.',
    important:['Второй этаж с лифтом','Интернет уже подключён','Мебель частично']
  },
  {
    id:5, rooms:1, area:40, floor:4, floors:9, availableFrom:'1 августа',
    title:'Однокомнатная у Набережной Тукая', caption:'Вечером слышно, как по набережной идут люди — негромко и спокойно.',
    addr:'Район ГЭС', price:27000, badge:'ГЭС',
    img:'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80',
    gallery:['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
    tags:['transport','remote'],
    context:'8 минут до Набережной Тукая',
    reasons:{transport:'До остановки в районе ГЭС — три минуты', remote:'Тихий район, хорошо для видеозвонков без шума'},
    about:'Кухня выходит окном на реку — по утрам хорошо видно туман над водой в прохладную погоду. Балкон застеклён, туда же выходит и вторая часть кухонного гарнитура.',
    aboutDistrict:'Район ГЭС — один из самых тихих в городе, застроен в основном невысокими домами. До Набережной Тукая, где летом гуляют семьями и катаются на велосипедах вдоль Камы, — около восьми минут пешком.',
    likes:['Вид на реку из окна кухни', 'Балкон застеклён, можно хранить велосипед'],
    nearby:[['Набережная Тукая','8 мин пешком'],['Остановка в районе ГЭС','3 мин пешком'],['Аптека и магазин у дома','2 мин пешком']],
    ideal:'Тех, кто любит вечерние прогулки у воды и тишину после работы.',
    important:['Балкон застеклён','Депозит — один месяц','Можно курить на балконе']
  },
  {
    id:6, rooms:0, area:26, floor:2, floors:5, availableFrom:'сейчас',
    title:'Студия рядом с Ледовым дворцом', caption:'До Ледового дворца можно дойти пешком за десять минут.',
    addr:'Проспект Московский', price:24000, badge:'Проспект Московский',
    img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
    gallery:['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
    tags:['transport','pet'],
    context:'10 минут до Ледового дворца',
    reasons:{transport:'Остановка проспекта Московского в двух минутах', pet:'Рядом сквер для прогулок с собакой'},
    about:'Планировка компактная, но без потерянного пространства: спальная зона отделена невысоким стеллажом, у окна — место под письменный стол. Санузел совмещённый, недавно отремонтирован.',
    aboutDistrict:'Проспект Московский ведёт к Ледовому дворцу — там проходят и хоккейные матчи, и открытые катки зимой. Район спокойный, в основном пятиэтажная застройка, во дворах много зелени.',
    likes:['Компактная, но продуманная планировка', 'Тихо, окна во двор'],
    nearby:[['Ледовый дворец','10 мин пешком'],['Остановка «Проспект Московский»','2 мин пешком'],['Сквер во дворе','1 мин пешком']],
    ideal:'Тех, кто ведёт активный образ жизни и любит спорт рядом с домом.',
    important:['Депозит — половина месяца','Заезд возможен сразу','Можно с животными']
  },
  {
    id:7, rooms:2, area:58, floor:3, floors:9, availableFrom:'15 июля',
    title:'Двухкомнатная у Органного зала', caption:'По выходным из окна слышно, как во дворе играют дети.',
    addr:'Новый город', price:33000, badge:'Новый город',
    img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    gallery:['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'],
    tags:['family','park'],
    context:'9 минут до Органного зала',
    reasons:{family:'Во дворе детская площадка, рядом школа', park:'До ближайшего сквера — три минуты'},
    about:'Кухня 14 м² — достаточно для полноценного обеденного стола на шесть человек. Гостиная просторная, 19 м², с отдельным выходом на балкон.',
    aboutDistrict:'Новый город строился как отдельный жилой район с широкими дворами и школами внутри кварталов. До Органного зала, где проходят концерты классической музыки, — девять минут пешком по тихим улицам.',
    likes:['Просторная гостиная для семейных ужинов', 'Кухня 14 м² с местом для стола'],
    nearby:[['Органный зал','9 мин пешком'],['Сквер во дворе','3 мин пешком'],['Школа микрорайона','7 мин пешком']],
    ideal:'Семей, которым важны школа и площадка в шаговой доступности.',
    important:['Третий этаж с лифтом','Мебель включена полностью','Депозит — один месяц']
  },
  {
    id:8, rooms:1, area:37, floor:5, floors:9, availableFrom:'сейчас',
    title:'Однокомнатная рядом с «Омегой»', caption:'До «Омеги» — короткая прогулка вдоль проспекта.',
    addr:'ЗЯБ', price:25000, badge:'ЗЯБ',
    img:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    gallery:['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
    tags:['transport','remote'],
    context:'6 минут до «Омеги»',
    reasons:{transport:'Остановка в районе ЗЯБ рядом с домом', remote:'Кофейня с розетками и вайфаем через дорогу'},
    about:'Санузел и кухня обновлены в прошлом году, остальная часть квартиры — в аккуратном состоянии без ремонта «под сдачу». Подъезд тихий, соседи в основном постоянные жильцы.',
    aboutDistrict:'ЗЯБ — жилой район с плотной, но невысокой застройкой и развитой мелкой инфраструктурой во дворах. До «Омеги» — торгово-развлекательного центра с кинотеатром — шесть минут вдоль проспекта.',
    likes:['Свежий ремонт', 'Тихий подъезд, соседи знакомы друг с другом'],
    nearby:[['«Омега»','6 мин пешком'],['Остановка в районе ЗЯБ','4 мин пешком'],['Кофейня','5 мин пешком']],
    ideal:'Тех, кто ищет тихое, но живое место рядом с привычной инфраструктурой.',
    important:['Депозит — половина месяца','Интернет включён в стоимость','Заезд в течение трёх дней']
  },
  {
    id:9, rooms:3, area:71, floor:5, floors:9, availableFrom:'сейчас',
    title:'Трёхкомнатная у Прибрежного парка', caption:'Из окна гостиной виден весь двор — удобно приглядывать за детьми во время игр.',
    addr:'Проспект Чулман', price:45000, badge:'Проспект Чулман',
    img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'],
    tags:['family','park'],
    context:'5 минут до Прибрежного парка',
    reasons:{family:'Рядом сквер и школа, двор просматривается из окон', park:'5 минут до Прибрежного парка вдоль Камы'},
    about:'Три изолированные комнаты — можно выделить отдельный кабинет и детскую. Кухня 12 м², есть место для полноразмерного холодильника и обеденной зоны на пятерых.',
    aboutDistrict:'Проспект Чулман тянется вдоль Прибрежного парка — с этой стороны дома окна выходят на зелень, а не на дорогу.',
    likes:['Три изолированные комнаты', 'Просторная кухня 12 м²', 'Окна во двор, не на дорогу'],
    nearby:[['Прибрежный парк','5 мин пешком'],['Остановка «Проспект Чулман»','4 мин пешком'],['Школа микрорайона','8 мин пешком']],
    ideal:'Больших семей, которым нужно разделить пространство между детьми и родителями.',
    important:['Пятый этаж с лифтом','Депозит — один месяц','Мебель есть в двух комнатах из трёх']
  },
  {
    id:10, rooms:1, area:33, floor:2, floors:5, availableFrom:'сейчас',
    title:'Бюджетная однокомнатная у Ледового дворца', caption:'Простая, чистая квартира без лишнего — то, что нужно на первое время.',
    addr:'Проспект Московский', price:22000, badge:'Проспект Московский',
    img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
    tags:['transport','remote'],
    context:'11 минут до Ледового дворца',
    reasons:{transport:'Остановка в двух минутах, автобусы ходят часто', remote:'Тихий двор, подходит для звонков'},
    about:'Минимальный, но аккуратный ремонт: обои, ламинат, рабочая плита и холодильник. Из мебели — кровать и шкаф, остальное можно привезти своё.',
    aboutDistrict:'Проспект Московский — спокойная часть города, вдали от плотного трафика, но с прямым автобусным сообщением до центра.',
    likes:['Тихий двор без сквозного проезда', 'Чистый подъезд после ремонта'],
    nearby:[['Остановка «Проспект Московский»','2 мин пешком'],['Ледовый дворец','11 мин пешком'],['Продуктовый магазин','3 мин пешком']],
    ideal:'Тех, кто ищет простой бюджетный вариант без переплаты за лишнее.',
    important:['Депозит — половина месяца','Из мебели — кровать и шкаф','Заезд в течение трёх дней']
  },
  {
    id:11, rooms:0, area:24, floor:9, floors:16, availableFrom:'сейчас',
    title:'Студия с видом на Майдан', caption:'По вечерам из окна видно, как на Майдане включают подсветку фонтанов.',
    addr:'Sunrise City', price:29000, badge:'Sunrise City',
    img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'],
    tags:['remote','transport'],
    context:'4 минуты до Майдана',
    reasons:{remote:'Тихо на высоком этаже, вид не отвлекает от работы', transport:'Остановка у дома, до центра 10 минут'},
    about:'Студия на девятом этаже с окном во всю стену. Мебель современная, встроенная техника на кухне.',
    aboutDistrict:'Sunrise City стоит прямо у Майдана — центральной площади, где проходят городские праздники и вечерние прогулки.',
    likes:['Вид на Майдан с высоты', 'Встроенная техника на кухне'],
    nearby:[['Майдан','4 мин пешком'],['Остановка у ЖК','1 мин пешком'],['Кофейня в доме','1 мин пешком']],
    ideal:'Тех, кто хочет жить в самом центре событий города.',
    important:['Депозит — один месяц','Кондиционер установлен','Можно заселиться в день обращения']
  },
  {
    id:12, rooms:3, area:82, floor:6, floors:9, availableFrom:'1 августа', featured:true,
    title:'Просторная квартира с видом на Каму', caption:'Из окна гостиной открывается вид на реку — особенно хорош на закате.',
    addr:'Район ГЭС', price:62000, badge:'ГЭС',
    img:'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'],
    tags:['park','family'],
    context:'6 минут до Набережной Тукая',
    reasons:{park:'Рядом сквер и набережная для прогулок', family:'Большая площадь и тихий двор'},
    about:'Квартира с ремонтом «под ключ»: кухня-гостиная 32 м², панорамные окна на реку, две спальни с гардеробными. Дом стоит на возвышении, поэтому вид на Каму открывается почти из всех комнат.',
    aboutDistrict:'Район ГЭС — тихая часть города рядом с плотиной и рекой. До Набережной Тукая, одной из самых живописных прогулочных зон, — шесть минут пешком.',
    likes:['Панорамный вид на Каму', 'Кухня-гостиная 32 м²', 'Две гардеробные'],
    nearby:[['Набережная Тукая','6 мин пешком'],['Остановка в районе ГЭС','5 мин пешком'],['Сквер у дома','2 мин пешком']],
    ideal:'Тех, кто готов немного доплатить за вид на реку и простор.',
    important:['Депозит — один месяц','Ремонт и вся техника новые','Возможна долгосрочная аренда от года']
  },
  {
    id:13, rooms:2, area:49, floor:1, floors:5, availableFrom:'сейчас',
    title:'Двухкомнатная на первом этаже в Новом городе', caption:'Не нужно ждать лифт — и коляску, и велосипед удобно оставлять у входа.',
    addr:'Новый город', price:36000, badge:'Новый город',
    img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
    tags:['family','pet'],
    context:'5 минут до ТЦ «Торговый квартал»',
    reasons:{family:'Первый этаж удобен с коляской, рядом площадка', pet:'Свой выход близко к земле, удобно с животным'},
    about:'Первый этаж с отдельным крыльцом у подъезда — удобно с коляской или собакой. Комнаты смежно-изолированные, кухня 9 м².',
    aboutDistrict:'Новый город строился с широкими дворами и площадками во дворах — здесь много семей с детьми и собаками.',
    likes:['Отдельное крыльцо у подъезда', 'Широкий двор с площадкой'],
    nearby:[['ТЦ «Торговый квартал»','5 мин пешком'],['Двор с площадкой','во дворе'],['Остановка в Новом городе','4 мин пешком']],
    ideal:'Семей с колясками или животными, которым важен лёгкий выход на улицу.',
    important:['Можно с животными','Депозит — один месяц','Мебель есть']
  },
  {
    id:14, rooms:1, area:35, floor:3, floors:9, availableFrom:'20 июля',
    title:'Однокомнатная для удалённой работы', caption:'Рабочий стол уже стоит у окна — можно въехать и сразу начать работать.',
    addr:'Проспект Мира', price:32000, badge:'Проспект Мира',
    img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'],
    tags:['remote','park'],
    context:'8 минут до Парка Победы',
    reasons:{remote:'Отдельный рабочий стол у окна, быстрый интернет', park:'8 минут до Парка Победы для перерыва'},
    about:'В квартире уже есть рабочее место: стол, стул, настольная лампа. Интернет 300 Мбит подключён и включён в стоимость.',
    aboutDistrict:'Проспект Мира соединяет Новый город с центром, рядом Парк Победы для прогулок в перерывах между звонками.',
    likes:['Готовое рабочее место у окна', 'Интернет включён в стоимость'],
    nearby:[['Парк Победы','8 мин пешком'],['Остановка «Проспект Мира»','5 мин пешком'],['Кофейня','4 мин пешком']],
    ideal:'Фрилансеров и тех, кто работает из дома на постоянной основе.',
    important:['Интернет включён в стоимость','Депозит — один месяц','Заезд в течение недели']
  },
  {
    id:15, rooms:2, area:52, floor:4, floors:9, availableFrom:'сейчас',
    title:'Двухкомнатная рядом с «Омегой»', caption:'До кинотеатра в «Омеге» — пятнадцать минут неспешным шагом.',
    addr:'ЗЯБ', price:34000, badge:'ЗЯБ',
    img:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'],
    tags:['family','transport'],
    context:'7 минут до «Омеги»',
    reasons:{family:'Рядом школа и детская площадка во дворе', transport:'Остановка в районе ЗЯБ рядом'},
    about:'Комнаты смежно-изолированные, кухня 10 м². Ремонт простой, но аккуратный, техника рабочая.',
    aboutDistrict:'ЗЯБ — спокойный жилой район с развитой инфраструктурой во дворах, до «Омеги» с кинотеатром — около семи минут.',
    likes:['Смежно-изолированные комнаты', 'Аккуратный простой ремонт'],
    nearby:[['«Омега»','7 мин пешком'],['Остановка в районе ЗЯБ','3 мин пешком'],['Школа во дворе','5 мин пешком']],
    ideal:'Семей, которым важен баланс цены и расположения.',
    important:['Депозит — половина месяца','Мебель есть','Заезд возможен сразу']
  },
  {
    id:16, rooms:0, area:21, floor:4, floors:5, availableFrom:'сейчас',
    title:'Маленькая студия для одного', caption:'Компактно, но всё нужное на своих местах — стол, кровать, кухня в один ряд.',
    addr:'Проспект Московский', price:23000, badge:'Проспект Московский',
    img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
    tags:['transport','pet'],
    context:'9 минут до Ледового дворца',
    reasons:{transport:'Остановка в трёх минутах от дома', pet:'Небольшой сквер рядом для короткой прогулки'},
    about:'Кухня в один ряд вдоль стены, напротив — кровать и шкаф. Для одного человека места достаточно, лишнего — нет.',
    aboutDistrict:'Проспект Московский — тихий, в основном пятиэтажки, рядом небольшой сквер для прогулок с собакой.',
    likes:['Компактная, но функциональная планировка', 'Тихий двор'],
    nearby:[['Остановка «Проспект Московский»','3 мин пешком'],['Ледовый дворец','9 мин пешком'],['Сквер','2 мин пешком']],
    ideal:'Тех, кто живёт один и не нуждается в лишнем пространстве.',
    important:['Депозит — половина месяца','Можно с животными','Заезд сразу']
  },
  {
    id:17, rooms:2, area:47, floor:6, floors:9, availableFrom:'сейчас',
    title:'Двухкомнатная с рабочим кабинетом', caption:'Вторая комната стала кабинетом — с отдельной дверью, чтобы не мешал шум из гостиной.',
    addr:'Проспект Чулман', price:41000, badge:'Проспект Чулман',
    img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
    tags:['remote','park'],
    context:'6 минут до Прибрежного парка',
    reasons:{remote:'Изолированный кабинет с дверью, тихо для звонков', park:'6 минут до Прибрежного парка'},
    about:'Вторая комната изначально оборудована как кабинет — стол, полки, отдельная дверь. Гостиная и кухня объединены.',
    aboutDistrict:'Проспект Чулман проходит вдоль Прибрежного парка — можно выйти на прогулку между встречами.',
    likes:['Отдельный кабинет с дверью', 'Объединённая кухня-гостиная'],
    nearby:[['Прибрежный парк','6 мин пешком'],['Остановка «Проспект Чулман»','5 мин пешком'],['Кофейня','3 мин пешком']],
    ideal:'Тех, кому для удалённой работы нужна отдельная комната с дверью.',
    important:['Депозит — один месяц','Мебель и рабочий стол включены','Интернет подключён']
  },
  {
    id:18, rooms:1, area:39, floor:3, floors:9, availableFrom:'25 июля',
    title:'Однокомнатная для молодой пары', caption:'Маленький, но светлый балкон — удобно пить кофе вдвоём по утрам.',
    addr:'Новый город', price:30000, badge:'Новый город',
    img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery:['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'],
    tags:['park','family'],
    context:'6 минут до сквера',
    reasons:{park:'Небольшой сквер в шести минутах', family:'Тихий двор, соседи в основном семьи'},
    about:'Светлая комната с балконом на две персоны. Кухня объединена с прихожей зоной хранения.',
    aboutDistrict:'Новый город — спокойный район с широкими дворами, куда часто переезжают молодые пары на первое совместное жильё.',
    likes:['Светлый балкон на двоих', 'Продуманное хранение в прихожей'],
    nearby:[['Сквер','6 мин пешком'],['Остановка в Новом городе','5 мин пешком'],['Продуктовый магазин','3 мин пешком']],
    ideal:'Молодых пар, которые снимают первое совместное жильё.',
    important:['Депозит — половина месяца','Мебель есть','Заезд по договорённости']
  }
];

/* Ещё 30 квартир, сгенерированных на основе тех же реальных районов/ориентиров,
   чтобы каждый сценарий (семья, удалёнка, бюджет, питомцы, вид на реку...) и
   каждый ценовой уровень были хорошо представлены в каталоге.

   30 more listings generated from the same real districts/landmarks, so every
   scenario (family, remote work, budget, pet owners, river view...) and every
   price tier is well represented across the catalog. */
(function generateMoreApartments(){
  const pool = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
  ];
  const districts = [
    {addr:'Проспект Мира', badge:'Проспект Мира', landmark:'Парк Победы', landmarkGen:'Парка Победы', ltag:'park'},
    {addr:'Проспект Чулман', badge:'Проспект Чулман', landmark:'Прибрежный парк', landmarkGen:'Прибрежного парка', ltag:'park'},
    {addr:'Проспект Московский', badge:'Проспект Московский', landmark:'Ледовый дворец', landmarkGen:'Ледового дворца', ltag:'transport'},
    {addr:'Новый город', badge:'Новый город', landmark:'ТЦ «Торговый квартал»', landmarkGen:'ТЦ «Торговый квартал»', ltag:'family'},
    {addr:'Новый город', badge:'Новый город', landmark:'Органный зал', landmarkGen:'Органного зала', ltag:'family'},
    {addr:'Район ГЭС', badge:'ГЭС', landmark:'Набережная Тукая', landmarkGen:'Набережной Тукая', ltag:'park'},
    {addr:'ЗЯБ', badge:'ЗЯБ', landmark:'«Омега»', landmarkGen:'«Омеги»', ltag:'transport'},
    {addr:'Sunrise City', badge:'Sunrise City', landmark:'Майдан', landmarkGen:'Майдана', ltag:'remote'}
  ];
  const captions = [
    'Утром на кухне пахнет кофе — соседский балкон рядом, но совсем не мешает.',
    'Вечером слышно, как во дворе смеются дети — совсем не мешает работать.',
    'Из окна видно, как меняется небо над крышами соседних домов.',
    'Пол тёплый даже без тапочек — приятно ходить по утрам.',
    'Тихий подъезд, соседи здороваются в лифте.',
    'На подоконнике уже стоят чьи-то забытые цветы в горшке.',
    'Вечером свет фонарей мягко проходит сквозь занавески.',
    'Слышно, как вдалеке редко проезжают машины — совсем негромко.',
    'Кухня достаточно большая, чтобы не мешать друг другу вечером.',
    'Балкон подходит для сушки белья и утреннего кофе.',
    'В комнате пахнет свежим деревом — ремонт совсем новый.',
    'Из прихожей сразу виден свет из окна гостиной.',
    'Во дворе растёт старая берёза — летом тень доходит до окна.',
    'Соседний двор тише этого — но и здесь спокойно по вечерам.',
    'Кухонное окно смотрит во двор, а не на дорогу.'
  ];
  const secondaryTags = ['pet','remote','transport','park','family'];
  const roomsCycle = [0,1,1,2,2,3];
  const idealTexts = [
    'Тех, кто ценит тишину и простую, спокойную жизнь.',
    'Пары или одного человека, которому важна близость к остановке.',
    'Тех, кто работает из дома и ищет спокойный район.',
    'Семей с детьми, которым важны школа и площадка рядом.',
    'Тех, кто готов немного доплатить за расположение.',
    'Тех, кто ищет простой бюджетный вариант без переплаты.'
  ];
  const availableOptions = ['сейчас','сейчас','сейчас','через неделю','20 июля','1 августа'];
  let nextId = APARTMENTS.length ? Math.max(...APARTMENTS.map(a=>a.id))+1 : 1;
  for(let i=0;i<30;i++){
    const d = districts[i % districts.length];
    const rooms = roomsCycle[i % roomsCycle.length];
    const area = rooms===0 ? 22+((i*7)%12) : rooms===1 ? 32+((i*5)%14) : rooms===2 ? 46+((i*6)%16) : 64+((i*8)%20);
    const basePrice = rooms===0 ? 21000 : rooms===1 ? 25000 : rooms===2 ? 32000 : 42000;
    const rawPrice = basePrice + ((i*1300) % 15000) - 3000 + rooms*1000;
    const price = Math.max(19000, Math.round(rawPrice/500)*500);
    const img = pool[i % pool.length];
    const gallery = [pool[i%pool.length], pool[(i+3)%pool.length], pool[(i+5)%pool.length]];
    const secTag = secondaryTags[i % secondaryTags.length];
    const tags = Array.from(new Set([d.ltag, secTag]));
    const caption = captions[i % captions.length];
    const totalFloors = rooms>=3 ? 9 : (i%3===0 ? 5 : 9);
    const floor = 1 + (i % totalFloors);
    const roomsLbl = rooms===0 ? 'Студия' : (rooms+'-комнатная');
    const mins = 4 + (i % 10);
    const reasons = {};
    reasons[d.ltag] = `Рядом с ${d.landmarkGen}`;
    reasons[secTag] = labelForTag(secTag);
    APARTMENTS.push({
      id: nextId++, rooms, area, floor, floors: totalFloors, availableFrom: availableOptions[i % availableOptions.length],
      title: `${roomsLbl} у ${d.landmarkGen}`,
      caption,
      addr: d.addr, price, badge: d.badge,
      img, gallery,
      tags,
      context: `${mins} минут до ${d.landmarkGen}`,
      reasons,
      about: `Планировка ${rooms===0 ? 'студийная' : 'классическая'}, ${area} м². Ремонт в аккуратном состоянии, техника рабочая.`,
      aboutDistrict: `${d.addr} — район рядом с ${d.landmarkGen}, спокойный и с понятной инфраструктурой.`,
      likes: [caption, 'Аккуратный подъезд без посторонних запахов'],
      nearby: [[d.landmark, `${mins} мин пешком`], ['Остановка рядом', `${2+(i%6)} мин пешком`]],
      ideal: idealTexts[i % idealTexts.length],
      important: ['Депозит — ' + (i%2===0 ? 'один месяц' : 'половина месяца'), 'Мебель и техника есть', 'Заезд по договорённости']
    });
  }
})();
