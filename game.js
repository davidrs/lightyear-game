const {
  GAME_WIDTH = 960,
  GAME_HEIGHT = 540,
  HIGH_SCORE_KEY = "space-ranger-high-score",
  BASE_SCROLL_SPEED = 220,
  SUPER_SCROLL_SPEED = 320,
  GRAVITY = 820,
  BOOST_ACCELERATION = 1450,
  BASE_MAX_RISE = -390,
  SUPER_MAX_RISE = -520,
  STAR_MIN_SPACING = 160,
  STAR_MAX_SPACING = 300,
  BUZZ_SHEET_KEY = "buzz-sheet",
  BUZZ_SHEET_URL = "./assets/buzz-sheet-alpha.png",
  SPACE_TILE_KEY = "space-tile",
  SPACE_TILE_URL = "./assets/backgrounds/space-tile-512.png",
  MOON_GROUND_KEY = "moon-ground",
  AMBIENT_MUSIC_KEY = "space-ambient",
  AMBIENT_MUSIC_URL = "./assets/audio/space-ambience.wav",
  STAR_DING_KEY = "star-ding",
  STAR_DING_URL = "./assets/audio/star-ding.wav",
  STAR_DING_VOLUME = 0.36,
  DINO_TREX_KEY = "dino-trex",
  DINO_TREX_URL = "./assets/dinos/trex.png",
  DINO_SAUROPOD_KEY = "dino-sauropod",
  DINO_SAUROPOD_URL = "./assets/dinos/sauropod.png",
  DINO_MIN_SPACING = 520,
  DINO_MAX_SPACING = 1320,
  BUZZ_WALK_FRAMES = [
    { x: 8, y: 14, w: 46, h: 78 },
    { x: 70, y: 14, w: 48, h: 78 },
    { x: 136, y: 14, w: 50, h: 78 },
    { x: 200, y: 14, w: 52, h: 78 },
    { x: 264, y: 16, w: 50, h: 76 },
    { x: 326, y: 16, w: 50, h: 76 },
    { x: 394, y: 16, w: 46, h: 76 },
    { x: 460, y: 16, w: 40, h: 76 },
    { x: 526, y: 16, w: 38, h: 76 },
    { x: 586, y: 16, w: 40, h: 76 },
    { x: 648, y: 16, w: 44, h: 76 },
    { x: 710, y: 14, w: 46, h: 78 },
    { x: 770, y: 14, w: 50, h: 78 },
    { x: 836, y: 14, w: 52, h: 78 },
  ],
  RANGER_SPRITE_SCALE = 1.23,
  STAR_PICKUP_RADIUS_X = 42,
  STAR_PICKUP_RADIUS_Y = 72,
} = window.GAME_CONSTANTS || {};

class EndlessRangerScene extends Phaser.Scene {
  constructor() {
    super("endless-ranger");
    this.scrollDistance = 0;
    this.spawnCursor = 0;
    this.score = 0;
    this.highScore = 0;
    this.superTimer = 0;
    this.stars = [];
    this.dinos = [];
    this.dinoSpawnCursor = 0;
    this.clouds = [];
    this.hills = [];
    this.isBoosting = false;
    this.connectedGamepads = 0;
    this.gamepadSummary = "No gamepad";
    this.musicMuted = false;
    this.musicStarted = false;
  }

  preload() {
    this.load.image(BUZZ_SHEET_KEY, BUZZ_SHEET_URL);
    this.load.image(SPACE_TILE_KEY, SPACE_TILE_URL);
    this.load.image(DINO_TREX_KEY, DINO_TREX_URL);
    this.load.image(DINO_SAUROPOD_KEY, DINO_SAUROPOD_URL);
    this.load.audio(AMBIENT_MUSIC_KEY, AMBIENT_MUSIC_URL);
    this.load.audio(STAR_DING_KEY, STAR_DING_URL);
  }

  create() {
    this.highScore = Number.parseInt(window.localStorage.getItem(HIGH_SCORE_KEY) || "0", 10) || 0;
    this.createTextures();
    this.createSky();
    this.createWorld();
    this.createHud();
    this.createRanger();
    this.createInput();
    this.setupAmbientMusic();
    this.spawnCursor = 420;
    this.dinoSpawnCursor = 520;
    this.ensureStarsAhead();
    this.ensureDinosAhead();
    this.refreshHud();
  }

