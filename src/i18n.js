// i18n.js - Internationalization module
// Supported languages with their translations

const translations = {
  en: {
    // Options panel
    stationName: 'Station or stop name',
    numberOfDepartures: 'Number of departures',
    fetchInterval: 'Fetch interval (seconds)',
    textSize: 'Text size',
    transportModes: 'Transport modes (filter)',
    switchLanguage: 'Switch language',
    save: 'Save to Favorites',
    close: 'Close',
    
    // Text sizes
    tiny: 'Tiny',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extraLarge: 'Extra large',
    
    // Transport modes
    bus: 'Bus',
    tram: 'Tram',
    metro: 'Metro',
    rail: 'Rail',
    water: 'Water',
    coach: 'Coach',
    
    // Toast messages
    settingsApplied: 'Settings applied',
    filtersUpdated: 'Filters updated',
    textSizeUpdated: 'Text size updated',
    savedToFavorites: 'Saved to favorites',
    languageChanged: 'Language changed',
    
    // Update toast
    newVersionAvailable: 'New version available, reloading...',
    
    // Status
    updatingIn: 'Updating in',
    seconds: 's',
    
    // Footer
    version: 'Version',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'No station selected',
    noRecentStations: 'No recent stations'
  },
  
  no: {
    // Options panel
    stationName: 'Stasjons- eller holdeplassnavn',
    numberOfDepartures: 'Antall avganger',
    fetchInterval: 'Oppdateringsintervall (sekunder)',
    textSize: 'Tekststørrelse',
    transportModes: 'Transportmidler (filter)',
    switchLanguage: 'Bytt språk',
    apply: 'Bruk',
    save: 'Lagre i favoritter',
    close: 'Lukk',
    
    // Text sizes
    tiny: 'Veldig liten',
    small: 'Liten',
    medium: 'Middels',
    large: 'Stor',
    extraLarge: 'Ekstra stor',
    
    // Transport modes
    bus: 'Buss',
    tram: 'Trikk',
    metro: 'T-bane',
    rail: 'Tog',
    water: 'Båt',
    coach: 'Ekspressbuss',
    
    // Toast messages
    settingsApplied: 'Innstillinger lagret',
    filtersUpdated: 'Filter oppdatert',
    textSizeUpdated: 'Tekststørrelse oppdatert',
    savedToFavorites: 'Lagret i favoritter',
    languageChanged: 'Språk endret',
    
    // Update toast
    newVersionAvailable: 'Ny versjon tilgjengelig, laster inn på nytt...',
    
    // Status
    updatingIn: 'Oppdaterer om',
    seconds: 's',
    
    // Footer
    version: 'Versjon',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Ingen stasjon valgt',
    noRecentStations: 'Ingen nylige stasjoner'
  },
  
  de: {
    // Options panel
    stationName: 'Bahnhofs- oder Haltestellenname',
    numberOfDepartures: 'Anzahl Abfahrten',
    fetchInterval: 'Aktualisierungsintervall (Sekunden)',
    textSize: 'Textgröße',
    transportModes: 'Verkehrsmittel (Filter)',
    switchLanguage: 'Sprache wechseln',
    apply: 'Anwenden',
    save: 'In Favoriten speichern',
    close: 'Schließen',
    
    // Text sizes
    tiny: 'Sehr klein',
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß',
    extraLarge: 'Extra groß',
    
    // Transport modes
    bus: 'Bus',
    tram: 'Straßenbahn',
    metro: 'U-Bahn',
    rail: 'Zug',
    water: 'Schiff',
    coach: 'Reisebus',
    
    // Toast messages
    settingsApplied: 'Einstellungen gespeichert',
    filtersUpdated: 'Filter aktualisiert',
    textSizeUpdated: 'Textgröße aktualisiert',
    savedToFavorites: 'In Favoriten gespeichert',
    languageChanged: 'Sprache geändert',
    
    // Update toast
    newVersionAvailable: 'Neue Version verfügbar, wird neu geladen...',
    
    // Status
    updatingIn: 'Aktualisierung in',
    seconds: 's',
    
    // Footer
    version: 'Version',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Keine Station ausgewählt',
    noRecentStations: 'Keine letzten Stationen'
  },
  
  es: {
    // Options panel
    stationName: 'Nombre de estación o parada',
    numberOfDepartures: 'Número de salidas',
    fetchInterval: 'Intervalo de actualización (segundos)',
    textSize: 'Tamaño del texto',
    transportModes: 'Modos de transporte (filtro)',
    switchLanguage: 'Cambiar idioma',
    apply: 'Aplicar',
    save: 'Guardar en favoritos',
    close: 'Cerrar',
    
    // Text sizes
    tiny: 'Muy pequeño',
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    extraLarge: 'Extra grande',
    
    // Transport modes
    bus: 'Autobús',
    tram: 'Tranvía',
    metro: 'Metro',
    rail: 'Tren',
    water: 'Barco',
    coach: 'Autocar',
    
    // Toast messages
    settingsApplied: 'Configuración aplicada',
    filtersUpdated: 'Filtros actualizados',
    textSizeUpdated: 'Tamaño de texto actualizado',
    savedToFavorites: 'Guardado en favoritos',
    languageChanged: 'Idioma cambiado',
    
    // Update toast
    newVersionAvailable: 'Nueva versión disponible, recargando...',
    
    // Status
    updatingIn: 'Actualizando en',
    seconds: 's',
    
    // Footer
    version: 'Versión',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Ninguna estación seleccionada',
    noRecentStations: 'No hay estaciones recientes'
  },
  
  it: {
    // Options panel
    stationName: 'Nome stazione o fermata',
    numberOfDepartures: 'Numero di partenze',
    fetchInterval: 'Intervallo di aggiornamento (secondi)',
    textSize: 'Dimensione testo',
    transportModes: 'Mezzi di trasporto (filtro)',
    switchLanguage: 'Cambia lingua',
    apply: 'Applica',
    save: 'Salva nei preferiti',
    close: 'Chiudi',
    
    // Text sizes
    tiny: 'Piccolissimo',
    small: 'Piccolo',
    medium: 'Medio',
    large: 'Grande',
    extraLarge: 'Extra grande',
    
    // Transport modes
    bus: 'Autobus',
    tram: 'Tram',
    metro: 'Metropolitana',
    rail: 'Treno',
    water: 'Nave',
    coach: 'Pullman',
    
    // Toast messages
    settingsApplied: 'Impostazioni applicate',
    filtersUpdated: 'Filtri aggiornati',
    textSizeUpdated: 'Dimensione testo aggiornata',
    savedToFavorites: 'Salvato nei preferiti',
    languageChanged: 'Lingua cambiata',
    
    // Update toast
    newVersionAvailable: 'Nuova versione disponibile, ricaricamento...',
    
    // Status
    updatingIn: 'Aggiornamento tra',
    seconds: 's',
    
    // Footer
    version: 'Versione',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Nessuna stazione selezionata',
    noRecentStations: 'Nessuna stazione recente'
  },
  
  el: {
    // Options panel
    stationName: 'Όνομα σταθμού ή στάσης',
    numberOfDepartures: 'Αριθμός αναχωρήσεων',
    fetchInterval: 'Διάστημα ενημέρωσης (δευτερόλεπτα)',
    textSize: 'Μέγεθος κειμένου',
    transportModes: 'Μέσα μεταφοράς (φίλτρο)',
    switchLanguage: 'Αλλαγή γλώσσας',
    apply: 'Εφαρμογή',
    save: 'Αποθήκευση στα αγαπημένα',
    close: 'Κλείσιμο',
    
    // Text sizes
    tiny: 'Πολύ μικρό',
    small: 'Μικρό',
    medium: 'Μεσαίο',
    large: 'Μεγάλο',
    extraLarge: 'Πολύ μεγάλο',
    
    // Transport modes
    bus: 'Λεωφορείο',
    tram: 'Τραμ',
    metro: 'Μετρό',
    rail: 'Τρένο',
    water: 'Πλοίο',
    coach: 'Πούλμαν',
    
    // Toast messages
    settingsApplied: 'Οι ρυθμίσεις εφαρμόστηκαν',
    filtersUpdated: 'Τα φίλτρα ενημερώθηκαν',
    textSizeUpdated: 'Το μέγεθος κειμένου ενημερώθηκε',
    savedToFavorites: 'Αποθηκεύτηκε στα αγαπημένα',
    languageChanged: 'Η γλώσσα άλλαξε',
    
    // Update toast
    newVersionAvailable: 'Διαθέσιμη νέα έκδοση, επαναφόρτωση...',
    
    // Status
    updatingIn: 'Ενημέρωση σε',
    seconds: 'δ',
    
    // Footer
    version: 'Έκδοση',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Δεν επιλέχθηκε σταθμός',
    noRecentStations: 'Δεν υπάρχουν πρόσφατοι σταθμοί'
  },
  
  fa: {
    // Options panel
    stationName: 'نام ایستگاه یا توقفگاه',
    numberOfDepartures: 'تعداد حرکت‌ها',
    fetchInterval: 'فاصله به‌روزرسانی (ثانیه)',
    textSize: 'اندازه متن',
    transportModes: 'وسایل نقلیه (فیلتر)',
    switchLanguage: 'تغییر زبان',
    apply: 'اعمال',
    save: 'ذخیره در علاقه‌مندی‌ها',
    close: 'بستن',
    
    // Text sizes
    tiny: 'خیلی کوچک',
    small: 'کوچک',
    medium: 'متوسط',
    large: 'بزرگ',
    extraLarge: 'خیلی بزرگ',
    
    // Transport modes
    bus: 'اتوبوس',
    tram: 'تراموا',
    metro: 'مترو',
    rail: 'قطار',
    water: 'کشتی',
    coach: 'اتوبوس بین‌شهری',
    
    // Toast messages
    settingsApplied: 'تنظیمات اعمال شد',
    filtersUpdated: 'فیلترها به‌روزرسانی شد',
    textSizeUpdated: 'اندازه متن به‌روزرسانی شد',
    savedToFavorites: 'در علاقه‌مندی‌ها ذخیره شد',
    languageChanged: 'زبان تغییر کرد',
    
    // Update toast
    newVersionAvailable: 'نسخه جدید موجود است، در حال بارگذاری مجدد...',
    
    // Status
    updatingIn: 'به‌روزرسانی در',
    seconds: 'ث',
    
    // Footer
    version: 'نسخه',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'هیچ ایستگاهی انتخاب نشده',
    noRecentStations: 'ایستگاه اخیر وجود ندارد'
  },
  
  hi: {
    // Options panel
    stationName: 'स्टेशन या पड़ाव का नाम',
    numberOfDepartures: 'प्रस्थान की संख्या',
    fetchInterval: 'अपडेट अंतराल (सेकंड)',
    textSize: 'पाठ का आकार',
    transportModes: 'परिवहन साधन (फ़िल्टर)',
    switchLanguage: 'भाषा बदलें',
    apply: 'लागू करें',
    save: 'पसंदीदा में सहेजें',
    close: 'बंद करें',
    
    // Text sizes
    tiny: 'बहुत छोटा',
    small: 'छोटा',
    medium: 'मध्यम',
    large: 'बड़ा',
    extraLarge: 'बहुत बड़ा',
    
    // Transport modes
    bus: 'बस',
    tram: 'ट्राम',
    metro: 'मेट्रो',
    rail: 'रेल',
    water: 'जलयान',
    coach: 'कोच',
    
    // Toast messages
    settingsApplied: 'सेटिंग्स लागू की गईं',
    filtersUpdated: 'फ़िल्टर अपडेट किए गए',
    textSizeUpdated: 'पाठ का आकार अपडेट किया गया',
    savedToFavorites: 'पसंदीदा में सहेजा गया',
    languageChanged: 'भाषा बदली गई',
    
    // Update toast
    newVersionAvailable: 'नया संस्करण उपलब्ध है, फिर से लोड किया जा रहा है...',
    
    // Status
    updatingIn: 'अपडेट में',
    seconds: 'से',
    
    // Footer
    version: 'संस्करण',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'कोई स्टेशन चयनित नहीं',
    noRecentStations: 'कोई हालिया स्टेशन नहीं'
  },
  
  is: {
    // Options panel
    stationName: 'Nafn stöðvar eða biðstöðvar',
    numberOfDepartures: 'Fjöldi brottfara',
    fetchInterval: 'Uppfærslubil (sekúndur)',
    textSize: 'Textastærð',
    transportModes: 'Samgöngumátar (sía)',
    switchLanguage: 'Skipta um tungumál',
    apply: 'Nota',
    save: 'Vista í eftirlæti',
    close: 'Loka',
    
    // Text sizes
    tiny: 'Örsmátt',
    small: 'Lítið',
    medium: 'Miðlungs',
    large: 'Stórt',
    extraLarge: 'Mjög stórt',
    
    // Transport modes
    bus: 'Strætó',
    tram: 'Sporvagn',
    metro: 'Neðanjarðarlest',
    rail: 'Lest',
    water: 'Skip',
    coach: 'Hraðbraut',
    
    // Toast messages
    settingsApplied: 'Stillingar vistaðar',
    filtersUpdated: 'Síur uppfærðar',
    textSizeUpdated: 'Textastærð uppfærð',
    savedToFavorites: 'Vistað í eftirlæti',
    languageChanged: 'Tungumáli breytt',
    
    // Update toast
    newVersionAvailable: 'Ný útgáfa tiltæk, endurnýja...',
    
    // Status
    updatingIn: 'Uppfærir eftir',
    seconds: 's',
    
    // Footer
    version: 'Útgáfa',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Engin stöð valin',
    noRecentStations: 'Engar nýlegar stöðvar'
  },
  
  uk: {
    // Options panel
    stationName: 'Назва станції або зупинки',
    numberOfDepartures: 'Кількість відправлень',
    fetchInterval: 'Інтервал оновлення (секунди)',
    textSize: 'Розмір тексту',
    transportModes: 'Транспортні засоби (фільтр)',
    switchLanguage: 'Змінити мову',
    apply: 'Застосувати',
    save: 'Зберегти в обране',
    close: 'Закрити',
    
    // Text sizes
    tiny: 'Дуже малий',
    small: 'Малий',
    medium: 'Середній',
    large: 'Великий',
    extraLarge: 'Дуже великий',
    
    // Transport modes
    bus: 'Автобус',
    tram: 'Трамвай',
    metro: 'Метро',
    rail: 'Поїзд',
    water: 'Судно',
    coach: 'Міжміський автобус',
    
    // Toast messages
    settingsApplied: 'Налаштування застосовано',
    filtersUpdated: 'Фільтри оновлено',
    textSizeUpdated: 'Розмір тексту оновлено',
    savedToFavorites: 'Збережено в обране',
    languageChanged: 'Мову змінено',
    
    // Update toast
    newVersionAvailable: 'Доступна нова версія, перезавантаження...',
    
    // Status
    updatingIn: 'Оновлення через',
    seconds: 'с',
    
    // Footer
    version: 'Версія',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Станцію не вибрано',
    noRecentStations: 'Немає недавніх станцій'
  },
  
  fr: {
    // Options panel
    stationName: 'Nom de la station ou de l\'arrêt',
    numberOfDepartures: 'Nombre de départs',
    fetchInterval: 'Intervalle de mise à jour (secondes)',
    textSize: 'Taille du texte',
    transportModes: 'Modes de transport (filtre)',
    switchLanguage: 'Changer de langue',
    apply: 'Appliquer',
    save: 'Enregistrer dans les favoris',
    close: 'Fermer',
    
    // Text sizes
    tiny: 'Très petit',
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    extraLarge: 'Très grand',
    
    // Transport modes
    bus: 'Bus',
    tram: 'Tramway',
    metro: 'Métro',
    rail: 'Train',
    water: 'Bateau',
    coach: 'Autocar',
    
    // Toast messages
    settingsApplied: 'Paramètres appliqués',
    filtersUpdated: 'Filtres mis à jour',
    textSizeUpdated: 'Taille du texte mise à jour',
    savedToFavorites: 'Enregistré dans les favoris',
    languageChanged: 'Langue modifiée',
    
    // Update toast
    newVersionAvailable: 'Nouvelle version disponible, rechargement...',
    
    // Status
    updatingIn: 'Mise à jour dans',
    seconds: 's',
    
    // Footer
    version: 'Version',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Aucune station sélectionnée',
    noRecentStations: 'Aucune station récente'
  },
  
  pl: {
    // Options panel
    stationName: 'Nazwa stacji lub przystanku',
    numberOfDepartures: 'Liczba odjazdów',
    fetchInterval: 'Interwał odświeżania (sekundy)',
    textSize: 'Rozmiar tekstu',
    transportModes: 'Środki transportu (filtr)',
    switchLanguage: 'Zmień język',
    apply: 'Zastosuj',
    save: 'Zapisz w ulubionych',
    close: 'Zamknij',
    
    // Text sizes
    tiny: 'Bardzo mały',
    small: 'Mały',
    medium: 'Średni',
    large: 'Duży',
    extraLarge: 'Bardzo duży',
    
    // Transport modes
    bus: 'Autobus',
    tram: 'Tramwaj',
    metro: 'Metro',
    rail: 'Pociąg',
    water: 'Statek',
    coach: 'Autokar',
    
    // Toast messages
    settingsApplied: 'Ustawienia zastosowane',
    filtersUpdated: 'Filtry zaktualizowane',
    textSizeUpdated: 'Rozmiar tekstu zaktualizowany',
    savedToFavorites: 'Zapisano w ulubionych',
    languageChanged: 'Język zmieniony',
    
    // Update toast
    newVersionAvailable: 'Nowa wersja dostępna, przeładowanie...',
    
    // Status
    updatingIn: 'Aktualizacja za',
    seconds: 's',
    
    // Footer
    version: 'Wersja',
    starOnGitHub: 'GitHub',
    
    // Station dropdown
    noStationSelected: 'Nie wybrano stacji',
    noRecentStations: 'Brak ostatnich stacji'
  }
};

