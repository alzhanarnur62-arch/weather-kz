'use strict';

/* Погода Казахстана
   Данные: Open-Meteo (бесплатно, без ключа). Языки: қазақша, русский, English.
   Фон — «живое небо»: цвет и анимация (облака, дождь, снег, звёзды) зависят от погоды. */

// ---------- Города: 17 областных центров + Астана, Алматы, Шымкент (с запада на восток) ----------
// Маленькие города (Аксай, Каскелен…) сюда не добавляем — их находит поиск.

const CITIES = [
  { id: 'aktau',       lat: 43.6481, lon: 51.1722, kk: 'Ақтау',       ru: 'Актау',            en: 'Aktau' },
  { id: 'oral',        lat: 51.2278, lon: 51.3865, kk: 'Орал',        ru: 'Уральск',          en: 'Oral' },
  { id: 'atyrau',      lat: 47.1167, lon: 51.8833, kk: 'Атырау',      ru: 'Атырау',           en: 'Atyrau' },
  { id: 'aktobe',      lat: 50.2839, lon: 57.1670, kk: 'Ақтөбе',      ru: 'Актобе',           en: 'Aktobe' },
  { id: 'kostanay',    lat: 53.2144, lon: 63.6246, kk: 'Қостанай',    ru: 'Костанай',         en: 'Kostanay' },
  { id: 'kyzylorda',   lat: 44.8488, lon: 65.4823, kk: 'Қызылорда',   ru: 'Кызылорда',        en: 'Kyzylorda' },
  { id: 'zhezkazgan',  lat: 47.7833, lon: 67.7000, kk: 'Жезқазған',   ru: 'Жезказган',        en: 'Zhezkazgan' },
  { id: 'turkistan',   lat: 43.2973, lon: 68.2518, kk: 'Түркістан',   ru: 'Туркестан',        en: 'Turkistan' },
  { id: 'petropavl',   lat: 54.8753, lon: 69.1628, kk: 'Петропавл',   ru: 'Петропавловск',    en: 'Petropavl' },
  { id: 'kokshetau',   lat: 53.2833, lon: 69.3833, kk: 'Көкшетау',    ru: 'Кокшетау',         en: 'Kokshetau' },
  { id: 'shymkent',    lat: 42.3417, lon: 69.5901, kk: 'Шымкент',     ru: 'Шымкент',          en: 'Shymkent', label: 'below' },
  { id: 'taraz',       lat: 42.9000, lon: 71.3667, kk: 'Тараз',       ru: 'Тараз',            en: 'Taraz' },
  { id: 'astana',      lat: 51.1694, lon: 71.4491, kk: 'Астана',      ru: 'Астана',           en: 'Astana' },
  { id: 'karaganda',   lat: 49.8047, lon: 73.1094, kk: 'Қарағанды',   ru: 'Караганда',        en: 'Karaganda' },
  { id: 'almaty',      lat: 43.2389, lon: 76.8897, kk: 'Алматы',      ru: 'Алматы',           en: 'Almaty', label: 'below' },
  { id: 'pavlodar',    lat: 52.2873, lon: 76.9674, kk: 'Павлодар',    ru: 'Павлодар',         en: 'Pavlodar' },
  { id: 'konaev',      lat: 43.8667, lon: 77.0667, kk: 'Қонаев',      ru: 'Конаев',           en: 'Konaev', label: 'left' },
  { id: 'taldykorgan', lat: 45.0156, lon: 78.3739, kk: 'Талдықорған', ru: 'Талдыкорган',      en: 'Taldykorgan' },
  { id: 'semey',       lat: 50.4111, lon: 80.2275, kk: 'Семей',       ru: 'Семей',            en: 'Semey' },
  { id: 'oskemen',     lat: 49.9483, lon: 82.6275, kk: 'Өскемен',     ru: 'Усть-Каменогорск', en: 'Oskemen', label: 'right' },
];

// Другие и старые названия — чтобы поиск находил город, как его ни напиши
const ALIASES = {
  oral: ['Uralsk', 'Орал'],
  oskemen: ['Ust-Kamenogorsk', 'Oskemen'],
  astana: ['Нур-Султан', 'Nur-Sultan', 'Акмола', 'Целиноград'],
  petropavl: ['Petropavlovsk'],
  kostanay: ['Кустанай', 'Kustanay'],
  aktobe: ['Актюбинск', 'Aktyubinsk'],
  semey: ['Семипалатинск', 'Semipalatinsk'],
  taldykorgan: ['Талдыкурган'],
  karaganda: ['Karagandy', 'Караганды'],
  atyrau: ['Гурьев'],
  aktau: ['Шевченко'],
  shymkent: ['Чимкент'],
  taraz: ['Джамбул', 'Жамбыл'],
  kokshetau: ['Кокчетав'],
  kyzylorda: ['Кзыл-Орда'],
  konaev: ['Капчагай', 'Kapchagay', 'Qonaev', 'Кунаев'],
  zhezkazgan: ['Jezkazgan', 'Джезказган'],
};

// Упрощённый контур Казахстана [долгота, широта] — для карты «Казахстан сейчас»
const KZ_OUTLINE = [
  [46.6, 48.5], [46.9, 49.4], [47.5, 50.1], [48.6, 50.6], [48.7, 51.2], [50.4, 51.7], [52.6, 51.6],
  [53.9, 51.2], [55.0, 50.7], [56.3, 51.0], [57.5, 51.1], [58.6, 50.9], [59.6, 50.6], [60.4, 50.9],
  [61.5, 51.3], [61.0, 52.3], [61.2, 53.4], [62.3, 54.0], [65.2, 54.6], [66.8, 55.0], [68.4, 55.2],
  [69.2, 55.4], [70.8, 55.2], [71.2, 54.3], [74.0, 53.6], [76.2, 54.3], [77.9, 53.3], [80.1, 51.4],
  [81.7, 50.9], [83.4, 51.0], [84.5, 50.2], [86.2, 49.6], [87.3, 49.1], [86.6, 48.5], [85.6, 47.1],
  [83.0, 47.2], [82.6, 45.3], [80.3, 45.0], [80.5, 44.0], [80.3, 42.4], [79.2, 42.8], [76.9, 42.95],
  [75.2, 42.9], [73.5, 42.6], [71.9, 42.75], [70.9, 42.25], [70.0, 41.4], [68.5, 40.7], [68.0, 41.1],
  [66.0, 42.4], [64.9, 43.7], [61.0, 44.3], [58.6, 45.5], [56.0, 45.0], [56.0, 41.3], [54.2, 41.9],
  [52.9, 42.1], [52.4, 42.8], [51.6, 43.2], [51.2, 43.65], [50.8, 44.3], [50.3, 44.6], [51.3, 45.0],
  [51.6, 45.9], [53.1, 46.6], [51.9, 47.0], [50.0, 46.7], [49.2, 46.4], [48.6, 46.9], [47.2, 47.8],
];

// ---------- Тексты интерфейса ----------

