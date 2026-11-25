# Formato de datos de la plantilla

El bloque entre `// DATOS-INICIO` y `// DATOS-FIN` define tres constantes: `CONFIG`, `PARTS` y `STEPS`. Debe contener solo literales, sin funciones del motor, porque `verificar_protoboard.cjs` lo evalúa aparte.

Hay tres ejemplos completos y verificados en `assets/`:

- `ejemplo_puente_h.html`: potencia, drivers, entradas y prueba de giro;
- `ejemplo_leds.html`: LEDs, resistencias limitadoras y un interruptor;
- `ejemplo_555_dos_protoboards.html`: un circuito repartido en dos protoboards, con DIP y condensadores.

## Contenido

- Huecos y puntos
- CONFIG
- PARTS: campos comunes, tipos y cables
- Ficha al tocar una pieza
- STEPS
- Prueba interactiva

## Huecos y puntos

- Hueco de la zona central: `[columna, fila]` o `[columna, fila, protoboard]`. Las filas `'a'…'e'` son la mitad superior y `'f'…'j'` la inferior. La protoboard se omite cuando es la 1. Ejemplos: `[4,'c']`, `[16,'e',2]`.
- Riel: `[columna, 'T-' | 'T+' | 'B-' | 'B+', protoboard?]`. T = superior y B = inferior. `T-` es la fila exterior de arriba y `T+` la interior; `B-` es la interior de abajo y `B+` la exterior.
- Puntos fuera de la protoboard (solo en cables):
  - `{sal: c}`: salida superior sobre la columna c, para cables hacia una carga externa. `{sal: c, y: 27}` llega a la altura de la línea entre etiquetas.
  - `{fuente: 'T+', tab?: 2}`: borne de la fuente dibujada a la izquierda, a la altura de ese riel.

Los rieles no tienen hueco en las columnas c con `(c - huecoRiel0) % 6 == 0`, como los grupos de cinco huecos de una protoboard real. El verificador da error si conectas un riel en una columna sin hueco. Aprovéchalo: un cable que pasa por encima de los rieles debe hacerlo por una columna **sin** hueco, para que no parezca conectado a ellos.

Con dos protoboards, los textos muestran los huecos como `P2·16e`.

## CONFIG

```js
const CONFIG={
  titulo:'Puente H en protoboard',
  kicker:'Práctica 5 · Taller IV · punto 4',   // texto pequeño sobre el título
  sub:'Montaje paso a paso del …',             // subtítulo (admite HTML)
  columnas:40,           // columnas dibujadas: 30 si es media protoboard; hasta 63 en una de 830 puntos
  huecoRiel0:4,          // ajusta los huecos del riel (ver arriba)
  tableros:1,            // 1 o 2 protoboards; la 2 se dibuja debajo de la 1
  rieles:{'T-':'sin usar','T+':'+6 V','B-':'GND','B+':'+5 V'},   // con 2 protoboards: [ {…P1}, {…P2} ]
  fuente:{paso:12, lcd:[['CH1 6.00V','lím 1.00A'],['CH2 5.00V','lím 0.10A']],
          bornes:[{riel:'T+',txt:'CH1 +',color:'red'},{riel:'B-',txt:'COM −',color:'black'}]},   // o null; borne con tab:2 para la protoboard 2
  salidas:{paso:11, items:[{c:4,txt:'MOTOR · MA'},{c:34,txt:'MOTOR · MB'}], centro:'motor DC entre los bornes'}, // o null
  entradas:{paso:10, items:[{c:7,txt:'A'},{c:31,txt:'B'}]},  // o null; van debajo de la última protoboard
  leyenda:[['red','Rojo: alimentación'],['black','Negro: tierra'],[['blue','violet'],'Azul y violeta: …']],
  externos:{'VM:1':[1,'T+'],'VM:2':[1,'B-'],'M1:1':[4,'a']},   // pines del esquema sin pieza física
  prueba:{…},            // o null; ver «Prueba interactiva»
};
```

- `fuente.paso`: a partir de ese paso las pantallas de la fuente se encienden. Los cables de la fuente son piezas `wire` con un extremo `{fuente:'T+'}`.
- Colores de cable: `red`, `black`, `green`, `yellow`, `orange`, `blue`, `violet`, `white`, `gray`, `brown`, o cualquier `#rrggbb`.

## PARTS

### Campos comunes