// Language metadata with flags
const languages = [
  { code: 'no', flag: '🇳🇴', name: 'Norsk' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
  { code: 'is', flag: '🇮🇸', name: 'Íslenska' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'fa', flag: '🇮🇷', name: 'فارسی' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська' }
];

let currentLanguage = 'en';

// Detect browser language
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Map Norwegian variants (nb/nn) to 'no'
  if (langCode === 'nb' || langCode === 'nn') {
    return 'no';
  }
  
  // Check if we support this language
  if (translations[langCode]) {
    return langCode;
  }
  
  // Default to English
  return 'en';
}

// Initialize language from localStorage or browser default
function initLanguage() {
  try {
    const saved = localStorage.getItem('departure:language');
    if (saved && translations[saved]) {
      currentLanguage = saved;
    } else {
      currentLanguage = detectBrowserLanguage();
    }
  } catch (e) {
    currentLanguage = detectBrowserLanguage();
  }
  return currentLanguage;
}

// Get translation for a key
function t(key) {
  const lang = translations[currentLanguage] || translations.en;
  return lang[key] || translations.en[key] || key;
}

// Set language
function setLanguage(langCode) {
  if (!translations[langCode]) {
    console.warn(`Language ${langCode} not supported, falling back to English`);
    langCode = 'en';
  }
  currentLanguage = langCode;
  try {
    localStorage.setItem('departure:language', langCode);
  } catch (e) {
    console.warn('Failed to save language preference', e);
  }
}

// Get current language
function getLanguage() {
  return currentLanguage;
}

// Get all supported languages
function getLanguages() {
  return languages;
}

export { t, setLanguage, getLanguage, initLanguage, getLanguages };
