/* Registro Mental V1 — correções finais isoladas do motor principal */
(() => {
  'use strict';

  const RELEASE = String(window.REGISTRO_SHELL_RELEASE || '__RELEASE__');
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
      const key = 'registro-settings-v2';
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
            .filter(reg => String(reg.scope || '').includes('/Registro-mental-v1/'))
            .map(reg => reg.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.allSettled(keys
            .filter(key => key.startsWith('registro-v1-'))
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
