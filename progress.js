/*
 * Studio elapsed-time label.
 * The uploaded source did not include the studio start date, so this avoids
 * inventing one or presenting elapsed studio time as game completion.
 * Set data-studio-start on the body to an ISO date (YYYY-MM-DD) when verified.
 */
(() => {
  const value = document.getElementById('cd-progress-val');
  if (!value) return;
  const raw = document.body.dataset.studioStart;
  const lang = () => document.documentElement.lang === 'pl' ? 'pl' : 'en';
  const copy = {
    en: { missing: 'START DATE NOT PROVIDED', invalid: 'START DATE NOT VERIFIED', elapsed: days => `${days} DAYS ELAPSED` },
    pl: { missing: 'NIE PODANO DATY STARTU', invalid: 'DATA STARTU NIEPOTWIERDZONA', elapsed: days => `${days} DNI MINĘŁO` }
  };
  function render() {
    const t = copy[lang()];
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) { value.textContent = t.missing; return; }
    const start = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(start.getTime()) || start > new Date()) { value.textContent = t.invalid; return; }
    value.textContent = t.elapsed(Math.floor((Date.now() - start.getTime()) / 86400000));
  }
  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
