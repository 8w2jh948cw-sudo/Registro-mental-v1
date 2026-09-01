from pathlib import Path
import json
import os
import re
import shutil

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "site"
RELEASE = os.environ.get("RELEASE", "1.1.0").strip()

if not re.fullmatch(r"\d+\.\d+\.\d+", RELEASE):
    raise SystemExit(f"RELEASE inválida: {RELEASE!r}")

if SITE.exists():
    shutil.rmtree(SITE)
SITE.mkdir(parents=True)

BOOT_CSS = r'''
<style id="rmBootCriticalStyle">
  html,body{margin:0;min-height:100%;background:#f5f5f7}
  body.rm-booting{overflow:hidden}
  #rmBoot{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:22px;background:#f5f5f7;color:#111114;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;box-sizing:border-box;transition:opacity .22s ease,visibility .22s ease}
  #rmBoot.rm-boot-hide{opacity:0;visibility:hidden;pointer-events:none}
  .rm-boot-card{width:min(100%,390px);background:#fff;border-radius:24px;padding:22px;box-sizing:border-box;box-shadow:0 12px 38px rgba(0,0,0,.07)}
  .rm-boot-top{display:flex;align-items:center;gap:13px;margin-bottom:16px}.rm-boot-mark{width:48px;height:48px;border-radius:15px;background:#f0ecff;color:#6f4cff;display:grid;place-items:center;font-size:25px;font-weight:700;flex:none}
  .rm-boot-copy h1{font-size:22px;line-height:1.15;margin:0 0 4px}.rm-boot-copy p{font-size:13px;line-height:1.4;color:#77777c;margin:0}
  .rm-boot-bar{height:6px;background:#ececf0;border-radius:999px;overflow:hidden;margin:16px 0 18px}.rm-boot-bar span{display:block;height:100%;width:8%;background:#7d5cff;border-radius:inherit;transition:width .22s ease}
  .rm-boot-steps{display:grid;gap:9px}.rm-boot-step{display:flex;align-items:center;gap:9px;font-size:13px;line-height:1.25;color:#55555b}.rm-boot-step::before{content:"";width:8px;height:8px;border-radius:50%;background:#d2d2d7;flex:none}.rm-boot-step strong{font-weight:600;color:#242428}.rm-boot-step [data-boot-value]{margin-left:auto;color:#8e8e93;font-size:12px}
  .rm-boot-step[data-state="active"]::before{background:#7d5cff;box-shadow:0 0 0 4px rgba(125,92,255,.12)}.rm-boot-step[data-state="ok"]::before{background:#34c759}.rm-boot-step[data-state="warn"]::before{background:#ff9f0a}.rm-boot-step[data-state="error"]::before{background:#ff3b30}
  .rm-boot-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px}.rm-boot-actions button{appearance:none;border:0;border-radius:13px;padding:12px 10px;background:#ededf2;color:#17171a;font:600 13px/1.2 inherit}.rm-boot-actions button:first-child{background:#111114;color:#fff}.rm-boot-actions button:last-child{grid-column:1/-1}
  .rm-boot-diagnostics{margin:14px 0 0;padding:11px;border-radius:12px;background:#f5f5f7;max-height:180px;overflow:auto;white-space:pre-wrap;word-break:break-word;font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#66666b}
  body.rm-boot-failed #rmBoot{overflow:auto}.rm-boot-fallback{display:none;margin-top:14px;font-size:12px;line-height:1.45;color:#8e8e93}
  @media(prefers-color-scheme:dark){html,body,#rmBoot{background:#111114;color:#f7f7f8}.rm-boot-card{background:#1c1c1e;box-shadow:none}.rm-boot-mark{background:#28213d;color:#b7a6ff}.rm-boot-copy p,.rm-boot-step,.rm-boot-fallback{color:#a1a1a6}.rm-boot-step strong{color:#f2f2f4}.rm-boot-bar{background:#2c2c2e}.rm-boot-actions button{background:#2c2c2e;color:#f7f7f8}.rm-boot-actions button:first-child{background:#f2f2f4;color:#111114}.rm-boot-diagnostics{background:#111114;color:#b9b9be}}
</style>
'''

