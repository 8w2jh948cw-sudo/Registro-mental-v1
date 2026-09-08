/* Registro Mental Oficial — aparência consolidada após validação da Beta. */
(() => {
  'use strict';

  const SETTINGS_KEY = 'registro-settings-v2';
  const FIXED_ACCENT = '#7259d6';
  const FIXED_ACCENT_SOFT = '#eeeaff';
  const FIXED_ACCENT_STRONG = '#533ab7';
  const FIXED_ACCENT_SOFT_DARK = '#2d2741';
  const FIXED_ACCENT_STRONG_DARK = '#c9bfff';

  function normalize(value = '') {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function cleanPersistedAppearance() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const settings = JSON.parse(raw);
      let changed = false;

      // A cor e a paleta passam a ser parte fixa do design, não preferências do usuário.
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
      :root,
      html,
      html[data-theme="light"],
      html[data-theme="system"] {
        --accent: ${FIXED_ACCENT} !important;
        --accent-soft: ${FIXED_ACCENT_SOFT} !important;
        --accent-strong: ${FIXED_ACCENT_STRONG} !important;
      }
      html[data-theme="dark"] {
        --accent: ${FIXED_ACCENT} !important;
        --accent-soft: ${FIXED_ACCENT_SOFT_DARK} !important;
        --accent-strong: ${FIXED_ACCENT_STRONG_DARK} !important;
      }
      @media (prefers-color-scheme: dark) {
        html[data-theme="system"] {
          --accent: ${FIXED_ACCENT} !important;
          --accent-soft: ${FIXED_ACCENT_SOFT_DARK} !important;
          --accent-strong: ${FIXED_ACCENT_STRONG_DARK} !important;
        }
      }

      /* Barra inferior mais sólida para aumentar contraste de ícones e textos. */
      .tab-bar,
      .capsule-tabbar {
        background: color-mix(in srgb, var(--surface) 94%, transparent) !important;
        border-color: color-mix(in srgb, var(--separator) 88%, var(--surface)) !important;
        backdrop-filter: blur(24px) saturate(145%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(145%) !important;
      }
      .tab-item { opacity: 1 !important; }
      .tab-item:not(.selected) { color: var(--secondary) !important; }
      .tab-item.selected { color: var(--accent) !important; }
      .tab-item small { opacity: .92 !important; }
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
    // Controles conhecidos das versões anteriores.
    removeChoiceBlock(document.getElementById('accentControl'));

    // Limpeza defensiva de qualquer seletor antigo de paleta/cor que tenha outro id.
    document.querySelectorAll('.view[data-view="settings"] .setting-block, .view[data-view="settings"] .settings-row').forEach(block => {
      const label = normalize(block.querySelector('strong')?.textContent || '');
      if (label === 'cor principal' || label.includes('paleta')) removeChoiceBlock(block);
    });

    // Semântica antiga de seleção de cor não deve continuar ativa no DOM.
    document.querySelectorAll('[data-accent], .accent-options').forEach(node => {
      const block = node.closest('.setting-block');
      if (block) removeChoiceBlock(block);
      else node.remove();
    });
  }

  function lockRuntimeAccent() {
    const html = document.documentElement;
    if (html.dataset.accent) html.removeAttribute('data-accent');
    html.style.setProperty('--accent', FIXED_ACCENT);
  }

  function applyAll() {
    cleanPersistedAppearance();
    installFixedPalette();
    removeLegacyAppearanceChoices();
    lockRuntimeAccent();
  }

  applyAll();
  document.addEventListener('DOMContentLoaded', applyAll, { once: true });
  window.addEventListener('registro:release-ready', applyAll);
  [0, 200, 700, 1500].forEach(ms => setTimeout(applyAll, ms));

  document.addEventListener('click', event => {
    if (event.target.closest('[data-tab="settings"], #homeOptionsBtn')) setTimeout(applyAll, 0);
  }, { passive: true });

  window.REGISTRO_OFFICIAL_APPEARANCE_READY = true;
})();
