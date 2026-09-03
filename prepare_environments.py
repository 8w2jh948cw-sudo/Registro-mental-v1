from pathlib import Path
import json
import os
import re
import shutil

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "site"
BETA_SOURCE = ROOT / "_beta_site"
STABLE_RELEASE = os.environ.get("STABLE_RELEASE", "1.1.1").strip()
BETA_BUILD_RELEASE = os.environ.get("BETA_BUILD_RELEASE", "1.2.0").strip()
BETA_LABEL = os.environ.get("BETA_LABEL", f"{BETA_BUILD_RELEASE}-beta.4").strip()

if not SITE.exists() or not (SITE / "index.html").exists():
    raise SystemExit("Site Oficial ainda não foi preparado")
if not BETA_SOURCE.exists() or not (BETA_SOURCE / "index.html").exists():
    raise SystemExit("Build da Beta ausente em _beta_site")

# -----------------------------------------------------------------------------
# OFICIAL: fica congelado no snapshot da branch stable. Só adicionamos uma
# identificação visual que não interfere no motor do app.
# -----------------------------------------------------------------------------
official_index_path = SITE / "index.html"
official_index = official_index_path.read_text(encoding="utf-8")
official_stamp = f'''
<style id="rmStableReleaseStamp">
  #topVersion{{font-size:0!important}}
  #topVersion::after{{content:"v{STABLE_RELEASE}";font-size:10px!important}}
  #versionLabel{{font-size:0!important}}
  #versionLabel::after{{content:"{STABLE_RELEASE}";font-size:14px!important}}
</style>
'''
if 'id="rmStableReleaseStamp"' not in official_index:
    official_index = official_index.replace('</head>', official_stamp + '</head>', 1)
official_index_path.write_text(official_index, encoding="utf-8")

