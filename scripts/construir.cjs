#!/usr/bin/env node
/*
 Arma páginas a partir de assets/plantilla.html.

   node construir.cjs datos.js salida.html            crea la página con los datos (CONFIG, PARTS, STEPS)
   node construir.cjs --actualizar montaje.html ...   pone el motor más reciente a páginas ya hechas,
                                                      conservando sus datos y su título

 datos.js contiene solo el bloque de datos: const CONFIG={…}; const PARTS=[…]; const STEPS=[…];
 El título de la pestaña sale de CONFIG.titulo (corto) o del <title> que ya tenía la página.
*/
const fs = require('fs'), path = require('path');
const PLANTILLA = path.join(__dirname, '..', 'assets', 'plantilla.html');
const tpl = fs.readFileSync(PLANTILLA, 'utf8');
const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function datosDe(html) {
  if (!html.includes('// DATOS-INICIO') || !html.includes('// DATOS-FIN')) throw new Error('no tiene los marcadores // DATOS-INICIO y // DATOS-FIN');
  const d = html.split('// DATOS-INICIO')[1].split('// DATOS-FIN')[0];
  return d.slice(d.indexOf('\n') + 1);
}
function armar(datos, titulo) {
  const { CONFIG, PARTS, STEPS } = new Function(datos + ';return {CONFIG,PARTS,STEPS};')();   // falla aquí si los datos tienen errores de sintaxis
  if (!Array.isArray(PARTS) || !Array.isArray(STEPS) || !CONFIG) throw new Error('faltan CONFIG, PARTS o STEPS');
  const t = titulo || CONFIG.tituloCorto || CONFIG.titulo || 'Montaje en protoboard';
  const a = tpl.indexOf('\n', tpl.indexOf('// DATOS-INICIO')) + 1, b = tpl.indexOf('// DATOS-FIN');
  return { html: (tpl.slice(0, a) + datos.replace(/\s*$/, '\n') + tpl.slice(b)).replace('<title>__TITULO__</title>', `<title>${esc(t)}</title>`), n: PARTS.length, pasos: STEPS.length };
}

const args = process.argv.slice(2);
if (args[0] === '--actualizar' && args.length > 1) {
  for (const f of args.slice(1)) {
    const html = fs.readFileSync(f, 'utf8');
    const titulo = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    const r = armar(datosDe(html), titulo && titulo !== '__TITULO__' ? titulo.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : null);
    fs.writeFileSync(f, r.html);
    console.log(`actualizado: ${f} (${r.n} piezas, ${r.pasos} pasos)`);
  }
} else if (args.length === 2) {
  const r = armar(fs.readFileSync(args[0], 'utf8'));
  fs.writeFileSync(args[1], r.html);
  console.log(`creado: ${args[1]} (${r.n} piezas, ${r.pasos} pasos)`);
} else {
  console.error('uso: node construir.cjs datos.js salida.html\n     node construir.cjs --actualizar montaje.html [otro.html …]');
  process.exit(2);
}
