/*
 * Menu state
 *
 * preceeds game state
 */
import Bird from '../objects/Sprites/Bird';

import DataAccess from '../objects/Helpers/DataAccess';
import FactoryUi from '../objects/Helpers/FactoryUi';

export default class Menu extends Phaser.State {

  create() {
    this.background = FactoryUi.displayBg(this.game);
    this.stateBtns = FactoryUi.createStateChangeButtons(this.game);

    //title of game text
    this.titleText = this.add.text(0, 0, 'B I R D U', this.game.fonts.title);
    this.titleText.anchor.setTo(0.5, 0.5);

    //main image/logo + its animationsphaser
    this.sprite = this.add.sprite(0, 0, this.game.spritesheetKey, Bird.birdFrameName(DataAccess.getConfig('playerFrame'), 1));
    this.sprite.width = this.game.dimen.width.menuSprite;
    this.sprite.scale.y = this.sprite.scale.x;
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.angle = -20;
    this.add.tween(this.sprite).to({
      angle: 20
    }, 1000, Phaser.Easing.Linear.NONE, true, 0, 1000, true);

    //start game's music
    this.game.bgMusic = this.add.audio('background_music');
    this.game.invincibleMusic = this.add.audio('background_music');
    this.game.bgMusic.loopFull();

    this.positionDisplayObjects();
  }

  sizeDisplayObjects() {
    this.sprite.height = Math.min(this.game.height * 0.5, this.sprite.height);
    this.sprite.scale.x = this.sprite.scale.y;

    this.stateBtns.height = Math.min(this.game.height * 0.25, this.stateBtns.height);
    this.stateBtns.scale.x = this.stateBtns.scale.y;

    this.titleText.height = Math.min(this.game.height * 0.25, this.titleText.height);
    this.titleText.scale.x = this.titleText.scale.y;
  }

  positionDisplayObjects() {
    this.sizeDisplayObjects();

    this.sprite.x = this.game.world.centerX;
    this.sprite.y = this.game.world.centerY;

    this.stateBtns.x = this.game.world.centerX;
    this.stateBtns.top = this.sprite.bottom;

    this.titleText.x = this.game.world.centerX;
    this.titleText.bottom = this.sprite.top; //must set after height is established
  }
}
