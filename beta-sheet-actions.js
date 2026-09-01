/* Registro Mental Beta — ações de sheet compactas e fechamento único. */
(() => {
  'use strict';

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

  function apply() {
    installStyles();
    enlargeCloseIcon();
    removeRedundantSheetCancels();
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

  document.addEventListener('DOMContentLoaded', () => {
    apply();
    observeSheetForm();
  }, { once: true });

  document.addEventListener('registro:release-ready', () => {
    apply();
    observeSheetForm();
  });
})();
