# Formato de datos de la plantilla

El bloque entre `// DATOS-INICIO` y `// DATOS-FIN` define tres constantes: `CONFIG`, `PARTS` y `STEPS`. Debe contener solo literales (sin funciones del motor), porque `verificar_protoboard.cjs` lo evalúa aparte. El ejemplo completo está en `assets/ejemplo_puente_h.html`.

## Contenido

- Huecos y puntos
- CONFIG
- PARTS: campos comunes y tipos
- STEPS
- Prueba interactiva

## Huecos y puntos

- Hueco de la zona central: `[columna, fila]`, con filas `'a'…'e'` (mitad superior) y `'f'…'j'` (mitad inferior). Ejemplo: `[4,'c']`.
- Riel: `[columna, 'T-' | 'T+' | 'B-' | 'B+']`. T = superior, B = inferior. `T-` es la fila exterior de arriba y `T+` la interior; `B-` es la interior de abajo y `B+` la exterior.
- Punto fuera de la protoboard (solo en cables):
  - `{sal: c}` es la salida superior encima de la columna c, donde terminan los cables que van a una carga externa. `{sal: c, y: 27}` sube hasta la altura de la línea que une las etiquetas.
  - `{fuente: 'T+'}` es el borne de la fuente dibujada a la izquierda, a la altura de ese riel.
  - `{x, y}` son coordenadas SVG directas; úsalas solo si no queda otro remedio.

Los rieles no tienen hueco en las columnas c con `(c - huecoRiel0) % 6 == 0`. Esto imita los grupos de cinco huecos de una protoboard real. El verificador da error si conectas un riel en una columna sin hueco.

## CONFIG

```js
const CONFIG={
  titulo:'Puente H en protoboard',
  kicker:'Práctica 5 · Taller IV · punto 4',   // texto pequeño sobre el título
  sub:'Montaje paso a paso del …',             // subtítulo (admite HTML)
  columnas:40,           // columnas dibujadas: 30 si es media protoboard; hasta 63 en una de 830 puntos
  huecoRiel0:4,          // ajusta los huecos del riel (ver arriba)
  rieles:{'T-':'sin usar','T+':'+6 V','B-':'GND','B+':'+5 V'},
  fuente:{paso:12, lcd:[['CH1 6.00V','lím 1.00A'],['CH2 5.00V','lím 0.10A']],
          bornes:[{riel:'T+',txt:'CH1 +',color:'red'},{riel:'B-',txt:'COM −',color:'black'}]},   // o null
  salidas:{paso:11, items:[{c:4,txt:'MOTOR · MA'},{c:34,txt:'MOTOR · MB'}], centro:'motor DC entre los bornes'}, // o null
  entradas:{paso:10, items:[{c:7,txt:'A'},{c:31,txt:'B'}]},                                       // o null
  leyenda:[['red','Rojo: alimentación'],['black','Negro: tierra'],[['blue','violet'],'Azul y violeta: …']],
  externos:{'VM:1':[1,'T+'],'VM:2':[1,'B-'],'M1:1':[4,'a']},   // pines del esquema sin pieza física
  prueba:{…},            // o null; ver «Prueba interactiva»
};
```

- `fuente.paso`: a partir de ese paso las pantallas de la fuente se encienden. Los cables de la fuente son piezas `wire` con un extremo `{fuente:'T+'}`.
- `salidas` y `entradas`: etiquetas fijas arriba (cargas externas) y abajo (entradas), que aparecen desde `paso`.
- Colores disponibles: `red`, `black`, `green`, `yellow`, `orange`, `blue`, `violet`, `white`, `gray`, `brown`, o cualquier `#rrggbb`.

## PARTS

### Campos comunes

| Campo | Uso |
|---|---|
| `id` | Único. Lo usan la prueba (`activos`, `sw`) y los mensajes del verificador. |
| `step` | Paso (empieza en 1) en que aparece la pieza. |
| `type` | Uno de los tipos de abajo. |
| `ref`, `val` | Referencia y valor del esquema (`'Q1'`, `'BD139'`). Las piezas con `ref` llevan etiqueta. |
| `nets` | Nombre de red de cada pata, en el mismo orden que las patas. El verificador lo usa. |
| `z` | Capa: 1 cables (predeterminado), 2 componentes, 3 encima de todo (cables largos que deben verse sobre los componentes). |

### Tipos

**Transistores y reguladores de tres patas en fila**: `to92`, `to126`, `to220`, `pot`.

```js
{id:'Q1',step:2,type:'to126',c:4,r:'c',face:1,pins:['E','C','B'],ref:'Q1',val:'BD140',nets:['+6V','MA','B_Q1']}
```

- `c` es la columna de la **pata central**; las patas van en `c-1`, `c` y `c+1`, en la fila `r`.
- `pins` lista las patas **de izquierda a derecha tal como quedan en la protoboard**, ya teniendo en cuenta la orientación.
- Orientación de `to126` y `to220`: `face:1` pone la cara impresa hacia el estudiante (hacia la fila j) y la placa metálica hacia arriba; `face:-1` lo pone de espaldas. Dar vuelta al componente invierte el orden de `pins`.
- Orientación de `to92`: `flat:1` pone la cara plana hacia el estudiante; `flat:-1` la pone hacia la canaleta.
- `pot`: potenciómetro o trimmer con `pins:['1','2','3']` (2 = cursor).
- `kpins` (opcional) da los números de pin del símbolo para cada pata, por ejemplo `['1','3','2']`. Solo hace falta si `redes.json` no tiene claves por letra.

