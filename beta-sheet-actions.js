/* Registro Mental Beta — ações de sheet compactas, fechamento único e refinamentos experimentais. */
(() => {
  'use strict';

  const MOOD = {
    0:{color:'#7657FF',border:'#A994FF',text:'#FFFFFF',glow:'rgba(118,87,255,.58)'},
    1:{color:'#FF3B30',border:'#FF766D',text:'#FFFFFF',glow:'rgba(255,59,48,.48)'},
    2:{color:'#FF6A00',border:'#FFA05C',text:'#FFFFFF',glow:'rgba(255,106,0,.46)'},
    3:{color:'#FFD60A',border:'#FFF079',text:'#3A2B00',glow:'rgba(255,214,10,.44)'},
    4:{color:'#35D98B',border:'#8CF0BD',text:'#073321',glow:'rgba(53,217,139,.46)'},
    5:{color:'#53C8F3',border:'#A7E9FF',text:'#062938',glow:'rgba(83,200,243,.48)'}
  };

  function installStyles() {
    if (document.getElementById('rm-beta-sheet-actions-style')) return;
    const style = document.createElement('style');
    style.id = 'rm-beta-sheet-actions-style';
    style.textContent = `
      .sheet-close,
      .sheet-header .sheet-close,
      button.sheet-close {
        width: 52px !important;
        height: 52px !important;
        min-width: 52px !important;
      }

      .sheet-close .rm-beta-x-icon {
        width: 40px !important;
        height: 40px !important;
      }

      #form > .form-actions.rm-beta-primary-only {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      #form > .form-actions.rm-beta-primary-only > .primary-button,
      #form > .form-actions.rm-beta-primary-only > button[type="submit"] {
        width: 100% !important;
        min-width: 0 !important;
        grid-column: 1 / -1 !important;
      }

      /* -----------------------------------------------------------
         BETA — escala emocional 0–5 em cápsula progressiva.
         O 0 fica separado por representar o extremo da escala.
         ----------------------------------------------------------- */
      .rm-beta-mood-selector {
        display: grid !important;
        grid-template-columns: 62px minmax(0, 1fr) !important;
        gap: 11px !important;
        align-items: center !important;
        width: 100% !important;
        margin-top: 8px !important;
      }

      .rm-beta-mood-zero-wrap {
        width: 62px;
        height: 62px;
        display: grid;
        place-items: center;
      }

      .rm-beta-mood-selector .rm-beta-mood-zero {
        position: relative !important;
        width: 58px !important;
        height: 58px !important;
        min-width: 58px !important;
        min-height: 58px !important;
        padding: 0 !important;
        margin: 0 !important;
        border-radius: 50% !important;
        border: 1px solid rgba(169,148,255,.60) !important;
        background: rgba(118,87,255,.18) !important;
        color: #F7F5FF !important;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.06) !important;
        font-size: 19px !important;
        line-height: 1 !important;
        font-weight: 820 !important;
        isolation: isolate;
        transform: none !important;
        transition: background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .14s ease !important;
      }

      .rm-beta-mood-selector .rm-beta-mood-zero::before,
      .rm-beta-mood-selector .rm-beta-mood-zero::after {
        content: none !important;
      }

      .rm-beta-mood-selector .rm-beta-mood-zero.selected {
        background: rgba(118,87,255,.54) !important;
        border-color: #B9A9FF !important;
        color: #fff !important;
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.17),
          0 0 0 3px rgba(118,87,255,.14) !important;
      }

      html[data-visual-mode="ultra"] .rm-beta-mood-selector .rm-beta-mood-zero {
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.09),
          0 0 8px rgba(118,87,255,.15) !important;
      }

      html[data-visual-mode="ultra"] .rm-beta-mood-selector .rm-beta-mood-zero.selected {
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.20),
          0 0 8px rgba(118,87,255,.72),
          0 0 22px rgba(118,87,255,.48),
          0 0 38px rgba(118,87,255,.20) !important;
      }

      .rm-beta-mood-track {
        --rm-mood-color: transparent;
        --rm-mood-border: rgba(255,255,255,.28);
        --rm-mood-glow: transparent;
        --rm-fill-width: 0px;
        position: relative;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        align-items: center;
        width: 100%;
        height: 58px;
        padding: 6px;
        overflow: hidden;
        border-radius: 29px;
        border: 1px solid rgba(255,255,255,.30);
        background: rgba(255,255,255,.105);
        box-shadow: inset 0 0 0 .5px rgba(255,255,255,.08);
        isolation: isolate;
      }

      html[data-theme="light"] .rm-beta-mood-track {
        border-color: rgba(70,70,80,.22);
        background: rgba(120,120,128,.09);
        box-shadow: inset 0 0 0 .5px rgba(255,255,255,.42);
      }

      @media (prefers-color-scheme: light) {
        html[data-theme="system"] .rm-beta-mood-track {
          border-color: rgba(70,70,80,.22);
          background: rgba(120,120,128,.09);
          box-shadow: inset 0 0 0 .5px rgba(255,255,255,.42);
        }
      }

      .rm-beta-mood-fill {
        position: absolute;
        z-index: 0;
        left: 5px;
        top: 5px;
        bottom: 5px;
        width: var(--rm-fill-width);
        max-width: calc(100% - 10px);
        min-width: 0;
        border-radius: 999px;
        pointer-events: none;
        opacity: 0;
        background:
          linear-gradient(90deg,
            color-mix(in srgb, var(--rm-mood-color) 88%, white 12%),
            var(--rm-mood-color));
        border: .75px solid color-mix(in srgb, var(--rm-mood-border) 80%, white 20%);
        box-shadow: inset 0 0 0 .5px rgba(255,255,255,.14);
        transition:
          width .24s cubic-bezier(.22,.74,.24,1),
          background .18s ease,
          border-color .18s ease,
          opacity .14s ease,
          box-shadow .18s ease;
      }

      .rm-beta-mood-track.has-value .rm-beta-mood-fill {
        opacity: .94;
      }

      html[data-visual-mode="ultra"] .rm-beta-mood-track {
        border-color: rgba(255,255,255,.38);
        box-shadow:
          inset 0 0 0 .5px rgba(255,255,255,.10),
          0 0 9px rgba(255,255,255,.10);
      }

      html[data-visual-mode="ultra"] .rm-beta-mood-track.has-value .rm-beta-mood-fill {
        box-shadow:
          inset 0 0 0 .5px rgba(255,255,255,.18),
          0 0 9px var(--rm-mood-glow),
          0 0 20px color-mix(in srgb, var(--rm-mood-glow) 72%, transparent) !important;
      }

      .rm-beta-mood-track .mood-score {
        position: relative !important;
        z-index: 2 !important;
        justify-self: center !important;
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        padding: 0 !important;
        margin: 0 !important;
        border: 0 !important;
        border-radius: 50% !important;
        background: transparent !important;
        box-shadow: none !important;
        transform: none !important;
        color: var(--text, #fff) !important;
        font-size: 14px !important;
        line-height: 1 !important;
        font-weight: 800 !important;
        isolation: isolate;
        transition: transform .14s ease, color .16s ease !important;
      }

      .rm-beta-mood-track .mood-score::before {
        content: '' !important;
        position: absolute;
        z-index: -1;
        left: 50%;
        top: 50%;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: var(--mood-color);
        border: 1px solid color-mix(in srgb, var(--mood-border) 78%, white 22%);
        opacity: .92;
        box-shadow: inset 0 0 0 .5px rgba(255,255,255,.13);
        transition: width .16s ease, height .16s ease, opacity .16s ease, box-shadow .16s ease;
      }

      .rm-beta-mood-track .mood-score::after { content: none !important; }

      .rm-beta-mood-track .mood-score.selected {
        color: var(--mood-text) !important;
        transform: scale(1.035) !important;
      }

      .rm-beta-mood-track .mood-score.selected::before {
        width: 34px;
        height: 34px;
        opacity: .18;
        box-shadow: none;
      }

      .rm-beta-mood-track .mood-score:active,
      .rm-beta-mood-selector .rm-beta-mood-zero:active {
        transform: scale(.92) !important;
      }

      .rm-beta-mood-selector + #clearMoodScore,
      .rm-mood-block #clearMoodScore {
        margin-top: 7px !important;
      }

      @media (max-width: 380px) {
        .rm-beta-mood-selector {
          grid-template-columns: 56px minmax(0, 1fr) !important;
          gap: 8px !important;
        }
        .rm-beta-mood-zero-wrap { width: 56px; height: 56px; }
        .rm-beta-mood-selector .rm-beta-mood-zero {
          width: 54px !important;
          height: 54px !important;
          min-width: 54px !important;
          min-height: 54px !important;
        }
        .rm-beta-mood-track { height: 54px; border-radius: 27px; padding: 5px; }
        .rm-beta-mood-track .mood-score {
          width: 39px !important;
          height: 39px !important;
          min-width: 39px !important;
          min-height: 39px !important;
          font-size: 13px !important;
        }
        .rm-beta-mood-track .mood-score::before { width: 21px; height: 21px; }
      }

      /* Mini representação da nota emocional no cabeçalho dos cartões. */
      .rm-v28-timeline.rm-type-note .rm-card-header-main {
        gap: 5px !important;
      }

      .rm-beta-card-moodbar {
        --rm-card-fill: 0%;
        --rm-card-color: #7657FF;
        --rm-card-border: #A994FF;
        --rm-card-glow: rgba(118,87,255,.42);
        position: relative;
        display: inline-flex;
        align-items: center;
        flex: 0 0 70px;
        width: 70px;
        height: 20px;
        margin-left: 3px;
        overflow: hidden;
        border-radius: 999px;
        border: .75px solid rgba(255,255,255,.24);
        background: rgba(255,255,255,.085);
        vertical-align: middle;
      }

      .rm-beta-card-moodbar .rm-beta-card-mood-fill {
        position: absolute;
        inset: 2px auto 2px 2px;
        width: var(--rm-card-fill);
        min-width: 20px;
        max-width: calc(100% - 4px);
        border-radius: 999px;
        background: var(--rm-card-color);
        border: .5px solid var(--rm-card-border);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 5px;
        color: var(--rm-card-text, #fff);
        font-size: 10px;
        line-height: 1;
        font-weight: 850;
      }

      .rm-beta-card-moodbar.is-zero {
        flex-basis: 20px;
        width: 20px;
        border-color: rgba(169,148,255,.54);
        background: rgba(118,87,255,.20);
      }

      .rm-beta-card-moodbar.is-zero .rm-beta-card-mood-fill {
        inset: 2px;
        width: auto;
        min-width: 0;
        padding: 0;
        justify-content: center;
        background: #7657FF;
        border-color: #A994FF;
      }

      html[data-visual-mode="ultra"] .rm-beta-card-moodbar .rm-beta-card-mood-fill {
        box-shadow: 0 0 7px var(--rm-card-glow);
      }
    `;
    document.head.appendChild(style);
  }

  function enlargeCloseIcon() {
    document.querySelectorAll('.sheet-close').forEach(button => {
      button.dataset.rmBetaSimpleX = '1';
      if (button.dataset.rmBetaLargeX === '1') return;
      button.dataset.rmBetaLargeX = '1';
      button.innerHTML = `
        <svg class="rm-beta-x-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M4.5 4.5L27.5 27.5M27.5 4.5L4.5 27.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.8"
            stroke-linecap="round" />
        </svg>`;
    });
  }

  function removeRedundantSheetCancels() {
    const form = document.getElementById('form');
    if (!form || !form.closest('.sheet')?.querySelector('.sheet-close')) return;

    form.querySelectorAll(':scope > .form-actions').forEach(actions => {
      const directButtons = [...actions.children].filter(el => el.tagName === 'BUTTON');
      const cancel = directButtons.find(button =>
        button.hasAttribute('data-cancel') || /^cancelar$/i.test(button.textContent.trim())
      );
      if (!cancel) return;

      cancel.remove();
      actions.classList.add('rm-beta-primary-only');
    });

    [...form.children].forEach(child => {
      if (child.tagName !== 'BUTTON') return;
      if (!child.hasAttribute('data-cancel')) return;
      if (!/^(cancelar|fechar)$/i.test(child.textContent.trim())) return;
      child.remove();
    });
  }

  function removeIconSizeDescription() {
    const control = document.getElementById('iconSizeControl');
    const description = control?.closest('.setting-block')?.querySelector('.setting-label small');
    description?.remove();
  }

  function moodColor(score) {
    return MOOD[Math.max(0, Math.min(5, Number(score) || 0))] || MOOD[0];
  }

  function updateMoodProgress(selector) {
    if (!selector) return;
    const zero = selector.querySelector('[data-mood-score="0"]');
    const track = selector.querySelector('.rm-beta-mood-track');
    const selected = selector.querySelector('[data-mood-score].selected');
    const value = selected ? Number(selected.dataset.moodScore) : null;

    zero?.classList.toggle('selected', value === 0);
    if (!track) return;

    if (value == null || value === 0) {
      track.classList.remove('has-value');
      track.style.setProperty('--rm-fill-width', '0px');
      return;
    }

    const color = moodColor(value);
    const pctToCenter = ((value - 0.5) / 5) * 100;
    track.style.setProperty('--rm-mood-color', color.color);
    track.style.setProperty('--rm-mood-border', color.border);
    track.style.setProperty('--rm-mood-glow', color.glow);
    /* A ponta circular termina depois do centro do ponto escolhido,
       fazendo o próprio end-cap envolver o marcador com margem uniforme. */
    track.style.setProperty('--rm-fill-width', `calc(${pctToCenter}% + 18px)`);
    track.classList.add('has-value');
  }

  function refineMoodSelector() {
    const scale = document.querySelector('.rm-mood-block .mood-scale, .mood-block .mood-scale');
    if (!scale || scale.dataset.rmBetaCapsule === '1') return;

    const buttons = [...scale.querySelectorAll('[data-mood-score]')];
    if (buttons.length < 6) return;
    const zero = buttons.find(b => Number(b.dataset.moodScore) === 0);
    const oneToFive = buttons.filter(b => Number(b.dataset.moodScore) >= 1 && Number(b.dataset.moodScore) <= 5);
    if (!zero || oneToFive.length !== 5) return;

    scale.dataset.rmBetaCapsule = '1';
    scale.classList.add('rm-beta-mood-selector');

    const zeroWrap = document.createElement('div');
    zeroWrap.className = 'rm-beta-mood-zero-wrap';
    zero.classList.add('rm-beta-mood-zero');
    zeroWrap.appendChild(zero);

    const track = document.createElement('div');
    track.className = 'rm-beta-mood-track';
    const fill = document.createElement('span');
    fill.className = 'rm-beta-mood-fill';
    fill.setAttribute('aria-hidden', 'true');
    track.appendChild(fill);
    oneToFive.forEach(button => track.appendChild(button));

    scale.replaceChildren(zeroWrap, track);

    const refresh = () => requestAnimationFrame(() => updateMoodProgress(scale));
    buttons.forEach(button => button.addEventListener('click', refresh));
    document.getElementById('clearMoodScore')?.addEventListener('click', refresh);

    const observer = new MutationObserver(() => updateMoodProgress(scale));
    observer.observe(scale, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    updateMoodProgress(scale);
  }

  function installNoteCardMoodBarPatch() {
    const original = window.eventCard;
    if (typeof original !== 'function') return false;
    if (original.__rmBetaMoodCapsuleCard) return true;

    const wrapped = function(event, ...rest) {
      const html = original.call(this, event, ...rest);
      if (!event || event.type !== 'note' || event.moodScore == null) return html;

      const score = Math.max(0, Math.min(5, Number(event.moodScore)));
      if (!Number.isFinite(score)) return html;
      const color = moodColor(score);

      const template = document.createElement('template');
      template.innerHTML = String(html).trim();
      const card = template.content.firstElementChild;
      if (!card) return html;

      const header = card.querySelector('.rm-card-header-main');
      if (!header) return html;

      card.querySelector('.rm-beta-card-moodbar')?.remove();
      const oldMood = card.querySelector('.rm-beta-header-mood, .rm-mini-mood');
      oldMood?.remove();
      const meta = card.querySelector('.rm-meta-badges');
      if (meta && !meta.children.length && !meta.textContent.trim()) meta.remove();

      const mini = document.createElement('span');
      mini.className = `rm-beta-card-moodbar${score === 0 ? ' is-zero' : ''}`;
      mini.setAttribute('aria-label', `Estado emocional ${score} de 5`);
      mini.style.setProperty('--rm-card-fill', score === 0 ? '100%' : `${score * 20}%`);
      mini.style.setProperty('--rm-card-color', color.color);
      mini.style.setProperty('--rm-card-border', color.border);
      mini.style.setProperty('--rm-card-glow', color.glow);
      mini.style.setProperty('--rm-card-text', color.text);
      mini.innerHTML = `<span class="rm-beta-card-mood-fill"><b>${score}</b></span>`;
      header.appendChild(mini);

      return card.outerHTML;
    };

    wrapped.__rmBetaMoodCapsuleCard = true;
    wrapped.__rmBetaMoodCapsuleOriginal = original;
    window.eventCard = wrapped;

    queueMicrotask(() => {
      try { if (typeof window.renderAll === 'function') window.renderAll(); } catch (_) {}
    });
    return true;
  }

  function apply() {
    installStyles();
    enlargeCloseIcon();
    removeRedundantSheetCancels();
    removeIconSizeDescription();
    refineMoodSelector();
  }

  function observeSheetForm() {
    const form = document.getElementById('form');
    if (!form || form.dataset.rmBetaSheetActionsObserved === '1') return;
    form.dataset.rmBetaSheetActionsObserved = '1';

    new MutationObserver(() => {
      queueMicrotask(apply);
    }).observe(form, { childList: true });
  }

  apply();
  observeSheetForm();

  let installAttempts = 0;
  const installer = setInterval(() => {
    installAttempts += 1;
    apply();
    const cardReady = installNoteCardMoodBarPatch();
    if (cardReady || installAttempts >= 160) clearInterval(installer);
  }, 75);

  document.addEventListener('DOMContentLoaded', () => {
    apply();
    observeSheetForm();
    installNoteCardMoodBarPatch();
  }, { once: true });

  document.addEventListener('registro:release-ready', () => {
    apply();
    observeSheetForm();
    installNoteCardMoodBarPatch();
  });
})();
