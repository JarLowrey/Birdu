/*
 * FactoryUi
 *
 * create reusable UI components
 */

export default class FactoryUi {

  static createStateChangeButtons(game) {
    const btnLen = game.dimen.len.menuBtn;
    const margin = game.dimen.margin.menuBtn;

    var stateBtns = new Phaser.Group(game);

    var fightBtn = new Phaser.Button(game, 0, 0, game.spritesheetKey, function() {
      game.state.start('Game');
    }, this, 'fightPressed', 'fight', 'fightPressed', 'fight');

    var settingsBtn = new Phaser.Button(game, 0, 0, game.spritesheetKey, function() {
      game.state.start('Settings');
    }, this, 'settingsPressed', 'settings', 'settingsPressed', 'settings');

    var statsBtn = new Phaser.Button(game, 0, 0, game.spritesheetKey, function() {
      game.state.start('Stats');
    }, this, 'statsPressed', 'stats', 'statsPressed', 'stats');

    fightBtn.anchor.setTo(0.5, 0.5);
    settingsBtn.anchor.setTo(0.5, 0.5);
    statsBtn.anchor.setTo(0.5, 0.5);

    //set buttons size
    fightBtn.width = btnLen;
    fightBtn.height = btnLen;
    settingsBtn.width = btnLen * 0.75;
    settingsBtn.height = btnLen * 0.75;
    statsBtn.width = btnLen * 0.75;
    statsBtn.height = btnLen * 0.75;

    //set buttons positioning relative to one another
    fightBtn.x = 0;
    fightBtn.y = 0;
    settingsBtn.right = fightBtn.left - margin * 2;
    settingsBtn.y = fightBtn.y;
    statsBtn.left = fightBtn.right + margin * 2;
    statsBtn.y = fightBtn.y;

    stateBtns.addChild(fightBtn);
    stateBtns.addChild(settingsBtn);
    stateBtns.addChild(statsBtn);

    stateBtns.settings = settingsBtn;
    stateBtns.stats = statsBtn;
    stateBtns.play = fightBtn;

    return stateBtns;
  }

  static medalLevel(game, score) {
    return Phaser.Math.clamp(Math.floor(score / game.integers.medals.scoreForLevelUp), game.integers.medals.min, game.integers.medals.max);
  }

  static desiredImageScaleX(game, desiredWidth, frameName, parent) {
    const parentScale = (parent) ? Math.abs(parent.scale.x) : 1;
    return desiredWidth / game.cache.getFrameByName(game.spritesheetKey, frameName).width / parentScale;
  }

  static createMedal(game, medalLevel) {
    const medalImgId = Phaser.Math.clamp(medalLevel - 1, game.integers.medals.min, game.integers.medals.max);
    var medal = game.add.image(0, 0, game.spritesheetKey, 'shaded_medal' + medalImgId);

    medal.anchor.setTo(0.5, 0.5);
    medal.height = game.dimen.height.medal;
    medal.scale.x = medal.scale.y;

    if (medalLevel > 0) {
      FactoryUi.addSparkles(medal);
    } else {
      medal.tint = 0x000000;
      medal.alpha = 0.25;
    }

    return medal;
  }

  static displayBg(game) {
    var background = game.add.sprite(0, 0, 'background');
    background.height = game.world.height;
    background.width = game.world.width;

    return background;
  }

  static addSparkles(sprite) {
    var game = sprite.game;

    //add an emitter to show little sparkles on the medal
    var sparkler = game.add.emitter(0, 0, 4);
    sparkler.particleAnchor.setTo(0.5, 0.5);
    sparkler.gravity = 0;
    sparkler.makeParticles(game.spritesheetKey, 'sparkle');
    sparkler.alpha = 0.65;
    sparkler.setXSpeed(-game.speeds.sparkle, game.speeds.sparkle);
    sparkler.setYSpeed(-game.speeds.sparkle, game.speeds.sparkle);
    sparkler.minParticleScale = FactoryUi.desiredImageScaleX(game, game.dimen.len.sparkle, 'sparkle', sprite);
    sparkler.maxParticleScale = sparkler.minParticleScale;
    sparkler.maxRotation = 25;
    sparkler.minRotation = -25;
    sparkler.width = sprite.width / sprite.scale.x;
    sparkler.height = sprite.height / 2 / sprite.scale.y;
    sprite.addChild(sparkler);

    sparkler.flow(game.durations.sparkle * (1 + Math.random()) * 2, game.durations.sparkle * (1 + Math.random()), 1);
  }

  static getBgGraphic(game, width = 1, height = 1, radius = game.dimen.radius.bgGraphic) {
    var graphic = game.add.graphics();
    graphic.anchor.setTo(0.5, 0.5);

    //outline
    graphic.lineStyle(game.dimen.len.bgGraphicStroke, game.colors.bgGraphicStroke, 1);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, radius);

    graphic.beginFill(game.colors.bgGraphicFill);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, radius);
    graphic.endFill();

    return graphic;
  }

}
