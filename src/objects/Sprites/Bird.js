/*
 * Bird
 * contains properties common to all children sprites in this game
 */
import ExtendedSprite from '../Sprites/ExtendedSprite';
import DataAccess from '../Helpers/DataAccess';
import FactoryUi from '../Helpers/FactoryUi';

export default class Bird extends ExtendedSprite {
  static className() {
    return 'Bird';
  }
  className() {
    return Bird.className();
  }

  constructor(game) {
    super(game, 0, 0, game.spritesheetKey);

    this.game.physics.arcade.enableBody(this);

    //add an emitter to show little meat crumbs when this player eats something
    this.emitter = this.game.add.emitter(0, 0, this.game.integers.drumsticks.max * 2);
    this.emitter.makeParticles(this.game.spritesheetKey, 'meat');
    this.emitter.setRotation(-720, 720);
    this.emitter.setXSpeed(-this.game.speeds.drumsticks, this.game.speeds.drumsticks);
    this.emitter.setYSpeed(-this.game.speeds.drumsticks, 0);
    this.emitter.minParticleScale = FactoryUi.desiredImageScaleX(this.game, this.game.dimen.width.meat, 'meat');
    this.emitter.maxParticleScale = this.emitter.minParticleScale;

  }
  wiggle() {
    const wiggle = this.game.add.tween(this).to({
      angle: this.angle + 15
    }, 75, Phaser.Easing.Linear.In, false, 0, 1, true);
    wiggle.onComplete.add(function() {
      const myAngle = (this.originalAngle === undefined) ? this.angle : this.originalAngle;
      this.setLookingDirection(myAngle);
    }, this);

    wiggle.start();
  }

  update() {
    super.update();
    if (!this.alive) return;

    /*
      this.updateNum++;
      if (this.updateNum % 5 == 0) {
        //emitter particles fade out over time
        this.updateNum = 0;
        this.emitter.forEachAlive(function(p) {
          p.alpha = p.lifespan / this.lifespan;
        }, this.emitter);
      }
    */
  }

  static birdsCollide(birdOne, birdTwo) {
    var smallBird, largeBird, game = birdOne.game;

    if (birdOne.area() >= birdTwo.area()) { //birdOne will be the player (or an enemy), so give it the == benefit. When ==, birdOne is considered larger
      smallBird = birdTwo;
      largeBird = birdOne;
    } else {
      smallBird = birdOne;
      largeBird = birdTwo;
    }

    if (!smallBird.invincible) {
      //increase width by a portion of the eaten birds area
      const widthInc = Math.sqrt(smallBird.area()) * Phaser.Math.sign(largeBird.width) / 3.5;
      largeBird.setSizeFromWidth(widthInc + largeBird.width);
      largeBird.wiggle();

      smallBird.showCrumbs();
      smallBird.fancyKill();
    }

    if (largeBird != game.player) {
      const angle = (largeBird.originalAngle === undefined) ? largeBird.angle : largeBird.originalAngle; //make adjustment for ScaredBird
      game.physics.arcade.velocityFromAngle(angle, largeBird.getSpeed(), largeBird.body.velocity);
    }
  }

  showCrumbs() {
    this.emitter.width = Math.abs(this.width);
    this.emitter.height = Math.abs(this.height);
    this.emitter.y = this.y;
    this.emitter.x = this.x;

    this.emitter.start(true, this.game.durations.drumsticks.lifespan, null,
      Phaser.Math.between(this.game.integers.drumsticks.min, this.game.integers.drumsticks.max));
  }

  //don't override the default kill() method, as that will cause particles and effects to be rendered when enemies are killed offscreen
  fancyKill() {
    super.kill();

    if (DataAccess.getConfig('playerFrame') != this.frameId) {
      const numKills = DataAccess.getConfig('kills');
      numKills[this.frameId]++;
      DataAccess.setConfig('kills', numKills); //TODO refactor out this slow storage access for cache access, save only once per game to slow storage
    }
  }

  static getFlyingFrames(spriteNum, game) {
    const numFrames = (game.animationInfo.twoFrameAnimations.includes(spriteNum)) ? 2 : 4;

    var frameNames = [];
    for (var i = 1; i <= numFrames; i++) {
      frameNames.push('b' + spriteNum + '-' + i);
    }

    return frameNames;
  }

  setupAnimations() {
    //play that sprite's flapping animation
    const animationFrames = Bird.getFlyingFrames(this.frameId, this.game);
    this.animations.add('idling', animationFrames, this.game.animationInfo.flapFPS * (animationFrames.length / 4), true);
    this.animations.play('idling');
  }

  serialize() {
    const info = super.serialize();

    info.originalAngle = this.originalAngle;

    return info;
  }

  deserialize(info) {
    super.deserialize(info);

    this.originalAngle = info.originalAngle;

    const frameId = info.frame.split('-')[0].slice(1); //remove the 'b' prefix and everything after the '-'
    this.frameId = Number(frameId);
    this.setupAnimations();
  }

}
