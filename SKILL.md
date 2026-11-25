---
name: protoboard-paso-a-paso
description: Convierte un esquemático (KiCad .kicad_sch, PDF, imagen, foto de un dibujo o netlist SPICE) en una animación HTML paso a paso de cómo montarlo en protoboard, con huecos exactos (p. ej. «4c»), orientación de cada transistor, código de colores de cables, notas para la sustentación y una prueba interactiva final; luego verifica con un script que cada conexión de la protoboard coincide con las redes del esquema. Úsala siempre que alguien pida montar, armar, cablear o pasar un circuito a la protoboard (breadboard), una guía o animación de montaje, «cómo lo pongo en la protoboard», revisar si un montaje coincide con el esquema, o prepare una práctica de laboratorio de electrónica a partir de un diagrama, aunque no diga «animación».
---

# Protoboard paso a paso

Convierte un esquema en una página HTML que anima el montaje pieza por pieza sobre una protoboard dibujada a escala. Cada paso indica en qué huecos va cada pata. El valor de la página está en que sea **correcta**: un estudiante la seguirá literalmente, así que una pata en el hueco equivocado es peor que no tener animación. Por eso el flujo termina siempre con una verificación automática de redes.

Todo el dibujo y la animación ya están resueltos en `assets/plantilla.html`. Tu trabajo es entender el circuito, decidir la disposición y escribir solo los **datos** (CONFIG, PARTS, STEPS). `assets/ejemplo_puente_h.html` es un ejemplo completo y verificado: un puente H con transistores de potencia, drivers, entradas y prueba de giro. Míralo antes de escribir el primero.

## Requisitos

Ejecuta `bash scripts/comprobar_herramientas.sh` al empezar: dice qué está instalado y qué falta.

| Herramienta | Para qué | ¿Obligatoria? |
|---|---|---|
| Node.js ≥ 18 | `scripts/verificar_protoboard.cjs` (verificación de redes) | Sí |
| Python 3 | `scripts/netlist_a_json.py` y servidor local para revisar la página | Sí |
| Navegador web moderno | Ver la animación (el HTML funciona con doble clic) | Sí |
| KiCad 7/8 con `kicad-cli` | Esquemas `.kicad_sch` y simulación con ngspice | Si la entrada es KiCad |
| poppler-utils (`pdftoppm`, `pdftotext`) | Recortar y leer figuras de un PDF | Si la entrada es PDF |
| Playwright (MCP) u otro navegador automatizable | Una captura de revisión antes de entregar | Opcional |
| Herramienta Artifact (claude.ai) | Publicar la página con un enlace | Opcional |

Con conexión a internet la página usa las fuentes IBM Plex de Google Fonts; sin conexión usa las del sistema y funciona igual.

## Flujo

### 1. Saca las redes del esquema

El objetivo es un `redes.json` con la forma `{"REF:pin": "nombre_de_red"}`. Ese archivo es la fuente de verdad con la que se compara la protoboard.

- **KiCad**: `python3 scripts/netlist_a_json.py esquema.kicad_sch redes.json`. Genera dos claves por pin cuando el símbolo tiene nombre de pin: el número (`Q1:1`) y la letra (`Q1:E`).
- **PDF**: lee el texto con `pdftotext -layout`, para valores y notas. Recorta la figura a 250–300 ppp con `pdftoppm -r 260 -f N -l N -x X -y Y -W W -H H -png` y mírala. Sigue cada cable de punta a punta. Un punto relleno es unión; un cruce sin punto no lo es.
- **Netlist SPICE** (`.cir`, `.net`): cada línea es un elemento con sus nodos en orden fijo. `Q` va con colector, base y emisor; `D` con ánodo y cátodo; `R` y `C` con nodo 1 y nodo 2; `X` sigue el orden de su `.subckt`. Pásalo a claves por letra (`Q1:C`, `Q1:B`, `Q1:E`).
- **Imagen o foto**: mírala directamente. Si un trazo es ambiguo, pregunta antes de suponer.
- Escribe el JSON a mano con claves por letra (`Q1:E`, `D1:A`, `D1:K`, `C1:+`, `C1:-`, `U1:3`, `R1:1`/`R1:2`) y nombres de red que se entiendan (`MA`, `B_Q1`, `GND`, `+6V`).

Si hay **más de una fuente** (por ejemplo, un KiCad hecho antes y el PDF del profesor), compáralas antes de montar nada y avisa de las diferencias. El documento del curso manda sobre lo que se haya dibujado después. Montar sobre la fuente equivocada obliga a rehacerlo todo.

### 2. Lista de materiales y pinouts físicos

