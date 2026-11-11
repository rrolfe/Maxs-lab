# Max's Lab

A learning playground for a smart 7-year-old, built for the iPad. Max answers adaptive quiz missions to earn pearls, then spends them on games: Word Search, Hangman, three little business stands (lemonade, ice cream, pizza fractions), a satellite world map with places that matter to the family, and a passport of stamps, badges and heroes.

It is plain HTML, CSS and JavaScript. There is no build step and nothing to install.

## Put it online (GitHub Pages)

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/ (root)**, and save.
3. After a minute the site is at `https://<your-user>.github.io/<repo-name>/`.
4. On the iPad, open that address in Safari, tap **Share → Add to Home Screen**. It then opens full screen and keeps working offline.

## For grown-ups

Tap the small gear on the home screen (or press and hold it for 3 seconds if no PIN is set) to open the **Grown-up corner**:

- this week's play time, accuracy and subject levels
- daily play limit, bedtime wind-down and bigger text
- optional free Esri map key for sharper satellite pictures
- family notes for each family place (stored only on the device)
- your own questions that mix into Max's missions
- backup and restore, and an optional PIN

Everything Max does is stored on his device only. Nothing is sent anywhere.

## Pearls and pace

Design target: about **12 pearls per minute** of real play. The tables below are the numbers in `js/core/economy.js`.

| Activity | Pearls |
|---|---|
| Quiz question, first try (easy / at level / boss) | 3 / 5 / 10 |
| Quiz second try | half (none on 2-choice questions) |
| Mission finished / perfect / first mission of the day | +5 / +5 / +15 |
| World map question, first try / second try | 6 / 3 (half if the facts were peeked) |
| New place stamp | +6 |
| Find-it right / bonus for 4+ right | 3 / +5 |
| Hero question stamp | 6 |
| Word Search: choose size (8, 10, 12) and difficulty (Easy: across/down, Medium: + diagonals, Tricky: backwards too) | per word 3 / 4 / 6; finish bonus 8-16 (Easy), 10-20 (Medium), 14-28 (Tricky) by size |
| Home Jobs (real chores, a grown-up types the chore code) | 33 jobs worth 3 to 40 pearls (about 3 pearls per minute of effort), once a day each, many with a weekly limit (Monday to Sunday); not limited by the daily cap |
| Hangman win (levels 1-3) | 10 / 15 / 20, +5 flawless; a loss still gives 3 |
| Baseball | no questions any more: it is a timing game that costs pearls to play (see below) |

**Wrong picks cost pearls, gently:** at most 2 per miss on 3-4 choice questions (up to 4 on true/false), never more than a quarter of what Max holds at that moment (minimum 1), and at most 10 lost per day in total. Pearls never drop below 0. A short buzzer plays; a gentle note plays for word-search and find-it misses. This was Rob's choice; child-development educators generally advise against point loss for this age.

**Daily taper:** full rate until 400 pearls earned in a day, half rate to 600, then nothing more. It counts earned pearls, so spending never re-opens it.

| Unlock | Cost | Minutes at 12/min |
|---|---|---|
| Lemonade stand (includes season 1) | 100 | ~8 |
| Snack Shack | 300 | ~25 |
| Ice cream stand | 500 | ~42 |
| Pizza stand | 700 | ~58 (two days because of the daily ceiling) |
| New season: lemonade / snack / ice cream | 75 / 110 / 130 | ~6 / 9 / 11 |
| Baseball, 3 innings / 6 innings | 150 / 270 | ~12 / ~22 |

Stands run 10-day seasons (the Snack Shack runs 15) with upgrade trees. Upgrades and cash carry over between seasons; only starting the next season costs pearls. Snack Shack ball fields (each doubles the crowd) cost $90, $220, $500, $1,100 and $2,400, so a careful player has field 2 by about inning 5 and field 3 by about inning 10. Max's Ballpark (Nov 10 2026) is an arcade timing game, with no questions: the pitcher throws, Max taps SWING when the ball is in the glowing ring and holds off on balls outside the strike zone. Perfect timing makes the big hits; early, late or missed swings give fouls, strikeouts and outs. On defense he taps CATCH at the right moment for a great play that can save a run. It runs 3 or 6 innings against Dino Rexes, Space Rockets or Sea Pirates (fast pitches, curveballs and changeups get harder). Playing costs pearls (150 / 270). Bot simulations (`tools/tests/baseball-sim.mjs`) show how often a rookie, a kid and a sharp player win each matchup. The field is drawn in SVG with its own animations (`js/baseball/field.js`).

## Weekly check-in and the Grown-up corner

