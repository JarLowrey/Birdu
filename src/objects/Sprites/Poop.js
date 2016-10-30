/*
 * Poop
 */
import ExtendedSprite from '../Sprites/ExtendedSprite';
import PoopSplatter from '../Sprites/PoopSplatter';

export default class Poop extends ExtendedSprite {
  static className() {
    return 'Poop';
  }
  className() {
    return Poop.className();
  }

  constructor(game) {
    super(game, 0, 0, game.spritesheetKey, 'poo');
    this.anchor.setTo(0.5, 0.5);

    this.game.physics.arcade.enableBody(this);
    //kill sprite if it moves out of bounds of game screen
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
  }

  reset(x, y) {
    super.reset(x, y);
    var fart = this.game.add.audio('fart');
    fart.volume = this.game.integers.fartVolume;
    fart.play();

    this.body.allowGravity = true;
    this.body.gravity.y = 100;

    this.sendToBack();

    this.setSizeFromWidth(this.game.dimen.width.poop);
  }

  static touchedPlayer(player, poop) {
    const game = player.game;

    poop.kill();

    if (!game.player.invincible) {
      game.add.audio('splat').play();
      game.spritePools.spawn(PoopSplatter.className());
    }
  }

}