(SITE / "environment.json").write_text(json.dumps({
    "environment": "production",
    "release": STABLE_RELEASE,
    "data": "registro-mental-v1",
    "stable": True,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# -----------------------------------------------------------------------------
# BETA: cópia do build de desenvolvimento, mas com banco e chaves próprios.
# Nada gravado aqui pode alterar o banco Oficial.
# -----------------------------------------------------------------------------
beta = SITE / "beta"
if beta.exists():
    shutil.rmtree(beta)
shutil.copytree(BETA_SOURCE, beta)

# Isola o IndexedDB e todas as chaves locais conhecidas do app.
app_path = beta / "app.js"
app = app_path.read_text(encoding="utf-8")
app = app.replace("registro-mental-v1", "registro-mental-beta-v1")
app = app.replace("registro-settings-v2", "registro-beta-settings-v1")
app = app.replace("registro-last-backup", "registro-beta-last-backup")
app = app.replace("registro-last-health-import", "registro-beta-last-health-import")
app = app.replace("registro-demo-seeded", "registro-beta-demo-seeded")
app = app.replace("registro-v1-", "registro-beta-v1-")
app_path.write_text(app, encoding="utf-8")

# Boot/launcher/patches/recovery da Beta só podem limpar ou observar a própria
# subpasta e seus próprios caches.
for name in ("boot.js", "launch.html", "patches.js", "recover.html", "safe.html", "sw.js"):
    path = beta / name
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    text = text.replace("/Registro-mental-v1/", "/Registro-mental-v1/beta/")
    text = text.replace("registro-v1-", "registro-beta-v1-")
    text = text.replace("registro-mental-v1", "registro-mental-beta-v1")
    text = text.replace("registro-settings-v2", "registro-beta-settings-v1")
    text = text.replace(BETA_BUILD_RELEASE, BETA_LABEL)
    path.write_text(text, encoding="utf-8")

# Ferramentas de teste e camada onde entram as próximas mudanças experimentais.
beta_tools = (ROOT / "beta-tools.js").read_text(encoding="utf-8").replace("__BETA_RELEASE__", BETA_LABEL)
(beta / "beta-tools.js").write_text(beta_tools, encoding="utf-8")
shutil.copy2(ROOT / "beta-patches.js", beta / "beta-patches.js")

beta_index_path = beta / "index.html"
beta_index = beta_index_path.read_text(encoding="utf-8")
beta_index = beta_index.replace(BETA_BUILD_RELEASE, BETA_LABEL)
beta_index = beta_index.replace('<title>Registro</title>', '<title>Registro Beta</title>')
beta_index = beta_index.replace('content="Registro"', 'content="Registro Beta"')
if 'name="robots"' not in beta_index:
    beta_index = beta_index.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="robots" content="noindex,nofollow">', 1)

beta_stamp = f'''
<style id="rmBetaReleaseStamp">
  #topVersion{{font-size:0!important}}
  #topVersion::after{{content:"v{BETA_LABEL}";font-size:10px!important}}
  #versionLabel{{font-size:0!important}}
  #versionLabel::after{{content:"{BETA_LABEL}";font-size:14px!important}}
</style>
'''
if 'id="rmBetaReleaseStamp"' not in beta_index:
    beta_index = beta_index.replace('</head>', beta_stamp + '</head>', 1)
if 'beta-tools.js' not in beta_index:
    beta_index = beta_index.replace('</body>', f'<script src="./beta-tools.js?v={BETA_LABEL}" defer></script>\n<script src="./beta-patches.js?v={BETA_LABEL}" defer></script>\n</body>', 1)
beta_index_path.write_text(beta_index, encoding="utf-8")

manifest_path = beta / "manifest.webmanifest"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["name"] = "Registro Mental Beta"
manifest["short_name"] = "Registro Beta"
manifest["id"] = "./beta/"
manifest["scope"] = "./"
manifest["start_url"] = f"./launch.html?v={BETA_LABEL}"
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

(beta / "environment.json").write_text(json.dumps({
    "environment": "beta",
    "release": BETA_LABEL,
    "database": "registro-mental-beta-v1",
    "settings": "registro-beta-settings-v1",
    "writes_to_production": False,
    "copy_direction": "production-to-beta-only",
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# -----------------------------------------------------------------------------
# CENTRAL DE DIAGNÓSTICO: apenas navegação. As ferramentas reais continuam
# independentes para funcionarem mesmo quando o app principal quebrar.
# -----------------------------------------------------------------------------
diag = SITE / "diagnostico"
diag.mkdir(exist_ok=True)
diag_html = f'''<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f5f5f7">
<title>Diagnóstico · Registro Mental</title>
<style>
html,body{{margin:0;min-height:100%;background:#f5f5f7;color:#111114;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}}main{{max-width:430px;margin:auto;padding:calc(28px + env(safe-area-inset-top)) 18px 36px}}h1{{font-size:28px;margin:0 0 7px}}.lead{{margin:0 0 22px;color:#6e6e73;line-height:1.45;font-size:14px}}h2{{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8e8e93;margin:22px 4px 8px}}.card{{display:block;text-decoration:none;color:inherit;background:#fff;border-radius:17px;padding:15px 16px;margin:9px 0;box-shadow:0 4px 18px rgba(0,0,0,.04)}}.card strong{{display:block;font-size:15px;margin-bottom:4px}}.card span{{display:block;color:#6e6e73;font-size:12px;line-height:1.4}}.tag{{display:inline-block!important;width:auto;margin-top:7px;padding:4px 7px;border-radius:999px;background:#eeeafc;color:#6f4cff!important;font-weight:700;font-size:10px!important}}.warn .tag{{background:#fff1dc;color:#c66a00!important}}@media(prefers-color-scheme:dark){{html,body{{background:#111114;color:#f7f7f8}}.card{{background:#1c1c1e;box-shadow:none}}.lead,.card span,h2{{color:#a1a1a6}}}}
</style></head><body><main>
<h1>Diagnóstico</h1><p class="lead">Ferramentas independentes para abrir, recuperar ou verificar o Registro sem apagar seus dados pessoais.</p>
<h2>Oficial · {STABLE_RELEASE}</h2>
<a class="card" href="../"><strong>Abrir app Oficial</strong><span>Versão estável usada no dia a dia.</span><span class="tag">ESTÁVEL</span></a>
<a class="card" href="../launch.html"><strong>Inicializador seguro</strong><span>Faz uma abertura limpa e resolve controladores antigos antes de entregar a interface.</span></a>
<a class="card warn" href="../recover.html"><strong>Recuperar interface</strong><span>Remove somente runtime/cache da interface. Não apaga IndexedDB nem seus registros.</span><span class="tag">EMERGÊNCIA</span></a>
<a class="card" href="../safe.html"><strong>Modo seguro</strong><span>Lê os dados locais sem depender do motor principal e permite backup de emergência.</span></a>
<h2>Beta · {BETA_LABEL}</h2>
<a class="card" href="../beta/"><strong>Abrir Beta</strong><span>Ambiente para testar mudanças. Usa banco e configurações separados do Oficial.</span><span class="tag">DADOS ISOLADOS</span></a>
<a class="card" href="../beta/launch.html"><strong>Inicializador da Beta</strong><span>Abre somente o ambiente Beta em modo limpo.</span></a>
<a class="card warn" href="../beta/recover.html"><strong>Recuperar Beta</strong><span>Limpa somente runtime/cache da Beta.</span><span class="tag">NÃO TOCA NO OFICIAL</span></a>
<a class="card" href="../beta/safe.html"><strong>Modo seguro da Beta</strong><span>Verifica somente o banco de testes.</span></a>
</main></body></html>'''
(diag / "index.html").write_text(diag_html, encoding="utf-8")

(SITE / "ambientes.json").write_text(json.dumps({
    "official": {"path": "./", "release": STABLE_RELEASE, "branch": "stable", "database": "registro-mental-v1"},
    "beta": {"path": "./beta/", "release": BETA_LABEL, "branch": "main", "database": "registro-mental-beta-v1"},
    "diagnostic": {"path": "./diagnostico/"},
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Validações de isolamento.
checks = {
    "oficial presente": (SITE / "index.html").exists(),
    "beta presente": (beta / "index.html").exists(),
    "beta usa banco isolado": "registro-mental-beta-v1" in (beta / "app.js").read_text(encoding="utf-8"),
    "beta não usa banco oficial": "const DB_NAME='registro-mental-v1'" not in (beta / "app.js").read_text(encoding="utf-8"),
    "beta tem ferramentas": (beta / "beta-tools.js").exists(),
    "beta tem camada experimental": (beta / "beta-patches.js").exists(),
    "diagnóstico presente": (diag / "index.html").exists(),
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(f"[{'OK' if ok else 'FALHA'}] {name}")
if failed:
    raise SystemExit("Ambientes bloqueados: " + ", ".join(failed))

print(f"Oficial congelado: {STABLE_RELEASE}")
print(f"Beta isolada: {BETA_LABEL} / registro-mental-beta-v1")
print("Fluxo permitido de dados: Oficial -> Beta. Nunca Beta -> Oficial.")
