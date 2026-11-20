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
| Word Search **Peek** (shows where a word starts) | costs 3 pearls (`HINT_COST.ws`), only in a puzzle that pays pearls (not today's puzzle once it has paid, not words he has already found) and only on Max's turn in a race with Dad; free otherwise (the button says so). Needs 3 pearls to peek (never goes below zero), one tap is never charged twice, and the Grown-up corner shows the week's peeks and what they cost |
| Hangman win (levels 1-3) | 10 / 15 / 20, +5 flawless; a loss still gives 3 |
| Number Patterns (ten puzzles a game) | 3 a puzzle, 5 a twist (second try pays half); game finished +5, perfect +5, first game of the day +10 |
| Read It Loud (five facts a sitting) | 4 / 5 / 7 by level, once per fact; first fact of the day +10, topic finished +15 |
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

**Nov 17 2026, "it is hard to get more customers":** a simulation of a child-like buyer (cheapest extra first, 24 to 30 runs) showed the parlor already draws more people than lemonade, but the first "more people" extras were too small to notice (+10% is about 2 people), the cart's 40-customer limit started costing sales around season 3 with no warning, and the "try a lower price" tip showed on about 90% of days. Four small changes, all pure numbers or tips, so nothing in a saved game moves: (1) the ice cream cart serves 60 customers a day to start (`serveBase` in `sims.js`; lemonade stays 40); (2) spoons 10% to 15%, flyers 8% to 13%, tenth-scoop card 12% to 18%, flags and lights 8% to 13% (prices and order unchanged); (3) when the forecast crowd is bigger than the cart can serve, the planning screen says "Your cart can serve about N customers a day" and points to *Scoopers & Registers*, and the "line too long" tip says the same instead of "add a table"; (4) "try a lower price" only shows when 6 in 10 or more said too pricey (`st.last.n` is optional, old saves keep the old rule). Simulated customers a day in seasons 1 to 6 went from 28, 39, 48, 60, 108, 189 to 28, 44, 59, 85, 152, 222; days to double the crowd from 25 to 19.

## Number Patterns and Read It Loud (Nov 17 2026)

Two games added after the 1st-grade report (math: stop counting on fingers, do number-pattern work; English: read aloud and be challenged). Both sit on a **NEW shelf at the very top of Home**, and have their own permanent tiles in the hub. A card leaves the shelf after Max has finished that game three times (`js/progress/newgames.js`, `S.newSeen`); the tile stays.

**Number Patterns** (`js/screens/patterns.js`, puzzles in `js/quiz/patterns.js`, pictures in `js/screens/pat-visuals.js`): ten puzzles per game, always numbers first. Number sentences with a missing part, number rows, hops on a number line, ten-frame flashes, skip counting, balance scales, number machines, a frog hopping across lily pads. Every third or fourth puzzle is a **twist** (a mini game: a flash of dots, a number machine, a frog), not another equation. The hidden skill level starts at 3 of 8 (he is well ahead of 1st grade) and moves up and down by itself; the Grown-up "Easier / Harder" setting shifts it by one. Rewards: 3 pearls a puzzle, 5 for a twist, bonuses for finishing, a perfect run and the first game of the day. Finishing a game can win one of 24 **critter cards**, original creatures with silly names (eight rare), collected in a card book. No existing characters or brands are used.

**Read It Loud (beta)** (`js/screens/read.js`, listening in `js/read/listen.js`, matching in `js/read/match.js`, 200 facts in `data/facts.js`): ten topics (Space, Baseball, Sports, Ocean, Animals, Dinosaurs, My Body, Earth and Weather, Food, Machines), 20 true facts each in three levels (easy, medium, challenge). Five facts a sitting, mixed easy to hard (it leans harder after a perfect sitting and easier after a rough one). He taps the microphone and reads the card; the iPad turns his voice into text, and the words light up as they are heard. A fact counts when about 70% of the words match (Grown-up setting: Forgiving 70%, Normal 82%, Strict 92%). The matcher forgives small slips: numbers said as words or digits, years, plurals, words that sound alike, a dropped "the". Pearls are paid once per fact (4, 5 or 7 by level), plus 10 for the first fact of the day and 15 for finishing a topic. Facts are never re-paid; a finished topic offers re-reading without pearls. Tap any word to hear it; "Hear it" reads the whole card.

**What can go wrong with the microphone (read this before judging the beta):**
- iOS only allows speech recognition in a **Safari tab**, not from a Home Screen icon (WebKit bug 225298). Opened from the icon, the lab says so and switches to **grown-up listens** (a grown-up holds a button for one second to say "great reading").
- It needs **Siri turned on** (Settings), the microphone permission (the first tap asks), and an internet connection: Safari sends the sound to Apple to turn it into words. Max's Lab never records or keeps the sound; it keeps only the text of the last 40 tries, on the iPad, in the Grown-up corner (what was expected, what the iPad heard, the score).
- Safari stops listening after a short pause. `listen.js` starts it again and stitches the pieces together, and never listens while the iPad is speaking.
- Grown-up corner > "New: Number Patterns and Read It Loud": a microphone test, who listens (the iPad, or a grown-up), how forgiving, and the list of what the iPad heard. If good reading is marked wrong too often, choose Forgiving or let a grown-up listen.
- If the microphone fails (permission refused, no network, no microphone), the next facts in that visit switch to grown-up listens by themselves and the screen explains why in plain words.

Tests: `tools/tests/patterns-unit.mjs` (39,060 generated puzzles), `patterns-ui.mjs`, `patterns-visuals.mjs`, `facts-unit.mjs` (200 facts and the matcher against simulated mistakes), `read-ui.mjs` (a pretend microphone drives every path), `read-visuals.mjs` (layout of the longest fact in each topic on every screen size), `newgames-save.mjs` (an old save loads with nothing lost), `listen-env.mjs` (the microphone help on every device), `oldcss.mjs` (pretends to be an older iPad whose Safari does not know `color-mix()` and checks the word highlights, shelf and puzzle tiles still show). Progress from both games is part of backups, transfer codes and merges; nothing that existed before is changed or reset.

**Microphone on a phone, an iPad or a computer (Nov 18 2026):** Read It Loud used to assume an iPad: any installed app was treated as "cannot listen" (wrong on Android and computers, where an installed app can listen) and every message said "the iPad". Now `js/core/device.js` works out the device (iPhone, iPad incl. iPadOS asking for the desktop page, Android phone/tablet, computer) and the browser (Safari, Chrome, Edge, Firefox, Samsung, Opera, in-app web views), and `t()` fills `{the}`, `{The}`, `{dev}`, `{br}`, `{Br}`, `{rec}`, `{co}` in any string with that device's words (English and Spanish). What each case gets:
- **Safari on iPhone / iPad, Chrome / Edge / Samsung on Android, Chrome / Edge / Safari on a computer:** ready (an installed app on Android or a computer is fine). The privacy tip names the company that turns the sound into words (Apple, Google or Microsoft).
- **iPhone / iPad Home Screen icon, Chrome / Firefox / Edge on iPhone or iPad, pages opened inside another app (Instagram, Facebook, Gmail...), Firefox anywhere, old Safari:** the browser itself has no speech recognition, so the menu says exactly why and what to open the link in, shows a **Copy the link** button (copies the page address without the `#` part, so it can be pasted into Safari or Chrome), and a grown-up listens meanwhile.
- **While listening:** a refused microphone gets platform-specific steps (iOS: Siri, Dictation, Safari's Website Settings; Android and computers: the lock icon), a network error on a computer suggests Chrome, Edge or Safari (privacy browsers such as Brave block it), and if "getting ready" lasts over 7 seconds the screen says to tap Allow; tapping the microphone again cancels, so he is never stuck. `start()` that keeps throwing gives up after five tries instead of retrying forever.
- **Grown-up corner:** the detected device and browser, "If the microphone does not work" steps for that kind of device, Copy the link when it cannot listen, the test box's "Technical note" (the browser's own error word, e.g. `not-allowed`, kept only in memory) and the heard list. Nothing new is saved: no change to the save format.
- Tests: `tools/tests/listen-env.mjs` pretends to be each device and browser (75 checks, English and Spanish).

**People photos, holiday jobs and a phone top bar (Nov 18 2026):**
- Heroes (Passport): each person's real photo now shows in their challenge with its credit (`img/people/<id>.jpg`, the 30 photos Rob already had in the old lab repo; credits come from `data/people.js` and are also on the Credits page). Once he has met someone the round picture in the grid becomes their photo; a photo that cannot load is quietly dropped. The close X now stays in view while the dialog scrolls, and there is a Close button at the bottom.
- Home Jobs: nine new jobs: Help decorate for Thanksgiving (25), Help decorate for Christmas (30), Help set / clear the table at Aunt Kimber's (15 each), Say something you're thankful for (5), Make place settings for the table (20), and Make a piece of art for Belen's birthday (25, one time only, shows first with "Due by Friday!", disappears after Fri 20 Nov 2026), "Name something you're thankful for about each person coming for Thanksgiving" (15, once a day, only Mon 23 to Sun 29 Nov 2026), and "Ask Aunt Kimber or Uncle JP if you can help with anything" (10, up to 3 times a week). A job can now have `from` / `until` (first and last day it shows), `once` (one time ever) and `due` (shows "Due by Friday!" and goes first). Tests: `chores-new.mjs` (fakes the date), `people-photos.mjs`.
- Phones: the top bar fits a 390px screen (the night and language buttons used to be cut off), and job cards never get wider than the screen.

**Learning about Boise, a bigger ice cream shop and "Own a team" (Nov 18 2026):**
- Learning about Boise: a new section at the top of Home (and on the NEW shelf). 30 places in three topics (things to do, how Boise began, animals and wild places) for ages 7 to 14. Each place has three facts, a "try it" idea and a 3-answer quiz in English and Spanish, with a picture; finishing a place pays pearls, with a bonus for finishing a topic. Facts were reviewed against official sources by a Boise local-activities review (cities, parks, museums, Idaho Historical Society, National Park Service). The pictures are original drawings (`js/boise/scenes.js`); a place can also carry a real photo (`photo` in `data/boise.js`, with credit). The Home banner is animated. Progress is in `S.boise` and shows in the Grown-up corner.
- Ice Cream Parlor: 34 more extras that bring customers (no new toppings), so no path tab is empty in the early seasons, plus a **Sneak peek** strip: what next season brings, with pictures, names and prices (about a third stay a surprise, secret flavors never show). Peeks cannot be bought early.
- Snack Shack: **Own a team**, eight steps after the night-game stadium (start a team, coach, star players, practice field, team bus, fan club, Hall of Fame, the Championship). Each step brings more fans (about 13x in all), three kinds of team merch join the menu, and Max can name his team. Nothing is reset; old saves keep everything.
- Phones: the Snack Shack header and menu rows wrap when the numbers get huge.

Older iPads (Safari before 16.2) ignore `color-mix()`. Because those declarations use `var()`, the browser cannot fall back to an earlier line, so the plain-colour versions live in one `@supports not (background: color-mix(…))` block at the end of `css/play.css`. If you add a `color-mix()` to that file, add its plain colour there too (day and night); `oldcss.mjs` lists the important ones.

## Word Search Peek costs 3 pearls (Nov 20 2026)

Max was tapping Peek every time, so a peek now costs **3 pearls** (`HINT_COST.ws` in `js/core/economy.js`; the quiz, patterns and world-map hints already halve the payout, so Word Search was the only free one). The button shows the price (**Peek −3 🔮**) and a short message says what it cost. A peek is charged only in a puzzle that pays pearls and only on Max's turn (in a race, Dad's turn is free); a puzzle that pays nothing (today's puzzle after it has paid, or words Max has found before) says **free**. With fewer than 3 pearls the peek is refused kindly ("find a word first to earn some"), so pearls never go below zero and a stuck puzzle can always be started by finding one word. `payHint()` in `js/core/store.js` takes the pearls (it is a choice, so not the wrong-answer ceiling, and not counted as a purchase) and keeps `peeks` and `peekCost` on the day, which the Grown-up corner shows under This week. Test: `node tools/tests/ws-peek.mjs [en|es] [ipad-land|phone]`.

Also fixed in the same release: on a phone the Word Search title row and the big grid made the page wider than the screen (the grid started at its 52 px default, which pushed the page wider, and then sized itself to that). The title row now wraps and the grid starts small and sizes itself to the real screen width (22 px minimum, so even 12×12 fits).

## Works with no internet (Nov 19 2026)

The first time the lab opens online, `sw.js` saves the **whole lab** on the device (about 230 files, 11 MB: every screen, game, picture and data file), so Max can keep playing, earning pearls and points on a plane or anywhere with no signal. Progress is saved on the device as always.

- **`tools/make-precache.mjs`** writes the file list into `sw.js` (between the `ALL-FILES` markers). **Run `node tools/make-precache.mjs` before every release** (it is also checked by `--check`), then bump `CACHE` in `sw.js` and `APP_BUILD` in `js/core/version.js`.
- On install the worker saves the first screens, then all code and data, then (on activate) the pictures, six files at a time. Pictures and sounds are copied from the previous version's saved copy when there is one, so an update only downloads what changed. The previous version's copy is deleted only once the new one is complete, so a half-finished update can never leave the lab empty.
- Code and data are still fetched fresh when online (updates show on the next open). If the network is dead or slow (airport wifi that is "connected" with no internet), the saved copy is used right away for a minute and a half instead of waiting. A wifi sign-in page that answers with HTML is never saved as code.
- `js/core/offline.js` asks the worker how much is saved, asks it to finish saving (on every open when online, and when the internet comes back), asks the browser not to clear the saved lab, and tells Max kindly when the internet goes away ("No internet? No problem!").
- The Grown-up corner has a **Ready for no internet ✈️** section (`js/screens/grownup-offline.js`): a progress bar, "Everything is saved" when ready, a **Save everything now** button, a checklist for before a trip, and what needs internet (Read It Loud cannot hear Max offline, so use "A grown-up listens"; the world map's satellite pictures, which fall back to the built-in outline map).
- Test: `LAB_URL=http://127.0.0.1:8814/ node tools/tests/offline.mjs [ipad|phone]` loads the lab online, switches the network off, and checks that every screen opens, all ~230 files load, pearls keep adding up and survive a reload, and the Grown-up corner says it is ready.
- Tip for trips: open the lab on wifi until the Grown-up corner says everything is saved, add it to the Home Screen, test once with Airplane Mode, and do not clear Safari's website data or use Private Browsing.

## Time warnings

When the daily limit, a grown-up's extra time or bedtime is close, a pop-up appears at **10, 5 and 2 minutes left**. Max has to tap "OK, I understand" to close each one. Each warning shows once, never again after a reload, and a fresh set starts when a grown-up grants extra time. At zero the lab closes as before.

## Grown-up passcode and limits

No passcode is stored in the repository. Set your own (4-6 digits) in the Grown-up corner. With no passcode set, the daily limit cannot be bypassed. With one set, a grown-up can grant 15 extra minutes. The Grown-up corner also has a voice chooser for read-aloud, since quality depends on the voices installed on the device.

## Tests

Start a static server in the repo (`python3 -m http.server 8767`, or any port with `LAB_URL=http://127.0.0.1:PORT/`) and run the scripts in `tools/tests/` with node (Playwright installed globally), for example `node tools/tests/baseball-ui.mjs es ipad-port night`. Rebuild generated data with `python3 tools/build_data.py` and `python3 tools/build_placeqs.py`; validate banks with `python3 tools/validate.py` and `python3 tools/validate_placeqs.py`.

## Maps

Google Maps' terms don't allow it on children's sites, so the map uses free satellite sources and falls back to a built-in outline map when offline. See **Photo and map credits** in the Grown-up corner for every attribution.

## Files

- `index.html`, `css/`, `js/` — the app
- `data/` — questions, word packs, places and people (generated or curated)
- `img/places/` — place photos, with credits on the credits screen
- `sw.js` — offline support (saves the whole lab; file list generated by `tools/make-precache.mjs`)

## Adding or editing questions

The questions live as plain JSON in `tools/content/`. After editing:

```
python3 tools/validate.py tools/content/en-logic.json   # checks one bank
python3 tools/build_data.py                               # rebuilds data/questions.*.js and data/packs.js
```

`tools/SCHEMA.md` describes the format. Grown-ups can also add questions with no code in the Grown-up corner.