const T = {
  kk: {
    title: 'Қазақстан ауа райы', brand: 'Қазақстан ауа райы', langLabel: 'Тіл',
    chooseCity: 'Қала', searchLabel: 'Қаланы іздеу', searchPh: 'Басқа қала', find: 'Табу', locate: 'Мен қайдамын',
    myPlace: 'Менің орным', loading: 'Ауа райы жүктелуде…', feels: 'Сезілуі', wind: 'Жел', humidity: 'Ылғалдылық',
    sun: 'Күн', ms: 'м/с', hours: 'Сағат бойынша', days: '7 күндік болжам', country: 'Қазақстан қазір',
    countryHint: 'Қаланың ауа райын ашу үшін нүктені басыңыз.', now: 'Қазір', today: 'Бүгін', tomorrow: 'Ертең',
    warmest: 'Ең жылы', coldest: 'Ең суық', wholeMap: 'Бүкіл карта',
    navLabel: 'Навигация', navNow: 'Қазір', navWeek: 'Апта', navMap: 'Карта', sheetTitle: 'Қаланы таңдау', close: 'Жабу',
    error: 'Ауа райы жүктелмеді. Интернетті тексеріп, қайталап көріңіз.', retry: 'Қайталау',
    noResults: 'Қазақстаннан мұндай қала табылмады. Атауын тексеріңіз.',
    geoDenied: 'Орныңызға рұқсат жоқ. Браузерде рұқсат беріңіз немесе тізімнен қаланы таңдаңыз.',
    geoInsecure: 'Орынды тек қорғалған сайт (https) анықтай алады. Қаланы тізімнен таңдаңыз немесе іздеуден табыңыз.',
    geoFail: 'Орныңызды анықтау мүмкін болмады. Қайталап көріңіз немесе қаланы тізімнен таңдаңыз.',
    locating: 'Орныңызды анықтап жатырмын…',
    searching: 'Іздеп жатырмын…', footerData: 'Ауа райы деректері', footerOsm: 'Қала шекаралары', footerBy: 'Арнур Алжан Claude-пен бірге жасады',
    wdShort: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
    wdLong: ['жексенбі', 'дүйсенбі', 'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма', 'сенбі'],
    months: ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'],
    date: (d, m, wd) => `${d} ${m}, ${wd}`,
  },
  ru: {
    title: 'Погода Казахстана', brand: 'Погода Казахстана', langLabel: 'Язык',
    chooseCity: 'Город', searchLabel: 'Найти город', searchPh: 'Другой город', find: 'Найти', locate: 'Где я',
    myPlace: 'Моё местоположение', loading: 'Загружаю погоду…', feels: 'Ощущается', wind: 'Ветер', humidity: 'Влажность',
    sun: 'Солнце', ms: 'м/с', hours: 'По часам', days: 'На 7 дней', country: 'Казахстан сейчас',
    countryHint: 'Нажмите на точку, чтобы открыть погоду города.', now: 'Сейчас', today: 'Сегодня', tomorrow: 'Завтра',
    warmest: 'Теплее всего', coldest: 'Холоднее всего', wholeMap: 'Вся карта',
    navLabel: 'Навигация', navNow: 'Сейчас', navWeek: 'Неделя', navMap: 'Карта', sheetTitle: 'Выбор города', close: 'Закрыть',
    error: 'Не удалось загрузить погоду. Проверьте интернет и попробуйте снова.', retry: 'Попробовать снова',
    noResults: 'Такой город в Казахстане не найден. Проверьте название.',
    geoDenied: 'Нет доступа к местоположению. Разрешите его в браузере или выберите город из списка.',
    geoInsecure: 'Местоположение может определить только защищённый сайт (https). Выберите город из списка или найдите его поиском.',
    geoFail: 'Не удалось определить местоположение. Попробуйте ещё раз или выберите город из списка.',
    locating: 'Определяю, где вы…',
    searching: 'Ищу…', footerData: 'Данные о погоде', footerOsm: 'Границы городов', footerBy: 'Сделал Арнур Алжан вместе с Claude',
    wdShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    wdLong: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
    months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    date: (d, m, wd) => `${d} ${m}, ${wd}`,
  },
  en: {
    title: 'Kazakhstan Weather', brand: 'Kazakhstan Weather', langLabel: 'Language',
    chooseCity: 'City', searchLabel: 'Find a city', searchPh: 'Another city', find: 'Find', locate: 'Near me',
    myPlace: 'My location', loading: 'Loading the weather…', feels: 'Feels like', wind: 'Wind', humidity: 'Humidity',
    sun: 'Sun', ms: 'm/s', hours: 'Hourly', days: '7-day forecast', country: 'Kazakhstan right now',
    countryHint: 'Tap a dot to open that city’s weather.', now: 'Now', today: 'Today', tomorrow: 'Tomorrow',
    warmest: 'Warmest', coldest: 'Coldest', wholeMap: 'Whole map',
    navLabel: 'Navigation', navNow: 'Now', navWeek: 'Week', navMap: 'Map', sheetTitle: 'Choose a city', close: 'Close',
    error: 'Couldn’t load the weather. Check your connection and try again.', retry: 'Try again',
    noResults: 'No city with that name in Kazakhstan. Check the spelling.',
    geoDenied: 'No access to your location. Allow it in the browser or pick a city from the list.',
    geoInsecure: 'Only a secure site (https) can find your location. Pick a city from the list or search for it.',
    geoFail: 'Couldn’t find your location. Try again or pick a city from the list.',
    locating: 'Finding your location…',
    searching: 'Searching…', footerData: 'Weather data', footerOsm: 'City boundaries', footerBy: 'Made by Arnur Alzhan with Claude',
    wdShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    wdLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    date: (d, m, wd) => `${wd}, ${m} ${d}`,
  },
};

// ---------- Коды погоды WMO ----------

const WMO = {
  0:  ['clear',   'Ашық', 'Ясно', 'Clear sky'],
  1:  ['clear',   'Негізінен ашық', 'Почти ясно', 'Mainly clear'],
  2:  ['partly',  'Аздап бұлтты', 'Переменная облачность', 'Partly cloudy'],
  3:  ['cloud',   'Бұлтты', 'Пасмурно', 'Overcast'],
  45: ['fog',     'Тұман', 'Туман', 'Fog'],
  48: ['fog',     'Қырау тұман', 'Туман с изморозью', 'Freezing fog'],
  51: ['drizzle', 'Әлсіз сіркіреме', 'Слабая морось', 'Light drizzle'],
  53: ['drizzle', 'Сіркіреме', 'Морось', 'Drizzle'],
  55: ['drizzle', 'Күшті сіркіреме', 'Сильная морось', 'Dense drizzle'],
  56: ['drizzle', 'Мұзды сіркіреме', 'Ледяная морось', 'Freezing drizzle'],
  57: ['drizzle', 'Күшті мұзды сіркіреме', 'Сильная ледяная морось', 'Heavy freezing drizzle'],
  61: ['rain',    'Әлсіз жаңбыр', 'Небольшой дождь', 'Light rain'],
  63: ['rain',    'Жаңбыр', 'Дождь', 'Rain'],
  65: ['rain',    'Нөсер жаңбыр', 'Сильный дождь', 'Heavy rain'],
  66: ['rain',    'Мұзды жаңбыр', 'Ледяной дождь', 'Freezing rain'],
  67: ['rain',    'Күшті мұзды жаңбыр', 'Сильный ледяной дождь', 'Heavy freezing rain'],
  71: ['snow',    'Әлсіз қар', 'Небольшой снег', 'Light snow'],
  73: ['snow',    'Қар', 'Снег', 'Snow'],
  75: ['snow',    'Қалың қар', 'Сильный снег', 'Heavy snow'],
  77: ['snow',    'Қар түйіршіктері', 'Снежная крупа', 'Snow grains'],
  80: ['rain',    'Әлсіз нөсер', 'Небольшой ливень', 'Light showers'],
  81: ['rain',    'Нөсер', 'Ливень', 'Showers'],
  82: ['rain',    'Қатты нөсер', 'Сильный ливень', 'Violent showers'],
  85: ['snow',    'Әлсіз қар жауады', 'Небольшой снегопад', 'Light snow showers'],
  86: ['snow',    'Қатты қар жауады', 'Сильный снегопад', 'Heavy snow showers'],
  95: ['thunder', 'Найзағай', 'Гроза', 'Thunderstorm'],
  96: ['thunder', 'Бұршақты найзағай', 'Гроза с градом', 'Thunderstorm with hail'],
  99: ['thunder', 'Қатты бұршақты найзағай', 'Сильная гроза с градом', 'Severe thunderstorm with hail'],
};

