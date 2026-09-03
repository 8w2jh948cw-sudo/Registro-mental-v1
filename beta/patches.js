/* Registro Mental V1 — correções finais isoladas do motor principal */
(() => {
  'use strict';

  const RELEASE = String(window.REGISTRO_SHELL_RELEASE || '1.2.0-beta.10');
  const SPARK_ICON = `<svg class="svg-icon rm-spark-custom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.7734 24.9609" width="24" height="24" aria-hidden="true" focusable="false" stroke="none">
    <g stroke="none">
      <rect height="24.9609" opacity="0" width="21.7734" x="0" y="0"/>
      <path d="M4.36719 16.25C4.17969 16.25 4.04688 16.3672 4.02344 16.5625C3.61719 19.6875 3.51562 19.7188 0.34375 20.2578C0.125 20.2891 0 20.4062 0 20.6016C0 20.7969 0.125 20.9062 0.304688 20.9375C3.5 21.5547 3.61719 21.5234 4.02344 24.625C4.04688 24.8359 4.17969 24.9609 4.36719 24.9609C4.54688 24.9609 4.6875 24.8359 4.71094 24.6328C5.13281 21.4844 5.21875 21.4375 8.42188 20.9375C8.60156 20.9141 8.72656 20.7969 8.72656 20.6016C8.72656 20.4141 8.60156 20.2891 8.42188 20.2578C5.21875 19.6406 5.14062 19.6719 4.71094 16.5469C4.6875 16.3672 4.54688 16.25 4.36719 16.25Z" fill="currentColor" fill-opacity="0.85" stroke="none"/>
      <path d="M12.2578 3.29688C11.9766 3.29688 11.7734 3.49219 11.7422 3.77344C10.8828 10.3359 10.0703 11.0547 3.64062 11.8828C3.35156 11.9141 3.14844 12.125 3.14844 12.3984C3.14844 12.6797 3.35156 12.8906 3.64062 12.9219C10.0938 13.5859 10.9531 14.4609 11.7422 21.0234C11.7734 21.3047 11.9766 21.5078 12.2578 21.5078C12.5312 21.5078 12.7422 21.3047 12.7812 21.0234C13.5781 14.4609 14.4297 13.5859 20.875 12.9219C21.1719 12.8906 21.3672 12.6797 21.3672 12.3984C21.3672 12.125 21.1719 11.9141 20.875 11.8828C14.4297 11.2109 13.5781 10.3359 12.7812 3.77344C12.7422 3.49219 12.5312 3.29688 12.2578 3.29688Z" fill="currentColor" fill-opacity="0.85" stroke="none"/>
    </g>
  </svg>`;

  function installStyles() {
    if (document.getElementById('rm-v1-final-patch-style')) return;
    const style = document.createElement('style');
    style.id = 'rm-v1-final-patch-style';
    style.textContent = `
      html { --icon-stroke: 2 !important; }
      .rm-spark-custom,
      .rm-spark-custom * {
        stroke: none !important;
        stroke-width: 0 !important;
        -webkit-text-stroke: 0 !important;
      }
      .voice-row { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  function removeIconWeightSetting() {
    const control = document.getElementById('iconWeightControl');
    const block = control?.closest('.setting-block');
    if (block) {
      const next = block.nextElementSibling;
      const prev = block.previousElementSibling;
      if (next?.classList.contains('setting-separator')) next.remove();
      else if (prev?.classList.contains('setting-separator')) prev.remove();
      block.remove();
    }

    try {
      const key = 'registro-beta-settings-v1';
      const raw = localStorage.getItem(key);
      if (raw) {
        const settings = JSON.parse(raw);
        if ('iconWeight' in settings) {
          delete settings.iconWeight;
          localStorage.setItem(key, JSON.stringify(settings));
        }
      }
    } catch (_) {}

    document.documentElement.dataset.iconWeight = 'regular';
  }

  function replaceSparkHolder(holder) {
    if (!holder) return;
    if (holder.querySelector('.rm-spark-custom')) {
      holder.removeAttribute('data-icon');
      return;
    }
    holder.removeAttribute('data-icon');
    holder.innerHTML = SPARK_ICON;
  }

  function applySparkIcons() {
    document.querySelectorAll('[data-icon="spark"]').forEach(replaceSparkHolder);
    const learningTab = document.querySelector('[data-tab="learning"]');
    if (learningTab) {
      replaceSparkHolder(learningTab.querySelector('[data-icon]') || learningTab.querySelector('span'));
    }
  }

  function removeVoiceUi() {
    document.querySelectorAll('.voice-row').forEach(el => el.remove());
  }

  function installUpdateButtonBehavior() {
    const button = document.getElementById('rmForceUpdateBtn');
    if (!button || button.dataset.rmV1Handler === RELEASE) return;
    button.dataset.rmV1Handler = RELEASE;
    button.onclick = async () => {
      if (!navigator.onLine) {
        if (typeof window.toast === 'function') window.toast('Conecte-se à internet para atualizar.');
        return;
      }
      button.disabled = true;
      button.textContent = 'Buscando…';
      try {
        const probe = await fetch(`./release-guard.js?verificar=${Date.now()}`, { cache: 'no-store' });
        if (!probe.ok) throw new Error('A publicação não respondeu.');
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.allSettled(regs
            .filter(reg => String(reg.scope || '').includes('/Registro-mental-v1/beta/'))
            .map(reg => reg.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.allSettled(keys
            .filter(key => key.startsWith('registro-beta-v1-'))
            .map(key => caches.delete(key)));
        }
        button.textContent = 'Atualizando…';
        location.replace(`./launch.html?force=${Date.now()}&from=${encodeURIComponent(RELEASE)}`);
      } catch (error) {
        console.error('Falha ao buscar atualização', error);
        button.disabled = false;
        button.textContent = 'Tentar novamente';
        if (typeof window.toast === 'function') window.toast('Não foi possível buscar a atualização.');
      }
    };
  }

  function paintRelease() {
    const top = document.getElementById('topVersion');
    const about = document.getElementById('versionLabel');
    if (top) top.textContent = `v${RELEASE}`;
    if (about) about.textContent = RELEASE;
  }

  function applyAll() {
    installStyles();
    removeIconWeightSetting();
    removeVoiceUi();
    applySparkIcons();
    installUpdateButtonBehavior();
    paintRelease();
  }

  // Sem MutationObserver permanente: evita loops, gasto de CPU e regressões no Safari.
  applyAll();
  window.addEventListener('registro:release-ready', applyAll);
  document.addEventListener('DOMContentLoaded', applyAll, { once: true });
  [0, 250, 900, 1800].forEach(ms => setTimeout(applyAll, ms));
  document.addEventListener('click', event => {
    if (event.target.closest('.tab-item, #customIconsBtn, #rmForceUpdateBtn')) {
      setTimeout(applyAll, 0);
    }
  }, { passive: true });

  window.REGISTRO_PATCH_RELEASE = RELEASE;
  window.dispatchEvent(new CustomEvent('registro:patches-ready', { detail: { release: RELEASE } }));
})();

/* RM_BETA_SAFETY_AND_APPEARANCE_V1
   Snapshots internos, exportação compatível e Ajustes mais limpos. */
(() => {
  'use strict';

  const BACKUP_FORMAT = 2;
  const SNAPSHOT_PREFIX = '__rm_beta_auto_snapshot_v1__:';
  const IMPORT_UNDO_ID = '__rm_beta_last_import_undo_v1__';
  const SNAPSHOT_RETENTION = 14;
  const SETTINGS_KEY = 'registro-beta-settings-v1';

  function safeToast(message) {
    try { if (typeof window.toast === 'function') return window.toast(message); } catch (_) {}
    console.info(message);
  }

  function normalizeLabel(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  function installSafetyStyles() {
    if (document.getElementById('rm-beta-safety-appearance-style')) return;
    const style = document.createElement('style');
    style.id = 'rm-beta-safety-appearance-style';
    style.textContent = `
      /* X deliberadamente maior: desenho evidente, área de toque confortável. */
      .sheet-close,
      .sheet-header .sheet-close,
      button.sheet-close {
        width: 56px !important;
        height: 56px !important;
        min-width: 56px !important;
        min-height: 56px !important;
      }
      .sheet-close .rm-beta-x-icon,
      .sheet-close .rm-close-icon {
        width: 40px !important;
        height: 40px !important;
      }
      body.rm-appearance-subview .tab-bar { display:none !important; }
      body.rm-appearance-subview .content { padding-bottom:max(28px,env(safe-area-inset-bottom)) !important; }
      .rm-appearance-back {
        appearance:none;border:0;background:transparent;color:var(--text);padding:8px 10px 8px 0;
        font:650 15px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;
      }
      .rm-appearance-back span{font-size:24px;vertical-align:-2px;margin-right:2px}
      .rm-backup-meta{display:grid;grid-template-columns:1fr auto;gap:5px 12px;margin:10px 0 14px;padding:11px 12px;border-radius:14px;background:color-mix(in srgb,var(--surface) 90%,var(--accent) 10%);font-size:12px}
      .rm-backup-meta span{color:var(--secondary)}
      .rm-snapshot-list{display:grid;gap:8px;max-height:52vh;overflow:auto;margin:10px 0 14px}
      .rm-snapshot-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px 12px;border:1px solid var(--separator);border-radius:14px;background:var(--surface)}
      .rm-snapshot-row strong{display:block;font-size:13px}.rm-snapshot-row small{display:block;margin-top:3px;color:var(--secondary);font-size:11px}
      .rm-snapshot-row button{appearance:none;border:0;border-radius:11px;padding:8px 10px;background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--accent);font:650 12px/1 inherit}
    `;
    document.head.appendChild(style);
  }

  function removeNodeWithSeparator(node) {
    if (!node) return;
    const next = node.nextElementSibling;
    const prev = node.previousElementSibling;
    if (next?.classList.contains('setting-separator')) next.remove();
    else if (prev?.classList.contains('setting-separator')) prev.remove();
    node.remove();
  }

  function removeObsoleteVisualControls() {
    try { if (typeof window.applySemanticPalette === 'function') window.applySemanticPalette(); } catch (_) {}
    ['accentControl', 'fontFamilyControl', 'fontWeightControl'].forEach(id => {
      const control = document.getElementById(id);
      const node = control?.closest('.setting-block, .setting-inline');
      if (node) removeNodeWithSeparator(node);
    });
    const note = document.querySelector('.semantic-palette-note');
    if (note) note.textContent = 'Escolha temporária enquanto definimos a paleta fixa do aplicativo.';
  }

  function makeSeparator() {
    const el = document.createElement('div');
    el.className = 'setting-separator inset';
    return el;
  }

  function appendSetting(card, node) {
    if (!card || !node) return;
    if (card.children.length) card.appendChild(makeSeparator());
    card.appendChild(node);
  }

  function ensureAppearanceSubview() {
    const settings = document.querySelector('.view[data-view="settings"]');
    const main = document.getElementById('content');
    if (!settings || !main) return false;

    removeObsoleteVisualControls();

    let view = document.querySelector('.view[data-view="appearance"]');
    if (!view) {
      view = document.createElement('section');
      view.className = 'view';
      view.dataset.view = 'appearance';
      view.innerHTML = `
        <header class="page-header">
          <div><button type="button" class="rm-appearance-back" id="rmAppearanceBack"><span>‹</span>Ajustes</button><h1>Aparência</h1></div>
        </header>
        <section class="settings-group"><h2>Visual</h2><div class="settings-card" id="rmAppearanceVisualCard"></div></section>
        <section class="settings-group"><h2>Interface</h2><div class="settings-card list-card" id="rmAppearanceInterfaceCard"></div></section>
        <section class="settings-group"><h2>Avançado</h2><div class="settings-card list-card" id="rmAppearanceAdvancedCard"></div></section>`;
      main.appendChild(view);
      view.querySelector('#rmAppearanceBack').onclick = () => {
        document.body.classList.remove('rm-appearance-subview');
        if (typeof window.switchTab === 'function') window.switchTab('settings');
      };
    }

    const visualCard = document.getElementById('rmAppearanceVisualCard');
    const interfaceCard = document.getElementById('rmAppearanceInterfaceCard');
    const advancedCard = document.getElementById('rmAppearanceAdvancedCard');

    const theme = document.getElementById('themeControl')?.closest('.setting-block');
    const palette = document.getElementById('semanticPaletteControl')?.closest('.setting-block');
    const visualMode = document.getElementById('visualModeControl')?.closest('.setting-block');
    const iconSize = document.getElementById('iconSizeControl')?.closest('.setting-block');
    const showVersion = document.getElementById('showVersionToggle')?.closest('.setting-inline, .setting-block');
    const hideLabels = document.getElementById('hideTabLabelsToggle')?.closest('.setting-inline, .setting-block');
    const customIcons = document.getElementById('customIconsBtn');
    const tabLab = document.getElementById('tabbarLabBtn');

    [theme, palette, visualMode].forEach(node => {
      if (node && node.parentElement !== visualCard) appendSetting(visualCard, node);
    });
    [iconSize, showVersion, hideLabels].forEach(node => {
      if (node && node.parentElement !== interfaceCard) appendSetting(interfaceCard, node);
    });
    [customIcons, tabLab].forEach(node => {
      if (node && node.parentElement !== advancedCard) appendSetting(advancedCard, node);
    });

    const groups = [...settings.querySelectorAll(':scope > .settings-group')];
    const appearanceGroup = groups.find(g => normalizeLabel(g.querySelector(':scope > h2')?.textContent) === 'aparencia');
    const advancedGroup = groups.find(g => normalizeLabel(g.querySelector(':scope > h2')?.textContent) === 'personalizacao avancada');
    if (appearanceGroup && appearanceGroup.id !== 'rmAppearanceEntryGroup') appearanceGroup.remove();
    if (advancedGroup) advancedGroup.remove();

    let entry = document.getElementById('rmAppearanceEntryGroup');
    if (!entry) {
      entry = document.createElement('section');
      entry.id = 'rmAppearanceEntryGroup';
      entry.className = 'settings-group';
      entry.innerHTML = `<h2>Aparência</h2><div class="settings-card list-card"><button class="settings-row" id="rmAppearanceSettingsBtn"><span class="settings-row-icon" data-icon="spark"></span><span><strong>Personalizar aparência</strong><small>Tema, paletas, efeitos e barra inferior</small></span><span class="chevron">›</span></button></div>`;
      const allGroups = [...settings.querySelectorAll(':scope > .settings-group')];
      const dataGroup = allGroups.find(g => ['dados', 'dados e atualizacao'].includes(normalizeLabel(g.querySelector(':scope > h2')?.textContent)));
      const development = allGroups.find(g => normalizeLabel(g.querySelector(':scope > h2')?.textContent) === 'desenvolvimento');
      if (dataGroup) dataGroup.insertAdjacentElement('afterend', entry);
      else if (development) development.insertAdjacentElement('beforebegin', entry);
      else settings.appendChild(entry);
      try { if (typeof window.hydrateIcons === 'function') window.hydrateIcons(entry); } catch (_) {}
      document.getElementById('rmAppearanceSettingsBtn').onclick = () => {
        document.body.classList.add('rm-appearance-subview');
        if (typeof window.switchTab === 'function') window.switchTab('appearance');
      };
    }
    return true;
  }

  function pad2(value) { return String(value).padStart(2, '0'); }
  function backupStamp(date = new Date()) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}_${pad2(date.getHours())}-${pad2(date.getMinutes())}-${pad2(date.getSeconds())}`;
  }

  function downloadJson(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  async function buildBackupPayload(kind = 'full') {
    const createdAt = new Date();
    const events = await allEvents();
    const medications = await allMedications();
    const currentSettings = { ...getSettings() };
    const compatibleSettings = {};
    return {
      app: 'Registro Mental',
      backupFormat: BACKUP_FORMAT,
      kind: kind === 'official' ? 'official-compatible' : 'full',
      createdAt: createdAt.toISOString(),
      exportedAt: createdAt.toISOString(),
      source: {
        environment: 'beta',
        release: String(window.REGISTRO_SHELL_RELEASE || '1.2.0-beta.10')
      },
      compatibility: {
        stableImport: true,
        minimumOfficial: '1.1.1',
        settingsPolicy: kind === 'official' ? 'data-first' : 'full'
      },
      counts: { events: events.length, medications: medications.length },
      events,
      medications,
      settings: kind === 'official' ? compatibleSettings : currentSettings
    };
  }

  async function exportBackup(kind = 'full') {
    try {
      const payload = await buildBackupPayload(kind);
      const prefix = kind === 'official' ? 'Registro-Mental_para-Oficial' : 'Registro-Mental-Beta_backup';
      downloadJson(payload, `${prefix}_${backupStamp()}.json`);
      try { localStorage.setItem('registro-beta-last-backup', new Date().toISOString()); } catch (_) {}
      try { if (typeof window.renderBackupState === 'function') window.renderBackupState(); } catch (_) {}
      safeToast(kind === 'official' ? 'Backup compatível com a Oficial criado.' : 'Backup externo criado.');
    } catch (error) {
      console.error('Beta: falha ao exportar backup.', error);
      alert('Não foi possível criar o backup. Seus dados locais não foram alterados.');
    }
  }

  function ensureExternalBackupRows() {
    const exportButton = document.getElementById('exportBtn');
    const importButton = document.getElementById('importBtn');
    if (!exportButton || !importButton) return false;

    exportButton.onclick = () => exportBackup('full');
    const status = exportButton.querySelector('#backupStatusText') || exportButton.querySelector('small');
    if (status && !status.dataset.rmTimestampHint) {
      status.dataset.rmTimestampHint = '1';
      if (!String(status.textContent).includes('data e horário')) status.textContent = 'JSON com data e horário no nome';
    }

    if (!document.getElementById('rmOfficialBackupBtn')) {
      const separator = makeSeparator();
      separator.id = 'rmOfficialBackupSeparator';
      const button = document.createElement('button');
      button.id = 'rmOfficialBackupBtn';
      button.className = 'settings-row';
      button.innerHTML = `<span class="settings-row-icon" data-icon="export"></span><span><strong>Backup para Oficial estável</strong><small>Cria uma cópia preparada para retornar à versão Oficial</small></span><span class="chevron">›</span>`;
      exportButton.insertAdjacentElement('afterend', separator);
      separator.insertAdjacentElement('afterend', button);
      button.onclick = () => exportBackup('official');
      try { if (typeof window.hydrateIcons === 'function') window.hydrateIcons(button); } catch (_) {}
    }
    return true;
  }

  function getAudioStore(mode = 'readonly') {
    return db.transaction(AUDIO, mode).objectStore(AUDIO);
  }

  function requestPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Falha no armazenamento local.'));
    });
  }

  async function snapshotRecords() {
    const rows = await requestPromise(getAudioStore().getAll());
    return rows.filter(row => typeof row?.id === 'string' && row.id.startsWith(SNAPSHOT_PREFIX))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }

  async function createAutomaticSnapshot(force = false) {
    if (typeof db === 'undefined' || !db) return null;
    const now = new Date();
    const day = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    const id = `${SNAPSHOT_PREFIX}${day}`;
    if (!force) {
      const existing = await requestPromise(getAudioStore().get(id));
      if (existing?.snapshot) return existing;
    }
    const snapshot = {
      events: await allEvents(),
      medications: await allMedications(),
      settings: { ...getSettings() }
    };
    const record = { id, createdAt: now.toISOString(), backupFormat: BACKUP_FORMAT, snapshot };
    await requestPromise(getAudioStore('readwrite').put(record));
    const all = await snapshotRecords();
    for (const extra of all.slice(SNAPSHOT_RETENTION)) {
      await requestPromise(getAudioStore('readwrite').delete(extra.id));
    }
    refreshSnapshotStatus();
    return record;
  }

  async function restoreSnapshot(record) {
    if (!record?.snapshot) return;
    const before = {
      events: await allEvents(),
      medications: await allMedications(),
      settings: { ...getSettings() }
    };
    await requestPromise(getAudioStore('readwrite').put({ id: IMPORT_UNDO_ID, createdAt: new Date().toISOString(), snapshot: before }));
    await new Promise((resolve, reject) => {
      const tx = db.transaction([EVENTS, MEDICATIONS], 'readwrite');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Falha ao restaurar snapshot.'));
      tx.onabort = () => reject(tx.error || new Error('Restauração cancelada.'));
      const eventsStore = tx.objectStore(EVENTS);
      const medsStore = tx.objectStore(MEDICATIONS);
      eventsStore.clear(); medsStore.clear();
      (record.snapshot.events || []).forEach(item => eventsStore.put({ ...item }));
      (record.snapshot.medications || []).forEach(item => medsStore.put({ ...item }));
    });
    saveSettings(record.snapshot.settings || {});
    safeToast('Snapshot restaurado. Reabrindo o app…');
    setTimeout(() => location.reload(), 350);
  }

  async function openSnapshotManager() {
    try {
      await createAutomaticSnapshot(false);
      const rows = await snapshotRecords();
      const content = rows.length ? rows.map((row, index) => {
        const date = new Date(row.createdAt);
        const e = row.snapshot?.events?.length || 0;
        const m = row.snapshot?.medications?.length || 0;
        return `<div class="rm-snapshot-row"><div><strong>${date.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })}</strong><small>${e} registro${e === 1 ? '' : 's'} · ${m} medicamento${m === 1 ? '' : 's'}</small></div><button type="button" data-rm-snapshot-index="${index}">Restaurar</button></div>`;
      }).join('') : '<div class="empty-state">Nenhum snapshot automático ainda.</div>';
      openBackdrop('Backups automáticos', `<div class="rm-backup-meta"><span>Retenção</span><strong>Últimos ${SNAPSHOT_RETENTION}</strong><span>Criação</span><strong>1 por dia</strong></div><div class="rm-snapshot-list">${content}</div><button type="button" class="secondary-button full-button" data-cancel>Fechar</button>`);
      document.querySelectorAll('[data-rm-snapshot-index]').forEach(button => {
        button.onclick = () => {
          const row = rows[Number(button.dataset.rmSnapshotIndex)];
          if (!row) return;
          if (confirm('Restaurar este snapshot? O estado atual será guardado para permitir desfazer a restauração.')) restoreSnapshot(row).catch(error => { console.error(error); alert('Não foi possível restaurar este snapshot.'); });
        };
      });
    } catch (error) {
      console.error('Beta: falha ao abrir snapshots.', error);
      alert('Não foi possível ler os backups automáticos.');
    }
  }

  async function refreshSnapshotStatus() {
    const small = document.getElementById('rmAutoSnapshotStatus');
    if (!small || typeof db === 'undefined' || !db) return;
    try {
      const rows = await snapshotRecords();
      if (!rows.length) small.textContent = 'Ainda não há snapshot interno';
      else small.textContent = `${rows.length} snapshot${rows.length === 1 ? '' : 's'} · último ${new Date(rows[0].createdAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}`;
    } catch (_) {}
  }

  function ensureSnapshotRow() {
    const importButton = document.getElementById('importBtn');
    if (!importButton || document.getElementById('rmAutoSnapshotBtn')) return Boolean(importButton);
    const separator = makeSeparator();
    const button = document.createElement('button');
    button.id = 'rmAutoSnapshotBtn';
    button.className = 'settings-row';
    button.innerHTML = `<span class="settings-row-icon" data-icon="history"></span><span><strong>Backups automáticos</strong><small id="rmAutoSnapshotStatus">Snapshots internos dos últimos dias</small></span><span class="chevron">›</span>`;
    importButton.insertAdjacentElement('afterend', separator);
    separator.insertAdjacentElement('afterend', button);
    button.onclick = openSnapshotManager;
    try { if (typeof window.hydrateIcons === 'function') window.hydrateIcons(button); } catch (_) {}
    refreshSnapshotStatus();
    return true;
  }

  function validBackupShape(parsed) {
    if (Array.isArray(parsed)) return { format: 1 };
    if (!parsed || typeof parsed !== 'object') throw new Error('O conteúdo do backup não é válido.');
    const format = Number(parsed.backupFormat || 1);
    if (!Number.isFinite(format) || format < 1) throw new Error('A versão do formato de backup é inválida.');
    if (format > BACKUP_FORMAT) throw new Error(`Este backup usa o formato ${format}, mas esta Beta entende até o formato ${BACKUP_FORMAT}. Atualize o aplicativo antes de importar.`);
    if (!Array.isArray(parsed.events)) throw new Error('O backup não contém uma lista de registros.');
    return { format };
  }

  function installBackupFormatGate() {
    const input = document.getElementById('importFile');
    const current = window.importData;
    if (!input || typeof current !== 'function' || current.__rmFormatGate) return false;
    const original = current;
    const gated = async file => {
      const parsed = JSON.parse(await file.text());
      validBackupShape(parsed);
      return original(file);
    };
    gated.__rmFormatGate = true;
    gated.__rmOriginal = original;
    window.importData = gated;
    input.onchange = async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      try { await gated(file); }
      catch (error) {
        console.error('Beta: backup recusado pela verificação de formato.', error);
        alert(`Este arquivo não pode ser importado.\n\n${error?.message || 'Formato incompatível.'}\n\nNenhum dado atual foi alterado.`);
      }
    };
    return true;
  }

  function wrapMutator(name) {
    const original = window[name];
    if (typeof original !== 'function' || original.__rmSnapshotWrapped) return false;
    const wrapped = async function(...args) {
      const result = await original.apply(this, args);
      createAutomaticSnapshot(false).catch(error => console.warn('Snapshot automático não pôde ser criado.', error));
      return result;
    };
    wrapped.__rmSnapshotWrapped = true;
    wrapped.__rmOriginal = original;
    window[name] = wrapped;
    return true;
  }

  function installAutomaticSnapshotHooks() {
    ['putEvent', 'deleteEvent', 'putMedication', 'deleteMedication'].forEach(wrapMutator);
    createAutomaticSnapshot(false).catch(error => console.warn('Snapshot inicial não pôde ser criado.', error));
  }

  function applySafetyAndAppearance() {
    installSafetyStyles();
    ensureAppearanceSubview();
    ensureExternalBackupRows();
    ensureSnapshotRow();
    installBackupFormatGate();
    installAutomaticSnapshotHooks();
  }

  applySafetyAndAppearance();
  window.addEventListener('registro:release-ready', applySafetyAndAppearance);
  document.addEventListener('DOMContentLoaded', applySafetyAndAppearance, { once: true });
  [80, 300, 900, 1800, 3200].forEach(ms => setTimeout(applySafetyAndAppearance, ms));
})();
