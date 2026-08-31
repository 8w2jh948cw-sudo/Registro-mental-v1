/* Registro Mental V1 — símbolo de brilho padrão */
(() => {
  const ICON = `<svg class="svg-icon rm-spark-custom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.9141 24.8047" width="24" height="24" aria-hidden="true" focusable="false">
    <g>
      <rect height="24.8047" opacity="0" width="18.9141" x="0" y="0"/>
      <path d="M8.69531 4.85938C8.82031 4.85938 8.88281 4.78125 8.90625 4.66406C9.17969 3.0625 9.15625 2.92969 10.9375 2.63281C11.0547 2.61719 11.125 2.54688 11.125 2.42969C11.125 2.3125 11.0547 2.23438 10.9375 2.21875C9.15625 1.92188 9.17969 1.78906 8.90625 0.1875C8.88281 0.0703125 8.82031 0 8.69531 0C8.57031 0 8.50781 0.0703125 8.48438 0.1875C8.21094 1.78906 8.23438 1.92188 6.45312 2.21875C6.33594 2.23438 6.26562 2.3125 6.26562 2.42969C6.26562 2.54688 6.33594 2.61719 6.45312 2.63281C8.23438 2.92969 8.21094 3.0625 8.48438 4.66406C8.50781 4.78125 8.57031 4.85938 8.69531 4.85938Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M3.78125 11.7422C3.9375 11.7422 4.05469 11.6328 4.07812 11.4766C4.45312 8.77344 4.51562 8.79688 7.29688 8.26562C7.44531 8.23438 7.5625 8.13281 7.5625 7.96875C7.5625 7.80469 7.44531 7.69531 7.29688 7.67188C4.51562 7.25 4.44531 7.19531 4.07812 4.46875C4.05469 4.30469 3.9375 4.19531 3.78125 4.19531C3.625 4.19531 3.50781 4.30469 3.48438 4.47656C3.13281 7.17188 3.03125 7.14062 0.265625 7.67188C0.117188 7.70312 0 7.80469 0 7.96875C0 8.14062 0.117188 8.23438 0.296875 8.26562C3.04688 8.72656 3.13281 8.76562 3.48438 11.4609C3.50781 11.6328 3.625 11.7422 3.78125 11.7422Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M10.6172 22.9453C10.8594 22.9453 11.0391 22.7812 11.0703 22.5312C11.7578 16.8516 12.4922 16.1016 18.0781 15.5156C18.3359 15.4922 18.5078 15.3125 18.5078 15.0703C18.5078 14.8281 18.3359 14.6406 18.0781 14.6172C12.4922 14.0312 11.7578 13.2812 11.0703 7.60156C11.0391 7.35938 10.8594 7.1875 10.6172 7.1875C10.375 7.1875 10.2031 7.35938 10.1641 7.60156C9.47656 13.2812 8.74219 14.0312 3.15625 14.6172C2.89844 14.6406 2.72656 14.8281 2.72656 15.0703C2.72656 15.3125 2.89844 15.4922 3.15625 15.5156C8.72656 16.2344 9.42969 16.8594 10.1641 22.5312C10.2031 22.7812 10.375 22.9453 10.6172 22.9453Z" fill="currentColor" fill-opacity="0.85"/>
    </g>
  </svg>`;

  function ensureCleanStyle() {
    if (document.getElementById('rm-spark-clean-style')) return;
    const style = document.createElement('style');
    style.id = 'rm-spark-clean-style';
    style.textContent = `
      [data-rm-spark-icon="1"],
      [data-rm-spark-icon="1"] .rm-spark-custom,
      [data-rm-spark-icon="1"] .rm-spark-custom * {
        filter: none !important;
        -webkit-filter: none !important;
        text-shadow: none !important;
        box-shadow: none !important;
      }
      [data-rm-spark-icon="1"] .rm-spark-custom,
      [data-rm-spark-icon="1"] .rm-spark-custom * {
        outline: none !important;
        -webkit-text-stroke: 0 !important;
        stroke: none !important;
        stroke-width: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function replaceHolder(holder) {
    if (!holder) return;
    const alreadyNew = holder.dataset.rmSparkIcon === '1' && holder.querySelector('.rm-spark-custom');
    if (alreadyNew) return;
    holder.dataset.rmSparkIcon = '1';
    holder.removeAttribute('data-icon');
    holder.innerHTML = ICON;
  }

  function applySparkIcons() {
    ensureCleanStyle();

    // Todos os ícones que usam o estilo "spark" passam a usar este SVG.
    document.querySelectorAll('[data-icon="spark"]').forEach(replaceHolder);

    // Aprendizado usa o mesmo símbolo mesmo se algum módulo antigo atribuir outro nome de ícone.
    const learningTab = document.querySelector('[data-tab="learning"]');
    if (learningTab) replaceHolder(learningTab.querySelector('[data-icon]') || learningTab.querySelector('span'));
  }

  applySparkIcons();
  document.addEventListener('DOMContentLoaded', applySparkIcons, { once: true });
  new MutationObserver(applySparkIcons).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-icon']
  });
})();
