/* Registro Mental Beta 1.2.0-beta.14 — carregador seguro dos patches estáveis + escala emocional 0–10. */
(() => {
  'use strict';
  const RELEASE='1.2.0-beta.14';
  const nonce=Date.now();

  function paintRelease(){
    window.REGISTRO_CURRENT_RELEASE=RELEASE;
    window.REGISTRO_EXPECTED_RELEASE=RELEASE;
    const top=document.getElementById('topVersion');
    const about=document.getElementById('versionLabel');
    if(top)top.textContent=`v${RELEASE}`;
    if(about)about.textContent=RELEASE;
  }

  function load(src){
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=src;
      script.async=true;
      script.onload=resolve;
      script.onerror=()=>reject(new Error(`Falha ao carregar ${src}`));
      document.head.appendChild(script);
    });
  }

  paintRelease();
  (async()=>{
    try{
      await load(`./patches-base-1.2.0-beta.13.js?base=1.2.0-beta.13&load=${nonce}`);
    }catch(error){
      console.warn('Registro Beta: patches base não bloqueantes',error);
    }
    paintRelease();
    try{
      await load(`../mood-scale-10.js?v=${encodeURIComponent(RELEASE)}&load=${nonce}`);
    }catch(error){
      console.error('Registro Beta: escala emocional 0–10 não carregou',error);
    }
    paintRelease();
  })();
})();
