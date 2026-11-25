#!/usr/bin/env bash
# Comprueba lo que usa la skill protoboard-paso-a-paso.
# Uso: bash comprobar_herramientas.sh
falta=0
ver() { # nombre, comando de versión, obligatoria(1/0), para qué
  local nombre="$1" cmd="$2" oblig="$3" uso="$4" v
  local bin="${cmd%% *}"
  if command -v "$bin" >/dev/null 2>&1 && v=$(eval "$cmd" 2>/dev/null | head -1) && [ -n "$v" ]; then
    printf '  ✓ %-16s %s\n' "$nombre" "$v"
  elif [ "$oblig" = 1 ]; then
    printf '  ✗ %-16s FALTA: %s\n' "$nombre" "$uso"; falta=1
  else
    printf '  · %-16s no instalado (opcional): %s\n' "$nombre" "$uso"
  fi
}
echo "Obligatorios:"
ver "Node.js (≥18)" "node --version" 1 "verificar las conexiones"
ver "Python 3" "python3 --version" 1 "servidor local y scripts auxiliares"
if command -v node >/dev/null 2>&1; then
  maj=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)
  [ "${maj:-0}" -lt 18 ] && { echo "  ✗ Node.js es anterior a 18: actualízalo"; falta=1; }
fi
echo "  · Navegador web: cualquiera moderno (Chrome, Firefox, Edge, Safari)"
echo
echo "Opcional: software de simulación de circuitos (cualquiera), para los valores de la prueba."
encontrados=""
for s in kicad-cli ngspice ltspice LTspice qucs-s xyce proteus multisim; do
  command -v "$s" >/dev/null 2>&1 && encontrados="$encontrados $s"
done
if [ -n "$encontrados" ]; then echo "  ✓ Detectado:$encontrados"
else echo "  · No se detectó ninguno en el PATH. Si usas uno con interfaz gráfica (LTspice, Proteus, Multisim, Falstad en la web…), también sirve."; fi
echo
if [ $falta = 1 ]; then
  echo "Falta algo obligatorio. Node.js: https://nodejs.org · Python: https://www.python.org"
  echo "En Ubuntu/Debian: sudo apt install nodejs python3"
  exit 1
fi
echo "Listo: lo obligatorio está instalado."