| Campo | Uso |
|---|---|
| `id` | Único. Lo usan la prueba (`activos`, `luces`, `sw`) y los mensajes del verificador. |
| `step` | Paso (empieza en 1) en que aparece la pieza. |
| `type` | Uno de los tipos de abajo. |
| `ref`, `val` | Referencia y valor del esquema (`'Q1'`, `'BD139'`). Las piezas con `ref` llevan etiqueta. |
| `info` | Una o dos frases con qué es la pieza y qué hace en este circuito (admite HTML). Aparece en la ficha al tocarla. Escríbelo para todas las piezas y todos los cables. |
| `nets` | Nombre de red de cada pata, en el orden de las patas. Lo usan el verificador y la columna «Unida a» de la ficha. |
| `tab` | Protoboard de las piezas que se ubican con `c`/`r` (transistores, potenciómetro, DIP); 1 por defecto. Las piezas de dos patas llevan la protoboard en cada hueco. |
| `z` | Capa: 1 cables (por defecto), 2 componentes, 3 encima de todo. |

### Transistores y reguladores de tres patas en fila: `to92`, `to126`, `to220`, `pot`

```js
{id:'Q1',step:2,type:'to126',c:4,r:'c',face:1,pins:['E','C','B'],ref:'Q1',val:'BD140',nets:['+6V','MA','B_Q1'],info:'…'}
```

- `c` es la columna de la **pata central**; las patas quedan en `c-1`, `c` y `c+1`, en la fila `r`.
- `pins` va **de izquierda a derecha tal como quedan en la protoboard**, ya con la orientación aplicada. Dar vuelta al componente invierte el orden.
- `to126` y `to220`: `face:1` pone la cara impresa hacia el estudiante (hacia la fila j); `face:-1` lo pone de espaldas.
- `to92`: `flat:1` pone la cara plana hacia el estudiante; `flat:-1` la pone hacia la canaleta.
- `pot`: `pins:['1','2','3']`, donde 2 es el cursor.
- `kpins` (opcional): números de pin del símbolo para cada pata, si `redes.json` no trae claves por letra.

### Resistencias: `res`

```js
{id:'R1',step:6,type:'res',a:[5,'d'],b:[11,'d'],ref:'R1',ohm:'51 Ω 1 W',w:1,bands:['green','brown','black','gold'],nets:['B_Q1','C_Q5']}
```

- `w`: potencia en W (`0.25` por defecto, `0.5`, `1` o `2`); cambia el tamaño.
- `bands`: 4 o 5 colores (`black`, `brown`, `red`, `orange`, `yellow`, `green`, `blue`, `violet`, `gray`, `white`, `gold`, `silver`). Calcúlalas bien: el estudiante las usa para reconocer la pieza.
- Ponlas en una sola fila (horizontal) o en una sola columna. Lo más legible es horizontal.

### LED: `led`

```js
{id:'D1',step:4,type:'led',an:[9,'h'],ka:[10,'h'],ref:'D1',val:'LED rojo',color:'red',d:5,vf:'1,9 V',i:'9,4 mA',nets:{an:'A1',ka:'GND'},info:'…'}
```

- Se dibuja visto desde arriba. El **lado plano** del borde queda en el cátodo. Dentro se ven el yunque grande (cátodo) y el poste pequeño (ánodo).
- `color`: `red`, `green`, `yellow`, `orange`, `blue`, `white`, `violet` o `#rrggbb`.
- `d`: diámetro, 5 mm (por defecto) o 3 mm.
- `vf` e `i`: tensión directa y corriente de trabajo, como texto. Se muestran en la ficha.
- En la prueba, `luces` enciende el LED con brillo.
- Lo normal es poner las patas en columnas contiguas, en la misma fila.

### Condensadores: `cap` (sin polaridad) y `elec` (electrolítico)

```js
{id:'C2',step:6,type:'cap',a:[13,'b'],b:[16,'b'],ref:'C2',code:'103',estilo:'ceramico',nets:['CV','GND']}
{id:'C1',step:6,type:'elec',pos:[15,'i'],neg:[17,'i'],ref:'C1',val:'10 µF',v:'25 V',r:12,nets:{pos:'TRIG',neg:'GND'}}
```

- `cap.estilo`:
  - `'ceramico'` (por defecto): disco naranja con el código impreso;
  - `'poliester'`: caja azul con el texto de `code` o `val`;
  - `'mlcc'`: gota pequeña.
- `cap.code`: código de tres cifras (`'104'`). La ficha y la tabla lo traducen (104 = 100 nF).
- `elec`: visto desde arriba, con la funda, la franja negativa con marcas «−» y la tapa de aluminio con su ranura. `v` es el voltaje nominal; `r` es el radio en px (12 por defecto; 8–10 para valores pequeños, 14–16 para los grandes).

### Diodo: `diode`

`an`, `ka` y `nets:{an,ka}`. La franja se dibuja del lado `ka`.

### Circuito integrado DIP: `dip`

