/*
 * ExtendedSprite
 *
 */

export default class ExtendedSprite extends Phaser.Sprite {
  static className() {
    return 'ExtendedSprite';
  }
  className() {
    return ExtendedSprite.className();
  }
  constructor(game, ...args) {
    super(game, ...args);
  }

  setLookingDirection(rotation) {
    this.angle = rotation;

    this.scale.y = (Math.abs(rotation) > 90) ? -Math.abs(this.scale.y) : Math.abs(this.scale.y);
  }

  area() {
    return Math.abs(this.width * this.height);
  }

  setSizeFromWidth(new_width) {
    this.width = new_width; //width is set by setting the 'x' scale under Phaser's hood
    this.scale.y = Math.abs(this.scale.x); //maintain aspect ratio

    this.setLookingDirection(this.angle); //set proper y sign

    if (this.body) {
      const scaledWidth = Math.abs(this.width / this.scale.x);
      const scaledHeight = Math.abs(this.height / this.scale.y);
      //const radius = Math.abs(Math.min(this.width / 2, this.height / 2));
      //this.body.setCircle(radius, (scaledWidth - radius) / 2, (scaledHeight - radius) / 2);

      const widthShrinkAmount = scaledWidth * this.game.integers.bodyShrink;
      const heightShrinkAmount = scaledHeight * this.game.integers.bodyShrink;
      this.body.setSize(scaledWidth - widthShrinkAmount, scaledHeight - heightShrinkAmount,
        widthShrinkAmount / 2, heightShrinkAmount / 2);

      this.body.mass = this.area() / this.game.originalPlayerArea;
    }
  }

  setAtSidesOfScreen() {
    const randSide = Math.random();
    const sideAngle = (randSide < 0.5) ? 0 : 180;
    this.setLookingDirection(sideAngle);

    //set position after orientation
    this.y = (this.game.world.height - Math.abs(this.height)) * Math.random() + Math.abs(this.height) / 2;
    this.x = (randSide < 0.5) ? -Math.abs(this.width / 2) : this.game.world.width;

    this.game.physics.arcade.velocityFromAngle(sideAngle, this.getSpeed(), this.body.velocity);

    this.originalAngle = sideAngle;
  }


  serialize() {
    const serializedInfo = {
      width: this.width,

      alpha: this.alpha,
      angle: this.angle,

      x: this.x,
      y: this.y,

      body: {
        velocity: {
          x: this.body.velocity.x,
          y: this.body.velocity.y
        }
      },

      className: this.className(),
      frame: this.frameName
    };

    return serializedInfo;
  }

  deserialize(info) {
    this.setSizeFromWidth(info.width);
    this.x = info.x;
    this.y = info.y;

    this.body.velocity.x = info.body.velocity.x;
    this.body.velocity.y = info.body.velocity.y;

    this.setLookingDirection(info.angle);
    this.alpha = info.alpha;
  }

  update() {
    if (!this.alive) return;
    //this.game.debug.body(this, 'rgba(255,0,0,0.5)');
  }


}