**Resistencias**: `res`.

```js
{id:'R1',step:6,type:'res',a:[5,'d'],b:[11,'d'],ref:'R1',ohm:'51 Ω 1 W',w:1,bands:['green','brown','black','gold'],nets:['B_Q1','C_Q5']}
```

- `w`: potencia en W (`0.25` predeterminado, `0.5`, `1`, `2`). Cambia el tamaño dibujado.
- `bands`: 4 o 5 colores (`black`, `brown`, `red`, `orange`, `yellow`, `green`, `blue`, `violet`, `gray`, `white`, `gold`, `silver`). Calcúlalas bien: el estudiante las usará para reconocer la pieza.
- Puede ir en diagonal o vertical (`a` y `b` en filas distintas), pero lo más legible es horizontal en una fila.

**Condensador no polarizado**: `cap`, con `a`, `b`, `code` (`'104'`) y `nets:[n1,n2]`.

**Electrolítico**: `elec`, con `pos`, `neg`, `r` (radio en px, 11 por defecto) y `nets:{pos,neg}`.

**Diodo y LED**: `diode` y `led`, con `an`, `ka` y `nets:{an,ka}`. En `led` el campo `color` es el color de la cápsula. La franja del diodo se dibuja del lado `ka`.

**Circuito integrado DIP**: `dip`.

```js
{id:'U1',step:2,type:'dip',c:12,n:8,ref:'U1',val:'NE555',nets:['GND','TRIG','OUT','RST','CV','THR','DIS','VCC']}
```

Va a horcajadas sobre la canaleta. La pata 1 queda en `[c,'f']`, las patas 1…n/2 van por la fila f de izquierda a derecha y las patas n/2+1…n vuelven por la fila e de derecha a izquierda. La muesca queda a la izquierda. `nets` lista las patas en orden 1…n.

**Cable**: `wire`.

```js
{id:'jMA',step:4,type:'wire',pts:[[4,'e'],[4,'f']],color:'yellow',net:'MA'}
{id:'wX',step:9,type:'wire',curve:{from:[25,'f'],to:[11,'d'],c1:[24,258],c2:[14,244]},color:'blue',net:'C_Q5',z:3}
{id:'inA',step:10,type:'wire',pts:[[7,'j'],[7,'B-']],color:'white',net:'IN_A',sw:'A'}
```

- `pts`: polilínea. Solo los extremos que son huecos conectan; los puntos intermedios solo dan forma.
- `curve`: Bézier cúbica. `c1` y `c2` son `[columna, y en px]`.
- `sw`: cable interruptor. Su segundo punto es la posición de reposo y la prueba lo mueve. No cuenta como conexión fija en la verificación.

## STEPS

```js
{t:'Transistores de potencia del lado A',
 body:'Inserta Q1 (BD140) en la fila c… <code>3c</code>…',   // HTML
 pin:[['to126',['E','C','B'],false,'Cara impresa hacia ti','BD140']],  // opcional
 extra:'<p class="note">…</p>',     // HTML opcional, va después de la tabla
 why:'Q1 (PNP) une MA con +V…',     // nota «Para la sustentación»
 test:true}                         // solo en el paso de prueba
```

- `pin`: figuras de pinout con la forma `[tipo, orden, deEspaldas, leyenda, rotulo]`. Tipos: `to92`, `to126`, `to220`, `diode`, `led`, `elec`, `['dip', n]`.
- La tabla de conexiones del paso se genera sola con las piezas de ese paso.
- El primer paso suele ser «Orienta la protoboard», sin piezas: explica la notación de huecos y el uso de cada riel. Mientras está activo, la plantilla resalta los rieles.

## Prueba interactiva

```js
prueba:{
  lecturas:[['V(MA)','ma'],['I motor','im']],         // fichas de lectura: [rótulo, clave]
  chips:['Q1','Q2','Q3','Q4'],                         // indicadores ON/off
  estados:[
    {id:'off',boton:'Ambas a GND',lecturas:{ma:'—',im:'0 mA'},encendidos:[],activos:[],texto:'…'},
    {id:'A',boton:'A → +5 V',sw:{inA:[7,'B+']},lecturas:{ma:'5,91 V',im:'388 mA'},
     encendidos:['Q1','Q4'],activos:['Q1','Q4','R1','inA'],
     flujo:[[[3,'T+'],[3,'a'],[3,'c'],[4,'c'],[4,'a'],{sal:4,y:27},{sal:34,y:27},[34,'a']]],
     salida:'corriente MA → MB', texto:'…'},
  ],
  nota:'De dónde salen los valores…',   // HTML
  alerta:'<b>Nunca …</b>'}              // HTML; estados prohibidos o peligrosos
```

- El primer estado es el de reposo y se aplica al entrar al paso.
- `sw` mueve cables interruptor por `id`. `activos` resalta piezas y `flujo` dibuja líneas animadas por los puntos dados; puede haber varias.
- `salida` cambia el texto entre las etiquetas de `salidas`.
