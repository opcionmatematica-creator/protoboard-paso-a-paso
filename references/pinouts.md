# Pinouts físicos frecuentes

Orden de las patas **de izquierda a derecha, con las patas hacia abajo y la cara indicada mirando hacia ti**. Los fabricantes a veces cambian el pinout de una misma referencia según el encapsulado o la marca. Si un montaje depende de esto, pide confirmarlo con la hoja de datos o con el multímetro.

## TO-92 (cara plana hacia ti)

| Referencia | Patas |
|---|---|
| 2N3904, 2N3906, 2N2222A (PN2222A), 2N4401, 2N4403 | E B C |
| BC547, BC548, BC549, BC557, BC558 | C B E |
| 2N7000 (MOSFET N) | S G D |
| BS170 (MOSFET N) | D G S |
| 78L05 / 78Lxx (regulador) | OUT GND IN |
| LM35 (sensor de temperatura) | +Vs Vout GND |

## TO-126 (cara impresa hacia ti, placa metálica detrás)

| Referencia | Patas |
|---|---|
| BD135–BD140 (BD139 NPN, BD140 PNP) | E C B |
| 2SD882 (D882), 2SB772 (B772) | E C B |
| 2SA715 (A715) | Normalmente E C B. Verifícalo. |

## TO-220 (cara impresa hacia ti, aleta metálica arriba)

| Referencia | Patas |
|---|---|
| TIP31/32, TIP41/42, TIP120/122/125/127, TIP29/30 | B C E (la aleta es el colector) |
| IRF540N, IRFZ44N, IRF520, IRF9540 | G D S (la aleta es el drenador) |
| LM7805 / 78xx | IN GND OUT |
| LM7905 / 79xx | GND IN OUT (¡distinto de los 78xx!) |
| LM317 | ADJ OUT IN |
| LM337 | ADJ IN OUT |

## Componentes de dos patas

- **Diodo**: la franja marca el cátodo (K).
- **LED**: la pata larga es el ánodo (A); el lado plano de la cápsula y la pata corta son el cátodo (K).
- **Electrolítico**: la franja con signos «−» marca el negativo; la pata larga es la positiva.
- **Cerámico, poliéster, resistencia**: sin polaridad.

## Circuitos integrados DIP (muesca a la izquierda, pata 1 abajo a la izquierda)

Las patas se cuentan en sentido antihorario: 1…n/2 por la fila de abajo (f) de izquierda a derecha y n/2+1…n por la de arriba (e) de derecha a izquierda.

| Referencia | Patas |
|---|---|
| NE555 | 1 GND · 2 TRIG · 3 OUT · 4 RESET · 5 CV · 6 THR · 7 DIS · 8 VCC |
| LM741 | 1 OFFSET N1 · 2 IN− · 3 IN+ · 4 V− · 5 OFFSET N2 · 6 OUT · 7 V+ · 8 NC |
| LM358, TL072, TL082 | 1 OUT A · 2 IN− A · 3 IN+ A · 4 V− · 5 IN+ B · 6 IN− B · 7 OUT B · 8 V+ |
| LM324, TL074 | 1 OUT A · 2 IN− A · 3 IN+ A · 4 V+ · 5 IN+ B · 6 IN− B · 7 OUT B · 8 OUT C · 9 IN− C · 10 IN+ C · 11 V− · 12 IN+ D · 13 IN− D · 14 OUT D |
| 74xx00 / 74HC00 (4 NAND) | 1 1A · 2 1B · 3 1Y · 4 2A · 5 2B · 6 2Y · 7 GND · 8 3Y · 9 3A · 10 3B · 11 4Y · 12 4A · 13 4B · 14 VCC |
| L293D | 1 EN1,2 · 2 1A · 3 1Y · 4,5 GND · 6 2Y · 7 2A · 8 VCC2 (motor) · 9 EN3,4 · 10 3A · 11 3Y · 12,13 GND · 14 4Y · 15 4A · 16 VCC1 (lógica) |
| PC817 (optoacoplador) | 1 ánodo · 2 cátodo · 3 emisor · 4 colector |

## Numeración de los símbolos de KiCad

`netlist_a_json.py` da cada pin por número y por nombre. Estos son los números más usados, por si hace falta `kpins`:

| Símbolo | Número → función |
|---|---|
| Transistor_BJT:2N3904 / 2N3906 / BC547 | 1 E · 2 B · 3 C |
| Transistor_BJT:BD139 / BD140 | 1 E · 2 C · 3 B |
| Transistor_BJT:TIP31 / TIP120 | 1 B · 2 C · 3 E |
| Device:D, Device:LED | 1 K · 2 A |
| Device:C_Polarized (CP) | 1 + · 2 − |
| Device:R, Device:C | 1 y 2 (sin orden) |

## Identificar las patas de un BJT con el multímetro (prueba de diodo)

1. Busca la pata que conduce hacia las otras dos (unos 0,6–0,7 V): esa es la **base**.
2. Si conduce con la punta roja en la base, es **NPN**; si conduce con la negra en la base, es **PNP**.
3. La unión base-emisor marca unos milivoltios más que la base-colector. La pata con la lectura más alta es el **emisor**.
