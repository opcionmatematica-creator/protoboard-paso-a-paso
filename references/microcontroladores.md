# Microcontroladores y placas de desarrollo

## Contenido

- Dos vistas: realista y bloque
- Investigación obligatoria antes de dibujar una placa
- Cómo se describe una placa (`modulo`)
- Filas según la separación entre pines
- Placas comunes (datos verificados para copiar)
- Microcontroladores en DIP
- Placas que no van en la protoboard

## Dos vistas: realista y bloque

Cada placa se puede ver de dos formas, y la página trae un botón («▣ Placa») para cambiar entre ellas:

- **Realista** (`vista:'realista'`, por defecto): la placa vista desde arriba, con el color de su PCB, el conector USB del tipo real y sus componentes en su sitio (chip o módulo RF, antena, botones, LEDs, cristal, regulador, conectores), dibujados según `aspecto`. Sirve para reconocer la placa y orientarla bien.
- **Bloque** (`vista:'bloque'`): un rectángulo limpio con **todos** los pines, coloreados por función: alimentación, tierra, digital, analógico, comunicación, control y otros. Muestra todas las formas en que la placa puede interactuar con su entorno. Sirve para planear y explicar las conexiones.

En ambas vistas, la ficha (al tocar la placa) trae la lista completa de pines agrupada por función, con sus funciones alternativas (`funciones`), los pines usados marcados y la fuente de la investigación. La vista inicial de todas las placas se fija con `CONFIG.vistaPlacas`.

## Investigación obligatoria antes de dibujar una placa

No dibujes una placa de memoria. Antes de escribir su `modulo`, investígala en internet (WebSearch, WebFetch o lo que haya en la sesión), aunque esté en este archivo, si el usuario menciona otra versión. Busca, en este orden de confianza:

1. Documentación del fabricante: docs.arduino.cc, docs.espressif.com, datasheets.raspberrypi.com, la wiki de Wemos/LOLIN, la de Seeed…
2. El dibujo mecánico o el datasheet de la placa: medidas en mm, separación entre filas de pines, posición del USB y de los agujeros.
3. Fotos de la cara de arriba y diagramas de pinout muy citados (por ejemplo, los de mischianti.org o randomnerdtutorials.com), para ubicar componentes que el fabricante no acota.

Extrae y anota:

| Dato | Para qué campo |
|---|---|
| Pines por lado y su orden visto desde arriba, con el USB arriba o abajo | `dibujo` |
| Separación entre filas de pines (mm ÷ 2,54 = décimas de pulgada) | `separacion`, `filas` |
| Largo y ancho de la placa en mm, y cuánto sobresale de los pines por cada extremo | `extension` (en pasos de 2,54 mm) |
| Tipo de conector USB: micro, mini, C | `usb` |
| Color del PCB | `color` |
| Posición de chip o módulo, antena, botones (RESET, BOOT, BOOTSEL), LEDs, cristal, regulador, conectores (ICSP, SWD) | `aspecto` |
| Funciones alternativas de los pines (PWM, I²C, SPI, UART, ADC, interrupciones, pines solo de entrada, pines que afectan el arranque) | `funciones` |
| Fuentes consultadas | `fuente` (se muestra en la ficha) |

Si las fuentes no coinciden, como pasa con el ESP32 DevKit, del que hay versiones con filas a 0,9", 1,0" y 1,1", dilo en el paso y en el informe, y pide al usuario que mida su placa. Lo que no hayas podido confirmar (por ejemplo, la posición exacta de un LED) dibújalo como aproximado y dilo en `fuente`.

## Cómo se describe una placa (`modulo`)

```js
{id:'U1',step:2,type:'modulo',ref:'U1',val:'Arduino Nano',chip:'ATmega328P',color:'#1d5fa8',
 c:12, filas:['c','g'], separacion:6, usbLado:'der', usb:'mini', extension:{usb:.9,opuesto:.9},
 dibujo:{usb:'arriba', izq:['D13','3V3',…], der:['D12','D11',…]},
 aspecto:[{tipo:'chip',x:.3,y:.42,w:.4,h:.16,texto:'ATmega328P',tam:5}, …],
 funciones:{D3:'PWM · INT1', A4:'SDA', …},
 fuente:'docs.arduino.cc: …',
 conex:{'D2':'D2','GND':'GND'}, info:'…'}
```

