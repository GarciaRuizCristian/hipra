import { Partner } from '../models/partner';
import { Objectives } from '../models/objectives';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppSettings } from '../config/app-settings';
import { Storage } from '@ionic/storage';
import { Language } from '../models/language';
import { Status } from '../models/status';
import { Functions } from '../models/function';
import { Department } from '../models/department';
import { Group } from '../models/group';
import { SyncStat } from '../models/sync-stat';
import { MarketingAttribute } from '../models/marketingAttribute';
import { MarketingHeader } from '../models/marketingHeader';
import { TitleKey } from '../models/titleKey';
import { ReTypes } from '../models/reTypes';
import { Country } from '../models/country';
import { Region } from '../models/region';
import { TextActClasses } from '../models/textActClasses';
import { Category } from '../models/category';
import { ActivityResult } from '../models/ActivityResult';
import { ActivityReason } from '../models/ActivityReason';
import { OperationsClass } from '../models/operations_class';
import { PaymentTerms } from '../models/paymentTerms';
import { LoginProvider } from './login-provider';
import { Observable } from 'rxjs/Rx';
import { Subscriber } from 'rxjs/Subscriber';
import { PriceList } from '../models/priceList';
import { Product } from '../models/product';
import { AlertController } from 'ionic-angular/components/alert/alert';

