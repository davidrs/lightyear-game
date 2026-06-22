# Lightyear Game

A Buzz Lightyear-inspired endless sky runner built with Phaser 3.

## Play Online

GitHub Pages (deployed from `main`):
https://davidrs.github.io/lightyear-game/

## Gameplay

- Fly through an endless side-scrolling sky.
- Collect stars to increase your score.
- Grab blue magic stars to trigger a temporary super mode.
- Beat your best run with local high-score tracking.

## Controls

- Keyboard: `Space` or `Up Arrow` to boost
- Mouse/Touch: hold press to boost
- Gamepad: A/X, B/Circle, triggers, or left stick up

## Run Locally

- Open directly in browser:

```bash
make open
```

- Run a local server:

```bash
make serve
```

Then open:
http://localhost:8000

## Tech Stack

- Phaser 3
- Vanilla JavaScript
- HTML5 Canvas

## Project Files

- `index.html` - bootstraps Phaser and loads scripts
- `constants.js` - tunable gameplay constants
- `game.js` - game loop, rendering, controls, scoring

## Asset Notes

Background tile licensing details are in:
`assets/backgrounds/SPACE_TILE_LICENSE.txt`

Ground dinosaur sprites are from Twemoji (open source, CC-BY 4.0):
- https://github.com/twitter/twemoji/blob/master/assets/72x72/1f996.png
- https://github.com/twitter/twemoji/blob/master/assets/72x72/1f995.png
