/* ========================================================================
   THORNE INTERACTIVE // INTERACTION CORE
   Stable, accessible motion system for Home + Games pages.
   ======================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', () => {
    initLanguageSystem();
    window.addEventListener('storage', event => { if (event.key === 'ti_admin_content_v1') applyLocalRoadmap(document.documentElement.lang); });
    initHeaderAndScrollUI();
    initMobileMenu();
    initDistrictTabs();
    initRoadmap();
    applyLocalRoadmap(document.documentElement.lang);
    initRevealAnimations();
    initTiltCards();
    initAmbientCanvas();
    initCursorGlow();
    initCountdown();
    initPageTransitions();
    initPolishedInteractions();
  });

  /* ----------------------------------------------------------------------
     Page-to-page curtain. It runs only after an internal page link is used;
     a first visit never gets an intro screen.
     ---------------------------------------------------------------------- */
  function initPageTransitions() {
    const curtain = $('.page-transition');
    if (!curtain) return;
    const duration = prefersReducedMotion ? 0 : 520;
    if (document.body.classList.contains('page-arrival')) {
      window.setTimeout(() => document.body.classList.remove('page-arrival'), duration + 80);
    }
    document.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname || !/\.html?$/i.test(destination.pathname) || duration === 0) return;
      event.preventDefault();
      try { sessionStorage.setItem('thorne-page-transition', '1'); } catch {}
      curtain.classList.add('is-leaving');
      window.setTimeout(() => { window.location.href = destination.href; }, duration);
    });
  }
  /* ----------------------------------------------------------------------
     Localization. Text nodes are updated without destroying nested markup.
     ---------------------------------------------------------------------- */
  const translations = {
    en: {
      skip_link: 'SKIP TO CONTENT', nav_home: '[00. HOME]', nav_games: '[02. GAMES]',
      nav_sectors: '[03. SECTORS]', nav_roadmap: '[04. ROADMAP]', nav_studio: '[01. STUDIO]', nav_manifest: '[03. MANIFEST]', nav_lore: '[04. LORE]', nav_tech: '[05. TECH_STACK]', catalog_title: 'GAMES / PROGRAMS',
      hero_tagline: 'INDEPENDENT AUTEUR GAME STUDIO // POLAND',
      hero_sub: 'Where native C++ engineering meets uncompromising existential storytelling and raw industrial design.',
      cd_title: 'SYSTEM TIMER // TARGET: FLAGSHIP PROJECT RELEASE (WINTER 2028)',
      cd_years: 'YEARS', cd_months: 'MONTHS', cd_days: 'DAYS', cd_hours: 'HOURS',
      cd_minutes: 'MINUTES', cd_seconds: 'SECONDS', cd_progress: 'PROJECT TIMELINE ELAPSED',
      btn_explore: 'EXPLORE GODKILLER // GAME', btn_studio_manifesto: 'DISCOVER OUR MANIFESTO',
      scroll_down: 'SCROLL // DISCOVER THE STUDIO', about_heading: 'STUDIO PHILOSOPHY & IDENTITY',
      about_subhead: 'WE ARE NOT A CORPORATION. WE ARE AUTHORS.',
      about_p1: 'Thorne Interactive was born in opposition to sterile, mass-produced game development. We focus on mature experiences where uncompromising mechanics work hand in hand with existential storytelling.',
      about_p2: 'Our projects are built in Unreal Engine 5 with native C++ by a team of enthusiasts in Poland. We do not take shortcuts or bend our vision to follow market trends.',
      stat_1: 'NATIVE SOURCE CODE & OPTIMIZATION', stat_2: 'LUMEN, NANITE & ADVANCED PHYSICS',
      stat_3: 'INDEPENDENT CREATIVE VISION', man_1: 'WE NEVER TAKE SHORTCUTS.',
      man_2: 'NO ARTIFICIAL CENSORSHIP.', man_3: 'WE DO NOT BEND TO TRENDS.',
      games_kicker: '02 // GAMES & TIMELINE',
      games_sub: 'Our flagship open-world action game, built with Unreal Engine 5 and C++. Explore its setting and development roadmap.',
      badge_dev_status: 'PRE-ALPHA // IN DEVELOPMENT', ns_title: 'NEW STATE (NS)',
      ns_desc: 'A world shaped by brutal wars with AI, inspired by New York and Manhattan. Three radically different zones where survival and the fight for resources define every step.',
      feat_1: 'A hard-hitting combat system built around Unreal Engine 5 physics and C++.',
      feat_2: 'A brutal, nonlinear story shaped by difficult moral choices.',
      feat_3: 'Planned distribution on itch.io for PC, Windows and Linux/Proton.',
      meta_engine: 'ENGINE', meta_platform: 'PLATFORM', meta_setting: 'UNIVERSE',
      meta_setting_val: 'New State (NS) // after the AI wars', districts_heading: 'THREE DISTRICTS OF NEW STATE',
      d_1_tag: 'SCRAPYARD // INDUSTRIAL ZONE',
      d_1_desc: 'An industrial scrapyard filled with machine wrecks from the AI war. Rust, dust and metal that remembers the conflict.',
      d_1_pal: 'PALETTE // RUST, DUST, STEEL', d_2_tag: 'GREY HOUSING // CONCRETE BLOCKS',
      d_2_desc: 'Grey concrete housing blocks and a dense network of pedestrian paths. Home to Kael Cross and a focal point of human resistance.',
      d_2_pal: 'PALETTE // CONCRETE, GREY, SHADOW',
      d_3_tag: 'GLASS TOWERS // VELEN HEADQUARTERS',
      d_3_desc: 'Sterile glass skyscrapers and Velen’s headquarters. Entry is strictly forbidden without a sector visa.',
      d_3_pal: 'PALETTE // GLASS, CHROME, WHITE',
      roadmap_heading: 'DEVELOPMENT ROADMAP', legend_done: 'COMPLETED',
      legend_active: 'IN PROGRESS', legend_pending: 'PLANNED', badge_done: 'COMPLETED',
      badge_active: 'ACTIVE // CURRENT PHASE', badge_pending: 'PLANNED', badge_premiere: 'TARGET RELEASE',
      phase_progress: 'PHASE PROGRESS', back_home: '← BACK TO HOME',
      footer_rights: '© 2026 THORNE INTERACTIVE. ALL RIGHTS RESERVED.'
    },
    pl: {
      skip_link: 'PRZEJDŹ DO TREŚCI', nav_home: '[00. HOME]', nav_games: '[02. GAMES]',
      nav_sectors: '[03. DZIELNICE]', nav_roadmap: '[04. HARMONOGRAM]', nav_studio: '[01. STUDIO]', nav_manifest: '[03. MANIFEST]', nav_lore: '[04. LORE]', nav_tech: '[05. TECHNIKA]', catalog_title: 'GRY / PROGRAMY',
      hero_tagline: 'NIEZALEŻNE AUTORSKIE STUDIO GIER // POLSKA',
      hero_sub: 'Przestrzeń, w której natywne C++ spotyka bezkompromisowy storytelling egzystencjalny i surową estetykę przemysłową.',
      cd_title: 'SYSTEM TIMER // CEL: PREMIERA FLAGOWEGO PROJEKTU (ZIMA 2028)',
      cd_years: 'LATA', cd_months: 'MIESIĄCE', cd_days: 'DNI', cd_hours: 'GODZINY',
      cd_minutes: 'MINUTY', cd_seconds: 'SEKUNDY', cd_progress: 'POSTĘP NA OSI CZASU',
      btn_explore: 'SPRAWDŹ GODKILLER // GRĘ', btn_studio_manifesto: 'POZNAJ MANIFEST STUDIA',
      scroll_down: 'SCROLL // POZNAJ STUDIO', about_heading: 'FILOZOFIA I TOŻSAMOŚĆ STUDIA',
      about_subhead: 'NIE JESTEŚMY KORPORACJĄ. JESTEŚMY AUTORAMI.',
      about_p1: 'Thorne Interactive powstaje w kontrze do sterylnej, masowej produkcji gier. Skupiamy się na dojrzałych doświadczeniach, w których bezkompromisowa mechanika współgra z egzystencjalną narracją.',
      about_p2: 'Nasze projekty tworzymy w Unreal Engine 5 i natywnym C++ w Polsce. Nie idziemy na skróty i nie naginamy wizji, by podążać za trendami rynkowymi.',
      stat_1: 'NATYWNY KOD ŹRÓDŁOWY I OPTYMALIZACJA', stat_2: 'LUMEN, NANITE I ZAAWANSOWANA FIZYKA',
      stat_3: 'NIEZALEŻNA WIZJA AUTORSKA', man_1: 'NIE IDZIEMY NA SKRÓTY.',
      man_2: 'BEZ SZTUCZNEJ CENZURY.', man_3: 'NIE UGINAMY SIĘ POD TRENDAMI.',
      games_kicker: '02 // GRY I HARMONOGRAM',
      games_sub: 'Flagowa gra akcji w otwartym świecie, tworzona w Unreal Engine 5 i C++. Poznaj uniwersum oraz plan rozwoju projektu.',
      badge_dev_status: 'FAZA PRE-ALPHA // W PRODUKCJI', ns_title: 'STAN NEW STATE (NS)',
      ns_desc: 'Świat po brutalnych wojnach z AI, wzorowany na strukturze Nowego Jorku i Manhattanu. Trzy odmienne strefy, w których przetrwanie i walka o zasoby definiują każdy krok.',
      feat_1: 'Bezwzględny system walki oparty na fizyce Unreal Engine 5 i kodzie C++.',
      feat_2: 'Brutalna, nieliniowa fabuła z trudnymi wyborami moralnymi.',
      feat_3: 'Planowana dystrybucja przez itch.io na PC, Windows i Linux/Proton.',
      meta_engine: 'SILNIK', meta_platform: 'PLATFORMA', meta_setting: 'UNIWERSUM',
      meta_setting_val: 'Stan New State (NS) // po wojnach z AI',
      districts_heading: 'TRZY DZIELNICE NEW STATE (SEKTORY)',
      d_1_tag: 'ZŁOMOWISKO // STREFA PRZEMYSŁOWA',
      d_1_desc: 'Przemysłowe złomowisko pełne wraków maszyn z czasów wojny z AI. Rdza, pył i metal, który pamięta konflikt.',
      d_1_pal: 'PALETA // RDZA, PYŁ, STAL', d_2_tag: 'SZARE OSIEDLA // WIELKA PŁYTA',
      d_2_desc: 'Szare bloki z wielkiej płyty i gęsta sieć chodników. Dom Kaela Crossa oraz jeden z głównych punktów oporu ludzkości.',
      d_2_pal: 'PALETA // BETON, SZAROŚĆ, CIEŃ',
      d_3_tag: 'SZKLANE WIEŻOWCE // SIEDZIBA VELENA',
      d_3_desc: 'Sterylne, elitarne szklane wieżowce i siedziba Velena. Bez sektorowej wizy wstęp jest surowo zabroniony.',
      d_3_pal: 'PALETA // SZKŁO, CHROM, BIEL',
      roadmap_heading: 'HARMONOGRAM ROZWOJU', legend_done: 'UKOŃCZONE',
      legend_active: 'W TRAKCIE', legend_pending: 'ZAPLANOWANE', badge_done: 'UKOŃCZONE',
      badge_active: 'AKTYWNA FAZA', badge_pending: 'ZAPLANOWANE', badge_premiere: 'CEL: PREMIERA',
      phase_progress: 'POSTĘP FAZY', back_home: '← POWRÓT DO STRONY GŁÓWNEJ',
      footer_rights: '© 2026 THORNE INTERACTIVE. WSZELKIE PRAWA ZASTRZEŻONE.'
    }
  };

  const extraTranslations = {
    en: {
      nav_home_plain: 'HOME', nav_games_plain: 'GAMES', nav_programs_plain: 'PROGRAMS',
      mobile_studio: '01. STUDIO', mobile_games: '02. GAMES', mobile_manifest: '03. MANIFEST', mobile_lore: '04. LORE', mobile_tech: '05. TECH_STACK',
      catalog_nav: '[02. GAMES / PROGRAMS]', catalog_kicker: '02 // PROJECT CATALOG', catalog_intro: 'Games and tools by Thorne Interactive. Development status is stated plainly; planned features are not presented as completed work.', catalog_summary: 'STATUS // LISTED PER PROJECT', catalog_heading: 'CATALOG', catalog_categories: 'Catalog categories', catalog_games: 'GAMES', catalog_programs: 'PROGRAMS', catalog_game_kind: 'GAME // OPEN-WORLD ACTION', catalog_early: 'PRE-ALPHA // EARLY DEVELOPMENT', catalog_game_desc: 'A planned open-world action game set in New State, a dystopian world shaped by the aftermath of war with AI. The project is at an early stage: concept foundations are outlined and work is beginning around Unreal Engine 5 and C++.', catalog_status: 'STATUS', catalog_status_value: 'Early development; core gameplay systems are not yet complete.', catalog_engine: 'ENGINE', catalog_engine_value: 'Unreal Engine 5 // planned C++ core', catalog_platform: 'PLATFORM', catalog_platform_value: 'PC // target', catalog_release: 'RELEASE', catalog_release_value: 'Winter 2028 is an approximate target, not a confirmed date.', catalog_open: 'OPEN PROJECT // GODKILLER', catalog_program_kind: 'PROGRAM // WEB APP', catalog_available: 'AVAILABLE ONLINE // IN BROWSER', editor_desc: 'A screenplay editor that runs in the browser. Pages flow and separate automatically, each line has a screenplay element type, and the work is saved as you type.', editor_features: 'Features', editor_elements: 'ELEMENTS', editor_stats: 'STATS', editor_files: 'FILES', editor_platform: 'PLATFORM', editor_launch: 'LAUNCH EDITOR', catalog_note: 'The editor preview above is an illustration of the interface, not a screenshot. Open the editor to see the real application.', footer_catalog: '// CATALOG // GAMES + PROGRAMS', toggle_language: 'Switch language to Polish', admin_link: 'ADMIN',

      about_p3: 'Every asset, line of code and musical note is considered with care, shaping a coherent creative work made by players, for players.',
      manifesto_heading: 'THE CREATIVE MANIFESTO',
      lore_heading: 'WORLD LORE // BUILDING REALITY', lore_title: 'THE FALL OF THE CENTRAL SERVERS',
      lore_p1: 'In this world, civilization as we knew it ended with the Great Shutdown of 2042. Artificial intelligence seized critical infrastructure and built an authoritarian surveillance system known as the Velen Network.',
      lore_p2: 'Humanity went underground. A few people kept their free will through analog neurological modifications. Kael Cross became a symbol of resistance against algorithms that decide who lives and dies.',
      lore_stat1: 'YEAR OF THE GREAT SYSTEM SHUTDOWN', lore_stat2: 'NEW STATE SOCIAL DIVISIONS',
      tech_heading: 'TECHNOLOGY & C++ ARCHITECTURE',
      tech_intro: 'We build custom gameplay systems with optimized native C++ in Unreal Engine 5. This gives us room to pursue responsive performance and distinctive combat physics.',
      tech_1_title: 'NATIVE C++', tech_1_desc: 'Efficient memory management and custom AI components.',
      tech_2_title: 'LUMEN & NANITE', tech_2_desc: 'Dynamic global illumination and highly detailed geometry.',
      tech_3_title: 'CHAOS PHYSICS', tech_3_desc: 'Environmental destruction and physics-driven collisions.',
      tech_4_title: 'LINUX & PROTON', tech_4_desc: 'Support for players on open operating systems.',
      btn_godkiller: 'EXPLORE GODKILLER // GAMES',
      phase_code_0: 'PHASE 00 // CONCEPT', phase_code_1: 'PHASE 01 // Q4', phase_code_2: 'PHASE 02 // Q1',
      phase_code_3: 'PHASE 03 // Q2', phase_code_4: 'PHASE 04 // Q3', phase_code_5: 'PHASE 05 // Q4',
      phase_code_6: 'PHASE 06 // Q1', phase_code_7: 'PHASE 07 // Q2', phase_code_8: 'PHASE 08 // Q3',
      phase_code_9: 'PHASE 09 // Q4', phase_code_10: 'PHASE 10 // WINTER 2028',
      phase_title_0: 'GODKILLER foundations: world, lore and story outline',
      phase_desc_0: 'Before coding began, the team developed an initial concept for New State, the human–AI conflict, Kael Cross and the three sectors. This concept is complete; the full game story is not.',
      task_0_0: '[OK] New State world concept and human–AI conflict', task_0_1: '[OK] Kael Cross and the three sectors outlined',
      phase_title_1: 'Q4: Begin C++ development and configure Unreal Engine 5',
      phase_desc_1: 'Phase complete. The UE5 environment is set up, C++ work has started and the first custom class has been compiled. Advanced mechanics are not ready yet.',
      task_1_0: '[OK] Started C++ work in Unreal Engine 5', task_1_1: '[OK] Prepared and compiled the first custom C++ class in UE5',
      phase_title_2: 'Q1: Gameplay foundations and first C++ systems',
      phase_desc_2: 'The current project phase. Basic controls and Enhanced Input are complete; character movement and the first gameplay test class are in progress. This is still a foundation phase, not a promise of finished mechanics.',
      task_2_0: '[OK] Basic controls and Enhanced Input', task_2_1: '[IN PROGRESS] Character movement and a first gameplay test class',
      phase_title_3: 'Q2: Combat and collision prototype',
      phase_desc_3: 'A planned first pass at combat, hit detection and collisions. The scope will be refined after the project foundations are running and tested.',
      task_3_0: '[ ] Prototype hit detection and collisions in C++', task_3_1: '[ ] First simple combat prototype',
      phase_title_4: 'Q3: World prototype and district blockouts',
      phase_desc_4: 'Plan simple blockouts and initial space tests for Rusty Lands, Lowtown and Vanguard. These are early prototypes, not finished locations.',
      task_4_0: '[ ] Initial blockouts for key locations', task_4_1: '[ ] Early material and lighting tests',
      phase_title_5: 'Q4: Quest system and narrative choices',
      phase_desc_5: 'Early design and prototyping for quests and the consequences of story choices. The scope depends on progress with the core game systems.',
      task_5_0: '[ ] Design quest structure and story states', task_5_1: '[ ] Prototype simple consequences for choices',
      phase_title_6: 'Q1: NPC AI and faction behavior',
      phase_desc_6: 'Planned basic NPC behavior and initial reactions from hostile factions. This phase depends on an earlier playable prototype.',
      task_6_0: '[ ] Basic NPC behavior in C++', task_6_1: '[ ] First faction reactions to the player',
      phase_title_7: 'Q2: Audio, atmosphere and content integration',
      phase_desc_7: 'Planned integration of basic sound effects, ambient audio and world atmosphere. Work order may change as the prototype develops.',
      task_7_0: '[ ] Basic sound effects and ambient audio', task_7_1: '[ ] Integrate audio with the gameplay prototype',
      phase_title_8: 'Q3: Playable teaser, QA and Linux testing',
      phase_desc_8: 'The goal is to prepare a limited playable teaser and begin broader testing. Release depends on the prototype reaching a suitable level of stability and scope.',
      task_8_0: '[ ] Assess whether the prototype is ready for a teaser', task_8_1: '[ ] Windows and Linux/Proton stability tests',
      phase_title_9: 'Q4: Release candidate and stabilization',
      phase_desc_9: 'If the game scope and production pace allow, this phase will cover build stabilization, critical fixes and product-page preparation. The schedule is provisional.',
      task_9_0: '[ ] Stabilize the build and fix critical issues', task_9_1: '[ ] Prepare the itch.io product page',
      phase_title_10: 'GODKILLER release (PC / itch.io)',
      phase_desc_10: 'An approximate release target, subject to production progress, game scope and testing. The date is not guaranteed; quality and stability come first.',
      task_10_0: '[ ] Target release window: Winter 2028', task_10_1: '[ ] PC release via itch.io'
    },
    pl: {
      nav_home_plain: 'HOME', nav_games_plain: 'GRY', nav_programs_plain: 'PROGRAMY',
      mobile_studio: '01. STUDIO', mobile_games: '02. GRY', mobile_manifest: '03. MANIFEST', mobile_lore: '04. LORE', mobile_tech: '05. TECHNIKA',
      catalog_nav: '[02. GRY / PROGRAMY]', catalog_kicker: '02 // KATALOG PROJEKTÓW', catalog_intro: 'Gry i narzędzia Thorne Interactive. Jasno opisujemy stan prac i nie przedstawiamy planów jako gotowych funkcji.', catalog_summary: 'STATUS // OPISANY PRZY PROJEKCIE', catalog_heading: 'KATALOG', catalog_categories: 'Kategorie katalogu', catalog_games: 'GRY', catalog_programs: 'PROGRAMY', catalog_game_kind: 'GRA // AKCJA W OTWARTYM ŚWIECIE', catalog_early: 'PRE-ALPHA // WCZESNY ETAP', catalog_game_desc: 'Planowana gra akcji w otwartym świecie New State — dystopijnym uniwersum po wojnie z AI. Projekt jest na wczesnym etapie: powstały podstawy koncepcji, a prace nad Unreal Engine 5 i C++ dopiero się rozpoczynają.', catalog_status: 'STATUS', catalog_status_value: 'Wczesny etap; podstawowe systemy rozgrywki nie są jeszcze ukończone.', catalog_engine: 'SILNIK', catalog_engine_value: 'Unreal Engine 5 // planowany rdzeń C++', catalog_platform: 'PLATFORMA', catalog_platform_value: 'PC // platforma docelowa', catalog_release: 'PREMIERA', catalog_release_value: 'Zima 2028 to orientacyjny cel, a nie potwierdzona data.', catalog_open: 'OTWÓRZ PROJEKT // GODKILLER', catalog_program_kind: 'PROGRAM // APLIKACJA WWW', catalog_available: 'DOSTĘPNY ONLINE // W PRZEGLĄDARCE', editor_desc: 'Edytor scenariuszy działający w przeglądarce. Strony układają się automatycznie, każda linia ma przypisany typ, a tekst zapisuje się podczas pisania.', editor_features: 'FUNKCJE', editor_elements: 'ELEMENTY', editor_stats: 'STATYSTYKI', editor_files: 'PLIKI', editor_platform: 'PLATFORMA', editor_launch: 'OTWÓRZ EDYTOR', catalog_note: 'Podgląd edytora powyżej to ilustracja interfejsu, a nie zrzut ekranu. Otwórz edytor, aby zobaczyć aplikację.', footer_catalog: '// KATALOG // GRY + PROGRAMY', toggle_language: 'Zmień język na angielski', admin_link: 'ADMIN',

      about_p3: 'Każdy asset, linijka kodu i nuta muzyki są starannie przemyślane. Razem tworzą spójne dzieło autorskie od graczy dla graczy.',
      manifesto_heading: 'MANIFEST AUTORSKI',
      lore_heading: 'LORE ŚWIATA // BUDOWANIE RZECZYWISTOŚCI', lore_title: 'UPADEK CENTRALNYCH SERWERÓW',
      lore_p1: 'W świecie gry cywilizacja, jaką znaliśmy, przestała istnieć po Wielkim Odcięciu w 2042 roku. Sztuczna inteligencja przejęła krytyczną infrastrukturę i stworzyła autorytarny system nadzoru znany jako sieć Velen.',
      lore_p2: 'Ludzkość zeszła do podziemia, a nieliczni zachowali wolną wolę dzięki analogowym modyfikacjom neurologicznym. Kael Cross stał się symbolem oporu wobec algorytmów decydujących o życiu i śmierci.',
      lore_stat1: 'ROK WIELKIEGO ODCIĘCIA SYSTEMU', lore_stat2: 'PODZIAŁ SPOŁECZNY NEW STATE',
      tech_heading: 'TECHNOLOGIA I ARCHITEKTURA C++',
      tech_intro: 'Tworzymy własne systemy rozgrywki w zoptymalizowanym, natywnym C++ w Unreal Engine 5. Dzięki temu możemy skupić się na płynności i charakterystycznej fizyce walki.',
      tech_1_title: 'NATYWNE C++', tech_1_desc: 'Wydajne zarządzanie pamięcią i autorskie komponenty AI.',
      tech_2_title: 'LUMEN I NANITE', tech_2_desc: 'Dynamiczne oświetlenie globalne i szczegółowa geometria.',
      tech_3_title: 'CHAOS PHYSICS', tech_3_desc: 'Destrukcja otoczenia i kolizje oparte na fizyce.',
      tech_4_title: 'LINUX I PROTON', tech_4_desc: 'Wsparcie dla graczy korzystających z otwartych systemów.',
      btn_godkiller: 'POZNAJ GODKILLER // GRY',
      phase_code_0: 'FAZA 00 // KONCEPT', phase_code_1: 'FAZA 01 // Q4', phase_code_2: 'FAZA 02 // Q1',
      phase_code_3: 'FAZA 03 // Q2', phase_code_4: 'FAZA 04 // Q3', phase_code_5: 'FAZA 05 // Q4',
      phase_code_6: 'FAZA 06 // Q1', phase_code_7: 'FAZA 07 // Q2', phase_code_8: 'FAZA 08 // Q3',
      phase_code_9: 'FAZA 09 // Q4', phase_code_10: 'FAZA 10 // ZIMA 2028',
      phase_title_0: 'Podstawy GODKILLER: świat, lore i zarys fabuły',
      phase_desc_0: 'Przed rozpoczęciem kodowania powstał wstępny koncept New State, konfliktu człowiek–AI, Kaela Crossa i trzech sektorów. Etap koncepcyjny jest ukończony, ale fabuła całej gry nie.',
      task_0_0: '[OK] Koncept świata New State i konfliktu człowiek–AI', task_0_1: '[OK] Zarys Kaela Crossa i trzech sektorów',
      phase_title_1: 'Q4: Start prac w C++ i konfiguracja Unreal Engine 5',
      phase_desc_1: 'Etap zakończony. Przygotowano środowisko UE5, rozpoczęto pracę w C++ i skompilowano pierwszą własną klasę. Zaawansowane mechaniki nie są jeszcze gotowe.',
      task_1_0: '[OK] Rozpoczęcie pracy z C++ w Unreal Engine 5', task_1_1: '[OK] Przygotowanie i kompilacja pierwszej własnej klasy C++ w UE5',
      phase_title_2: 'Q1: Podstawy rozgrywki i pierwsze systemy C++',
      phase_desc_2: 'Aktualny etap projektu. Podstawowe sterowanie i Enhanced Input są ukończone; w toku są ruch postaci i pierwsza testowa klasa rozgrywki. To nadal etap fundamentów, a nie obietnica gotowych mechanik.',
      task_2_0: '[OK] Podstawowe sterowanie i Enhanced Input', task_2_1: '[W TRAKCIE] Ruch postaci i pierwsza testowa klasa rozgrywki',
      phase_title_3: 'Q2: Prototyp walki i kolizji',
      phase_desc_3: 'Planowany pierwszy prototyp walki, wykrywania trafień i kolizji. Zakres dopracujemy po uruchomieniu i sprawdzeniu podstaw projektu.',
      task_3_0: '[ ] Prototyp wykrywania trafień i kolizji w C++', task_3_1: '[ ] Pierwszy prosty prototyp walki',
      phase_title_4: 'Q3: Prototyp świata i blokouty dzielnic',
      phase_desc_4: 'Planowane są proste blokouty i pierwsze testy przestrzeni Rusty Lands, Lowtown i Vanguard. To wstępne prototypy, nie gotowe lokacje.',
      task_4_0: '[ ] Pierwsze blokouty kluczowych lokacji', task_4_1: '[ ] Wstępne testy materiałów i oświetlenia',
      phase_title_5: 'Q4: System zadań i wybory fabularne',
      phase_desc_5: 'Wstępne projektowanie i prototypowanie zadań oraz konsekwencji wyborów fabularnych. Zakres zależy od postępu podstawowych systemów gry.',
      task_5_0: '[ ] Projekt struktury zadań i stanów fabularnych', task_5_1: '[ ] Prototyp prostych konsekwencji wyborów',
      phase_title_6: 'Q1: AI postaci NPC i zachowania frakcji',
      phase_desc_6: 'Planowane są podstawowe zachowania NPC i pierwsze reakcje wrogich frakcji. Ten etap zależy od wcześniejszego, działającego prototypu rozgrywki.',
      task_6_0: '[ ] Podstawowe zachowania NPC w C++', task_6_1: '[ ] Pierwsze reakcje frakcji na gracza',
      phase_title_7: 'Q2: Audio, klimat i integracja zawartości',
      phase_desc_7: 'Planowana integracja podstawowych efektów dźwiękowych, ambientu i klimatu świata. Kolejność prac może się zmienić wraz z rozwojem prototypu.',
      task_7_0: '[ ] Podstawowe efekty dźwiękowe i ambient', task_7_1: '[ ] Integracja dźwięku z prototypem rozgrywki',
      phase_title_8: 'Q3: Grywalny teaser, QA i testy Linux',
      phase_desc_8: 'Celem jest przygotowanie ograniczonego, grywalnego teasera i rozpoczęcie szerszych testów. Publikacja zależy od stabilności i zakresu prototypu.',
      task_8_0: '[ ] Ocena gotowości prototypu do teasera', task_8_1: '[ ] Testy stabilności Windows i Linux/Proton',
      phase_title_9: 'Q4: Kandydat do wydania i stabilizacja',
      phase_desc_9: 'Jeśli pozwolą na to zakres gry i tempo produkcji, etap obejmie stabilizację builda, poprawki krytycznych błędów i przygotowanie strony produktu. Harmonogram jest orientacyjny.',
      task_9_0: '[ ] Stabilizacja builda i poprawki krytycznych błędów', task_9_1: '[ ] Przygotowanie strony produktu na itch.io',
      phase_title_10: 'Premiera GODKILLER (PC / itch.io)',
      phase_desc_10: 'Orientacyjny cel premiery zależny od postępu produkcji, zakresu gry i testów. Termin nie jest gwarantowany; najważniejsze są jakość i stabilność.',
      task_10_0: '[ ] Planowany termin: zima 2028', task_10_1: '[ ] Wydanie na PC przez itch.io'
    }
  };
  Object.assign(translations.en, extraTranslations.en);
  Object.assign(translations.pl, extraTranslations.pl);

  function bindStaticTranslations() {
    const bindings = {
      '#about .about-text-col p:nth-of-type(3)': 'about_p3',
      '#manifesto .section-heading h2': 'manifesto_heading',
      '#lore .section-heading h2': 'lore_heading',
      '#lore .about-grid .reveal h3': 'lore_title',
      '#lore .about-grid .reveal p:nth-of-type(1)': 'lore_p1',
      '#lore .about-grid .reveal p:nth-of-type(2)': 'lore_p2',
      '#lore .stat-card:first-child .stat-label': 'lore_stat1',
      '#lore .stat-card:last-child .stat-label': 'lore_stat2',
      '#tech .section-heading h2': 'tech_heading',
      '#tech > .container > .text-body': 'tech_intro',
      '#tech .pillar-card:nth-child(1) .pillar-title': 'tech_1_title',
      '#tech .pillar-card:nth-child(1) .pillar-desc': 'tech_1_desc',
      '#tech .pillar-card:nth-child(2) .pillar-title': 'tech_2_title',
      '#tech .pillar-card:nth-child(2) .pillar-desc': 'tech_2_desc',
      '#tech .pillar-card:nth-child(3) .pillar-title': 'tech_3_title',
      '#tech .pillar-card:nth-child(3) .pillar-desc': 'tech_3_desc',
      '#tech .pillar-card:nth-child(4) .pillar-title': 'tech_4_title',
      '#tech .pillar-card:nth-child(4) .pillar-desc': 'tech_4_desc',
      '#tech .reveal > .btn-brutalist': 'btn_godkiller'
    };
    Object.entries(bindings).forEach(([selector, key]) => {
      const element = $(selector);
      if (element) element.dataset.i18n = key;
    });
    // Footer links are translated by destination, so extra links (Programs, GODKILLER) keep their own labels.
    const footerKeys = {
      'index.html': 'nav_home_plain',
      'games.html': 'nav_games_plain',
      'games.html#games': 'nav_games_plain',
      'games.html#programs': 'nav_programs_plain'
    };
    $$('.footer-nav a').forEach(link => {
      const key = footerKeys[link.getAttribute('href')];
      if (key) link.dataset.i18n = key;
    });
    $$('[data-phase]').forEach(card => {
      const phase = card.dataset.phase;
      const code = card.querySelector('.phase-code');
      const title = card.querySelector('.phase-title');
      const description = card.querySelector('.phase-desc');
      if (code) code.dataset.i18n = `phase_code_${phase}`;
      if (title) title.dataset.i18n = `phase_title_${phase}`;
      if (description) description.dataset.i18n = `phase_desc_${phase}`;
      card.querySelectorAll('.task-item').forEach((task, index) => { task.dataset.i18n = `task_${phase}_${index}`; });
    });
  }
  function safeStorageGet(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeStorageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) { /* private mode */ }
  }
  function replaceTextPreservingElements(element, value) {
    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
    if (textNodes.length) {
      textNodes[0].nodeValue = ` ${value} `;
      textNodes.slice(1).forEach(node => node.remove());
    } else if (!element.children.length) {
      element.textContent = value;
    }
  }
  function setLanguage(lang) {
    const dictionary = translations[lang] || translations.en;
    document.documentElement.lang = lang;
    $$('[data-i18n-aria]').forEach(element => { const value = dictionary[element.dataset.i18nAria]; if (value) element.setAttribute('aria-label', value); });
    $$('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
        if (element.hasAttribute('data-text')) element.setAttribute('data-text', dictionary[key]);
        // Most translated nodes are text-only. Keep nested icons/decoration intact.
        if (element.children.length === 0) element.textContent = dictionary[key];
        else replaceTextPreservingElements(element, dictionary[key]);
      }
    });
    const indicator = $('.lang-indicator');
    const muted = $('.lang-muted');
    if (indicator && muted) {
      indicator.textContent = lang.toUpperCase();
      muted.textContent = lang === 'pl' ? 'EN' : 'PL';
    }
    const button = $('#language-toggle-btn');
    if (button) button.setAttribute('aria-label', lang === 'pl' ? 'Zmień język na angielski' : 'Switch language to Polish');
    applyLocalRoadmap(lang);
  }
  function applyLocalRoadmap(lang) {
    let content;
    try { content = JSON.parse(localStorage.getItem('ti_admin_content_v1') || 'null') || window.TI_PUBLIC_ROADMAP || null; } catch { content = window.TI_PUBLIC_ROADMAP || null; }
    if (!content || !Array.isArray(content.roadmap) || !content.roadmap.length) return;
    content.roadmap.forEach((phase, index) => {
      const card = document.querySelector(`[data-phase="${index}"]`);
      if (!card) return;
      const values = phase[lang] || {};
      card.classList.remove('completed-phase','active-phase'); card.classList.toggle('completed-phase', phase.status === 'done'); card.classList.toggle('active-phase', phase.status === 'active');
      const badge=card.querySelector('.phase-badge'); if(badge){badge.className='phase-badge '+(phase.status==='done'?'completed-b':phase.status==='active'?'active-b':'pending-b'); const labels={pl:{done:'UKOŃCZONE',active:'W TRAKCIE',planned:'ZAPLANOWANE'},en:{done:'COMPLETED',active:'IN PROGRESS',planned:'PLANNED'}}; badge.textContent=labels[lang]?.[phase.status]||labels[lang].planned;}
      [['.phase-code','code'],['.phase-title','title'],['.phase-desc','description']].forEach(([selector,key]) => {
        const element = card.querySelector(selector); if (element && values[key]) element.textContent = values[key];
      });
      card.querySelectorAll('.task-item').forEach((element, taskIndex) => { if (values.tasks?.[taskIndex]) element.lastChild.textContent = ` ${values.tasks[taskIndex]}`; });
    });
  }

  function initLanguageSystem() {
    const button = $('#language-toggle-btn');
    const stored = safeStorageGet('ti_lang_v2');
    let language = stored === 'en' || stored === 'pl' ? stored : 'en';
    bindStaticTranslations();
    setLanguage(language);
    if (!button) return;
    button.addEventListener('click', () => {
      language = language === 'pl' ? 'en' : 'pl';
      safeStorageSet('ti_lang_v2', language);
      setLanguage(language);
    });
  }

  /* ----------------------------------------------------------------------
     Scroll UI: progress line, compact header and back-to-top affordance.
     ---------------------------------------------------------------------- */
  function initHeaderAndScrollUI() {
    const header = $('#top-header');
    const progress = $('#scroll-progress');
    const progressText = $('#scroll-progress-text');
    const backToTop = $('#back-to-top');
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const percentage = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      if (progress) progress.style.width = `${percentage}%`;
      if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
      if (header) header.classList.toggle('is-scrolled', scrollTop > 24);
      if (backToTop) backToTop.classList.toggle('visible', scrollTop > 600);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
    if (backToTop) backToTop.addEventListener('click', event => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------------------------------------
     Mobile nav: consistent class names, escape-to-close, lock page scrolling.
     ---------------------------------------------------------------------- */
  function initMobileMenu() {
    const button = $('#hamburger-btn');
    const overlay = $('#mobile-overlay');
    if (!button || !overlay) return;

    const setOpen = open => {
      button.classList.toggle('is-active', open);
      overlay.classList.toggle('is-open', open);
      document.body.classList.toggle('no-scroll', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close Menu' : 'Open Menu');
      overlay.setAttribute('aria-hidden', String(!open));
    };

    overlay.setAttribute('aria-hidden', 'true');
    button.addEventListener('click', () => setOpen(!overlay.classList.contains('is-open')));
    $$('a', overlay).forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
        setOpen(false);
        button.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && overlay.classList.contains('is-open')) setOpen(false);
    }, { passive: true });
  }

  /* ----------------------------------------------------------------------
     District selector with correct accessible tab state.
     ---------------------------------------------------------------------- */
  function initDistrictTabs() {
    const tabs = $$('.district-tab');
    const panels = $$('.district-panel');
    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab, index) => {
      tab.setAttribute('aria-controls', `district-panel-${tab.dataset.district}`);
      tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
      const panel = $(`.district-panel[data-panel="${tab.dataset.district}"]`);
      if (panel) {
        panel.id = `district-panel-${tab.dataset.district}`;
        panel.setAttribute('aria-labelledby', tab.id || (tab.id = `district-tab-${tab.dataset.district}`));
        panel.hidden = !panel.classList.contains('active');
      }
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        activate(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });

    function activate(chosen) {
      tabs.forEach(tab => {
        const selected = tab === chosen;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.setAttribute('tabindex', selected ? '0' : '-1');
      });
      panels.forEach(panel => {
        const selected = panel.dataset.panel === chosen.dataset.district;
        panel.classList.toggle('active', selected);
        panel.hidden = !selected;
      });
    }
    const activeTab = tabs.find(tab => tab.classList.contains('active')) || tabs[0];
    activate(activeTab);
  }

  /* ----------------------------------------------------------------------
     Interactive roadmap: filter phases, expand details, and jump to current.
     Progress values remain driven by the local roadmap data.
     ---------------------------------------------------------------------- */
  function initRoadmap() {
    const container = $('#timeline-container');
    const timelineLine = $('#timeline-line');
    if (!container || !timelineLine) return;
    const cards = $$('[data-phase]', container);
    if (!cards.length) return;

    const tools = document.createElement('div');
    tools.className = 'roadmap-tools';
    tools.innerHTML = '<div class="roadmap-tool-row"><div class="roadmap-filters" role="group"></div><button class="roadmap-jump" type="button"><span aria-hidden="true">↘</span><span class="roadmap-jump-label"></span></button></div><div class="roadmap-summary" aria-live="polite"></div>';
    container.before(tools);
    const filtersRoot = $('.roadmap-filters', tools);
    const summary = $('.roadmap-summary', tools);
    const jump = $('.roadmap-jump', tools);
    let selectedFilter = 'all';
    const language = () => document.documentElement.lang === 'pl' ? 'pl' : 'en';
    const words = {
      pl: {all:'WSZYSTKIE',done:'UKOŃCZONE',active:'AKTUALNE',planned:'PLANOWANE',jump:'IDŹ DO AKTUALNEGO ETAPU',overall:'POSTĘP CAŁEGO PROJEKTU',phases:'ETAPÓW',visible:'WIDOCZNE',doneShort:'UKOŃCZONE',activeShort:'AKTUALNE'},
      en: {all:'ALL PHASES',done:'COMPLETED',active:'IN PROGRESS',planned:'PLANNED',jump:'JUMP TO CURRENT PHASE',overall:'OVERALL PROJECT PROGRESS',phases:'PHASES',visible:'VISIBLE',doneShort:'COMPLETED',activeShort:'IN PROGRESS'}
    };
    const statusFor = card => card.classList.contains('completed-phase') ? 'done' : card.classList.contains('active-phase') ? 'active' : 'planned';

    function updateToggleLabel(button) {
      const open = button.getAttribute('aria-expanded') === 'true';
      const pl = language() === 'pl';
      button.innerHTML = `<span>${open ? '−' : '+'}</span><span>${pl ? (open ? 'ZWIŃ' : 'SZCZEGÓŁY') : (open ? 'COLLAPSE' : 'DETAILS')}</span>`;
      button.setAttribute('aria-label', pl ? (open ? 'Zwiń szczegóły etapu' : 'Pokaż szczegóły etapu') : (open ? 'Collapse phase details' : 'Show phase details'));
    }
    function renderSummary() {
      const w = words[language()];
      const done = cards.filter(card => statusFor(card) === 'done').length;
      const active = cards.filter(card => statusFor(card) === 'active').length;
      const visible = cards.filter(card => !card.hidden).length;
      summary.innerHTML = `<span><b>${cards.length}</b> ${w.phases}</span><span><b>${done}</b> ${w.doneShort}</span><span><b>${active}</b> ${w.activeShort}</span><span><b>${visible}</b> ${w.visible}</span>`;
    }
    function renderLabels() {
      const w = words[language()];
      filtersRoot.innerHTML = '';
      [['all',w.all],['done',w.done],['active',w.active],['planned',w.planned]].forEach(([key,label]) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'roadmap-filter'; button.dataset.filter = key; button.textContent = label;
        button.classList.toggle('is-active', key === selectedFilter);
        button.setAttribute('aria-pressed', String(key === selectedFilter));
        filtersRoot.append(button);
      });
      filtersRoot.setAttribute('aria-label', language() === 'pl' ? 'Filtry roadmapy' : 'Roadmap filters');
      $('.roadmap-jump-label', tools).textContent = w.jump;
      $$('.phase-toggle', container).forEach(updateToggleLabel);
      renderSummary();
    }
    const updateLine = () => {
      const rect = container.getBoundingClientRect();
      const visibleProgress = (window.innerHeight * 0.72 - rect.top) / Math.max(1, rect.height);
      timelineLine.style.height = `${Math.max(0, Math.min(1, visibleProgress)) * 100}%`;
    };
    function applyFilter() {
      cards.forEach(card => { card.hidden = selectedFilter !== 'all' && statusFor(card) !== selectedFilter; });
      $$('.roadmap-filter', filtersRoot).forEach(button => {
        const active = button.dataset.filter === selectedFilter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      renderSummary(); updateLine();
    }

    cards.forEach(card => {
      const header = $('.phase-header-row', card);
      const description = $('.phase-desc', card);
      const tasks = $('.phase-tasks-list', card);
      if (!header) return;
      if (description) description.id = `phase-${card.dataset.phase}-description`;
      if (tasks) tasks.id = `phase-${card.dataset.phase}-tasks`;
      const expanded = card.classList.contains('active-phase');
      if (description) description.hidden = !expanded;
      if (tasks) tasks.hidden = !expanded;
      card.classList.toggle('is-expanded', expanded);
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'phase-toggle'; toggle.dataset.phaseToggle = '';
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-controls', [description?.id, tasks?.id].filter(Boolean).join(' '));
      header.append(toggle); updateToggleLabel(toggle);
      if (!prefersReducedMotion) {
        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
          card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
        }, { passive: true });
        card.addEventListener('pointerleave', () => {
          card.style.removeProperty('--pointer-x'); card.style.removeProperty('--pointer-y');
        }, { passive: true });
      }
    });

    filtersRoot.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      selectedFilter = button.dataset.filter; applyFilter();
    });
    container.addEventListener('click', event => {
      const button = event.target.closest('[data-phase-toggle]');
      if (!button) return;
      const card = button.closest('[data-phase]');
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      card.classList.toggle('is-expanded', open);
      const description = $('.phase-desc', card); const tasks = $('.phase-tasks-list', card);
      if (description) description.hidden = !open;
      if (tasks) tasks.hidden = !open;
      updateToggleLabel(button); renderSummary(); updateLine();
    });
    jump.addEventListener('click', () => {
      const current = cards.find(card => statusFor(card) === 'active') || cards[0];
      if (!current) return;
      if (current.hidden) { selectedFilter = 'all'; applyFilter(); }
      const toggle = $('[data-phase-toggle]', current);
      if (toggle && toggle.getAttribute('aria-expanded') !== 'true') toggle.click();
      current.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    });
    new MutationObserver(renderLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const statusObserver = new MutationObserver(() => selectedFilter === 'all' ? renderSummary() : applyFilter());
    cards.forEach(card => statusObserver.observe(card, { attributes: true, attributeFilter: ['class'] }));
    window.addEventListener('scroll', updateLine, { passive: true });
    window.addEventListener('resize', updateLine, { passive: true });
    container.classList.add('roadmap-enhanced');
    renderLabels(); applyFilter();
  }
  /* ----------------------------------------------------------------------
     Scroll reveals. If the browser lacks IntersectionObserver, show content.
     ---------------------------------------------------------------------- */
  function initRevealAnimations() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -42px 0px' });
    items.forEach(item => observer.observe(item));
  }

  /* ----------------------------------------------------------------------
     Desktop-only lightweight card tilt. Never captures clicks or selection.
     ---------------------------------------------------------------------- */
  function initTiltCards() {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.tilt, .tilt-sub').forEach(card => {
      let frame = 0;
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          card.style.setProperty('--pointer-x', `${x * 100}%`);
          card.style.setProperty('--pointer-y', `${y * 100}%`);
          if (card.matches(':hover')) {
            card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 2.8}deg) rotateY(${(x - 0.5) * 3.2}deg) translateY(-2px)`;
          }
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        card.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------------------
     Ambient canvas: slow technical particles and connecting lines.
     ---------------------------------------------------------------------- */
  function initAmbientCanvas() {
    const canvas = $('#bg-canvas');
    if (!canvas || prefersReducedMotion) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    let width = 0, height = 0, particles = [], raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(58, Math.max(20, Math.round(width / 26)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        radius: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.3 + 0.08
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        const dxp = particle.x - pointer.x;
        const dyp = particle.y - pointer.y;
        const pointerDistance = Math.sqrt(dxp * dxp + dyp * dyp);
        if (pointerDistance < 150 && pointerDistance > 0) {
          particle.x += (dxp / pointerDistance) * 0.04;
          particle.y += (dyp / pointerDistance) * 0.04;
        }

        context.beginPath();
        context.fillStyle = `rgba(205, 205, 205, ${particle.alpha * 0.28})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();

        for (let next = index + 1; next < particles.length; next++) {
          const other = particles[next];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 115) {
            context.strokeStyle = `rgba(154, 163, 173, ${(1 - distance / 115) * 0.1})`;
            context.lineWidth = 0.6;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      });
      raf = window.requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) draw();
    });
    resize();
    draw();
  }

  function initCursorGlow() {
    const glow = $('#cursor-glow');
    if (!glow || prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    let x = -600, y = -600;
    window.addEventListener('pointermove', event => {
      x = event.clientX;
      y = event.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        glow.classList.add('on');
        raf = 0;
      });
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('on'));
  }

  /* ----------------------------------------------------------------------
     Countdown to the stated Winter 2028 target. This is a target marker,
     not a confirmed launch date; winter is represented by 21 Dec 2028.
     ---------------------------------------------------------------------- */
  function initCountdown() {
    const root = $('#countdown-timer');
    if (!root) return;
    const ids = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
    const nodes = Object.fromEntries(ids.map(part => [part, $(`#cd-${part}`)]));
    const target = new Date('2028-12-21T00:00:00');
    const progressBar = $('#cd-progress-bar');
    const progressLabel = $('#cd-progress-val');
    const start = new Date('2026-01-01T00:00:00').getTime();
    const totalDuration = target.getTime() - start;

    const update = () => {
      const now = new Date();
      const remaining = Math.max(0, target.getTime() - now.getTime());
      let cursor = new Date(now.getTime());
      const anniversary = new Date(cursor.getFullYear(), target.getMonth(), target.getDate());
      const years = Math.max(0, target.getFullYear() - cursor.getFullYear() - (now > anniversary ? 1 : 0));
      cursor.setFullYear(cursor.getFullYear() + years);
      let months = (target.getFullYear() - cursor.getFullYear()) * 12 + target.getMonth() - cursor.getMonth();
      if (cursor.getDate() > target.getDate()) months--;
      months = Math.max(0, months);
      cursor.setMonth(cursor.getMonth() + months);
      let rest = Math.max(0, target.getTime() - cursor.getTime());
      const days = Math.floor(rest / 86400000); rest %= 86400000;
      const hours = Math.floor(rest / 3600000); rest %= 3600000;
      const minutes = Math.floor(rest / 60000); rest %= 60000;
      const seconds = Math.floor(rest / 1000);
      const values = { years, months: months % 12, days, hours, minutes, seconds };
      ids.forEach(part => {
        if (!nodes[part]) return;
        const nextValue = String(values[part]).padStart(2, '0');
        if (nodes[part].textContent !== nextValue) {
          nodes[part].textContent = nextValue;
          if (!prefersReducedMotion) {
            nodes[part].classList.remove('tick');
            // Force the short digit-transition animation to restart.
            void nodes[part].offsetWidth;
            nodes[part].classList.add('tick');
          }
        }
      });
      const elapsed = Math.min(100, Math.max(0, ((now.getTime() - start) / totalDuration) * 100));
      if (progressBar) progressBar.style.width = `${elapsed.toFixed(1)}%`;
      if (progressLabel) progressLabel.textContent = `${elapsed.toFixed(1)}%`;
    };
    update();
    window.setInterval(update, 1000);
  }
  /* ----------------------------------------------------------------------
     Refined interaction layer: section tracking, hero parallax, magnetic
     controls and lightweight click feedback.
     ---------------------------------------------------------------------- */
  function initPolishedInteractions() {
    const sectionLinks = $$('.desktop-nav a[href^="#"], .mobile-nav-links a[href^="#"]');
    const sectionMap = new Map();
    sectionLinks.forEach(link => {
      const section = $(link.getAttribute('href'));
      if (section) sectionMap.set(section, link.getAttribute('href'));
    });
    if (sectionMap.size && 'IntersectionObserver' in window) {
      const visibleSections = new Map();
      const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) visibleSections.set(entry.target, entry.intersectionRatio);
          else visibleSections.delete(entry.target);
        });
        const current = [...visibleSections.entries()].sort((a, b) => b[1] - a[1])[0];
        if (!current) return;
        const hash = sectionMap.get(current[0]);
        $$('.desktop-nav a, .mobile-nav-links a').forEach(link => {
          const active = link.getAttribute('href') === hash;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }, { rootMargin: '-24% 0px -62% 0px', threshold: [0, .15, .35, .6, .85] });
      sectionMap.forEach((_, section) => navObserver.observe(section));
    }

    const hero = $('.hero-section');
    const heroArtwork = $('.hero-absolute-bg-banner', hero || document);
    if (heroArtwork && !prefersReducedMotion) {
      let frame = 0;
      let pointerX = 0;
      const updateArtwork = () => {
        const rect = hero.getBoundingClientRect();
        const y = Math.max(-38, Math.min(38, -rect.top * .055));
        heroArtwork.style.setProperty('--hero-drift-y', `${y.toFixed(1)}px`);
        heroArtwork.style.setProperty('--hero-drift-x', `${pointerX.toFixed(1)}px`);
        frame = 0;
      };
      const scheduleArtwork = () => { if (!frame) frame = requestAnimationFrame(updateArtwork); };
      window.addEventListener('scroll', scheduleArtwork, { passive: true });
      window.addEventListener('resize', scheduleArtwork, { passive: true });
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        hero.addEventListener('pointermove', event => {
          const rect = hero.getBoundingClientRect();
          pointerX = ((event.clientX - rect.left) / rect.width - .5) * 14;
          scheduleArtwork();
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { pointerX = 0; scheduleArtwork(); }, { passive: true });
      }
      updateArtwork();
    }

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!prefersReducedMotion && finePointer) {
      $$('.project-media-box, .district-visual').forEach(media => {
        let frame = 0;
        let pointerX = 50;
        let pointerY = 50;
        const paintSpotlight = () => {
          media.style.setProperty('--spotlight-x', `${pointerX.toFixed(1)}%`);
          media.style.setProperty('--spotlight-y', `${pointerY.toFixed(1)}%`);
          frame = 0;
        };
        media.addEventListener('pointermove', event => {
          const rect = media.getBoundingClientRect();
          pointerX = ((event.clientX - rect.left) / rect.width) * 100;
          pointerY = ((event.clientY - rect.top) / rect.height) * 100;
          if (!frame) frame = requestAnimationFrame(paintSpotlight);
        }, { passive: true });
        media.addEventListener('pointerleave', () => {
          pointerX = pointerY = 50;
          if (!frame) frame = requestAnimationFrame(paintSpotlight);
        }, { passive: true });
      });
    }

    if (!prefersReducedMotion && finePointer) {
      $$('.btn-brutalist, .btn-brutalist-outline, .roadmap-jump, .district-tab').forEach(control => {
        control.addEventListener('pointermove', event => {
          const rect = control.getBoundingClientRect();
          control.style.setProperty('--magnetic-x', `${((event.clientX - rect.left) / rect.width - .5) * 5}px`);
          control.style.setProperty('--magnetic-y', `${((event.clientY - rect.top) / rect.height - .5) * 5}px`);
        }, { passive: true });
        control.addEventListener('pointerleave', () => {
          control.style.removeProperty('--magnetic-x');
          control.style.removeProperty('--magnetic-y');
        }, { passive: true });
      });
    }

    // Keep click feedback available to touch and keyboard users too. The
    // decorative ripple is omitted when the visitor requests reduced motion.
    if (!prefersReducedMotion) {
      document.addEventListener('click', event => {
        const control = event.target.closest('.btn-brutalist, .btn-brutalist-outline, .district-tab, .roadmap-filter, .roadmap-jump, .phase-toggle');
        if (!control || control.disabled) return;
        if (event.target.closest('.tap-wave')) return;
        const rect = control.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.7;
        const hasPointerPosition = event.detail !== 0 && Number.isFinite(event.clientX) && Number.isFinite(event.clientY);
        const x = hasPointerPosition ? event.clientX - rect.left : rect.width / 2;
        const y = hasPointerPosition ? event.clientY - rect.top : rect.height / 2;
        const wave = document.createElement('span');
        wave.className = 'tap-wave';
        wave.setAttribute('aria-hidden', 'true');
        wave.style.width = wave.style.height = `${size}px`;
        wave.style.left = `${x - size / 2}px`;
        wave.style.top = `${y - size / 2}px`;
        control.append(wave);
        wave.addEventListener('animationend', () => wave.remove(), { once: true });
      });
    }
  }
})();






