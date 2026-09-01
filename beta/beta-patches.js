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
      .sheet-close:active { transform: scale(.90); opacity: .62; }
      .sheet-close .rm-beta-x-icon { width: 33px !important; height: 33px !important; display: block; overflow: visible; }

      .registry-toolbar.rm-beta-single-action { display: block !important; }
      .registry-toolbar.rm-beta-single-action #addMedicationBtn { display: block !important; width: 100% !important; min-width: 0 !important; margin: 0 !important; }

      .rm-v28-timeline .timeline-main { padding-left: 0 !important; }

      .setting-block.rm-beta-theme-row {
        display: grid !important;
        grid-template-columns: auto minmax(0, 1fr) !important;
        align-items: center !important;
        gap: 16px !important;
        padding-top: 14px !important;
        padding-bottom: 14px !important;
      }
      .rm-beta-theme-row .setting-label { margin: 0 !important; min-width: max-content !important; }
      .rm-beta-theme-row .setting-label small { display: none !important; }
      .rm-beta-theme-row #themeControl { margin: 0 !important; width: 100% !important; min-height: 42px !important; }
      .rm-beta-theme-row #themeControl button { min-height: 38px !important; padding-top: 7px !important; padding-bottom: 7px !important; }

      #visualModeSetting.rm-beta-visual-setting,
      .setting-block.rm-beta-visual-setting { padding-top: 16px !important; padding-bottom: 16px !important; }
      .rm-beta-visual-setting #visualModeHelp { display: none !important; }
      .rm-beta-visual-setting #visualModeControl { margin-bottom: 8px !important; }
      .rm-beta-visual-notes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 0 6px; }
      .rm-beta-visual-note {
        text-align: center;
        font-size: 11px;
        line-height: 1.28;
        color: var(--text-secondary, #8e8e93);
        opacity: .42;
        transition: opacity .18s ease, color .18s ease;
      }
      .rm-beta-visual-note.is-active { opacity: .95; color: var(--text, currentColor); }

      #doseFields.rm-beta-dose-compact {
        display: grid !important;
        grid-template-columns: minmax(0, 1.18fr) minmax(0, .72fr) minmax(0, .72fr) !important;
        gap: 10px !important;
        align-items: end !important;
      }
      #doseFields.rm-beta-dose-compact .field-grid { display: contents !important; }
      #doseFields.rm-beta-dose-compact .field-grid > .field,
      #doseFields.rm-beta-dose-compact > .field { min-width: 0 !important; margin: 0 !important; }
      #doseFields.rm-beta-dose-compact label {
        font-size: 11px !important;
        line-height: 1.15 !important;
        min-height: 26px;
        display: flex;
        align-items: flex-end;
      }
      #doseFields.rm-beta-dose-compact input,
      #doseFields.rm-beta-dose-compact select { width: 100% !important; min-width: 0 !important; padding-left: 11px !important; padding-right: 11px !important; }
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
      #doseFields.rm-beta-dose-compact .dose-result span { opacity: .72 !important; font-size: 12px !important; }
      #doseFields.rm-beta-dose-compact .dose-result strong { font-size: 16px !important; color: var(--accent, #7d5cff) !important; }

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
      #doseMode.rm-beta-dose-mode button { min-height: 36px !important; padding: 7px 8px !important; font-size: 12px !important; }

      @media (max-width: 370px) {
        #doseFields.rm-beta-dose-compact { gap: 7px !important; grid-template-columns: minmax(0, 1.15fr) minmax(0, .68fr) minmax(0, .68fr) !important; }
        #doseFields.rm-beta-dose-compact input,
        #doseFields.rm-beta-dose-compact select { padding-left: 8px !important; padding-right: 8px !important; }
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
          <path d="M7 7L25 25M25 7L7 25" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
        </svg>`;
    });
  }

  function presentationSummaryWithoutRepeatedReference(presentation, medication) {
    const strength = presentation?.strengthValue ? `${presentation.strengthValue} ${presentation.strengthUnit || ''}`.trim() : 'Sem dosagem';
    const reference = normalize(medication?.referenceName);
    const extras = [presentation?.brand, presentation?.lab].filter(Boolean).filter(value => !reference || normalize(value) !== reference);
    return extras.length ? `${strength} · ${extras.join(' · ')}` : strength;
  }

  async function refineMedicationRegistry() {
    let meds = [];
    try { if (typeof window.allMedications === 'function') meds = await window.allMedications(); }
    catch (error) { console.warn('Beta: não foi possível ler os medicamentos para refinar a lista.', error); }
    const byId = new Map(meds.map(med => [String(med.id), med]));
    const addButton = document.getElementById('addMedicationBtn');
    const toolbar = addButton?.closest('.registry-toolbar');
    if (toolbar) { toolbar.querySelector('[data-cancel]')?.remove(); toolbar.classList.add('rm-beta-single-action'); }
    document.querySelectorAll('.registry-card[data-open-med]').forEach(card => {
      const med = byId.get(String(card.dataset.openMed));
      if (!med) return;
      const count = Array.isArray(med.notes) ? med.notes.length : 0;
      const meta = card.querySelector('.registry-meta');
      if (meta) meta.textContent = `${count} ${count === 1 ? 'nota' : 'notas'}`;
      const subtitle = card.querySelector('small');
      if (subtitle) {
        const summaries = (med.presentations || []).map(presentation => presentationSummaryWithoutRepeatedReference(presentation, med));
        subtitle.textContent = summaries.length ? summaries.join(' · ') : 'Sem apresentações';
      }
    });
  }

  function updateVisualModeNotes() {
    const control = document.getElementById('visualModeControl');
    const notes = control?.parentElement?.querySelector('.rm-beta-visual-notes');
    if (!control || !notes) return;
    const selected = control.querySelector('[data-visual-mode].selected')?.dataset.visualMode;
    notes.querySelectorAll('[data-note-mode]').forEach(note => note.classList.toggle('is-active', note.dataset.noteMode === selected));
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
      const copy = { optimized: 'Menos efeitos, mais fluidez', ultra: 'Mais efeitos e profundidade' };
      const buttons = [...visualControl.querySelectorAll('[data-visual-mode]')];
      notes.innerHTML = buttons.map(button => `<span class="rm-beta-visual-note" data-note-mode="${button.dataset.visualMode}">${copy[button.dataset.visualMode] || ''}</span>`).join('');
      if (!visualControl.dataset.rmBetaNotesObserved) {
        visualControl.dataset.rmBetaNotesObserved = '1';
        new MutationObserver(updateVisualModeNotes).observe(visualControl, { subtree: true, attributes: true, attributeFilter: ['class'] });
        visualControl.addEventListener('click', () => requestAnimationFrame(updateVisualModeNotes));
      }
      updateVisualModeNotes();
    }
  }

  function replaceDoseInputsWithoutStickyDefault() {
    const ids = ['unitDoseValue', 'unitsTaken', 'doseUnit'];
    const current = ids.map(id => document.getElementById(id));
    if (current.some(el => !el)) return;
    if (document.getElementById('unitsTaken')?.dataset.rmBetaEditableQuantity === '1') return;
    for (const el of current) {
      const clone = el.cloneNode(true);
      if (el.id === 'unitsTaken') clone.dataset.rmBetaEditableQuantity = '1';
      el.replaceWith(clone);
    }
    const unitDose = document.getElementById('unitDoseValue');
    const quantity = document.getElementById('unitsTaken');
    const unit = document.getElementById('doseUnit');
    const preview = document.getElementById('doseTotalPreview');
    const update = () => {
      const vRaw = String(unitDose?.value || '').trim().replace(',', '.');
      const qRaw = String(quantity?.value || '').trim().replace(',', '.');
      const value = vRaw === '' ? NaN : Number(vRaw);
      const qty = qRaw === '' ? NaN : Number(qRaw);
      if (preview) preview.textContent = Number.isFinite(value) && Number.isFinite(qty) ? `${(value * qty).toLocaleString('pt-BR')} ${unit?.value || 'mg'}` : '—';
    };
    [unitDose, quantity, unit].forEach(el => { el?.addEventListener('input', update); el?.addEventListener('change', update); });
    quantity?.addEventListener('focus', () => { if (quantity.value === '1') setTimeout(() => quantity.select(), 0); });
    update();
  }

  function refineMedicationSheet() {
    const note = document.getElementById('medNote');
    if (note) note.placeholder = 'Motivo desta administração, como você estava se sentindo ou algo fora do comum…';
    document.getElementById('doseMode')?.classList.add('rm-beta-dose-mode');
    const doseFields = document.getElementById('doseFields');
    if (doseFields && document.getElementById('unitsTaken')) {
      doseFields.classList.add('rm-beta-dose-compact');
      replaceDoseInputsWithoutStickyDefault();
    }
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
    const registryReady = installMedicationRegistryPatch();
    const sheetReady = installMedicationSheetPatch();
    const doseReady = installDoseFieldsPatch();
    if ((registryReady && sheetReady && doseReady) || attempts >= 200) clearInterval(installer);
  }, 75);

  document.addEventListener('registro:release-ready', () => {
    replaceCloseIcons();
    refineSettingsUI();
    installMedicationRegistryPatch();
    installMedicationSheetPatch();
    installDoseFieldsPatch();
  }, { once: true });
})();
