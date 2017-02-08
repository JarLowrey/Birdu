/*
 * Poop
 */
import ExtendedSprite from '../Sprites/ExtendedSprite';
import GameData from '../Helpers/GameData';

export default class PoopSplatter extends ExtendedSprite {
  static className() {
    return 'PoopSplatter';
  }
  className() {
    return PoopSplatter.className();
  }

  constructor(game) {
    super(game, 0, 0, game.spritesheetKey, PoopSplatter.getRandomSplatterFrame(game));
    this.anchor.setTo(0.5, 0.5);

    //show tweens to make the splatter disappear
    this.disappearTween = this.game.add.tween(this).to({
      alpha: 0
    }, this.game.durations.splatter.fade, Phaser.Easing.Quadratic.Out);

    //kill once tweens are complete
    this.disappearTween.onComplete.add(function() {
      this.kill();
    }, this);
  }

  reset() {
    super.reset();

    this.angle = Math.random() * 180;
    this.tint = this.game.colors.poop[Phaser.Math.between(0, this.game.colors.poop.length - 1)];
    this.alpha = GameData.floatBetween(this.game.integers.splatter.alpha.min, this.game.integers.splatter.alpha.max);

    //set size and position
    const splatWidth = this.game.width * GameData.floatBetween(this.game.dimen.width.poopSplatter.min, this.game.dimen.width.poopSplatter.max);
    this.setSizeFromWidth(splatWidth);
    this.x = Math.random() * (this.game.world.width - Math.abs(this.width)) + Math.abs(this.width) / 2;
    this.y = Math.random() * (this.game.world.height - Math.abs(this.height)) + Math.abs(this.height) / 2;

    //make splatter disappear after a set amount of time
    this.game.time.events.add(this.game.durations.splatter.lifespan, this.cleanUp, this);
  }

  cleanUp() {
    this.disappearTween.start();
  }

  static getRandomSplatterFrame(game) {
    const frames = game.animationInfo.poopSplatterFrameNames;
    return frames[Phaser.Math.between(0, frames.length - 1)];
  }

}