const LANG_INDEX = { kk: 1, ru: 2, en: 3 };
const HEAVY = new Set([65, 67, 75, 82, 86, 99]);

function weatherInfo(code, lang) {
  const row = WMO[code] || WMO[3];
  return { kind: row[0], text: row[LANG_INDEX[lang]] };
}

// ---------- Иконки (свои SVG, без библиотек) ----------

const CLOUD    = 'M9.5 25h13a5.5 5.5 0 0 0 .6-10.97A7.5 7.5 0 0 0 8.7 16.1 4.5 4.5 0 0 0 9.5 25Z';
const CLOUD_UP = 'M9.5 20h13a5.5 5.5 0 0 0 .6-10.97A7.5 7.5 0 0 0 8.7 11.1 4.5 4.5 0 0 0 9.5 20Z';
const RAYS = (cx, cy, r1, r2) => Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  const p = (r) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  return `M${p(r1)}L${p(r2)}`;
}).join('');

function icon(kind, isDay = true) {
  let body;
  switch (kind) {
    case 'clear':
      body = isDay
        ? `<g class="sun"><circle cx="16" cy="16" r="6"/><path d="${RAYS(16, 16, 9.5, 13)}"/></g>`
        : `<path d="M20.5 22.5A9 9 0 0 1 12 8.2a9 9 0 1 0 12.3 11.4 9 9 0 0 1-3.8 2.9Z"/>`;
      break;
    case 'partly':
      body = (isDay
        ? `<g class="sun"><circle cx="11" cy="11" r="4.2"/><path d="${RAYS(11, 11, 6.5, 8.6)}"/></g>`
        : `<path d="M14 13.5A5.5 5.5 0 0 1 9.4 5a6 6 0 1 0 7.4 7.3 5.5 5.5 0 0 1-2.8 1.2Z"/>`)
        + `<path class="cloud-fill" d="${CLOUD}"/>`;
      break;
    case 'cloud':   body = `<path class="cloud-fill" d="${CLOUD}"/>`; break;
    case 'fog':     body = `<path d="${CLOUD_UP}"/><path d="M6 24h20M9 28h14"/>`; break;
    case 'drizzle': body = `<path d="${CLOUD_UP}"/><path d="M12 24v1.5M17 25v1.5M22 24v1.5M14.5 28.5v1"/>`; break;
    case 'rain':    body = `<path d="${CLOUD_UP}"/><path d="M12 23.5l-1.5 4M17 23.5l-1.5 4M22 23.5l-1.5 4"/>`; break;
    case 'snow':    body = `<path d="${CLOUD_UP}"/><path d="M11 24.5h.01M16 27.5h.01M21 24.5h.01M13.5 29.5h.01M18.5 29.5h.01" stroke-width="2.6"/>`; break;
    case 'thunder': body = `<path d="${CLOUD_UP}"/><path d="M17 21l-3 5h4l-3 5" class="sun"/>`; break;
    default:        body = `<path d="${CLOUD}"/>`;
  }
  return `<svg class="wx" viewBox="0 0 32 32" aria-hidden="true">${body}</svg>`;
}

// ---------- Цвет по температуре ----------

const STOPS = [
  [-30, [96, 99, 230]],
  [-12, [86, 160, 245]],
  [0,   [150, 220, 240]],
  [8,   [214, 236, 214]],
  [14,  [255, 214, 112]],
  [25,  [255, 160, 64]],
  [38,  [240, 80, 56]],
];

function tempColor(t) {
  if (t <= STOPS[0][0]) return rgb(STOPS[0][1]);
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    if (t <= t1) {
      const [t0, c0] = STOPS[i - 1];
      const k = (t - t0) / (t1 - t0);
      return rgb(c0.map((v, j) => Math.round(v + (c1[j] - v) * k)));
    }
  }
  return rgb(STOPS[STOPS.length - 1][1]);
}

function rgb([r, g, b]) { return `rgb(${r} ${g} ${b})`; }

function fmtTemp(t) {
  const r = Math.round(t);
  if (r === 0) return '0°';
  return `${r < 0 ? '−' : ''}${Math.abs(r)}°`;
}

// ---------- Состояние ----------

const STORE_KEY = 'weather-kz';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function loadState() {
  const nav = (navigator.language || 'ru').toLowerCase();
  const base = {
    lang: nav.startsWith('kk') ? 'kk' : nav.startsWith('en') ? 'en' : 'ru',
    place: placeFromCity('almaty'),
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    if (saved.lang && T[saved.lang]) base.lang = saved.lang;
    // Город из старой версии списка (например, Аксай) превращаем в обычное место по координатам
    if (saved.place && typeof saved.place.lat === 'number') {
      base.place = saved.place;
      if (saved.place.id && !CITIES.some((c) => c.id === saved.place.id)) {
        base.place = { name: saved.place.id === 'aksay' ? 'Аксай' : '', lat: saved.place.lat, lon: saved.place.lon };
      }
    }
  } catch (e) { /* хранилище недоступно — работаем без него */ }
  return base;
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* не страшно */ }
}

function placeFromCity(id) {
  const c = CITIES.find((x) => x.id === id);
  return { id: c.id, lat: c.lat, lon: c.lon };
}

const state = loadState();
let lastForecast = null;
let lastCountry = null;
let requestId = 0;

// ---------- DOM ----------

const $ = (id) => document.getElementById(id);
const el = {
  city: $('city'), q: $('q'), results: $('results'), notice: $('notice'),
  name: $('city-name'), date: $('now-date'), temp: $('now-temp'), icon: $('now-icon'), desc: $('now-desc'), range: $('now-range'),
  feels: $('f-feels'), wind: $('f-wind'), hum: $('f-hum'), sun: $('f-sun'),
  hours: $('hours'), days: $('days'), map: $('map'), mapBack: $('map-back'), extremes: $('extremes'), error: $('error'),
  sheet: $('sheet'), chips: $('sheet-cities'), dockName: $('dock-city-name'),
};

