import { DBProvider } from '../../providers/DB-provider';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SapcrmCacheProvider } from '../../providers/sapcrm-cache-provider';
import { SapcrmProvider } from '../../providers/sapcrm-provider';
import { QueueProvider } from '../../providers/queue-provider';
import { UtilsProvider } from '../../providers/utils-provider';
import { LoginProvider } from '../../providers/login-provider';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SyncProvider } from '../../providers/sync-provider';
import { TranslateService } from 'ng2-translate/src/translate.service';
import 'rxjs/add/operator/toPromise';

/*
  Generated class for the Settings page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController
    , private loginProvider: LoginProvider, public syncProvider: SyncProvider
    , public sapcrmCacheProvider: SapcrmCacheProvider, private translate: TranslateService
    , public sapcrmProvider: SapcrmProvider
    , public queueProvider: QueueProvider
    , public dbProvider: DBProvider
    , private storage: Storage
    , private utils: UtilsProvider) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad ContactsPage');
  }

  clearQueue() {
    this.translate.get('DataPendingDeleted').subscribe(
      dataPendingDeleted => {
        this.queueProvider.clear()
          .then(() => {
            this.utils.showToast(dataPendingDeleted);
          })
          .catch((error) => {
            this.utils.showToast(error);
          });
      });
  }

  tryRemoveDatabase() {
    this.translate.get('DeleteAndRefreshData').subscribe(
      deleteAndRefreshData => {
        this.translate.get('DeleteAndRefreshDataAccepted').subscribe(
          deleteAndRefreshDataAccepted => {
            this.translate.get('Cancel').subscribe(
              cancel => {
                this.translate.get('Agree').subscribe(
                  agree => {
                    let confirm = this.alertCtrl.create({
                      title: deleteAndRefreshData,
                      message: deleteAndRefreshDataAccepted,
                      buttons: [
                        {
                          text: cancel,
                          handler: () => {
                            console.log('Disagree clicked');
                          }
                        },
                        {
                          text: agree,
                          handler: () => {
                            console.log('Agree clicked');                           
                            this.removeDatabase();                           
                          }
                        }
                      ]
                    });
                    confirm.present();
                  });
              });
          });
      });
  }

  deleteDatabase() {
    this.sapcrmProvider.removeDataBase();
  }

  removeDatabase() {
    this.utils.showLoading();
    this.translate.get('DeletedAndSync').subscribe(
      deletedAndSync => {
        return Promise.all([
          this.sapcrmProvider.removeDataBase(),
          this.storage.clear()
        ])
          .then(() => this.loginProvider.setCurrentStoredUser())
          .then(() => {
            this.utils.hideLoading();
            this.utils.showToast(deletedAndSync);
            this.sapcrmProvider.createDataBase();
            this.forceRefreshAll();
          })
          .catch((error) => {
            this.utils.hideLoading();
            this.utils.showToast(error);
          });
      });
  }

  tryForceRefreshAll() {
    this.translate.get('DataSyncQ').subscribe(
      dataSyncQ => {
        this.translate.get('DataSyncAccepted').subscribe(
          dataSyncAccepted => {
            this.translate.get('Cancel').subscribe(
              cancel => {
                this.translate.get('Agree').subscribe(
                  agree => {
                    let confirm = this.alertCtrl.create({
                      title: dataSyncQ,
                      message: dataSyncAccepted,
                      buttons: [
                        {
                          text: cancel,
                          handler: () => {
                            console.log('Disagree clicked');
                          }
                        },
                        {
                          text: agree,
                          handler: () => {
                            console.log('Agree clicked');
                            this.forceRefreshAll();
                          }
                        }
                      ]
                    });
                    confirm.present();
                  });
              });
          });
      });
  }

  forceRefreshAll() {   
    this.translate.get('DataSync').subscribe(
      dataSync => {
        //Forzamos sincronización Deberiamos indicar un alert tarda mucho....
        this.utils.showLoading();
        return this.syncProvider.sync(true).then(
          () => {
            this.utils.hideLoading();
            this.utils.showToast(dataSync);
            this.sapcrmProvider.createDataBase();
          },
          (error) => {
            this.utils.hideLoading();
            this.utils.showToast(error);
          });
      });
  }

  logout() {
    this.loginProvider.logout();
  }

  /*

  
  obtainAccessToken() {
    this.loginProvider.obtainAccessToken();
  }

  getSecret() {
    var resourceRequest = new WL.ResourceRequest("/adapters/sapcrm/" + "secret", WL.ResourceRequest.GET);
    let params = [];
    resourceRequest.setQueryParameter("params", JSON.stringify(params));
    return resourceRequest.send().then((response) => {
      console.log("Obtenidas cosa segura " + response.responseJSON);

    }, function (err) {
      console.log("ERROR callAdapter cosa segura " + err);

    });
  }

  

  wlInit() {
    WL.Client.init();
  }

  loginInit() {
    this.loginProvider.init();
  }

  backLoginOK() {
    var resourceRequest = new WL.ResourceRequest("/adapters/sapcrm/" + "login", WL.ResourceRequest.GET);
    let params = [AppSettings.SECURITY_TOKEN, "MMM", "MasterKey"];
    resourceRequest.setQueryParameter("params", JSON.stringify(params));
    return resourceRequest.send().then((response) => {
      console.log("backLoginOK res " + response.responseJSON);

    }, function (err) {
      console.log("ERROR backLoginOK " + err);

    });
  }
  backLoginKO() {
    var resourceRequest = new WL.ResourceRequest("/adapters/sapcrm/" + "login", WL.ResourceRequest.GET);
    let params = [AppSettings.SECURITY_TOKEN, "1234", "1234"];
    resourceRequest.setQueryParameter("params", JSON.stringify(params));
    return resourceRequest.send().then((response) => {
      console.log("ObackLoginKO res " + response.responseJSON);

    }, function (err) {
      console.log("ERROR backLoginKO " + err);

    });
  }

  testLoginOK() {
    this.loginProvider.login("MMM", "MasterKey");
  }

  testLoginKO() {
    this.loginProvider.login("1234", "1234");
  }
  testLoginKO2() {
    this.loginProvider.login("MMM", "1234d");
  }*/
}
