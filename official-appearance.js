/* Registro Mental Oficial 1.1.5 — aparência consolidada após validação da Beta. */
(() => {
  'use strict';

  const RELEASE = '1.1.5';
  const SETTINGS_KEY = 'registro-settings-v2';

  /* Cor principal geral do app: permanece o roxo aprovado. */
  const FIXED_ACCENT = '#7259D6';
  const FIXED_ACCENT_SOFT = '#EEEAFF';
  const FIXED_ACCENT_STRONG = '#533AB7';
  const FIXED_ACCENT_SOFT_DARK = '#2D2741';
  const FIXED_ACCENT_STRONG_DARK = '#C9BFFF';

  /* Única paleta semântica oficial — antiga opção "Sua paleta" da Beta. */
  const RECORD_NOTE = '#0188FE';
  const RECORD_MED = '#00C0E7';
  const RECORD_SLEEP = '#6155F4';
  const RECORD_BUY = '#FF4900';

  const normalize = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  function paintRelease() {
    window.REGISTRO_V1_RELEASE = RELEASE;
    window.REGISTRO_EXPECTED_RELEASE = RELEASE;
    window.REGISTRO_CURRENT_RELEASE = RELEASE;
    const top = document.getElementById('topVersion');
    const about = document.getElementById('versionLabel');
    if (top) top.textContent = `v${RELEASE}`;
    if (about) about.textContent = RELEASE;
    let style = document.getElementById('rm-official-release-current');
    if (!style) {
      style = document.createElement('style');
      style.id = 'rm-official-release-current';
      document.head.appendChild(style);
    }
    style.textContent = `#topVersion::after{content:"v${RELEASE}"!important}#versionLabel::after{content:"${RELEASE}"!important}`;
  }

  function cleanPersistedAppearance() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const settings = JSON.parse(raw);
      let changed = false;
      [
        'accent', 'palette', 'paleta', 'colorPalette', 'colourPalette',
        'visualPalette', 'themePalette', 'semanticPalette'
      ].forEach(key => {
        if (Object.prototype.hasOwnProperty.call(settings, key)) {
          delete settings[key];
          changed = true;
        }
      });
      /* Os nomes das abas aparecem por padrão, mas a opção avançada pode ocultá-los. */
      if (!Object.prototype.hasOwnProperty.call(settings, 'hideTabLabels')) {
        settings.hideTabLabels = false;
        changed = true;
      }
      if (changed) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (_) {}
  }

  function installFixedPalette() {
    const html = document.documentElement;
    html.removeAttribute('data-accent');
    html.dataset.semanticPalette = 'user';

    html.style.setProperty('--accent', FIXED_ACCENT, 'important');
    html.style.setProperty('--accent-soft', FIXED_ACCENT_SOFT, 'important');
    html.style.setProperty('--accent-strong', FIXED_ACCENT_STRONG, 'important');
    html.style.setProperty('--record-note', RECORD_NOTE, 'important');
    html.style.setProperty('--record-med', RECORD_MED, 'important');
    html.style.setProperty('--record-sleep', RECORD_SLEEP, 'important');
    html.style.setProperty('--record-buy', RECORD_BUY, 'important');
    html.style.setProperty('--note', RECORD_NOTE, 'important');
    html.style.setProperty('--med', RECORD_MED, 'important');
    html.style.setProperty('--sleep', RECORD_SLEEP, 'important');
    html.style.setProperty('--buy', RECORD_BUY, 'important');

    let style = document.getElementById('rm-official-fixed-palette');
    if (!style) {
      style = document.createElement('style');
      style.id = 'rm-official-fixed-palette';
      document.head.appendChild(style);
    }

    style.textContent = `
      :root,html,html[data-theme="light"],html[data-theme="system"]{
        --accent:${FIXED_ACCENT}!important;
        --accent-soft:${FIXED_ACCENT_SOFT}!important;
        --accent-strong:${FIXED_ACCENT_STRONG}!important;
        --record-note:${RECORD_NOTE}!important;
        --record-med:${RECORD_MED}!important;
        --record-sleep:${RECORD_SLEEP}!important;
        --record-buy:${RECORD_BUY}!important;
        --note:${RECORD_NOTE}!important;
        --med:${RECORD_MED}!important;
        --sleep:${RECORD_SLEEP}!important;
        --buy:${RECORD_BUY}!important;
      }
      html[data-theme="dark"]{
        --accent:${FIXED_ACCENT}!important;
        --accent-soft:${FIXED_ACCENT_SOFT_DARK}!important;
        --accent-strong:${FIXED_ACCENT_STRONG_DARK}!important;
        --record-note:${RECORD_NOTE}!important;
        --record-med:${RECORD_MED}!important;
        --record-sleep:${RECORD_SLEEP}!important;
        --record-buy:${RECORD_BUY}!important;
        --note:${RECORD_NOTE}!important;
        --med:${RECORD_MED}!important;
        --sleep:${RECORD_SLEEP}!important;
        --buy:${RECORD_BUY}!important;
      }
      @media(prefers-color-scheme:dark){html[data-theme="system"]{
        --accent:${FIXED_ACCENT}!important;
        --accent-soft:${FIXED_ACCENT_SOFT_DARK}!important;
        --accent-strong:${FIXED_ACCENT_STRONG_DARK}!important;
        --record-note:${RECORD_NOTE}!important;
        --record-med:${RECORD_MED}!important;
        --record-sleep:${RECORD_SLEEP}!important;
        --record-buy:${RECORD_BUY}!important;
        --note:${RECORD_NOTE}!important;
        --med:${RECORD_MED}!important;
        --sleep:${RECORD_SLEEP}!important;
        --buy:${RECORD_BUY}!important;
      }}

      /* Identidade fixa dos quatro tipos de registro. */
      [data-icon="note"]{color:var(--record-note)!important}
      [data-icon="pill"]{color:var(--record-med)!important}
      [data-icon="moon"]{color:var(--record-sleep)!important}
      [data-icon="bag"]{color:var(--record-buy)!important}
      .compact-summary-list .summary-row:nth-child(1) .summary-row-icon{color:var(--record-note)!important}
      .compact-summary-list .summary-row:nth-child(2) .summary-row-icon{color:var(--record-med)!important}
      .compact-summary-list .summary-row:nth-child(3) .summary-row-icon{color:var(--record-sleep)!important}
      .compact-summary-list .summary-row:nth-child(4) .summary-row-icon{color:var(--record-buy)!important}
      .kind-note{color:var(--record-note)!important}
      .kind-medication{color:var(--record-med)!important}
      .kind-sleep{color:var(--record-sleep)!important}
      .kind-purchase{color:var(--record-buy)!important}
      .primary-action{--rm-card-accent:var(--record-note)!important}
      .primary-action .action-icon,.primary-action strong{color:var(--record-note)!important}
      .med-action{--rm-card-accent:var(--record-med)!important}
      .med-action .action-icon{color:var(--record-med)!important}
      .sleep-action{--rm-card-accent:var(--record-sleep)!important}
      .sleep-action .action-icon{color:var(--record-sleep)!important}
      .buy-action{--rm-card-accent:var(--record-buy)!important}
      .buy-action .action-icon{color:var(--record-buy)!important}

      /* Barra inferior: contraste alto e texto pequeno por padrão. */
      .tab-bar,.capsule-tabbar{
        background:color-mix(in srgb,var(--surface) 94%,transparent)!important;
        border-color:color-mix(in srgb,var(--separator) 88%,var(--surface))!important;
        backdrop-filter:blur(24px) saturate(145%)!important;
        -webkit-backdrop-filter:blur(24px) saturate(145%)!important
      }
      .tab-item{opacity:1!important}
      .tab-item:not(.selected){color:var(--secondary)!important}
      html:not([data-hide-tab-labels="true"]) .tab-item small,
      html:not([data-hide-tab-labels="true"]) .tab-item .tab-label{
        display:block!important;visibility:visible!important;opacity:.92!important;
        font-size:8px!important;line-height:1.05!important
      }
      html[data-hide-tab-labels="true"] .tab-item small,
      html[data-hide-tab-labels="true"] .tab-item .tab-label{display:none!important}
      html:not([data-theme="dark"]) .tab-item.selected{color:#17171A!important}
      html[data-theme="light"] .tab-item.selected{color:#17171A!important}
      html[data-theme="dark"] .tab-item.selected{color:#F2F2F4!important}
      @media(prefers-color-scheme:dark){html[data-theme="system"] .tab-item.selected{color:#F2F2F4!important}}

      /* Os filtros do Histórico reservam área para a sombra sem corte vertical. */
      #historyFilters.filter-scroll{
        overflow-x:auto!important;overflow-y:visible!important;
        padding-top:8px!important;padding-bottom:10px!important;
        margin-top:-8px!important;margin-bottom:-10px!important;scroll-padding-inline:4px
      }
      #historyFilters .filter-chip{position:relative!important}

      /* Não há seletores de cor/paleta na versão Oficial. */
      #accentControl,.accent-options,#semanticPaletteControl,
      [data-accent],[data-semantic-palette],[data-palette-control],[data-color-palette],
      .semantic-palette-swatches,.semantic-palette-note{display:none!important}
    `;
  }

  function removeChoiceBlock(control) {
    const block = control?.closest('.setting-block,.setting-inline,.settings-row');
    if (!block) return;
    const next = block.nextElementSibling;
    const prev = block.previousElementSibling;
    if (next?.classList.contains('setting-separator')) next.remove();
    else if (prev?.classList.contains('setting-separator')) prev.remove();
    block.remove();
  }

  function removeLegacyAppearanceChoices() {
    removeChoiceBlock(document.getElementById('accentControl'));
    removeChoiceBlock(document.getElementById('semanticPaletteControl'));

    document.querySelectorAll('.view[data-view="settings"] .setting-block,.view[data-view="settings"] .setting-inline,.view[data-view="settings"] .settings-row').forEach(block => {
      const text = normalize(block.textContent || '');
      if (
        text.includes('cor principal') ||
        text.includes('cores dos registros') ||
        text.includes('paleta sugerida') ||
        text.includes('sua paleta') ||
        text.includes('paleta de cores') ||
        text.startsWith('paleta')
      ) removeChoiceBlock(block);
    });

    document.querySelectorAll('[data-accent],[data-semantic-palette],.accent-options,[data-palette-control],[data-color-palette]').forEach(node => {
      const block = node.closest('.setting-block,.setting-inline,.settings-row');
      if (block) removeChoiceBlock(block);
      else node.remove();
    });
  }

  function lockRuntimeAppearance() {
    const html = document.documentElement;
    html.removeAttribute('data-accent');
    html.dataset.semanticPalette = 'user';
    html.style.setProperty('--accent', FIXED_ACCENT, 'important');
    html.style.setProperty('--record-note', RECORD_NOTE, 'important');
    html.style.setProperty('--record-med', RECORD_MED, 'important');
    html.style.setProperty('--record-sleep', RECORD_SLEEP, 'important');
    html.style.setProperty('--record-buy', RECORD_BUY, 'important');
    html.style.setProperty('--note', RECORD_NOTE, 'important');
    html.style.setProperty('--med', RECORD_MED, 'important');
    html.style.setProperty('--sleep', RECORD_SLEEP, 'important');
    html.style.setProperty('--buy', RECORD_BUY, 'important');
  }

  function applyAll() {
    paintRelease();
    cleanPersistedAppearance();
    installFixedPalette();
    removeLegacyAppearanceChoices();
    lockRuntimeAppearance();
  }

  applyAll();
  document.addEventListener('DOMContentLoaded', applyAll, { once:true });
  window.addEventListener('registro:release-ready', applyAll);
  [0,100,250,700,1500,3000].forEach(ms => setTimeout(applyAll, ms));
  document.addEventListener('click', event => {
    if (event.target.closest('[data-tab="settings"],#homeOptionsBtn,.tab-item,[data-theme-value],#hideTabLabelsToggle')) setTimeout(applyAll,0);
  }, { passive:true });

  const paletteObserver = new MutationObserver(() => {
    const html = document.documentElement;
    if (html.dataset.semanticPalette !== 'user') lockRuntimeAppearance();
    removeLegacyAppearanceChoices();
  });
  paletteObserver.observe(document.documentElement, { attributes:true, attributeFilter:['data-semantic-palette'] });

  window.REGISTRO_OFFICIAL_APPEARANCE_READY = true;
})();
