/* Registro Mental V1 — bootloader resiliente */
(() => {
  'use strict';

  const RELEASE = String(window.REGISTRO_SHELL_RELEASE || '__RELEASE__');
  const BOOT_STARTED_AT = performance.now();
  const scopeToken = '/Registro-mental-v1/';
  const hadControllerAtStart = Boolean(navigator.serviceWorker?.controller);
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

  const fakeRegistration = {
    update: async () => undefined,
    unregister: async () => true,
    waiting: null,
    installing: null,
    active: null,
    scope: location.href
  };
  window.__RM_DISABLED_SW_REGISTER = async () => fakeRegistration;

  let lastFatal = null;
  let appScriptLoaded = false;
  let releaseEventSeen = false;

  function nowMs() {
    return Math.round(performance.now() - BOOT_STARTED_AT);
  }

  function log(kind, message, extra = '') {
    const entry = { t: nowMs(), kind, message, extra: extra ? String(extra) : '' };
    window.__RM_BOOT_DIAGNOSTICS.push(entry);
    if (window.__RM_BOOT_DIAGNOSTICS.length > 80) window.__RM_BOOT_DIAGNOSTICS.shift();
    renderDiagnostics();
  }

  function renderDiagnostics() {
    if (!diagnostics) return;
    diagnostics.textContent = window.__RM_BOOT_DIAGNOSTICS
      .map(item => `${String(item.t).padStart(4, ' ')} ms  ${item.kind.toUpperCase().padEnd(5, ' ')}  ${item.message}${item.extra ? ` — ${item.extra}` : ''}`)
      .join('\n');
  }

  function setStep(name, state, text) {
    const row = document.querySelector(`[data-boot-step="${name}"]`);
    if (!row) return;
    row.dataset.state = state;
    const value = row.querySelector('[data-boot-value]');
    if (value) value.textContent = text;
  }

  function setProgress(value) {
    if (progress) progress.style.width = `${Math.max(4, Math.min(100, value))}%`;
  }

  function setMessage(title, subtitle) {
    if (headline) headline.textContent = title;
    if (detail) detail.textContent = subtitle;
  }

  function twoPaints() {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function clearObsoleteRuntimeOnce() {
    const cleanupKey = `registro-v1-runtime-clean-${RELEASE}`;
    let alreadyClean = false;
    try { alreadyClean = localStorage.getItem(cleanupKey) === '1'; } catch (_) {}

    // Se esta própria página ainda está sob controle de um SW antigo, a limpeza
    // precisa rodar novamente mesmo que a chave local diga que já foi feita.
    if (alreadyClean && !navigator.serviceWorker?.controller) {
      setStep('cache', 'ok', 'limpo');
      log('ok', 'Cache de desenvolvimento já revisado');
      return;
    }

    let removedWorkers = 0;
    let removedCaches = 0;
    try {
      setStep('cache', 'active', 'limpando');
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const targets = registrations.filter(reg => String(reg.scope || '').includes(scopeToken));
        const results = await Promise.allSettled(targets.map(reg => reg.unregister()));
        removedWorkers = results.filter(r => r.status === 'fulfilled' && r.value).length;
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        const targets = keys.filter(key => key.startsWith('registro-v1-'));
        const results = await Promise.allSettled(targets.map(key => caches.delete(key)));
        removedCaches = results.filter(r => r.status === 'fulfilled' && r.value).length;
      }
      try { localStorage.setItem(cleanupKey, '1'); } catch (_) {}
      setStep('cache', 'ok', 'limpo');
      log('ok', 'Runtime antigo neutralizado', `${removedWorkers} worker(s), ${removedCaches} cache(s)`);
    } catch (error) {
      setStep('cache', 'warn', 'parcial');
      log('warn', 'Não foi possível limpar todo o runtime antigo', error?.message || error);
    }
  }

  async function checkStorage() {
    let localOk = false;
    try {
      const key = '__rm_boot_storage_test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      localOk = true;
    } catch (error) {
      log('warn', 'localStorage indisponível', error?.message || error);
    }

    const idbOk = 'indexedDB' in window;
    if (localOk && idbOk) {
      setStep('storage', 'ok', 'disponível');
      log('ok', 'Armazenamento local disponível', 'IndexedDB + localStorage');
    } else {
      setStep('storage', 'warn', idbOk ? 'limitado' : 'indisponível');
      log('warn', 'Armazenamento local com limitação');
    }

    try {
      if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate();
        const used = Number(estimate.usage || 0);
        const quota = Number(estimate.quota || 0);
        if (quota > 0) log('info', 'Uso de armazenamento', `${Math.round(used / 1024 / 1024)} MB de ${Math.round(quota / 1024 / 1024)} MB`);
      }
    } catch (_) {}
  }

  function loadScript(src, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => {
        script.remove();
        reject(new Error(`Tempo excedido ao carregar ${src}`));
      }, timeoutMs);
      script.src = src;
      script.async = true;
      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Falha de rede ao carregar ${src}`));
      };
      document.head.appendChild(script);
    });
  }

  function appLooksFunctional() {
    const shell = document.querySelector('.app-shell');
    const tabbar = document.querySelector('.tab-bar');
    const action = document.querySelector('.action-card');
    const hasCoreFunctions = typeof window.renderAll === 'function' || typeof window.openDB === 'function';
    return Boolean(shell && tabbar && action && hasCoreFunctions);
  }

  async function waitForFunctionalState(timeoutMs = 6500) {
    const started = performance.now();
    while (performance.now() - started < timeoutMs) {
      if (releaseEventSeen || window.REGISTRO_CURRENT_RELEASE || appLooksFunctional()) return true;
      await sleep(100);
    }
    return appLooksFunctional();
  }

  function installErrorCapture() {
    window.addEventListener('error', event => {
      const source = String(event.filename || '');
      const message = event.message || 'Erro JavaScript';
      const relevant = /app\.js|patches\.js|boot\.js/i.test(source) || appScriptLoaded;
      if (relevant) {
        lastFatal = { message, source, line: event.lineno || 0, column: event.colno || 0 };
        log('error', message, source ? `${source.split('/').pop()}:${event.lineno || 0}` : 'runtime');
      }
    });
    window.addEventListener('unhandledrejection', event => {
      const reason = event.reason?.message || String(event.reason || 'Promise rejeitada');
      log('error', 'Promise rejeitada', reason);
      lastFatal = { message: reason, source: 'promise' };
    });
    window.addEventListener('registro:release-ready', event => {
      releaseEventSeen = true;
      log('ok', 'Evento de versão recebido', event.detail?.release || RELEASE);
    });
  }

  function showFailure(title, subtitle, error) {
    document.body.classList.add('rm-boot-failed');
    setMessage(title, subtitle);
    setProgress(100);
    if (actions) actions.hidden = false;
    if (diagnostics) diagnostics.hidden = false;
    if (error) log('error', 'Falha de inicialização', error?.message || error);
    setStep('ready', 'error', 'falhou');
  }

  async function finishSuccess() {
    setStep('ready', 'ok', 'pronto');
    setProgress(100);
    setMessage('Tudo pronto', `Registro ${RELEASE} iniciado em ${nowMs()} ms`);
    log('ok', 'Aplicativo pronto para uso', `${nowMs()} ms`);
    await sleep(120);
    document.body.classList.remove('rm-booting', 'rm-boot-failed');
    document.body.classList.add('rm-boot-complete');
    if (boot) {
      boot.classList.add('rm-boot-hide');
      setTimeout(() => boot.remove(), 260);
    }
  }

  retryButton?.addEventListener('click', () => {
    location.replace(`./launch.html?v=${encodeURIComponent(RELEASE)}&retry=${Date.now()}`);
  });
  safeButton?.addEventListener('click', () => {
    location.href = `./safe.html?v=${encodeURIComponent(RELEASE)}`;
  });
  recoverButton?.addEventListener('click', () => {
    location.href = `./recover.html?v=${encodeURIComponent(RELEASE)}&from=boot`;
  });
  copyButton?.addEventListener('click', async () => {
    const payload = [
      `Registro Mental ${RELEASE}`,
      `URL: ${location.href}`,
      `Standalone: ${window.matchMedia?.('(display-mode: standalone)')?.matches ? 'sim' : 'não'}`,
      `Controlado por Service Worker ao abrir: ${hadControllerAtStart ? 'sim' : 'não'}`,
      `Online: ${navigator.onLine ? 'sim' : 'não'}`,
      `User agent: ${navigator.userAgent}`,
      '',
      ...window.__RM_BOOT_DIAGNOSTICS.map(item => `${item.t}ms ${item.kind}: ${item.message}${item.extra ? ` — ${item.extra}` : ''}`)
    ].join('\n');
    try {
      await navigator.clipboard.writeText(payload);
      copyButton.textContent = 'Diagnóstico copiado';
    } catch (_) {
      diagnostics.hidden = false;
      diagnostics.textContent = payload;
    }
  });

  async function start() {
    installErrorCapture();
    setStep('shell', 'ok', 'visível');
    setProgress(10);
    log('ok', 'Tela de inicialização exibida');
    if (hadControllerAtStart) log('warn', 'Página ainda controlada por Service Worker antigo');

    // Garante pelo menos um frame realmente pintado antes do bundle grande.
    await twoPaints();
    setProgress(18);

    const cleanupPromise = clearObsoleteRuntimeOnce();
    const storagePromise = checkStorage();

    // Um SW que já controla o documento continua podendo interceptar app.js até
    // a próxima navegação. Portanto, nessa situação NÃO carregamos o motor.
    // Limpamos a inscrição/cache e fazemos uma passagem pelo launcher primeiro.
    if (hadControllerAtStart) {
      setMessage('Removendo uma versão antiga', 'Preparando uma nova abertura sem cache intermediário…');
      setProgress(24);
      await Promise.allSettled([cleanupPromise, storagePromise]);
      try {
        const handoffKey = `registro-v1-sw-handoff-${RELEASE}`;
        const alreadyHandedOff = sessionStorage.getItem(handoffKey) === '1';
        if (!alreadyHandedOff) {
          sessionStorage.setItem(handoffKey, '1');
          log('info', 'Reabrindo pelo launcher após remover o controlador antigo');
          location.replace(`./launch.html?v=${encodeURIComponent(RELEASE)}&handoff=${Date.now()}`);
          return;
        }
      } catch (_) {
        location.replace(`./launch.html?v=${encodeURIComponent(RELEASE)}&handoff=${Date.now()}`);
        return;
      }

      // Se, excepcionalmente, o mesmo controlador persistiu após um handoff,
      // não arriscamos misturar arquivos. Mostramos recuperação em vez de app.
      if (navigator.serviceWorker?.controller) {
        showFailure(
          'Uma versão antiga ainda está controlando esta página',
          'Use Recuperar interface. Seus registros locais permanecem preservados.',
          null
        );
        return;
      }
    }

    try {
      setMessage('Abrindo o Registro', 'Carregando o motor principal…');
      setStep('engine', 'active', 'carregando');
      setProgress(30);
      log('info', 'Carregando app.js');
      await loadScript(`./app.js?v=${encodeURIComponent(RELEASE)}`, 18000);
      appScriptLoaded = true;
      setStep('engine', 'ok', 'carregado');
      setProgress(62);
      log('ok', 'Motor principal carregado');
    } catch (error) {
      showFailure('O motor do app não abriu', 'Seus dados continuam preservados. Use Recuperar ou Modo seguro abaixo.', error);
      return;
    }

    try {
      setMessage('Finalizando', 'Aplicando correções e personalizações…');
      setStep('patches', 'active', 'aplicando');
      setProgress(72);
      await loadScript(`./patches.js?v=${encodeURIComponent(RELEASE)}`, 8000);
      setStep('patches', 'ok', 'aplicadas');
      log('ok', 'Correções finais carregadas');
    } catch (error) {
      setStep('patches', 'warn', 'parcial');
      log('warn', 'Correções finais não carregaram', error?.message || error);
      // A interface principal pode continuar funcionando sem as correções cosméticas.
    }

    await Promise.allSettled([cleanupPromise, storagePromise]);
    setProgress(84);
    setStep('ready', 'active', 'verificando');
    setMessage('Quase pronto', 'Verificando se a interface respondeu…');

    const functional = await waitForFunctionalState();
    if (!functional) {
      showFailure(
        'A interface não respondeu',
        'O carregamento dos arquivos terminou, mas o app não confirmou que está funcional. Seus dados não foram apagados.',
        lastFatal ? new Error(lastFatal.message) : null
      );
      return;
    }

    await twoPaints();
    await finishSuccess();
  }

  start().catch(error => {
    showFailure('Falha inesperada na inicialização', 'Seus dados locais permanecem preservados.', error);
  });
})();
