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
    open(f'{OUT}/packs.js','w',encoding='utf-8').write('export default '+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n')
    print('packs',len(d['packs']))
