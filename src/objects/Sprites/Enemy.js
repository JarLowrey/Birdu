/*
 * Enemy
 * ====
 *
 */
import Bird from '../Sprites/Bird';
import Poop from '../Sprites/Poop';
import GameData from '../Helpers/GameData';

export default class Enemy extends Bird {
  static className() {
    return 'Enemy';
  }
  className() {
    return Enemy.className();
  }

  constructor(game) {
    super(game);

    this.anchor.setTo(0.5, 0.5);

    //kill sprite if it moves out of bounds of game screen
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    this.gloating = false;

    this.poop(true); //initializes the poop timer
  }

  poop(initializingTimer = false) {
    if (this.alive && !initializingTimer) this.game.spritePools.spawn(Poop.className(), this.x, this.y);

    const timeToSpawn = GameData.floatBetween(this.game.durations.poopSpawn.min, this.game.durations.poopSpawn.max);
    this.game.time.events.add(timeToSpawn, this.poop, this);
  }

  update() {
    super.update();
    if (!this.alive) return;

    if (this.gloating) {
      this.game.physics.arcade.velocityFromAngle(this.body.rotation, this.getSpeed(), this.body.velocity);
    }
  }

  gloat() {
    this.body.angularDrag = 0;
    const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.body.angularVelocity = 360 * plusOrMinus; //units are degress per second = 1 revolution per second
    this.gloating = true;
  }

  reset() {
    super.reset();

    this.speed = null;

    this.chooseRandomSpriteSheet();
    this.setSpriteSize();
    this.setAtSidesOfScreen();
  }

  fancyKill() {
    super.fancyKill();

    this.game.data.stats.kills[this.frameId]++;
  }

  setSpriteSize() {
    const max = this.game.data.play.player.levelupArea() * 0.65;
    const min = this.game.originalPlayerArea / 4;
    const range = GameData.floatBetween(min, max);
    //var multiplier = GameData.scaleMultipler(this.game.integers.area.enemy);
    //if (multiplier == 0) multiplier = -this.game.integers.area.enemy.round.nearest;
    //const newArea = GameData.player.area() * (multiplier + 1);
    const newArea = Math.max(1000, Phaser.Math.roundTo(range, 3)); //do not let newArea = 0, shit will break

    // Find the new width from the given newArea
    const aspectRatio = Math.abs(this.width / this.height);
    const newWidth = Math.sqrt(newArea * aspectRatio);

    this.setSizeFromWidth(newWidth);
  }

  getSpeed() {
    if (!this.speed) this.speed = this.game.data.play.player.getSpeed() * GameData.scaleMultipler(this.game.speeds.enemyMultiplier, this.game.data.play.level);
    return this.speed;
  }

  chooseRandomSpriteSheet() {
    //get a random non-player bird sprite
    var randomEnemyFrame;
    do {
      randomEnemyFrame = Phaser.Math.between(0, this.game.animationInfo.maxBirdFrame);
    } while (randomEnemyFrame == this.game.data.settings.playerFrame);
    this.frameId = randomEnemyFrame;

    this.animations.play(Bird.birdFrameName(this.frameId));
  }
}