The Grown-up corner now has *Time in the lab* (minutes per day and per program, last 7 days; per-program time counts from the update that added it), *What to work on* (suggestions from recent accuracy, the latest check-in, idle subjects and time balance) and *Weekly check-in and progress*. The check-in is 24 fresh questions (4 per subject at levels 2-5, one try, no hints, no pearls lost, 50 pearls for finishing whatever the score, paid in full even after the daily taper; the amount is `REWARD.checkin` in `js/core/economy.js`, about 4 minutes of regular play, and it is stated on the home banner, the intro and the results), offered on the home screen once a week. **It cannot produce national percentiles**: the questions are not normed against a national sample. For real percentiles, enter your school's results (MAP Growth, i-Ready and so on) under *School test results* and compare them with the weekly trend.

## Snack Shack expansion

Ball fields set the size of the daily crowd: 1 field draws 10–50 fans a day, 2 fields 50–100, 3 fields 100–200, 4 fields 200–400 (weather, game days and shop upgrades decide where in the range). After the 4th, fields come two at a time and every pair makes the crowd four times bigger: 6 fields 800–1,600, 8 fields 3,200–6,400, 10 fields 12,800–25,600, 12 fields 51,200–102,400. Prices: 2nd field $90, 3rd $220, 4th $500, then $4,000 / $20,000 / $100,000 / $500,000 for the pairs (the later pairs appear in seasons 2, 3 and 4). Each also adds serving capacity and storage, and starting stock for new menu items scales with the crowd. The Merch stand ($150: pennants, foam fingers, caps) and the Big merch store ($600: team shirts, plush sharks) sell high-margin items — fans buy more of them after a home run. Other sports: basketball court ($20,000), soccer field ($100,000), football field ($1,000,000) and tennis courts ($4,000,000) each count as one more field (the crowd doubles) and unlock a snack (pretzels, orange slices, nachos, strawberries and cream). The Stadium has three levels (Build the Stadium $75,000, Floodlights and night games $3,000,000, Mega Stadium $100,000,000): every level triples the crowd, changes how the whole Snack Shack looks (scoreboard, navy and gold, night sky at level 2, golden shimmer at level 3) and level 2 adds night games and hot cocoa. Huge crowds are simulated with 4,000 stand-ins that each stand for many fans (`SNACK.sim`). Surprises (js/stands/perks.js): Chompy the shark mascot (3 fields), fireworks on record days (6 fields), stadium horn (2 other sports), stadium look, night games, legend crown, and a secret golden hot dog (tap the title 7 times). The Candy counter (season 1), cone machine and slush machine (frozen slush and frozen lemonade) add menu items.

## Recorded announcer clips

See `audio/announcer/README.md` to drop in natural recordings for the winner announcement.

## Home Jobs code