```js
{id:'U1',step:2,type:'dip',c:10,n:8,ref:'U1',val:'NE555',nets:['GND','TRIG','OUT','RST','CV','THR','DIS','VCC']}
```

Va a horcajadas sobre la canaleta. La pata 1 queda en `[c,'f']`; las patas 1…n/2 van por la fila f de izquierda a derecha y las n/2+1…n vuelven por la fila e de derecha a izquierda. La muesca queda a la izquierda. `nets` lista las patas en orden 1…n.

### Cables: `wire` (siempre rectos)

```js
{id:'jMA',step:4,type:'wire',pts:[[4,'e'],[4,'f']],color:'yellow',net:'MA'}
{id:'wOUT',step:7,type:'wire',pts:[[12,'j'],[12,'a',2]],color:'orange',net:'OUT'}   // de la protoboard 1 a la 2
{id:'inA',step:10,type:'wire',pts:[[7,'j'],[7,'B-']],color:'white',net:'IN_A',sw:'A'}
```

- **Cada cable es un solo tramo recto, horizontal o vertical**: `pts` tiene exactamente dos puntos en la misma fila o la misma columna. El verificador rechaza las curvas, las diagonales y los cables con codos. Cuando hace falta una esquina, usa dos cables que lleguen a huecos distintos de **la misma columna** (la columna los une por debajo) o pon el componente para que la conexión quede alineada.
- `sw`: cable interruptor. Su segundo punto es la posición de reposo y la prueba lo mueve (`sw` del estado). Todas sus posiciones deben ser rectas desde el primer punto. No cuenta como conexión fija en la verificación.

## Ficha al tocar una pieza

Al tocar una pieza o un cable (o con Tab y Enter) se resaltan sus huecos y se abre una ficha. Muestra:

- referencia, valor y tipo;
- el texto de `info`;
- los datos del LED o del condensador;
- una tabla con cada pata, su hueco, su nodo y las piezas unidas a ese nodo (salen de `nets`);
- el paso en que se monta, con un botón «Ir al paso».

Se cierra con ×, con Esc o tocando la protoboard.

## STEPS

```js
{t:'Transistores de potencia del lado A',
 body:'Inserta Q1 (BD140) en la fila c… <code>3c</code>…',   // HTML
 pin:[['to126',['E','C','B'],false,'Cara impresa hacia ti','BD140']],  // opcional
 extra:'<p class="note">…</p>',     // HTML opcional, va después de la tabla
 why:'Q1 (PNP) une MA con +V…',     // nota «Para la sustentación»
 test:true}                         // solo en el paso de prueba
```

- `pin` son figuras de pinout con la forma `[tipo, orden, deEspaldas, leyenda, rotulo]`. Tipos:
  - `to92`, `to126`, `to220`;
  - `diode`;
  - `['led', color]`;
  - `['elec', 'texto impreso']`;
  - `['cap', '104']`;
  - `['dip', n]`.
- La tabla de conexiones del paso se genera sola con las piezas de ese paso.
- El primer paso suele ser «Orienta la protoboard», sin piezas: notación de huecos y uso de cada riel.

## Prueba interactiva

```js
prueba:{
  lecturas:[['V(MA)','ma'],['I motor','im']],         // fichas de lectura: [rótulo, clave]
  chips:['Q1','Q2','Q3','Q4'],                         // indicadores ON/off
  estados:[
    {id:'off',boton:'Ambas a GND',lecturas:{ma:'—',im:'0 mA'},encendidos:[],activos:[],texto:'…'},
    {id:'A',boton:'A → +5 V',sw:{inA:[7,'B+']},lecturas:{ma:'5,91 V',im:'388 mA'},
     encendidos:['Q1','Q4'],activos:['Q1','Q4','R1','inA'],luces:['D1'],
     flujo:[[[3,'T+'],[3,'a'],[3,'c'],[4,'c'],[4,'a'],{sal:4,y:27},{sal:34,y:27},[34,'a']]],
     salida:'corriente MA → MB', texto:'…'},
  ],
  nota:'De dónde salen los valores…',   // HTML
  alerta:'<b>Nunca …</b>'}              // HTML; estados prohibidos o peligrosos
```

- El primer estado es el de reposo y se aplica al entrar al paso. En los pasos de montaje solo se usa para dejar los interruptores en su sitio, sin resaltar nada.
- `sw` mueve cables interruptor por `id`; `activos` resalta piezas; `luces` enciende LEDs.
- `flujo` son líneas animadas del camino de la corriente; puede haber varias, y pueden pasar de una protoboard a otra. Su recorrido no tiene que ser recto, porque no es un cable.
- Si algún estado tiene `flujo`, la tarjeta muestra el botón **«⚡ Corriente»**, que muestra u oculta la animación de la corriente. Empieza activado.