Para cada semiconductor, anota el encapsulado y el orden **físico** de patas. La numeración del símbolo del esquema no siempre coincide con el orden de las patas. Consulta `references/pinouts.md`. Si no conoces con seguridad el pinout de una referencia, dilo en el paso correspondiente y pide confirmarlo con la hoja de datos o con el multímetro en prueba de diodo. No lo inventes.

### 3. Diseña la disposición

Lee `references/disposicion.md` antes de colocar nada: geometría, tamaños de cuerpo, cómo evitar solapes y cruces, rieles, cables interruptor y orden de los pasos. Las ideas clave:

- **Que la protoboard se parezca al esquema**: el mismo orden izquierda/derecha y arriba/abajo, y las entradas del mismo lado. El estudiante tiene que poder señalar una pieza en el esquema y encontrarla en la protoboard. Si la disposición se aparta del dibujo, la percibirá como un error aunque eléctricamente sea idéntica.
- Cada columna de cinco huecos es un nodo. Planifica con una tabla columna por columna (qué red es y qué fila usa cada pata) antes de escribir datos.
- Un hueco, una pata. Los cables largos van por filas distintas para no cruzarse.
- Código de colores constante: rojo para alimentación, negro (o verde) para tierra, otros colores para señal, y el mismo color para la misma función.

### 4. Escribe la página

1. Copia `assets/plantilla.html` al destino, junto a los archivos del usuario, con un nombre descriptivo (`montaje_<circuito>.html`).
2. Cambia `__TITULO__` en `<title>` por un nombre corto. No hace falta tocar el motor.
3. Rellena el bloque entre `// DATOS-INICIO` y `// DATOS-FIN` con CONFIG, PARTS y STEPS. El formato completo de cada pieza y cada paso está en `references/formato.md`. El bloque debe contener solo datos literales, porque el verificador lo evalúa por separado.
4. Cada paso necesita:
   - un **título** con la acción;
   - un **cuerpo** con los huecos exactos en `<code>` y la orientación («cara impresa hacia ti», «franja hacia la columna 9»);
   - cuando ayuda, un **pinout** (`pin`);
   - una nota **«Para la sustentación»** (`why`) con el porqué eléctrico y, si existen, los cálculos del documento del curso con su notación.
5. Si el circuito tiene entradas o estados (puente H, compuertas, semáforo), añade el paso final de **prueba** (`test:true` y `CONFIG.prueba`). Ahí se mueven los cables interruptor, se resaltan las piezas que conducen y se anima el camino de la corriente. Usa valores calculados o simulados y di de dónde salen. No inventes lecturas.

### 5. Verifica (obligatorio)

```bash
node scripts/verificar_protoboard.cjs montaje.html redes.json
```

Comprueba:

- que no haya huecos repetidos;
- que cada conexión a un riel caiga en un hueco que existe;
- la coherencia interna de los nombres de red;
- que la partición de redes de la protoboard sea igual a la del esquema.

Corrige hasta que diga `OK`. Los pines del esquema que no son piezas físicas (fuentes, generadores, el motor fuera de la protoboard) se declaran en `CONFIG.externos` con el hueco donde se conectan. No entregues una página que no haya pasado la verificación. Si no hay `redes.json` (por ejemplo, un dibujo a mano sin netlist), ejecuta al menos la verificación interna, sin el segundo argumento, y dilo en el informe.

### 6. Revisa una vez y entrega

`file://` suele estar bloqueado para los navegadores automatizados. Sirve la carpeta con `python3 -m http.server 8765 --bind 127.0.0.1` y toma **una** captura del último paso con «Mostrar todas las etiquetas» activado. Busca cuerpos solapados, cables que pasan sobre la pata de otra pieza y etiquetas ilegibles. Corrige lo que veas y apaga el servidor. Después:

- si hay herramienta Artifact, publica la página (es privada por defecto) y da el enlace;
- si no, da la ruta del archivo: se abre con doble clic.

### 7. Informa

En pocas líneas:

- de dónde salieron las redes;
- qué verificaste y con qué resultado (pega la línea del verificador);
- qué supuestos hiciste (pinouts, valores no fijados, piezas sustituidas);
- qué debe comprobar el estudiante físicamente: orientación de semiconductores, rieles partidos, límite de corriente de la fuente.

## Archivos

- `assets/plantilla.html`: motor de dibujo y animación. Copiar y rellenar.
- `assets/ejemplo_puente_h.html`: ejemplo completo y verificado.
- `scripts/verificar_protoboard.cjs`: verificación de huecos y redes.
- `scripts/netlist_a_json.py`: de KiCad a `redes.json`.
- `scripts/comprobar_herramientas.sh`: comprueba los requisitos.
- `references/formato.md`: campos de CONFIG, PARTS y STEPS.
- `references/disposicion.md`: reglas de disposición y geometría.
- `references/pinouts.md`: pinouts físicos comunes y numeración de KiCad.
