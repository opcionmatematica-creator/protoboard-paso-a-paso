# Microcontroladores y placas de desarrollo

## Contenido

- Cómo investigar una placa
- Cómo se monta una placa en la protoboard
- Filas según la separación entre pines
- Placas comunes (datos `dibujo` listos para copiar)
- Microcontroladores en DIP
- Placas que no van en la protoboard

## Cómo investigar una placa

Antes de dibujar una placa que no está en este archivo, o si el usuario no dice qué versión tiene, busca en la web:

1. **El pinout oficial visto desde arriba**, con la cara de los componentes hacia ti. Busca primero en la documentación del fabricante (docs.arduino.cc, Espressif, datasheet de Raspberry Pi) y, si no hay, en el diagrama más citado de la placa. Anota la fuente para el informe.
2. **Cuántos pines tiene cada lado** y su orden, desde el extremo del USB hacia el otro.
3. **La separación entre las dos filas de pines**, en décimas de pulgada: 0,6" = 15,24 mm, 0,7" = 17,78 mm, 0,9" = 22,86 mm, 1,0" = 25,4 mm. Sale de las medidas del datasheet o del dibujo mecánico.
4. **El lado del USB** y, si la tiene, dónde está la antena.
5. **Si hay versiones distintas** con el mismo nombre (por ejemplo, ESP32 de 30 o de 38 pines, NodeMCU Amica o LoLin). Si no sabes cuál tiene el usuario, pregúntale o dilo en el paso.

Con eso escribe `dibujo` tal como se ve en el diagrama, con el USB arriba o abajo, sin rotarlo a mano. El motor lo gira solo según `usbLado`.

## Cómo se monta una placa en la protoboard

```js
{id:'U1',step:2,type:'modulo',ref:'U1',val:'Arduino Nano',chip:'ATmega328P',color:'#1d5fa8',
 c:12, filas:['c','g'], separacion:6, usbLado:'der',
 dibujo:{usb:'arriba', izq:['D13','3V3',…], der:['D12','D11',…]},
 conex:{'D2':'D2','D3':'D3','GND':'GND'}, info:'…'}
```

- `dibujo.usb` indica dónde está el USB en el diagrama de referencia (`'arriba'` o `'abajo'`). `izq` y `der` son los pines de cada lado, **de arriba hacia abajo**, tal como aparecen en ese diagrama.
- `usbLado`: hacia dónde queda el USB en la protoboard (`'izq'` o `'der'`). Elige el lado que deje cerca de los otros componentes los pines que vas a usar, y deja el USB hacia el borde de la protoboard para poder conectar el cable.
- `c`: columna del primer pin (el de la izquierda). La placa ocupa `n` columnas, donde n = pines por lado.
- `filas`: fila de los pines de arriba y fila de los de abajo. `separacion` es la distancia real entre filas en décimas de pulgada; el verificador comprueba que las filas elegidas la respeten.
- `conex`: solo los pines que se usan, con su red. Los pines con el mismo nombre (dos GND, dos RST) se toman como unidos, porque lo están dentro de la placa.
- `chip`, `color` y `antena:true` son decorativos.
- En el esquema (`redes.json`), los pines se escriben por su nombre: `U1:D2`, `U1:GND`.

La placa tapa sus columnas entre las dos filas de pines. Solo quedan libres los huecos de fuera. Cada señal sale por un hueco libre de la columna de su pin (por ejemplo, la fila h para un pin de la fila g) y se lleva con un cable recto hasta la zona de los demás componentes.

## Filas según la separación entre pines

En la protoboard, la distancia de a a e es 0,4" y de e a f hay 0,3", por la canaleta. Posiciones en décimas de pulgada: a 0, b 1, c 2, d 3, e 4, f 7, g 8, h 9, i 10, j 11.

| Separación | Filas posibles | Huecos libres por columna |
|---|---|---|
| 0,3" (DIP) | e, f | 4 arriba, 4 abajo |
| 0,6" | c, g (o d, h) | 2 arriba, 3 abajo |
| 0,7" | c, h (o b, g) | 2 arriba, 2 abajo |
| 0,9" | b, i (o a, h) | 1 arriba, 1 abajo |
| 1,0" | a, i (o b, j) | 0 y 1 |

