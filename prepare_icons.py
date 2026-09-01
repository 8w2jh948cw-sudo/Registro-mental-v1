from pathlib import Path
import json
import shutil

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "site"

if not SITE.exists():
    raise SystemExit("site/ ausente")
if not (SITE / "beta").exists():
    raise SystemExit("site/beta/ ausente")

OFFICIAL_SOURCE = ROOT / "icon-oficial.svg"
BETA_SOURCE = ROOT / "icon-beta.svg"
if not OFFICIAL_SOURCE.exists() or not BETA_SOURCE.exists():
    raise SystemExit("Ícones-fonte ausentes")

shutil.copy2(OFFICIAL_SOURCE, SITE / "icon.svg")
shutil.copy2(BETA_SOURCE, SITE / "beta" / "icon.svg")


def inject_icon(path: Path, href: str):
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    marker = "rm-environment-icon"
    # Remove uma injeção anterior deste mesmo gerador, permitindo reexecução.
    if marker in text:
        import re
        text = re.sub(r'\s*<!-- rm-environment-icon -->\s*<link rel="icon"[^>]*>\s*<link rel="apple-touch-icon"[^>]*>', '', text, flags=re.S)
    tags = (
        f'\n  <!-- {marker} -->\n'
        f'  <link rel="icon" href="{href}" type="image/svg+xml">\n'
        f'  <link rel="apple-touch-icon" href="{href}">\n'
    )
    text = text.replace("</head>", tags + "</head>", 1)
    path.write_text(text, encoding="utf-8")


# Todas as portas de entrada oficiais usam o ícone sem selo.
for name in ("index.html", "launch.html", "recover.html", "safe.html"):
    inject_icon(SITE / name, "./icon.svg")

# Todas as portas de entrada da Beta usam o ícone com a cápsula BETA.
for name in ("index.html", "launch.html", "recover.html", "safe.html"):
    inject_icon(SITE / "beta" / name, "./icon.svg")

# A Central de Diagnóstico usa a identidade do app Oficial.
inject_icon(SITE / "diagnostico" / "index.html", "../icon.svg")


def patch_manifest(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    data["icons"] = [
        {
            "src": "./icon.svg",
            "sizes": "any",
            "type": "image/svg+xml",
            "purpose": "any maskable"
        }
    ]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


patch_manifest(SITE / "manifest.webmanifest")
patch_manifest(SITE / "beta" / "manifest.webmanifest")

checks = {
    "ícone Oficial publicado": (SITE / "icon.svg").exists(),
    "ícone Beta publicado": (SITE / "beta" / "icon.svg").exists(),
    "Oficial referencia ícone": 'href="./icon.svg"' in (SITE / "index.html").read_text(encoding="utf-8"),
    "Beta referencia ícone": 'href="./icon.svg"' in (SITE / "beta" / "index.html").read_text(encoding="utf-8"),
    "manifest Oficial tem SVG": 'image/svg+xml' in (SITE / "manifest.webmanifest").read_text(encoding="utf-8"),
    "manifest Beta tem SVG": 'image/svg+xml' in (SITE / "beta" / "manifest.webmanifest").read_text(encoding="utf-8"),
    "Beta contém selo": '>BETA</text>' in (SITE / "beta" / "icon.svg").read_text(encoding="utf-8"),
    "Oficial não contém selo": '>BETA</text>' not in (SITE / "icon.svg").read_text(encoding="utf-8"),
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(f"[{'OK' if ok else 'FALHA'}] {name}")
if failed:
    raise SystemExit("Ícones bloqueados: " + ", ".join(failed))

print("Ícones dos ambientes configurados: Oficial sem selo; Beta com selo BETA.")
