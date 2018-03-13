import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Partner } from '../models/partner';
import { PartnerAbstract } from '../models/partnerAbstract';
import { Activity } from '../models/activity';
import { ActivityAbstract } from '../models/activityAbstract';
import { Product } from '../models/product';
import { ProductAbstract } from '../models/productAbstract';
import { Order } from '../models/order';
import { OrderAbstract } from '../models/orderAbstract';
import { AppSettings } from '../config/app-settings';
import { AlertController } from 'ionic-angular';
import { LoginProvider } from '../providers/login-provider';
import { UtilsProvider } from '../providers/utils-provider';
import { StoreConfig } from '../models/store-config';
import { Observable, Observer } from 'rxjs/Rx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Subscriber } from 'rxjs/Subscriber';
import { DBProvider } from '../providers/DB-provider';

/*
  Generated class for the SapcrmCacheProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SapcrmProvider {

  db: SQLiteObject = null;

  constructor(private sqlite: SQLite, public http: Http, private utils: UtilsProvider, private storage: Storage,
    private loginProvider: LoginProvider, public alertCtrl: AlertController, public dbProvider: DBProvider) {
    console.log('Hello SapcrmProvider Provider');
  }

  private sendActivity(activity: Activity, method: string, isOrder: boolean, originalActivity?: Activity) {

    return new Promise<void>((resolve, reject) => {
      let resourceRequest = new WL.ResourceRequest("/adapters/sapcrm/" + method, WL.ResourceRequest.GET, 120000);
      let params = [JSON.stringify(this.toPushActivity(activity, method, isOrder, originalActivity)), AppSettings.SECURITY_TOKEN, this.loginProvider.user.id];
      resourceRequest.setQueryParameter("params", JSON.stringify(params));
      return resourceRequest.send().then((response) => {
        console.log("Activity enviada. Respuesta: " + JSON.stringify(response.responseJSON));
        let data = response.responseJSON;
        let result = data["Envelope"].Body[(method == "pushCreateActivity" ? "ZIPADWL_CREATEACTIVIDAD" : method == "pushChangeActivity" ? "ZIPADWL_CHANGEACTIVIDAD" : "ZIPAD_DELETEACTIVIDAD") + ".Response"].O_RESULTADO;
        if (result.TYPE != "E") {
          resolve();
        } else {
          let msg = result.MESSAGE;
          msg += result.MESSAGE_V1 ? (" | " + result.MESSAGE_V1) : "";
          msg += result.MESSAGE_V2 ? (" | " + result.MESSAGE_V2) : "";
          msg += result.MESSAGE_V3 ? (" | " + result.MESSAGE_V3) : "";
          msg += result.MESSAGE_V4 ? (" | " + result.MESSAGE_V4) : "";
          reject(msg);
        }
      }, reject);
    });
  }

  toPushActivity(activity: Activity, method: string, isOrder: boolean, originalActivity?: Activity) {
    //Create copy and fix the partner to push
    let activityPush = JSON.parse(JSON.stringify(activity));
    activityPush.HEADER.OBJECT_ID = activityPush.HEADER.OBJECT_ID.indexOf("-") != -1 ? "" : activityPush.HEADER.OBJECT_ID;

    //delete activityPush["DATETIME_FROM"];
    //delete activityPush["DATETIME_TO"];
    if (method != "pushDeleteActivity" && !isOrder) {
      //Preparo, arreglo  y compruebo los campos
      let existActivity = !!activityPush.HEADER.OBJECT_ID;
      if (existActivity) {
        activityPush.DATE.splice(0, activity.DATE.length - 1);
        //activityPush.STATUS_TAB.splice(1, this.activity.STATUS_TAB.length - 1);
      }

      if (activityPush.OUTCOME && activityPush.OUTCOME['0']) {
        activityPush.HEADER.RESULT = activityPush.OUTCOME['0'].CODE//TODO
      }
      activityPush = this.utils.unfixArrays(activityPush);
      if (existActivity) {
        return this.createActivityRequest(activityPush, originalActivity);
      } else {
        return activityPush;
      }
    } else {
      return activityPush;
    }
  }

  createActivityRequest(newActivity: Activity, originalActivity: Activity) {//TODO
    let activityResponse = {
      HEADER: {
        GUID: originalActivity.HEADER.GUID,
        OBJECT_ID: newActivity.HEADER.OBJECT_ID,
        PROCESS_TYPE: newActivity.HEADER.PROCESS_TYPE,
        DESCRIPTION: newActivity.HEADER.DESCRIPTION,
        OBJECTIVE: newActivity.HEADER.OBJECTIVE,
        RESULT: newActivity.OUTCOME["0"].CODE,
        PRIVATE_FLAG: "",
        CODE: newActivity.HEADER.OBJECT_ID,
        CATEGORY: newActivity.HEADER.CATEGORY,

      },
      DATE: [],
      OUTCOME: [],
      STATUS_TAB: newActivity.STATUS_TAB,
      MATERIAL_TAB: newActivity.MATERIAL_TAB,
      PARTNERS: [],
      REASON: newActivity.REASON,
      TEXT: newActivity.TEXT,
      DESCRIPTION: originalActivity.HEADER.DESCRIPTION,
      CODE: originalActivity.HEADER.OBJECT_ID,
      OPERATION: originalActivity.HEADER.PROCESS_TYPE,
      OBJECTIVE: originalActivity.HEADER.OBJECTIVE,
      STATUS: originalActivity.STATUS_TAB["0"].STATUS,

      FROMDATE: new Date,
      FROMDATE_FORMATTED: "",
      TODATE: new Date,
      STARTTIME: new Date,
      ENDTIME: new Date,

      ACTIVITY_PARTNERS: [],
      CONTACT_PERSONS: [],
      COMPETITORS: [],
      PERSONS_RESPONSIBLE: [],
      DEPARTMENTS: [],
      CATEGORY: [],
      ATTENDEES: [],
      SALES_REPRESENTATIVES: [],
      EMPLOYEE_RESPONSIBLES: [],

    }

    //Find correct date of originalActivity
    let correctOldDate;
    for (let date of originalActivity.DATE) {
      if (date.APPT_TYPE == 'ORDERPLANNED') {
        correctOldDate = date;
      }
    }

    activityResponse.FROMDATE = new Date(
      correctOldDate.DATE_FROM.substring(0, 4),
      Number(correctOldDate.DATE_FROM.substring(5, 7)) - 1,
      correctOldDate.DATE_FROM.substring(8, 10));

    activityResponse.FROMDATE_FORMATTED = this.parseFromDateFormated(originalActivity, correctOldDate);

    activityResponse.TODATE = new Date(
      correctOldDate.DATE_TO.substring(0, 4),
      Number(correctOldDate.DATE_TO.substring(5, 7)) - 1,
      correctOldDate.DATE_TO.substring(8, 10));

    activityResponse.STARTTIME = correctOldDate.TIME_FROM.substring(0, 5);
    activityResponse.ENDTIME = correctOldDate.TIME_TO.substring(0, 5);
    //////////

    activityResponse.OUTCOME.push({
      CODE: newActivity.OUTCOME["0"].CODE,
      CODE_GROUP: "Z0000001"//TODO
    });

    activityResponse.DATE.push({
      APPT_TYPE: newActivity.DATE["0"].APPT_TYPE,
      DATE_FROM: newActivity.DATE["0"].DATE_FROM,
      DATE_TO: newActivity.DATE["0"].DATE_TO,
      TIME_FROM: newActivity.DATE["0"].TIME_FROM,
      TIME_TO: newActivity.DATE["0"].TIME_TO,
      TIMEZONE_FROM: newActivity.DATE["0"].TIMEZONE_FROM,
      TIMEZONE_TO: newActivity.DATE["0"].TIMEZONE_TO
    });

    for (let partner of newActivity.PARTNERS) {
      activityResponse.PARTNERS.push({
        PARTNER_NO: partner.PARTNER_NO,
        PARTNER_FCT: partner.PARTNER_FCT
      });
    }

    for (let partner of originalActivity.PARTNERS) {
      if (partner.PARTNER_FCT == "00000009") {
        activityResponse.ACTIVITY_PARTNERS.push({
          PARTNER_NO: partner.PARTNER_NO,
          PARTNER_FCT: partner.PARTNER_FCT
        });
      }
      if (partner.PARTNER_FCT == "00000012") {
        activityResponse.SALES_REPRESENTATIVES.push({
          PARTNER_NO: partner.PARTNER_NO,
          PARTNER_FCT: partner.PARTNER_FCT
        });
      }
      if (partner.PARTNER_FCT == "00000014") {
        activityResponse.EMPLOYEE_RESPONSIBLES.push({
          PARTNER_NO: partner.PARTNER_NO,
          PARTNER_FCT: partner.PARTNER_FCT
        });
      }
    }
    return activityResponse;
  }

  parseFromDateFormated(originalActivity, date) {
    let retDate = new Date(
      date.DATE_FROM.substring(0, 4),
      Number(date.DATE_FROM.substring(5, 7)) - 1,
      date.DATE_FROM.substring(8, 10));

    return retDate.getFullYear() + "/" + retDate.getMonth() + "/" + retDate.getDate();//TODO
  }

  private sendPartner(partner: Partner): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let partnerPush = JSON.parse(JSON.stringify(partner));
      partnerPush.PARTNER = partnerPush.PARTNER.indexOf("-") != -1 ? "" : partnerPush.PARTNER;
      partnerPush = this.utils.unfixArrays(partnerPush);
      var method = partnerPush.PARTNER ? "pushChangePartner" : "pushCreatePartner";
      var resourceRequest = new WL.ResourceRequest("/adapters/sapcrm/" + method, WL.ResourceRequest.GET, 120000);
      let params = [JSON.stringify(partnerPush), AppSettings.SECURITY_TOKEN, this.loginProvider.user.id];
      resourceRequest.setQueryParameter("params", JSON.stringify(params));
      return resourceRequest.send().then((response) => {
        console.log("Partner enviado. Respuesta: " + JSON.stringify(response.responseJSON));
        let data = response.responseJSON;
        let result = data["Envelope"].Body[(partnerPush.PARTNER ? "ZIPADWL_CHANGEPARTNER" : "ZIPADWL_CREATEPARTNER") + ".Response"].O_RESULTADO;
        if (result.TYPE != "E") {
          resolve();
        } else {
          let msg = result.MESSAGE;
          msg += result.MESSAGE_V1 ? (" | " + result.MESSAGE_V1) : "";
          msg += result.MESSAGE_V2 ? (" | " + result.MESSAGE_V2) : "";
          msg += result.MESSAGE_V3 ? (" | " + result.MESSAGE_V3) : "";
          msg += result.MESSAGE_V4 ? (" | " + result.MESSAGE_V4) : "";
          reject(msg);
        }
      }, reject);
    });
  }
  getRUser(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.storage.get("userZones").then((res) => {
        if (res) {
          resolve(res);
        } else {
          reject("Datos no sincronizados");
        }
      }, reject);
    });
  }

  syncRUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.storage.get("DATE_userZones").then((date) => {
        date = date || AppSettings.MIN_SYNC_DATE;
        if (date == this.currentDate()) {
          resolve();
        } else {
          var resourceRequest = new WL.ResourceRequest("/adapters/sapcrm/" + "getRUser", WL.ResourceRequest.GET, 120000);

          let params = [AppSettings.SECURITY_TOKEN, this.loginProvider.user.id, this.loginProvider.user.lang];
          resourceRequest.setQueryParameter("params", JSON.stringify(params));
          return resourceRequest.send().then((response) => {
            let data;
            data = response.responseJSON["Envelope"].Body["ZIPADWL_RUTAS_USUARIO.Response"].T_ZONAS.item;
            this.storage.set("userZones", data);
            console.log("sapcrm sync finish for " + "userZones");
            console.log("Obtenidas las Zonas del Usuario " + response.responseJSON);
            this.storage.set("DATE_userZones", this.currentDate());
            resolve();
          }, reject);
        }
      });
    });
  }

  /*
  * Comprobamos si tenemos fecha si tenemos pagina obtenemos la pagina y la guardamos en DB
  */
  private sync(storeConfig: StoreConfig, subscriber: Subscriber<{ element: string, percent: number }>, teoricalTotalElements?: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {    
      this.storage.get("DATE_" + storeConfig.name).then((date) => {
        date = date || AppSettings.MIN_SYNC_DATE;
        if (date == this.currentDate() && storeConfig.daily) {
          resolve();
        } else {
          this.storage.get("PAGE_" + storeConfig.name).then((page) => {
            page = page || 0;
            console.log("Sync page " + page + " of " + storeConfig.name);
            this.getPage(storeConfig, date, page, storeConfig.pageSize).then((data) => {
              let syncFinish = () => {
                this.storage.remove("PAGE_" + storeConfig.name);
                this.storage.set("DATE_" + storeConfig.name, this.currentDate());
                console.log("Sync finish of " + storeConfig.name);
                resolve();
              }

              data = this.utils.fixArrays(data);
              var items = data[storeConfig.itemListFieldName];
              var total = Number(data[storeConfig.maxFieldName]);
              if (teoricalTotalElements && Math.abs(total - teoricalTotalElements) > 10) {
                //TODO Esto está puesto xq parece q aleatoriamente SAP contesta como si tubiera muy pocos elementos sin sentido
                let alert = this.alertCtrl.create({
                  title: 'Error sincronización',
                  subTitle: 'Error durante la sincronización, volver a intentar',
                  buttons: ['OK']
                });
                alert.present();
                reject();//"Error durante la sincronización, volver a intentar");
                //this.sync(storeConfig, subscriber, teoricalTotalElements).then(resolve, reject);
              } else {
                subscriber.next({ element: storeConfig.name, percent: total == 0 ? 1 : (page * storeConfig.pageSize / total) });
                if (items && items.length) {
                  this.storeItems(storeConfig, items).then(() => {
                    this.storage.set("PAGE_" + storeConfig.name, page + 1).then(() => {
                      if (items.length >= storeConfig.pageSize) {
                        this.sync(storeConfig, subscriber, total).then(resolve, reject);
                      } else {
                        syncFinish();
                      }
                    }), reject
                  }, reject);
                } else {
                  syncFinish();
                }
              }
            }, reject);
          });
        }
      });
    });
  }

  private currentDate() {
    let today = new Date();
    return today.getFullYear() + ("0" + (today.getMonth() + 1)).slice(-2) + ("0" + today.getDate()).slice(-2);
  }

  /*
  * Obtenemos los datos de la siguiente páguina
  */
  private getPage(storeConfig: StoreConfig, date: string, page: number, pageSize: number): Promise<any[]> {

    return new Promise<any[]>((resolve, reject) => {

      var resourceRequest = new WL.ResourceRequest("/adapters/sapcrm/" + storeConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
      let params;
      if (storeConfig.daily) {
        params = [AppSettings.SECURITY_TOKEN, this.loginProvider.user.lang, this.loginProvider.user.id, page * pageSize + 1, page * pageSize + pageSize, ""];
      } else {
        params = [AppSettings.SECURITY_TOKEN, this.loginProvider.user.lang, this.loginProvider.user.id, date, page * pageSize + 1, page * pageSize + pageSize, ""];
      }

      resourceRequest.setQueryParameter("params", JSON.stringify(params));
      resourceRequest.send().then((response) => {
        let data = response.responseJSON.Envelope.Body[storeConfig.responseBodyName + ".Response"];
        resolve(data);
      }, reject);

    });

  }


  /*
  public createDB(): Promise<any> {
    for (let oldDataBase of AppSettings.DATABASE_OLD_NAMES) {
      this.removeDataBase(oldDataBase);
    }
    return this.sqlite.create({
      name: AppSettings.DATABASE_NAME,
      location: 'default' // the location field is required
    }).then((db: SQLiteObject) => {
      this.db = db;
      let proms = [];
      for (let i = 0; i < AppSettings.STORES.length; i++) {
        let sql = 'CREATE TABLE IF NOT EXISTS '+AppSettings.STORES[i].name+'(id CHAR(20) PRIMARY KEY, object TEXT)';
        proms.push(
          db.transaction((tx: any) => {
              tx.executeSql(sql,[])
            }
          ));                                        
      }
      return Promise.all(proms); 
    }) 
        
  }
  */

  /*
  * Obtenemos referencia de la DB
  */
  /*
  private getDB(): Promise<SQLiteObject> {
    console.log("Creacion BBDD");
    return Promise.resolve(this.db);
  }
  */
  /*
  * Guadarmos los datos en DB
  */
  private storeItems(storeConfig: StoreConfig, items: any[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {

      this.dbProvider.getDB().then((db: SQLiteObject) => {
        let proms = [];
        for (let i = 0; i < items.length; i++) {
          proms.push(this.storeItem(db, storeConfig, items[i]));
        }
        Promise.all(proms).then(() => {        
          resolve();
        }, (error) => {       
          reject(error);
        });
      }, reject);
    });
  }

  private getItemKey(storeConfig: StoreConfig, item: any) {
    return storeConfig.primaryKey(item);
  }

  private isDuplicateKeyError(error): boolean {
      if(error.err.message.includes("UNIQUE")) return true;
      else return false;
  }

  private storeItem(db: SQLiteObject, storeConfig: StoreConfig, item: any): Promise<void> {
    if (storeConfig.isDeleted && storeConfig.isDeleted(item)) {
      return this.storeItemDelete(db, storeConfig, this.getItemKey(storeConfig, item));
    } else {
      return new Promise<void>((resolve, reject) => {
        if (storeConfig.preInsert) {
          storeConfig.preInsert(item);
        }
        var i;
        var columns: String = "";
        var valuesString: String="";
        var data: any[] = [];
        columns+= "ID ";
        columns+=',OBJECT';        
        valuesString +='?';
        valuesString +=',?';
        data.push(storeConfig.primaryKey(item));
        data.push(JSON.stringify(item));
        for(i=0; i<storeConfig.indexColumns.length; i++){
           columns +=', '+storeConfig.indexColumns[i].name;
           valuesString +=',?';
           if(typeof storeConfig.indexColumns[i].valueOf(item)=="undefined") data.push(0);
           else if(typeof storeConfig.indexColumns[i].valueOf(item)=="boolean"){
              data.push(storeConfig.indexColumns[i].valueOf(item)==true? 1: 0);
           }
           else data.push(storeConfig.indexColumns[i].valueOf(item));
           

        }
        let sql = 'INSERT INTO '+storeConfig.name+"("+columns+')'+' VALUES('+valuesString+')'; 
      
        //TODO data....el resto de columnas indice y sql con lo nombres de columnas y los ?
        
        this.dbProvider.query(sql, data)
        .then(() => {
          resolve();
        })
        .catch((error) => {        
          if (this.isDuplicateKeyError(error)) {
              this.fill4InsertUpdate(db, storeConfig, item).then(
                (item4Update) => {
                  this.storeItemUpdate(db, storeConfig, item4Update).then(resolve, reject);
                },
                reject
              );
              return true;
            }
          reject(error);
        });
      });
    }
  }

  /*
  * Rellenamos los datos del item que se va a insertar con posibles datos que no queremos que se sobreescriban
  */
  private fill4InsertUpdate(db: SQLiteObject, storeConfig: StoreConfig, item: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (storeConfig == AppSettings.STORE_CONFIG_PARTNERS) {
        this.getPartner(item.PARTNER).then(
          (itemOld) => {
            resolve(item);
          },
          reject
        );
      } else {
        resolve(item);
      }
    });
  }

  private storeItemUpdate(db: SQLiteObject, storeConfig: StoreConfig, item: any, whereClause?: string, whereValues?: any[]): Promise<void> {
    //TODO  
    var columns: String = "";
    columns+='OBJECT =?';  
    var data: any[] = [];
    data.push(JSON.stringify(item));        
    var t;
    for(t=0; t<storeConfig.indexColumns.length; t++){
        columns +=', '+storeConfig.indexColumns[t].name+"=?";       
        data.push(storeConfig.indexColumns[t].valueOf(item));
    }
    
    if(whereClause){
      var x;
      for(x=0; x<whereValues.length; x++){               
           data.push(whereValues[x]);
      }     

    }

    else {
      whereClause = "WHERE ID=?";
      data.push(storeConfig.primaryKey(item));
    }
   
    return new Promise<void>((resolve, reject) => {
       this.dbProvider.getDB().then((db) => {                   
        let sql = 'UPDATE '+storeConfig.name+' SET '+columns+ " " +whereClause;
        this.dbProvider.query(sql,data).then((response) => {              
          resolve();      
        })
        .catch((e) => reject(e));
       }); 
     });
  }

  private storeItemDelete(db: SQLiteObject, storeConfig: StoreConfig, key: string): Promise<void> {
    //TODO
    return new Promise<void>((resolve, reject) => {
       this.dbProvider.getDB().then((db) => {
        let sql = 'DELETE FROM '+storeConfig.name+' WHERE ID=?';
        this.dbProvider.query(sql,[key]).then((response) => {       
          resolve();      
        })
        .catch((e) => reject(e));
       }); 
     });
  }

  private getItemsCursor(storeConfig: StoreConfig, whereClause?: string, whereValues?: any[], page?: number, pageSize?: number, orderBy?: string, collation?: string): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      this.dbProvider.getDB().then((db) => {
              
        let sql = 'SELECT OBJECT FROM '+storeConfig.name;
       
        if (whereClause) {
          sql += " WHERE "+whereClause;
        } else if (whereValues && whereValues.length == 1) {
          sql += " WHERE ID= ?";
        }

        if(orderBy){
           sql += " ORDER BY " + orderBy;
        }

        if(collation){
          sql += " COLLATE "+collation;
        }

        if(pageSize){
           sql += " LIMIT "+pageSize;
        }

        if(page){
          sql += " OFFSET "+(page*pageSize);
        }
       
        this.dbProvider.query(sql, whereValues ? whereValues : [])
        .then((response) => {
             
         for (let index = 0; index < response.res.rows.length ; index++) {                    
            let item = JSON.parse(response.res.rows.item ? response.res.rows.item(index).OBJECT : response.res.rows[index].OBJECT);
            observer.next(item);
         }
         observer.complete()
        })
        .catch(         
          (e) => observer.error(e)
        );
      }, (e) => observer.error(e));
    });
  }

  private getItem(storeConfig: StoreConfig, whereClause?: string, whereValues?: [any]): Promise<any> {
    var found = false;
    return new Promise<any[]>((resolve, reject) => {
      this.getItemsCursor(storeConfig, whereClause, whereValues).subscribe((item) => {
        found = true;
        resolve(item);
        console.log("getItem " + storeConfig.name + ": " + this.getItemKey(storeConfig, item));
      }, reject, () => {
        if (!found) {
          resolve(undefined);
        }
      });
    });
  }

  private getItemAbstract(storeConfig: StoreConfig, parseAbstract: Function, whereClause?: string, whereValues?: any[]): Promise<any> {
    var found = false;
    return new Promise<any[]>((resolve, reject) => {
      this.getItemsCursor(storeConfig, whereClause, whereValues).subscribe((item) => {
        found = true;
        resolve(parseAbstract(item));
        console.log("getItem " + storeConfig.name + ": " + this.getItemKey(storeConfig, item));
      }, reject, () => {
        if (!found) {
          resolve(undefined);
        }
      });
    });
  }

  private getItems(storeConfig: StoreConfig,  whereClause?: string, whereValues?: any[], page?: number, pageSize?: number, collate?: string): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      var items = [];

      this.getItemsCursor(storeConfig, whereClause, whereValues, page, pageSize, null, collate).subscribe((item) => {
        items.push(item);
      }, reject, () => {
        console.log("getItems " + storeConfig.name + ": " + items.length + " " + storeConfig.name);       
        resolve(items);
      });
    });
  }

  private getAbstracts(storeConfig: StoreConfig, parseAbstract: Function, whereQuery?: string, data?: any[], page?: number, pageSize?: number, orderBy?: string, collate?: string): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      var items = [];   
      if(collate)
      this.getItemsCursor(storeConfig, whereQuery, data, page, pageSize, orderBy, collate).subscribe((item) => {         
        items.push(parseAbstract(item)); 
      }, reject, () => {
        console.log("getAbstracts " + storeConfig.name + ": " + items.length + " " + storeConfig.name);
        resolve(items);
      });
      else{
        this.getItemsCursor(storeConfig, whereQuery, data, page, pageSize, orderBy).subscribe((item) => {         
          items.push(parseAbstract(item)); 
        }, reject, () => {
          console.log("getAbstracts " + storeConfig.name + ": " + items.length + " " + storeConfig.name);
          resolve(items);
        });
      }
    });
  }

  createDataBase(): Promise<void>{

    return this.dbProvider.createDB(AppSettings.DATABASE_NAME,AppSettings.STORES);
  }

  removeDataBase(oldDataBase?: string): Promise<void> {
    //TODO
    return new Promise<void>((resolve, reject) => {
      let dataBase = oldDataBase ? oldDataBase : AppSettings.DATABASE_NAME;
      var req = this.dbProvider.clearDatabase().then((response) => {
        console.log("Deleted database successfully");
        resolve();
      }).catch((error) =>{
         console.log("Couldn't delete database");
        reject("Couldn't delete database");
      });    
      /*req.onblocked = function () {//TODO
        console.log("Couldn't delete database due to the operation being blocked");
        reject("Couldn't delete database due to the operation being blocked");
      };*/
    });
  }
  

  syncAll(force?: boolean): Observable<{ element: string, percent: number }> {
    return new Observable<{ element: string, percent: number }>((subscriber: Subscriber<{ element: string, percent: number }>) => {
      if (force) {
        this.storage.remove("DATE_userZones");
        this.storage.remove("DATE_" + AppSettings.STORE_CONFIG_PARTNERS.name);
        this.storage.remove("PAGE_" + AppSettings.STORE_CONFIG_PARTNERS.name);
        this.storage.remove("DATE_" + AppSettings.STORE_CONFIG_ACTIVITIES.name);
        this.storage.remove("PAGE_" + AppSettings.STORE_CONFIG_ACTIVITIES.name);
        this.storage.remove("DATE_" + AppSettings.STORE_CONFIG_PRODUCTS.name);
        this.storage.remove("PAGE_" + AppSettings.STORE_CONFIG_PRODUCTS.name);
        //Resto de Date and Pages de los providers

        this.dbProvider.getDB().then((db) => {

          for (let i = 0; i < AppSettings.STORES.length; i++) {
            let sql = 'DELETE FROM '+AppSettings.STORES[i].name;
            this.dbProvider.query(sql, []);
          }       
          /*          
          objectStoreRequestP.onsuccess = function (event) {
            console.log("Base de datos de PARTNERS limpiada correctamente");
          };
          objectStoreRequestA.onsuccess = function (event) {
            console.log("Base de datos de ACTIVITIES limpiada correctamente");
          };
          objectStoreRequestPr.onsuccess = function (event) {
            console.log("Base de datos de PRODUCTS limpiada correctamente");
          };

          objectStoreRequestP.onerror = function (event) {
            console.log("Base de datos de PARTNERS no ha sido limpiada correctamente");
          };
          objectStoreRequestA.onerror = function (event) {
            console.log("Base de datos de ACTIVITIES no ha sido limpiada correctamente");
          };
          objectStoreRequestPr.onerror = function (event) {
            console.log("Base de datos de PRODUCTS no ha sido limpiada correctamente");
          };
          */
          this.syncAll(false).subscribe(subscriber);
        });
      } else {
        this.syncRUser()
        // this.syncProducts(subscriber)
          // .then((e) => this.syncPartners(subscriber))
          // .then((e) => this.syncActivities(subscriber))
          .then((e) => subscriber.complete())
          .then((e) => this.changeDateSync())
          .catch((e) => subscriber.error(e));

      }
    });
  }
  changeDateSync() {
    console.log("Modificamos la última fecha de sincronización");
    let dateSync = new Date();

    let stringSync = ("0" + dateSync.getHours()).slice(-2) + ":" + ("0" + dateSync.getMinutes()).slice(-2) + " - " + ("0" + dateSync.getDate()).slice(-2) + "/" + ("0" + (dateSync.getMonth() + 1)).slice(-2) + "/" + dateSync.getFullYear();

    this.loginProvider.user.lastSync = stringSync;


  }

  //SYNC y GET Partners
  syncPartners(subscriber: Subscriber<{ element: string, percent: number }>): Promise<void> {
    return this.sync(AppSettings.STORE_CONFIG_PARTNERS, subscriber);
  }

  updatePartner(partner: Partner): Promise<void> {
    if (AppSettings.STORE_CONFIG_PARTNERS.preInsert) {
      AppSettings.STORE_CONFIG_PARTNERS.preInsert(partner);
    }
    return this.dbProvider.getDB().then((db) => {
      return this.storeItemUpdate(db, AppSettings.STORE_CONFIG_PARTNERS, partner);
    });
  }

  deletePartner(partner: Partner): Promise<void> {
    return this.dbProvider.getDB().then((db) => {
      return this.storeItemDelete(db, AppSettings.STORE_CONFIG_PARTNERS, this.getItemKey(AppSettings.STORE_CONFIG_PARTNERS, partner));
    });
  }
  getPartner(id: string): Promise<Partner> {
    return this.getItem(AppSettings.STORE_CONFIG_PARTNERS, undefined, [id]);
  }

  getPartnerAbstract(id: string): Promise<PartnerAbstract> {
    return this.getItemAbstract(AppSettings.STORE_CONFIG_PARTNERS, AppSettings.PARTNER_ABSTRACT_PARSE, undefined, [id]);
  }

  getPartners(whereClause?: string, whereValues?: any[], page?: number, pageSize?: number, collate?: string): Promise<Partner[]> {
    return this.getItems(AppSettings.STORE_CONFIG_PARTNERS, whereClause, whereValues, page, pageSize, collate);
  }

  getPartnerAbstracts(whereClause?: string, whereValues?: any[], page?: number, pageSize?: number, orderBy?: string, collate?: string): Promise<PartnerAbstract[]> {
    return this.getAbstracts(AppSettings.STORE_CONFIG_PARTNERS, AppSettings.PARTNER_ABSTRACT_PARSE, whereClause, whereValues, page, pageSize, orderBy, collate);
  }

  getPartnersCount(storeConfig: StoreConfig, whereClause?: string, whereValues?: any[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {    
      this.dbProvider.getDB().then((db) => {
              
        let sql = 'SELECT COUNT(ID) FROM '+storeConfig.name;
       
        if (whereClause) {
          sql += " WHERE "+whereClause;
        } else if (whereValues && whereValues.length == 1) {
          sql += " WHERE ID= ?";
        }      
       
        this.dbProvider.query(sql, whereValues ? whereValues : [])
        .then((response) => {
          resolve(response.res.rows.item ? response.res.rows.item(0)['COUNT(ID)'] : response.res.rows[0]['COUNT(ID)'])
        })
        .catch(         
          (e) => reject
        );
      }, (e) => reject);
    });
  }

  //SYNC y GET Activities
  syncActivities(subscriber: Subscriber<{ element: string, percent: number }>): Promise<void> {
    return this.sync(AppSettings.STORE_CONFIG_ACTIVITIES, subscriber);
  }

  updateActivity(activity: Activity): Promise<void> {
    if (AppSettings.STORE_CONFIG_ACTIVITIES.preInsert) {
      AppSettings.STORE_CONFIG_ACTIVITIES.preInsert(activity);
    }
    return this.dbProvider.getDB().then((db) => {
      return this.storeItemUpdate(db, AppSettings.STORE_CONFIG_ACTIVITIES, activity);
    });
  }

  deleteActivity(activity: Activity): Promise<void> {
    return this.dbProvider.getDB().then((db) => {
      return this.storeItemDelete(db, AppSettings.STORE_CONFIG_ACTIVITIES, this.getItemKey(AppSettings.STORE_CONFIG_ACTIVITIES, activity));
    });
  }

  getActivity(id: string): Promise<Activity> {
    return this.getItem(AppSettings.STORE_CONFIG_ACTIVITIES, undefined, [id]);
  }

  getActivities(whereQuery?: string, data?: [any], page?: number, pageSize?: number): Promise<Activity[]> {
    return this.getItems(AppSettings.STORE_CONFIG_ACTIVITIES, whereQuery, data, page, pageSize);
  }

  getActivitiesAbstracts(whereClause?: string, whereValues?: any[], page?: number, pageSize?: number): Promise<ActivityAbstract[]> {
    return this.getAbstracts(AppSettings.STORE_CONFIG_ACTIVITIES, AppSettings.ACTIVITY_ABSTRACT_PARSE, whereClause, whereValues, page, pageSize);
  }

  getActivitiesCount(storeConfig: StoreConfig, whereClause?: string, whereValues?: any[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {    
      this.dbProvider.getDB().then((db) => {
              
        let sql = 'SELECT COUNT(ID) FROM '+storeConfig.name;
       
        if (whereClause) {
          sql += " WHERE "+whereClause;
        } else if (whereValues && whereValues.length == 1) {
          sql += " WHERE ID= ?";
        }      
       
        this.dbProvider.query(sql, whereValues ? whereValues : [])
        .then((response) => {
          resolve(response.res.rows.item ? response.res.rows.item(0)['COUNT(ID)'] : response.res.rows[0]['COUNT(ID)'])
        })
        .catch(         
          (e) => reject
        );
      }, (e) => reject);
    });
  }

  //SYNC y GET Orders
  syncOrders(subscriber: Subscriber<{ element: string, percent: number }>): Promise<void> {
    return this.sync(AppSettings.STORE_CONFIG_ACTIVITIES, subscriber);
  }

  getOrder(id: string): Promise<Order> {
    return this.getItem(AppSettings.STORE_CONFIG_ACTIVITIES, undefined, [id]);
  }

  getOrders(whereQuery?: string, data?: [any], page?: number, pageSize?: number): Promise<Order[]> {
    return this.getItems(AppSettings.STORE_CONFIG_ACTIVITIES, whereQuery, data, page, pageSize);
  }

  getOrdersAbstracts(whereClause?: string, whereValues?: any[], page?: number, pageSize?: number, orderBy?: string): Promise<OrderAbstract[]> {
    return this.getAbstracts(AppSettings.STORE_CONFIG_ACTIVITIES, AppSettings.ORDER_ABSTRACT_PARSE, whereClause, whereValues, page, pageSize, orderBy);
  }

  getOrdersCount(storeConfig: StoreConfig, whereClause?: string, whereValues?: any[], page?: number, pageSize?: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {    
      this.dbProvider.getDB().then((db) => {
              
        let sql = 'SELECT COUNT(ID) FROM '+storeConfig.name;
       
        if (whereClause) {
          sql += " WHERE "+whereClause;
        } else if (whereValues && whereValues.length == 1) {
          sql += " WHERE ID= ?";
        }      

        if(pageSize){
           sql += " LIMIT "+pageSize;
        }

        if(page){
          sql += " OFFSET "+(page*pageSize);

        }
       
        this.dbProvider.query(sql, whereValues ? whereValues : [])
        .then((response) => {
          resolve(response.res.rows.item ? response.res.rows.item(0)['COUNT(ID)'] : response.res.rows[0]['COUNT(ID)'])
        })
        .catch(         
          (e) => reject
        );
      }, (e) => reject);
    });
  }

  //SYNC y GET Products
  syncProducts(subscriber: Subscriber<{ element: string, percent: number }>): Promise<void> {
    return this.sync(AppSettings.STORE_CONFIG_PRODUCTS, subscriber);
  }

  getProduct(id: string): Promise<Product> {
    return this.getItem(AppSettings.STORE_CONFIG_PRODUCTS, undefined, [id]).then();
  }

  getProductAbstract(id: string): Promise<ProductAbstract> {
    return this.getItemAbstract(AppSettings.STORE_CONFIG_PRODUCTS, AppSettings.PRODUCT_ABSTRACT_PARSE, undefined, [id]);
  }

  getProducts(whereClause?: string, whereValues?: any[], page?: number, pageSize?: number): Promise<Product[]> {
    return this.getItems(AppSettings.STORE_CONFIG_PRODUCTS, whereClause, whereValues, page, pageSize);
  }

  getProductsAbstracts(whereQuery?: string, data?: any[], page?: number, pageSize?: number): Promise<ProductAbstract[]> {
    return this.getAbstracts(AppSettings.STORE_CONFIG_PRODUCTS, AppSettings.PRODUCT_ABSTRACT_PARSE, whereQuery, data, page, pageSize);
  }

}