"""Validate a place-question bank: {place_id: {"en": [q...], "es": [q...]}}.
usage: python3 tools/validate_placeqs.py FILE [places-batch.json ...]
Each q = {"q","opts"(3-4),"a","why","f"} where f is the 0-based fact index (or -1 for the hook) the question depends on."""
import json, sys
f = sys.argv[1]
data = json.load(open(f, encoding='utf-8'))
want = set()
for b in sys.argv[2:]:
    want |= {p['id'] for p in json.load(open(b, encoding='utf-8'))}
errs = []
wc = lambda s: len(str(s).split())
if want:
    for m in want - set(data): errs.append(f'missing place {m}')
    for x in set(data) - want: errs.append(f'unexpected place {x}')
for pid, v in data.items():
    en, es = v.get('en', []), v.get('es', [])
    if len(en) < 3: errs.append(f'{pid}: needs >=3 en questions (has {len(en)})')
    if len(en) != len(es): errs.append(f'{pid}: en/es counts differ')
    for lang in ('en', 'es'):
        seen = set()
        for i, q in enumerate(v.get(lang, [])):
            p = f'{pid}/{lang}/{i}'
            for k in ('q', 'opts', 'a', 'why', 'f'):
                if k not in q: errs.append(f'{p}: missing {k}')
            o = q.get('opts', [])
            if not 3 <= len(o) <= 4: errs.append(f'{p}: opts must be 3-4')
            if not isinstance(q.get('a'), int) or not 0 <= q.get('a', -1) < len(o): errs.append(f'{p}: bad a')
            if len({str(x).lower() for x in o}) != len(o): errs.append(f'{p}: duplicate opts')
            if wc(q.get('q', '')) > 40: errs.append(f'{p}: q too long')
            if any(wc(x) > 10 for x in o): errs.append(f'{p}: opt too long')
            if wc(q.get('why', '')) > 30: errs.append(f'{p}: why too long')
            if q.get('q') in seen: errs.append(f'{p}: duplicate q')
            seen.add(q.get('q'))
            if i < len(en) and lang == 'es' and i < len(v['en']) and v['en'][i].get('a') is not None and 'a' in q and False: pass
from collections import Counter
pos = Counter(q['a'] for v in data.values() for q in v.get('en', []) if isinstance(q.get('a'), int))
for e in errs[:80]: print('ERR', e)
print(f'SUMMARY: {len(data)} places, {len(errs)} errors, en answer positions={dict(sorted(pos.items()))}')
sys.exit(1 if errs else 0)