The chore check uses the code **1234** by default (Rob's choice, for easy approval while he is nearby). Change it in the Grown-up corner under *PIN and about*. The grown-up passcode, if set, also works. A grown-up can add, remove or re-price jobs from the Home Jobs screen.

## Safari and the Home Screen icon do not share progress (fixed so progress comes along)

On an iPad, Safari and an app added to the Home Screen each keep their own saved data (iOS copies only cookies). So, while Max plays in Safari, the lab writes a small compressed "lite" copy of his progress into a cookie (`mll_carry`, scoped to the lab, at most about 3.4 KB). A new empty copy that opens from the Home Screen reads it on first launch and picks up where Max was (pearls, levels, stands, badges). If that does not work (older iOS, cookies cleared), the Home Screen copy shows a **paste a transfer code** card, and the Grown-up corner says whether progress came along. The full copy is still the transfer code: Grown-up corner, **Copy this copy's transfer code**, then paste it in the other copy. Tip: add the icon from Safari **after** the updated lab has loaded with Max's progress, then remove the old empty icon. The same section shows the build number, and has +100 / +300 / +800 pearl buttons for testing or rewards. Updates load on the next open when online (code is fetched fresh, with the saved copy only as the offline fallback).

## Start a game over

Grown-up corner, **Start a game over**: reset one game (Lemonade, Ice cream, Snack Shack, Pizza, Word Search/Hangman levels, Ballpark stats) so Max can start fresh, optionally keeping what he unlocked, or everything (type RESTART). A safety snapshot is saved first and can be restored from the snapshots list.

## Lemonade Stand: from a cart to Lemon Town (Nov 10 2026)

The Lemonade Stand has 67 extras in eight paths: *Look & Signs*, *Gear & Ice*, *Flavors & Treats*, *Helpers*, *Shout It Out*, *Pop-up Places*, *Wheels & Orders* and *The Shop*. The shop shows a "saving for" goal (tap a card's star to pick it), the dream strip (rent a shop, counter, Grand Opening, bakery, second shop, factory, franchise, Lemon Town) and only the next few cards of a path plus a mystery card. Chapters: tiers 1-4 show from seasons 1-4, tier 5 from season 6, tier 6 from season 9. The stand on screen grows from a cart to a striped-awning stand, a wooden stand, a golden lemon sign, a coming-soon shop, a Grand Opening shop, a factory and Lemon Town. Pop-up places (park, dino museum, ballpark gate, shark aquarium, beach cart, farmers market, rocket center, stadium cart) are chosen each morning: the forecast shows the crowd at each place, and each has its own weather (the beach is empty in the rain, the museum is full). Deliveries (wagon, bike, scooter, van, drone) add customers; catering orders grow from 50 to 100 to 250 cups; other shops pay a daily income. Happy surprise days: dino parade, rocket-launch party, Shark Week, free lemons, a rainbow, a mystery shopper, newspaper ad days. The old extras (sign ... store) keep their effects, and an old save that owned the store already owns the shop steps before it. Prices run from $15 to $250,000. `node tools/tests/lemonade-ladder.mjs` checks the ladder with bots (about $11 a day in season 1, hundreds by season 12, Lemon Town around season 26 for a bot that buys the cheapest thing it can).

## Ice Cream Parlor: from a cart to Sundae Island (Nov 11 2026)

The Ice Cream Parlor has 132 extras in nine paths: *Cones & Flavors*, *Toppings & Treats*, *Freezers & Gear*, *Scoopers & Crew*, *Shout It Out*, *Wheels & Trucks*, *Parties & Orders*, *Famous Everywhere* and *The Shop*. Data lives in `js/stands/cream-data.js` (pure numbers), names/riddles in `cream-text.js`, the path/emoji/look registry in `cream-shop.js`; the shop UI is shared with the lemonade stand (`lemon-shop.js`). Same shop layout as lemonade: a "saving for" goal, the dream strip (eight Sundae Island pieces: dock, cone beach, volcano, lagoon, dino park, scoop stadium, mega mountain, rocket pad), the next few cards of a path plus a mystery card. Chapters: tiers 1-4 show from seasons 1-4, tier 5 from season 6, tier 6 from season 9. Toppings, sauces, sundaes and merch (23 of them) are bought by a share of customers for extra money and cost a little to make; cold treats sell better on hot days, warm ones (hot fudge, cocoa) on rainy days. Max can pick a **Today's special** from what he owns (it sells 1.8x as often; the forecast says which are loved when it is hot or cool). Five secret flavors show a riddle card until their requirements are bought. The stand on screen grows from a cart to an umbrella, a trailer, a truck, a corner shop, a sweet parlor, a castle, a factory and Sundae Island. Eight pop-up places (splash park, school gate, beach, dino museum, aquarium, ballpark gate, fair, space center) are chosen each morning, each with its own weather. Party orders climb 36 → 100 → 300 → 1,500 → 6,000 scoops; other shops pay a daily income; tub stepper grows 1/5/10/25/50/100/250 with the stock. New happy days: Ice Cream Day, free cone day, school's out, jingle day, shark scoop, berry day. Prices go from $25 to $1,200,000 (about $7.4M for everything). Legacy ids (sign, table, freezer, cone, toppings, helper, truck, party, shop) keep their effects, and an old save that owned the shop already owns the look steps before it. `node tools/tests/cream-ladder.mjs` checks the ladder with a cheapest-first bot ($15 a day in season 1, hundreds by season 9, the shop around season 10, Sundae Island around season 36); `node tools/tests/cream-shop.mjs [en|es] [ipad-land|ipad-port]` checks the shop in the browser.

## Time warnings

When the daily limit, a grown-up's extra time or bedtime is close, a pop-up appears at **10, 5 and 2 minutes left**. Max has to tap "OK, I understand" to close each one. Each warning shows once, never again after a reload, and a fresh set starts when a grown-up grants extra time. At zero the lab closes as before.

## Grown-up passcode and limits

No passcode is stored in the repository. Set your own (4-6 digits) in the Grown-up corner. With no passcode set, the daily limit cannot be bypassed. With one set, a grown-up can grant 15 extra minutes. The Grown-up corner also has a voice chooser for read-aloud, since quality depends on the voices installed on the device.

## Tests

Start a static server in the repo (`python3 -m http.server 8767`) and run the scripts in `tools/tests/` with node (Playwright installed globally), for example `node tools/tests/baseball-ui.mjs es ipad-port night`. Rebuild generated data with `python3 tools/build_data.py` and `python3 tools/build_placeqs.py`; validate banks with `python3 tools/validate.py` and `python3 tools/validate_placeqs.py`.

## Maps

Google Maps' terms don't allow it on children's sites, so the map uses free satellite sources and falls back to a built-in outline map when offline. See **Photo and map credits** in the Grown-up corner for every attribution.

## Files

- `index.html`, `css/`, `js/` — the app
- `data/` — questions, word packs, places and people (generated or curated)
- `img/places/` — place photos, with credits on the credits screen
- `sw.js` — offline support

## Adding or editing questions

The questions live as plain JSON in `tools/content/`. After editing:

```
python3 tools/validate.py tools/content/en-logic.json   # checks one bank
python3 tools/build_data.py                               # rebuilds data/questions.*.js and data/packs.js
```

`tools/SCHEMA.md` describes the format. Grown-ups can also add questions with no code in the Grown-up corner.
