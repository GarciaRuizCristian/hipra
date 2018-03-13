import { EventEmitter, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Partner } from '../models/partner';
import { AppSettings } from '../config/app-settings';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { LoginProvider } from '../providers/login-provider';
import { UtilsProvider } from '../providers/utils-provider';
import { SapcrmProvider } from '../providers/sapcrm-provider';
import { SapcrmWebProvider } from '../providers/sapcrm-web-provider';
import { QueueProvider } from '../providers/queue-provider';
import { SapcrmCacheProvider } from '../providers/sapcrm-cache-provider';

@Injectable()
export class SyncProvider {
  doing: boolean = false;
  public pendingEmitter: EventEmitter<any> = new EventEmitter<any>();
  public doingEmitter: EventEmitter<any> = new EventEmitter<any>();


  constructor(public http: Http, private utils: UtilsProvider, private storage: Storage,
    private loginProvider: LoginProvider, public translate: TranslateService
    , private sapcrmCacheProvider: SapcrmCacheProvider, private sapcrmProvider: SapcrmProvider
    , private sapcrmWebProvider: SapcrmWebProvider, private queueProvider: QueueProvider) {
    console.log('Hello SapcrmProvider Provider');
    this.queueProvider.pendingEmitter.subscribe((pending) => this.pendingEmitter.emit(pending));
  }

  sync(force?: boolean, dontShowAlert?: boolean, task?: QueueTask): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let end = () => {

        if(!this.loginProvider.user.idPartner) {
          this.sapcrmWebProvider.login(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_LOGIN).then((idPartner) => {
            this.loginProvider.user.idPartner = idPartner;
            this.loginProvider.setCurrentStoredUser().then(() => {
              this.sapcrmWebProvider.syncOptimizedPartner('', this.loginProvider.user.idPartner, '').then((partner) => {
                this.loginProvider.setAuthorizationGroup(partner.CENTRAL.AUTHORIZATIONGROUP);
                this.resetLoading(dontShowAlert);
                resolve();
              },
              (error) => {
                this.utils.showToast(error);
              });
            });
          });
        } else {
          this.sapcrmWebProvider.syncOptimizedPartner('', this.loginProvider.user.idPartner, '').then((partner) => {
            this.loginProvider.setAuthorizationGroup(partner.CENTRAL.AUTHORIZATIONGROUP);
            this.resetLoading(dontShowAlert);
            resolve();
          },
          (error) => {
            this.utils.showToast(error);
          });
        }
      }

      let error = (error) => {
        this.utils.showToast(error);
        end();
      }

      if(!dontShowAlert)
        this.utils.showLoading();
      this.doing = true;
      this.doingEmitter.emit(this.doing);

      this.queueProvider.tryRun(task).subscribe((percent) => {
        this.translate.get('SyncModifiedData').subscribe(
          SyncModifiedData => {
            if(!dontShowAlert)
              this.utils.setLoadingMessage(SyncModifiedData + Math.round(percent * 100) + "%");
          });
      }, error,
        () => this.sapcrmCacheProvider.syncAll(force).subscribe((percent: number) => {
          this.translate.get('SyncMasterData').subscribe(
            SyncMasterData => {
              if(!dontShowAlert)
                this.utils.setLoadingMessage(SyncMasterData + Math.round(percent * 100) + "%");
            });
        }, error,
          () => this.sapcrmProvider.syncAll(force).subscribe((elementPercent: { element: string, percent: number }) => {
            let elementName = "";
            if (elementPercent.element == AppSettings.STORE_CONFIG_ACTIVITIES.name) {
              this.translate.get('Activities').subscribe(
                Activities => {
                  elementName = Activities;
                });
            } else if (elementPercent.element == AppSettings.STORE_CONFIG_PARTNERS.name) {
              this.translate.get('Partners').subscribe(
                Partners => {
                  elementName = Partners;
                });
            } else if (elementPercent.element == AppSettings.STORE_CONFIG_PRODUCTS.name) {
              this.translate.get('Products').subscribe(
                Products => {
                  elementName = Products;
                });
            }
            this.translate.get('Sync').subscribe(
              Sync => {
                if(!dontShowAlert)
                  this.utils.setLoadingMessage(Sync + " " + elementName + "... " + Math.round(elementPercent.percent * 100) + "%");
              });
          }, error, end)
        )
      );
    });
  }


  private resetLoading(dontShowAlert: boolean) {
    this.doing = false;
    this.doingEmitter.emit(this.doing);
    if(!dontShowAlert)
      this.utils.hideLoading();
  }
}

interface QueueTask {
  providerName: string,
  sendMethod: string,
  failureMethod: string,
  successMethod: string,
  data: any[],
  hasErrors: boolean
}