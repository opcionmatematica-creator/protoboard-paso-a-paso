# Reglas de disposición

Lo que sigue salió de montar y verificar circuitos reales con esta plantilla. Cada regla tiene un motivo; si una situación no encaja, guíate por el motivo.

## Geometría de la plantilla

- Paso entre huecos: 18 px (equivale a 0,1"). Columna c → x = 134 + 18·(c−1).
- Filas (y en px): T− 108, T+ 126, a 162, b 180, c 198, d 216, e 234, canaleta, f 288, g 306, h 324, i 342, j 360, B− 396, B+ 414. Entre e y f hay 54 px (tres pasos).
- Tamaños dibujados (ancho × grosor, centrados en su posición):

| Pieza | Tamaño | Separación mínima entre patas |
|---|---|---|
| TO-126 | 54 × 20 (cubre ±1,5 columnas, ±10 px) | patas en columnas contiguas |
| TO-220 | 58 × 17 | contiguas |
| TO-92 | 41 de ancho; lado plano a 9 px de la línea de patas, lado curvo a 14 px | contiguas |
| Resistencia ¼ W | 43 × 14 | 4 columnas (0,4") |
| Resistencia ½ W | 60 × 17 | 5 columnas |
| Resistencia 1 W | 72 × 20 | 6 columnas |
| Diodo 1N400x | 36 × 13 | 4–5 columnas |
| Cerámico | 22 × 14 | 2–3 columnas |

- Dos cuerpos en filas vecinas (18 px) se tocan si la suma de sus medios grosores pasa de 18. Una resistencia de 1 W (±10) junto a un TO-126 (±10) en la fila de al lado se solapa, salvo que no coincidan en horizontal. Compruébalo para cada par de vecinos.

## Principios

1. **La protoboard tiene que parecerse al esquema.** Respeta el orden izquierda/derecha, pon la alimentación arriba y la tierra abajo como en el dibujo, y deja las entradas del mismo lado. El estudiante y el profesor comparan ambas cosas mirando; si una pieza aparece del otro lado, lo toman por error aunque sea eléctricamente igual.
2. **Una columna es un nodo.** Los cinco huecos a–e de una columna están unidos, y lo mismo pasa con f–j. Antes de escribir datos, haz una tabla: columna → red → qué fila usa cada pata. Así se ven enseguida los conflictos.
3. **Un hueco, una pata.** El verificador lo comprueba, pero planifica para no depender de él.
4. **Componentes de potencia en filas centrales.** Transistores en la fila c (arriba) y h (abajo). Así quedan libres a y b, d y e, f y g, i y j para cables y resistencias, y los cuerpos no se tocan.
5. **Puentes cortos para cruzar la canaleta** en la misma columna (`4e–4f`). Así un nodo existe en las dos mitades.
6. **Columnas auxiliares para la alimentación.** Si varias piezas van a un riel, conecta una columna libre al riel con un puente y lleva las piezas a esa columna. Una pata directo al riel también vale si cabe sin tocar a las vecinas.
7. **Espejo para la simetría.** En un circuito simétrico (puente H, par diferencial) monta el lado derecho girado («de espaldas») para que las bases miren al centro. Indícalo explícitamente en el texto del paso, y en `pins` pon el orden invertido.

## Cables

- Rojo para alimentación, negro (o verde) para tierra, y otros colores para señal. El mismo color para la misma función en todo el montaje (por ejemplo, amarillo para las salidas). Muchas rúbricas de laboratorio califican este código.
- **Cómo evitar cruces:** dos cables largos que recorren el mismo tramo horizontal no se cruzan si van por **filas distintas** y ninguno termina dentro del tramo del otro en su misma fila. Las columnas de la protoboard hacen el resto, porque llevan la conexión por debajo. Ejemplo verificado: `13i→33i` y `25g→5g` se solapan en x pero no se tocan.
- Un cable no debe pasar justo encima del hueco donde termina otra pieza en la misma fila. Se ve como si conectara.
- Si un cable sale de la protoboard por encima de los rieles (hacia una carga externa), hazlo salir por una columna **sin hueco** en el riel (ver `huecoRiel0`). Así no parece enchufado al riel.
- **Todos los cables son rectos**: un solo tramo horizontal (misma fila) o vertical (misma columna). Nada de curvas, diagonales ni codos; el verificador los rechaza. Así se ve un montaje limpio, con cables cortados a medida y pegados a la protoboard.
- Las **esquinas las hace la protoboard**. Si dos puntos no están en la misma fila ni en la misma columna, lleva un cable horizontal hasta una columna y sigue desde **otro hueco de esa misma columna** con otro cable, o con la pata de un componente. Ejemplo: de `25f` a `11d` no se va en diagonal: `25f–25e` cruza la canaleta y `25d–11d` recorre la fila.
- Mejor todavía: planifica las columnas para que las conexiones queden alineadas desde el principio. El colector del transistor de mando en la misma columna que el extremo de su resistencia se une con un puente vertical corto.
- Los cables verticales que cruzan los rieles (de la fila a al riel exterior, o de una protoboard a otra) pasan por encima de los rieles de en medio. Si el cable no debe conectarse a ellos, elige una columna sin hueco en el riel.

## LEDs

- Un LED **siempre** va con una resistencia en serie: R = (V<sub>fuente</sub> − V<sub>F</sub>) / I. Usa I ≈ 10 mA para indicadores, y calcula y escribe el valor en `info`.
- Patas en columnas contiguas de la misma fila: ánodo (pata larga) del lado de la resistencia o del positivo, y cátodo (lado plano) hacia GND o hacia el transistor que lo controla.
- El cuerpo de 5 mm mide unos 32 px: ocupa media fila arriba y abajo de su fila. No pongas otros cuerpos en las filas vecinas sobre esas columnas. Usa `d:3` si hay poco espacio.
- En la prueba, enciende el LED con `luces` en los estados en que conduce y da su corriente en `lecturas`.
- Escribe en el paso cómo se identifica la polaridad: pata larga, lado plano y, dentro de la cápsula, el yunque grande es el cátodo.

## Condensadores

- Electrolíticos: la franja «−» hacia GND o hacia el nodo más negativo. Dilo en el texto del paso con el hueco exacto del positivo. Al revés se calientan y pueden reventar.
- Cerámicos: escribe el código impreso en `code` (`104`). La animación lo traduce y así el estudiante lo encuentra entre sus piezas.
- Los condensadores de desacople (100 nF) van lo más cerca posible de las patas de alimentación del integrado.

## Dos protoboards

Usa `tableros:2` cuando el circuito no cabe en una protoboard con buena separación. Señales para decidirlo: más de unas 45 columnas ocupadas en la de 400 puntos (o de 60 en la de 830), filas tan llenas que los cuerpos se tocan, o bloques que conviene separar (potencia y lógica, alta corriente y señal).

- **Divide por bloques funcionales** para que pasen pocos cables entre protoboards: la alimentación y una o dos señales.
- **Une siempre los rieles**: GND común y la alimentación que se necesite, con cables verticales rectos de la protoboard 1 a la 2. Sin GND común, la segunda protoboard no tiene referencia.
- La fuente se conecta a la protoboard 1. Los rieles de arriba y de abajo de una misma protoboard tampoco están unidos entre sí: si se usan los dos, únelos.
- Las señales entre protoboards bajan por una columna sin hueco en los rieles, para no parecer conectadas a ellos.
- En el primer paso explica qué va en cada protoboard. En los textos escribe los huecos como `P2·16e`.
- Ejemplo verificado: `assets/ejemplo_555_dos_protoboards.html`.

## Entradas, salidas y fuente

- **Entradas digitales como cable interruptor** (`sw`): un cable desde la columna de entrada hasta el riel de GND (apagada) o el de +V (activa), que esté a una fila de distancia. Nunca dejes la entrada al aire: sin resistencia de pull-down la base queda flotando.
- Para que el cable interruptor pueda bajar al riel sin cruzar nada, su columna debe tener libres las filas que quedan por debajo de la pieza que llega a ella.
- **Cargas externas** (motor, altavoz, relé grande): dibuja solo sus dos cables de salida con `CONFIG.salidas`; la carga no se dibuja. Declara sus pines en `CONFIG.externos`.
- **Fuente**: los cables van de `{fuente:'T+'}` al hueco del riel en la columna 1. Explica en el paso el voltaje, el límite de corriente y que se conecta con la fuente apagada. Si hay dos canales, une sus negativos (COM).

## Orden de los pasos

1. Orientar la protoboard (rieles y notación).
2. Piezas grandes o de referencia: circuitos integrados y transistores de potencia, porque fijan las columnas de todo lo demás.
3. Puentes que crean los nodos principales (salidas, cruces de canaleta).
4. Puentes a los rieles.
5. Componentes pasivos, agrupados por función (protección, polarización, limitación).
6. Transistores de mando o piezas pequeñas.
7. Cables de señal: primero los cortos, luego los largos.
8. Entradas, siempre en estado apagado.
9. Salidas a la carga externa.
10. Fuente: ajuste, límite de corriente y revisión antes de encender.
11. Prueba interactiva.

Entre dos y seis piezas por paso funciona bien. Más de eso hace difícil seguir la animación.

## Textos

- Escribe la orientación en palabras que se vean en la pieza: «cara impresa hacia ti», «placa metálica hacia la canaleta», «franja hacia la columna 9», «pata larga en 20h».
- Escribe los huecos siempre en `<code>`, como columna + fila.
- En «Para la sustentación» explica la función de la pieza y el cálculo con la notación del curso (IB1, VB5…). Sirve para la evaluación oral.
- Advierte los estados prohibidos (cortocircuitos) en el paso de prueba, con la corriente que circularía.
