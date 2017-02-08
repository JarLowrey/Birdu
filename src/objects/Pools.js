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

import GameData from '../objects/Helpers/GameData';

export default class Pools {

  constructor(game) {
    this.game = game;

    //initialize pools
    this.pools = {};
    this.pools[Enemy.className()] = {
      'class': Enemy,
      'count': 25
    };
    this.pools[ScaredEnemy.className()] = {
      'class': ScaredEnemy,
      'count': 20
    };
    this.pools[Poop.className()] = {
      'class': Poop,
      'count': 35
    };
    this.pools[PoopSplatter.className()] = {
      'class': PoopSplatter,
      'count': 7
    };
    this.pools[Star.className()] = {
      'class': Star,
      'count': 4
    };
    this.pools[Cloud.className()] = {
      'class': Cloud,
      'count': 15
    };
    this.pools[MovingScore.className()] = {
      'class': MovingScore,
      'count': 12
    };

    //create the groups and reassign this.pools
    for (var className in this.pools) {
      const newPool = this.game.add.group();
      const poolInfo = this.pools[className];

      newPool.classType = poolInfo['class'];
      newPool.createMultiple(poolInfo['count']);

      this.pools[className] = newPool;
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

  spawnEnemy() {
    const probSpawnScared = Math.min(this.game.integers.spawnProbability.scared.max, GameData.level / 100 + this.game.integers.spawnProbability.scared.min);

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
    this.game.physics.arcade.collide(GameData.player, enemies,
      this.game.state.states.Game.birdCollide, null, this.game.state.states.Game);
    this.game.physics.arcade.collide(GameData.player, scaredEnemies,
      this.game.state.states.Game.birdCollide, null, this.game.state.states.Game);

    //collide enemies with each other - removed as it makes it possible for enemies to change area as you chase (they run into others), resulting in frustrating deaths
    this.game.physics.arcade.collide(scaredEnemies, scaredEnemies, Bird.birdsCollide, null, this);
    this.game.physics.arcade.collide(enemies, enemies, Bird.birdsCollide, null, this);
    this.game.physics.arcade.collide(enemies, scaredEnemies, Bird.birdsCollide, null, this);

    //overlap powerups/powerdowns
    this.game.physics.arcade.overlap(GameData.player, this.getPool(Star.className()), Star.touchedPlayer, null, this);
    this.game.physics.arcade.overlap(GameData.player, this.getPool(Cloud.className()), Cloud.touchedPlayer, null, this);
    this.game.physics.arcade.overlap(GameData.player, this.getPool(Poop.className()), Poop.touchedPlayer, null, this);
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
