/*
 * `app` module
 * ============
 *
 * Provides the game initialization routine.
 */

// Required: import the Babel runtime module.
import 'babel-polyfill';

// Import game states.
import * as states from './states';

//import play services handling
//import GooglePlayGameServices from './GooglePlayGameServices';

export function registerGame() {
  const runningCordova = !!window.cordova;
  if (runningCordova) {
    document.addEventListener('deviceready', init);
  } else {
    init();
  }
}

function init() {
  const game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO);

  // Dynamically add all required game states.
  Object
    .entries(states)
    .forEach(([key, state]) => game.state.add(key, state));

  registerCordovaEvents(game);
  //GooglePlayGameServices.authenticate();

  game.state.start('Boot');

  return game;
}

function registerCordovaEvents(game) {
  //define CordovaApp events here so they can have access the the 'game' object when called
  document.addEventListener('pause',
    function() {
      if (game.bgMusic) game.bgMusic.pause();
      if (game.state.current == 'Game') game.state.states.Game.pauseGame();
    },
    false);
  document.addEventListener('resume',
    function() {
      if (game.bgMusic) game.bgMusic.resume();
    },
    false);
}

/*
export function google_signin_callback(auth){
  console.log('window.app.google_play_signed_in called')
  GooglePlayGameServices.signed_in(auth);
}
*/
