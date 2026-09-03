/* Registro Mental Beta — alterações experimentais entram aqui antes de promoção ao Oficial. */
(() => {
  'use strict';

  window.REGISTRO_BETA_PATCHES_READY = true;

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  function installBetaUIStyles() {
    if (document.getElementById('rm-beta-ui-refinements')) return;
    const style = document.createElement('style');
    style.id = 'rm-beta-ui-refinements';
    style.textContent = `
      /* Fechamento das sheets: somente o X, sem caixa/círculo. */
      .sheet-close,
      .sheet-header .sheet-close,
      button.sheet-close {
        width: 48px !important;
        height: 48px !important;
        min-width: 48px !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        color: var(--text) !important;
        display: grid !important;
        place-items: center !important;
      }
      .sheet-close::before,
      .sheet-close::after { content: none !important; }
      .sheet-close:active {
        transform: scale(.90);
        opacity: .62;
      }
      .sheet-close .rm-beta-x-icon {
        width: 33px !important;
        height: 33px !important;
        display: block;
        overflow: visible;
      }

      /* Cadastro de medicamentos: ação única ocupa toda a largura. */
      .registry-toolbar.rm-beta-single-action {
        display: block !important;
      }
      .registry-toolbar.rm-beta-single-action #addMedicationBtn {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
      }

      /* Um único design para cartões de registros: Histórico e Mais recentes. */
      .rm-v28-timeline .timeline-main {
        padding-left: 0 !important;
      }

      /* Anotações: cabeçalho mais coeso e conteúdo com alinhamento óptico. */
      .rm-v28-timeline.rm-type-note .rm-card-header-main {
        gap: 5px !important;
      }
      .rm-v28-timeline.rm-type-note .timeline-main {
        padding-left: 8px !important;
      }
      .rm-v28-timeline.rm-type-note .rm-card-header-main .rm-beta-header-mood {
        width: 22px !important;
        height: 22px !important;
        min-width: 22px !important;
        border-radius: 7px !important;
        margin-left: 4px !important;
        font-size: 12px !important;
        line-height: 1 !important;
        font-weight: 850 !important;
        box-shadow: 0 0 6px var(--rm-mini-glow) !important;
      }

      /* Tema: título e seletor em uma única linha mais compacta. */
      .setting-block.rm-beta-theme-row {
        display: grid !important;
        grid-template-columns: auto minmax(0, 1fr) !important;
        align-items: center !important;
        gap: 16px !important;
        padding-top: 14px !important;
        padding-bottom: 14px !important;
      }
      .rm-beta-theme-row .setting-label {
        margin: 0 !important;
        min-width: max-content !important;
      }
      .rm-beta-theme-row .setting-label small { display: none !important; }
      .rm-beta-theme-row #themeControl {
        margin: 0 !important;
        width: 100% !important;
        min-height: 42px !important;
      }
      .rm-beta-theme-row #themeControl button {
        min-height: 38px !important;
        padding-top: 7px !important;
        padding-bottom: 7px !important;
      }

      /* Efeitos visuais: descrição individual logo abaixo de cada opção. */
      #visualModeSetting.rm-beta-visual-setting,
      .setting-block.rm-beta-visual-setting {
        padding-top: 16px !important;
        padding-bottom: 16px !important;
      }
      .rm-beta-visual-setting #visualModeHelp { display: none !important; }
      .rm-beta-visual-setting #visualModeControl { margin-bottom: 8px !important; }
      .rm-beta-visual-notes {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        padding: 0 6px;
      }
      .rm-beta-visual-note {
        text-align: center;
        font-size: 11px;
        line-height: 1.28;
        color: var(--text-secondary, #8e8e93);
        opacity: .42;
        transition: opacity .18s ease, color .18s ease;
      }
      .rm-beta-visual-note.is-active {
        opacity: .95;
        color: var(--text, currentColor);
      }

      /* Registro de medicamento: a quantidade pertence às compras/estoque. */
      #doseFields.rm-beta-dose-compact {
        display: grid !important;
        grid-template-columns: minmax(0, 1.35fr) minmax(0, .65fr) !important;
        gap: 10px !important;
        align-items: end !important;
      }
      #doseFields.rm-beta-dose-compact .field-grid { display: contents !important; }
      #doseFields.rm-beta-dose-compact .field-grid > .field,
      #doseFields.rm-beta-dose-compact > .field {
        min-width: 0 !important;
        margin: 0 !important;
      }
      #doseFields.rm-beta-dose-compact label {
        font-size: 11px !important;
        line-height: 1.15 !important;
        min-height: 26px;
        display: flex;
        align-items: flex-end;
      }
      #doseFields.rm-beta-dose-compact input,
      #doseFields.rm-beta-dose-compact select {
        width: 100% !important;
        min-width: 0 !important;
        padding-left: 11px !important;
        padding-right: 11px !important;
      }
      #doseFields.rm-beta-dose-compact .dose-result {
        grid-column: 1 / -1 !important;
        margin-top: 2px !important;
        min-height: 48px !important;
        padding: 10px 13px !important;
        border-radius: 15px !important;
        border: 1px solid rgba(125, 92, 255, .18) !important;
        background: rgba(125, 92, 255, .08) !important;
        box-shadow: none !important;
      }
      #doseFields.rm-beta-dose-compact .dose-result span {
        opacity: .72 !important;
        font-size: 12px !important;
      }
      #doseFields.rm-beta-dose-compact .dose-result strong {
        font-size: 16px !important;
        color: var(--accent, #7d5cff) !important;
      }

      /* Seletor de modo de dose: mais próximo da linguagem visual dos campos. */
      #doseMode.rm-beta-dose-mode {
        min-height: 44px !important;
        padding: 3px !important;
        border: 1px solid rgba(142, 142, 147, .28) !important;
        border-radius: 14px !important;
        background: rgba(142, 142, 147, .08) !important;
        box-shadow: none !important;
      }
      #doseMode.rm-beta-dose-mode::before {
        border-radius: 11px !important;
        background: rgba(125, 92, 255, .16) !important;
        border: 1px solid rgba(125, 92, 255, .20) !important;
        box-shadow: none !important;
      }
      #doseMode.rm-beta-dose-mode button {
        min-height: 36px !important;
        padding: 7px 8px !important;
        font-size: 12px !important;
      }

      @media (max-width: 370px) {
        #doseFields.rm-beta-dose-compact {
          gap: 7px !important;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, .65fr) !important;
        }
        #doseFields.rm-beta-dose-compact input,
        #doseFields.rm-beta-dose-compact select {
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function replaceCloseIcons() {
    document.querySelectorAll('.sheet-close').forEach(button => {
      if (button.dataset.rmBetaSimpleX === '1') return;
      button.dataset.rmBetaSimpleX = '1';
      button.innerHTML = `
        <svg class="rm-beta-x-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M7 7L25 25M25 7L7 25"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round" />
        </svg>`;
    });
  }

  function presentationSummaryWithoutRepeatedReference(presentation, medication) {
    const strength = presentation?.strengthValue
      ? `${presentation.strengthValue} ${presentation.strengthUnit || ''}`.trim()
      : 'Sem dosagem';

    const reference = normalize(medication?.referenceName);
    const extras = [presentation?.brand, presentation?.lab]
      .filter(Boolean)
      .filter(value => !reference || normalize(value) !== reference);

    return extras.length ? `${strength} · ${extras.join(' · ')}` : strength;
  }

  async function refineMedicationRegistry() {
    let meds = [];
    try {
      if (typeof window.allMedications === 'function') meds = await window.allMedications();
    } catch (error) {
      console.warn('Beta: não foi possível ler os medicamentos para refinar a lista.', error);
    }

    const byId = new Map(meds.map(med => [String(med.id), med]));

    const addButton = document.getElementById('addMedicationBtn');
    const toolbar = addButton?.closest('.registry-toolbar');
    if (toolbar) {
      toolbar.querySelector('[data-cancel]')?.remove();
      toolbar.classList.add('rm-beta-single-action');
    }

    document.querySelectorAll('.registry-card[data-open-med]').forEach(card => {
      const med = byId.get(String(card.dataset.openMed));
      if (!med) return;

      const count = Array.isArray(med.notes) ? med.notes.length : 0;
      const meta = card.querySelector('.registry-meta');
      if (meta) meta.textContent = `${count} ${count === 1 ? 'nota' : 'notas'}`;

      const subtitle = card.querySelector('small');
      if (subtitle) {
        const summaries = (med.presentations || [])
          .map(presentation => presentationSummaryWithoutRepeatedReference(presentation, med));
        subtitle.textContent = summaries.length ? summaries.join(' · ') : 'Sem apresentações';
      }
    });
  }

  function updateVisualModeNotes() {
    const control = document.getElementById('visualModeControl');
    const notes = control?.parentElement?.querySelector('.rm-beta-visual-notes');
    if (!control || !notes) return;

    const selected = control.querySelector('[data-visual-mode].selected')?.dataset.visualMode;
    notes.querySelectorAll('[data-note-mode]').forEach(note => {
      note.classList.toggle('is-active', note.dataset.noteMode === selected);
    });
  }

  function refineSettingsUI() {
    const themeControl = document.getElementById('themeControl');
    const themeBlock = themeControl?.closest('.setting-block');
    if (themeBlock) themeBlock.classList.add('rm-beta-theme-row');

    const visualControl = document.getElementById('visualModeControl');
    const visualBlock = visualControl?.closest('.setting-block');
    if (visualControl && visualBlock) {
      visualBlock.classList.add('rm-beta-visual-setting');
      document.getElementById('visualModeHelp')?.setAttribute('aria-hidden', 'true');

      let notes = visualBlock.querySelector('.rm-beta-visual-notes');
      if (!notes) {
        notes = document.createElement('div');
        notes.className = 'rm-beta-visual-notes';
        visualControl.insertAdjacentElement('afterend', notes);
      }

      const copy = {
        optimized: 'Menos efeitos, mais fluidez',
        ultra: 'Mais efeitos e profundidade'
      };
      const buttons = [...visualControl.querySelectorAll('[data-visual-mode]')];
      notes.innerHTML = buttons.map(button =>
        `<span class="rm-beta-visual-note" data-note-mode="${button.dataset.visualMode}">${copy[button.dataset.visualMode] || ''}</span>`
      ).join('');

      if (!visualControl.dataset.rmBetaNotesObserved) {
        visualControl.dataset.rmBetaNotesObserved = '1';
        new MutationObserver(updateVisualModeNotes).observe(visualControl, {
          subtree: true,
          attributes: true,
          attributeFilter: ['class']
        });
        visualControl.addEventListener('click', () => requestAnimationFrame(updateVisualModeNotes));
      }
      updateVisualModeNotes();
    }
  }

  function removeMedicationQuantityField() {
    const quantity = document.getElementById('unitsTaken');
    if (!quantity || quantity.type === 'hidden') return;

    const quantityField = quantity.closest('.field');
    const hiddenQuantity = document.createElement('input');
    hiddenQuantity.type = 'hidden';
    hiddenQuantity.id = 'unitsTaken';
    hiddenQuantity.value = '1';
    hiddenQuantity.dataset.rmBetaFixedQuantity = '1';
    quantityField?.replaceWith(hiddenQuantity);

    const doseLabel = document.querySelector('label[for="unitDoseValue"]')
      || document.getElementById('unitDoseValue')?.closest('.field')?.querySelector('label');
    if (doseLabel) doseLabel.textContent = 'Dose';

    document.querySelector('#doseFields .dose-result')?.remove();
  }

  function refineMedicationSheet() {
    const note = document.getElementById('medNote');
    if (note) {
      note.placeholder = 'Motivo desta administração, como você estava se sentindo ou algo fora do comum…';
    }

    document.getElementById('doseMode')?.classList.add('rm-beta-dose-mode');

    const doseFields = document.getElementById('doseFields');
    if (doseFields && document.getElementById('unitsTaken')) {
      doseFields.classList.add('rm-beta-dose-compact');
      removeMedicationQuantityField();
    }
  }

  function installNoteCardPatch() {
    const original = window.eventCard;
    if (typeof original !== 'function') return false;
    if (original.__rmBetaNoteHeaderRefined) return true;

    const wrapped = function(event, ...rest) {
      const html = original.call(this, event, ...rest);
      if (!event || event.type !== 'note' || event.moodScore == null) return html;

      const template = document.createElement('template');
      template.innerHTML = String(html).trim();
      const card = template.content.firstElementChild;
      if (!card) return html;

      const header = card.querySelector('.rm-card-header-main');
      const meta = card.querySelector('.rm-meta-badges');
      const mood = meta?.querySelector('.rm-mini-mood');
      if (header && mood) {
        mood.classList.add('rm-beta-header-mood');
        header.appendChild(mood);
        if (meta && !meta.children.length && !meta.textContent.trim()) meta.remove();
      }
      return card.outerHTML;
    };

    wrapped.__rmBetaNoteHeaderRefined = true;
    wrapped.__rmBetaOriginal = original;
    window.eventCard = wrapped;

    queueMicrotask(() => {
      try { if (typeof window.renderAll === 'function') window.renderAll(); } catch (_) {}
    });
    return true;
  }

  function installMedicationRegistryPatch() {
    const original = window.openMedicationRegistry;
    if (typeof original !== 'function') return false;
    if (original.__rmBetaRegistryRefined) return true;

    const wrapped = async function(...args) {
      const result = await original.apply(this, args);
      await refineMedicationRegistry();
      replaceCloseIcons();
      return result;
    };
    wrapped.__rmBetaRegistryRefined = true;
    wrapped.__rmBetaOriginal = original;
    window.openMedicationRegistry = wrapped;

    const registryButton = document.getElementById('medicationRegistryBtn');
    if (registryButton) registryButton.onclick = () => window.openMedicationRegistry();

    return true;
  }

  function installMedicationSheetPatch() {
    const original = window.openMedicationSheet;
    if (typeof original !== 'function') return false;
    if (original.__rmBetaMedicationSheetRefined) return true;

    const wrapped = async function(...args) {
      const result = await original.apply(this, args);
      refineMedicationSheet();
      replaceCloseIcons();
      return result;
    };
    wrapped.__rmBetaMedicationSheetRefined = true;
    wrapped.__rmBetaOriginal = original;
    window.openMedicationSheet = wrapped;
    return true;
  }

  function installDoseFieldsPatch() {
    const original = window.renderDoseFields;
    if (typeof original !== 'function') return false;
    if (original.__rmBetaDoseFieldsRefined) return true;

    const wrapped = async function(...args) {
      const result = await original.apply(this, args);
      refineMedicationSheet();
      return result;
    };
    wrapped.__rmBetaDoseFieldsRefined = true;
    wrapped.__rmBetaOriginal = original;
    window.renderDoseFields = wrapped;
    return true;
  }

  installBetaUIStyles();
  replaceCloseIcons();
  refineSettingsUI();

  let attempts = 0;
  const installer = setInterval(() => {
    attempts += 1;
    replaceCloseIcons();
    refineSettingsUI();
    refineMedicationSheet();

    const noteCardsReady = installNoteCardPatch();
    const registryReady = installMedicationRegistryPatch();
    const sheetReady = installMedicationSheetPatch();
    const doseReady = installDoseFieldsPatch();

    if ((noteCardsReady && registryReady && sheetReady && doseReady) || attempts >= 200) {
      clearInterval(installer);
    }
  }, 75);

  document.addEventListener('registro:release-ready', () => {
    replaceCloseIcons();
    refineSettingsUI();
    installNoteCardPatch();
    installMedicationRegistryPatch();
    installMedicationSheetPatch();
    installDoseFieldsPatch();
  }, { once: true });
})();
