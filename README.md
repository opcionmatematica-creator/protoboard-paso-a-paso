# protoboard-paso-a-paso

Skill de Claude Code: **le pasas un esquemático y te monta la animación paso a paso de cómo armarlo en protoboard**. El esquemático puede ser una imagen, una foto de un dibujo a mano, una captura, un PDF, un archivo de KiCad, EasyEDA, Eagle, LTspice, Proteus, Multisim o Fritzing, o una netlist SPICE. La animación indica los huecos exactos de cada pata (`4c`, `33h`…), la orientación de cada transistor, el código de colores de los cables y una nota «Para la sustentación» en cada paso. Al tocar cualquier pieza o cable se abre una ficha que dice qué es, qué hace, en qué huecos y nodos están sus patas y con qué otras piezas está unida. La animación termina con una prueba interactiva que muestra el camino de la corriente. Antes de entregar, un script comprueba que la protoboard tiene exactamente las mismas redes que el esquema.

**Novedades:**

- **Cables siempre rectos**, horizontales o verticales. El verificador rechaza curvas y diagonales.
- **Una o dos protoboards**: si el circuito no cabe en una, se reparte en dos, unidas por sus rieles.
- **LEDs realistas**: lado plano, yunque y poste, 3 o 5 mm, color real. Se encienden en la prueba y su ficha muestra V<sub>F</sub> e I.
- **Condensadores realistas**: cerámico con su código (104 = 100 nF), poliéster y multicapa; electrolítico visto desde arriba, con franja «−» y tapa de aluminio.
- **Botón «⚡ Corriente»** para mostrar u ocultar la animación de la corriente.
- **Microcontroladores y placas** (Arduino Nano, ESP32, Raspberry Pi Pico, NodeMCU, Wemos D1 mini, ATmega328P, ATtiny85), con dos vistas que se cambian con un botón:
  - **realista**: la placa vista desde arriba, con su chip o módulo, antena, botones, LEDs, conectores y USB en su sitio real;
  - **bloque**: todos los pines coloreados por función (alimentación, tierra, digital, analógico, comunicación, control).

  La ficha de la placa lista todos los pines con sus funciones alternativas. Antes de dibujar cualquier placa, la skill investiga en internet su documentación oficial, medidas y fotos, y cita la fuente.
- **`scripts/construir.cjs`** arma una página a partir de un archivo de datos y actualiza montajes antiguos al motor nuevo sin perder sus datos.

Abre los ejemplos de `assets/` en el navegador:

- `ejemplo_puente_h.html`: puente H con A715/D882 y transistores de mando;
- `ejemplo_leds.html`: LEDs con resistencia e interruptor;
- `ejemplo_555_dos_protoboards.html`: NE555 intermitente repartido en dos protoboards;
- `ejemplo_arduino_nano.html`: Arduino Nano con dos LEDs y su programa.

## Requisitos

| Requisito | Para qué | ¿Obligatorio? |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | Ejecuta la skill | Sí |
| Node.js ≥ 18 | Verifica que la protoboard tenga las mismas conexiones que el esquema | Sí |
| Python 3 | Servidor local de revisión y scripts auxiliares | Sí |
| Navegador web | Ver la animación (doble clic en el `.html`) | Sí |
| Un software de simulación de circuitos (el que uses: KiCad, LTspice, Proteus, Multisim, Falstad…) | Obtener voltajes y corrientes para la prueba interactiva | Opcional |

Para comprobar qué tienes instalado:

```bash
bash scripts/comprobar_herramientas.sh
```

## Instalación

```bash
git clone https://github.com/opcionmatematica-creator/protoboard-paso-a-paso.git ~/.claude/skills/protoboard-paso-a-paso
```

Reinicia Claude Code. La skill se activa sola cuando pides algo como «hazme la animación de cómo montar este circuito en la protoboard». También puedes llamarla con `/protoboard-paso-a-paso`.

## Qué puede leer

Cualquier esquemático:

- imágenes, fotos (incluso de un dibujo a mano) o capturas de pantalla;
- PDF (guías, anexos, datasheets);
- archivos de KiCad, EasyEDA, Eagle, LTspice, Proteus, Multisim o Fritzing;
- netlists SPICE.

Con KiCad, si está `kicad-cli`, las conexiones se extraen automáticamente.

## Piezas que dibuja

- Transistores en TO-92, TO-126 y TO-220 (también reguladores y MOSFET)
- Resistencias de ¼, ½, 1 y 2 W con su código de colores
- Diodos y LED (3 y 5 mm, varios colores, encendidos en la prueba)
- Condensadores cerámicos (con código), de poliéster, multicapa y electrolíticos
- Potenciómetros
- Circuitos integrados y microcontroladores DIP de cualquier número de patas
- Placas de desarrollo (Arduino Nano, ESP32, Raspberry Pi Pico…) y cristales de cuarzo
- Cables rectos (horizontales o verticales) e «interruptor» para las entradas
- Una o dos protoboards
- Fuente de laboratorio y salidas a cargas externas, como un motor

## Estructura

```
SKILL.md                          instrucciones para Claude
assets/plantilla.html             motor de dibujo y animación (se copia y se rellenan los datos)
assets/ejemplo_*.html             ejemplos verificados (puente H, LEDs, 555 en dos protoboards)
scripts/construir.cjs             arma una página desde un archivo de datos o actualiza el motor (--actualizar)
scripts/verificar_protoboard.cjs  verificación de huecos, cables rectos y redes contra el esquema
scripts/netlist_a_json.py         KiCad → redes.json (opcional)
scripts/comprobar_herramientas.sh comprueba los requisitos
references/formato.md             formato de CONFIG, PARTS y STEPS
references/disposicion.md         reglas de disposición en la protoboard
references/pinouts.md             pinouts físicos frecuentes, LEDs, condensadores y numeración de KiCad
references/microcontroladores.md  placas y microcontroladores vistos desde arriba, y cómo investigar uno nuevo
```

## Verificar un montaje a mano

```bash
python3 scripts/netlist_a_json.py mi_circuito.kicad_sch redes.json
node scripts/verificar_protoboard.cjs montaje.html redes.json
# 27 piezas y cables, 55 huecos usados, 14 redes del esquema comparadas
# OK: sin huecos repetidos y todas las redes coinciden
```