// Два места поиска: верхняя строка (компьютер) и шторка (телефон)
const UI = {
  top:   { form: $('top-search'),   input: $('q'),       results: $('results'),       notice: $('notice'),       id: 0, timer: 0 },
  sheet: { form: $('sheet-search'), input: $('sheet-q'), results: $('sheet-results'), notice: $('sheet-notice'), chips: $('sheet-cities'), id: 0, timer: 0 },
};

const t = (key) => T[state.lang][key];

function placeName() {
  if (state.place.id) return CITIES.find((c) => c.id === state.place.id)[state.lang];
  return state.place.name || t('myPlace');
}

// ================= ЖИВОЕ НЕБО =================

// Цвета неба сверху вниз: [день, ночь]
const SKY = {
  clear:   [['#1660B4', '#3C8DD8', '#93CBEF'], ['#060A1C', '#101A3C', '#22305C']],
  partly:  [['#2564A8', '#5590C6', '#A5C6E0'], ['#0A1024', '#17213F', '#2A3756']],
  cloud:   [['#46596D', '#6B8297', '#A2B2C0'], ['#0D131D', '#1A2331', '#2C3746']],
  fog:     [['#5D6C79', '#85939E', '#B5BEC5'], ['#11161D', '#20272F', '#343C45']],
  drizzle: [['#34465A', '#52667C', '#7F91A3'], ['#0B111A', '#18212D', '#2A3542']],
  rain:    [['#26364A', '#40546B', '#6C7F93'], ['#090F18', '#151E2A', '#26313F']],
  snow:    [['#4F6889', '#7F98B4', '#C2D1E0'], ['#121A2B', '#243149', '#3B4A64']],
  thunder: [['#1A2130', '#2F394C', '#535D72'], ['#07090F', '#121722', '#232B3A']],
};
const LIGHT_SKIES = new Set(['clear-day', 'partly-day', 'cloud-day', 'fog-day', 'snow-day']);

const sky = {
  canvas: $('sky'), ctx: null, w: 0, h: 0, dpr: 1,
  kind: 'clear', day: false, heavy: false, // до загрузки — спокойное ночное небо
  stars: [], clouds: [], drops: [], flakes: [], sprite: null,
  raf: 0, last: 0, time: 0,
};
sky.ctx = sky.canvas.getContext('2d');

function setSky(kind, isDay, heavy) {
  sky.kind = kind; sky.day = isDay; sky.heavy = heavy;
  const [c1, c2, c3] = SKY[kind][isDay ? 0 : 1];
  const root = document.documentElement.style;
  root.setProperty('--sky1', c1);
  root.setProperty('--sky2', c2);
  root.setProperty('--sky3', c3);
  root.setProperty('--glass-alpha', LIGHT_SKIES.has(`${kind}-${isDay ? 'day' : 'night'}`) ? '.42' : '.3');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', c1);
  // Солнечное свечение рисует CSS один раз, а не canvas на каждом кадре
  sky.canvas.classList.toggle('sunny', isDay && (kind === 'clear' || kind === 'partly'));
  buildScene();
}

// Телефон/планшет: бережём батарею и плавность
const COARSE = matchMedia('(pointer: coarse)').matches;

function resizeSky() {
  const w = window.innerWidth;
  // На iPhone Safari прячет свою панель при прокрутке и шлёт resize — из-за этого небо
  // перестраивалось прямо во время прокрутки. Берём высоту с запасом и игнорируем мелкие изменения.
  const h = Math.max(window.innerHeight, COARSE ? (screen.height || 0) : 0);
  if (sky.w && w === sky.w && Math.abs(h - sky.h) < 160) return;
  sky.dpr = COARSE ? 1 : Math.min(window.devicePixelRatio || 1, 2); // небо мягкое — на телефоне хватает 1x
  sky.w = w;
  sky.h = h;
  sky.canvas.width = Math.round(w * sky.dpr);
  sky.canvas.height = Math.round(h * sky.dpr);
  sky.canvas.style.height = `${h}px`;
  sky.ctx.setTransform(sky.dpr, 0, 0, sky.dpr, 0, 0);
  buildScene();
}

const rand = (a, b) => a + Math.random() * (b - a);

function makeCloudSprite(color) {
  // Мягкое облако рисуем один раз, потом только копируем — так дёшево
  const c = document.createElement('canvas');
  c.width = 520; c.height = 260;
  const g = c.getContext('2d');
  const puffs = [[150, 160, 110], [260, 120, 130], [370, 160, 105], [230, 175, 120], [320, 185, 100]];
  for (const [x, y, r] of puffs) {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color(0.55));
    grad.addColorStop(0.6, color(0.22));
    grad.addColorStop(1, color(0));
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  return c;
}

function buildScene() {
  const { w, h, kind, day, heavy } = sky;
  const density = Math.max(0.35, (w * h) / (1440 * 900));
  sky.stars = []; sky.clouds = []; sky.drops = []; sky.flakes = [];

  if (!day && (kind === 'clear' || kind === 'partly')) {
    const n = Math.round(150 * density);
    for (let i = 0; i < n; i++) {
      sky.stars.push({ x: rand(0, w), y: rand(0, h * 0.75), r: rand(0.4, 1.5), ph: rand(0, 6.28), sp: rand(0.4, 1.2) });
    }
  }

  const cloudCount = { clear: 0, partly: 3, cloud: 7, fog: 8, drizzle: 6, rain: 7, snow: 5, thunder: 7 }[kind];
  const dark = kind === 'rain' || kind === 'thunder' || kind === 'drizzle';
  const tone = day ? (dark ? '210 220 232' : '255 255 255') : (dark ? '120 132 150' : '170 184 205');
  sky.sprite = makeCloudSprite((a) => `rgb(${tone} / ${a})`);
  for (let i = 0; i < cloudCount; i++) {
    const s = rand(0.7, 1.6) * (kind === 'fog' ? 1.6 : 1) * Math.max(0.6, w / 1440);
    sky.clouds.push({
      x: rand(-300, w), y: kind === 'fog' ? rand(h * 0.2, h * 0.9) : rand(-60, h * 0.45),
      s, sp: rand(6, 16), a: kind === 'partly' ? rand(0.5, 0.8) : rand(0.35, 0.7),
    });
  }

  if (kind === 'rain' || kind === 'thunder' || kind === 'drizzle') {
    const drizzle = kind === 'drizzle';
    const n = Math.round((drizzle ? 70 : heavy ? 230 : 140) * density);
    for (let i = 0; i < n; i++) {
      sky.drops.push({
        x: rand(0, w), y: rand(-h, h),
        len: drizzle ? rand(6, 11) : rand(14, 26),
        sp: drizzle ? rand(320, 420) : rand(650, 950),
        a: rand(0.18, 0.45),
      });
    }
  }

  if (kind === 'snow') {
    const n = Math.round((heavy ? 170 : 110) * density);
    for (let i = 0; i < n; i++) {
      sky.flakes.push({ x: rand(0, w), y: rand(0, h), r: rand(1, 3.2), sp: rand(28, 70), amp: rand(10, 30), ph: rand(0, 6.28), a: rand(0.5, 0.95) });
    }
  }
}

