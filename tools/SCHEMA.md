# Question bank format for "Max's Lab" (a learning site for a very bright 7-year-old, 1st grade, reads at ~grade 3-4)

Each output file is ONE valid JSON array (UTF-8, no comments, no trailing commas) of objects like this:

{
  "id": "sci-3-001",
  "topic": "science",
  "level": 3,
  "type": "choice",
  "q": "What powers a geyser like Strokkur?",
  "opts": ["A hidden garden hose", "Heat inside Earth", "The Moon pulling it up"],
  "a": 1,
  "why": "Earth heats water underground and steam pushes it up. Nothing pumps it like a garden fountain.",
  "hint": "Think about what makes water hot underground.",
  "tags": ["ocean"],
  "fun": false,
  "src": "USGS",
  "ver": "2026-11"
}

FIELDS
- id: "<prefix>-<level>-<3 digit counter>", unique in the file. Use the prefix given in your assignment.
- topic: exactly one of  science | world | reading | words | logic
- level 1..6: L1 = grade 1 warm-up, L2 = grade 2, L3 = late grade 2 / early grade 3, L4 = grade 3, L5 = grade 4, L6 = grade 5+ stretch.
  Max is most likely working at L3-L4 and the ceiling is L6, so L5/L6 must be genuinely tricky (but fair, with ONE defensible answer).
- type:
  "choice": 2-4 options in "opts"; "a" = index (0-based) of the single correct option. True/false = opts ["True","False"] (or the target language's equivalent). Use 3 options at L1-L2, 4 at L3+ (except true/false).
  "order": "opts" lists 3-5 items IN THE CORRECT ORDER (the app shuffles them); no "a".
  "number": answer is a number; "a" = the number (integer or decimal), no "opts". Include units in the question text.
- q: <= 35 words. Plain, vivid, kid-readable. No tricks of wording.
- opts: each <= 8 words.
- why: <= 25 words. Explain why the tempting wrong answer is wrong, or give a memory trick. Warm, factual, no baby talk.
- hint: <= 15 words. A strategy nudge that does NOT reveal the answer.
- tags: 0-3 of: sharks, dinosaurs, space, ocean, baseball, animals, food, money, maps, body, weather, machines
- fun: true on ~10% of items (surprising or silly-but-true, a "wait, REALLY?" item). Otherwise false.
- src: short source for factual items (e.g. "NOAA", "NASA", "NGSS 2-ESS2-3", "Merriam-Webster", "Common Core L.2.1"). For logic/reasoning items "original" is fine.
- ver: "2026-11"

QUALITY RULES (important)
1. One defensible answer. Avoid "biggest / first / newest / most / fastest" unless it is timeless and uncontroversial. NO facts that change (moon counts, populations, records, current leaders, prices). Do NOT include anything you are not sure is true; if unsure, verify with a quick web search or drop the item.
2. Distractors must be plausible and teach something; no silly joke options. The correct answer must NOT usually be the longest option, and positions must vary: spread the correct index evenly across positions.
3. Interests: at least 40% of items should connect to Max's loves: sharks, dinosaurs, space, ocean life, baseball (also fine: animals, machines, food). The rest should be varied and surprising.
4. Variety: no more than 2 items in a row with the same type or the same sub-skill. Include at least 15% true/false, order, or number items where they fit the topic.
5. Feedback tone: never babyish, never "easy!". No timers, no scary/violent content, no politics/religion, no brand names.
6. No duplicate or near-duplicate questions. Each level should truly be harder than the one below.
7. Do not mention "Max" by name.
8. Pictures: none. Everything is text. Emojis are allowed inside q or opts only when they ARE the content (e.g. counting shapes).

SELF-CHECK: run   python3 -I VALIDATE_PATH your_file.json   and fix every error before you finish. Report the validator's final summary line.
