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
