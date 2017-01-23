/*
 * Meat
 * Handles the emission of meat particles
 */
import FactoryUi from '../Helpers/FactoryUi';

export default class Meat {

  constructor(game) {
    this.game = game;

    //add an emitter to show little meat crumbs when this player eats something
    this.emitter = this.game.add.emitter(0, 0, this.game.integers.drumsticks.max * 7);
    this.emitter.makeParticles(this.game.spritesheetKey, 'meat');
    this.emitter.setRotation(-720, 720);
    this.emitter.setXSpeed(-this.game.speeds.drumsticks, this.game.speeds.drumsticks);
    this.emitter.setYSpeed(-this.game.speeds.drumsticks, 0);
    this.emitter.minParticleScale = FactoryUi.desiredImageScaleX(this.game, this.game.dimen.width.meat, 'meat');
    this.emitter.maxParticleScale = this.emitter.minParticleScale;
  }

  showCrumbs(x,y,width,height) {
    this.emitter.width = Math.abs(width);
    this.emitter.height = Math.abs(height);
    this.emitter.y = y;
    this.emitter.x = x;

    this.emitter.start(true, this.game.durations.drumsticks.lifespan, null,
      Phaser.Math.between(this.game.integers.drumsticks.min, this.game.integers.drumsticks.max));
  }


}