function drawSky(dt) {
  const { ctx, w, h } = sky;
  sky.time += dt;
  ctx.clearRect(0, 0, w, h);

  for (const s of sky.stars) {
    const tw = 0.55 + 0.45 * Math.sin(sky.time * s.sp + s.ph); // мягкое мерцание, без вспышек
    ctx.fillStyle = `rgb(255 255 255 / ${(0.35 + 0.55 * tw).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }

  for (const c of sky.clouds) {
    c.x += c.sp * dt;
    const cw = 520 * c.s;
    if (c.x > w + 40) c.x = -cw - rand(0, 200);
    ctx.globalAlpha = c.a;
    ctx.drawImage(sky.sprite, c.x, c.y, cw, 260 * c.s);
  }
  ctx.globalAlpha = 1;

  if (sky.drops.length) {
    ctx.strokeStyle = 'rgb(210 228 255)';
    ctx.lineWidth = sky.kind === 'drizzle' ? 1 : 1.3;
    ctx.lineCap = 'round';
    for (const d of sky.drops) {
      d.y += d.sp * dt;
      d.x += d.sp * 0.12 * dt;
      if (d.y > h + 30) { d.y = rand(-80, -10); d.x = rand(-50, w); }
      ctx.globalAlpha = d.a;
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.len * 0.12, d.y - d.len); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  if (sky.flakes.length) {
    ctx.fillStyle = '#fff';
    for (const f of sky.flakes) {
      f.y += f.sp * dt;
      if (f.y > h + 10) { f.y = -10; f.x = rand(0, w); }
      const x = f.x + Math.sin(sky.time * 0.8 + f.ph) * f.amp;
      ctx.globalAlpha = f.a;
      ctx.beginPath(); ctx.arc(x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function loop(now) {
  sky.raf = requestAnimationFrame(loop);
  // На телефоне небу хватает 30 кадров в секунду — остальное время отдаём прокрутке и карте
  if (COARSE && sky.last && now - sky.last < 32) return;
  // Небо всегда показывает погоду. Если в телефоне включено «Уменьшить движение» —
  // не выключаем, а замедляем в 4 раза: погоду видно, но ничего не мельтешит
  const speed = reduceMotion.matches ? 0.25 : 1;
  const dt = Math.min(0.05, (now - (sky.last || now)) / 1000) * speed;
  sky.last = now;
  drawSky(dt);
}

function startSky() {
  if (sky.raf || document.hidden) return;
  sky.last = 0;
  sky.raf = requestAnimationFrame(loop);
}

function stopSky() {
  cancelAnimationFrame(sky.raf);
  sky.raf = 0;
}

// ================= ЯЗЫК =================

function applyLang() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-aria]').forEach((n) => n.setAttribute('aria-label', t(n.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  fillCitySelect();
  setPlaceLabel();
  document.title = `${t('title')}: ${placeName()}`;
  if (lastForecast) renderForecast(lastForecast, false);
  else el.desc.textContent = t('loading');
  if (lastCountry) renderCountry(lastCountry);
}

function fillCitySelect() {
  const sorted = [...CITIES].sort((a, b) => a[state.lang].localeCompare(b[state.lang], state.lang));
  el.city.innerHTML = [`<option value="" disabled>${t('chooseCity')}</option>`]
    .concat(sorted.map((c) => `<option value="${c.id}">${c[state.lang]}</option>`)).join('');
  el.city.value = state.place.id || '';
}

// ================= ЗАГРУЗКА =================

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadForecast() {
  const id = ++requestId;
  const { lat, lon } = state.place;
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day'
    + '&hourly=temperature_2m,weather_code,precipitation_probability,is_day'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset'
    + '&wind_speed_unit=ms&timezone=auto&forecast_days=7';
  setPlaceLabel();
  try {
    const data = await getJSON(url);
    if (id !== requestId) return; // пришёл ответ на старый запрос
    lastForecast = data;
    el.error.hidden = true;
    renderForecast(data, true);
  } catch (e) {
    if (id !== requestId) return;
    el.error.hidden = false;
  }
}

async function loadCountry() {
  const lat = CITIES.map((c) => c.lat).join(',');
  const lon = CITIES.map((c) => c.lon).join(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,weather_code,is_day&timezone=auto';
  try {
    const data = await getJSON(url);
    lastCountry = (Array.isArray(data) ? data : [data]).map((d) => d.current);
    renderCountry(lastCountry);
  } catch (e) {
    el.error.hidden = false;
  }
}

// ================= ОТРИСОВКА =================

function parseDate(iso) {
  // "2026-11-08T13:00" — местное время города, без пересчёта часовых поясов
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, wd, hm: iso.slice(11, 16) };
}

function renderForecast(data, updateSky) {
  const c = data.current;
  const info = weatherInfo(c.weather_code, state.lang);
  if (updateSky) {
    setSky(info.kind, c.is_day === 1, HEAVY.has(c.weather_code));
    // После первого неба включаем плавные переходы для следующих городов
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('ready')));
  }

  document.title = `${fmtTemp(c.temperature_2m)} ${placeName()}: ${t('title')}`;
  const now = parseDate(c.time);
  el.date.textContent = `${T[state.lang].date(now.d, t('months')[now.m - 1], t('wdLong')[now.wd])}, ${now.hm}`;
  el.temp.textContent = fmtTemp(c.temperature_2m);
  el.temp.classList.remove('is-loading');
  el.icon.innerHTML = icon(info.kind, c.is_day === 1);
  el.desc.textContent = info.text;
  el.range.textContent = `${t('today')}: ${fmtTemp(data.daily.temperature_2m_min[0])} … ${fmtTemp(data.daily.temperature_2m_max[0])}`;
  el.feels.textContent = fmtTemp(c.apparent_temperature);
  el.wind.textContent = `${Math.round(c.wind_speed_10m)} ${t('ms')}`;
  el.hum.textContent = `${Math.round(c.relative_humidity_2m)}%`;
  el.sun.textContent = `${data.daily.sunrise[0].slice(11, 16)}–${data.daily.sunset[0].slice(11, 16)}`;

  renderHours(data, c);
  renderDays(data.daily, c.temperature_2m);
}

// Плавная кривая через точки (Catmull-Rom → кривые Безье)
function smoothPath(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function renderHours(data, current) {
  const h = data.hourly;
  const start = Math.max(0, h.time.indexOf(current.time.slice(0, 13) + ':00'));
  const idx = [];
  for (let i = start; i < Math.min(start + 24, h.time.length); i++) idx.push(i);

  const COL = 64;
  const H = 96, TOP = 30, BOTTOM = 12;
  const temps = idx.map((i) => (i === start ? current.temperature_2m : h.temperature_2m[i]));
  const lo = Math.min(...temps);
  const hi = Math.max(...temps);
  const span = Math.max(1, hi - lo);
  const pts = temps.map((tv, k) => [k * COL + COL / 2, TOP + (1 - (tv - lo) / span) * (H - TOP - BOTTOM)]);
  const width = idx.length * COL;
  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H} Z`;
  const gradStops = temps.map((tv, k) => `<stop offset="${(k / (temps.length - 1 || 1)).toFixed(3)}" stop-color="${tempColor(tv)}"/>`).join('');

  const top = idx.map((i, k) => {
    const info = weatherInfo(h.weather_code[i], state.lang);
    return `<li><span class="h-time">${k === 0 ? t('now') : h.time[i].slice(11, 16)}</span>
      <span class="h-icon" title="${info.text}">${icon(info.kind, h.is_day[i] === 1)}</span></li>`;
  }).join('');
  const labels = pts.map(([x, y], k) => `<span class="t-label" style="left:${x}px;top:${y}px">${fmtTemp(temps[k])}</span>`).join('');
  const rain = idx.map((i) => {
    const p = h.precipitation_probability[i];
    return `<li class="h-rain">${p >= 20 ? p + '%' : ''}</li>`;
  }).join('');

  el.hours.innerHTML = `<div class="hours-inner" style="width:${width}px;--col:${COL}px">
    <ol class="hours-row">${top}</ol>
    <div class="chart">
      <svg width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" aria-hidden="true">
        <defs>
          <linearGradient id="hl" x1="0" x2="1" y1="0" y2="0">${gradStops}</linearGradient>
          <linearGradient id="ha" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path class="area" d="${area}" fill="url(#ha)"/>
        <path class="line" d="${line}" stroke="url(#hl)"/>
        ${pts.map(([x, y], k) => `<circle class="dot${k === 0 ? ' now-dot' : ''}" cx="${x}" cy="${y}" r="${k === 0 ? 5 : 3}" fill="${tempColor(temps[k])}"/>`).join('')}
      </svg>
      ${labels}
    </div>
    <ol class="hours-row">${rain}</ol>
  </div>`;
}

function renderDays(d, nowTemp) {
  const lo = Math.min(...d.temperature_2m_min);
  const hi = Math.max(...d.temperature_2m_max);
  const span = Math.max(1, hi - lo);
  el.days.innerHTML = d.time.map((iso, i) => {
    const info = weatherInfo(d.weather_code[i], state.lang);
    const min = d.temperature_2m_min[i];
    const max = d.temperature_2m_max[i];
    const name = i === 0 ? t('today') : i === 1 ? t('tomorrow') : t('wdShort')[parseDate(iso).wd];
    const left = ((min - lo) / span) * 100;
    const width = Math.max(4, ((max - min) / span) * 100);
    const nowMark = i === 0 ? `<span class="d-now" style="left:${(((nowTemp - lo) / span) * 100).toFixed(1)}%"></span>` : '';
    return `<li>
      <span class="d-name">${name}</span>
      <span class="d-icon" title="${info.text}">${icon(info.kind, true)}</span>
      <span class="d-min">${fmtTemp(min)}</span>
      <span class="d-track"><span class="d-bar" style="left:${left}%;width:${width}%;background:linear-gradient(90deg, ${tempColor(min)}, ${tempColor(max)})"></span>${nowMark}</span>
      <span class="d-max">${fmtTemp(max)}</span>
    </li>`;
  }).join('');
}

// Карта: равнопромежуточная проекция с поправкой на широту (48°)
const MAP_K = 10;
const MAP_COS = Math.cos((48 * Math.PI) / 180);
const project = (lon, lat) => [((lon - 46) * MAP_COS * MAP_K), ((55.8 - lat) * MAP_K)];

// --- Приближение к городу и его настоящие границы (контуры из OpenStreetMap, data/city-shapes.json) ---

const BASE_VIEW = { x: -8, y: -4, w: 296, h: 162 };
let mapView = { ...BASE_VIEW };
let zoomCity = null;   // id города, к которому приблизились (или null — вся страна)
let shapes = null;     // контуры городов, грузим только при первом приближении
let zoomAnim = 0;

async function loadShapes() {
  if (shapes) return shapes;
  try { shapes = await getJSON('data/city-shapes.json'); } catch (e) { shapes = {}; }
  return shapes;
}

function shapePoints(id) {
  const s = shapes && shapes[id];
  return s ? s.rings.map((ring) => ring.map(([lo, la]) => project(lo, la))) : [];
}

function shapePath(id) {
  return shapePoints(id).map((ring) => ring.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('') + 'Z').join('');
}

// Куда приблизить: рамка вокруг границ города с запасом, с теми же пропорциями, что и вся карта
function targetView(id) {
  const city = CITIES.find((c) => c.id === id);
  let [cx, cy] = project(city.lon, city.lat);
  let bw = 4, bh = 4;
  const pts = shapePoints(id).flat();
  if (pts.length) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    cx = (x0 + x1) / 2; cy = (y0 + y1) / 2; bw = x1 - x0; bh = y1 - y0;
  }
  const ratio = BASE_VIEW.w / BASE_VIEW.h;
  const w = Math.max(bw * 1.9, bh * 1.9 * ratio, 12);
  const h = w / ratio;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

// Показываем кусок карты; точки и подписи масштабируем обратно, чтобы они не раздувались
function applyView(v) {
  const svg = el.map.querySelector('svg');
  if (!svg) return;
  svg.setAttribute('viewBox', `${v.x.toFixed(3)} ${v.y.toFixed(3)} ${v.w.toFixed(3)} ${v.h.toFixed(3)}`);
  const k = v.w / BASE_VIEW.w;
  svg.querySelectorAll('.mark').forEach((m) => {
    // Выбранный при приближении город — чуть крупнее остальных
    const big = zoomCity && m.parentNode.dataset.city === zoomCity ? 1 + 0.6 * (1 - k) : 1;
    m.setAttribute('transform', `scale(${(k * big).toFixed(4)})`);
  });
}

function animateView(to, done) {
  cancelAnimationFrame(zoomAnim);
  const from = { ...mapView };
  if (reduceMotion.matches) { mapView = { ...to }; applyView(mapView); if (done) done(); return; }
  const t0 = performance.now();
  const D = 800;
  const fx = from.x + from.w / 2, fy = from.y + from.h / 2;
  const tx = to.x + to.w / 2, ty = to.y + to.h / 2;
  const step = (now) => {
    const p = Math.min(1, (now - t0) / D);
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    // Ширину меняем по логарифму — так зум ощущается равномерным
    const w = Math.exp(Math.log(from.w) + (Math.log(to.w) - Math.log(from.w)) * e);
    const h = w * (BASE_VIEW.h / BASE_VIEW.w);
    const cx = fx + (tx - fx) * e, cy = fy + (ty - fy) * e;
    mapView = { x: cx - w / 2, y: cy - h / 2, w, h };
    applyView(mapView);
    if (p < 1) { zoomAnim = requestAnimationFrame(step); return; }
    zoomAnim = 0;
    if (done) done();
  };
  zoomAnim = requestAnimationFrame(step);
}

async function zoomTo(id) {
  await loadShapes();
  zoomCity = id;
  if (lastCountry) renderCountry(lastCountry, true);
  animateView(targetView(id), () => {
    el.map.querySelectorAll('.outline, .outline-glow').forEach((p) => p.classList.add('drawn')); // контур «прорисовывается» линией
  });
}

function zoomOut() {
  zoomCity = null;
  el.mapBack.hidden = true;
  el.map.querySelectorAll('.outline, .outline-glow').forEach((p) => p.classList.remove('drawn'));
  animateView({ ...BASE_VIEW }, () => { if (lastCountry) renderCountry(lastCountry); });
}

function renderCountry(list, fresh = false) {
  const land = KZ_OUTLINE.map(([lo, la], i) => {
    const [x, y] = project(lo, la);
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join('') + 'Z';

  const cities = CITIES.map((city, i) => {
    const c = list[i];
    const [x, y] = project(city.lon, city.lat);
    const col = tempColor(c.temperature_2m);
    const info = weatherInfo(c.weather_code, state.lang);
    const current = state.place.id === city.id;
    const name = city[state.lang];
    // Подписи считаем относительно точки (0,0), чтобы их можно было масштабировать при зуме
    let tx = 0, ty = -7, anchor = 'middle';
    if (city.label === 'left') { tx = -6; ty = 2.5; anchor = 'end'; }
    if (city.label === 'right') { tx = 6; ty = 2.5; anchor = 'start'; }
    if (city.label === 'below') { ty = 12; }
    const nameY = city.label === 'below' ? 19 : 11;
    const showName = current || zoomCity === city.id;
    return `<g class="city" role="button" tabindex="0" data-city="${city.id}" ${current ? 'aria-current="true"' : ''}
        transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" aria-label="${name}: ${fmtTemp(c.temperature_2m)}, ${info.text}">
      <title>${name}: ${fmtTemp(c.temperature_2m)}</title>
      <g class="mark">
        <circle class="hit" r="9"/>
        <circle class="glow" r="8" fill="url(#rg${i})"/>
        <circle class="ring" r="6"/>
        <circle class="pin" r="3.4" fill="${col}"/>
        <text class="t" x="${tx}" y="${ty}" text-anchor="${anchor}">${fmtTemp(c.temperature_2m)}</text>
        ${showName ? `<text class="n" y="${nameY}" text-anchor="middle">${name}</text>` : ''}
      </g>
    </g>`;
  }).join('');

  // Контур выбранного города: цвет его температуры
  let outline = '';
  if (zoomCity && shapes && shapes[zoomCity]) {
    const i = CITIES.findIndex((c) => c.id === zoomCity);
    const col = tempColor(list[i].temperature_2m);
    const k = targetView(zoomCity).w / BASE_VIEW.w;
    const d = shapePath(zoomCity);
    // Свечение — просто широкая полупрозрачная линия под контуром (без фильтров: они тормозят телефоны)
    outline = `<path class="outline-glow" d="${d}" pathLength="1" stroke="${col}" stroke-width="${(5 * k).toFixed(3)}"/>
      <path class="outline" d="${d}" pathLength="1" fill="${col}" stroke="${col}" stroke-width="${(1.8 * k).toFixed(3)}"/>`;
  }

  const k = mapView.w / BASE_VIEW.w;
  el.map.innerHTML = `<svg viewBox="${mapView.x} ${mapView.y} ${mapView.w} ${mapView.h}" role="group" aria-label="${t('country')}">
    <defs>${list.map((c, i) => `<radialGradient id="rg${i}"><stop offset="0" stop-color="${tempColor(c.temperature_2m)}" stop-opacity=".85"/><stop offset="1" stop-color="${tempColor(c.temperature_2m)}" stop-opacity="0"/></radialGradient>`).join('')}</defs>
    <path class="land" d="${land}" vector-effect="non-scaling-stroke"/>${outline}${cities}</svg>`;
  applyView(mapView);

  if (zoomCity) {
    el.mapBack.hidden = false;
    // Уже приблизились (перерисовка после смены языка/города) — контур показываем сразу
    if (!fresh && mapView.w < BASE_VIEW.w * 0.99 && !zoomAnim) el.map.querySelectorAll('.outline, .outline-glow').forEach((p) => p.classList.add('drawn'));
  }

  // Где теплее и где холоднее всего
  let warm = 0, cold = 0;
  list.forEach((c, i) => {
    if (c.temperature_2m > list[warm].temperature_2m) warm = i;
    if (c.temperature_2m < list[cold].temperature_2m) cold = i;
  });
  el.extremes.innerHTML = `${t('warmest')}: <b>${CITIES[warm][state.lang]} ${fmtTemp(list[warm].temperature_2m)}</b>. `
    + `${t('coldest')}: <b>${CITIES[cold][state.lang]} ${fmtTemp(list[cold].temperature_2m)}</b>.`;
}

// ================= ДЕЙСТВИЯ =================

function setPlace(place) {
  state.place = place;
  saveState();
  for (const ui of Object.values(UI)) { ui.results.hidden = true; ui.notice.hidden = true; ui.input.value = ''; }
  if (el.sheet.open) el.sheet.close();
  el.city.value = place.id || '';
  setPlaceLabel();
  // Если карта приближена — переезжаем к новому городу (или отдаляемся, если это место не из списка)
  if (zoomCity && place.id) zoomTo(place.id);
  else if (zoomCity) zoomOut();
  else if (lastCountry) renderCountry(lastCountry);
  loadForecast();
}

function showNotice(text, ui = UI.top) {
  ui.notice.textContent = text;
  ui.notice.hidden = false;
}

// Название места — в заголовке и на главной кнопке нижней панели
function setPlaceLabel() {
  el.name.textContent = placeName();
  el.dockName.textContent = placeName();
}

// ---------- Поиск города ----------

// Приводим к одному виду: регистр, ё, казахские буквы → русские (Ақтөбе = актобе)
const KZ_TO_RU = { 'ә': 'а', 'ғ': 'г', 'қ': 'к', 'ң': 'н', 'ө': 'о', 'ұ': 'у', 'ү': 'у', 'һ': 'х', 'і': 'и', 'ё': 'е' };
function norm(s) {
  return s.toLowerCase().replace(/[әғқңөұүһіё]/g, (ch) => KZ_TO_RU[ch]).replace(/[^a-zа-я0-9]+/g, ' ').trim();
}

// Кириллица → латиница: сервис поиска лучше знает латинские названия (жанаозен → zhanaozen)
const TO_LAT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};
function translit(s) {
  return norm(s).replace(/[а-я]/g, (ch) => TO_LAT[ch]);
}

// Свои 19 городов ищем сразу, без интернета
function findLocal(query) {
  const q = norm(query);
  if (!q) return [];
  return CITIES.filter((c) => [c.kk, c.ru, c.en, ...(ALIASES[c.id] || [])]
    .some((n) => norm(n).startsWith(q) || (q.length >= 4 && norm(n).includes(q))));
}

// Поиск работает в двух местах: сверху (компьютер) и в шторке (телефон). ui — где именно.
async function searchCity(query, ui) {
  const id = ++ui.id;
  const local = findLocal(query).map((c) => ({ local: true, id: c.id, name: c[state.lang], lat: c.lat, lon: c.lon }));
  if (local.length) renderResults(local, ui);
  else { ui.results.hidden = true; showNotice(t('searching'), ui); }

  const lang = state.lang === 'en' ? 'en' : 'ru';
  const url = (q) => 'https://geocoding-api.open-meteo.com/v1/search'
    + `?name=${encodeURIComponent(q)}&count=8&language=${lang}&countryCode=KZ&format=json`;
  const queries = [query.trim()];
  const lat = translit(query);
  if (lat && lat !== norm(query)) queries.push(lat);

  const answers = await Promise.allSettled(queries.map((q) => getJSON(url(q))));
  if (id !== ui.id) return; // пользователь уже ввёл что-то другое

  const seen = new Set();
  const remote = [];
  for (const a of answers) {
    if (a.status !== 'fulfilled') continue;
    for (const r of a.value.results || []) {
      if (seen.has(r.id) || (r.feature_code || '').startsWith('AIRP')) continue; // без дублей и аэропортов
      seen.add(r.id);
      const nearLocal = local.some((c) => Math.abs(c.lat - r.latitude) < 0.2 && Math.abs(c.lon - r.longitude) < 0.2);
      if (!nearLocal) remote.push({ name: r.name, region: r.admin1 || '', lat: r.latitude, lon: r.longitude });
    }
  }

  const all = local.concat(remote).slice(0, 8);
  if (!all.length) {
    const failed = answers.every((a) => a.status === 'rejected');
    ui.results.hidden = true;
    showNotice(failed ? t('error') : t('noResults'), ui);
    return;
  }
  renderResults(all, ui);
}

function renderResults(list, ui) {
  ui.notice.hidden = true;
  ui.results.innerHTML = list.map((r, i) => `<li><button type="button" data-i="${i}">
    ${escapeHTML(r.name)}<small>${escapeHTML(r.region || '')}</small></button></li>`).join('');
  ui.results.hidden = false;
  if (ui.chips) ui.chips.hidden = true; // в шторке результаты заменяют список городов
  ui.results.onclick = (e) => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    const r = list[Number(b.dataset.i)];
    setPlace(r.local ? placeFromCity(r.id) : { name: r.name, lat: r.lat, lon: r.lon });
  };
}

function bindSearch(ui) {
  ui.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = ui.input.value.trim();
    if (q.length >= 2) searchCity(q, ui);
  });
  // Подсказки прямо во время ввода (с паузой, чтобы не дёргать сервис на каждую букву)
  ui.input.addEventListener('input', () => {
    clearTimeout(ui.timer);
    const q = ui.input.value.trim();
    if (q.length < 2) {
      ui.id++;
      ui.results.hidden = true;
      ui.notice.hidden = true;
      if (ui.chips) ui.chips.hidden = false;
      return;
    }
    ui.timer = setTimeout(() => searchCity(q, ui), 350);
  });
}

