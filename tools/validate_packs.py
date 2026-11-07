"""Check a Hangman / Word Search word-pack file.

  python3 -I tools/validate_packs.py tools/content/packs.json
  python3 -I tools/validate_packs.py tools/content/add/packs-birds.json

An "add" file looks like {"packs": [ {...}, {...} ]}. A pack whose id already exists in packs.json (or another add file)
EXTENDS it: only the new words go in "words". A new pack needs "icon" (one emoji) and "name": {"en": ..., "es": ...}.
Each word: {"w": "FIN", "clue": "...", "fact": "...", "tier": 1}.  tier by letter count: 3-5 letters = 1, 6-7 = 2, 8-11 = 3.
"""
import json, sys, unicodedata, collections, re, glob, os
HERE = os.path.dirname(os.path.abspath(__file__))
def fold(s): return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')
def tier(n): return 1 if n <= 5 else 2 if n <= 7 else 3
def load(p):
    return json.load(open(p, encoding='utf-8'))
target = os.path.abspath(sys.argv[1])
errs = []
try: data = load(target)
except Exception as e: print('JSON ERROR', e); sys.exit(1)
base = {}   # (pack id, lang) -> set of folded words that already exist anywhere else
known_ids = set()
others = [os.path.join(HERE, 'content', 'packs.json')] + sorted(glob.glob(os.path.join(HERE, 'content', 'add', 'packs-*.json')))
for f in others:
    if os.path.abspath(f) == target or not os.path.exists(f): continue
    try:
        for p in load(f)['packs']:
            known_ids.add(p['id'])
            for lang in ('en', 'es'):
                base.setdefault((p['id'], lang), set()).update(fold(x['w']) for x in p.get('words', {}).get(lang, []))
    except Exception: pass
is_base = os.path.basename(target) == 'packs.json'
if not isinstance(data, dict) or 'packs' not in data: print('top level must be {"packs": [...]}'); sys.exit(1)
summary = {}; seen_ids = set()
for p in data['packs']:
    pid = p.get('id', '?')
    if not re.fullmatch(r'[a-z0-9-]+', str(pid)): errs.append(f'{pid}: bad id')
    if pid in seen_ids: errs.append(f'{pid}: pack listed twice in this file')
    seen_ids.add(pid)
    if pid not in known_ids and not is_base:
        if not p.get('icon'): errs.append(f'{pid}: new pack needs an icon')
        n = p.get('name') or {}
        if not n.get('en') or not n.get('es'): errs.append(f'{pid}: new pack needs name en+es')
    for lang in ('en', 'es'):
        ws = p.get('words', {}).get(lang)
        if not isinstance(ws, list) or not ws: errs.append(f'{pid}/{lang}: no words'); continue
        seen = set(); c = collections.Counter(); prior = base.get((pid, lang), set())
        for x in ws:
            w = x.get('w', ''); tag = f'{pid}/{lang}/{w}'
            if unicodedata.normalize('NFC', w) != w: errs.append(f'{tag}: not NFC')
            if lang == 'en' and not re.fullmatch(r'[A-Z]+', w): errs.append(f'{tag}: English words are plain capital A-Z only')
            if lang == 'es' and not re.fullmatch(r'[A-ZÁÉÍÓÚÜÑ]+', w): errs.append(f'{tag}: bad Spanish letters')
            if not 3 <= len(w) <= 11: errs.append(f'{tag}: length {len(w)} (need 3-11)')
            if x.get('tier') != tier(len(w)): errs.append(f'{tag}: tier {x.get("tier")} but length {len(w)} needs {tier(len(w))}')
            c[x.get('tier')] += 1
            fw = fold(w)
            if fw in seen: errs.append(f'{tag}: duplicate in this pack')
            if fw in prior: errs.append(f'{tag}: already in the {pid} pack ({lang})')
            seen.add(fw)
            clue, fact = x.get('clue', ''), x.get('fact', '')
            fc = fold(clue)
            if not clue or not fact: errs.append(f'{tag}: empty clue/fact'); continue
            if fw in fc: errs.append(f'{tag}: clue contains the answer')
            stem = fw[:max(4, len(fw) - 3)] if len(fw) >= 5 else None
            if stem and stem in fc and fw not in fc: errs.append(f'{tag}: clue contains stem "{stem}"')
            if len(clue.split()) > 12: errs.append(f'{tag}: clue {len(clue.split())} words (max 12)')
            if len(fact.split()) > 18: errs.append(f'{tag}: fact {len(fact.split())} words (max 18)')
        summary[(pid, lang)] = (len(ws), c[1], c[2], c[3])
for e in errs[:80]: print('ERR', e)
print('pack/lang            total  T1  T2  T3')
for k, v in summary.items(): print(f'{k[0]:24s}{k[1]}  {v[0]:4d} {v[1]:3d} {v[2]:3d} {v[3]:3d}')
print('TOTAL ERRORS', len(errs))
sys.exit(1 if errs else 0)