  createTextures() {
    if (!this.textures.exists("spark")) {
      const spark = this.add.graphics();
      spark.fillStyle(0xfff08d, 1);
      spark.fillCircle(8, 8, 8);
      spark.generateTexture("spark", 16, 16);
      spark.destroy();
    }

    if (!this.textures.exists("star")) {
      const star = this.add.graphics();
      this.drawStarShape(star, 0xffd84d, 0xfff7c8);
      star.generateTexture("star", 80, 80);
      star.destroy();
    }

    if (!this.textures.exists("magic-star")) {
      const star = this.add.graphics();
      star.fillStyle(0x55d8ff, 0.2);
      star.fillCircle(40, 40, 36);
      this.drawStarShape(star, 0x46b8ff, 0xcdf4ff);
      star.generateTexture("magic-star", 80, 80);
      star.destroy();
    }

    if (!this.textures.exists("cloud")) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.95);
      cloud.fillCircle(40, 44, 22);
      cloud.fillCircle(68, 34, 26);
      cloud.fillCircle(100, 44, 20);
      cloud.fillRoundedRect(28, 42, 82, 28, 12);
      cloud.generateTexture("cloud", 140, 84);
      cloud.destroy();
    }

    if (!this.textures.exists(MOON_GROUND_KEY)) {
      const moon = this.add.graphics();
      moon.fillStyle(0xc4c6cb, 1);
      moon.fillRect(0, 0, 512, 160);
      moon.fillStyle(0xd8dadf, 0.85);
      moon.fillRect(0, 0, 512, 30);
      for (let i = 0; i < 24; i += 1) {
        const x = Phaser.Math.Between(12, 500);
        const y = Phaser.Math.Between(34, 152);
        const r = Phaser.Math.Between(7, 22);
        moon.fillStyle(0xb4b6bc, 0.75);
        moon.fillCircle(x, y, r);
        moon.fillStyle(0xe7e9ee, 0.35);
        moon.fillCircle(x - r * 0.22, y - r * 0.2, r * 0.45);
      }
      moon.generateTexture(MOON_GROUND_KEY, 512, 160);
      moon.destroy();
    }
  }

  drawStarShape(graphics, fillColor, strokeColor) {
    graphics.fillStyle(fillColor, 1);
    graphics.lineStyle(6, strokeColor, 1);
    graphics.beginPath();
    const cx = 40;
    const cy = 40;
    const outer = 34;
    const inner = 15;
    for (let i = 0; i < 10; i += 1) {
      const angle = Phaser.Math.DegToRad(-90 + i * 36);
      const radius = i % 2 === 0 ? outer : inner;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }

  createSky() {
    this.spaceBgFar = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, SPACE_TILE_KEY).setOrigin(0);
    this.spaceBgFar.setTint(0x7f8dff).setAlpha(0.5);
    this.spaceBgNear = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, SPACE_TILE_KEY)
      .setOrigin(0)
      .setAlpha(0.88);

    this.moonGlow = this.add.graphics();
    this.moonGlow.fillStyle(0xf7f1d1, 0.2);
    this.moonGlow.fillCircle(832, 104, 76);
    this.moonGlow.fillStyle(0xf8f2da, 1);
    this.moonGlow.fillCircle(832, 104, 43);
    this.moonGlow.fillStyle(0xd8d0b2, 0.25);
    this.moonGlow.fillCircle(816, 92, 10);
    this.moonGlow.fillCircle(848, 118, 8);
    this.moonGlow.fillCircle(835, 127, 6);

    this.starDots = [];
    for (let i = 0; i < 55; i += 1) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.25, 0.75)
      );
      dot.setData("speed", Phaser.Math.FloatBetween(0.06, 0.18));
      this.starDots.push(dot);
    }
  }

  createWorld() {
    this.moonGround = this.add.tileSprite(0, GAME_HEIGHT - 132, GAME_WIDTH, 160, MOON_GROUND_KEY).setOrigin(0);
    this.moonGroundRim = this.add.graphics();
    this.moonGroundRim.fillStyle(0xe7e9ee, 0.85);
    this.moonGroundRim.fillRect(0, GAME_HEIGHT - 132, GAME_WIDTH, 10);

    this.atmosphericHaze = this.add.graphics();
    this.atmosphericHaze.fillGradientStyle(0x050914, 0x050914, 0x0b1233, 0x0b1233, 1);
    this.atmosphericHaze.fillRect(0, GAME_HEIGHT - 150, GAME_WIDTH, 150);
    this.drawLandscape();
  }

  drawLandscape() {
    if (this.atmosphericHaze) {
      this.atmosphericHaze.setAlpha(0.8 + Math.sin(this.time.now / 1800) * 0.08);
    }
  }

  setupAmbientMusic() {
    if (!this.sound || !this.cache.audio.exists(AMBIENT_MUSIC_KEY)) {
      return;
    }

    this.ambientMusic = this.sound.add(AMBIENT_MUSIC_KEY, {
      loop: true,
      volume: 0.46,
    });

    const startMusic = () => {
      this.musicStarted = true;
      if (!this.ambientMusic || this.ambientMusic.isPlaying) {
        this.refreshMusicHud();
        return;
      }
      if (!this.musicMuted) {
        this.ambientMusic.play();
      }
      this.refreshMusicHud();
    };

    this.input.once("pointerdown", startMusic);
    if (this.input.keyboard) {
      this.input.keyboard.once("keydown", startMusic);
    }
    this.events.once("shutdown", () => {
      if (this.ambientMusic) {
        this.ambientMusic.stop();
        this.ambientMusic.destroy();
      }
    });

    this.refreshMusicHud();
  }

  toggleAmbientMusic() {
    this.musicMuted = !this.musicMuted;

    if (!this.ambientMusic) {
      this.refreshMusicHud();
      return;
    }

    if (this.musicMuted) {
      if (this.ambientMusic.isPlaying) {
        this.ambientMusic.pause();
      }
    } else if (this.musicStarted) {
      if (this.ambientMusic.isPaused) {
        this.ambientMusic.resume();
      } else if (!this.ambientMusic.isPlaying) {
        this.ambientMusic.play();
      }
    }

    this.refreshMusicHud();
  }

  refreshMusicHud() {
    if (!this.musicText) {
      return;
    }

    if (this.musicMuted) {
      this.musicText.setText("Music: Off (M)");
      return;
    }

    if (!this.musicStarted) {
      this.musicText.setText("Music: Tap to start (M)");
      return;
    }

    this.musicText.setText("Music: On (M)");
  }

  createHud() {
    const hudStyle = {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      color: "#ffffff",
      stroke: "#3c2478",
      strokeThickness: 5,
    };

    this.scoreText = this.add.text(24, 20, "", { ...hudStyle, fontSize: "28px" });
    this.highScoreText = this.add.text(24, 56, "", { ...hudStyle, fontSize: "22px" });
    this.messageText = this.add
      .text(GAME_WIDTH / 2, 36, "", {
        ...hudStyle,
        fontSize: "30px",
        color: "#fff7b8",
        stroke: "#7e3d00",
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.powerText = this.add
      .text(GAME_WIDTH - 24, 22, "", {
        ...hudStyle,
        fontSize: "22px",
        color: "#c8f2ff",
        stroke: "#004d7a",
        strokeThickness: 5,
      })
      .setOrigin(1, 0);
    this.gamepadText = this.add
      .text(GAME_WIDTH - 24, 52, "", {
        ...hudStyle,
        fontSize: "18px",
        color: "#d8f9ff",
        stroke: "#00425f",
        strokeThickness: 4,
      })
      .setOrigin(1, 0);
    this.musicText = this.add
      .text(GAME_WIDTH - 24, 78, "", {
        ...hudStyle,
        fontSize: "18px",
        color: "#b8f6d8",
        stroke: "#0b4b35",
        strokeThickness: 4,
      })
      .setOrigin(1, 0);
    this.controlsText = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 26,
        "Hold SPACE / mouse / touch / gamepad A/X | Press M to mute music",
        {
          fontFamily: "Trebuchet MS, Arial, sans-serif",
          fontSize: "20px",
          color: "#f4f7ff",
          stroke: "#23315b",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5, 1);
  }

  createRanger() {
    const ranger = this.add.container(220, 280);
    const rangerBody = this.createRangerBody();

    const powerAura = this.add.circle(0, 6, 58, 0x59d9ff, 0.18);
    powerAura.setVisible(false);

    const jetGlow = this.add.graphics();
    this.jetIsBlue = false;
    this.drawJetGlow(false, jetGlow);

    ranger.add([powerAura, jetGlow, rangerBody]);
    this.ranger = ranger;
    this.powerAura = powerAura;
    this.jetGlow = jetGlow;
    this.rangerVelocityY = 0;
  }

  drawJetGlow(isBlue, target = this.jetGlow) {
    if (!target) {
      return;
    }

    const glowColor = isBlue ? 0x65d8ff : 0xffd25c;
    target.clear();
    target.fillStyle(glowColor, 0.95);
    target.fillTriangle(-14, 94, -4, 48, 6, 94);
    target.fillTriangle(14, 94, 4, 48, -6, 94);
  }

  createRangerBody() {
    if (this.createBuzzSpriteBody()) {
      return this.rangerBody;
    }

    const suit = this.add.graphics();
    suit.fillStyle(0xffffff, 1);
    suit.fillRoundedRect(-34, -30, 68, 78, 16);
    suit.fillStyle(0x52d66e, 1);
    suit.fillRoundedRect(-36, -12, 72, 18, 8);
    suit.fillRoundedRect(-36, 18, 72, 14, 8);
    suit.fillStyle(0x9d63ff, 1);
    suit.fillRoundedRect(-34, -44, 68, 22, 10);
    suit.fillRoundedRect(-54, -20, 18, 64, 9);
    suit.fillRoundedRect(36, -20, 18, 64, 9);
    suit.fillRoundedRect(-26, 46, 18, 46, 8);
    suit.fillRoundedRect(8, 46, 18, 46, 8);
    suit.fillStyle(0xffd3a8, 1);
    suit.fillCircle(0, -56, 24);
    suit.fillStyle(0x1d2c69, 1);
    suit.fillCircle(-7, -60, 3);
    suit.fillCircle(7, -60, 3);
    suit.lineStyle(3, 0xb65f45, 1);
    suit.strokeLineShape(new Phaser.Geom.Line(-8, -48, 8, -48));
    suit.fillStyle(0x73d6ff, 0.8);
    suit.fillRoundedRect(-20, -26, 40, 24, 10);
    suit.fillStyle(0xb0b8d9, 1);
    suit.fillRoundedRect(-16, -10, 32, 22, 6);
    suit.fillStyle(0xee553d, 1);
    suit.fillCircle(-6, 0, 4);
    suit.fillCircle(6, 0, 4);
    suit.fillStyle(0xb9c4d6, 1);
    suit.fillRoundedRect(-46, -2, 12, 26, 5);
    suit.fillRoundedRect(34, -2, 12, 26, 5);
    this.rangerBody = null;
    return suit;
  }

  createBuzzSpriteBody() {
    const texture = this.textures.get(BUZZ_SHEET_KEY);
    if (!texture || !texture.source || !texture.source[0]) {
      return false;
    }

    const validFrameNames = [];
    for (let i = 0; i < BUZZ_WALK_FRAMES.length; i += 1) {
      const frameName = `buzz-walk-${i}`;
      if (!texture.has(frameName)) {
        const frame = BUZZ_WALK_FRAMES[i];
        texture.add(frameName, 0, frame.x, frame.y, frame.w, frame.h);
      }
      if (texture.has(frameName)) {
        validFrameNames.push(frameName);
      }
    }

    if (validFrameNames.length < 2) {
      return false;
    }

    if (!this.anims.exists("buzz-walk-loop")) {
      this.anims.create({
        key: "buzz-walk-loop",
        frames: validFrameNames.map((frameName) => ({
          key: BUZZ_SHEET_KEY,
          frame: frameName,
        })),
        frameRate: 14,
        repeat: -1,
      });
    }

    this.rangerBody = this.add
      .sprite(0, 52, BUZZ_SHEET_KEY, validFrameNames[0])
      .setOrigin(0.5, 1)
      .setScale(RANGER_SPRITE_SCALE)
      .setFlipX(true);
    this.rangerBody.play("buzz-walk-loop");
    return true;
  }

  createInput() {
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.mKey.on("down", () => this.toggleAmbientMusic());
    this.input.on("pointerdown", () => {
      this.isBoosting = true;
    });
    this.input.on("pointerup", () => {
      this.isBoosting = false;
    });
    this.input.on("pointerout", () => {
      this.isBoosting = false;
    });

    this.onGamepadConnected = () => {
      this.updateGamepadSummary();
      this.messageText.setText("Gamepad connected. Press A/X to boost!");
    };
    this.onGamepadDisconnected = () => {
      this.updateGamepadSummary();
      this.messageText.setText("Gamepad disconnected.");
    };

    window.addEventListener("gamepadconnected", this.onGamepadConnected);
    window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected);
    this.events.once("shutdown", () => {
      window.removeEventListener("gamepadconnected", this.onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", this.onGamepadDisconnected);
      if (this.mKey) {
        this.mKey.off("down");
      }
    });

    this.updateGamepadSummary();
  }

  updateGamepadSummary() {
    const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
    const connected = gamepads.filter((pad) => pad && pad.connected);
    this.connectedGamepads = connected.length;
    if (connected.length === 0) {
      this.gamepadSummary = "No gamepad";
      return;
    }

    const firstName = connected[0].id
      .replace(/\(.*?\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
    this.gamepadSummary = `${connected.length} connected: ${firstName || "Gamepad"}`;
  }

  isGamepadBoostPressed() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gamepad of gamepads) {
      if (!gamepad || !gamepad.connected) {
        continue;
      }
      // Standard mapping for most Bluetooth controllers and console pads.
      const faceBottom = gamepad.buttons[0] && gamepad.buttons[0].pressed;
      const faceRight = gamepad.buttons[1] && gamepad.buttons[1].pressed;
      const leftTrigger = gamepad.buttons[6] && gamepad.buttons[6].pressed;
      const rightTrigger = gamepad.buttons[7] && gamepad.buttons[7].pressed;
      const leftStickUp = gamepad.axes.length > 1 && gamepad.axes[1] < -0.35;
      if (faceBottom || faceRight || leftTrigger || rightTrigger || leftStickUp) {
        return true;
      }
    }
    return false;
  }

  ensureStarsAhead() {
    while (this.spawnCursor < this.scrollDistance + GAME_WIDTH + 260) {
      this.spawnCursor += Phaser.Math.Between(STAR_MIN_SPACING, STAR_MAX_SPACING);
      this.createStar(this.spawnCursor);
    }
  }

  createStar(worldX) {
    const isMagic = Phaser.Math.Between(1, 5) === 1;
    const y = Phaser.Math.Between(100, 360);
    const star = this.add.image(worldX - this.scrollDistance, y, isMagic ? "magic-star" : "star");
    star.setData("worldX", worldX);
    star.setData("baseY", y);
    star.setData("bobSeed", Phaser.Math.FloatBetween(0, Math.PI * 2));
    star.setData("type", isMagic ? "magic" : "normal");
    star.setScale(isMagic ? 1 : Phaser.Math.FloatBetween(0.82, 1.05));
    star.rotation = Phaser.Math.FloatBetween(-0.18, 0.18);
    this.stars.push(star);
  }

  ensureDinosAhead() {
    while (this.dinoSpawnCursor < this.scrollDistance + GAME_WIDTH + 420) {
      this.dinoSpawnCursor += Phaser.Math.Between(DINO_MIN_SPACING, DINO_MAX_SPACING);
      this.createGroundDino(this.dinoSpawnCursor);
    }
  }

  createGroundDino(worldX) {
    const dinoKey = Phaser.Math.Between(0, 1) === 0 ? DINO_TREX_KEY : DINO_SAUROPOD_KEY;
    const dino = this.add.image(worldX - this.scrollDistance, Phaser.Math.Between(448, 488), dinoKey);
    dino.setOrigin(0.5, 1);
    dino.setScale(Phaser.Math.FloatBetween(0.7, 1.05));
    dino.setAlpha(0.9);
    dino.setFlipX(Phaser.Math.Between(0, 1) === 1);
    dino.setData("worldX", worldX);
    dino.setData("baseY", dino.y);
    dino.setData("bobSeed", Phaser.Math.FloatBetween(0, Math.PI * 2));
    this.dinos.push(dino);
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    const superActive = this.superTimer > 0;
    const scrollSpeed = superActive ? SUPER_SCROLL_SPEED : BASE_SCROLL_SPEED;

    this.scrollDistance += scrollSpeed * deltaSeconds;
    this.updateBackground(deltaSeconds);
    this.updateRanger(deltaSeconds, superActive);
    if (time % 1000 < delta) {
      this.updateGamepadSummary();
    }
    this.ensureStarsAhead();
    this.ensureDinosAhead();
    this.updateStars(time, deltaSeconds, superActive);
    this.updateDinos(time);
    this.updateSuperState(delta);
    this.refreshHud();
  }

  updateDinos(time) {
    const survivors = [];
    for (const dino of this.dinos) {
      const worldX = dino.getData("worldX");
      const baseY = dino.getData("baseY");
      const bobSeed = dino.getData("bobSeed");
      dino.x = worldX - this.scrollDistance;
      dino.y = baseY + Math.sin(time / 330 + bobSeed) * 2.5;

      if (dino.x < -120) {
        dino.destroy();
        continue;
      }
      survivors.push(dino);
    }
    this.dinos = survivors;
  }

  updateBackground(deltaSeconds) {
    this.spaceBgFar.tilePositionX += BASE_SCROLL_SPEED * 0.08 * deltaSeconds;
    this.spaceBgFar.tilePositionY -= BASE_SCROLL_SPEED * 0.01 * deltaSeconds;
    this.spaceBgNear.tilePositionX += BASE_SCROLL_SPEED * 0.2 * deltaSeconds;
    this.spaceBgNear.tilePositionY -= BASE_SCROLL_SPEED * 0.025 * deltaSeconds;
    if (this.moonGround) {
      this.moonGround.tilePositionX += BASE_SCROLL_SPEED * 0.33 * deltaSeconds;
    }

    for (const dot of this.starDots) {
      dot.x -= BASE_SCROLL_SPEED * dot.getData("speed") * deltaSeconds;
      if (dot.x < -6) {
        dot.x = GAME_WIDTH + 6;
        dot.y = Phaser.Math.Between(0, GAME_HEIGHT);
      }
    }
    this.drawLandscape();
  }

  updateRanger(deltaSeconds, superActive) {
    const boosting =
      this.isBoosting || this.spaceKey.isDown || this.upKey.isDown || this.isGamepadBoostPressed();

    if (this.jetIsBlue !== superActive) {
      this.jetIsBlue = superActive;
      this.drawJetGlow(superActive);
    }

    const maxRise = superActive ? SUPER_MAX_RISE : BASE_MAX_RISE;
    if (boosting) {
      this.rangerVelocityY -= BOOST_ACCELERATION * deltaSeconds;
    } else {
      this.rangerVelocityY += GRAVITY * deltaSeconds;
    }

    if (this.rangerBody) {
      if (boosting) {
        this.rangerBody.anims.pause();
        this.rangerBody.setFrame("buzz-walk-3");
      } else if (!this.rangerBody.anims.isPlaying) {
        this.rangerBody.play("buzz-walk-loop");
      }
      if (superActive) {
        this.rangerBody.setTint(0xdffbff);
      } else {
        this.rangerBody.clearTint();
      }
    }

    this.rangerVelocityY = Phaser.Math.Clamp(this.rangerVelocityY, maxRise, 360);
    this.ranger.y += this.rangerVelocityY * deltaSeconds;

    if (this.ranger.y < 88) {
      this.ranger.y = 88;
      this.rangerVelocityY = Math.max(110, this.rangerVelocityY * 0.35);
    }
    if (this.ranger.y > 372) {
      this.ranger.y = 372;
      this.rangerVelocityY = Math.min(-120, this.rangerVelocityY * -0.42);
      this.starBurst(this.ranger.x - 10, 420, 4, 0x92e085);
    }

    if (boosting) {
      this.jetGlow.setScale(1, superActive ? 1.35 : 1.1);
      this.jetGlow.setAlpha(superActive ? 1 : 0.85);
    } else {
      this.jetGlow.setScale(1, 0.68);
      this.jetGlow.setAlpha(0);
    }

    this.ranger.rotation = Phaser.Math.Clamp(this.rangerVelocityY / 720, -0.32, 0.32);
    this.powerAura.setVisible(superActive);
    this.powerAura.setAlpha(0.18 + Math.sin(this.time.now / 120) * 0.05);
  }

  updateStars(time, deltaSeconds, superActive) {
    const survivors = [];
    const magnetRadius = superActive ? 170 : 0;
    for (const star of this.stars) {
      const worldX = star.getData("worldX");
      const bobSeed = star.getData("bobSeed");
      const baseY = star.getData("baseY");
      star.x = worldX - this.scrollDistance;
      star.y = baseY + Math.sin(time / 240 + bobSeed) * 14;
      star.rotation += deltaSeconds * 0.8;

      if (star.x < -90) {
        star.destroy();
        continue;
      }

      const dx = star.x - this.ranger.x;
      const dy = star.y - this.ranger.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (superActive && distance < magnetRadius) {
        star.x -= dx * 0.1;
        star.y -= dy * 0.1;
      }
      const pickupOverlap =
        (dx * dx) / (STAR_PICKUP_RADIUS_X * STAR_PICKUP_RADIUS_X) +
        (dy * dy) / (STAR_PICKUP_RADIUS_Y * STAR_PICKUP_RADIUS_Y) <=
        1;
      if (pickupOverlap) {
        this.collectStar(star);
        continue;
      }
      survivors.push(star);
    }
    this.stars = survivors;
  }

  collectStar(star) {
    const type = star.getData("type");
    const points = type === "magic" ? 5 : this.superTimer > 0 ? 2 : 1;
    this.score += points;
    if (this.sound && this.cache.audio.exists(STAR_DING_KEY)) {
      this.sound.play(STAR_DING_KEY, {
        volume: type === "magic" ? STAR_DING_VOLUME + 0.1 : STAR_DING_VOLUME,
        rate: type === "magic" ? 1.08 : 1,
      });
    }
    if (this.score > this.highScore) {
      this.highScore = this.score;
      window.localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    }

    if (type === "magic") {
      this.superTimer = 6000;
      this.messageText.setText("Magic blue star! Super boost!");
      this.starBurst(star.x, star.y, 14, 0x59d9ff);
    } else {
      this.messageText.setText(this.superTimer > 0 ? "Zooming super fast!" : "Great flying!");
      this.starBurst(star.x, star.y, 10, 0xfff08d);
    }
    star.destroy();
  }

  updateSuperState(delta) {
    if (this.superTimer <= 0) {
      this.superTimer = 0;
      return;
    }
    this.superTimer -= delta;
    if (this.superTimer <= 0) {
      this.superTimer = 0;
      this.messageText.setText("Back to regular jetpack power!");
    }
  }

  refreshHud() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.highScoreText.setText(`High score: ${this.highScore}`);
    if (this.superTimer > 0) {
      this.powerText.setText(`Super power: ${(this.superTimer / 1000).toFixed(1)}s`);
    } else {
      this.powerText.setText("Blue stars = super power");
    }
    this.gamepadText.setText(`Pad: ${this.gamepadSummary}`);
    this.refreshMusicHud();
    if (!this.messageText.text) {
      this.messageText.setText("Fly through the stars!");
    }
  }

  starBurst(x, y, pieces, color) {
    for (let i = 0; i < pieces; i += 1) {
      const spark = this.add.image(x, y, "spark");
      spark.setTint(color);
      spark.setScale(Phaser.Math.FloatBetween(0.6, 1.15));
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-70, 70),
        y: y + Phaser.Math.Between(-70, 70),
        alpha: 0,
        duration: 520,
        ease: "Cubic.out",
        onComplete: () => spark.destroy(),
      });
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game",
  backgroundColor: "#070914",
  scene: [EndlessRangerScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
