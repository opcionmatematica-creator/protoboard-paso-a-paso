---
name: protoboard-paso-a-paso
description: A partir de cualquier esquemático electrónico (imagen, foto de un dibujo a mano, captura de pantalla, PDF, archivo de KiCad, EasyEDA, Eagle, LTspice, Proteus, Multisim, Fritzing, Falstad o una netlist SPICE) genera una animación HTML paso a paso de cómo montar el circuito en protoboard. La animación indica los huecos exactos (p. ej. «4c»), la orientación de cada transistor, diodo, LED o condensador, los microcontroladores y placas (Arduino Nano, ESP32, Raspberry Pi Pico…) dibujados vistos desde arriba con sus pines, el código de colores de los cables y una ficha al tocar cada pieza. Termina con una prueba interactiva y verifica con un script que la protoboard tiene las mismas conexiones que el esquema. Úsala siempre que alguien comparta un esquema o circuito y quiera montarlo, armarlo, cablearlo o pasarlo a la protoboard (breadboard), pida una guía o animación de montaje, pregunte «cómo lo pongo en la protoboard» o quiera revisar si un montaje coincide con el esquema, aunque no diga «animación».
---

# Protoboard paso a paso

El usuario te pasa un esquemático y tú le entregas una página HTML que anima el montaje pieza por pieza sobre una protoboard dibujada a escala. Cada paso dice en qué huecos va cada pata. La página tiene que ser **correcta**: quien la use la seguirá al pie de la letra, y una pata en el hueco equivocado es peor que no tener animación. Por eso el flujo termina siempre con una verificación automática de conexiones.

El dibujo y la animación ya están resueltos en `assets/plantilla.html`. Tu trabajo es entender el circuito, decidir la disposición y escribir solo los **datos** (CONFIG, PARTS, STEPS). En `assets/` hay cuatro ejemplos verificados; mira el más parecido antes de escribir:

- `ejemplo_leds.html`: LEDs con resistencia e interruptor (circuito simple);
- `ejemplo_arduino_nano.html`: Arduino Nano con dos LEDs;
- `ejemplo_555_dos_protoboards.html`: integrado DIP, condensadores y un circuito repartido en dos protoboards;
- `ejemplo_puente_h.html`: transistores de potencia, transistores de mando, entradas y prueba de giro.

## Requisitos

| Requisito | Para qué | ¿Obligatorio? |
|---|---|---|
| Node.js ≥ 18 | Verificar las conexiones (`scripts/verificar_protoboard.cjs`) | Sí |
| Python 3 | Servidor local para revisar la página y scripts auxiliares | Sí |
| Navegador web | Ver la animación (el `.html` se abre con doble clic) | Sí |
| Software de simulación de circuitos (cualquiera: KiCad, LTspice, Proteus, Multisim, Falstad…) | Obtener voltajes y corrientes para la prueba interactiva | Opcional |

`bash scripts/comprobar_herramientas.sh` dice qué hay instalado. Sin simulador, los valores de la prueba se calculan a mano (ley de Ohm, fórmulas del circuito) y se indica que son calculados.

## Flujo

### 1. Entiende el esquema y saca sus conexiones

El objetivo es un `redes.json` con la forma `{"REF:pin": "nombre_de_red"}`: qué pata de qué componente va a qué nodo. Es la fuente de verdad con la que se compara la protoboard. Escríbelo según lo que te pasen:

- **Imagen, foto, captura o PDF**: míralo con atención. En un PDF, si la figura es pequeña, recórtala a 250–300 ppp; con poppler sería `pdftoppm -r 260 -f N -l N -x X -y Y -W W -H H -png`. Sigue cada cable de punta a punta. Un punto relleno es unión; un cruce sin punto no lo es. Lee valores y referencias. Si un trazo es ambiguo, pregunta antes de suponer.
- **Archivo de un programa de diseño**:
  - KiCad: `python3 scripts/netlist_a_json.py esquema.kicad_sch redes.json`, si está `kicad-cli`.
  - Otro programa: pide o exporta su netlist (casi todos exportan SPICE), o lee el archivo; muchos son texto.
  - Si no se puede, trabaja desde una captura.
- **Netlist SPICE**: cada línea es un elemento con sus nodos en orden fijo. `Q` va con colector, base y emisor; `D` con ánodo y cátodo; `R` y `C` con nodo 1 y nodo 2; `X` sigue el orden de su `.subckt`.

