# protoboard-paso-a-paso

Skill de Claude Code que convierte un esquemático en una **animación HTML paso a paso de cómo montarlo en protoboard**. La animación indica los huecos exactos de cada pata (`4c`, `33h`…), la orientación de cada transistor, el código de colores de los cables y una nota «Para la sustentación» en cada paso. Al tocar cualquier pieza o cable se abre una ficha que dice qué es, qué hace, en qué huecos y nodos están sus patas y con qué otras piezas está unida. La animación termina con una prueba interactiva que muestra el camino de la corriente. Antes de entregar, un script comprueba que la protoboard tiene exactamente las mismas redes que el esquema.

Abre `assets/ejemplo_puente_h.html` en el navegador para ver un ejemplo completo: el puente H con A715/D882 del anexo de una práctica de Electrónica Análoga.

## Requisitos

| Herramienta | Para qué | ¿Obligatoria? |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | Ejecuta la skill | Sí |
| Node.js ≥ 18 | Verificación de redes (`scripts/verificar_protoboard.cjs`) | Sí |
| Python 3 | Conversor de KiCad (`scripts/netlist_a_json.py`) y servidor local de revisión | Sí |
| Navegador web moderno | Ver la animación (doble clic en el `.html`) | Sí |
| KiCad 7 u 8 (`kicad-cli`) | Leer esquemas `.kicad_sch` | Si el esquema es de KiCad |
| poppler-utils (`pdftoppm`, `pdftotext`) | Recortar y leer figuras de un PDF | Si el esquema viene en PDF |
| ngspice o el simulador de KiCad | Calcular los valores de la prueba interactiva | Opcional |
| Playwright MCP | Captura de revisión antes de entregar | Opcional |
| git y GitHub CLI (`gh`) | Instalar y actualizar la skill desde este repositorio | Opcional |

Para comprobar qué tienes instalado:

```bash
bash scripts/comprobar_herramientas.sh
```

En Ubuntu o Debian: `sudo apt install nodejs python3 poppler-utils kicad`. En Windows y macOS, instala Node.js desde <https://nodejs.org>, Python desde <https://www.python.org> y KiCad desde <https://www.kicad.org>. Para usar `pdftoppm` y `pdftotext`, instala poppler: en macOS con `brew install poppler`; en Windows, con los binarios de poppler-windows.

Las fuentes tipográficas se cargan de Google Fonts si hay internet. Sin conexión, la página usa las fuentes del sistema y funciona igual.

## Instalación

```bash
git clone https://github.com/opcionmatematica-creator/protoboard-paso-a-paso.git ~/.claude/skills/protoboard-paso-a-paso
```

Reinicia Claude Code. La skill se activa sola cuando pides algo como «hazme la animación de cómo montar este circuito en la protoboard». También puedes llamarla con `/protoboard-paso-a-paso`.

## Qué puede leer

- Esquemas de KiCad (`.kicad_sch`)
- PDF con la figura del circuito (guías de laboratorio, anexos)
- Imágenes o fotos de un esquema
- Netlists SPICE

## Piezas que dibuja

- Transistores en TO-92, TO-126 y TO-220 (también reguladores y MOSFET)
- Resistencias de ¼, ½, 1 y 2 W con su código de colores
- Diodos y LED
- Condensadores cerámicos y electrolíticos
- Potenciómetros
- Circuitos integrados DIP de cualquier número de patas
- Cables rectos, curvos e «interruptor» para las entradas
- Fuente de laboratorio y salidas a cargas externas, como un motor

## Estructura

```
SKILL.md                          instrucciones para Claude
assets/plantilla.html             motor de dibujo y animación (se copia y se rellenan los datos)
assets/ejemplo_puente_h.html      ejemplo completo y verificado
scripts/verificar_protoboard.cjs  verificación de huecos y redes contra el esquema
scripts/netlist_a_json.py         KiCad → redes.json
scripts/comprobar_herramientas.sh comprueba los requisitos
references/formato.md             formato de CONFIG, PARTS y STEPS
references/disposicion.md         reglas de disposición en la protoboard
references/pinouts.md             pinouts físicos frecuentes y numeración de KiCad
```

## Verificar un montaje a mano

```bash
python3 scripts/netlist_a_json.py mi_circuito.kicad_sch redes.json
node scripts/verificar_protoboard.cjs montaje.html redes.json
# 27 piezas y cables, 55 huecos usados, 14 redes del esquema comparadas
# OK: sin huecos repetidos y todas las redes coinciden
```
