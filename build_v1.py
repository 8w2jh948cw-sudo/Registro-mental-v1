from pathlib import Path
import json
import re
import shutil

VERSION = "1.0.0"
ROOT = Path(__file__).resolve().parent
LEGACY = ROOT / "_legacy"
SITE = ROOT / "site"

if not LEGACY.exists():
    raise SystemExit("Fonte congelada da migração não encontrada em _legacy")

if SITE.exists():
    shutil.rmtree(SITE)
SITE.mkdir(parents=True)

# -----------------------------------------------------------------------------
# HTML: preserva a interface consolidada, mas troca a cadeia histórica inteira
# por um único app.js e um único styles.css.
# -----------------------------------------------------------------------------
index = (LEGACY / "index.html").read_text(encoding="utf-8")
index = re.sub(
    r'\s*<link rel="stylesheet" href="\./styles\.css\?v=[^"]+">\s*'
    r'<link rel="stylesheet" href="\./enhancements\.css\?v=[^"]+">\s*'
    r'<link rel="stylesheet" href="\./v04\.css\?v=[^"]+">',
    f'\n  <link rel="stylesheet" href="./styles.css?v={VERSION}">',
    index,
    count=1,
)
index = re.sub(
    r'<link rel="manifest" href="\./manifest\.webmanifest\?v=[^"]+">',
    f'<link rel="manifest" href="./manifest.webmanifest?v={VERSION}">',
    index,
    count=1,
)
index = index.replace(
    '<span class="version-inline" id="topVersion">Atualizando…</span>',
    f'<span class="version-inline" id="topVersion">v{VERSION}</span>',
)
index = index.replace(
    '<strong id="versionLabel">Atualizando…</strong>',
    f'<strong id="versionLabel">{VERSION}</strong>',
)
index = index.replace('<small>Texto ou voz</small>', '<small>Texto e estado emocional</small>')

start = index.find('  <script src="./release-guard.js')
end_marker = '  <script src="./v04c10.js?v=0.4.19"></script>'
end = index.find(end_marker)
if start == -1 or end == -1:
    raise SystemExit("Não foi possível localizar a cadeia antiga de scripts no index.html")
end += len(end_marker)
index = index[:start] + f'  <script src="./app.js?v={VERSION}"></script>' + index[end:]
(SITE / "index.html").write_text(index, encoding="utf-8")

# -----------------------------------------------------------------------------
# CSS: três arquivos de estilo da base antiga viram um único recurso estático.
# -----------------------------------------------------------------------------
css_parts = []
for name in ("styles.css", "enhancements.css", "v04.css"):
    css_parts.append(f"/* ---- {name} consolidado na 1.0.0 ---- */\n")
    css_parts.append((LEGACY / name).read_text(encoding="utf-8"))
    css_parts.append("\n")
(SITE / "styles.css").write_text("".join(css_parts), encoding="utf-8")

# -----------------------------------------------------------------------------
# JavaScript: mantém a semântica de arquivos <script> separados, mas todos são
# entregues dentro de um único app.js. Isso evita dezenas de requisições.
# A ordem abaixo reproduz primeiro a base 1..10, depois a ordem usada pelo
# carregador otimizado e, por fim, as revisões 28..35 que não chegavam a ser
# encadeadas de forma confiável na publicação antiga.
# -----------------------------------------------------------------------------
modules = [
    *[f"v04c{i}.js" for i in range(1, 11)],
    "v04c25.js", "v04c19.js", "v04c12.js", "v04c15.js", "v04c16.js",
    "v04c18.js", "v04c20.js", "v04c21.js", "v04c11.js", "v04c13.js",
    "v04c22.js", "v04c14.js", "v04c23.js", "v04c24.js", "v04c26.js",
    "v04c27.js", "v04c28.js", "v04c29.js", "v04c30.js", "v04c31.js",
    "v04c32.js", "v04c33.js", "v04c34.js", "v04c35.js",
]

sources = []
for name in modules:
    path = LEGACY / name
    if not path.exists():
        raise SystemExit(f"Módulo ausente na fonte congelada: {name}")
    source = path.read_text(encoding="utf-8")
    source = source.replace("const APP_VERSION='0.4.2';", f"const APP_VERSION='{VERSION}';")
    source = re.sub(
        r"const (RM_V\d+_RELEASE)='[^']+';",
        lambda m: f"const {m.group(1)}='{VERSION}';",
        source,
    )
    # A limpeza manual da 1.0.0 não deve tocar nos caches do app antigo.
    source = source.replace("key.startsWith('registro-')", "key.startsWith('registro-v1-')")
    sources.append((name, source))

