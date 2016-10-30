/*
 * Cloud
 */
import ExtendedSprite from '../Sprites/ExtendedSprite';
import PoopSplatter from '../Sprites/PoopSplatter';

export default class Cloud extends ExtendedSprite {
  static className() {
    return 'Cloud';
  }
  className() {
    return Cloud.className();
  }

  constructor(game) {
    super(game, 0, 0, game.spritesheetKey, 'cloud');
    this.anchor.setTo(0.5, 0.5);

    this.game.physics.arcade.enableBody(this);
    //kill sprite if it moves out of bounds of game screen
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
  }

  reset() {
    super.reset();

    this.setSizeFromWidth(this.game.dimen.width.cloud);
    this.setAtSidesOfScreen();
  }

  static touchedPlayer(player, cloud) {
    const game = player.game;

    cloud.kill();
    this.game.add.audio('cleanUp').play();

    //clean off all the poop splatters
    game.spritePools.getPool(PoopSplatter.className()).forEachAlive(function(splat) {
      splat.cleanUp();
    }, game);
  }

  getSpeed() {
    return this.game.speeds.cloud;
  }

}
