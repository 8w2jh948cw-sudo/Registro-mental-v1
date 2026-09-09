/* Registro Mental Oficial 1.1.10 — carregador seguro da aparência estável + escala emocional 0–10. */
(() => {
  'use strict';
  const RELEASE='1.1.10';
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
      await load(`./official-appearance-base-1.1.9.js?base=1.1.9&load=${nonce}`);
    }catch(error){
      console.warn('Registro Oficial: aparência base não bloqueante',error);
    }
    paintRelease();
    try{
      await load(`./mood-scale-10.js?v=${encodeURIComponent(RELEASE)}&load=${nonce}`);
    }catch(error){
      console.error('Registro Oficial: escala emocional 0–10 não carregou',error);
    }
    paintRelease();
  })();
})();
