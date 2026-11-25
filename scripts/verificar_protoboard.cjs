#!/usr/bin/env node
/*
 Verifica un montaje hecho con assets/plantilla.html.

 Uso:
   node verificar_protoboard.cjs montaje.html [redes.json]

 Sin redes.json comprueba la coherencia interna:
   - ningún hueco tiene dos patas o cables,
   - cada conexión a un riel cae en un hueco que existe,
   - todas las patas con el mismo nombre de red quedan en el mismo nodo de la protoboard
     y redes con nombres distintos quedan en nodos distintos.
 Con redes.json ({"REF:pin": "red"}, por ejemplo el de netlist_a_json.py) compara además
 la partición de redes del esquema con la de la protoboard (los nombres pueden diferir).

 Claves de pin que entiende:
   transistores/potenciómetro: REF:<letra de la pata> (E, B, C, G, D, S, 1, 2, 3...) o p.kpins[i]
   resistencias y condensadores no polarizados: REF:1 y REF:2 (sin orden: prueba ambas orientaciones)
   diodos y LED: REF:A / REF:K (o REF:2 / REF:1, numeración de KiCad)
   electrolíticos: REF:+ / REF:- (o REF:1 / REF:2)
   DIP: REF:<número de pata>
 Pines del esquema sin pieza física (fuentes, entradas) se declaran en CONFIG.externos.
 Sale con código 1 si encuentra errores.
*/
const fs = require('fs');
const [html, jsonPath] = process.argv.slice(2);
if (!html) { console.error('uso: node verificar_protoboard.cjs montaje.html [redes.json]'); process.exit(2); }
const src = fs.readFileSync(html, 'utf8');
if (!src.includes('// DATOS-INICIO') || !src.includes('// DATOS-FIN')) {
  console.error('El HTML no tiene los marcadores // DATOS-INICIO y // DATOS-FIN de la plantilla.'); process.exit(2);
}
const blk = src.split('// DATOS-INICIO')[1].split('// DATOS-FIN')[0].replace(/^[^\n]*\n/, '');
const { CONFIG, PARTS, STEPS } = new Function(blk + ';return {CONFIG,PARTS,STEPS};')();
const g0 = CONFIG.huecoRiel0 ?? 4;
const railHole = c => (((c - g0) % 6) + 6) % 6 !== 0;
const NC = CONFIG.columnas || 40;
const errs = [], avisos = [];

const isHole = h => Array.isArray(h);
const node = h => h[1].length > 1 ? 'RIEL' + h[1] : ('abcde'.includes(h[1]) ? 'T' : 'B') + h[0];
const par = {}; const f = x => { par[x] ??= x; return par[x] === x ? x : (par[x] = f(par[x])); };
const unir = (a, b) => { par[f(a)] = f(b); };
const usados = {};
function usar(h, quien) {
  if (!isHole(h)) return;
  const [c, r] = h;
  if (!(r in { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, h: 1, i: 1, j: 1, 'T-': 1, 'T+': 1, 'B-': 1, 'B+': 1 })) errs.push(`${quien}: fila desconocida ${r}`);
  if (c < 1 || c > NC) errs.push(`${quien}: columna ${c} fuera de la protoboard (1–${NC})`);
  if (r.length > 1 && !railHole(c)) errs.push(`${quien}: el riel no tiene hueco en la columna ${c} (huecoRiel0=${g0})`);
  const k = c + r;
  if (usados[k]) errs.push(`hueco ${k} usado por ${usados[k]} y ${quien}`);
  usados[k] = quien;
}
const dipHole = (p, i) => { const h = p.n / 2; return i <= h ? [p.c + i - 1, 'f'] : [p.c + (p.n - i), 'e']; };

// patas de cada pieza: {h, keys:[...], net, grupo (para piezas sin orden)}
function patas(p) {
  const L = (h, keys, net) => ({ h, keys, net, ref: p.ref });
  switch (p.type) {
    case 'to92': case 'to126': case 'to220': case 'pot':
      return p.pins.map((n, i) => L([p.c - 1 + i, p.r], [p.ref + ':' + n].concat(p.kpins ? [p.ref + ':' + p.kpins[i]] : []), p.nets[i]));
    case 'res': case 'cap': return [L(p.a, [], p.nets[0]), L(p.b, [], p.nets[1])].map(x => (x.sinOrden = true, x));
    case 'diode': case 'led': return [L(p.an, [p.ref + ':A', p.ref + ':2'], p.nets.an), L(p.ka, [p.ref + ':K', p.ref + ':1'], p.nets.ka)];
    case 'elec': return [L(p.pos, [p.ref + ':+', p.ref + ':1'], p.nets.pos), L(p.neg, [p.ref + ':-', p.ref + ':2'], p.nets.neg)];
    case 'dip': return Array.from({ length: p.n }, (_, k) => L(dipHole(p, k + 1), [p.ref + ':' + (k + 1)], p.nets[k]));
  }
  return [];
}
const todas = [];
const ids = new Set();
for (const p of PARTS) {
  if (ids.has(p.id)) errs.push(`id repetido: ${p.id}`); ids.add(p.id);
  if (!STEPS[p.step - 1]) errs.push(`${p.id}: paso ${p.step} no existe`);
  if (p.type === 'wire') {
    const e = (p.curve ? [p.curve.from, p.curve.to] : p.pts);
    e.forEach(h => usar(h, p.id));
    if (p.sw) continue;                       // interruptor: no cuenta como conexión fija
    const hs = e.filter(isHole);
    for (let k = 1; k < hs.length; k++) unir(node(hs[0]), node(hs[k]));
    if (hs.length && p.net) todas.push({ h: hs[0], keys: [], net: p.net, ref: p.id, cable: true });
    continue;
  }
  const ls = patas(p);
  if (!ls.length) { errs.push(`${p.id}: tipo desconocido ${p.type}`); continue; }
  ls.forEach(l => { usar(l.h, p.id); todas.push(l); });
  if (p.type === 'res' || p.type === 'cap') p._patas = ls;
}
// externos (pines del esquema sin pieza): 'VM:1' -> [1,'T+']
for (const [k, h] of Object.entries(CONFIG.externos || {})) todas.push({ h, keys: [k], net: null, ref: k.split(':')[0], externo: true });

