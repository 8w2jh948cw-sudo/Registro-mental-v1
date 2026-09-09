/* Registro Mental — escala emocional 0–10 aprovada no Mood Lab.
   Compartilhada pela Oficial e pela Beta para manter comportamento idêntico. */
(() => {
  'use strict';

  const IS_BETA = location.pathname.includes('/beta/');
  const RELEASE = IS_BETA ? '1.2.0-beta.14' : '1.1.10';
  const MIGRATION = 'mood-lab-0-10-v1';
  const COLORS = {
    0:'#2A223A', 1:'#FF4B4B', 2:'#FF7A1A', 3:'#FF9F0A', 4:'#FFD60A',
    5:'#FFE119', 6:'#BEEA2E', 7:'#57D65A', 8:'#31C46C', 9:'#20D6A3', 10:'#39E6D4'
  };

  let installed = false;
  let migrating = false;
  let releaseObserver = null;

  const clampMood = value => Math.max(0, Math.min(10, Math.round(Number(value) || 0)));
  const validMood = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  const moodColor = value => COLORS[clampMood(value)];
  const escHtml = value => {
    if (typeof window.esc === 'function') return window.esc(value);
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  };

  function paintRelease() {
    window.REGISTRO_V1_RELEASE = RELEASE;
    window.REGISTRO_EXPECTED_RELEASE = RELEASE;
    window.REGISTRO_CURRENT_RELEASE = RELEASE;
    window.REGISTRO_MOOD_SCALE_RELEASE = RELEASE;
    const top = document.getElementById('topVersion');
    const about = document.getElementById('versionLabel');
    if (top && top.textContent !== `v${RELEASE}`) top.textContent = `v${RELEASE}`;
    if (about && about.textContent !== RELEASE) about.textContent = RELEASE;
    let style = document.getElementById('rm-mood10-release-stamp');
    if (!style) {
      style = document.createElement('style');
      style.id = 'rm-mood10-release-stamp';
      document.head.appendChild(style);
    }
    style.textContent = `
      html body #topVersion{font-size:0!important}
      html body #topVersion::after{content:"v${RELEASE}"!important;font-size:10px!important}
      html body #versionLabel{font-size:0!important}
      html body #versionLabel::after{content:"${RELEASE}"!important;font-size:14px!important}
    `;
  }

  function watchReleaseLabels() {
    if (releaseObserver) return;
    releaseObserver = new MutationObserver(() => paintRelease());
    const observe = () => {
      const top = document.getElementById('topVersion');
      const about = document.getElementById('versionLabel');
      if (top) releaseObserver.observe(top, { childList:true, characterData:true, subtree:true });
      if (about) releaseObserver.observe(about, { childList:true, characterData:true, subtree:true });
    };
    observe();
    document.addEventListener('DOMContentLoaded', observe, { once:true });
    [0,250,900,1800,3500].forEach(ms => setTimeout(paintRelease, ms));
  }

  function installStyles() {
    let style = document.getElementById('rm-mood10-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'rm-mood10-style';
      document.head.appendChild(style);
    }
    style.textContent = `
      .rm-mood10-block{padding:4px 0 2px}
      .rm-mood10-row{display:grid;grid-template-columns:40px minmax(0,1fr);gap:8px;align-items:center;margin:9px 0 7px}
      .rm-mood10-zero,.rm-mood10-track button{appearance:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent;font:800 12px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}
      .rm-mood10-zero{width:40px;height:40px;border-radius:50%;background:color-mix(in srgb,var(--surface,#fff) 90%,transparent);color:var(--secondary,#6e6e73);border:1px solid var(--separator,rgba(60,60,67,.14));box-shadow:0 8px 22px rgba(0,0,0,.08);transition:transform .18s ease,background .18s ease,color .18s ease,box-shadow .18s ease,filter .18s ease}
      .rm-mood10-shell{position:relative;height:40px;isolation:isolate;--rm-mood-color:#57D65A}
      .rm-mood10-glow{position:absolute;z-index:0;inset:0 auto 0 0;width:0;border-radius:999px;background:var(--rm-mood-color);filter:blur(10px);opacity:0;pointer-events:none;transition:width .28s cubic-bezier(.2,.8,.2,1),background .2s ease,opacity .2s ease}
      html[data-visual-mode="ultra"] .rm-mood10-glow{opacity:.68}
      .rm-mood10-track{position:absolute;z-index:1;inset:0;border-radius:999px;background:color-mix(in srgb,var(--surface,#fff) 90%,transparent);border:1px solid var(--separator,rgba(60,60,67,.14));overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.08);backdrop-filter:blur(24px) saturate(145%);-webkit-backdrop-filter:blur(24px) saturate(145%)}
      .rm-mood10-fill{position:absolute;z-index:1;inset:0 auto 0 0;width:0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,0) 45%),var(--rm-mood-color);transition:width .28s cubic-bezier(.2,.8,.2,1),background .2s ease}
      .rm-mood10-grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));height:100%}
      .rm-mood10-track button{min-width:0;padding:0;background:transparent;color:var(--secondary,#6e6e73);transition:color .18s ease,transform .18s ease,text-shadow .18s ease}
      .rm-mood10-track button.filled{color:rgba(255,255,255,.93)}
      .rm-mood10-track button.selected{color:#fff;transform:scale(1.08);text-shadow:0 1px 3px rgba(0,0,0,.24)}
      .rm-mood10-zero.selected{background:linear-gradient(180deg,rgba(255,255,255,.14),transparent 48%),var(--rm-mood-color);color:#fff;transform:scale(1.05);box-shadow:0 0 0 2px color-mix(in srgb,var(--rm-mood-color) 28%,transparent),0 8px 22px rgba(0,0,0,.08)}
      html[data-visual-mode="ultra"] .rm-mood10-zero.selected{filter:drop-shadow(0 0 9px var(--rm-mood-color)) drop-shadow(0 0 18px color-mix(in srgb,var(--rm-mood-color) 60%,transparent))}
      html[data-visual-mode="optimized"] .rm-mood10-track{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:0 2px 8px rgba(0,0,0,.06)}
      html[data-visual-mode="optimized"] .rm-mood10-zero{box-shadow:0 2px 8px rgba(0,0,0,.06)}
      .rm-mood10-caption{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--secondary,#6e6e73);font-size:10px;line-height:1.25;opacity:.72}
      .rm-mood10-caption span:last-child{text-align:right}
      .rm-mood10-block .tiny-clear{margin-top:5px}

      .rm-timeline-kind-row{display:flex;align-items:center;gap:8px;min-width:0}
      .rm-record-mood-wrap{--rm-card-mood:#57D65A;display:inline-flex;align-items:center;gap:4px;flex:0 0 auto;line-height:1}
      .rm-record-mood-bar{position:relative;display:inline-block;width:var(--rm-card-mood-width,60px);height:13px;min-width:13px;max-width:112px;border-radius:999px;background:var(--rm-card-mood);box-shadow:0 1px 0 rgba(255,255,255,.24) inset;overflow:hidden;transition:width .28s cubic-bezier(.2,.8,.2,1),background .2s ease,box-shadow .2s ease}
      .rm-record-mood-bar::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.20),transparent 55%);pointer-events:none}
      .rm-record-mood-inside{position:absolute;z-index:2;inset:0;display:grid;place-items:center;color:rgba(0,0,0,.48);font-size:9px;font-weight:680;line-height:1;user-select:none}
      .rm-record-mood-outside{color:var(--secondary,#6e6e73);font-size:10px;font-weight:650;line-height:1;opacity:.82;min-width:9px;text-align:center;font-variant-numeric:tabular-nums}
      html[data-visual-mode="ultra"] .rm-record-mood-bar{box-shadow:0 0 9px color-mix(in srgb,var(--rm-card-mood) 55%,transparent),0 1px 0 rgba(255,255,255,.25) inset}
      html[data-visual-mode="optimized"] .rm-record-mood-bar{box-shadow:0 1px 0 rgba(255,255,255,.20) inset!important}

      @media(max-width:430px){
        .rm-mood10-row{grid-template-columns:36px minmax(0,1fr);gap:6px}
        .rm-mood10-zero{width:36px;height:36px}
        .rm-mood10-shell{height:36px}
        .rm-mood10-zero,.rm-mood10-track button{font-size:11px}
      }
      @media(max-width:350px){
        .rm-mood10-row{grid-template-columns:32px minmax(0,1fr);gap:5px}
        .rm-mood10-zero{width:32px;height:32px}
        .rm-mood10-shell{height:32px}
        .rm-mood10-zero,.rm-mood10-track button{font-size:10px}
      }
      @media(prefers-reduced-motion:reduce){.rm-mood10-zero,.rm-mood10-fill,.rm-mood10-glow,.rm-mood10-track button,.rm-record-mood-bar{transition:none!important}}
    `;
  }

  function selectorHTML(value = null) {
    const hasValue = validMood(value);
    const score = hasValue ? clampMood(value) : null;
    const color = hasValue ? moodColor(score) : COLORS[7];
    const progress = score === null || score === 0 ? 0 : score * 10;
    const buttons = Array.from({length:10}, (_, index) => {
      const n = index + 1;
      const selected = score === n ? ' selected' : '';
      const filled = score !== null && score > 0 && n <= score ? ' filled' : '';
      return `<button type="button" data-mood-score="${n}" class="${(selected + filled).trim()}" aria-pressed="${score === n}">${n}</button>`;
    }).join('');
    return `<div class="mood-block rm-mood10-block">
      <div class="rm-mood10-row" role="group" aria-label="Estado emocional de zero a dez">
        <button type="button" class="rm-mood10-zero${score === 0 ? ' selected' : ''}" data-mood-score="0" aria-pressed="${score === 0}" aria-label="Humor zero, estado excepcionalmente ruim" style="--rm-mood-color:${color}">0</button>
        <div class="rm-mood10-shell" style="--rm-mood-color:${color}">
          <div class="rm-mood10-glow" style="width:${progress}%" aria-hidden="true"></div>
          <div class="rm-mood10-track">
            <div class="rm-mood10-fill" style="width:${progress}%" aria-hidden="true"></div>
            <div class="rm-mood10-grid">${buttons}</div>
          </div>
        </div>
      </div>
      <div class="rm-mood10-caption"><span>0 · excepcionalmente ruim</span><span>1–10 · escala comum</span></div>
      <button type="button" class="tiny-clear" id="clearMoodScore">Limpar nota</button>
    </div>`;
  }

  function selectMood(value) {
    const hasValue = validMood(value);
    const score = hasValue ? clampMood(value) : null;
    const color = score === null ? COLORS[7] : moodColor(score);
    const progress = score === null || score === 0 ? 0 : score * 10;

    document.querySelectorAll('.rm-mood10-block').forEach(block => {
      const shell = block.querySelector('.rm-mood10-shell');
      const zero = block.querySelector('.rm-mood10-zero');
      if (shell) shell.style.setProperty('--rm-mood-color', color);
      if (zero) zero.style.setProperty('--rm-mood-color', color);
      block.querySelectorAll('[data-mood-score]').forEach(button => {
        const n = Number(button.dataset.moodScore);
        const selected = score !== null && n === score;
        button.classList.toggle('selected', selected);
        button.classList.toggle('filled', score !== null && score > 0 && n > 0 && n <= score);
        button.setAttribute('aria-pressed', String(selected));
      });
      const fill = block.querySelector('.rm-mood10-fill');
      const glow = block.querySelector('.rm-mood10-glow');
      if (fill) fill.style.width = `${progress}%`;
      if (glow) glow.style.width = `${progress}%`;
    });
  }

  function cardWidth(value) {
    const score = clampMood(value);
    if (score === 0) return 13;
    return Math.round((12 + score * 9.4) * 10) / 10;
  }

  function moodIndicatorHTML(value) {
    if (!validMood(value)) return '';
    const score = clampMood(value);
    const color = moodColor(score);
    const outside = score <= 3;
    return `<span class="rm-record-mood-wrap" style="--rm-card-mood:${color};--rm-card-mood-width:${cardWidth(score)}px" role="img" aria-label="Humor ${score} de 10">
      <span class="rm-record-mood-bar">${outside ? '' : `<span class="rm-record-mood-inside" aria-hidden="true">${score}</span>`}</span>
      ${outside ? `<span class="rm-record-mood-outside" aria-hidden="true">${score}</span>` : ''}
    </span>`;
  }

  function installEmotionOverrides() {
    window.emotionMoodSelectorHTML = selectorHTML;
    window.emotionSelectMood = selectMood;

    if (typeof window.rmMigrateScales === 'function') {
      window.rmMigrateScales = async () => false;
    }

    if (typeof window.putEvent === 'function' && !window.putEvent.__rmMood10) {
      const basePutEvent = window.putEvent;
      const wrapped = async function(record) {
        if (record?.type === 'note' && validMood(record.moodScore)) {
          record = { ...record, moodScore:clampMood(record.moodScore), moodScaleModel:'0-10' };
        }
        return basePutEvent.call(this, record);
      };
      wrapped.__rmMood10 = true;
      wrapped.__rmMood10Base = basePutEvent;
      window.putEvent = wrapped;
    }
  }

  function installCardOverrides() {
    if (typeof window.kindInfo === 'function' && !window.kindInfo.__rmMood10) {
      const previous = window.kindInfo;
      const wrapped = function(event) {
        if (event?.type !== 'note') return previous.apply(this, arguments);
        const meta = [];
        if (event.tag) meta.push(event.tag);
        const scores = Object.entries(event.emotionScores || {}).slice(0, 2);
        for (const [id, value] of scores) {
          let label = event.emotionLabels?.[id] || id;
          try {
            const dimension = typeof window.emotionDimensions === 'function' ? window.emotionDimensions().find(item => item.id === id) : null;
            if (!event.emotionLabels?.[id] && dimension?.label) label = dimension.label;
          } catch (_) {}
          meta.push(`${label} ${value}/4`);
        }
        return {
          kind:event.audioOnly ? 'ANOTAÇÃO DE VOZ' : (!event.text && validMood(event.moodScore) ? 'CHECK-IN' : 'ANOTAÇÃO'),
          className:'note',
          title:event.text || (validMood(event.moodScore) ? 'Check-in emocional' : 'Gravação de voz'),
          meta
        };
      };
      wrapped.__rmMood10 = true;
      wrapped.__rmMood10Base = previous;
      window.kindInfo = wrapped;
    }

    if (typeof window.eventCard === 'function' && !window.eventCard.__rmMood10) {
      const previous = window.eventCard;
      const wrapped = function(event) {
        if (event?.type !== 'note') return previous.apply(this, arguments);
        const k = window.kindInfo(event);
        const time = typeof window.timeLabel === 'function' ? window.timeLabel(event.timestamp) : '';
        const indicator = moodIndicatorHTML(event.moodScore);
        return `<article class="timeline-item"><div class="timeline-time">${escHtml(time)}</div><div><div class="rm-timeline-kind-row"><div class="timeline-kind kind-${escHtml(k.className)}">${escHtml(k.kind)}</div>${indicator}</div><div class="timeline-title">${escHtml(k.title)}</div>${k.meta?.length ? `<div class="timeline-meta">${k.meta.map(escHtml).join(' · ')}</div>` : ''}${event.hasAudio ? `<div data-audio="${escHtml(event.id)}"></div>` : ''}</div><button class="item-menu" data-menu="${escHtml(event.id)}" aria-label="Opções">•••</button></article>`;
      };
      wrapped.__rmMood10 = true;
      wrapped.__rmMood10Base = previous;
      window.eventCard = wrapped;
    }

    if (typeof window.openEventViewer === 'function' && !window.openEventViewer.__rmMood10) {
      const previous = window.openEventViewer;
      const wrapped = async function(id) {
        let note = null;
        try {
          if (typeof window.allEvents === 'function') note = (await window.allEvents()).find(item => item.id === id);
        } catch (_) {}
        const result = await previous.apply(this, arguments);
        if (note?.type === 'note' && validMood(note.moodScore)) {
          const root = document.getElementById('form') || document.querySelector('.sheet');
          root?.querySelectorAll('.analysis-row').forEach(row => {
            const strong = row.querySelector('strong');
            if (strong?.textContent?.trim() === 'Estado emocional') {
              const span = row.querySelector('span');
              if (span) span.textContent = `${clampMood(note.moodScore)} de 10`;
            }
          });
        }
        return result;
      };
      wrapped.__rmMood10 = true;
      wrapped.__rmMood10Base = previous;
      window.openEventViewer = wrapped;
    }
  }

  function chartEsc(value) { return escHtml(value); }

  function moodLineChart(points, opts = {}) {
    if (!Array.isArray(points) || points.length < 2) {
      return typeof window.chartEmpty === 'function' ? window.chartEmpty('Ainda há poucos pontos para desenhar uma linha.') : '';
    }
    const W=720,H=270,pad={l:44,r:16,t:18,b:35},iw=W-pad.l-pad.r,ih=H-pad.t-pad.b;
    const x0=Math.min(...points.map(p=>p.x)),x1=Math.max(...points.map(p=>p.x)),span=Math.max(1,x1-x0);
    const x=v=>pad.l+(v-x0)/span*iw, y=v=>pad.t+(10-clampMood(v))/10*ih;
    const ticks=[0,5,10];
    const grid=`<g class="chart-grid">${ticks.map(t=>`<line x1="${pad.l}" y1="${y(t)}" x2="${W-pad.r}" y2="${y(t)}"/><text x="${pad.l-8}" y="${y(t)+4}" text-anchor="end">${t}/10</text>`).join('')}</g>`;
    const markers=(opts.markers||[]).map(m=>`<line class="chart-marker ${chartEsc(m.kind||'')}" x1="${x(m.x)}" y1="${pad.t}" x2="${x(m.x)}" y2="${H-pad.b}"><title>${chartEsc(m.title||'')}</title></line>`).join('');
    const segments=points.slice(1).map((p,i)=>{const a=points[i],c=moodColor(p.y);return`<line x1="${x(a.x)}" y1="${y(a.y)}" x2="${x(p.x)}" y2="${y(p.y)}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`}).join('');
    const dots=points.map(p=>{const score=clampMood(p.y),c=moodColor(score),stroke=score===0?'#7657FF':`color-mix(in srgb,${c} 72%,white 28%)`;return`<circle cx="${x(p.x)}" cy="${y(score)}" r="5.5" fill="${c}" stroke="${stroke}" stroke-width="2"><title>${chartEsc(`${opts.xLabel?.(p)||p.label||''} · ${score}/10`)}</title></circle>`}).join('');
    return `<svg class="local-chart-svg rm-mood10-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Humor de 0 a 10">${grid}${markers}${segments}${dots}<text class="chart-axis-label" x="${pad.l}" y="${H-10}">${chartEsc(opts.xLabel?.(points[0])||points[0].label||'')}</text><text class="chart-axis-label" x="${W-pad.r}" y="${H-10}" text-anchor="end">${chartEsc(opts.xLabel?.(points[points.length-1])||points[points.length-1].label||'')}</text></svg>`;
  }

  function moodBarChart(rows) {
    if (!Array.isArray(rows) || !rows.length) return typeof window.chartEmpty === 'function' ? window.chartEmpty('Ainda não há dados suficientes.') : '';
    const data=rows.slice(0,11),W=720,H=280,pad={l:38,r:12,t:24,b:52},iw=W-pad.l-pad.r,ih=H-pad.t-pad.b,max=Math.max(1,...data.map(r=>Number(r.value)||0));
    const y=v=>pad.t+(max-v)/max*ih,zero=y(0),bw=Math.max(16,iw/data.length*.58);
    return `<svg class="local-chart-svg rm-mood10-bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Distribuição das notas de humor de 0 a 10"><line class="chart-zero" x1="${pad.l}" y1="${zero}" x2="${W-pad.r}" y2="${zero}"/>${data.map((r,i)=>{const score=clampMood(r.label),value=Number(r.value)||0,c=moodColor(score),cx=pad.l+(i+.5)*iw/data.length,yy=y(value),h=Math.max(3,zero-yy),top=zero-h;return`<rect x="${cx-bw/2}" y="${top}" width="${bw}" height="${h}" rx="8" fill="${c}" stroke="${score===0?'#7657FF':c}" stroke-width="1.5"><title>${score}: ${value}</title></rect><text class="chart-bar-label" x="${cx}" y="${H-28}" text-anchor="middle">${score}</text><text class="chart-bar-value" x="${cx}" y="${Math.max(14,top-6)}" text-anchor="middle">${value}</text>`}).join('')}</svg>`;
  }

  function moodScatterChart(points, opts = {}) {
    if (!Array.isArray(points) || points.length < 3) return typeof window.chartEmpty === 'function' ? window.chartEmpty('São necessários pelo menos 3 pares de dados para esse gráfico.') : '';
    const W=720,H=280,pad={l:46,r:16,t:18,b:42},iw=W-pad.l-pad.r,ih=H-pad.t-pad.b;
    const xs=points.map(p=>Number(p.x)).filter(Number.isFinite),minX=opts.xMin??Math.min(...xs),maxX=opts.xMax??Math.max(...xs),span=Math.max(.0001,maxX-minX);
    const x=v=>pad.l+(v-minX)/span*iw,y=v=>pad.t+(10-clampMood(v))/10*ih;
    const grid=`<g class="chart-grid">${[0,5,10].map(t=>`<line x1="${pad.l}" y1="${y(t)}" x2="${W-pad.r}" y2="${y(t)}"/><text x="${pad.l-8}" y="${y(t)+4}" text-anchor="end">${t}/10</text>`).join('')}</g>`;
    const dots=points.map(p=>{const score=clampMood(p.y),c=moodColor(score);return`<circle class="chart-scatter" cx="${x(p.x)}" cy="${y(score)}" r="6" fill="${c}" stroke="${score===0?'#7657FF':`color-mix(in srgb,${c} 72%,white 28%)`}" stroke-width="2"><title>${chartEsc(`${p.label||''} · ${opts.xFormat?.(p.x)||p.x} · ${score}/10`)}</title></circle>`}).join('');
    return `<svg class="local-chart-svg rm-mood10-scatter" viewBox="0 0 ${W} ${H}" role="img">${grid}${dots}<text class="chart-axis-label" x="${pad.l}" y="${H-12}">${chartEsc(opts.xFormat?.(minX)||minX)}</text><text class="chart-axis-label" x="${W-pad.r}" y="${H-12}" text-anchor="end">${chartEsc(opts.xFormat?.(maxX)||maxX)}</text></svg>`;
  }

  function installChartOverrides() {
    if (typeof window.localLineChart === 'function' && !window.localLineChart.__rmMood10) {
      const previous = window.localLineChart;
      const wrapped = function(points, opts = {}) {
        if (opts?.yLabel === 'Humor') return moodLineChart(points, opts);
        return previous.apply(this, arguments);
      };
      wrapped.__rmMood10 = true;
      wrapped.__rmMood10Base = previous;
      window.localLineChart = wrapped;
    }

    if (typeof window.localBarChart === 'function' && !window.localBarChart.__rmMood10) {
      const previous = window.localBarChart;
      const wrapped = function(rows, opts = {}) {
        const moodRows = Array.isArray(rows) && rows.length >= 11 && rows.slice(0,11).every((row,index)=>String(row.label)===String(index));
        if (moodRows) return moodBarChart(rows);
        return previous.apply(this, arguments);
      };
      wrapped.__rmMood10 = true;
      wrapped.__rmMood10Base = previous;
      window.localBarChart = wrapped;
    }

    if (typeof window.localScatterChart === 'function' && !window.localScatterChart.__rmMood10) {
      const previous = window.localScatterChart;
      const wrapped = function(points, opts = {}) {
        let mood = Number(opts?.yMax) === 10;
        try { mood = mood || String(opts?.yFormat?.(5)||'').includes('/10'); } catch (_) {}
        if (mood) return moodScatterChart(points, opts);
        return previous.apply(this, arguments);
      };
      wrapped.__rmMood10 = true;
      wrapped.__rmMood10Base = previous;
      window.localScatterChart = wrapped;
    }
  }

  function fixAnalysisCopy() {
    const mood = document.querySelector('[data-analysis-item="chart-mood-line"] .chart-card-head div>p:last-child');
    if (mood) mood.textContent = 'Notas emocionais de 0 a 10 nos últimos 30 dias.';
    const distribution = document.querySelector('[data-analysis-item="chart-mood-distribution"] .chart-card-head div>p:last-child');
    if (distribution) distribution.textContent = 'Quantas vezes cada nota de 0 a 10 foi registrada nos últimos 30 dias.';
  }

  function installRenderWrapper() {
    if (typeof window.renderAll === 'function' && !window.renderAll.__rmMood10) {
      const previous = window.renderAll;
      const wrapped = async function() {
        const result = await previous.apply(this, arguments);
        fixAnalysisCopy();
        paintRelease();
        return result;
      };
      wrapped.__rmMood10 = true;
      wrapped.__rmMood10Base = previous;
      window.renderAll = wrapped;
    }
  }

  async function migrateStoredMoodScores() {
    if (migrating || typeof window.allEvents !== 'function' || typeof window.putEvent !== 'function' || typeof window.getSettings !== 'function' || typeof window.saveSettings !== 'function') return false;
    migrating = true;
    try {
      const settings = { ...window.getSettings() };
      const priorWasFive = settings.moodScaleModel === '0-5' || settings.rmScaleMigration === '0-5_0-4_v1';
      settings.rmScaleMigration = '0-5_0-4_v1';
      settings.moodScaleModel = '0-10';
      settings.rmMoodScale10Migration = MIGRATION;
      window.saveSettings(settings);

      const events = await window.allEvents();
      let changed = 0;
      for (const event of events) {
        if (event?.type !== 'note' || !validMood(event.moodScore)) continue;
        const current = Number(event.moodScore);
        let next = clampMood(current);
        let legacyFive = event.moodScoreLegacy5;
        if (validMood(event.moodScoreLegacy10)) {
          next = clampMood(event.moodScoreLegacy10);
        } else if (event.moodScaleModel === '0-5' || (priorWasFive && !event.moodScaleModel && current >= 0 && current <= 5)) {
          next = clampMood(current * 2);
          if (legacyFive === undefined) legacyFive = current;
        }
        if (next !== current || event.moodScaleModel !== '0-10' || legacyFive !== event.moodScoreLegacy5) {
          const updated = { ...event, moodScore:next, moodScaleModel:'0-10' };
          if (legacyFive !== undefined) updated.moodScoreLegacy5 = legacyFive;
          await window.putEvent(updated);
          changed++;
        }
      }
      return changed > 0;
    } catch (error) {
      console.warn('Registro Mental: migração da escala 0–10 não bloqueante', error);
      return false;
    } finally {
      migrating = false;
    }
  }

  async function install() {
    if (installed) return;
    const ready = typeof window.emotionMoodSelectorHTML === 'function' && typeof window.emotionSelectMood === 'function' && typeof window.eventCard === 'function' && typeof window.kindInfo === 'function';
    if (!ready) return;
    installed = true;
    installStyles();
    installEmotionOverrides();
    installCardOverrides();
    installChartOverrides();
    installRenderWrapper();
    paintRelease();
    watchReleaseLabels();

    const migrated = await migrateStoredMoodScores();
    try {
      if (typeof window.renderAll === 'function') await window.renderAll();
      else if (migrated) location.reload();
    } catch (error) {
      console.warn('Registro Mental: atualização visual da escala 0–10 não bloqueou o app', error);
    }

    document.addEventListener('click', event => {
      if (event.target.closest('[data-visual-mode],[data-theme-value],.tab-item')) setTimeout(paintRelease, 0);
    }, { passive:true });

    window.REGISTRO_MOOD_SCALE_10_READY = true;
    window.dispatchEvent(new CustomEvent('registro:mood-scale-ready', { detail:{ release:RELEASE, scale:'0-10' } }));
  }

  function boot() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      install().catch(error => console.warn('Registro Mental: mood 0–10', error));
      if (installed || attempts > 80) clearInterval(timer);
    }, 100);
    install().catch(() => {});
  }

  boot();
})();