bootstrap = r'''/* Registro Mental V1 — carregador consolidado */
(() => {
  'use strict';
  const VERSION = '1.0.0';
  window.REGISTRO_V1_RELEASE = VERSION;
  window.REGISTRO_EXPECTED_RELEASE = VERSION;

  const paintVersion = () => {
    const top = document.getElementById('topVersion');
    const about = document.getElementById('versionLabel');
    if (top && top.textContent !== `v${VERSION}`) top.textContent = `v${VERSION}`;
    if (about && about.textContent !== VERSION) about.textContent = VERSION;
  };
  window.__rmV1PaintVersion = paintVersion;
  paintVersion();
  for (const el of [document.getElementById('topVersion'), document.getElementById('versionLabel')]) {
    if (el) new MutationObserver(paintVersion).observe(el, {childList:true, subtree:true, characterData:true});
  }

  // Os módulos antigos às vezes tentam carregar o próximo arquivo pela rede.
  // Na V1 todos já estão dentro deste bundle; bloqueamos apenas essas duplicatas.
  const head = document.head;
  const nativeAppendChild = head.appendChild;
  head.appendChild = function(node) {
    const src = node && node.tagName === 'SCRIPT' ? String(node.src || '') : '';
    if (/\/v04c\d+\.js(?:[?#]|$)/i.test(src)) {
      queueMicrotask(() => { try { node.onload && node.onload(new Event('load')); } catch (_) {} });
      return node;
    }
    return nativeAppendChild.call(this, node);
  };
})();
'''

parts = [bootstrap]
for name, source in sources:
    encoded = json.dumps(source, ensure_ascii=False)
    parts.append(
        f"\n/* ---- {name} preservado como script isolado ---- */\n"
        f"(()=>{{const s=document.createElement('script');s.text={encoded};document.head.appendChild(s);s.remove();}})();\n"
    )

parts.append(r'''
(() => {
  const VERSION = '1.0.0';
  window.REGISTRO_CURRENT_RELEASE = VERSION;
  window.__rmV1PaintVersion?.();
  window.dispatchEvent(new CustomEvent('registro:release-ready', {detail:{release:VERSION}}));
  document.querySelectorAll('.voice-row').forEach(el => el.remove());
})();
''')
(SITE / "app.js").write_text("".join(parts), encoding="utf-8")

# -----------------------------------------------------------------------------
# PWA: cache pequeno e rápido. O app abre do cache imediatamente e atualiza os
# recursos em segundo plano. Não há pré-cache de dezenas de revisões antigas.
# -----------------------------------------------------------------------------
sw = f'''const CACHE='registro-v1-{VERSION}';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./release-guard.js'];

self.addEventListener('install',event=>{{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
}});

self.addEventListener('activate',event=>{{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith('registro-v1-')&&key!==CACHE).map(key=>caches.delete(key))
  )));
  self.clients.claim();
}});

function canonical(request){{
  const url=new URL(request.url);
  return new Request(url.origin+url.pathname,{{method:'GET',credentials:'same-origin'}});
}}

self.addEventListener('fetch',event=>{{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  event.respondWith((async()=>{{
    const cache=await caches.open(CACHE);
    const key=canonical(request);
    const cached=await cache.match(key);
    const refresh=fetch(request,{{cache:'no-store'}}).then(async response=>{{
      if(response&&response.ok)await cache.put(key,response.clone());
      return response;
    }}).catch(()=>null);

    if(cached){{
      event.waitUntil(refresh);
      return cached;
    }}
    const online=await refresh;
    if(online)return online;
    if(request.mode==='navigate')return (await cache.match(canonical(new Request(new URL('./index.html',self.location).href))))||new Response('Offline',{{status:503}});
    return new Response('Offline',{{status:503}});
  }})());
}});

self.addEventListener('message',event=>{{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
}});
'''
(SITE / "sw.js").write_text(sw, encoding="utf-8")

# Arquivo leve usado pelo botão "Buscar agora" apenas para confirmar que a
# publicação está acessível; ele não é carregado na abertura do app.
(SITE / "release-guard.js").write_text(
    f"/* Registro Mental V1 release {VERSION} */\nwindow.REGISTRO_AVAILABLE_RELEASE='{VERSION}';\n",
    encoding="utf-8",
)

manifest = json.loads((LEGACY / "manifest.webmanifest").read_text(encoding="utf-8"))
manifest["name"] = "Registro Mental V1 — Diário, Medicação e Sono"
manifest["short_name"] = "Registro V1"
manifest["id"] = "./"
(SITE / "manifest.webmanifest").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)

# Recursos auxiliares não participam da abertura principal e só são baixados
# quando alguma função específica realmente precisa deles.
for name in (
    "v04demo.js", "v04tabbar.js", "v04navicons.js",
    "tabbar-lab.html", "tabbar-editor.html", "dev-editor.html",
    "preview-escala-humor.html", "SHORTCUT-SLEEP.txt",
):
    src = LEGACY / name
    if src.exists():
        shutil.copy2(src, SITE / name)

(SITE / ".nojekyll").write_text("", encoding="utf-8")

print(f"Registro Mental V1 {VERSION} montado em {SITE}")
print(f"Arquivos principais: index.html, styles.css, app.js, manifest.webmanifest, sw.js")
