/*
 * MovingScore
 *
 * Flies up to the scoreLabel, increments game score, and disappears
 */

export default class MovingScore extends Phaser.Text {
  static className() {
    return 'MovingScore';
  }
  className() {
    return MovingScore.className();
  }

  constructor(game) {
    super(game);
    this.anchor.setTo(0.5, 0);
  }

  reset() {
    super.reset();

    let player = this.game.data.play.player;
    this.x = player.x;
    this.y = player.y;
  }

  startMovement(score, scoreLabel,
    initialText = score.toLocaleString(), initialFont = this.game.fonts.score_animating,
    movementDuration = 700, growDuration = 400) {
    this.score = score;
    this.setText(initialText);
    this.setStyle(initialFont);
    this.padding.setTo(initialFont.padding.x, initialFont.padding.y);

    //only create the tween once
    if (!this.growTween) {
      //Tween this score label to the total score label
      this.movementTween = this.game.add.tween(this)
        .to({
          x: scoreLabel.x,
          y: scoreLabel.y
        }, movementDuration, Phaser.Easing.Exponential.In);

      //grow & shrink tween before beginning movement
      this.growTween = this.game.add.tween(this.scale).to({
        x: 1.5,
        y: 1.5
      }, growDuration / 2, Phaser.Easing.Linear.In).to({
        x: 1,
        y: 1
      }, growDuration / 2, Phaser.Easing.Linear.In);

      //show a grow/shrink animation, change text if needed and start movement
      this.growTween.onComplete.add(function() {
        this.setText(this.score.toLocaleString());

        const scoreFont = this.game.fonts.score_animating;
        this.setStyle(scoreFont);
        this.padding.setTo(scoreFont.padding.x, scoreFont.padding.y);

        this.movementTween.start();
      }, this);

      //When the animation finishes, destroy this score label, trigger the total score labels animation and add the score
      this.movementTween.onComplete.add(function() {
        this.kill();
        this.game.state.states.Game.updateScoreFromBuffer(this.score);
      }, this);
    }

    this.growTween.start();
  }

}