BOOT_HTML = r'''
<div id="rmBoot" role="status" aria-live="polite">
  <section class="rm-boot-card" aria-labelledby="rmBootHeadline">
    <div class="rm-boot-top">
      <div class="rm-boot-mark" aria-hidden="true">✦</div>
      <div class="rm-boot-copy"><h1 id="rmBootHeadline">Abrindo o Registro</h1><p id="rmBootDetail">Preparando a interface…</p></div>
    </div>
    <div class="rm-boot-bar" aria-hidden="true"><span id="rmBootProgress"></span></div>
    <div class="rm-boot-steps">
      <div class="rm-boot-step" data-boot-step="shell"><strong>Tela inicial</strong><span data-boot-value>aguardando</span></div>
      <div class="rm-boot-step" data-boot-step="cache"><strong>Ambiente web</strong><span data-boot-value>verificando</span></div>
      <div class="rm-boot-step" data-boot-step="storage"><strong>Dados locais</strong><span data-boot-value>verificando</span></div>
      <div class="rm-boot-step" data-boot-step="engine"><strong>Motor do app</strong><span data-boot-value>aguardando</span></div>
      <div class="rm-boot-step" data-boot-step="patches"><strong>Correções finais</strong><span data-boot-value>aguardando</span></div>
      <div class="rm-boot-step" data-boot-step="ready"><strong>Interface funcional</strong><span data-boot-value>aguardando</span></div>
    </div>
    <div class="rm-boot-actions" id="rmBootActions" hidden>
      <button type="button" id="rmBootRetry">Tentar novamente</button>
      <button type="button" id="rmBootRecover">Recuperar interface</button>
      <button type="button" id="rmBootSafe">Abrir modo seguro</button>
      <button type="button" id="rmBootCopy">Copiar diagnóstico</button>
    </div>
    <pre class="rm-boot-diagnostics" id="rmBootDiagnostics" hidden></pre>
    <p class="rm-boot-fallback" id="rmBootFallback">Se esta tela ficar parada por muito tempo, abra recover.html. Seus registros locais não são apagados por esta inicialização.</p>
  </section>
</div>
'''

FALLBACK_JS = r'''
<script>
window.REGISTRO_SHELL_RELEASE='__RELEASE__';
setTimeout(function(){
  if(window.__RM_BOOT_STARTED)return;
  var h=document.getElementById('rmBootHeadline');
  var d=document.getElementById('rmBootDetail');
  var a=document.getElementById('rmBootActions');
  var f=document.getElementById('rmBootFallback');
  if(h)h.textContent='O inicializador não carregou';
  if(d)d.textContent='A página abriu, mas o arquivo de inicialização não respondeu.';
  if(a)a.hidden=false;
  if(f)f.style.display='block';
  var retry=document.getElementById('rmBootRetry');
  var recover=document.getElementById('rmBootRecover');
  var safe=document.getElementById('rmBootSafe');
  if(retry)retry.onclick=function(){location.replace('./launch.html?fallback='+Date.now())};
  if(recover)recover.onclick=function(){location.href='./recover.html?fallback='+Date.now()};
  if(safe)safe.onclick=function(){location.href='./safe.html?fallback='+Date.now()};
},8000);
</script>
'''

# -----------------------------------------------------------------------------
# INDEX: shell visual aparece antes do motor pesado. O app.js deixa de bloquear
# a primeira pintura; boot.js o carrega somente depois de dois frames.
# -----------------------------------------------------------------------------
index_path = ROOT / "index.html"
if not index_path.exists():
    raise SystemExit("index.html ausente")
index = index_path.read_text(encoding="utf-8")