- `dibujo`: el pinout tal como se ve en el diagrama de referencia, desde arriba. `usb` dice si el USB está arriba o abajo en ese diagrama; `izq` y `der` son los pines de cada lado, **de arriba hacia abajo**. No lo rotes a mano: el motor gira la placa según `usbLado`.
- `usbLado`: hacia dónde queda el USB en la protoboard (`'izq'` o `'der'`). Déjalo hacia el borde, con los pines que vas a usar cerca de los demás componentes.
- `c`: columna del primer pin, el de la izquierda. `filas` y `separacion`: ver la tabla de abajo. El verificador comprueba que coincidan.
- `extension`: cuánto sobresale la placa más allá del primer y del último pin, en pasos de 2,54 mm, por el extremo del USB y por el opuesto. Se calcula así: (largo de la placa − (pines por lado − 1) × 2,54 mm) / 2 − 1,6 mm, en cada extremo, y se reparte según la investigación. Por ejemplo, la antena del ESP32 alarga el extremo opuesto.
- `aspecto`: lista de componentes de la cara de arriba. `x` e `y` son fracciones (0 a 1) del ancho y del largo de la placa **en el mismo diagrama de referencia** (x de izquierda a derecha, y de arriba hacia abajo, contando toda la placa); `w` y `h` son el tamaño en fracciones. Tipos:
  - `chip`: integrado negro con patas; `texto`, `tam`;
  - `modulo_rf`: módulo metálico (ESP-WROOM-32, ESP-12);
  - `antena`: antena de pista, en zigzag dorado;
  - `boton`: pulsador; `texto` es su rótulo (RESET, BOOT);
  - `led`: LED SMD; `color` y `texto`;
  - `cristal`;
  - `regulador`: con su aleta;
  - `conector`: pines de un conector (ICSP, SWD); `filas`, `cols`, `texto`;
  - `texto`: serigrafía; `color`.
- `funciones`: texto corto por pin con sus funciones alternativas y advertencias («solo entrada», «afecta el arranque»).
- `categorias` (opcional): fuerza la categoría de un pin si la deducida de su nombre no sirve. Valores: `alimentacion`, `tierra`, `digital`, `analogico`, `comunicacion`, `control`, `otro`.
- `conex`: solo los pines usados, con su red. Los pines con el mismo nombre (dos GND) se toman como unidos, porque lo están dentro de la placa.
- En `redes.json`, los pines se escriben por nombre: `U1:D2`, `U1:GND`.

La placa tapa sus columnas entre las dos filas de pines. Cada señal sale por un hueco libre de la columna de su pin y viaja con un cable recto hasta los demás componentes.

## Filas según la separación entre pines