// 1) coherencia interna por nombre de red
const porRed = {};
for (const l of todas) if (l.net) (porRed[l.net] ??= new Set()).add(f(node(l.h)));
for (const [n, s] of Object.entries(porRed)) if (s.size > 1) errs.push(`red ${n} partida en la protoboard: ${[...s].join(' | ')}`);
const nodoDe = {};
for (const [n, s] of Object.entries(porRed)) { const x = [...s][0]; if (nodoDe[x] && nodoDe[x] !== n) errs.push(`redes ${nodoDe[x]} y ${n} quedaron unidas (${x})`); nodoDe[x] = n; }

// 2) comparación con el esquema
let resumen = '';
if (jsonPath) {
  const exp = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const keyNodo = {};
  for (const l of todas) for (const k of l.keys) keyNodo[k] = f(node(l.h));
  const redes = {};
  for (const [k, n] of Object.entries(exp)) { if (k.startsWith('#')) continue; (redes[n] ??= []).push(k); }
  // piezas de dos patas sin orden: elegir la orientación que mejor encaje
  for (const p of PARTS) if (p._patas) {
    const [A, B] = p._patas.map(l => f(node(l.h)));
    const n1 = exp[p.ref + ':1'], n2 = exp[p.ref + ':2'];
    if (n1 === undefined || n2 === undefined) { avisos.push(`${p.ref}: no aparece en el esquema con pines 1 y 2`); continue; }
    const otros = n => (redes[n] || []).filter(k => !k.startsWith(p.ref + ':')).map(k => keyNodo[k]).filter(Boolean);
    const score = (x, y) => otros(n1).filter(v => v === x).length + otros(n2).filter(v => v === y).length;
    if (score(A, B) >= score(B, A)) { keyNodo[p.ref + ':1'] = A; keyNodo[p.ref + ':2'] = B; }
    else { keyNodo[p.ref + ':1'] = B; keyNodo[p.ref + ':2'] = A; }
  }
  const nodoRed = {}; const sinPieza = new Set();
  for (const [n, ks] of Object.entries(redes)) {
    const nodos = new Set();
    for (const k of ks) { if (keyNodo[k]) nodos.add(keyNodo[k]); else sinPieza.add(k); }
    if (nodos.size > 1) errs.push(`red del esquema "${n}" partida en la protoboard: ${[...nodos].join(' | ')}  (${ks.join(', ')})`);
    if (nodos.size) { const x = [...nodos][0]; if (nodoRed[x] && nodoRed[x] !== n) errs.push(`redes del esquema "${nodoRed[x]}" y "${n}" unidas en ${x}`); nodoRed[x] = n; }
  }
  // patas de la protoboard que el esquema no conoce
  const conocidas = new Set(Object.keys(exp));
  for (const l of todas) if (!l.cable && !l.externo && l.keys.length && !l.keys.some(k => conocidas.has(k))) avisos.push(`pata ${l.keys[0]} (${l.h.join('')}) no está en el esquema`);
  // una referencia sin ninguna pata en la protoboard (los alias número/letra de un mismo pin no cuentan)
  const refsOk = new Set(Object.keys(keyNodo).map(k => k.split(':')[0]));
  const refsSin = [...new Set([...sinPieza].map(k => k.split(':')[0]))].filter(r => !refsOk.has(r));
  if (refsSin.length) avisos.push(`componentes del esquema sin pieza en la protoboard (añádelos a CONFIG.externos si son fuentes, entradas o el motor): ${refsSin.sort().join(', ')}`);
  resumen = `${Object.keys(redes).length} redes del esquema comparadas`;
}

console.log(`${PARTS.length} piezas y cables, ${Object.keys(usados).length} huecos usados${resumen ? ', ' + resumen : ''}`);
avisos.forEach(a => console.log('AVISO: ' + a));
if (errs.length) { console.log('ERRORES:\n  ' + errs.join('\n  ')); process.exit(1); }
console.log('OK: sin huecos repetidos y todas las redes coinciden');
