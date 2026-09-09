/* Registro Mental — estabilização pós-abertura da migração 0–10.
   Repassa a base depois que IndexedDB estiver pronto para neutralizar a antiga migração 0–5. */
(() => {
  'use strict';
  const MARK='mood-lab-0-10-v1';
  const clamp=v=>Math.max(0,Math.min(10,Math.round(Number(v)||0)));
  const valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));

  async function waitForDatabase(){
    for(let attempt=0;attempt<100;attempt++){
      if(typeof window.allEvents==='function'){
        try{return await window.allEvents()}catch(_){}
      }
      await new Promise(resolve=>setTimeout(resolve,80));
    }
    throw new Error('Banco local não ficou pronto para estabilizar a escala 0–10.');
  }

  async function pass(){
    if(typeof window.allEvents!=='function'||typeof window.putEvent!=='function'||typeof window.getSettings!=='function'||typeof window.saveSettings!=='function')return false;
    const events=await waitForDatabase();
    const settings={...window.getSettings()};
    const alreadyTen=settings.rmMoodScale10Migration===MARK&&settings.moodScaleModel==='0-10';
    const priorWasFive=settings.moodScaleModel==='0-5'||(!alreadyTen&&settings.rmScaleMigration==='0-5_0-4_v1');
    let changed=0;
    for(const event of events){
      if(event?.type!=='note'||!valid(event.moodScore))continue;
      const current=Number(event.moodScore);
      let next=clamp(current),legacyFive=event.moodScoreLegacy5;
      if(valid(event.moodScoreLegacy10)){
        next=clamp(event.moodScoreLegacy10);
      }else if(event.moodScaleModel==='0-5'||(priorWasFive&&!event.moodScaleModel&&current>=0&&current<=5)){
        next=clamp(current*2);
        if(legacyFive===undefined)legacyFive=current;
      }
      if(next!==current||event.moodScaleModel!=='0-10'||legacyFive!==event.moodScoreLegacy5){
        const updated={...event,moodScore:next,moodScaleModel:'0-10'};
        if(legacyFive!==undefined)updated.moodScoreLegacy5=legacyFive;
        await window.putEvent(updated);
        changed++;
      }
    }
    settings.rmScaleMigration='0-5_0-4_v1';
    settings.moodScaleModel='0-10';
    settings.rmMoodScale10Migration=MARK;
    window.saveSettings(settings);
    if(changed&&typeof window.renderAll==='function')await window.renderAll();
    return changed>0;
  }

  async function run(){
    try{await pass()}catch(error){console.warn('Registro Mental: estabilização 0–10 inicial não bloqueante',error)}
    [1200,3500,7000].forEach(ms=>setTimeout(()=>pass().catch(error=>console.warn('Registro Mental: revisão tardia da escala 0–10',error)),ms));
    window.REGISTRO_MOOD_SCALE_10_DB_STABLE=true;
  }
  run();
})();
