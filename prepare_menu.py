from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "site"
STABLE_RELEASE = os.environ.get("STABLE_RELEASE", "1.1.1").strip()
BETA_LABEL = os.environ.get("BETA_LABEL", "1.2.0-beta.7").strip()

if not SITE.exists():
    raise SystemExit("site/ ausente")

html = f'''<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#111114">
  <meta name="robots" content="noindex,nofollow">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Registro Menu">
  <title>Menu · Registro Mental</title>
  <link rel="icon" href="./icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="./icon.svg">
  <style>
    :root{{--bg:#0d0d10;--card:#1a1a1f;--card2:#202027;--text:#f7f7f8;--muted:#9c9ca4;--line:#2c2c34;--violet:#9d7cff;--green:#4bd168;--orange:#ff9f0a;--blue:#5ac8fa}}
    *{{box-sizing:border-box}}
    html,body{{margin:0;width:100%;max-width:100%;min-height:100%;overflow-x:hidden;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}}
    body{{min-height:100dvh}}
    main{{width:100%;max-width:480px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 16px calc(34px + env(safe-area-inset-bottom));overflow:hidden}}
    header{{padding:4px 4px 20px}}
    h1{{font-size:32px;line-height:1.05;margin:0 0 8px;letter-spacing:-.035em}}
    .lead{{margin:0;color:var(--muted);font-size:14px;line-height:1.45}}
    .section-title{{margin:22px 4px 9px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#777780;font-weight:750}}
    .grid{{width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}
    .card{{width:100%;min-width:0;overflow:hidden;display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit;background:linear-gradient(180deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:19px;padding:14px;min-height:82px;-webkit-tap-highlight-color:transparent;transition:transform .12s ease,border-color .12s ease}}
    .card:active{{transform:scale(.985);border-color:#555561}}
    .card.wide{{grid-column:1/-1}}
    .app-card{{align-items:flex-start;min-height:124px;padding:14px;gap:12px}}
    .icon{{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;flex:0 0 48px;background:#292932;border:1px solid #373742;overflow:hidden}}
    .icon svg{{display:block;width:27px;height:27px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}}
    .app-card .icon{{width:60px;height:60px;flex-basis:60px;border-radius:17px;background:transparent;border:0}}
    .app-card .icon img{{display:block;width:60px;height:60px;object-fit:contain}}
    .copy{{min-width:0;flex:1;overflow:hidden}}
    .copy strong{{display:flex;min-width:0;align-items:center;flex-wrap:wrap;gap:5px 7px;font-size:15px;line-height:1.18;margin-bottom:4px;overflow-wrap:anywhere}}
    .copy small{{display:block;color:var(--muted);font-size:11.5px;line-height:1.35;overflow-wrap:anywhere}}
    .tag{{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;padding:3px 7px;border-radius:999px;font-size:9px;line-height:1;white-space:nowrap;font-weight:800;letter-spacing:.03em}}
    .tag.stable{{background:#17361f;color:#80e28f}}.tag.beta{{background:#38216d;color:#c7a8ff}}
    .arrow{{flex:0 0 auto;align-self:center;color:#6f6f78;font-size:24px;line-height:1;margin-left:auto}}
    .note{{margin:18px 4px 0;padding:13px 14px;border-radius:15px;background:#17171c;border:1px solid var(--line);color:var(--muted);font-size:12px;line-height:1.45}}.note strong{{color:var(--text)}}
    @media(max-width:400px){{main{{padding-left:14px;padding-right:14px}}.grid{{gap:9px}}.card{{padding:12px;gap:10px}}.app-card{{min-height:118px}}.app-card .icon{{width:55px;height:55px;flex-basis:55px}}.app-card .icon img{{width:55px;height:55px}}.icon{{width:44px;height:44px;flex-basis:44px}}.icon svg{{width:25px;height:25px}}.copy strong{{font-size:14px}}.copy small{{font-size:11px}}}}
    @media(max-width:340px){{.grid{{grid-template-columns:1fr}}.card.wide{{grid-column:auto}}}}
  </style>
</head>
<body>
<main>
  <header><h1>Registro Mental</h1><p class="lead">Menu de acesso aos ambientes, testes e ferramentas de recuperação.</p></header>
  <div class="section-title">Apps</div>
  <div class="grid">
    <a class="card app-card" href="./"><span class="icon"><img src="./icon.svg" alt=""></span><span class="copy"><strong>Oficial <span class="tag stable">ESTÁVEL</span></strong><small>Uso diário · v{STABLE_RELEASE}<br>Seus dados reais.</small></span></a>
    <a class="card app-card" href="./beta/"><span class="icon"><img src="./beta/icon.svg" alt=""></span><span class="copy"><strong>Beta <span class="tag beta">BETA</span></strong><small>Testes · v{BETA_LABEL}<br>Dados isolados.</small></span></a>
  </div>
  <div class="section-title">Diagnóstico</div>
  <div class="grid">
    <a class="card wide" href="./diagnostico/"><span class="icon" style="color:var(--violet)"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5"/><path d="M12 4V2.5M12 21.5V20M4 12H2.5M21.5 12H20"/><path d="M8.5 12.2 10.7 14.4 15.8 9.3"/></svg></span><span class="copy"><strong>Central de Diagnóstico</strong><small>Reúne as ferramentas de abertura, recuperação e modo seguro.</small></span><span class="arrow">›</span></a>
  </div>
  <div class="section-title">Ferramentas do Oficial</div>
  <div class="grid">
    <a class="card" href="./launch.html"><span class="icon" style="color:var(--blue)"><svg viewBox="0 0 24 24"><path d="M14.2 4.1c2.2-1.1 4.2-1.2 5.7-1-0.1 1.6-.5 3.7-2 5.8l-5.4 7.5-4.9-4.9 6.6-7.4Z"/><circle cx="15.3" cy="7.7" r="1.4"/><path d="M8.2 12.1 4 13.3l-1.7 3.4 5.3-.7M12 15.8l-1.2 4.1-3.4 1.8.7-5.4"/></svg></span><span class="copy"><strong>Inicializador</strong><small>Abertura limpa do Oficial.</small></span></a>
    <a class="card" href="./recover.html"><span class="icon" style="color:var(--orange)"><svg viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4.5 4.5A8.5 8.5 0 1 1 3.8 15"/><path d="M12 8v4l2.7 1.7"/></svg></span><span class="copy"><strong>Recuperação</strong><small>Limpa apenas a interface/cache.</small></span></a>
    <a class="card wide" href="./safe.html"><span class="icon" style="color:var(--green)"><svg viewBox="0 0 24 24"><path d="M12 2.8 5.2 5.7v5.1c0 4.7 2.7 8 6.8 10.2 4.1-2.2 6.8-5.5 6.8-10.2V5.7L12 2.8Z"/><path d="m8.8 12 2.1 2.1 4.5-4.6"/></svg></span><span class="copy"><strong>Modo Seguro</strong><small>Verifica seus dados e permite backup mesmo se o app principal falhar.</small></span><span class="arrow">›</span></a>
  </div>
  <div class="section-title">Ferramentas da Beta</div>
  <div class="grid">
    <a class="card" href="./beta/launch.html"><span class="icon" style="color:var(--blue)"><svg viewBox="0 0 24 24"><path d="M14.2 4.1c2.2-1.1 4.2-1.2 5.7-1-0.1 1.6-.5 3.7-2 5.8l-5.4 7.5-4.9-4.9 6.6-7.4Z"/><circle cx="15.3" cy="7.7" r="1.4"/><path d="M8.2 12.1 4 13.3l-1.7 3.4 5.3-.7M12 15.8l-1.2 4.1-3.4 1.8.7-5.4"/></svg></span><span class="copy"><strong>Inicializador Beta</strong><small>Abertura limpa da Beta.</small></span></a>
    <a class="card" href="./beta/recover.html"><span class="icon" style="color:var(--orange)"><svg viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4.5 4.5A8.5 8.5 0 1 1 3.8 15"/><path d="M12 8v4l2.7 1.7"/></svg></span><span class="copy"><strong>Recuperar Beta</strong><small>Não toca no Oficial.</small></span></a>
    <a class="card wide" href="./beta/safe.html"><span class="icon" style="color:var(--green)"><svg viewBox="0 0 24 24"><path d="M12 2.8 5.2 5.7v5.1c0 4.7 2.7 8 6.8 10.2 4.1-2.2 6.8-5.5 6.8-10.2V5.7L12 2.8Z"/><path d="m8.8 12 2.1 2.1 4.5-4.6"/></svg></span><span class="copy"><strong>Modo Seguro Beta</strong><small>Inspeciona somente os dados descartáveis de testes.</small></span><span class="arrow">›</span></a>
  </div>
  <div class="note"><strong>Importante:</strong> a Beta continua usando armazenamento separado. Copiar dados do Oficial para a Beta cria uma cópia independente; alterações feitas depois na Beta não modificam seus registros reais.</div>
</main>
</body>
</html>'''

(SITE / "menu.html").write_text(html, encoding="utf-8")
menu_dir = SITE / "menu"
menu_dir.mkdir(exist_ok=True)
(menu_dir / "index.html").write_text('''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=../menu.html"><title>Menu · Registro Mental</title><script>location.replace('../menu.html')</script></head><body></body></html>''', encoding="utf-8")

if 'grid-template-columns:repeat(2,minmax(0,1fr))' not in html:
    raise SystemExit("Menu sem correção responsiva")
if 'href="./beta/"' not in html or 'src="./beta/icon.svg"' not in html:
    raise SystemExit("Links do menu incorretos")

print(f"Menu responsivo publicado · Oficial {STABLE_RELEASE} · Beta {BETA_LABEL}")
