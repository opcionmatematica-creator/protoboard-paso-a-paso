#!/usr/bin/env python3
"""Extrae las redes de un esquema de KiCad en el formato que usa verificar_protoboard.cjs.

Uso:
    python3 netlist_a_json.py esquema.kicad_sch [salida.json]

Usa `kicad-cli sch export netlist` (KiCad 7 u 8). Escribe {"REF:pin": "red"} con dos claves por
pin cuando el símbolo tiene nombre de pin: el número ("Q1:1") y el nombre ("Q1:E"). Omite los
símbolos de alimentación (#PWR, #FLG). Si no se indica salida, imprime el JSON.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    sch = Path(sys.argv[1])
    with tempfile.TemporaryDirectory() as d:
        net = Path(d) / 'n.net'
        r = subprocess.run(['kicad-cli', 'sch', 'export', 'netlist', '--format', 'kicadsexpr',
                            '-o', str(net), str(sch)], capture_output=True, text=True)
        if r.returncode or not net.exists():
            sys.exit('kicad-cli falló:\n' + r.stdout + r.stderr)
        txt = net.read_text()
    res = {}
    for bloque in re.split(r'\(net \(code', txt)[1:]:
        nombre = re.search(r'\(name "((?:[^"\\]|\\.)*)"\)', bloque).group(1).lstrip('/')
        for ref, pin, resto in re.findall(r'\(node \(ref "([^"]+)"\) \(pin "([^"]+)"\)([^\n]*)', bloque):
            if ref.startswith('#'):
                continue
            res[f'{ref}:{pin}'] = nombre
            m = re.search(r'\(pinfunction "([^"]+)"\)', resto)
            if m and m.group(1) not in ('~', '') and not m.group(1).startswith('~'):
                res.setdefault(f'{ref}:{m.group(1)}', nombre)
    salida = json.dumps(dict(sorted(res.items())), indent=1, ensure_ascii=False)
    if len(sys.argv) > 2:
        Path(sys.argv[2]).write_text(salida + '\n')
        print(f'{len(res)} pines → {sys.argv[2]}')
    else:
        print(salida)


if __name__ == '__main__':
    main()