// ---------- Шторка выбора города (телефон) ----------

function renderChips() {
  const sorted = [...CITIES].sort((a, b) => a[state.lang].localeCompare(b[state.lang], state.lang));
  el.chips.innerHTML = sorted.map((c) => {
    const i = CITIES.indexOf(c);
    const tv = lastCountry ? lastCountry[i].temperature_2m : null;
    const current = state.place.id === c.id;
    return `<li><button type="button" data-city="${c.id}" ${current ? 'aria-current="true"' : ''}>
      <span class="chip-name">${tv === null ? '' : `<span class="chip-dot" style="background:${tempColor(tv)}"></span>`}<span class="chip-label">${c[state.lang]}</span></span>
      <span class="chip-t">${tv === null ? '' : fmtTemp(tv)}</span></button></li>`;
  }).join('');
}

function openSheet() {
  renderChips();
  el.chips.hidden = false;
  UI.sheet.results.hidden = true;
  UI.sheet.notice.hidden = true;
  el.sheet.showModal();
}

// Смахнуть шторку вниз за «ручку», чтобы закрыть
function enableSheetSwipe() {
  const grip = el.sheet.querySelector('.sheet-grip');
  let startY = 0, dy = 0, dragging = false;
  grip.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    dragging = true; startY = e.clientY; dy = 0;
    grip.setPointerCapture(e.pointerId);
    el.sheet.style.transition = 'none';
  });
  grip.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dy = Math.max(0, e.clientY - startY);
    el.sheet.style.translate = `0 ${dy}px`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    el.sheet.style.transition = '';
    el.sheet.style.translate = '';
    if (dy > 90) el.sheet.close();
  };
  grip.addEventListener('pointerup', end);
  grip.addEventListener('pointercancel', end);
}

