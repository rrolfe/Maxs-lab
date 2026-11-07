import json, os, sys, glob
import pathlib
HERE=pathlib.Path(__file__).resolve().parent
C=str(HERE/'content')
OUT=str(HERE.parent/'data')
def load(names):
    out=[]
    for n in names:
        p=f'{C}/{n}'
        if os.path.exists(p):
            try: out+=json.load(open(p,encoding='utf-8'))
            except Exception as e: print('SKIP bad json',n,e)
        else: print('missing',n)
    return out
en=load(['en-science-world.json','en-reading-words.json','en-logic.json'])
es=load(['es-science-world.json','es-reading-words.json','es-logic.json'])
def load_adds(lang):
    out=[]
    for f in sorted(glob.glob(f'{C}/add/{lang}-*.json')):
        try: out+=json.load(open(f,encoding='utf-8'))
        except Exception as e: print('SKIP bad json',f,e)
    return out
def merge_adds(base,adds,lang):
    ids={q['id'] for q in base}; texts={' '.join(q['q'].lower().split()) for q in base}; dropped=0
    for q in adds:
        k=' '.join(q['q'].lower().split())
        if q['id'] in ids or k in texts: dropped+=1; continue
        ids.add(q['id']); texts.add(k); base.append(q)
    if dropped: print(lang,'duplicate questions dropped:',dropped)
    return base
en=merge_adds(en,load_adds('en'),'en'); es=merge_adds(es,load_adds('es'),'es')
for lang,items in (('en',en),('es',es)):
    if not items: print('no items for',lang); continue
    # strip fields the app does not need to keep files small
    slim=[]
    for q in items:
        d={k:q[k] for k in ('id','topic','level','type','q','why','hint','tags') if k in q}
        if 'opts' in q: d['opts']=q['opts']
        if 'a' in q: d['a']=q['a']
        if q.get('fun'): d['fun']=True
        slim.append(d)
    open(f'{OUT}/questions.{lang}.js','w',encoding='utf-8').write('// Generated from the reviewed question bank. Edit the source JSON, not this file.\nexport default '+json.dumps(slim,ensure_ascii=False,separators=(',',':'))+';\n')
    print(lang,len(slim),'items')
p=f'{C}/packs.json'
if os.path.exists(p):
    d=json.load(open(p,encoding='utf-8'))
    import unicodedata
    fold=lambda w:''.join(c for c in unicodedata.normalize('NFD',w.lower()) if unicodedata.category(c)!='Mn')
    byid={x['id']:x for x in d['packs']}
    skipped=0
    for f in sorted(glob.glob(f'{C}/add/packs-*.json')):
        try: add=json.load(open(f,encoding='utf-8'))['packs']
        except Exception as e: print('SKIP bad pack file',f,e); continue
        for ap in add:
            tgt=byid.get(ap['id'])
            if tgt is None:
                tgt={'id':ap['id'],'icon':ap.get('icon','⭐'),'name':ap['name'],'words':{'en':[],'es':[]}}
                d['packs'].append(tgt); byid[ap['id']]=tgt
            for lang in ('en','es'):
                have={fold(x['w']) for x in tgt['words'][lang]}
                for x in ap.get('words',{}).get(lang,[]):
                    if fold(x['w']) in have: skipped+=1; continue
                    have.add(fold(x['w'])); tgt['words'][lang].append(x)
    n={l:sum(len(x['words'][l]) for x in d['packs']) for l in ('en','es')}
    open(f'{OUT}/packs.js','w',encoding='utf-8').write('export default '+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n')
    print('packs',len(d['packs']),'words',n,'duplicates skipped',skipped)
