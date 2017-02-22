/*
 * Star
 */
import ExtendedSprite from '../Sprites/ExtendedSprite';

export default class Star extends ExtendedSprite {
  static className() {
    return 'Star';
  }
  className() {
    return Star.className();
  }

  constructor(game) {
    super(game, 0, 0, game.spritesheetKey, 'star');
    this.anchor.setTo(0.5, 0.5);

    this.game.physics.arcade.enableBody(this);
    //kill sprite if it moves out of bounds of game screen
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    this.tint = this.game.colors.star;
  }

  reset() {
    super.reset();
    this.game.add.audio('shooting-star').play();
    this.setSizeFromWidth(this.game.dimen.width.star);

    //make body smaller, as the star img has a lot of alpha fuzz around the edges
    const wid = Math.abs(this.width / 2 / this.scale.x);
    const height = Math.abs(this.height / 2 / this.scale.y);
    this.body.setSize(
      wid, height, wid / 2, height / 2);

    this.x = Math.random() * this.game.world.width / 2 + this.game.world.width / 4; //center half of screen
    this.y = -this.height / 2;

    const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.body.angularVelocity = 120 * plusOrMinus; //units are degress per second = 1 revolution per 3 second
    this.angle = Math.random() * plusOrMinus * this.game.integers.starAngleVariance + this.game.integers.downAngle;

    this.game.physics.arcade.velocityFromAngle(this.angle, this.getSpeed(), this.body.velocity);
  }

  static touchedPlayer(player, star) {
    star.kill();

    player.makeInvincible(0);
  }

  getSpeed() {
    return this.game.speeds.star;
  }
}
