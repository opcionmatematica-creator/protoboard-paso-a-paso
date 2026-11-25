#!/usr/bin/env bash
# Comprueba las herramientas que usa la skill protoboard-paso-a-paso.
# Uso: bash comprobar_herramientas.sh
falta=0
ver() { # nombre, comando de versión, obligatoria(1/0), para qué
  local nombre="$1" cmd="$2" oblig="$3" uso="$4" v
  local bin="${cmd%% *}"
  if command -v "$bin" >/dev/null 2>&1 && v=$(eval "$cmd" 2>/dev/null | head -1) && [ -n "$v" ]; then
    printf '  ✓ %-22s %s\n' "$nombre" "$v"
  elif [ "$oblig" = 1 ]; then
    printf '  ✗ %-22s FALTA (obligatoria): %s\n' "$nombre" "$uso"; falta=1
  else
    printf '  · %-22s no instalada (opcional): %s\n' "$nombre" "$uso"
  fi
}
echo "Obligatorias:"
ver "Node.js (≥18)" "node --version" 1 "verificar_protoboard.cjs"
ver "Python 3" "python3 --version" 1 "netlist_a_json.py y servidor local"
echo "Según la entrada:"
ver "kicad-cli (KiCad 7/8)" "kicad-cli version" 0 "esquemas .kicad_sch → redes.json"
ver "pdftoppm (poppler)" "pdftoppm -v 2>&1" 0 "recortar figuras de un PDF"
ver "pdftotext (poppler)" "pdftotext -v 2>&1" 0 "leer el texto de un PDF"
echo "Opcionales:"
ver "ngspice" "ngspice --version 2>&1 | grep -m1 -i ngspice" 0 "simular para los valores de la prueba"
ver "git" "git --version" 0 "versionar o publicar la skill"
ver "gh (GitHub CLI)" "gh --version" 0 "publicar en GitHub"
if [ -n "$(command -v node)" ]; then
  maj=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)
  [ "${maj:-0}" -lt 18 ] && { echo "  ✗ Node.js es anterior a 18: actualízalo"; falta=1; }
fi
echo
if [ $falta = 1 ]; then
  echo "Faltan herramientas obligatorias. En Ubuntu/Debian: sudo apt install nodejs python3 poppler-utils kicad"
  echo "En Windows/macOS: https://nodejs.org, https://www.python.org, https://www.kicad.org"
  exit 1
fi
echo "Listo: las herramientas obligatorias están instaladas."