Las placas de 0,9" o más (ESP32 DevKit, NodeMCU) dejan muy pocos huecos libres. En la vida real se resuelve con dos protoboards juntas o quitando un riel. En la animación, deja al menos un hueco libre de cada lado para los pines que uses, o pon la placa fuera de la protoboard (ver al final).

## Placas comunes

Diagramas con la cara de componentes hacia arriba. Confirma siempre la versión del usuario.

**Arduino Nano** (ATmega328P; también Nano Every): 15 pines por lado, separación 0,6" (`separacion:6`). Fuente: docs.arduino.cc.

```js
dibujo:{usb:'arriba',
 izq:['D13','3V3','REF','A0','A1','A2','A3','A4','A5','A6','A7','5V','RST','GND','VIN'],
 der:['D12','D11','D10','D9','D8','D7','D6','D5','D4','D3','D2','GND','RST','RX0','TX1']}
```

**Raspberry Pi Pico / Pico W** (RP2040): 20 pines por lado, separación 0,7" (`separacion:7`). Fuente: datasheet de Raspberry Pi.

```js
dibujo:{usb:'arriba',
 izq:['GP0','GP1','GND','GP2','GP3','GP4','GP5','GND','GP6','GP7','GP8','GP9','GND','GP10','GP11','GP12','GP13','GND','GP14','GP15'],
 der:['VBUS','VSYS','GND','3V3_EN','3V3','ADC_VREF','GP28','AGND','GP27','GP26','RUN','GP22','GND','GP21','GP20','GP19','GP18','GND','GP17','GP16']}
```

**ESP32 DevKit V1 (DOIT, 30 pines)**: 15 pines por lado. La separación suele ser 0,9", pero hay versiones de 1,0": mídela. La antena queda en el extremo opuesto al USB (`antena:true`). Hay versiones de 38 pines con otro orden: confirma cuál es.

```js
dibujo:{usb:'abajo',
 izq:['EN','VP','VN','D34','D35','D32','D33','D25','D26','D27','D14','D12','D13','GND','VIN'],
 der:['D23','D22','TX0','RX0','D21','D19','D18','D5','TX2','RX2','D4','D2','D15','GND','3V3']}
```

**NodeMCU ESP8266 v2 (Amica)**: 15 pines por lado y separación 0,9". La v3 LoLin mide 1,1" y no cabe en una protoboard. Antena en el extremo opuesto al USB.

```js
dibujo:{usb:'abajo',
 izq:['A0','RSV','RSV','SD3','SD2','SD1','CMD','SD0','CLK','GND','3V3','EN','RST','GND','VIN'],
 der:['D0','D1','D2','D3','D4','3V3','GND','D5','D6','D7','D8','RX','TX','GND','3V3']}
```

**Wemos D1 mini (ESP8266)**: 8 pines por lado; mide la separación (suele ser 0,9"). Antena en el extremo opuesto al USB.

```js
dibujo:{usb:'abajo',
 izq:['RST','A0','D0','D5','D6','D7','D8','3V3'],
 der:['TX','RX','D1','D2','D3','D4','GND','5V']}
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

Explica en el paso que la muesca o el punto marcan la pata 1, y que un integrado al revés puede dañarse al alimentarlo.

## Placas que no van en la protoboard

Las placas Arduino Uno y Mega, Raspberry Pi 3/4/5 y otras con conectores hembra no entran en la protoboard. Represéntalas fuera de ella:

- `CONFIG.salidas` con una etiqueta por pin usado (por ejemplo `{c:5,txt:'UNO · D9'}`, `{c:9,txt:'UNO · GND'}`);
- un cable recto desde `{sal:c}` hasta el hueco de la protoboard;
- en `CONFIG.externos`, los pines de la placa que aparecen en el esquema (`'UNO:D9':[5,'a']`).

En el texto del paso explica que el cable va del conector de la placa al hueco indicado. Siempre debe haber un cable de GND entre la placa y el circuito.

Programa: si el montaje necesita un programa para funcionar, ponlo en el `extra` de un paso dentro de `<pre><code>…</code></pre>`, corto y comentado, con los mismos pines que el montaje.