Escribe las claves por letra o por nombre de pata: `Q1:E`, `D1:A`, `D1:K`, `C1:+`, `C1:-`, `U1:3` (pata de un DIP), `U1:D9` (pin de una placa) y `R1:1`/`R1:2` (sin orden). Usa nombres de red que se entiendan (`VCC`, `GND`, `B_Q1`, `SALIDA`).

Revisa estos huecos del esquema:

- **Valores que faltan** (voltaje de la fuente, valor de un componente): elige uno razonable y dilo en el informe.
- **Más de una fuente** (por ejemplo, un archivo propio y el esquema de una guía): compáralas antes de montar y avisa de las diferencias. Manda el documento original que te dieron.
- **Esquema leído de una imagen**: incluye en el informe una tabla corta con las redes, para que el usuario confirme que la lectura fue correcta.

### 2. Lista de materiales y patas físicas

Para cada semiconductor, anota el encapsulado y el orden **físico** de las patas. La numeración del símbolo no siempre coincide con el orden físico. Consulta `references/pinouts.md`. Si no conoces con seguridad el pinout de una referencia, dilo en el paso correspondiente y pide confirmarlo con la hoja de datos o con el multímetro. No lo inventes.

**Microcontroladores y placas de desarrollo** (Arduino Nano, ESP32, Raspberry Pi Pico, NodeMCU, ATmega328P, ATtiny85…): lee `references/microcontroladores.md` y **haz siempre una investigación en internet** antes de dibujar la placa. Busca la documentación del fabricante, el dibujo mecánico y fotos de la cara de arriba. Saca de ahí:

- el pinout visto desde arriba;
- la separación entre filas;
- las medidas;
- el tipo y el lado del USB;
- el color del PCB;
- la posición del chip o módulo, la antena, los botones, los LEDs y los conectores;
- las funciones alternativas de cada pin.

Con eso la placa se dibuja en dos vistas, entre las que el usuario cambia con un botón:

- **realista**: la placa vista desde arriba, con sus componentes en su sitio;
- **bloque**: todos los pines coloreados por función.

Pon la fuente en el campo `fuente` (se ve en la ficha) y avisa de lo que no puedas confirmar o de lo que varía entre versiones. Las placas se dibujan con el tipo `modulo` y los microcontroladores DIP con `dip`. Las que no entran en una protoboard (Arduino Uno o Mega) quedan fuera y se conectan con cables.

### 3. Diseña la disposición

Lee `references/disposicion.md` antes de colocar nada: geometría, tamaños de cuerpo, solapes, rieles, cables interruptor, LEDs, condensadores, placas, dos protoboards y orden de los pasos. Las ideas clave:

- **Que la protoboard se parezca al esquema**: mismo orden izquierda/derecha y arriba/abajo, alimentación arriba y tierra abajo como en el dibujo, y entradas y salidas del mismo lado. Quien monta compara mirando; si una pieza aparece en otro lado, lo toma por error.
- Cada columna de cinco huecos es un nodo. Planifica con una tabla columna por columna (qué red es y qué fila usa cada pata) antes de escribir datos.
- Un hueco, una pata.
- **Cables siempre rectos**: un solo tramo horizontal o vertical. Las esquinas las hacen las columnas de la protoboard. El verificador rechaza curvas y diagonales.
- **¿Una o dos protoboards?** Si el circuito no cabe con holgura, usa `tableros:2`. Divide por bloques, une GND y la alimentación entre las dos y pasa pocas señales.
- **Placas de desarrollo**: tapan las columnas que ocupan, así que solo quedan libres las filas de fuera. Saca cada señal por un hueco libre de la columna del pin y llévala con un cable recto hasta una zona libre.
- **LEDs** con su resistencia en serie, calculada. **Electrolíticos** con el hueco del + dicho en el texto. **Cerámicos** con su código (`104`).
- Código de colores constante: rojo para alimentación, negro (o verde) para tierra, otros colores para señal, y el mismo color para la misma función.

### 4. Escribe la página

