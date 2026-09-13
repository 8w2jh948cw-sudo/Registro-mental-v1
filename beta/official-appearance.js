/* Registro Mental Oficial 1.2.0-beta.25 — aparência segura, paleta fixa e últimos registros. */
(() => {
  'use strict';

  const RELEASE = '1.2.0-beta.25';
  const SETTINGS_KEY = 'registro-beta-settings-v1';
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
      ['accent','palette','paleta','colorPalette','colourPalette','visualPalette','themePalette','semanticPalette'].forEach(key => {
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
    delete html.dataset.accent;
    delete html.dataset.semanticPalette;
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

      #historyFilters.filter-scroll{
        /* Espaço interno para o halo: as margens compensam a altura e não deslocam a página. */
        overflow-x:auto!important;
        overflow-y:hidden!important;
        padding-top:42px!important;
        padding-bottom:42px!important;
        margin-top:-42px!important;
        margin-bottom:-42px!important;
        scroll-padding-inline:4px
      }
      #historyFilters .filter-chip{position:relative!important}

      #homeTimeline .timeline-item{grid-template-columns:68px minmax(0,1fr) 28px}
      #homeTimeline .rm-home-recent-day{display:block;color:var(--secondary);font-size:10px;font-weight:750;line-height:1.15;white-space:nowrap}
      #homeTimeline .rm-home-recent-hour{display:block;margin-top:3px;color:var(--secondary);font-size:11px;line-height:1.15;font-variant-numeric:tabular-nums}

      /* Fundo único: todas as telas usam exatamente o mesmo fundo da tela Início. */
      html,body,.app-shell,#content,.content,.view,.view.active{
        background:var(--bg)!important;
      }

      /* Filtros do Histórico: sem sombra no modo Otimizado; glow temático apenas no Ultra. */
      #historyFilters .filter-chip{
        box-shadow:none!important;
      }
      #historyFilters .filter-chip[data-filter="all"]{--rm-filter-tone:var(--accent)}
      #historyFilters .filter-chip[data-filter="note"]{--rm-filter-tone:var(--record-note)}
      #historyFilters .filter-chip[data-filter="medication"]{--rm-filter-tone:var(--record-med)}
      #historyFilters .filter-chip[data-filter="sleep"]{--rm-filter-tone:var(--record-sleep)}
      #historyFilters .filter-chip[data-filter="purchase"]{--rm-filter-tone:var(--record-buy)}
      /* Ícone e texto usam sempre a mesma cor, inclusive nos temas claro e escuro. */
      #historyFilters .rm-filter-icon,
      #historyFilters .rm-filter-icon svg{
        color:inherit!important;
      }
      /* Ícones dos filtros: 30% maiores; tipografia e espaçamento do texto não mudam. */
      #historyFilters .rm-filter-icon{
        width:22.1px!important;
        height:22.1px!important;
        flex:0 0 22.1px!important;
      }
      #historyFilters .rm-filter-icon svg{
        width:20.8px!important;
        height:20.8px!important;
      }

      html[data-visual-mode="ultra"] #historyFilters .filter-chip.selected{
        background:var(--rm-filter-tone,var(--accent))!important;
        color:#fff!important;
        box-shadow:
          0 0 0 1.5px color-mix(in srgb,var(--rm-filter-tone,var(--accent)) 88%,transparent),
          0 0 14px 1px color-mix(in srgb,var(--rm-filter-tone,var(--accent)) 82%,transparent),
          0 0 30px 5px color-mix(in srgb,var(--rm-filter-tone,var(--accent)) 58%,transparent)!important;
      }

      /* Nunca esconder html/body por atributos de aparência. */
      #accentControl,.accent-options,#semanticPaletteControl,
      button[data-accent],button[data-semantic-palette],
      .setting-block:has(#accentControl),.setting-block:has(#semanticPaletteControl),
      .semantic-palette-swatches,.semantic-palette-note{display:none!important}
    `;
  }

  function localDayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function compactRecentDay(timestamp) {
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime())) return '';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const key = localDayKey(date);
    if (key === localDayKey(today)) return 'Hoje';
    if (key === localDayKey(yesterday)) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }).replace('.', '');
  }

  async function renderLastSix(events) {
    const box = document.getElementById('homeTimeline');
    if (!box || typeof window.eventCard !== 'function') return;

    const recent = (Array.isArray(events) ? events : [])
      .slice()
      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0,6);

    box.innerHTML = recent.map(event => window.eventCard(event)).join('');
    const cards = [...box.querySelectorAll('.timeline-item')];
    cards.forEach((card,index) => {
      const event = recent[index];
      const time = card.querySelector('.timeline-time');
      if (!event || !time) return;
      const date = new Date(event.timestamp);
      const hour = Number.isFinite(date.getTime())
        ? date.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
        : '';
      time.innerHTML = `<span class="rm-home-recent-day">${compactRecentDay(event.timestamp)}</span><span class="rm-home-recent-hour">${hour}</span>`;
    });

    const empty = document.getElementById('homeEmpty');
    if (empty) {
      empty.textContent = 'Nenhum registro ainda.';
      empty.classList.toggle('hidden', recent.length > 0);
    }

    if (typeof window.hydrateAudio === 'function') await window.hydrateAudio(box);
  }

  function installRecentSixBehavior() {
    const current = window.renderHome;
    if (typeof current !== 'function' || current.__rmRecentSix === true) return;

    const wrapped = async function(events) {
      await current.apply(this, arguments);
      try { await renderLastSix(events); }
      catch (error) { console.warn('Registro Oficial: últimos registros não bloquearam a tela', error); }
    };
    wrapped.__rmRecentSix = true;
    wrapped.__rmRecentSixBase = current;
    window.renderHome = wrapped;

    if (typeof window.allEvents === 'function') {
      Promise.resolve(window.allEvents()).then(renderLastSix).catch(() => {});
    }
  }

  function applyAll() {
    paintRelease();
    normalizeSettings();
    installStyles();
    applyColors();
    installRecentSixBehavior();
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

/* Integração aditiva da barra emocional aprovada. Falha deste módulo nunca bloqueia a Oficial. */
(() => {
  try {
    if (document.querySelector('script[data-rm-mood-v2]')) return;
    const script = document.createElement('script');
    script.dataset.rmMoodV2 = '1';
    script.src = `./mood-bar-v2.js?v=1.2.0-beta.25&load=${Date.now()}`;
    script.async = true;
    script.onerror = () => console.warn('Registro Oficial: barra emocional 0–10 não carregou; interface estável mantida.');
    document.head.appendChild(script);
  } catch (error) {
    console.warn('Registro Oficial: integração emocional não bloqueante', error);
  }
})();