# Versiona recursos estáticos e textos visíveis sem depender da versão-base.
index = re.sub(r'(manifest\.webmanifest\?v=)[^"\']+', rf'\g<1>{RELEASE}', index)
index = re.sub(r'(styles\.css\?v=)[^"\']+', rf'\g<1>{RELEASE}', index)
index = re.sub(r'<span class="version-inline" id="topVersion">v[^<]+</span>', f'<span class="version-inline" id="topVersion">v{RELEASE}</span>', index)
index = re.sub(r'<strong id="versionLabel">[^<]+</strong>', f'<strong id="versionLabel">{RELEASE}</strong>', index)

# Remove a opção de espessura diretamente do HTML publicado, em vez de apenas
# escondê-la depois que o JavaScript inicia.
index = re.sub(
    r'\s*<div class="setting-separator"></div>\s*'
    r'<div class="setting-block"><div class="setting-label"><strong>Espessura dos ícones</strong>.*?'
    r'id="iconWeightControl".*?</div></div>',
    '',
    index,
    flags=re.S,
)

# Evita cache HTTP agressivo da página de entrada durante desenvolvimento.
cache_meta = (
    '  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n'
    '  <meta http-equiv="Pragma" content="no-cache">\n'
    '  <meta http-equiv="Expires" content="0">\n'
)
if 'http-equiv="Cache-Control"' not in index:
    index = index.replace('  <meta charset="utf-8">\n', '  <meta charset="utf-8">\n' + cache_meta, 1)

if 'id="rmBootCriticalStyle"' not in index:
    index = index.replace('</head>', BOOT_CSS + '\n</head>', 1)
index = re.sub(r'<body(?:\s+class="[^"]*")?>', '<body class="rm-booting">', index, count=1)
if 'id="rmBoot"' not in index:
    index = index.replace('<body class="rm-booting">', '<body class="rm-booting">\n' + BOOT_HTML, 1)

loader = FALLBACK_JS.replace('__RELEASE__', RELEASE) + f'\n<script src="./boot.js?v={RELEASE}" defer></script>'
index, replaced = re.subn(r'<script src="\./app\.js\?v=[^"]+"></script>', loader, index, count=1)
if replaced != 1:
    # Permite reexecutar o preparador sobre um shell já convertido.
    index = re.sub(r'<script src="\./boot\.js\?v=[^"]+" defer></script>', f'<script src="./boot.js?v={RELEASE}" defer></script>', index)
    if 'window.REGISTRO_SHELL_RELEASE' not in index:
        index = index.replace('</body>', loader + '\n</body>', 1)

(SITE / "index.html").write_text(index, encoding="utf-8")

# -----------------------------------------------------------------------------
# APP: usa o bundle consolidado atual, mas remove patches anexados ao final e
# neutraliza qualquer tentativa antiga de registrar Service Worker.
# -----------------------------------------------------------------------------
app_path = ROOT / "app.js"
if not app_path.exists():
    raise SystemExit("app.js ausente")
app = app_path.read_text(encoding="utf-8")

marker = '/* Registro Mental V1 — ícone de duas estrelas + peso fixo dos ícones */'
if marker in app:
    app = app.split(marker, 1)[0].rstrip() + "\n"

version_match = re.search(r"const VERSION = '(\d+\.\d+\.\d+)';", app)
if version_match:
    base_version = version_match.group(1)
    app = app.replace(base_version, RELEASE)
else:
    base_version = "desconhecida"

# c35 registrava/atualizava o SW em toda inicialização e também no botão de
# atualização. Durante desenvolvimento isso é contraproducente e foi uma fonte
# real de cópias antigas/mistas no iOS.
app = app.replace('navigator.serviceWorker.register', 'window.__RM_DISABLED_SW_REGISTER')

(SITE / "app.js").write_text(app, encoding="utf-8")

# -----------------------------------------------------------------------------
# Arquivos pequenos e independentes.
# -----------------------------------------------------------------------------
for name in ("boot.js", "patches.js", "launch.html", "safe.html", "recover.html"):
    src = ROOT / name
    if not src.exists():
        raise SystemExit(f"{name} ausente")
    text = src.read_text(encoding="utf-8").replace('__RELEASE__', RELEASE)
    (SITE / name).write_text(text, encoding="utf-8")

