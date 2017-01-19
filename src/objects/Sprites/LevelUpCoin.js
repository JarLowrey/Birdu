/*
 * LevelUpCoin
 *
 * flies to the player and applies a levelup upon collision
 */
import ExtendedSprite from '../Sprites/ExtendedSprite';

export default class LevelUpCoin extends ExtendedSprite {

  static className() {
    return 'LevelUpCoin';
  }
  className() {
    return LevelUpCoin.className();
  }
  constructor(game) {
    super(game, 0, 0, game.spritesheetKey, 'coin');

    this.width = this.game.dimen.len.levelupCoin;
    this.scale.y = this.scale.x;

    this.anchor.setTo(0.5, 0.5);

    this.visible = false;

    this.game.physics.arcade.enableBody(this);

    this.speed = this.game.world.height / this.game.durations.coinTravelSeconds; //height pixels in X seconds

    this._resetPos();
  }

  _resetPos() {
    this.x = this.game.world.centerX;
    this.bottom = 0;
  }

  update() {
    if (!this.alive) return;

    if (this.visible) {
      this.game.physics.arcade.moveToObject(this, this.game.player, this.speed);
      this.game.physics.arcade.overlap(this.game.player, this, this.coinReachedPlayer, null, this);
    }
  }

  coinReachedPlayer() {
    //reset the coin in its default position, and make it stop moving
    this.visible = false;
    this.body.velocity.setTo(0, 0);
    this._resetPos();

    this.game.add.audio('levelup').play();

    //update player's size, sprite, speed, etc as necessary
    this.game.player.setSizeFromWidth(this.game.dimen.width.playerOriginal);
    this.game.state.states.Game.pieProgress.setText(this.game.state.states.Game.level);
  }
}
