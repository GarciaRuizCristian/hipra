import { OrderAbstract } from '../models/orderAbstract';
import { Injectable } from '@angular/core';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { ToastController } from 'ionic-angular/components/toast/toast';
import { AlertController } from 'ionic-angular/components/alert/alert';
import { Loading, LoadingController } from 'ionic-angular';
import { Partner } from '../models/partner';
import { Activity } from '../models/activity';
import { ActivityAbstract } from '../models/activityAbstract';
import { NgZone } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class UtilsProvider {
  private loading: Loading;
  private loadingCount: number = 0;
  private isOpenedAlertConnectionError = false;

  public potencials: {
    value: string,
  }[];

  public titlesNames: {
    text: string,
    value: string,
  }[];

  public permisos: {
    text: string,
    value: string,
  }[];

  constructor(private loadingCtrl: LoadingController, public translate: TranslateService,
    public toastCtrl: ToastController, public alertCtrl: AlertController, public ngZone: NgZone) {
  }


  isConnectionError(error) {
    return error && (error.status == 0 // error de browser 
      || error.errorMsg == "The Internet connection appears to be offline.");// error en IOS

  }

  setLoadingMessage(loadingMessage: string): void {
    if (this.loading.getContent() != loadingMessage) {
      console.log("loading message: " + loadingMessage);
      this.ngZone.run(() => {
        this.loading.setContent(loadingMessage);
      });
    }
  }

  setLoadingCount(count: number): void {
    let prevLoadingCount = this.loadingCount;
    this.loadingCount = count;
    if (this.loadingCount == 0 && prevLoadingCount != 0) {
      this.loading.dismiss();
    } else if (this.loadingCount != 0 && prevLoadingCount == 0) {
      this.presentLoading();
    }
  }

  getLoadingCount(): number {
    return this.loadingCount;
  }

  showLoading(message?: string): void {
    this.loadingCount++;
    if (this.loadingCount == 1) {
      this.presentLoading(message);
    }
  }

  private presentLoading(message?: string) {
    this.translate.get('WaitPlease').subscribe(waitPlease => {
      this.loading = this.loadingCtrl.create({
        content: message ? message : waitPlease
      });
      this.loading.present();
    });
  }

  hideLoading(): void {
    this.loadingCount--;
    if (this.loadingCount == 0) {
      this.loading.dismiss();
    }
  }

  showAlertInfo(Tittle: string, Message: string): void {
    console.log("showAlertInfo(" + JSON.stringify(Tittle) + " | " + JSON.stringify(Message) + ")");

    this.translate.get(Tittle).subscribe(
      tittle => {
        this.translate.get(Message).subscribe(
          message => {
            let info = this.alertCtrl.create({
              title: tittle,
              message: message,
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    console.log('OK clicked');
                  }
                }]
              });
              info.present();
          });
    });
  }

  showAlertConnectionError(Tittle: string, Message: string): void {
    console.log("showAlertConnectionError(" + JSON.stringify(Tittle) + " | " + JSON.stringify(Message) + ")");

    this.translate.get(Tittle).subscribe(
      tittle => {
        this.translate.get(Message).subscribe(
          message => {
            let info = this.alertCtrl.create({
              title: tittle,
              message: message,
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    console.log('OK clicked');
                  }
                }]
              });
              info.onDidDismiss(() => {
                this.isOpenedAlertConnectionError = false;
              });
              info.present();
          });
    });
  }

  showToast(message: any): void {
    console.log("showToast(" + JSON.stringify(message) + ")");
    if (this.isConnectionError(message) && !this.isOpenedAlertConnectionError) {
      this.isOpenedAlertConnectionError = true;
      return this.showAlertConnectionError('offlineMessage', 'TaskOfflineMessage');
    }
    if (message && message.errorMsg) {
      message = message.errorMsg;
    }
    if (message && message.message) {
      message = message.message;
    }
    if (typeof message == "string") {
      this.showToastString(message);
    } else {
      let toast = this.toastCtrl.create({
        message: JSON.stringify(message),
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    }
  }
  private showToastString(message: string): void {
    if (message != "") {
      this.translate.get(message).subscribe(x => {
        let newMessage = x ? x : message;
        let toast = this.toastCtrl.create({
          message: newMessage,
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
      });
    }
  }

  generateGuid() {
    let result = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return result;
  }

  fixArrays(obj) {
    for (let key in obj) {
      if (typeof obj[key] === "object" && obj[key]["item"]) {
        if (Array.isArray(obj[key]["item"])) {
          obj[key] = this.fixArrays(obj[key]["item"]);
        } else {
          obj[key] = this.fixArrays([obj[key]["item"]]);
        }
      } else if (typeof obj[key] === "object") {
        obj[key] = this.fixArrays(obj[key]);
      }
    }
    return obj;
  }

  unfixArrays(obj) {
    return obj;
  }

  getTitlesTreatment() {
    this.translate.get('TitleName04').subscribe(
      TitleName04 => {
        this.translate.get('TitleName02').subscribe(
          TitleName02 => {
            this.translate.get('TitleName01').subscribe(
              TitleName01 => {
                this.translate.get('TitleName03').subscribe(
                  TitleName03 => {
                    this.titlesNames = [{
                      text: TitleName04,
                      value: "04"
                    }, {
                      text: TitleName02,
                      value: "02"
                    }, {
                      text: TitleName01,
                      value: "01"
                    }, {
                      text: TitleName03,
                      value: "03"
                    }];
                  });
              });
          });
      });     
    return this.titlesNames;
  }

  getPermisos() {
    this.translate.get('Permitted').subscribe(
      Permitted => {
        this.translate.get('Prohibit').subscribe(
          Prohibit => {
            this.translate.get('CheckPermit').subscribe(
              CheckPermit => {
                this.permisos = [{
                  text: Permitted,
                  value: "1"
                }, {
                  text: Prohibit,
                  value: "2"
                }, {
                  text: CheckPermit,
                  value: "3"
                }];
              });
          });
      });
    return this.permisos;
  }

  getPotencials() {
    this.potencials = [{
      value: "A"
    }, {
      value: "B"
    }, {
      value: "C"
    }, {
      value: "D"
    }];
    return this.potencials;
  }

  //Devolvemos la descripción de la operación
  getProcessType(activity: ActivityAbstract, operations) {
    for (let operacion of operations) {
      if (operacion.PROCESS_TYPE == activity.OPERATION) {
        return operacion.P_DESCRIPTION;
      }
    }
  }

  getOrderOperation(order: OrderAbstract, operations) {
    for (let operacion of operations) {
      if (operacion.PROCESS_TYPE == order.OPERATION) {
        return operacion.P_DESCRIPTION_20;
      }
    }
  }

  fixActivity(activity: any): Activity {//TODO

    activity.HEADER = activity.HEADER ? activity.HEADER : {
      RESULT: "",
      GUID: "",
      HANDLE: "",
      PROCESS_TYPE: "",
      OBJECT_ID: "",
      PREDECESSOR_PROCESS: "",
      PREDECESSOR_OBJECT_TYPE: "",
      PREDECESSOR_LOG_SYSTEM: "",
      BIN_RELATION_TYPE: "",
      LOGICAL_SYSTEM: "",
      DESCR_LANGUAGE: "",
      LANGU_ISO: "",
      DESCRIPTION: "",
      CATEGORY: "",
      PRIORITY: "",
      OBJECTIVE: "",
      DIRECTION: "",
      EXTERN_ACT_ID: "",
      ADDRESS_ID: "",
      ADDRESS_GUID: "",
      PRIVATE_FLAG: "",
      COMPLETION: "",
      POSTING_DATE: "",
      MODE: "",
      CREATED_AT: "",
      CREATED_BY: "",
      CHANGED_AT: "",
      CHANGED_BY: "",
      ACT_LOCATION: ""
    };

    activity.PARTNERS = activity.PARTNERS ? activity.PARTNERS : [];
    activity.DATE = activity.DATE ? activity.DATE : [{
      REF_GUID: "",
      REF_HANDLE: "0000000000",
      REF_KIND: "",
      APPT_TYPE: 'ORDERPLANNED',
      TIMESTAMP_FROM: "",
      TIMEZONE_FROM: "UTC",
      TIMESTAMP_TO: "",
      TIMEZONE_TO: "UTC",
      DATE_FROM: "",
      DATE_TO: "",
      TIME_FROM: "",
      TIME_TO: "",
      SHOW_LOCAL: "",
      DOMINANT: "",
      RULE_ID: "",
      RULE_NAME: "",
      DURATION: "",
      TIME_UNIT: "",
      IS_DURATION: "",
      MODE: ""
    }];
    activity.OUTCOME = activity.OUTCOME ? activity.OUTCOME : [{
      REF_GUID: "",
      REF_HANDLE: "",
      CODE_GROUP: "",
      CODE: "",
      MODE: ""
    }];
    activity.REASON = activity.REASON ? activity.REASON : [];
    activity.TEXT = activity.TEXT ? activity.TEXT : [];
    activity.STATUS_TAB = activity.STATUS_TAB ? activity.STATUS_TAB : [{
      REF_GUID: "",
      REF_HANDLE: "0000000000",
      REF_KIND: "",
      STATUS: "E0001",
      USER_STAT_PROC: 'CRMACTIV',
      ACTIVATE: "",
      PROCESS: ""
    }];
    activity.MATERIAL_TAB = activity.MATERIAL_TAB ? activity.MATERIAL_TAB : [];

    activity.DATE_1 = activity.DATE_1 ? activity.DATE_1 : "";
    activity.DATE_2 = activity.DATE_2 ? activity.DATE_2 : "";
    activity.DATE_3 = activity.DATE_3 ? activity.DATE_3 : "";
    activity.DATE_4 = activity.DATE_4 ? activity.DATE_4 : "";
    activity.ZZICALGUID = activity.ZZICALGUID ? activity.ZZICALGUID : "";

    return activity;
  }

  fixPartner(partner: any): Partner {
    partner.ACT_LIST = partner.ACT_LIST ? partner.ACT_LIST : "";
    partner.ADFAX = partner.ADFAX ? partner.ADFAX : [];
    partner.ADSMTP = partner.ADSMTP ? partner.ADSMTP : [];
    partner.ADTEL = partner.ADTEL ? partner.ADTEL : [];
    partner.ADURI = partner.ADURI ? partner.ADURI : [];
    partner.ADUSE = partner.ADUSE ? partner.ADUSE : [];
    partner.CATEGORY = partner.CATEGORY ? partner.CATEGORY : "";
    partner.CENTRAL = partner.CENTRAL ? partner.CENTRAL : {
      SEARCHTERM1: "",
      SEARCHTERM2: "",
      AUTHORIZATIONGROUP: "",
      PARTNERLANGUAGE: "",
      PARTNERLANGUAGEISO: "",
      DATAORIGINTYPE: "",
      CENTRALARCHIVINGFLAG: "",
      CENTRALBLOCK: "",
      TITLE_KEY: "",
      CONTACTALLOWANCE: "",
      PARTNEREXTERNAL: "",
      TITLELETTER: "",
      NOTRELEASED: "",
      COMM_TYPE: "",
      PRINT_MODE: ""
    };
    partner.CENTRAL_CUSTOMER_EXT = partner.CENTRAL_CUSTOMER_EXT ? partner.CENTRAL_CUSTOMER_EXT : {
      ZZDIAGNOS: "",
      ZZHIPRASOFT: "",
      ZZDEPARTMENT: "",
      ZZDIAGNOS_VE: "",
      ZZCREATED_BY: "",
      ZZFUNCTION: "",
      ZZESP06: "",
      ZZESP07: "",
      ZZREDCIAL: "",
      ZZESP08: "",
      ZZMOBILEID: "",
      ZZWEBPWD: "",
      ZZESP09: "",
      ZZFELICITACI: "",
      ZZZONA: "",
      ZZESP01: "",
      ZZESP02: "",
      ZZESP03: "",
      ZZHIPRALINK: "",
      ZZESP04: "",
      ZZESP05: "",
      ZZOBSEQUIO: "",
      ZZCATALOGO: "",
      BP_EEW_DUMMY: "",
      ZZRUTACOMERC: "",
      ZZEDIAGN: "",
      ZZVIC: "",
      ZZEDIAGNPLUS: "",
      ZZSOLOCONTAC: "",
      ZZESP10: "",
      ZZWEBUSR: "",
    };
    partner.CENTRAL_ORGAN = partner.CENTRAL_ORGAN ? partner.CENTRAL_ORGAN : {
      NAME4: "",
      NAME3: "",
      INDUSTRYSECTOR: "",
      FOUNDATIONDATE: "",
      LIQUIDATIONDATE: "",
      CHK_DIGIT: "",
      LEGALFORM: "",
      LOC_NO_2: "",
      LOC_NO_1: "",
      LEGALORG: "",
      NAME2: "",
      NAME1: ""
    };
    partner.CLASSIFIC = partner.CLASSIFIC ? partner.CLASSIFIC : {
      IS_CUSTOMER: "",
      NIELSEN_ID: "",
      CLASSIFIC: "",
      IS_COD_CUSTOMER: "",
      ATTRIBUTE: "",
      INDUSTRY: "",
      ATTRIB_2: "",
      ATTRIB_3: "",
      ATTRIB_4: "",
      ATTRIB_10: "",
      IS_PROSPECT: "",
      ATTRIB_9: "",
      IS_CONSUMER: "",
      ATTRIB_5: "",
      ATTRIB_6: "",
      CUSTOMER_SINCE: "",
      ATTRIB_7: "",
      ATTRIB_8: "",
      IS_COMPETITOR: "",
      IS_RENTED: "",
      ACCOUNT_GROUP: ""
    };
    partner.DATA_ADDRESS = partner.DATA_ADDRESS ? partner.DATA_ADDRESS : {
      HOMECITYNO: "",
      CHCKSTATUS: "",
      CITY_NO: "",
      FLOOR: "",
      COUNTRY: "",
      VALIDFROMDATE: "",
      PO_BOX_CIT: "",
      HOUSE_NO2: "",
      HOUSE_NO3: "",
      POSTL_COD2: "",
      STANDARDADDRESS: "",
      POSTL_COD1: "",
      LANGUISO: "",
      POSTL_COD3: "",
      ROOM_NO: "",
      REGION: "",
      DISTRCT_NO: "",
      PBOXCIT_NO: "",
      POBOX_CTRY: "",
      LOCATION: "",
      PCODE1_EXT: "",
      PO_CTRYISO: "",
      STR_ABBR: "",
      DISTRICT: "",
      TIME_ZONE: "",
      BUILDING: "",
      HOME_CITY: "",
      MOVE_DATE: "",
      COMM_TYPE: "",
      PCODE3_EXT: "",
      PO_BOX: "",
      LANGU: "",
      STREET: "",
      COUNTRYISO: "",
      PO_BOX_REG: "",
      MOVE_ADDR_GUID: "",
      DONT_USE_P: "",
      CITY: "",
      MOVE_ADDRESS: "",
      REGIOGROUP: "",
      TAXJURCODE: "",
      DONT_USE_S: "",
      STREET_NO: "",
      C_O_NAME: "",
      PCODE2_EXT: "",
      PO_W_O_NO: "",
      STR_SUPPL2: "",
      STR_SUPPL3: "",
      VALIDTODATE: "",
      TRANSPZONE: "",
      EXTADDRESSNUMBER: "",
      HOUSE_NO: "",
      STR_SUPPL1: ""
    };
    partner.DATA_INFO = partner.DATA_INFO ? partner.DATA_INFO : {
      CREATIONDATE: "",
      CREATIONTIME: "",
      CREATIONUSER: "",
      LASTCHANGEDATE: "",
      LASTCHANGETIME: "",
      LASTCHANGEUSER: "",
      PERS_NO: ""
    };
    partner.GEODATA = partner.GEODATA ? partner.GEODATA : {};
    partner.GROUP = partner.GROUP ? partner.GROUP : "";
    partner.MKT_ATTR = partner.MKT_ATTR ? partner.MKT_ATTR : [];
    partner.PARTNER = partner.PARTNER ? partner.PARTNER : "";
    partner.PARTNER_GUID = partner.PARTNER_GUID ? partner.PARTNER_GUID : "";
    partner.RELATIONS = partner.RELATIONS ? partner.RELATIONS : [];
    partner.SALES = partner.SALES ? partner.SALES : {};
    partner.TEXT = partner.TEXT ? partner.TEXT : [];

    return partner;
  }

  dateToddMMyyyy(date, separator) {
    return ("0" + date.getDate()).slice(-2) + separator + ("0" + (date.getMonth() + 1)).slice(-2) + separator + date.getFullYear();
  }
}