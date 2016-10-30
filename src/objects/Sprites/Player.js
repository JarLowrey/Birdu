/*
 * Player
 * ====
 * Main Player
 */
import Bird from '../Sprites/Bird';

import DataAccess from '../Helpers/DataAccess';

export default class Player extends Bird {
  static className() {
    return 'Player';
  }
  className() {
    return Player.className();
  }

  constructor(game) {
    super(game);

    this.drag_value = 70;
    this.grav_value = this.drag_value + 30;
    this.prev_pointer = new Phaser.Point(0, 0);
    this.no_movement = 10;
    this.invincible = false;
    this.updateNum = 0;

    this.anchor.setTo(0.5, 0.5);

    // add animations + tweens specific for this sprite, and and play them if needed
    this.frameId = DataAccess.getConfig('playerFrame');
    this.animations.add('idling', Bird.getFlyingFrames(this.frameId, this.game), this.game.animationInfo.flapFPS, true);
    this.animations.play('idling');

    //set size and position
    this.setSizeFromWidth(this.game.dimen.width.playerOriginal);
    this.game.originalPlayerArea = this.area();
    this.setSizeFromWidth(this.game.dimen.width.playerOriginal); //function relies on this.game.originalPlayerArea to set mass

    this.position.setTo(game.world.centerX, game.world.centerY);

    // Bird PHYSICS. We want him to emulate the sky. So he will have to glide a bit before stopping, and will have gravity
    this.body.allowGravity = true;
    this.body.gravity.y = this.grav_value;
    this.body.collideWorldBounds = true;
    this.body.bounce.set(0.4);
    this.body.drag.setTo(this.drag_value, this.drag_value);

    this.invincibleIndicator = this.game.time.create(false);
    //flash different colors while invincible
    this.invincibleIndicator.loop(this.game.durations.invincibilityFlash, function() {
      this.tint = (this.tint == 0xffffff) ? this.game.colors.invincibilityFlash : 0xffffff;
    }, this);
    this.invincibleIndicator.start();
    this.invincibleIndicator.pause();

    this.invincibleJingle = this.game.add.audio('invincible');
  }

  deserialize(info) {
    super.deserialize(info);

    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  makeInvincible() {
    this.invincible = true;
    if (!this.game.bgMusic.paused) this.game.bgMusic.pause();

    this.invincibleIndicator.resume();

    this.invincibleJingle.restart();
    this.invincibleJingle.onStop.add(function() {
      this.invincible = false;

      this.game.bgMusic.resume();

      this.invincibleIndicator.pause();
      this.tint = 0xffffff;
    }, this);
  }

  update() {
    super.update();
    if (!this.alive) return;

    this.move();
  }

  wiggle() {
    if (!this.goTowardsLastActivePointer) {
      super.wiggle();
    }
  }

  /*
    setSizeFromWidth(newWidth) {
      super.setSizeFromWidth(newWidth);

      //make growth look larger than it is by tweening up bigger, and returning to proper size
      const growShrink = this.game.add.tween(this.scale).to({
        x: this.scale.x * 1.25,
        y: this.scale.y * 1.25
      }, 75, Phaser.Easing.Linear.In).to({
        x: this.scale.x,
        y: this.scale.y
      }, 75, Phaser.Easing.Linear.In);
      growShrink.start();
    }
    */

  fancyKill() {
    super.fancyKill();

    DataAccess.setConfig('sprites', []);
    DataAccess.setConfig('player', null);

    this.game.spritePools.iterateOverLivingEnemies(function(child) {
      child.gloat();
    });

    navigator.vibrate(this.game.durations.vibrations.death);

    //play sounds signifying gameover
    var bite = this.game.add.audio('bite_scary');
    bite.onStop.add(function() {
      this.game.add.audio('tweet').play();
    }, this);
    bite.play();

    //start gameover state after a delay
    this.game.time.events.add(this.game.durations.gloating,
      function() {
        this.game.state.start('Gameover');
      },
      this, true);
  }

  static birdsCollide(player, enemy) {
    var game = player.game;
    //kills the smaller bird
    Bird.birdsCollide(player, enemy);

    if (player.alive && !enemy.alive) {
      navigator.vibrate(game.durations.vibrations.eat);
      game.camera.shake(game.integers.screenShakeIntensity, game.integers.screenShakeDuration);
      game.add.audio('bite_friendly').play();
    }
  }


  move() {
    this.animations.getAnimation('idling').speed = this.game.animationInfo.flapFPS * 2;
    var playerSpd = this.getSpeed();
    const distToPointer = Phaser.Point.distance(this, this.prev_pointer);

    //detect mouse/tap clicks, and update player's desired destination
    if (this.game.input.activePointer.isDown) {
      this.prev_pointer.x = this.game.input.activePointer.x;
      this.prev_pointer.y = this.game.input.activePointer.y;

      this.goTowardsLastActivePointer = true;
    }

    //move player towards his desired destination (if he has one made from a click/tap), and turn it off when he reaches it
    if (this.goTowardsLastActivePointer) {
      const rads = Phaser.Math.angleBetweenPoints(this, this.prev_pointer);
      const angle = Phaser.Math.radToDeg(rads);
      this.setLookingDirection(angle);

      if (distToPointer < this.width / 5) {
        this.goTowardsLastActivePointer = false; //don't move towards last click's position anymore, you've reached it!
      }

      const slowDownDist = this.width / 2;
      playerSpd = Phaser.Math.linear(0, playerSpd, Math.min(slowDownDist, distToPointer) / slowDownDist);

      this.game.physics.arcade.velocityFromAngle(angle, playerSpd, this.body.velocity);
    }
    //NOT MOVING
    else {
      this.animations.getAnimation('idling').speed = this.game.animationInfo.flapFPS; //slow down wing flaps
      this.body.gravity.y = this.grav_value; //restart gravity

      this.stabilizeRotationWhenStill();
    }
  }

  stabilizeRotationWhenStill() {
    const absRot = Math.abs(this.body.rotation);
    const rotationDir = (absRot > 90) ? 1 : -1;
    const rotationDelta = (absRot < 180 && absRot > 0) ? rotationDir * Phaser.Math.sign(this.body.rotation) : 0;
    this.body.rotation += rotationDelta;
  }

  getSpeed() {
    return this.game.scaleMultipler(this.game.speeds.player, false);
  }

  levelupArea() {
    const multiplier = this.game.scaleMultipler(this.game.integers.area.levelup, false);
    return this.game.originalPlayerArea * multiplier;
  }
}
