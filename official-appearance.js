/* Registro Mental Oficial 1.1.8 — aparência segura e paleta personalizada fixa. */
(() => {
  'use strict';

  const RELEASE = '1.1.8';
  const SETTINGS_KEY = 'registro-settings-v2';
  const COLORS = {
    accent: '#7259D6',
    accentSoft: '#EEEAFF',
    accentStrong: '#533AB7',
    accentSoftDark: '#2D2741',
    accentStrongDark: '#C9BFFF',
    note: '#0188FE',
    med: '#00C0E7',
    sleep: '#6155F4',
    buy: '#FF4900'
  };

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

  function normalizeSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const settings = JSON.parse(raw);
      let changed = false;
      ['palette','paleta','colorPalette','colourPalette','visualPalette','themePalette','semanticPalette'].forEach(key => {
        if (Object.prototype.hasOwnProperty.call(settings, key)) {
          delete settings[key];
          changed = true;
        }
      });
      if (!Object.prototype.hasOwnProperty.call(settings, 'hideTabLabels')) {
        settings.hideTabLabels = false;
        changed = true;
      }
      if (changed) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (_) {}
  }

  function applyColors() {
    const html = document.documentElement;
    html.style.setProperty('--accent', COLORS.accent, 'important');
    html.style.setProperty('--record-note', COLORS.note, 'important');
    html.style.setProperty('--record-med', COLORS.med, 'important');
    html.style.setProperty('--record-sleep', COLORS.sleep, 'important');
    html.style.setProperty('--record-buy', COLORS.buy, 'important');
    html.style.setProperty('--note', COLORS.note, 'important');
    html.style.setProperty('--med', COLORS.med, 'important');
    html.style.setProperty('--sleep', COLORS.sleep, 'important');
    html.style.setProperty('--buy', COLORS.buy, 'important');
  }

  function installStyles() {
    let style = document.getElementById('rm-official-fixed-palette');
    if (!style) {
      style = document.createElement('style');
      style.id = 'rm-official-fixed-palette';
      document.head.appendChild(style);
    }
    style.textContent = `
      :root,html,html[data-theme="light"],html[data-theme="system"]{
        --accent:${COLORS.accent}!important;--accent-soft:${COLORS.accentSoft}!important;--accent-strong:${COLORS.accentStrong}!important;
        --record-note:${COLORS.note}!important;--record-med:${COLORS.med}!important;--record-sleep:${COLORS.sleep}!important;--record-buy:${COLORS.buy}!important;
        --note:${COLORS.note}!important;--med:${COLORS.med}!important;--sleep:${COLORS.sleep}!important;--buy:${COLORS.buy}!important
      }
      html[data-theme="dark"]{
        --accent:${COLORS.accent}!important;--accent-soft:${COLORS.accentSoftDark}!important;--accent-strong:${COLORS.accentStrongDark}!important;
        --record-note:${COLORS.note}!important;--record-med:${COLORS.med}!important;--record-sleep:${COLORS.sleep}!important;--record-buy:${COLORS.buy}!important;
        --note:${COLORS.note}!important;--med:${COLORS.med}!important;--sleep:${COLORS.sleep}!important;--buy:${COLORS.buy}!important
      }
      @media(prefers-color-scheme:dark){html[data-theme="system"]{--accent-soft:${COLORS.accentSoftDark}!important;--accent-strong:${COLORS.accentStrongDark}!important}}

      [data-icon="note"]{color:var(--record-note)!important}
      [data-icon="pill"]{color:var(--record-med)!important}
      [data-icon="moon"]{color:var(--record-sleep)!important}
      [data-icon="bag"]{color:var(--record-buy)!important}
      .kind-note{color:var(--record-note)!important}
      .kind-medication{color:var(--record-med)!important}
      .kind-sleep{color:var(--record-sleep)!important}
      .kind-purchase{color:var(--record-buy)!important}
      .primary-action{--rm-card-accent:var(--record-note)!important}
      .primary-action .action-icon,.primary-action strong{color:var(--record-note)!important}
      .med-action{--rm-card-accent:var(--record-med)!important}.med-action .action-icon{color:var(--record-med)!important}
      .sleep-action{--rm-card-accent:var(--record-sleep)!important}.sleep-action .action-icon{color:var(--record-sleep)!important}
      .buy-action{--rm-card-accent:var(--record-buy)!important}.buy-action .action-icon{color:var(--record-buy)!important}

      .tab-bar,.capsule-tabbar{background:color-mix(in srgb,var(--surface) 94%,transparent)!important;border-color:color-mix(in srgb,var(--separator) 88%,var(--surface))!important;backdrop-filter:blur(24px) saturate(145%)!important;-webkit-backdrop-filter:blur(24px) saturate(145%)!important}
      .tab-item{opacity:1!important}.tab-item:not(.selected){color:var(--secondary)!important}
      html:not([data-hide-tab-labels="true"]) .tab-item small,html:not([data-hide-tab-labels="true"]) .tab-item .tab-label{display:block!important;visibility:visible!important;opacity:.92!important;font-size:8px!important;line-height:1.05!important}
      html[data-hide-tab-labels="true"] .tab-item small,html[data-hide-tab-labels="true"] .tab-item .tab-label{display:none!important}
      html:not([data-theme="dark"]) .tab-item.selected{color:#17171A!important}
      html[data-theme="dark"] .tab-item.selected{color:#F2F2F4!important}
      @media(prefers-color-scheme:dark){html[data-theme="system"] .tab-item.selected{color:#F2F2F4!important}}

      #historyFilters.filter-scroll{overflow-x:auto!important;overflow-y:visible!important;padding-top:8px!important;padding-bottom:10px!important;margin-top:-8px!important;margin-bottom:-10px!important;scroll-padding-inline:4px}
      #historyFilters .filter-chip{position:relative!important}

      /* Nunca esconder html/body por atributos de aparência. */
      #accentControl,.accent-options,#semanticPaletteControl,
      button[data-accent],button[data-semantic-palette],
      .setting-block:has(#accentControl),.setting-block:has(#semanticPaletteControl),
      .semantic-palette-swatches,.semantic-palette-note{display:none!important}
    `;
  }

  function applyAll() {
    paintRelease();
    normalizeSettings();
    installStyles();
    applyColors();
  }

  try { applyAll(); } catch (error) { console.warn('Registro Oficial: aparência não bloqueante', error); }
  document.addEventListener('DOMContentLoaded', () => { try { applyAll(); } catch (_) {} }, { once:true });
  window.addEventListener('registro:release-ready', () => { try { applyAll(); } catch (_) {} });
  [100,500,1500,3000].forEach(ms => setTimeout(() => { try { applyAll(); } catch (_) {} }, ms));
  document.addEventListener('click', event => {
    if (event.target.closest('.tab-item,[data-theme-value],#hideTabLabelsToggle,#homeOptionsBtn')) {
      setTimeout(() => { try { applyAll(); } catch (_) {} }, 0);
    }
  }, { passive:true });

  window.REGISTRO_OFFICIAL_APPEARANCE_READY = true;
})();