Posiciones de las filas en décimas de pulgada: a 0, b 1, c 2, d 3, e 4, f 7, g 8, h 9, i 10, j 11 (la canaleta mide 0,3").

| Separación | Filas posibles | Huecos libres por columna |
|---|---|---|
| 0,3" (DIP) | e, f | 4 arriba, 4 abajo |
| 0,6" | c, g (o d, h) | 2 arriba, 3 abajo |
| 0,7" | c, h (o b, g) | 2 arriba, 2 abajo |
| 0,9" | b, i (o a, h) | 1 arriba, 1 abajo |
| 1,0" | a, i (o b, j) | 0 y 1 |

Con placas de 0,9" o más casi no quedan huecos libres. En la vida real se usan dos protoboards juntas o se quita un riel. En la animación, deja al menos un hueco libre de cada lado para los pines que uses, o pon la placa fuera de la protoboard (ver al final).

## Placas comunes

Datos revisados en noviembre de 2026. Las posiciones de `aspecto` son aproximadas, sacadas de fotos y dibujos oficiales. Si el usuario tiene otra versión o un clon, vuelve a investigar.

### Arduino Nano (ATmega328P)

17,76 × 43,16 mm, 15 pines por lado, separación 0,6". El mini-USB y el ICSP de 2×3 van en la cara de arriba; el regulador y el chip USB-serie, abajo. Fuente: [guía de diseño del Nano](https://docs.arduino.cc/learn/hardware/nano-pcb-guide/) y [pinout oficial](https://content.arduino.cc/assets/Pinout-NANO_latest.pdf). Ejemplo completo: `assets/ejemplo_arduino_nano.html`.

```js
val:'Arduino Nano',chip:'ATmega328P',color:'#1d5fa8',separacion:6,usb:'mini',extension:{usb:.9,opuesto:.9},
dibujo:{usb:'arriba',
 izq:['D13','3V3','REF','A0','A1','A2','A3','A4','A5','A6','A7','5V','RST','GND','VIN'],
 der:['D12','D11','D10','D9','D8','D7','D6','D5','D4','D3','D2','GND','RST','RX0','TX1']},
aspecto:[{tipo:'boton',x:.38,y:.24,w:.24,h:.1,texto:'RESET'},
 {tipo:'chip',x:.3,y:.42,w:.4,h:.16,texto:'ATmega328P',tam:5},
 {tipo:'led',x:.24,y:.68,w:.08,h:.03,color:'#ffb31a',texto:'L'},{tipo:'led',x:.38,y:.68,w:.08,h:.03,color:'#3ddc5a',texto:'PWR'},
 {tipo:'led',x:.52,y:.68,w:.08,h:.03,color:'#ff3b3b',texto:'TX'},{tipo:'led',x:.66,y:.68,w:.08,h:.03,color:'#ff3b3b',texto:'RX'},
 {tipo:'conector',x:.3,y:.8,w:.4,h:.12,filas:3,cols:2,texto:'ICSP'}],
funciones:{D2:'INT0',D3:'PWM · INT1',D5:'PWM',D6:'PWM',D9:'PWM',D10:'PWM · SS',D11:'PWM · MOSI',D12:'MISO',D13:'SCK · LED L',
 A4:'SDA',A5:'SCL',A6:'solo entrada analógica',A7:'solo entrada analógica',RX0:'D0 · serie',TX1:'D1 · serie',VIN:'entrada 7–12 V'}
```

### Raspberry Pi Pico / Pico 2 (RP2040 / RP2350)

21 × 51 mm, 20 pines por lado, separación 0,7". Micro-USB en un extremo; el LED de usuario (GP25) está junto al USB, con el botón BOOTSEL al lado. Los tres pines de depuración (SWD) van en el extremo opuesto. El Pico 2 tiene la misma disposición. Fuente: [documentación de Raspberry Pi](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html) y [datasheet del Pico](https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf).

```js
val:'Raspberry Pi Pico',chip:'RP2040',color:'#2e7d32',separacion:7,usb:'micro',extension:{usb:.2,opuesto:.1},
dibujo:{usb:'arriba',
 izq:['GP0','GP1','GND','GP2','GP3','GP4','GP5','GND','GP6','GP7','GP8','GP9','GND','GP10','GP11','GP12','GP13','GND','GP14','GP15'],
 der:['VBUS','VSYS','GND','3V3_EN','3V3','ADC_VREF','GP28','AGND','GP27','GP26','RUN','GP22','GND','GP21','GP20','GP19','GP18','GND','GP17','GP16']},
aspecto:[{tipo:'led',x:.3,y:.08,w:.1,h:.03,color:'#3ddc5a',texto:'LED'},
 {tipo:'boton',x:.56,y:.12,w:.22,h:.1,texto:'BOOTSEL'},
 {tipo:'chip',x:.17,y:.17,w:.24,h:.1,texto:'FLASH',tam:4.5},
 {tipo:'chip',x:.3,y:.42,w:.4,h:.16,texto:'RP2040',tam:5.5},
 {tipo:'cristal',x:.62,y:.34,w:.14,h:.05,texto:'12M',tam:4},
 {tipo:'conector',x:.36,y:.93,w:.28,h:.04,filas:1,cols:3,texto:'SWD'}],
funciones:{GP0:'UART0 TX · I2C0 SDA · SPI0 RX',GP1:'UART0 RX · I2C0 SCL · SPI0 CS',GP4:'I2C0 SDA',GP5:'I2C0 SCL',GP26:'ADC0',GP27:'ADC1',GP28:'ADC2',
 VBUS:'5 V del USB',VSYS:'entrada 1,8–5,5 V','3V3':'salida 3,3 V (hasta ~300 mA)','3V3_EN':'apaga el regulador si va a GND',RUN:'reinicio (activo en bajo)'}
```

### ESP32 DevKit V1 (DOIT, 30 pines)

Aproximadamente 28 × 51,5 mm, 15 pines por lado. **La separación varía entre clones: 0,9", 1,0" o 1,1"**; pide al usuario que la mida. La de 1,0" es la más común en las placas de 28 mm de ancho. El módulo ESP-WROOM-32, con su antena de pista, va en el extremo opuesto al micro-USB. A los lados del USB están los botones EN (reinicio) y BOOT, el regulador AMS1117 y el chip USB-serie (CP2102 o CH340). En una protoboard normal deja muy pocos huecos libres. Fuente: [pinout de alta resolución, mischianti.org](https://mischianti.org/doit-esp32-dev-kit-v1-high-resolution-pinout-and-specs/), [discusión de medidas en el foro de Fritzing](https://forum.fritzing.org/t/doit-esp32-devkit-v1/6158/9) y [Tinkered](https://tinkered.ai/components/esp32-devkit-v1).

```js
val:'ESP32 DevKit V1',chip:'ESP32',color:'#1b1c20',separacion:10,usb:'micro',extension:{usb:1.6,opuesto:3.4},
dibujo:{usb:'abajo',
 izq:['EN','VP','VN','D34','D35','D32','D33','D25','D26','D27','D14','D12','D13','GND','VIN'],
 der:['D23','D22','TX0','RX0','D21','D19','D18','D5','TX2','RX2','D4','D2','D15','GND','3V3']},
aspecto:[{tipo:'antena',x:.18,y:.02,w:.64,h:.14},
 {tipo:'modulo_rf',x:.18,y:.16,w:.64,h:.4,texto:'ESP-WROOM-32',tam:5.5},
 {tipo:'chip',x:.38,y:.66,w:.24,h:.09,texto:'CP2102',tam:4.5},
 {tipo:'regulador',x:.36,y:.58,w:.28,h:.06,texto:'AMS1117',tam:4},
 {tipo:'boton',x:.12,y:.84,w:.2,h:.09,texto:'EN'},{tipo:'boton',x:.68,y:.84,w:.2,h:.09,texto:'BOOT'},
 {tipo:'led',x:.44,y:.79,w:.1,h:.025,color:'#ff3b3b',texto:'PWR'}],
funciones:{VP:'GPIO36 · solo entrada · ADC1',VN:'GPIO39 · solo entrada · ADC1',D34:'solo entrada · ADC1',D35:'solo entrada · ADC1',
 D21:'I2C SDA',D22:'I2C SCL',D23:'SPI MOSI',D19:'SPI MISO',D18:'SPI SCK',D5:'SPI CS · afecta el arranque',
 D2:'LED azul · afecta el arranque',D12:'afecta el arranque',D15:'afecta el arranque',TX0:'UART0 (USB)',RX0:'UART0 (USB)',
 EN:'reinicio',VIN:'entrada 5 V'}
```

### NodeMCU ESP8266 v2 (Amica)

Aproximadamente 26 × 48 mm, 15 pines por lado; la separación suele ser 0,9". Mídela, porque la v3 LoLin es más ancha (1,1") y no cabe. Módulo ESP-12 con antena en el extremo opuesto al micro-USB; botones RST y FLASH junto al USB.

```js
val:'NodeMCU v2',chip:'ESP8266',color:'#1b1c20',separacion:9,usb:'micro',extension:{usb:1.2,opuesto:1.8},
dibujo:{usb:'abajo',
 izq:['A0','RSV','RSV','SD3','SD2','SD1','CMD','SD0','CLK','GND','3V3','EN','RST','GND','VIN'],
 der:['D0','D1','D2','D3','D4','3V3','GND','D5','D6','D7','D8','RX','TX','GND','3V3']},
aspecto:[{tipo:'antena',x:.25,y:.02,w:.5,h:.12},{tipo:'modulo_rf',x:.22,y:.14,w:.56,h:.36,texto:'ESP-12E',tam:5.5},
 {tipo:'chip',x:.38,y:.62,w:.24,h:.09,texto:'CP2102',tam:4.5},{tipo:'boton',x:.12,y:.84,w:.2,h:.09,texto:'RST'},{tipo:'boton',x:.68,y:.84,w:.2,h:.09,texto:'FLASH'}],
funciones:{A0:'entrada analógica 0–3,3 V',D1:'I2C SCL',D2:'I2C SDA',D3:'afecta el arranque',D4:'LED · afecta el arranque',D8:'afecta el arranque',D0:'GPIO16 · despertar'}
```

### Wemos / LOLIN D1 mini (ESP8266)

34,2 × 25,6 mm, 8 pines por lado; mide la separación (suele ser 0,9"). El ESP-12 ocupa casi toda la cara de arriba, con la antena en el extremo opuesto al micro-USB, y el botón RESET va en un costado. Fuente: [ficha de LOLIN D1 mini en espboards.dev](https://www.espboards.dev/esp8266/d1-mini/).

```js
val:'D1 mini',chip:'ESP8266',color:'#1b1c20',separacion:9,usb:'micro',extension:{usb:.6,opuesto:1.6},
dibujo:{usb:'abajo',izq:['RST','A0','D0','D5','D6','D7','D8','3V3'],der:['TX','RX','D1','D2','D3','D4','GND','5V']},
aspecto:[{tipo:'antena',x:.2,y:.03,w:.6,h:.14},{tipo:'modulo_rf',x:.18,y:.18,w:.64,h:.46,texto:'ESP-12F',tam:5},{tipo:'boton',x:.04,y:.72,w:.2,h:.1,texto:'RST'}],
funciones:{D1:'I2C SCL',D2:'I2C SDA',D4:'LED · afecta el arranque',D3:'afecta el arranque',D8:'afecta el arranque',A0:'entrada analógica'}
```

## Microcontroladores en DIP

Se montan con el tipo `dip` (muesca a la izquierda, pata 1 abajo a la izquierda). Las patas se cuentan en sentido antihorario.

**ATmega328P-PU (28 patas)**, entre paréntesis el nombre en Arduino:

1 RESET · 2 PD0 (D0/RX) · 3 PD1 (D1/TX) · 4 PD2 (D2) · 5 PD3 (D3) · 6 PD4 (D4) · 7 VCC · 8 GND · 9 PB6 (XTAL1) · 10 PB7 (XTAL2) · 11 PD5 (D5) · 12 PD6 (D6) · 13 PD7 (D7) · 14 PB0 (D8) · 15 PB1 (D9) · 16 PB2 (D10) · 17 PB3 (D11/MOSI) · 18 PB4 (D12/MISO) · 19 PB5 (D13/SCK) · 20 AVCC · 21 AREF · 22 GND · 23 PC0 (A0) · 24 PC1 (A1) · 25 PC2 (A2) · 26 PC3 (A3) · 27 PC4 (A4/SDA) · 28 PC5 (A5/SCL)

El circuito mínimo necesita:

- un cristal de 16 MHz entre las patas 9 y 10 (tipo `xtal`, `code:'16.000'`);
- dos condensadores de 22 pF de cada pata del cristal a GND (`cap`, `code:'220'`);
- 10 kΩ de RESET (pata 1) a VCC;
- 100 nF entre VCC y GND, cerca de las patas 7 y 8;
- AVCC (pata 20) a VCC.

**ATtiny85 (8 patas)**: 1 PB5/RESET · 2 PB3 · 3 PB4 · 4 GND · 5 PB0 · 6 PB1 · 7 PB2 · 8 VCC.

Para cualquier otro microcontrolador en DIP (PIC, otro AVR, STM8…), investiga el pinout en su datasheet antes de montarlo. Explica en el paso que la muesca o el punto marcan la pata 1, y que un integrado al revés puede dañarse al alimentarlo.

## Placas que no van en la protoboard

Las placas Arduino Uno y Mega, Raspberry Pi 3/4/5 y otras con conectores hembra no entran en la protoboard. Represéntalas fuera de ella:

- `CONFIG.salidas` con una etiqueta por pin usado (por ejemplo `{c:5,txt:'UNO · D9'}`, `{c:9,txt:'UNO · GND'}`);
- un cable recto desde `{sal:c}` hasta el hueco de la protoboard;
- en `CONFIG.externos`, los pines de la placa que aparecen en el esquema (`'UNO:D9':[5,'a']`).

Siempre debe haber un cable de GND entre la placa y el circuito.

**Programa:** si el montaje necesita un programa, ponlo en el `extra` de un paso dentro de `<pre><code>…</code></pre>`, corto y comentado, con los mismos pines que el montaje.