// Запасной вариант «тап мимо — закрыть» для браузеров без closedby (Safari)
function sheetLightDismissFallback() {
  if ('closedBy' in HTMLDialogElement.prototype) return;
  const outside = (e) => {
    const r = el.sheet.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  let pressedOutside = false;
  el.sheet.addEventListener('pointerdown', (e) => { pressedOutside = outside(e); });
  el.sheet.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e)) el.sheet.close(); });
}

// Подсвечиваем в нижней панели раздел, который сейчас на экране
function watchSections() {
  const links = [...document.querySelectorAll('.dock-link')];
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach((a) => {
        if (a.dataset.section === en.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['now', 'week', 'kz-map'].forEach((id) => io.observe($(id)));
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// Расстояние между точками в км (формула гаверсинуса)
function distanceKm(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2
    + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

function locate(ui = UI.top) {
  // Браузеры отдают местоположение только защищённым сайтам (https).
  // По адресу вида http://192.168.… телефон молча откажет — честно объясняем почему.
  if (!window.isSecureContext) { showNotice(t('geoInsecure'), ui); return; }
  if (!navigator.geolocation) { showNotice(t('geoFail'), ui); return; }
  showNotice(t('locating'), ui);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = +pos.coords.latitude.toFixed(4);
      const lon = +pos.coords.longitude.toFixed(4);
      // Стоим в одном из наших городов — показываем его название, а не «Моё местоположение»
      const near = CITIES.find((c) => distanceKm(lat, lon, c.lat, c.lon) < 25);
      setPlace(near ? placeFromCity(near.id) : { name: '', lat, lon });
    },
    (err) => showNotice(err.code === 1 ? t('geoDenied') : t('geoFail'), ui),
    { timeout: 12000, maximumAge: 600000 },
  );
}

// Нажали на точку: открываем погоду города и приближаем карту к его границам
function pickCityFromMap(target) {
  const g = target.closest('[data-city]');
  if (!g) return;
  const id = g.dataset.city;
  zoomCity = zoomCity || id; // чтобы setPlace понял, что надо приближать
  setPlace(placeFromCity(id));
}

// ================= ЗАПУСК =================

document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
  state.lang = b.dataset.lang;
  saveState();
  applyLang();
}));


