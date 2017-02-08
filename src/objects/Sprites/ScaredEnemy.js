/*
 * ScaredEnemy
 *
 * Flees from the player
 */
import Enemy from '../Sprites/Enemy';
import GameData from '../Helpers/GameData';

export default class ScaredEnemy extends Enemy {
  static className() {
    return 'ScaredEnemy';
  }
  className() {
    return ScaredEnemy.className();
  }

  constructor(game) {
    super(game);

    //setup the wobble
    this.originalAngularVelocity = 75;
    this.wobbleTime = 250;
    this.body.angularVelocity = this.originalAngularVelocity;

    this.wobbleTimer = this.game.time.create(false);
    this.wobbleTimer.start();
    this.wobbleTimer.add(0, this.wobble, this);

    this.revertDirTimer = this.game.time.create(false);
    this.revertDirTimer.start();
  }
  reset() {
    super.reset();

    this.travelingAngle = this.originalAngle;
  }

  gloat() {
    this.wobbleTimer.stop();
    super.gloat();
  }

  update() {
    super.update();
    if (this.gloating || !this.alive) return;

    const distToPlayer = Phaser.Point.distance(this, GameData.player);
    const close = distToPlayer < GameData.player.width;

    if (close) {
      const scared = this.area() < GameData.player.area(); //only check scared when close to save CPU
      if (scared) {
        const escapeRadians = this.game.physics.arcade.angleBetweenCenters(GameData.player, this);
        const escapeDegrees = Phaser.Math.radToDeg(escapeRadians);

        this.setLookingDirection(escapeDegrees);
        this.travelingAngle = escapeDegrees;
        this.game.physics.arcade.velocityFromAngle(escapeDegrees, this.getSpeed(), this.body.velocity);

        this.revertDirTimer.removeAll();
        this.revertDirTimer.add(500, this.revertDirection, this);
      }
    }
  }

  revertDirection() {
    this.setLookingDirection(this.originalAngle);

    this.travelingAngle = this.originalAngle;
    this.game.physics.arcade.velocityFromAngle(this.originalAngle, this.getSpeed(), this.body.velocity);
  }

  wobble() {
    if (this.alive) {
      this.originalAngularVelocity *= -1;
      this.body.angularVelocity = this.originalAngularVelocity;
    }

    this.wobbleTimer.add(this.wobbleTime, this.wobble, this);
  }

  //since these enemies have advantage on direction, give them a handicap on speed
  getSpeed() {
    return super.getSpeed() * GameData.scaleMultipler(this.game.speeds.scaredEnemy, false);
  }


}
