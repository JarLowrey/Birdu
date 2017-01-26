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
  Web REST guide : https://developers.google.com/games/services/web/api/snapshots/get
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
  static async authenticate(){
    gapi.load('client', GooglePlayGameServices._startGAPI);
  }

  static async _startGAPI(){
    //https://developers.google.com/api-client-library/javascript/start/start-js
    let tmp = gapi.client.init({
      'clientId': '109695933537-6ggk3lds5nqrs95d4e76rbd8difp9qgb.apps.googleusercontent.com',
      'scope': 'https://www.googleapis.com/auth/games https://www.googleapis.com/auth/drive.appdata', //games: acheivements, leaderboards, etc, drive.appdata: save backups
    });
    await tmp;
    let GoogleAuth = gapi.auth2.getAuthInstance();
    console.log('is signed in: '+ GoogleAuth.isSignedIn.get());

    GoogleAuth.signIn({
      'app_package_name': 'com.jtronlabs.birdu',
      'fetch_basic_profile': false,
      'prompt':'select_account'
    });

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
