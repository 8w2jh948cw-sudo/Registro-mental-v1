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
      .sheet-close:active {
        transform: scale(.90);
        opacity: .62;
      }
      .sheet-close .rm-beta-x-icon {
        width: 31px !important;
        height: 31px !important;
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

    /* O app base atribui uma referência direta ao onclick; reorienta para o wrapper. */
    const registryButton = document.getElementById('medicationRegistryBtn');
    if (registryButton) registryButton.onclick = () => window.openMedicationRegistry();

    return true;
  }

  installBetaUIStyles();
  replaceCloseIcons();

  let attempts = 0;
  const installer = setInterval(() => {
    attempts += 1;
    replaceCloseIcons();
    if (installMedicationRegistryPatch() || attempts >= 200) {
      clearInterval(installer);
    }
  }, 75);

  document.addEventListener('registro:release-ready', () => {
    replaceCloseIcons();
    installMedicationRegistryPatch();
  }, { once: true });
})();