el.city.addEventListener('change', () => setPlace(placeFromCity(el.city.value)));

bindSearch(UI.top);
bindSearch(UI.sheet);
$('locate').addEventListener('click', () => locate(UI.top));
$('sheet-locate').addEventListener('click', () => locate(UI.sheet));

$('dock-city').addEventListener('click', openSheet);
el.chips.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-city]');
  if (b) setPlace(placeFromCity(b.dataset.city));
});
el.sheet.addEventListener('close', () => {
  UI.sheet.input.value = '';
  UI.sheet.id++;
});
enableSheetSwipe();
sheetLightDismissFallback();
watchSections();

el.map.addEventListener('click', (e) => pickCityFromMap(e.target));
el.map.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickCityFromMap(e.target); }
});

el.mapBack.addEventListener('click', zoomOut);

$('retry').addEventListener('click', () => {
  el.error.hidden = true;
  loadForecast();
  if (!lastCountry) loadCountry();
});

// Небо не тратит батарею, когда вкладка скрыта
document.addEventListener('visibilitychange', () => (document.hidden ? stopSky() : startSky()));
window.addEventListener('resize', () => resizeSky());

resizeSky();
startSky();
applyLang();
loadForecast();
loadCountry();
// Границы городов подгружаем заранее, в свободную минуту — чтобы первое приближение не ждало сеть
(window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => loadShapes());
