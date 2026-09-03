/* Registro Mental V1 — bootloader resiliente e não bloqueante */
(() => {
  'use strict';

  const RELEASE = String(window.REGISTRO_SHELL_RELEASE || '1.2.0-beta.4');
  const STARTED = performance.now();
  const scopeToken = '/Registro-mental-v1/beta/';
  const hadControllerAtStart = Boolean(navigator.serviceWorker?.controller);
  const bootNonce = Date.now();

  const boot = document.getElementById('rmBoot');
  const headline = document.getElementById('rmBootHeadline');
  const detail = document.getElementById('rmBootDetail');
  const progress = document.getElementById('rmBootProgress');
  const diagnostics = document.getElementById('rmBootDiagnostics');
  const actions = document.getElementById('rmBootActions');
  const retryButton = document.getElementById('rmBootRetry');
  const safeButton = document.getElementById('rmBootSafe');
  const recoverButton = document.getElementById('rmBootRecover');
  const copyButton = document.getElementById('rmBootCopy');

  window.__RM_BOOT_STARTED = true;
  window.__RM_BOOT_DIAGNOSTICS = [];
  const fakeRegistration = { update: async () => undefined, unregister: async () => true, waiting: null, installing: null, active: null, scope: location.href };
  window.__RM_DISABLED_SW_REGISTER = async () => fakeRegistration;

  let appScriptLoaded = false;
  let releaseEventSeen = false;
  let lastFatal = null;
  const nowMs = () => Math.round(performance.now() - STARTED);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const twoPaints = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const withTimeout = (promise, ms, label) => Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} excedeu ${ms} ms`)), ms))
  ]);

  function log(kind, message, extra = '') {
    const entry = { t: nowMs(), kind, message, extra: extra ? String(extra) : '' };
    window.__RM_BOOT_DIAGNOSTICS.push(entry);
    if (window.__RM_BOOT_DIAGNOSTICS.length > 100) window.__RM_BOOT_DIAGNOSTICS.shift();
    if (diagnostics) diagnostics.textContent = window.__RM_BOOT_DIAGNOSTICS.map(item => `${String(item.t).padStart(4, ' ')} ms  ${item.kind.toUpperCase().padEnd(5, ' ')}  ${item.message}${item.extra ? ` — ${item.extra}` : ''}`).join('\n');
  }
  function setStep(name, state, text) { const row = document.querySelector(`[data-boot-step="${name}"]`); if (!row) return; row.dataset.state = state; const value = row.querySelector('[data-boot-value]'); if (value) value.textContent = text; }
  function setProgress(value) { if (progress) progress.style.width = `${Math.max(4, Math.min(100, value))}%`; }
  function setMessage(title, subtitle) { if (headline) headline.textContent = title; if (detail) detail.textContent = subtitle; }

  async function inspectRuntime() {
    let registrations = null, cacheKeys = null;
    try {
      if ('serviceWorker' in navigator) registrations = (await withTimeout(navigator.serviceWorker.getRegistrations(), 700, 'Consulta de Service Worker')).filter(reg => String(reg.scope || '').includes(scopeToken));
      else registrations = [];
    } catch (error) { log('warn', 'Consulta de Service Worker demorou demais', error.message); }
    try {
      if ('caches' in window) cacheKeys = (await withTimeout(caches.keys(), 700, 'Consulta de cache')).filter(key => key.startsWith('registro-beta-v1-'));
      else cacheKeys = [];
    } catch (error) { log('warn', 'Consulta de cache demorou demais', error.message); }
    return { registrations, cacheKeys };
  }

  async function clearObsoleteRuntime() {
    setStep('cache', 'active', 'limpando');
    let removedWorkers = 0, removedCaches = 0;
    try {
      const before = await inspectRuntime();
      if (Array.isArray(before.registrations) && before.registrations.length) {
        const jobs = before.registrations.map(reg => withTimeout(reg.unregister(), 700, 'Desregistro de Service Worker').catch(() => false));
        const results = await Promise.all(jobs);
        removedWorkers = results.filter(Boolean).length;
      }
      if (Array.isArray(before.cacheKeys) && before.cacheKeys.length) {
        const jobs = before.cacheKeys.map(key => withTimeout(caches.delete(key), 700, 'Remoção de cache').catch(() => false));
        const results = await Promise.all(jobs);
        removedCaches = results.filter(Boolean).length;
      }
      const after = await inspectRuntime();
      const confirmed = Array.isArray(after.registrations) && Array.isArray(after.cacheKeys);
      const clean = confirmed && after.registrations.length === 0 && after.cacheKeys.length === 0;
      if (clean) {
        setStep('cache', 'ok', 'limpo');
        log('ok', 'Runtime antigo neutralizado', `${removedWorkers} worker(s), ${removedCaches} cache(s)`);
      } else {
        setStep('cache', 'warn', confirmed ? 'parcial' : 'não bloqueante');
        log('warn', confirmed ? 'Runtime antigo ainda pode ter resíduos' : 'Verificação do runtime não respondeu a tempo', 'o app continuará com arquivos de URL única');
      }
      try { localStorage.setItem(`registro-beta-v1-runtime-clean-${RELEASE}`, clean ? '1' : '0'); } catch (_) {}
      return { clean, confirmed };
    } catch (error) {
      setStep('cache', 'warn', 'não bloqueante');
      log('warn', 'Limpeza do runtime falhou sem bloquear o app', error?.message || error);
      return { clean: false, confirmed: false };
    }
  }

  async function checkStorage() {
    let localOk = false;
    try { const key = '__rm_boot_storage_test__'; localStorage.setItem(key, '1'); localStorage.removeItem(key); localOk = true; } catch (error) { log('warn', 'localStorage indisponível', error?.message || error); }
    const idbOk = 'indexedDB' in window;
    if (localOk && idbOk) { setStep('storage', 'ok', 'disponível'); log('ok', 'Armazenamento local disponível', 'IndexedDB + localStorage'); }
    else { setStep('storage', 'warn', idbOk ? 'limitado' : 'indisponível'); log('warn', 'Armazenamento local com limitação'); }
    try { if (navigator.storage?.estimate) { const estimate = await withTimeout(navigator.storage.estimate(), 700, 'Estimativa de armazenamento'); const used = Number(estimate.usage || 0), quota = Number(estimate.quota || 0); if (quota > 0) log('info', 'Uso de armazenamento', `${Math.round(used / 1024 / 1024)} MB de ${Math.round(quota / 1024 / 1024)} MB`); } } catch (_) {}
  }

  function loadScript(path, timeoutMs) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const src = `${path}?v=${encodeURIComponent(RELEASE)}&boot=${bootNonce}`;
      const timer = setTimeout(() => { script.remove(); reject(new Error(`Tempo excedido ao carregar ${path}`)); }, timeoutMs);
      script.src = src; script.async = true;
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => { clearTimeout(timer); reject(new Error(`Falha ao carregar ${path}`)); };
      document.head.appendChild(script);
    });
  }

  function appLooksFunctional() {
    const shell = document.querySelector('.app-shell'), tabbar = document.querySelector('.tab-bar'), action = document.querySelector('.action-card');
    const hasCoreFunctions = typeof window.renderAll === 'function' || typeof window.openDB === 'function';
    return Boolean(shell && tabbar && action && hasCoreFunctions);
  }
  async function waitForFunctionalState(timeoutMs = 6500) { const started = performance.now(); while (performance.now() - started < timeoutMs) { if (releaseEventSeen || window.REGISTRO_CURRENT_RELEASE || appLooksFunctional()) return true; await sleep(100); } return appLooksFunctional(); }

  function showFailure(title, subtitle, error) {
    document.body.classList.add('rm-boot-failed'); setMessage(title, subtitle); setProgress(100);
    if (actions) actions.hidden = false; if (diagnostics) diagnostics.hidden = false;
    if (error) log('error', 'Falha de inicialização', error?.message || error);
    setStep('ready', 'error', 'falhou');
  }
  async function finishSuccess() {
    setStep('ready', 'ok', 'pronto'); setProgress(100); setMessage('Tudo pronto', `Registro ${RELEASE} iniciado em ${nowMs()} ms`); log('ok', 'Aplicativo pronto para uso', `${nowMs()} ms`);
    await sleep(100); document.body.classList.remove('rm-booting', 'rm-boot-failed'); document.body.classList.add('rm-boot-complete');
    if (boot) { boot.classList.add('rm-boot-hide'); setTimeout(() => boot.remove(), 240); }
  }

  window.addEventListener('error', event => { const source = String(event.filename || ''), message = event.message || 'Erro JavaScript'; if (/app\.js|patches\.js|boot\.js/i.test(source) || appScriptLoaded) { lastFatal = { message, source }; log('error', message, source ? source.split('/').pop() : 'runtime'); } });
  window.addEventListener('unhandledrejection', event => { const reason = event.reason?.message || String(event.reason || 'Promise rejeitada'); lastFatal = { message: reason, source: 'promise' }; log('error', 'Promise rejeitada', reason); });
  window.addEventListener('registro:release-ready', event => { releaseEventSeen = true; log('ok', 'Evento de versão recebido', event.detail?.release || RELEASE); });

  retryButton?.addEventListener('click', () => location.replace(`./?v=${encodeURIComponent(RELEASE)}&retry=${Date.now()}`));
  safeButton?.addEventListener('click', () => { location.href = `./safe.html?v=${encodeURIComponent(RELEASE)}&safe=${Date.now()}`; });
  recoverButton?.addEventListener('click', () => { location.href = `./recover.html?v=${encodeURIComponent(RELEASE)}&from=boot&recover=${Date.now()}`; });
  copyButton?.addEventListener('click', async () => {
    const payload = [`Registro Mental ${RELEASE}`, `URL: ${location.href}`, `Standalone: ${window.matchMedia?.('(display-mode: standalone)')?.matches ? 'sim' : 'não'}`, `Controlado por Service Worker ao abrir: ${hadControllerAtStart ? 'sim' : 'não'}`, `Controlador residual agora: ${navigator.serviceWorker?.controller ? 'sim' : 'não'}`, `Online: ${navigator.onLine ? 'sim' : 'não'}`, `User agent: ${navigator.userAgent}`, '', ...window.__RM_BOOT_DIAGNOSTICS.map(item => `${item.t}ms ${item.kind}: ${item.message}${item.extra ? ` — ${item.extra}` : ''}`)].join('\n');
    try { await navigator.clipboard.writeText(payload); copyButton.textContent = 'Diagnóstico copiado'; } catch (_) { if (diagnostics) { diagnostics.hidden = false; diagnostics.textContent = payload; } }
  });

  async function start() {
    setStep('shell', 'ok', 'visível'); setProgress(10); log('ok', 'Tela de inicialização exibida');
    if (hadControllerAtStart) log('warn', 'Aba nasceu controlada por Service Worker antigo');
    await twoPaints(); setProgress(18);

    const storagePromise = checkStorage();
    const cleanupPromise = clearObsoleteRuntime();
    let runtime;
    try {
      runtime = await withTimeout(cleanupPromise, 1800, 'Limpeza do ambiente web');
    } catch (error) {
      runtime = { clean: false, confirmed: false };
      setStep('cache', 'warn', 'em segundo plano');
      log('warn', 'Limpeza excedeu o limite e deixou de bloquear a abertura', error.message);
    }
    Promise.allSettled([storagePromise, cleanupPromise]).catch(() => {});

    if (hadControllerAtStart) {
      log(runtime.clean ? 'ok' : 'warn', runtime.clean ? 'Controlador antigo removido' : 'Controlador residual tratado como não bloqueante', 'carregando arquivos com URL única');
    }

    try {
      setStep('engine', 'active', 'carregando'); setMessage('Abrindo o Registro', 'Carregando o motor principal…'); setProgress(32); log('info', 'Carregando app.js com URL única');
      await loadScript('./app.js', 18000); appScriptLoaded = true; setStep('engine', 'ok', 'carregado'); setProgress(64); log('ok', 'Motor principal carregado');
    } catch (error) { showFailure('O motor do app não abriu', 'Seus dados continuam preservados. Use Recuperar ou Modo seguro.', error); return; }

    try {
      setStep('patches', 'active', 'aplicando'); setMessage('Finalizando', 'Aplicando correções e personalizações…'); setProgress(74);
      await loadScript('./patches.js', 8000); setStep('patches', 'ok', 'aplicadas'); log('ok', 'Correções finais carregadas');
    } catch (error) { setStep('patches', 'warn', 'parcial'); log('warn', 'Correções finais não carregaram', error?.message || error); }

    setStep('ready', 'active', 'verificando'); setProgress(86); setMessage('Quase pronto', 'Verificando se a interface respondeu…');
    const functional = await waitForFunctionalState();
    if (!functional) { showFailure('A interface não respondeu', 'Os arquivos carregaram, mas o app não confirmou funcionamento. Seus dados não foram apagados.', lastFatal ? new Error(lastFatal.message) : null); return; }
    await twoPaints(); await finishSuccess();
  }

  start().catch(error => showFailure('Falha inesperada na inicialização', 'Seus dados locais permanecem preservados.', error));
})();
