import { Splashscreen, GoogleAnalytics } from 'ionic-native';
import { AppSettings } from '../config/app-settings';
import { EventEmitter, Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular/components/toast/toast';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { Platform } from 'ionic-angular';
import { WebAdapterRequestConfig } from '../models/web-adapter-request-config';

declare var cordova;

@Injectable()
export class LoginProvider {
  private static SECURITY_CHECK_NAME = "UserLogin";
  private static EMPTY_USER: LoginUser = {
    logged: false,
    id: "",
    password: "",
    idPartner: "",
    displayName: "",
    offline: false,
    //OTHER USER INFO
    lang: "E",
    authorizationGroup: "",
    lastSync: ""
  };
  public user: LoginUser = LoginProvider.EMPTY_USER;

  private authHandler: any;
  private inChallange: boolean = false;

  private initResolve;
  private initResolveResponse = null;
  private triedStoredLogin = false;

  public userChangeEmitter: EventEmitter<LoginUser> = new EventEmitter<any>();
  public handleFailureEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(private storage: Storage, 
              private translate: TranslateService, 
              public toastCtrl: ToastController, 
              private googleAnalytics: GoogleAnalytics,
              public platform: Platform) {

  }

  init(): Promise<LoginUser> {
    return new Promise((resolve, reject) => {
      this.initResolve = resolve;
      this.authHandler = WL.Client.createSecurityCheckChallengeHandler(LoginProvider.SECURITY_CHECK_NAME);
      this.authHandler.handleChallenge = (challenge) => {
        console.log("authHandler.handleChallenge");

        this.inChallange = true;
        if (!this.triedStoredLogin) {
          this.triedStoredLogin = true;
          this.tryStoredLogin();
        } else {
          if (!this.tryCallInitResolve()) {
            ///Error de autenticación cuando la app ya esta inicializada. Si entro en su momento logged borramos el usuario y refrescamos la pantalla. En caso contrario es un error de login
            if (this.initResolveResponse.logged) {
              if (this.user.offline) { //o estaba funcionando offline (reabrimos la app para que empice a funcionar online)
                this.translate.get('RestoreConnection').subscribe(
                  restoreConnection => {
                    this.reloadApp(restoreConnection);
                  });
              } else { //Se ha finalizado la sesion con el servidor (la intentamos restablecer).
                this.tryStoredLogin();
              }
            } else {
              //login error
            }
          }
        }
        if (challenge.errorMsg) {
          this.translate.get('InvalidCredentials').subscribe(invalidCredentials => {
            this.handleFailureEmitter.emit(challenge.errorMsg == "KO" ? invalidCredentials : challenge.errorMsg);
          });
        }
      };
      this.authHandler.handleFailure = (error) => {
        console.log("authHandler.handleFailure");
        this.inChallange = false;
        this.clearUser();
        error = error && error.responseJSON && error.responseJSON.errorMsg ? error.responseJSON.errorMsg : error;
        error = error && error.failure ? error.failure : error;
        error = error && error.errorMsg ? error.errorMsg : error;
        this.translate.get('InvalidCredentials').subscribe(invalidCredentials => {
          error = error == "KO" ? invalidCredentials : error;
        });
        this.handleFailureEmitter.emit(error);
      };

      let finishHandleSuccess = (data) => {
        this.user.logged = true;
        this.user.id = data.user.id;
        this.user.displayName = data.user.displayName;
        this.user.offline = false;
          this.setStoredUser(this.user)
            .then(() => {
              if (!this.tryCallInitResolve()) {
                this.translate.get('LogIn').subscribe(logIn => {
                  this.reloadApp(logIn);
                });
              }
            });
        GoogleAnalytics.setUserId(this.user.id)
          .then(() => { console.log('Google analytics setUserId'); })
          .catch(e => console.log('Error setUserId GoogleAnalytics', e));
      }

      this.authHandler.handleSuccess = (data) => {
        //data ej:
        /*attributes: {}
        authenticatedAt: 1493995261070
        authenticatedBy: "UserLogin"
        displayName: "MMM"
        id: "MMM"*/
        console.log("handleSuccess");
        this.inChallange = false;

        if (!this.user.logged || this.user.id != data.user.id || this.user.offline) {
          if (!this.triedStoredLogin) {
            this.triedStoredLogin = true;
            this.getStoredUser().then((user: LoginUser) => {
              if (user) {
                this.user = user;
              }
              finishHandleSuccess(data);
            });
          } else {
            finishHandleSuccess(data);
          }
        } else {
          this.setStoredUser(this.user)
          this.tryCallInitResolve();
        }


      }
      this.obtainAccessToken().then(() => { //Alredy Logged
        console.log("obtainAccessToken ok");
        this.forceStoredUser(false);
      }, () => {
        console.log("obtainAccessToken catch");
        //Offline
        this.forceStoredUser(true);
      });

      if (
        (
          !AppSettings.REQUIRE_LOGIN_BROWSER &&
          (this.platform.is('mobileweb') || this.platform.is('windows') || this.platform.is('core') || cordova.platformId == "browser")
        ) || (
          !AppSettings.REQUIRE_LOGIN_IOS && cordova.platformId != "browser" &&
          (this.platform.is('ios'))
        )
      ) {
        this.user.logged = true;
        this.user.id = "JDF";
        this.user.displayName = this.user.id + " Emulated";
        this.tryCallInitResolve();
      }
    });

  }

  private reloadApp(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    }).present();
    Splashscreen.show();
    window.location.reload();
  }

  private forceStoredUser(offline: boolean) {
    console.log("forceStoredUser...");
    this.getStoredUser().then((user: LoginUser) => {
      console.log("forceStoredUser: " + JSON.stringify(user));
      if (typeof user != "undefined" && user != null && user.logged) {
        this.user.offline = offline;
        if (offline) {
          this.translate.get('WorkOffline').subscribe(
            WorkOffline => {
              this.toastCtrl.create({

                message: WorkOffline,
                duration: 3000,
                position: 'bottom'
              }).present();
            });
        }
        this.user = user;
      }
      this.tryCallInitResolve();
    });
  }

  private tryStoredLogin() {
    console.log("tryStoredLogin...");
    this.getStoredUser().then((user: LoginUser) => {
      if (typeof user != "undefined" && user != null && user.logged && user.password) {
        this.setStoredUser(LoginProvider.EMPTY_USER);
        this.login(user.id, user.password, true);
      } else {
        this.tryCallInitResolve();
      }
    }).catch((e) => {
      console.log("Error tryStoredLogin", e);
    });
  }

  private tryCallInitResolve() {
    console.log("tryCallInitResolve...");
    if (typeof this.initResolve != "undefined") {
      let fn = this.initResolve;
      this.initResolve = undefined;
      this.initResolveResponse = this.user;
      fn(this.user);
      return true;
    } else {
      return false;
    }
  }

  private getStoredUser(): Promise<LoginUser> {
    console.log("getStoredUser...");
    return this.storage.get("USER");
  }

  private setStoredUser(user: LoginUser): Promise<LoginUser> {
    console.log("setStoredUser..." + JSON.stringify(user));
    return this.storage.set("USER", user)
      .then(() => {
        this.userChangeEmitter.emit(user);
        return user;
      });

  }

  /*
  * Restablecer el usuario que ha iniciado sesión en memoria persistente (para cuando se ejecutan storage.clear pero no se quiere borrar la info del usuario)
  */
  public setCurrentStoredUser(): Promise<LoginUser> {
    return this.setStoredUser(this.user);
  }

  obtainAccessToken() {
    console.log("obtainAccessToken...");
    return WL.AuthorizationManager.obtainAccessToken(LoginProvider.SECURITY_CHECK_NAME);
  }


  login(username: string, password: string, rememberMe?: boolean) {
    console.log("login...");
    //// https://mobilefirstplatform.ibmcloud.com/tutorials/en/foundation/8.0/authentication-and-security/user-authentication/javascript/
    try {
      this.user.id = username;
      this.user.password = password;
      let reqData = {
        'username': username,
        'password': password,
        'rememberMe': typeof rememberMe != "undefined" ? rememberMe : false
      };
      if (this.inChallange) {
        this.authHandler.submitChallengeAnswer(reqData);
      } else {
        WL.AuthorizationManager.login(LoginProvider.SECURITY_CHECK_NAME, reqData).then(this.authHandler.handleSuccess, this.authHandler.handleFailure);
        console.log("Test");
      }
    } catch (e) {
      console.log("login onException: " + JSON.stringify(e));
    }
  }

  cancel(): void {
    this.authHandler.cancel();
  }

  //TODO Borrar cache de getRZonas
  logout() {
    console.log("logout...");
    return new Promise((resolve, reject) => {
      let end = () => {
        this.clearUser().then(() => {
          this.translate.get('LogOff').subscribe(
            LogOff => {
              this.reloadApp(LogOff);
            });
        }).catch(console.log);
      }
      WL.AuthorizationManager.logout(LoginProvider.SECURITY_CHECK_NAME).then(
        end, end
      );
    })

  }

  private clearUser() {
    this.user.logged = false;
    this.user.id = undefined;
    this.user.password = "";
    this.user.displayName = undefined;
    return this.setStoredUser(this.user);
  }

  public setAuthorizationGroup(value) {
    this.user.authorizationGroup = value;
    this.setStoredUser(this.user);
  }
  public setLang(value) {
    this.user.lang = value;
    this.setStoredUser(this.user);
  }

  public getCalendarLang() {
    let language = "";
    switch (this.user.lang) {
      case "S":
        language = "es"
        break;
      case "E":
        language = "en"
        break;
      case "P":
        language = "pt"
        break;
      case "D":
        language = "de"
        break;
    }
    return language;
  }

}



export interface LoginUser {
  logged: boolean;
  id: string;
  password: string;
  idPartner: string;
  displayName: string;
  lang: string;
  offline: boolean;
  authorizationGroup: string;
  lastSync: string;
}