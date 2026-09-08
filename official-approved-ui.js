/* Registro Mental Oficial — refinamentos aprovados na Beta, sem ferramentas experimentais. */
(() => {
  'use strict';

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  function installStyles() {
    if (document.getElementById('rm-official-approved-ui')) return;
    const style = document.createElement('style');
    style.id = 'rm-official-approved-ui';
    style.textContent = `
      /* Fechamento das sheets: somente o X, sem caixa/círculo. */
      .sheet-close,.sheet-header .sheet-close,button.sheet-close{
        width:48px!important;height:48px!important;min-width:48px!important;
        padding:0!important;border:0!important;border-radius:0!important;
        background:transparent!important;box-shadow:none!important;color:var(--text)!important;
        display:grid!important;place-items:center!important
      }
      .sheet-close::before,.sheet-close::after{content:none!important}
      .sheet-close:active{transform:scale(.90);opacity:.62}
      .sheet-close .rm-official-x-icon{width:33px!important;height:33px!important;display:block;overflow:visible}

      /* Um único design para cartões de registros: Histórico e Mais recentes. */
      .rm-v28-timeline .timeline-main{padding-left:0!important}

      /* Anotações: humor junto ao cabeçalho e conteúdo com alinhamento óptico. */
      .rm-v28-timeline.rm-type-note .rm-card-header-main{gap:5px!important}
      .rm-v28-timeline.rm-type-note .timeline-main{padding-left:8px!important}
      .rm-v28-timeline.rm-type-note .rm-card-header-main .rm-official-header-mood{
        width:22px!important;height:22px!important;min-width:22px!important;
        border-radius:7px!important;margin-left:4px!important;font-size:12px!important;
        line-height:1!important;font-weight:850!important;box-shadow:0 0 6px var(--rm-mini-glow)!important
      }

      /* Cadastro de medicamentos: ação única ocupa toda a largura. */
      .registry-toolbar.rm-official-single-action{display:block!important}
      .registry-toolbar.rm-official-single-action #addMedicationBtn{
        display:block!important;width:100%!important;min-width:0!important;margin:0!important
      }

      /* Tema mais compacto, como validado na Beta. */
      .setting-block.rm-official-theme-row{
        display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;
        align-items:center!important;gap:16px!important;padding-top:14px!important;padding-bottom:14px!important
      }
      .rm-official-theme-row .setting-label{margin:0!important;min-width:max-content!important}
      .rm-official-theme-row .setting-label small{display:none!important}
      .rm-official-theme-row #themeControl{margin:0!important;width:100%!important;min-height:42px!important}
      .rm-official-theme-row #themeControl button{min-height:38px!important;padding-top:7px!important;padding-bottom:7px!important}

      /* Efeitos visuais com descrição individual. */
      #visualModeSetting.rm-official-visual-setting,.setting-block.rm-official-visual-setting{
        padding-top:16px!important;padding-bottom:16px!important
      }
      .rm-official-visual-setting #visualModeHelp{display:none!important}
      .rm-official-visual-setting #visualModeControl{margin-bottom:8px!important}
      .rm-official-visual-notes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 6px}
      .rm-official-visual-note{text-align:center;font-size:11px;line-height:1.28;color:var(--secondary);opacity:.42;transition:opacity .18s ease,color .18s ease}
      .rm-official-visual-note.is-active{opacity:.95;color:var(--text)}

      /* Formulário de administração de medicamento. */
      #doseFields.rm-official-dose-compact{
        display:grid!important;grid-template-columns:minmax(0,1.35fr) minmax(0,.65fr)!important;
        gap:10px!important;align-items:end!important
      }
      #doseFields.rm-official-dose-compact .field-grid{display:contents!important}
      #doseFields.rm-official-dose-compact .field-grid>.field,#doseFields.rm-official-dose-compact>.field{
        min-width:0!important;margin:0!important
      }
      #doseFields.rm-official-dose-compact label{
        font-size:11px!important;line-height:1.15!important;min-height:26px;display:flex;align-items:flex-end
      }
      #doseFields.rm-official-dose-compact input,#doseFields.rm-official-dose-compact select{
        width:100%!important;min-width:0!important;padding-left:11px!important;padding-right:11px!important
      }
      #doseMode.rm-official-dose-mode{
        min-height:44px!important;padding:3px!important;border:1px solid rgba(142,142,147,.28)!important;
        border-radius:14px!important;background:rgba(142,142,147,.08)!important;box-shadow:none!important
      }
      #doseMode.rm-official-dose-mode::before{
        border-radius:11px!important;background:rgba(125,92,255,.16)!important;
        border:1px solid rgba(125,92,255,.20)!important;box-shadow:none!important
      }
      #doseMode.rm-official-dose-mode button{min-height:36px!important;padding:7px 8px!important;font-size:12px!important}

      /* Atualização integrada ao cartão de Dados. */
      .rm-official-update-row{
        display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;
        align-items:center!important;gap:11px!important;padding:12px 14px!important
      }
      .rm-official-update-row .rm-update-button{min-height:34px!important;padding:7px 11px!important;white-space:nowrap}

      @media(max-width:370px){
        #doseFields.rm-official-dose-compact{gap:7px!important}
        #doseFields.rm-official-dose-compact input,#doseFields.rm-official-dose-compact select{
          padding-left:8px!important;padding-right:8px!important
        }
      }
    `;
    document.head.appendChild(style);
  }

  function replaceCloseIcons() {
    document.querySelectorAll('.sheet-close').forEach(button => {
      if (button.dataset.rmOfficialSimpleX === '1') return;
      button.dataset.rmOfficialSimpleX = '1';
      button.innerHTML = `<svg class="rm-official-x-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 7L25 25M25 7L7 25" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;
    });
  }

  function presentationSummary(presentation, medication) {
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
    try { if (typeof window.allMedications === 'function') meds = await window.allMedications(); }
    catch (_) {}
    const byId = new Map(meds.map(med => [String(med.id), med]));
    const addButton = document.getElementById('addMedicationBtn');
    const toolbar = addButton?.closest('.registry-toolbar');
    if (toolbar) {
      toolbar.querySelector('[data-cancel]')?.remove();
      toolbar.classList.add('rm-official-single-action');
    }
    document.querySelectorAll('.registry-card[data-open-med]').forEach(card => {
      const med = byId.get(String(card.dataset.openMed));
      if (!med) return;
      const count = Array.isArray(med.notes) ? med.notes.length : 0;
      const meta = card.querySelector('.registry-meta');
      if (meta) meta.textContent = `${count} ${count === 1 ? 'nota' : 'notas'}`;
      const subtitle = card.querySelector('small');
      if (subtitle) {
        const summaries = (med.presentations || []).map(p => presentationSummary(p, med));
        subtitle.textContent = summaries.length ? summaries.join(' · ') : 'Sem apresentações';
      }
    });
  }

  function updateVisualModeNotes() {
    const control = document.getElementById('visualModeControl');
    const notes = control?.parentElement?.querySelector('.rm-official-visual-notes');
    if (!control || !notes) return;
    const selected = control.querySelector('[data-visual-mode].selected')?.dataset.visualMode;
    notes.querySelectorAll('[data-note-mode]').forEach(note => note.classList.toggle('is-active', note.dataset.noteMode === selected));
  }

  function refineSettingsUI() {
    const settingsView = document.querySelector('.view[data-view="settings"]');
    if (settingsView) {
      const groups = [...settingsView.querySelectorAll(':scope > .settings-group')];
      const byTitle = title => groups.find(group => normalize(group.querySelector(':scope > h2')?.textContent) === normalize(title));
      const appearance = byTitle('Aparência');
      const medication = byTitle('Medicamentos');
      const health = byTitle('Saúde e sono') || byTitle('Saúde');
      const advanced = byTitle('Personalização avançada');
      const data = byTitle('Dados') || byTitle('Dados e atualização');
      const development = byTitle('Desenvolvimento');
      const about = byTitle('Sobre');

      if (medication && health) {
        const medicationRow = medication.querySelector('#medicationRegistryBtn');
        const healthCard = health.querySelector('.settings-card');
        if (medicationRow && healthCard) {
          const separator = document.createElement('div');
          separator.className = 'setting-separator inset';
          healthCard.prepend(separator);
          healthCard.prepend(medicationRow);
        }
        medication.remove();
      }
      if (health?.querySelector(':scope > h2')) health.querySelector(':scope > h2').textContent = 'Saúde';
      if (data?.querySelector(':scope > h2')) data.querySelector(':scope > h2').textContent = 'Dados e atualização';

      const header = settingsView.querySelector(':scope > .page-header');
      let anchor = header;
      [health, data, appearance, advanced, development, about].filter(Boolean).forEach(group => {
        anchor.insertAdjacentElement('afterend', group);
        anchor = group;
      });

      const updateButton = document.getElementById('rmForceUpdateBtn');
      const dataCard = data?.querySelector('.settings-card');
      if (updateButton && dataCard && !document.getElementById('rmOfficialUpdateRow')) {
        const previousHandler = updateButton.onclick;
        const row = document.createElement('div');
        row.id = 'rmOfficialUpdateRow';
        row.className = 'settings-row rm-official-update-row';
        row.innerHTML = `<span class="settings-row-icon" data-icon="clock"></span><span><strong>Atualizar aplicativo</strong><small>Busca a versão mais recente sem apagar seus dados</small></span>`;
        updateButton.closest('.rm-update-row')?.remove();
        row.appendChild(updateButton);
        updateButton.onclick = previousHandler;
        const separator = document.createElement('div');
        separator.className = 'setting-separator inset';
        dataCard.prepend(separator);
        dataCard.prepend(row);
        try { if (typeof hydrateIcons === 'function') hydrateIcons(row); } catch (_) {}
      }
    }

    const themeControl = document.getElementById('themeControl');
    themeControl?.closest('.setting-block')?.classList.add('rm-official-theme-row');

    const visualControl = document.getElementById('visualModeControl');
    const visualBlock = visualControl?.closest('.setting-block');
    if (visualControl && visualBlock) {
      visualBlock.classList.add('rm-official-visual-setting');
      let notes = visualBlock.querySelector('.rm-official-visual-notes');
      if (!notes) {
        notes = document.createElement('div');
        notes.className = 'rm-official-visual-notes';
        visualControl.insertAdjacentElement('afterend', notes);
      }
      const copy = { optimized: 'Menos efeitos, mais fluidez', ultra: 'Mais efeitos e profundidade' };
      const buttons = [...visualControl.querySelectorAll('[data-visual-mode]')];
      notes.innerHTML = buttons.map(button => `<span class="rm-official-visual-note" data-note-mode="${button.dataset.visualMode}">${copy[button.dataset.visualMode] || ''}</span>`).join('');
      if (!visualControl.dataset.rmOfficialNotesObserved) {
        visualControl.dataset.rmOfficialNotesObserved = '1';
        new MutationObserver(updateVisualModeNotes).observe(visualControl,{subtree:true,attributes:true,attributeFilter:['class']});
        visualControl.addEventListener('click',()=>requestAnimationFrame(updateVisualModeNotes));
      }
      updateVisualModeNotes();
    }
  }

  function removeMedicationQuantityField() {
    const quantity = document.getElementById('unitsTaken');
    if (!quantity || quantity.type === 'hidden') return;
    const field = quantity.closest('.field');
    const hidden = document.createElement('input');
    hidden.type = 'hidden'; hidden.id = 'unitsTaken'; hidden.value = '1';
    field?.replaceWith(hidden);
    const doseLabel = document.querySelector('label[for="unitDoseValue"]') || document.getElementById('unitDoseValue')?.closest('.field')?.querySelector('label');
    if (doseLabel) doseLabel.textContent = 'Dose';
    document.querySelector('#doseFields .dose-result')?.remove();
  }

  function refineMedicationSheet() {
    const note = document.getElementById('medNote');
    if (note) note.placeholder = 'Motivo desta administração, como você estava se sentindo ou algo fora do comum…';
    document.getElementById('doseMode')?.classList.add('rm-official-dose-mode');
    const doseFields = document.getElementById('doseFields');
    if (doseFields && document.getElementById('unitsTaken')) {
      doseFields.classList.add('rm-official-dose-compact');
      removeMedicationQuantityField();
    }
  }

  function installNoteCardPatch() {
    const original = window.eventCard;
    if (typeof original !== 'function') return false;
    if (original.__rmOfficialNoteHeaderRefined) return true;
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
        mood.classList.add('rm-official-header-mood');
        header.appendChild(mood);
        if (meta && !meta.children.length && !meta.textContent.trim()) meta.remove();
      }
      return card.outerHTML;
    };
    wrapped.__rmOfficialNoteHeaderRefined = true;
    wrapped.__rmOfficialOriginal = original;
    window.eventCard = wrapped;
    queueMicrotask(() => { try { if (typeof window.renderAll === 'function') window.renderAll(); } catch (_) {} });
    return true;
  }

  function installMedicationRegistryPatch() {
    const original = window.openMedicationRegistry;
    if (typeof original !== 'function') return false;
    if (original.__rmOfficialRegistryRefined) return true;
    const wrapped = async function(...args) {
      const result = await original.apply(this,args);
      await refineMedicationRegistry(); replaceCloseIcons(); return result;
    };
    wrapped.__rmOfficialRegistryRefined = true;
    window.openMedicationRegistry = wrapped;
    const button = document.getElementById('medicationRegistryBtn');
    if (button) button.onclick = () => window.openMedicationRegistry();
    return true;
  }

  function installMedicationSheetPatch() {
    const original = window.openMedicationSheet;
    if (typeof original !== 'function') return false;
    if (original.__rmOfficialMedicationSheetRefined) return true;
    const wrapped = async function(...args) {
      const result = await original.apply(this,args);
      refineMedicationSheet(); replaceCloseIcons(); return result;
    };
    wrapped.__rmOfficialMedicationSheetRefined = true;
    window.openMedicationSheet = wrapped;
    return true;
  }

  function installDoseFieldsPatch() {
    const original = window.renderDoseFields;
    if (typeof original !== 'function') return false;
    if (original.__rmOfficialDoseFieldsRefined) return true;
    const wrapped = async function(...args) {
      const result = await original.apply(this,args); refineMedicationSheet(); return result;
    };
    wrapped.__rmOfficialDoseFieldsRefined = true;
    window.renderDoseFields = wrapped;
    return true;
  }

  function syncSafariChrome() {
    const theme = document.documentElement.dataset.theme || 'system';
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches);
    const color = dark ? '#000000' : '#f5f5f7';
    document.documentElement.style.setProperty('--rm-safari-viewport-bg',color);
    document.documentElement.style.setProperty('background-color',color,'important');
    if (document.body) document.body.style.setProperty('background-color',color,'important');
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
    meta.setAttribute('content',color);
  }

  function apply() {
    installStyles(); replaceCloseIcons(); refineSettingsUI(); refineMedicationSheet();
    installNoteCardPatch(); installMedicationRegistryPatch(); installMedicationSheetPatch(); installDoseFieldsPatch(); syncSafariChrome();
  }

  apply();
  let attempts = 0;
  const installer = setInterval(() => {
    attempts += 1; apply();
    if (attempts >= 120 || (typeof window.eventCard === 'function' && typeof window.openMedicationRegistry === 'function' && typeof window.openMedicationSheet === 'function')) clearInterval(installer);
  },75);

  window.addEventListener('registro:release-ready',apply);
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  document.addEventListener('click',event => {
    if (event.target.closest('.tab-item,#medicationRegistryBtn,.action-card,[data-menu]')) setTimeout(apply,0);
  },{passive:true});

  window.REGISTRO_OFFICIAL_APPROVED_UI_READY = true;
})();
