/*
 * Bird
 * contains properties common to all children sprites in this game
 */
import ExtendedSprite from '../Sprites/ExtendedSprite';
import DbAccess from '../Helpers/DbAccess';

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
    this.createAllPotentialAnimations();
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

      game.meat.showCrumbs(smallBird.x, smallBird.y, smallBird.width, smallBird.height);
      smallBird.fancyKill();
    }

    if (largeBird != game.player) {
      const angle = (largeBird.originalAngle === undefined) ? largeBird.angle : largeBird.originalAngle; //make adjustment for ScaredBird
      game.physics.arcade.velocityFromAngle(angle, largeBird.getSpeed(), largeBird.body.velocity);
    }
  }

  //don't override the default kill() method, as that will cause particles and effects to be rendered when enemies are killed offscreen
  async fancyKill() {
    super.kill();

    if (await DbAccess.getConfig('playerFrame') != this.frameId) {
      const numKills = await DbAccess.getConfig('kills');
      numKills[this.frameId]++;
      DbAccess.setConfig('kills', numKills); //TODO refactor out this slow storage access for cache access, save only once per game to slow storage
    }
  }

  static getFlyingFrames(spriteNum, game) {
    const numFrames = (game.animationInfo.twoFrameAnimations.includes(spriteNum)) ? 2 : 4;

    var frameNames = [];
    for (var i = 1; i <= numFrames; i++) {
      frameNames.push(Bird.birdFrameName(spriteNum, i));
    }

    return frameNames;
  }
  static birdFrameName(spriteNum, frameNum) {
    if (frameNum != undefined) {
      return 'b' + spriteNum + '-' + frameNum;
    } else {
      return 'b' + spriteNum;
    }
  }

  createAllPotentialAnimations() {
    for (var i = 0; i < this.game.animationInfo.maxBirdFrame; i++) {
      const animationFrames = Bird.getFlyingFrames(i, this.game);
      this.animations.add(Bird.birdFrameName(i), animationFrames, this.game.animationInfo.flapFPS * (animationFrames.length / 4), true);
    }
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
    this.animations.play(Bird.birdFrameName(this.frameId));
  }

}