styles = (ROOT / "styles.css").read_text(encoding="utf-8")
(SITE / "styles.css").write_text(styles, encoding="utf-8")

manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
manifest["name"] = "Registro Mental — Diário, Medicação e Sono"
manifest["short_name"] = "Registro"
manifest["id"] = "./"
manifest["scope"] = "./"
manifest["start_url"] = f"./launch.html?v={RELEASE}"
manifest["display"] = "standalone"
manifest["background_color"] = "#f5f5f7"
manifest["theme_color"] = "#f5f5f7"
manifest["prefer_related_applications"] = False
manifest["display_override"] = ["standalone", "minimal-ui"]
(SITE / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Worker de aposentadoria: se uma instalação antiga ainda procurar sw.js, ele
# assume uma única vez, limpa apenas caches da V1 e remove a própria inscrição.
retire_sw = f'''/* Registro Mental {RELEASE} — Service Worker aposentado */
self.addEventListener('install', event => {{ event.waitUntil(self.skipWaiting()); }});
self.addEventListener('activate', event => {{
  event.waitUntil((async () => {{
    try {{
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.startsWith('registro-v1-')).map(k => caches.delete(k)));
    }} catch (_) {{}}
    try {{ await self.registration.unregister(); }} catch (_) {{}}
    try {{
      const clients = await self.clients.matchAll({{ type: 'window', includeUncontrolled: true }});
      clients.forEach(client => client.postMessage({{ type: 'REGISTRO_SW_RETIRED', release: '{RELEASE}' }}));
    }} catch (_) {{}}
  }})());
}});
'''
(SITE / "sw.js").write_text(retire_sw, encoding="utf-8")

(SITE / "release-guard.js").write_text(
    f"/* Registro Mental release {RELEASE} */\nwindow.REGISTRO_AVAILABLE_RELEASE='{RELEASE}';\n",
    encoding="utf-8",
)

for name in (
    "SHORTCUT-SLEEP.txt", "v04demo.js", "v04tabbar.js", "v04navicons.js",
    "tabbar-lab.html", "tabbar-editor.html", "dev-editor.html",
    "preview-escala-humor.html",
):
    src = ROOT / name
    if src.exists():
        shutil.copy2(src, SITE / name)

(SITE / ".nojekyll").write_text("", encoding="utf-8")

# -----------------------------------------------------------------------------
# Validações de release: falhar no GitHub Actions é melhor do que publicar uma
# tela branca.
# -----------------------------------------------------------------------------
published_index = (SITE / "index.html").read_text(encoding="utf-8")
published_app = (SITE / "app.js").read_text(encoding="utf-8")
published_boot = (SITE / "boot.js").read_text(encoding="utf-8")

checks = {
    "boot visual inserido": 'id="rmBoot"' in published_index,
    "index carrega boot.js": f'boot.js?v={RELEASE}' in published_index,
    "index não bloqueia em app.js": '<script src="./app.js?' not in published_index,
    "versão visível correta": f'v{RELEASE}' in published_index,
    "registro de SW antigo neutralizado": 'navigator.serviceWorker.register' not in published_app,
    "patch antigo removido do bundle": marker not in published_app,
    "boot versionado": RELEASE in published_boot,
    "modo seguro publicado": (SITE / "safe.html").exists(),
    "launcher publicado": (SITE / "launch.html").exists(),
    "recuperação publicada": (SITE / "recover.html").exists(),
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(f"[{'OK' if ok else 'FALHA'}] {name}")
if failed:
    raise SystemExit("Release bloqueada: " + ", ".join(failed))

print(f"Registro Mental {RELEASE} preparado sem dependência do repositório antigo.")
print(f"Versão-base detectada no bundle: {base_version}")
print(f"app.js: {(SITE / 'app.js').stat().st_size / 1024:.1f} KB")
print(f"boot.js: {(SITE / 'boot.js').stat().st_size / 1024:.1f} KB")
