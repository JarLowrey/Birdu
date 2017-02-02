/* global gapi */

/*
 * GooglePlayAcheivements
 *
 */
/*
Setup google play game services account in google play dev console
add/amend authorized origin (http://localhost:3000) +redirect URLs in Google API manager  and - https://console.developers.google.com
add google subdomains to cordova's config.xml whitelist
do not mangle index.html, as the callback is separated from html meta tag

Resources:
 Client Setup : https://developers.google.com/games/services/web/clientsetup
 Web REST guide : https://developers.google.com/games/services/web/api/
 Authentication guide : https://developers.google.com/api-client-library/javascript/features/authentication
                       https://developers.google.com/identity/protocols/OAuth2UserAgent
                       https://developers.google.com/identity/protocols/OAuth2WebServer#incrementalAuth
                       https://developers.google.com/oauthplayground/
 Accessing GAPIs with CORS : https://developers.google.com/api-client-library/javascript/features/cors
*/

export default class GooglePlayGameServices {
  /*
    //callback from google sign in button
    static signed_in(auth){
      console.log('logged in');
      if (auth && auth.error == null) {
        // Hooray! The user is logged int!
        // If we got here from a sign-in button, we should probably hide it
        //hideMyGamesSignInButton();
        //loadLeaderboardsAndAchievements();
      } else {
        // Common reasons are immediate_failed and user_signed_out
        if (auth && auth.hasOwnProperty('error')) {
          console.log('Sign in failed because: ', auth.error);
        }
        //showMyGamesSignInButton();
      }
    }
  */
  //use gapi
  //https://developers.google.com/api-client-library/javascript/start/start-js
  static authenticate() {
    GooglePlayGameServices.scopes = 'https://www.googleapis.com/auth/games https://www.googleapis.com/auth/drive.appdata';
    GooglePlayGameServices.clientId = '109695933537-6ggk3lds5nqrs95d4e76rbd8difp9qgb.apps.googleusercontent.com';
    gapi.load('client', GooglePlayGameServices._startGAPI);
    /*
        if (window.cordova) {
          GooglePlayGameServices._googleCordovaPluginSilentLogin();
        } else {
          gapi.load('client', GooglePlayGameServices._startGAPI);
        }
        */
  }

  static _googleCordovaPluginSilentLogin() {
    window.plugins.googleplus.trySilentLogin({
        'scopes': GooglePlayGameServices.scopes, // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': GooglePlayGameServices.clientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true, // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
      },
      GooglePlayGameServices.successfulLogin,
      function(error) {
        if (error === 4) {
          GooglePlayGameServices._googleCordovaPluginLogin();
        } else {
          console.log('error: ');
          console.log(error);
        }
      }
    );
  }
  static _googleCordovaPluginLogin() {
    window.plugins.googleplus.login({
        'scopes': GooglePlayGameServices.scopes, // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': GooglePlayGameServices.clientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true, // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
      },
      GooglePlayGameServices.successfulLogin,
      function(error) {
        console.log('error: ');
        console.log(error);
      }
    );
  }

  static successfulLogin(obj) {
    GooglePlayGameServices.getAcheivementsREST();
    console.log(obj);
  }

  static async _startGAPI() {
    //https://developers.google.com/api-client-library/javascript/start/start-js
    let initPromie = gapi.client.init({
      'apiKey': 'AIzaSyCSQd81S1Tg89oPL33Cd3YaTFIBz2RGqsE',
      'clientId': GooglePlayGameServices.clientId,
      'scope': GooglePlayGameServices.scopes, //games: acheivements, leaderboards, etc, drive.appdata: save backups
    });
    await initPromie;
    let GoogleAuth = gapi.auth2.getAuthInstance();
    //console.log('is signed in: '+ GoogleAuth.isSignedIn.get());

    let signInPromise = GoogleAuth.signIn({
      'app_package_name': 'com.jtronlabs.birdu',
      'fetch_basic_profile': false,
      'prompt': 'select_account'
    });
    await signInPromise;
    //Yay! Signed in!
    GooglePlayGameServices.successfulLogin();
  }

  static async getAcheivementsREST() {
    let a = gapi.client.request({
      'path': 'https://www.googleapis.com/games/v1/achievements',
      'method': 'GET',
    });
    await a;
    console.log(a);





    //setup request
    var req = new XMLHttpRequest();
    req.open('GET', 'https://www.googleapis.com/games/v1/achievements', true);

    //setup request completion functions
    req.onload = function(e) {
      console.log(req);
      console.log('LOGGED GET ACHEIVEMENTS');

      if (req.readyState == 4) { //readyState = DONE - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
        if (req.status == 200) {
          console.log(req.response);
        } else {
          console.log('status =' + req.status);
        }
      }

    };

    //send request!
    req.send(null);

  }

  static updateAcheivementsREST() {
    //setup request
    var req = new XMLHttpRequest();
    req.open('POST', 'https://www.googleapis.com/games/v1/achievements/updateMultiple', true);
    req.setRequestHeader('Content-Type', 'application/json');

    //req.withCredentials = true; //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
    //setup request completion functions
    req.onload = function(e) {
      /*
      if (req.readyState == 4) { //readyState = DONE - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
        if (req.status == 200) {
          console.log(req.response);
        } else {
          console.log('status =' + req.status);
        }
      }
      */
    };

    //send request!
    req.send(JSON.stringify({
      'kind': 'games#achievementUpdateMultipleRequest',
      'updates': [{
        'kind': 'games#achievementUpdateRequest',
        'achievementId': 'CgkI4biM05gDEAIQAg',
        'updateType': 'UNLOCK'
      }]
    }));
  }
  /*
  //use oauth2 directly
    static authenticate(){
      var req = new XMLHttpRequest();
      req.open('GET', GooglePlayGameServices._getAuthReq(), true);
      //req.withCredentials = true; //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
      req.onreadystatechange = function (e) {
        if (req.readyState == 4) { //readyState = DONE - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
          if(req.status == 200){
            console.log(req.response);
          }
          else {
            console.log('status =' + req.status);
          }
        }
      };
      req.send(null);
    }

    static _getAuthReq(){
      return 'https://accounts.google.com/o/oauth2/v2/auth'
        + '?'
        + 'response_type=token'
        + '&'
        //read the scopes required on the Web REST guide - https://developers.google.com/games/services/web/api/snapshots/get
        //see all Google APIs at API Explorer - https://developers.google.com/apis-explorer/#p/
        + 'scope='                                                //space demlited string (%20's)
        + 'https://www.googleapis.com/auth/games'                 //acheivements, leaderboards, etc
        + '%20' +'https://www.googleapis.com/auth/drive.appdata'  //save game backups
        + '&'
        + 'include_granted_scopes=true' //incremental Authentication - https://developers.google.com/identity/protocols/OAuth2WebServer#incrementalAuth - not using now but may later, so including it
        + '&'
        //setup in google play dev console when registering a game for game services
        + 'client_id='
        + '109695933537-6ggk3lds5nqrs95d4e76rbd8difp9qgb.apps.googleusercontent.com'
        + '&'
        //Launch URL configured in Google Play Dev Console > Game Services > your Web app - https://play.google.com
        //potential redirect URI's setup in API dev console - https://console.developers.google.com
        + 'redirect_uri='
        + 'http://localhost/oauth2callback';
    }
  */
}
