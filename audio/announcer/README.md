# Recorded announcer clips (optional)

The winner announcement uses the voice installed on the iPad. If it sounds robotic, you can drop in recordings from any
natural text-to-speech service (or your own voice!). Save them here as MP3 files with exactly these names and they play instead of the device voice:

- `en-enough.mp3` - "You have enough pearls to play!"
- `en-line1.mp3` ... `en-line4.mp3` - the four funny announcer lines, in the order they are listed in `js/core/audio.js` (annLines)
- `es-enough.mp3`, `es-line1.mp3` ... `es-line4.mp3` - the Spanish versions

Any file that is missing falls back to the device voice, so you can add them one at a time.
Add the file names to the CORE list in `sw.js` (or just let the first online play cache them).
