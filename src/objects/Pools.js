/*
 * Pools
 *
 * Sprite pools (recycling) go in this class. External classes may access thru this.game.spritePools (defined in Game state)
 */
import Enemy from '../objects/Sprites/Enemy';
import ScaredEnemy from '../objects/Sprites/ScaredEnemy';
import Bird from '../objects/Sprites/Bird';
import Star from '../objects/Sprites/Star';
import Cloud from '../objects/Sprites/Cloud';
import PoopSplatter from '../objects/Sprites/PoopSplatter';
import Poop from '../objects/Sprites/Poop';
import MovingScore from '../objects/Sprites/MovingScore';

export default class Pools {

  constructor(game) {
    this.game = game;

    //initialize pools
    this.pools = {};
    this.pools[Enemy.className()] = Enemy;
    this.pools[ScaredEnemy.className()] = ScaredEnemy;
    this.pools[Poop.className()] = Poop;
    this.pools[PoopSplatter.className()] = PoopSplatter;
    this.pools[Star.className()] = Star;
    this.pools[Cloud.className()] = Cloud;
    this.pools[MovingScore.className()] = MovingScore;

    //create the groups and reassign this.pools
    for (var className in this.pools) {
      const pool = this.game.add.group();
      pool.classType = this.pools[className];

      const prePopNum = (this.isEnemy(pool.classType)) ? 25 : 15;
      pool.createMultiple(prePopNum);

      this.pools[className] = pool;
    }

    this.game.world.bringToTop(this.getPool(PoopSplatter.className())); //ensure poop splatters stay in front of all other sprites
  }

  serialize() {
    var spritesIntoArray = [];

    for (var className in this.pools) {
      this.getPool(className).forEachAlive(function(sprite) {
        if (sprite.serialize) spritesIntoArray.push(sprite.serialize());
      });
    }

    return spritesIntoArray;
  }

  deserialize(savedInfo) {
    for (var i = 0; i < savedInfo.length; i++) {
      const savedSpriteInfo = savedInfo[i];

      const newSprite = this.spawn(savedSpriteInfo.className);
      newSprite.deserialize(savedSpriteInfo);
    }
  }

  getPool(className) {
    return this.pools[className];
  }
  spawn(className, x, y) {
    const sprite = this.getPool(className).getFirstDead(true);
    sprite.reset();

    if (x !== undefined) sprite.x = x;
    if (y !== undefined) sprite.y = y;

    return sprite;
  }
  spawnEnemy(level) {
    const probSpawnScared = Math.min(this.game.integers.spawnProbability.scared.max, level / 100 + this.game.integers.spawnProbability.scared.min);

    const className = (Math.random() < probSpawnScared) ? ScaredEnemy.className() : Enemy.className();

    this.spawn(className);
  }

  ratioEnemyAreaToGameArea() {
    const gameArea = this.game.width * this.game.height;

    //sum up the area of every living enemy in the pools
    var enemiesAreaSum = 0;
    this.iterateOverLivingEnemies(function(enemy) {
      enemiesAreaSum += enemy.area();
    });

    return enemiesAreaSum / gameArea;
  }

  collideAll() {
    const enemies = this.getPool(Enemy.className());
    const scaredEnemies = this.getPool(ScaredEnemy.className());

    //collide enemies with player
    this.game.physics.arcade.collide(this.game.player, enemies,
      this.game.state.states.Game.birdCollide, null, this.game.state.states.Game);
    this.game.physics.arcade.collide(this.game.player, scaredEnemies,
      this.game.state.states.Game.birdCollide, null, this.game.state.states.Game);

    //collide enemies with each other - removed as it makes it possible for enemies to change area as you chase (they run into others), resulting in frustrating deaths
    this.game.physics.arcade.collide(scaredEnemies, scaredEnemies, Bird.birdsCollide, null, this);
    this.game.physics.arcade.collide(enemies, enemies, Bird.birdsCollide, null, this);
    this.game.physics.arcade.collide(enemies, scaredEnemies, Bird.birdsCollide, null, this);

    //overlap powerups/powerdowns
    this.game.physics.arcade.overlap(this.game.player, this.getPool(Star.className()), Star.touchedPlayer, null, this);
    this.game.physics.arcade.overlap(this.game.player, this.getPool(Cloud.className()), Cloud.touchedPlayer, null, this);
    this.game.physics.arcade.overlap(this.game.player, this.getPool(Poop.className()), Poop.touchedPlayer, null, this);
  }

  isEnemy(someClass) {
    return Enemy == someClass || ScaredEnemy == someClass;
  }

  iterateOverLivingEnemies(functionPerEnemy) {
    for (var className in this.pools) {
      const pool = this.getPool(className);

      if (this.isEnemy(pool.classType)) {
        pool.forEachAlive(functionPerEnemy);
      }
    }
  }
}
