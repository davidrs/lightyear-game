# Colin Game Agent Context

## Project Summary
- Phaser 3 browser game.
- Theme: Buzz Lightyear-inspired endless sky runner.
- Core loop: infinite 2D side-scroller where the player flies, collects stars, and chases a high score.

## Workspace Layout
- `index.html`: boots Phaser and loads `game.js`.
- `game.js`: all gameplay logic, rendering, controls, scoring, and effects.
- `Makefile`: shortcuts to open or serve the game locally.

## Gameplay Notes
- Scene: `EndlessRangerScene`.
- The world scrolls forever by increasing `scrollDistance`.
- Stars are spawned ahead of camera and recycled by distance checks.
- Score increases by collecting stars.
- Blue magic stars trigger temporary super mode (faster scrolling + stronger lift + magnet pull).
- High score is saved in `localStorage` key `space-ranger-high-score`.

## Sprite Asset Source
- Sprite sheet URL (Toy Story Buzz Lightyear asset):
  - https://www.spriters-resource.com/media/assets/246/249384.png?updated=1755493271
- Source page:
  - https://www.spriters-resource.com/sega_genesis/toystory/asset/249384/
- Current implementation uses cropped frame rectangles from one walk row (`BUZZ_WALK_FRAMES`).
- If visuals need tuning, adjust the x/y/w/h values in `BUZZ_WALK_FRAMES`.

## Input and Controller Support
- Keyboard: `SPACE` or `UP` for boost.
- Pointer/touch: hold press for boost.
- Gamepad (including Bluetooth controllers):
  - Boost buttons: face bottom (`A` / PlayStation `X`), face right (`B` / Circle), triggers (`L2`/`R2`), or left stick up.
  - HUD shows connected gamepad status.

## Quick Run
- Open directly: `make open`
- Local server: `make serve` then open http://localhost:8000

## Safe Edit Areas
- Tweak movement feel: constants at top of `game.js` (`GRAVITY`, `BOOST_ACCELERATION`, speed caps).
- Adjust star economy: `STAR_MIN_SPACING`, `STAR_MAX_SPACING`, and `collectStar` points.
- Tune sprite animation: `BUZZ_WALK_FRAMES` and animation setup in `createBuzzSpriteBody`.