1. Escribe los datos (CONFIG, PARTS y STEPS) en un archivo `datos_<circuito>.js`, siguiendo `references/formato.md`. Solo datos literales, porque el verificador los evalúa aparte. Pon en `CONFIG.tituloCorto` un nombre corto para la pestaña.
2. Arma la página junto a los archivos del usuario: `node scripts/construir.cjs datos_<circuito>.js montaje_<circuito>.html`. El motor no se toca. Para cambios pequeños, edita directamente el bloque entre `// DATOS-INICIO` y `// DATOS-FIN` del HTML.
3. Si el usuario tiene montajes hechos con una versión anterior de la skill, actualízalos con `node scripts/construir.cjs --actualizar montaje.html`: conservan sus datos y reciben el motor nuevo.
4. Cada paso lleva:
   - un **título** con la acción;
   - un **cuerpo** con los huecos exactos en `<code>` y la orientación («cara plana hacia ti», «franja hacia la columna 9», «+ en 8j», «USB hacia la derecha»);
   - cuando ayuda, un **pinout** (`pin`);
   - una nota **«Cómo funciona»** (`why`) con el porqué eléctrico y el cálculo, si lo hay.

   Si el usuario lo prepara para una evaluación o un curso, usa la notación de su documento y, si quiere, `notaTitulo:'Para la sustentación'`. Si hay un microcontrolador, incluye en un paso (`extra`) el programa mínimo que hace funcionar el montaje.
5. Cada pieza y cada cable lleva `info`: una o dos frases con qué es y qué hace en este circuito. Aparece en la ficha al tocar la pieza.
6. Si el circuito tiene estados que se puedan ver (LEDs que encienden, entradas, un motor, un oscilador, pines de un microcontrolador), añade el paso final de **prueba** (`test:true` y `CONFIG.prueba`). En ella:
   - se mueven los cables interruptor;
   - se resaltan las piezas que conducen;
   - se encienden los LEDs (`luces`);
   - se anima el camino de la corriente, con el botón «⚡ Corriente».

   Usa valores simulados (con el simulador que tenga el usuario) o calculados, y di de dónde salen. No inventes lecturas.

### 5. Verifica (obligatorio)

```bash
node scripts/verificar_protoboard.cjs montaje.html redes.json
```

Comprueba:

- que no haya huecos repetidos;
- que los cables sean rectos;
- que cada conexión a un riel caiga en un hueco que existe;
- que la separación entre filas de cada placa coincida con la real (`separacion`);
- la coherencia de los nombres de red;
- que la protoboard tenga exactamente las mismas conexiones que el esquema.

Corrige hasta que diga `OK`. Los pines del esquema sin pieza física (fuente, generador de señal, motor fuera de la protoboard, Arduino Uno) se declaran en `CONFIG.externos` con el hueco donde se conectan. Los avisos de patas que el esquema no tiene (por ejemplo, la tercera pata de un potenciómetro usado como resistencia variable) se aceptan si son intencionales; explícalos en el informe. No entregues una página que no haya pasado la verificación.

### 6. Revisa una vez y entrega

Sirve la carpeta con `python3 -m http.server 8765 --bind 127.0.0.1`, porque los navegadores automatizados suelen bloquear `file://`. Toma **una** captura del último paso con «Mostrar todas las etiquetas» activado. Busca cuerpos solapados, cables que pasan sobre la pata de otra pieza y etiquetas ilegibles. Corrige lo que veas y apaga el servidor. Después:

- si hay herramienta Artifact, publica la página (es privada por defecto) y da el enlace;
- si no, da la ruta del archivo: se abre con doble clic en cualquier navegador.

### 7. Informa

En pocas líneas:

- de dónde salieron las conexiones (y la tabla de redes, si las leíste de una imagen);
- de dónde salió el pinout de cada placa;
- el resultado de la verificación (pega la línea `OK`);
- los supuestos: pinouts, valores que faltaban, piezas agregadas o sustituidas;
- qué debe comprobar quien monte: orientación de semiconductores y condensadores, versión de la placa, rieles partidos y límite de corriente de la fuente.

## Archivos

- `assets/plantilla.html`: motor de dibujo y animación. El bloque `NUCLEO` (geometría y patas) lo usa también el verificador.
- `scripts/construir.cjs`: arma una página a partir de un archivo de datos, o actualiza el motor de páginas ya hechas (`--actualizar`).
- `assets/ejemplo_*.html` (con su `.redes.json`): ejemplos verificados.
- `scripts/verificar_protoboard.cjs`: verificación de huecos, cables y conexiones.
- `scripts/netlist_a_json.py`: de KiCad a `redes.json` (opcional, necesita `kicad-cli`).
- `scripts/comprobar_herramientas.sh`: comprueba los requisitos.
- `references/formato.md`: campos de CONFIG, PARTS y STEPS.
- `references/disposicion.md`: reglas de disposición y geometría.
- `references/pinouts.md`: pinouts físicos comunes, LEDs, códigos de condensadores y numeración de KiCad.
- `references/microcontroladores.md`: investigación obligatoria de placas, vistas realista y de bloque, y datos verificados de Nano, Pico, ESP32, NodeMCU, D1 mini, ATmega328P y ATtiny85.
