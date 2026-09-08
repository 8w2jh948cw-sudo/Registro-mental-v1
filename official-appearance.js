/* Registro Mental Oficial 1.1.2 — aparência consolidada após validação da Beta. */
(() => {
  'use strict';

  const RELEASE = '1.1.2';
  const SETTINGS_KEY = 'registro-settings-v2';
  const FIXED_ACCENT = '#7259d6';
  const FIXED_ACCENT_SOFT = '#eeeaff';
  const FIXED_ACCENT_STRONG = '#533ab7';
  const FIXED_ACCENT_SOFT_DARK = '#2d2741';
  const FIXED_ACCENT_STRONG_DARK = '#c9bfff';

  function normalize(value = '') {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  function paintRelease() {
    window.REGISTRO_V1_RELEASE = RELEASE;
    window.REGISTRO_EXPECTED_RELEASE = RELEASE;
    window.REGISTRO_CURRENT_RELEASE = RELEASE;
    const top = document.getElementById('topVersion');
    const about = document.getElementById('versionLabel');
    if (top) top.textContent = `v${RELEASE}`;
    if (about) about.textContent = RELEASE;
    let style = document.getElementById('rm-official-release-112');
    if (!style) {
      style = document.createElement('style');
      style.id = 'rm-official-release-112';
      style.textContent = `#topVersion::after{content:"v${RELEASE}"!important}#versionLabel::after{content:"${RELEASE}"!important}`;
      document.head.appendChild(style);
    }
  }

  function cleanPersistedAppearance() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const settings = JSON.parse(raw);
      let changed = false;
      ['accent', 'palette', 'paleta', 'colorPalette', 'colourPalette', 'visualPalette', 'themePalette'].forEach(key => {
        if (Object.prototype.hasOwnProperty.call(settings, key)) {
          delete settings[key];
          changed = true;
        }
      });
      if (changed) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (_) {}
  }

  function installFixedPalette() {
    const html = document.documentElement;
    html.removeAttribute('data-accent');
    html.style.setProperty('--accent', FIXED_ACCENT);
    html.style.setProperty('--accent-soft', FIXED_ACCENT_SOFT);
    html.style.setProperty('--accent-strong', FIXED_ACCENT_STRONG);

    if (document.getElementById('rm-official-fixed-palette')) return;
    const style = document.createElement('style');
    style.id = 'rm-official-fixed-palette';
    style.textContent = `
      :root,html,html[data-theme="light"],html[data-theme="system"] {
        --accent:${FIXED_ACCENT}!important;--accent-soft:${FIXED_ACCENT_SOFT}!important;--accent-strong:${FIXED_ACCENT_STRONG}!important;
      }
      html[data-theme="dark"] {
        --accent:${FIXED_ACCENT}!important;--accent-soft:${FIXED_ACCENT_SOFT_DARK}!important;--accent-strong:${FIXED_ACCENT_STRONG_DARK}!important;
      }
      @media (prefers-color-scheme:dark){html[data-theme="system"]{
        --accent:${FIXED_ACCENT}!important;--accent-soft:${FIXED_ACCENT_SOFT_DARK}!important;--accent-strong:${FIXED_ACCENT_STRONG_DARK}!important;
      }}
      .tab-bar,.capsule-tabbar{background:color-mix(in srgb,var(--surface) 94%,transparent)!important;border-color:color-mix(in srgb,var(--separator) 88%,var(--surface))!important;backdrop-filter:blur(24px) saturate(145%)!important;-webkit-backdrop-filter:blur(24px) saturate(145%)!important}
      .tab-item{opacity:1!important}.tab-item:not(.selected){color:var(--secondary)!important}.tab-item.selected{color:var(--accent)!important}.tab-item small{opacity:.92!important}
      #accentControl,.accent-options,[data-palette-control],[data-color-palette]{display:none!important}
    `;
    document.head.appendChild(style);
  }

  function removeChoiceBlock(control) {
    const block = control?.closest('.setting-block, .setting-inline, .settings-row');
    if (!block) return;
    const next = block.nextElementSibling;
    const prev = block.previousElementSibling;
    if (next?.classList.contains('setting-separator')) next.remove();
    else if (prev?.classList.contains('setting-separator')) prev.remove();
    block.remove();
  }

  function removeLegacyAppearanceChoices() {
    removeChoiceBlock(document.getElementById('accentControl'));
    document.querySelectorAll('.view[data-view="settings"] .setting-block,.view[data-view="settings"] .setting-inline,.view[data-view="settings"] .settings-row').forEach(block => {
      const text = normalize(block.textContent || '');
      if (text.includes('cor principal') || text.includes('paleta de cores') || text.startsWith('paleta')) removeChoiceBlock(block);
    });
    document.querySelectorAll('[data-accent],.accent-options,[data-palette-control],[data-color-palette]').forEach(node => {
      const block = node.closest('.setting-block,.setting-inline,.settings-row');
      if (block) removeChoiceBlock(block); else node.remove();
    });
  }

  function lockRuntimeAccent() {
    const html = document.documentElement;
    html.removeAttribute('data-accent');
    html.style.setProperty('--accent', FIXED_ACCENT, 'important');
  }

  function applyAll() {
    paintRelease();
    cleanPersistedAppearance();
    installFixedPalette();
    removeLegacyAppearanceChoices();
    lockRuntimeAccent();
  }

  applyAll();
  document.addEventListener('DOMContentLoaded', applyAll, { once:true });
  window.addEventListener('registro:release-ready', applyAll);
  [0,100,250,700,1500,3000].forEach(ms => setTimeout(applyAll, ms));
  document.addEventListener('click', event => {
    if (event.target.closest('[data-tab="settings"],#homeOptionsBtn')) setTimeout(applyAll,0);
  }, { passive:true });

  window.REGISTRO_OFFICIAL_APPEARANCE_READY = true;
})();