/*
  Generated class for the SapcrmCacheProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SapcrmCacheProvider {

  constructor(public http: Http, private storage: Storage, private loginProvider: LoginProvider,
              private alertCtrl: AlertController) {
    console.log('Hello SapcrmCacheProvider Provider');
  }

  private checkSync(date: string): Promise<SyncStat[]> {
    return new Promise<SyncStat[]>((resolve, reject) => {
      var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmCache/" + "checkSync", WL.ResourceRequest.GET);
      let params = [date ? date : "1999-01-01", this.loginProvider.user.lang];
      resourceRequest.setQueryParameter("params", JSON.stringify(params));
      resourceRequest.send().then((response) => {
        let data = response.responseJSON.resultSet;
        data = data ? data : [];
        // console.log("checkSync: "+JSON.stringify(data));
        resolve(data);
      }, reject);
    });
  }


  sync(adapterMethod, storeName ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmCache/" + adapterMethod, WL.ResourceRequest.GET);
      let params = [AppSettings.SECURITY_TOKEN, this.loginProvider.user.id, this.loginProvider.user.lang];
      resourceRequest.setQueryParameter("params", JSON.stringify(params));
      resourceRequest.send().then((response) => {
        let data = response.responseJSON.data;
        this.storage.set(storeName, data);
        console.log("sapcrmCache sync finish for " + storeName);
        resolve(true);
      }, (error) => {
        console.log("sapcrmCache Sync Error " + adapterMethod + "(): " + JSON.stringify(error, null, 2));
        this.alertCtrl.create({
          title: "SapcrmCache Sync Error",
          message: adapterMethod + "():\n" + error.errorMsg,
          buttons: [{text: 'OK'}]
        }).present();
        resolve(true); //Continuar con la sincro aunque se produzca un error
      });
    });
  }

  get(storeName): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.storage.get(storeName).then((res) => {
        if (res) {
          resolve(res);
        } else {
          reject("Datos no sincronizados");
        }
      }, reject);
    });
  }

  executePromises(promises: Promise<boolean>[]): Observable<number> {
    return new Observable<number>((subscriber: Subscriber<number>) => {
      this.executePromisesNext(promises.length, promises, subscriber);
    });
  }

  executePromisesNext(total: number, promises: Promise<boolean>[], subscriber: Subscriber<number>) {
    subscriber.next((total - promises.length) / total);
    if (promises.length == 0) {
      subscriber.complete();
    } else {
      promises.shift()
        .then(() => this.executePromisesNext(total, promises, subscriber))
        .catch((e) => subscriber.error(e));
    }
  }

  syncAll(forze?: boolean): Observable<number> {
    //let promises: Promise<boolean>[];
    if (forze) {
      return this.executePromises([
        this.syncLanguages(),
        this.syncDepartments(),
        this.syncFunctions(),
        this.syncStatus(),
        this.syncGroups(),
        this.syncCountries(),
        this.syncRegions(),
        this.syncMarketingAttributes(),
        this.syncMarketingHeaders(),
        this.syncReTypes(),
        this.syncFICClasses(),
        this.syncOperationClasses(),
        this.syncCategories(),
        this.syncInterl(),
        this.syncObjectives(),
        this.syncPaymentTerms(),
        this.syncPriceList(),
        this.syncPriceListType(),
        //this.syncProductsToUser(),
        this.syncProductsDeterminedUser(),
        this.syncProductsCount(),
        this.syncReasons(),
        this.syncResult(),
        this.syncTextActClasses(),
        this.syncTextClasses(),
      ]);
    } else {
      return new Observable<number>((subscriber: Subscriber<number>) => {
        this.storage.get("sapcrmCacheSyncDate").then((lastSyncDate: string) => {
          this.checkSync(lastSyncDate).then((syncStats: SyncStat[]) => {
            let newSyncDate = "";
            for (let i = 0; i < syncStats.length; i++) {
              newSyncDate = syncStats[i].updated > newSyncDate ? syncStats[i].updated : newSyncDate;
            }
            if (lastSyncDate) {
              let promises: Promise<any>[] = new Array();
              for (let i = 0; i < syncStats.length; i++) {
                switch (syncStats[i].cache) {
                  case "cache_languages":
                    promises.push(this.syncLanguages());
                    break;
                  case "cache_departments":
                    promises.push(this.syncDepartments());
                    break;
                  case "cache_functions":
                    promises.push(this.syncFunctions());
                    break;
                  case "cache_status":
                    promises.push(this.syncStatus());
                    break;
                  case "cache_groups":
                    promises.push(this.syncGroups());
                    break;
                  case "cache_countries":
                    promises.push(this.syncCountries());
                    break;
                  case "cache_regions":
                    promises.push(this.syncRegions());
                    break;
                  case "cache_marketing_attributes":
                    promises.push(this.syncMarketingAttributes());
                    break;
                  case "cache_marketing_headers":
                    promises.push(this.syncMarketingHeaders());
                    break;
                  case "cache_classific":
                    promises.push(this.syncFICClasses());
                    break;
                  case "cache_re_types":
                    promises.push(this.syncReTypes());
                    break;
                  case "cache_operations_class":
                    promises.push(this.syncOperationClasses());
                    break;
                  case "cache_categories":
                    promises.push(this.syncCategories());
                    break;
                  case "cache_interl":
                    promises.push(this.syncInterl());
                    break;
                  case "cache_objectives":
                    promises.push(this.syncObjectives());
                    break;
                  case "cache_payment_terms":
                    promises.push(this.syncPaymentTerms());
                    break;
                  case "cache_price_list":
                    promises.push(this.syncPriceList());
                    break;
                  case "cache_price_list_type":
                    promises.push(this.syncPriceListType());
                    break;
                  /*case "cache_products_to_user":
                    promises.push(this.syncProductsToUser());
                    break;*/
                  case "cache_products":
                     promises.push(this.syncProductsDeterminedUser());
                     break;
                  /*case ""://TODO
                     promises.push(this.syncProductsCount());
                     break;*/
                  case "cache_reasons":
                    promises.push(this.syncReasons());
                    break;
                  case "cache_result":
                    promises.push(this.syncResult());
                    break;
                  case "cache_textact_class":
                    promises.push(this.syncTextActClasses());
                    break;
                  case "cache_text_class":
                    promises.push(this.syncTextClasses());
                    break;
                  default:
                    subscriber.error("Unknown cache " + syncStats[i].cache);
                    return;
                }
              }
              if (promises.length) {
                this.executePromises(promises).subscribe((v) => subscriber.next(v), (e) => subscriber.error(e), () => {
                  this.storage.set("sapcrmCacheSyncDate", newSyncDate).then(() => subscriber.complete(), (e) => subscriber.error(e));
                });
              } else {
                subscriber.complete();
              }
            } else {
              this.syncAll(true).subscribe((v) => subscriber.next(v), (e) => subscriber.error(e), () => {
                this.storage.set("sapcrmCacheSyncDate", newSyncDate).then(() => subscriber.complete(), (e) => subscriber.error(e));
              });
            }
          }, (e) => subscriber.error(e));
        });
      });
    }
  }

  //SYNC y GET Languages
  syncLanguages(): Promise<boolean> {
    return this.sync("getLanguages", "languages");
  }

  getLanguages(): Promise<Language[]> {
    return this.get("languages");
  }

  // getPartners(): Promise<Partner[]> {
  //   return this.get("partners");
  // }

  //SYNC y GET status
  syncStatus(): Promise<boolean> {
    return this.sync("getStatus", "status");
  }

  getStatus(): Promise<Status[]> {
    return this.get("status");
  }

  //SYNC y GET functions
  syncFunctions(): Promise<boolean> {
    return this.sync("getFunctions", "functions");
  }

  getFunctions(): Promise<Functions[]> {
    return this.get("functions");
  }

  //SYNC y GET departments
  syncDepartments(): Promise<boolean> {
    return this.sync("getDepartments", "departments");
  }
  getDepartments(): Promise<Department[]> {
    return this.get("departments");
  }

  //SYNC y GET groups
  syncGroups(): Promise<boolean> {
    return this.sync("getGroups", "groups");
  }
  getGroups(): Promise<Group[]> {
    return this.get("groups");
  }

  //SYNC y GET country
  syncCountries(): Promise<boolean> {
    return this.sync("getCountries", "country");
  }

  getCountries(): Promise<Country[]> {
    return this.get("country");
  }

  //SYNC y GET region
  syncRegions(): Promise<boolean> {
    return this.sync("getRegions", "region");
  }

  getRegions(): Promise<Region[]> {
    return this.get("region");
  }

  //SYNC y GET MarketingAttributes
  syncMarketingAttributes(): Promise<boolean> {
    return this.sync("getMarketingAttributes", "marketingAttributes");
  }

  getMarketingAttributes(): Promise<MarketingAttribute[]> {
    return this.get("marketingAttributes");
  }

  //SYNC y GET getMarketingHeaders
  syncMarketingHeaders(): Promise<boolean> {
    return this.sync("getMarketingHeaders", "marketingHeaders");
  }

  getMarketingHeaders(): Promise<MarketingHeader[]> {
    return this.get("marketingHeaders");
  }

  //SYNC y GET FICClasses
  syncFICClasses(): Promise<boolean> {
    return this.sync("getFICClasses", "FICClasses");
  }

  getFICClasses(): Promise<TitleKey[]> {
    return this.get("FICClasses");
  }

  //SYNC y GET ReTypes
  syncReTypes(): Promise<boolean> {
    return this.sync("getReTypes", "reTypes");
  }

  getReTypes(): Promise<ReTypes[]> {
    return this.get("reTypes");
  }

  //SYNC y GET OperationClasses
  syncOperationClasses(): Promise<boolean> {
    return this.sync("getOperationClasses", "operationClasses");
  }

  getOperationClasses(): Promise<OperationsClass[]> {
    return this.get("operationClasses");
  }

  //SYNC y GET Categories
  syncCategories(): Promise<boolean> {
    return this.sync("getCategories", "categories");
  }

  getCategories(): Promise<Category[]> {
    return this.get("categories");
  }

  //SYNC y GET TextClasses
  syncTextClasses(): Promise<boolean> {
    return this.sync("getTextClasses", "textClasses");
  }

  getTextClasses(): Promise<TextActClasses[]> {
    return this.get("textClasses");
  }

  //SYNC y GET TextActClasses
  syncTextActClasses(): Promise<boolean> {
    return this.sync("getTextActClasses", "textActClasses");
  }

  getTextActClasses(): Promise<TextActClasses[]> {
    return this.get("textActClasses");
  }

  //SYNC y GET Objectives
  syncObjectives(): Promise<boolean> {
    return this.sync("getObjectives", "objectives");
  }

  getObjectives(): Promise<Objectives[]> {
    return this.get("objectives");
  }

  //SYNC y GET Reasons
  syncReasons(): Promise<boolean> {
    return this.sync("getReasons", "reasons");
  }

  getReasons(): Promise<ActivityReason[]> {
    return this.get("reasons");
  }

  //SYNC y GET Result
  syncResult(): Promise<boolean> {
    return this.sync("getResult", "result");
  }

  getResult(): Promise<ActivityResult[]> {
    return this.get("result");
  }

  //SYNC y GET PaymentTerms
  syncPaymentTerms(): Promise<boolean> {
    return this.sync("getPaymentTerms", "paymentTerms");
  }

  getPaymentTerms(): Promise<PaymentTerms[]> {
    return this.get("paymentTerms");
  }

  //SYNC y GET PriceListType
  syncPriceListType(): Promise<boolean> {
    return this.sync("getPriceListType", "priceListType");
  }

  getPriceListType(): Promise<void[]> {//TODO
    return this.get("priceListType");
  }

  //SYNC y GET PriceList
  syncPriceList(): Promise<boolean> {
    return this.sync("getPriceList", "priceList");
  }

  getPriceList(): Promise<PriceList[]> {//TODO
    return this.get("priceList");
  }

  //SYNC y GET Interl
  syncInterl(): Promise<boolean> {
    return this.sync("getInterl", "interl");
  }

  getInterl(): Promise<void[]> {//TODO
    return this.get("interl");
  }

  //SYNC y GET Products
  // syncProductsToUser(): Promise<boolean> {
  //   return this.sync("getProductsToUser", "productsToUser");
  // }

  // getProductsToUser(): Promise<void[]> {//TODO
  //   return this.get("productsToUser");
  // }

  //SYNC y GET Products
  syncProducts(): Promise<boolean> {
    return this.sync("getProducts", "products");
  }

  getProducts(): Promise<void[]> {//TODO
    return this.get("products");
  }

  //SYNC y GET Products
  syncProductsDeterminedUser(): Promise<boolean> {
    return this.sync("getProductsDeterminedUser", "productsDeterminedUser");
  }

  getProductsDeterminedUser(): Promise<Product[]> {//TODO
    return this.get("productsDeterminedUser");
  }

  //SYNC y GET ProductsCount
  syncProductsCount(): Promise<boolean> {
    return this.sync("getProductsCount", "productsCount");
  }

  getProductsCount(): Promise<void[]> {//TODO
    return this.get("productsCount");
  }

}