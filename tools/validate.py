import json, sys, collections, glob, os
f = sys.argv[1]
errs = []
try:
    data = json.load(open(f, encoding='utf-8'))
except Exception as e:
    print('JSON ERROR', e); sys.exit(1)
if not isinstance(data, list): print('top level must be an array'); sys.exit(1)
ids = set(); qs = set(); counts = collections.Counter(); pos = collections.Counter(); types = collections.Counter(); fun = 0; tagged = 0
TOPICS = {'science','world','reading','words','logic','math'}
TAGS = {'sharks','dinosaurs','space','ocean','baseball','animals','food','money','maps','body','weather','machines'}
def wc(s): return len(str(s).split())
for i, x in enumerate(data):
    p = f'#{i} {x.get("id")}'
    for k in ('id','topic','level','type','q','why','hint','tags','src','ver'):
        if k not in x: errs.append(f'{p}: missing {k}')
    if x.get('id') in ids: errs.append(f'{p}: duplicate id')
    ids.add(x.get('id'))
    if x.get('topic') not in TOPICS: errs.append(f'{p}: bad topic')
    if x.get('level') not in (1,2,3,4,5,6): errs.append(f'{p}: bad level')
    t = x.get('type'); types[t] += 1
    if t == 'choice':
        o = x.get('opts')
        if not isinstance(o, list) or not 2 <= len(o) <= 4: errs.append(f'{p}: choice needs 2-4 opts')
        elif not isinstance(x.get('a'), int) or not 0 <= x['a'] < len(o): errs.append(f'{p}: bad a')
        else:
            if len(o) >= 3: pos[x['a']] += 1
            if len(set(map(str.lower, map(str, o)))) != len(o): errs.append(f'{p}: duplicate opts')
            if any(wc(v) > 8 for v in o): errs.append(f'{p}: opt > 8 words')
    elif t == 'order':
        o = x.get('opts')
        if not isinstance(o, list) or not 3 <= len(o) <= 5: errs.append(f'{p}: order needs 3-5 opts')
        if 'a' in x: errs.append(f'{p}: order must not have a')
    elif t == 'number':
        if not isinstance(x.get('a'), (int, float)) or isinstance(x.get('a'), bool): errs.append(f'{p}: number a must be numeric')
        if 'opts' in x: errs.append(f'{p}: number must not have opts')
    else: errs.append(f'{p}: bad type {t}')
    if wc(x.get('q','')) > 38: errs.append(f'{p}: q > 38 words')
    if wc(x.get('why','')) > 28: errs.append(f'{p}: why > 28 words')
    if wc(x.get('hint','')) > 17: errs.append(f'{p}: hint > 17 words')
    if x.get('q') in qs: errs.append(f'{p}: duplicate q')
    qs.add(x.get('q'))
    for tg in x.get('tags', []):
        if tg not in TAGS: errs.append(f'{p}: unknown tag {tg}')
    if any(tg in ('sharks','dinosaurs','space','ocean','baseball') for tg in x.get('tags', [])): tagged += 1
    fun += 1 if x.get('fun') else 0
    counts[(x.get('topic'), x.get('level'))] += 1
# cross-file check: no id or question text may already exist in another bank of the same language
HERE = os.path.dirname(os.path.abspath(__file__)); lang = os.path.basename(f)[:2]
other_ids, other_qs = {}, {}
for g in glob.glob(os.path.join(HERE, 'content', lang + '-*.json')) + glob.glob(os.path.join(HERE, 'content', 'add', lang + '-*.json')):
    if os.path.abspath(g) == os.path.abspath(f): continue
    try:
        for y in json.load(open(g, encoding='utf-8')):
            other_ids[y['id']] = os.path.basename(g); other_qs[' '.join(y['q'].lower().split())] = os.path.basename(g)
    except Exception: pass
for i, x in enumerate(data):
    if x.get('id') in other_ids: errs.append(f'#{i} {x.get("id")}: id already used in {other_ids[x["id"]]}')
    k = ' '.join(str(x.get('q', '')).lower().split())
    if k in other_qs: errs.append(f'#{i} {x.get("id")}: same question text as one in {other_qs[k]}')
for e in errs[:60]: print('ERR', e)
print('counts by topic/level:')
for k in sorted(counts, key=lambda k: (str(k[0]), k[1] or 0)): print(' ', k, counts[k])
n = len(data)
print(f'SUMMARY: {n} items, {len(errs)} errors, types={dict(types)}, correct-index positions(3+ opts)={dict(sorted(pos.items()))}, interest-tagged={tagged} ({round(100*tagged/max(n,1))}%), fun={fun}')
sys.exit(1 if errs else 0)
