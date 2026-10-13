/* Synchronous pre-paint bridge; generated config is the sole storage-key owner. */
(() => {
  const config = window.ArtanPreferenceConfig;
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const remove = key => { try { localStorage.removeItem(key); } catch { /* Optional storage. */ } };
  const choice = () => {
    try {
      const record = JSON.parse(read(config.choiceKey));
      return record?.version === config.version && Date.now() - record.time < config.validDays * 86400000 && ['allow','reject'].includes(record.value) ? record.value : null;
    } catch { return null; }
  };
  window.ArtanPreferences = Object.freeze({
    choice,
    theme: () => choice() === 'allow' && read(config.themeKey) === 'dark' ? 'dark' : 'light',
    saveTheme: value => { if (choice() === 'allow') { try { localStorage.setItem(config.themeKey,value); } catch { /* Optional storage. */ } } },
    introSeen: () => choice() !== null,
    markIntro: () => { if (choice() === 'allow') { try { localStorage.setItem(config.introKey,'1'); } catch { /* Optional storage. */ } } },
    setChoice: value => {
      if (!['allow','reject'].includes(value)) return;
      try { localStorage.setItem(config.choiceKey,JSON.stringify({value,time:Date.now(),version:config.version})); } catch { /* Browsing never depends on consent storage. */ }
      if (value === 'reject') { remove(config.themeKey); remove(config.introKey); }
      window.dispatchEvent(new Event('preferences:changed'));
    }
  });
})();
