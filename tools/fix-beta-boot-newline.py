from pathlib import Path

p = Path('beta/boot.js')
s = p.read_text(encoding='utf-8')

# Corrige apenas o caso inválido em que uma quebra de linha literal entrou
# dentro da string de join() durante a geração automática do patch.
bad = "].join('\n');"  # nesta string Python, \n é uma quebra real
fixed = "].join('\\n');"

if bad in s:
    s = s.replace(bad, fixed)
    p.write_text(s, encoding='utf-8')
    print('beta/boot.js corrigido')
else:
    print('beta/boot.js já estava correto; nenhuma alteração necessária')
