import { LoginProvider } from '../../providers/login-provider';
import { ActivityReason } from '../../models/activityReason';
import { Category } from '../../models/category';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, ModalController, AlertController, Content } from 'ionic-angular';
import { AppSettings } from '../../config/app-settings';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Partner } from '../../models/partner';
import { PartnerAbstract } from '../../models/partnerAbstract';
import { Product } from '../../models/product';
import { ProductAbstract } from '../../models/productAbstract';
import { QueueProvider } from '../../providers/queue-provider';
import { SapcrmWebProvider } from '../../providers/sapcrm-web-provider';
import { SapcrmCacheProvider } from '../../providers/sapcrm-cache-provider';
import { UtilsProvider } from '../../providers/utils-provider';
import { SelectSearchModal } from '../../components/select-search/select-search-modal';
import { SelectSearchModalWeb } from '../../components/select-search/select-search-modal-web';
import { Activity } from '../../models/activity';
import { Status } from '../../models/status';
import { ActivityResult } from '../../models/ActivityResult';
import { TextActClasses } from '../../models/textActClasses';
import { Objectives } from '../../models/objectives';
import { OperationsClass } from '../../models/operations_class';
import { SelectMultipleModal } from '../../components/select-multiple-modal/select-multiple-modal';
import { TranslateService } from 'ng2-translate/src/translate.service';

import { ContactPage } from '../contact/contact';
import { FillActivityNoteModal } from "../../components/fill-activity-note-modal/fill-activity-note-modal";
import { LoaderProvider } from "../../providers/loader-provider";
import { PartnersWebProvider } from "../../providers/partners-web-provider";



@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html'
})
export class ActivityPage {
  @ViewChild(Content) content: Content;

  submitAttempt: boolean = false;
  operation: any;
  existActivity: boolean;

  activity: Activity;
  copyActivity: any;
  ablePop: boolean = false;

  activityForm: FormGroup;
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;

  users: Array<PartnerAbstract>;
  usersFirm: Array<PartnerAbstract>;
  usersPartners: Array<PartnerAbstract>;
  contactsPartners: Array<PartnerAbstract> = [];
  textClass: Array<TextActClasses>;
  allNotesToDelete: Array<any> = [];

  objectives: Array<Objectives>;
  categories: Array<Category>;
  reasons: Array<ActivityReason>;
  results: Array<ActivityResult>;
  textAct: Array<TextActClasses>;
  states: Array<Status>;
  operations: Array<OperationsClass>;

  contactInterlocutors: any[] = [];
  contactPerson: any = {};
  inChargeOf: any = {};
  interlocutorsExpanded: boolean = false;
  contactPersonsExpanded: boolean = false;

  partnerAbstracts: Array<PartnerAbstract> = [];

  currentTimeTo: string;
  currentTimeFrom: string;
  currentDayTo: string;
  currentDayFrom: string;
  lastTimeTo: string;
  lastTimeFrom: string;
  lastDayTo: string;
  lastDayFrom: string;

  maxYear: number;

  paramsPop: string;

  isBusy = false;
  openingOtherPage = false;

  generalOpened: boolean = true;
  contactInterlocutorOpened: boolean = true;
  notesOpened: boolean = true;
  employeeResponsibleOpened: boolean = true;
  productsOpened: boolean = true;

  currentObjetive: { OBJECTIVE: string, DESCRIPTION: string } = {
    OBJECTIVE: "",
    DESCRIPTION: ""
  };
  currentCategory: { CATEGORY: string, DESCRIPTION: string } = {
    CATEGORY: "",
    DESCRIPTION: ""
  };
  currentStatus: { STATUS: string, TXT30: string } = {
    STATUS: "",
    TXT30: ""
  };

  currentReason: { CODE: string, TEXT: string } = {
    CODE: "",
    TEXT: ""
  }

  currentResult: { CODE: string, TEXT: string } = {
    CODE: "",
    TEXT: ""
  }

  loadingActivity: boolean = true;
  loadingOption: boolean = false;
  loadingEmployeeResponsibles: boolean = false;
  loadingContactInterlocutors: boolean = false;
  loadingProducts: boolean = false;

  isDuplicateable = false;
  isDeleteable = false;
  isSaveable = false;

  constructor(public navCtrl: NavController, 
              private formBuilder: FormBuilder, 
              private utils: UtilsProvider,
              public sapcrmWebProvider: SapcrmWebProvider,
              public queueProvider: QueueProvider, 
              public sapcrmCacheProvider: SapcrmCacheProvider, 
              public navParams: NavParams, 
              public modalCtrl: ModalController,
              public cdRef: ChangeDetectorRef, 
              public alertCtrl: AlertController, 
              private ev: Events,
              private translate: TranslateService, 
              private loginProvider: LoginProvider, 
              private loaderProvider: LoaderProvider,
              private partnersWebProvider: PartnersWebProvider
  ) {

    this.maxYear = new Date().getFullYear() + 10;

    this.operation = new Object();
    this.existActivity = false;
    this.activity = this.utils.fixActivity({});
    this.myNameOperation();

    this.navParams.get("isDeleteable") == null ? this.isDeleteable = true : this.isDeleteable = false;

    let full_activity = navParams.get('full');
    if (full_activity) {
      this.isDuplicateable = false;
      this.isDeleteable = false;
      this.isSaveable = true;
      this.activity = this.utils.fixActivity(full_activity);//He recibido la activity
      this.existActivity = true;
      this.fixPartners().then(() => {
        this.fixProducts();
        this.fixNotes();
        this.copyActivity = JSON.parse(JSON.stringify(this.activity));
        this.loadCacheData().then(() => {
          this.setCurrentInitialActivity();
          this.loadingActivity = false;
        });
      });
    }
    else if (navParams.get('guid')) {
      this.isDuplicateable = true;
      this.isDeleteable = true;
      this.isSaveable = true;
      this.sapcrmWebProvider.syncOptimizedActivity(navParams.get('guid')).then((res) => {
          this.activity = this.utils.fixActivity(res);//He recibido la activity
          this.existActivity = true;
          this.fixPartners().then(() => {
            this.fixProducts();
            this.fixNotes();
            this.copyActivity = JSON.parse(JSON.stringify(this.activity));
            return this.loadCacheData().then(() => {
              this.setCurrentInitialActivity();
              this.loadingActivity = false;
            });
          });
        },
        (error) => {
          this.utils.showToast(error);
          this.loadingActivity = false;
        });
    } else {// es nuevo
      this.isDuplicateable = true;
      this.isDeleteable = false;
      this.isSaveable = true;
      let operacion = navParams.get('operacion');
      let partnerFromContactPage = navParams.get('partnerFromContactPage');

      if (partnerFromContactPage) { //esta actividad es creada desde un contacto
        this.autocompleteContactAndRelation(partnerFromContactPage);
      }

      if (!operacion) {
        throw "DEVELOPMENT EXCEPTION: DEBE indicar la operacion para nuevos"
      }
      this.activity.HEADER.OBJECT_ID = this.utils.generateGuid();
      this.activity.HEADER.PROCESS_TYPE = operacion;
      this.defaultDates();
      this.loadCacheData().then(() => {
        this.fillEmployeeResponsible().then(() => {
          this.loadingActivity = false;
        });
      });
    }

    if (navParams.get('user')) {
      let partner = {
        PARTNER_FCT: "00000009",
        PARTNER_NO: navParams.get('user'),
      };
      this.activity.PARTNERS.splice(this.activity.PARTNERS.length, 0, partner);
    }

    this.activityForm = new FormGroup({
      DESCRIPTION: new FormControl({ value: '' }, Validators.compose([Validators.required])),
    });

  }

  ionViewDidEnter() {
    this.openingOtherPage = false; //Estamos en la pagina principal
    console.log('ionViewDidEnter ActivityPage');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivityPage');

  }

  ionViewCanLeave() {
    // here we can either return true or false
    // depending on if we want to leave this view

    //Si pasamos a otra pagina, no comprobamos los cambios
    if (this.openingOtherPage)
      return Promise.resolve();

    return new Promise((resolve, reject) => {
      let changes = JSON.stringify(this.activity) === JSON.stringify(this.copyActivity);
      console.log("Comprobamos si son iguales  =" + changes);
      this.translate.get('LostChangesAccepted').subscribe(
        lostChangesAccepted => {
          this.translate.get('LostChanges').subscribe(
            lostChanges => {
              this.translate.get('Cancel').subscribe(
                cancel => {
                  this.translate.get('Agree').subscribe(
                    agree => {
                      if (!changes && !this.ablePop) {
                        let confirm = this.alertCtrl.create({
                          title: lostChanges,
                          message: lostChangesAccepted,
                          enableBackdropDismiss: false,
                          buttons: [
                            {
                              text: cancel,
                              handler: () => {
                                reject();
                              }
                            },
                            {
                              text: agree,
                              handler: () => {
                                resolve();
                              }
                            }
                          ]
                        });
                        confirm.present();
                      } else {
                        resolve();
                      }
                    });
                });
            });
        });
    });
  }

  setCurrentInitialActivity() {
    this.setCurrentFechasFromMilliseconds();
    this.setCurrentCategory();
    this.setCurrentObjective();
    this.setCurrentStatus();
    this.setCurrentResult();
    this.setCurrentReason();
  }

  loadCacheData() {
    return Promise.all([
      this.loadResult(),
      this.loadObjectives(),
      this.loadCategories(),
      this.loadReasons(),
      this.loadStatus(),
      this.loadTextActivities(),
      this.loadContactPerson(),
      this.loadTextClass()
    ]);
  }

  setCurrentResult() {
    for (let result of this.results) {
      if (result.CODE == this.activity.OUTCOME[0].CODE) {
        this.currentResult.CODE = result.CODE;
        this.currentResult.TEXT = result.TEXT;
      }
    }
  }

  setCurrentReason() {
    for (let reason of this.reasons) {
      if (this.activity.REASON.length > 0 && reason.CODE == this.activity.REASON[0].CODE) {
        this.currentReason.TEXT = reason.TEXT;
        this.currentReason.CODE = reason.CODE;
      }
    }
  }

  setCurrentStatus() {
    for (let status of this.states) {
      if (status.STATUS == this.activity.STATUS_TAB[0].STATUS) {
        this.currentStatus.STATUS = status.STATUS;
        this.currentStatus.TXT30 = status.TXT30;
      }
    }
  }

  setCurrentObjective() {
    for (let objective of this.objectives) {
      if (objective.OBJECTIVE == this.activity.HEADER.OBJECTIVE) {
        this.currentObjetive.OBJECTIVE = objective.OBJECTIVE;
        this.currentObjetive.DESCRIPTION = objective.DESCRIPTION;
      }
    }
  }

  setCurrentCategory() {
    for (let category of this.categories) {
      if (category.CATEGORY == this.activity.HEADER.CATEGORY) {
        this.currentCategory.CATEGORY = category.CATEGORY;
        this.currentCategory.DESCRIPTION = category.DESCRIPTION;
      }
    }
  }

  setCurrentFechasFromMilliseconds() {
    let timeFrom = new Date(this.activity.DATETIME_FROM);
    this.currentTimeFrom = (timeFrom.getHours() < 10 ? '0' + timeFrom.getHours() : timeFrom.getHours()) + ":" + (timeFrom.getUTCMinutes() < 10 ? '0' + timeFrom.getUTCMinutes() : timeFrom.getUTCMinutes());
    let timeTo = new Date(this.activity.DATETIME_TO);
    this.currentTimeTo = (timeTo.getHours() < 10 ? '0' + timeTo.getHours() : timeTo.getHours()) + ":" + (timeTo.getUTCMinutes() < 10 ? '0' + timeTo.getUTCMinutes() : timeTo.getUTCMinutes());

    this.currentDayFrom = timeFrom.getFullYear() + "-"
      + (timeFrom.getMonth() + 1 < 10 ? '0' + (timeFrom.getMonth() + 1) : timeFrom.getMonth() + 1) + "-"
      + (timeFrom.getDate() < 10 ? '0' + timeFrom.getDate() : timeFrom.getDate());
    this.currentDayTo = timeTo.getFullYear() + "-"
      + (timeTo.getMonth() + 1 < 10 ? '0' + (timeTo.getMonth() + 1) : timeTo.getMonth() + 1) + "-"
      + (timeTo.getDate() < 10 ? '0' + timeTo.getDate() : timeTo.getDate());
  }

  autocompleteContactAndRelation(partnerFromContactPage: Partner) {
    //Si el contacto es "persona de contacto", se aniaden sus relaciones, es decir,
    //dentro de cada relacion, se aniade la empresa como interlocutor de contacto y al propio contacto como "persona de contacto"
    if (partnerFromContactPage.CLASSIFIC.CLASSIFIC == "10") {
      if (partnerFromContactPage.RELATIONS.length == 1) { //Solo tiene una relacion
        this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', partnerFromContactPage.RELATIONS[0].PARTNER2, '').then((partner) => {
          let objectPartner = {
            PARTNER_FCT: "00000009",
            PARTNER_NO: partner.PARTNER,
            FULLNAME: partner.NAME
          }
          objectPartner["RELATIONS"] = partner.RELATIONS;
          this.activity.PARTNERS.push(objectPartner);
          this.activity.PARTNERS.push({
            PARTNER_FCT: "00000015",
            PARTNER_NO: partnerFromContactPage.PARTNER,
            FULLNAME: partnerFromContactPage.CENTRAL_ORGAN.NAME1
          });
          this.addTheSingleContactPerson(partner.RELATIONS);
        });
      } else if (partnerFromContactPage.RELATIONS.length > 1) { //Tiene mas de una relacion
        //Mostramos la lista de relaciones
        let listaRelaciones = [];
        let numRelations = partnerFromContactPage.RELATIONS.length, count = 0;

        this.translate.get('SelectContactInterlocutor').subscribe(selectContactInterlocutor => {
          for (let relation of partnerFromContactPage.RELATIONS) {
            this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', relation.PARTNER2, '').then((partner) => {
              count++;
              listaRelaciones.push(partner);

              if (count == numRelations) { //Ultimo partner recogido
                let profileModal = this.modalCtrl.create(SelectMultipleModal, {
                  key: "PARTNER",
                  label: "NAME",
                  showKey: false,
                  title: selectContactInterlocutor,
                  data:  listaRelaciones
                }, {
                  enableBackdropDismiss: false
                });
                profileModal.onDidDismiss((values) => {
                  if (values) {
                    for (let val of values) { //Aniadimos las relaciones seleccionadas como contacto
                      let objectPartner = {
                        PARTNER_FCT: "00000009",
                        PARTNER_NO: val.PARTNER,
                        FULLNAME: val.NAME
                      }
                      objectPartner["RELATIONS"] = val.RELATIONS;
                      this.activity.PARTNERS.push(objectPartner);
                      this.addTheSingleContactPerson(val.RELATIONS);
                    }
                    if (!this.existContactPerson(partnerFromContactPage.PARTNER)) { //Si no existe ya, se aniade
                      this.activity.PARTNERS.push({ //Aniadimos al contacto como "persona de contacto"
                        PARTNER_FCT: "00000015",
                        PARTNER_NO: partnerFromContactPage.PARTNER,
                        FULLNAME: partnerFromContactPage.CENTRAL_ORGAN.NAME1
                      });
                    }
                  }
                });
                profileModal.present();
              }
            });
          }
        });
      }
    } else { //Si no, se aniade al propio contacto como interlocutor de contacto
      let objectPartner = {
        PARTNER_FCT: "00000009",
        PARTNER_NO: partnerFromContactPage.PARTNER,
        FULLNAME: partnerFromContactPage.CENTRAL_ORGAN.NAME1
      }
      objectPartner["RELATIONS"] = partnerFromContactPage.RELATIONS;
      this.activity.PARTNERS.push(objectPartner);
      this.addTheSingleContactPerson(partnerFromContactPage.RELATIONS);
    }
  }

  watchPartner(partnerId: string) {
    this.openingOtherPage = true; //Pasamos a otra pagina
    this.navCtrl.push(ContactPage, {
      id: partnerId,
      isDeleteable: false
    });
  }

  myNameOperation() {
    this.loadOperationsClasses().then(() => {
      for (let op of this.operations) {
        this.operation[op.PROCESS_TYPE] = op.P_DESCRIPTION;
      }
    });
  }

  fixPartners(): Promise<any> {
    let promises = [];

    for (let partner of this.activity.PARTNERS) {
      partner.PARTNER_NO = ('0000' + partner.PARTNER_NO).slice(-10);

      if(partner.PARTNER_FCT == "00000009") {
        promises.push(this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', partner.PARTNER_NO, '').then((partnerAbstract) => {
          partner["RELATIONS"] = partnerAbstract != null ? partnerAbstract.RELATIONS : "";
        }));
      }
    }

    return Promise.all(promises);
  }

  fixProducts() {
    for (let materiasl of this.activity.MATERIAL_TAB) {
      materiasl.ORDERED_PROD = ('0000000000000' + materiasl.ORDERED_PROD).slice(-18);
    }
  }

  fillEmployeeResponsible(): Promise<void> {
    return this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', this.loginProvider.user.idPartner, '').then((partnerAbstract) => {
      this.activity.PARTNERS.push({
        PARTNER_FCT: "00000014",
        PARTNER_NO: partnerAbstract.PARTNER,
        FULLNAME: partnerAbstract.NAME
      });
    });
  }

  //If new user we change de default hour
  defaultDates() {
    let date = new Date();
    for (let dateActivity of this.activity.DATE) {
      if (dateActivity.APPT_TYPE == 'ORDERPLANNED') {
        dateActivity.DATE_FROM = date.getUTCFullYear() + "-" + ("0" + (date.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + date.getUTCDate()).slice(-2);
        this.currentDayFrom = dateActivity.DATE_FROM;
        dateActivity.DATE_TO = date.getUTCFullYear() + "-" + ("0" + (date.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + date.getUTCDate()).slice(-2);
        this.currentDayTo = dateActivity.DATE_TO;
        dateActivity.TIME_FROM = ("0" + date.getHours()).slice(-2) + ":00:00";//("0" + date.getMinutes()).slice(-2);
        this.currentTimeFrom = dateActivity.TIME_FROM;

        date.setTime(date.getTime() + (60 * 60 * 1000));// add an hour

        dateActivity.TIME_TO = ("0" + date.getHours()).slice(-2) + ":00:00";
        this.currentTimeTo = dateActivity.TIME_TO;
      }
    }
  }

  fromMillisecondsToDate(fechaFrom: Date) {
    this.currentTimeFrom = (fechaFrom.getHours() < 10 ? '0' + fechaFrom.getHours() : fechaFrom.getHours()) + ":" + (fechaFrom.getUTCMinutes() < 10 ? '0' + fechaFrom.getUTCMinutes() : fechaFrom.getUTCMinutes());

    this.currentDayFrom = fechaFrom.getFullYear() + "-"
      + (fechaFrom.getMonth() + 1 < 10 ? '0' + (fechaFrom.getMonth() + 1) : fechaFrom.getMonth() + 1) + "-"
      + (fechaFrom.getDate() < 10 ? '0' + fechaFrom.getDate() : fechaFrom.getDate());
  }

  toMillisecondsToDate(fechaTo: Date) {
    this.currentTimeTo = (fechaTo.getHours() < 10 ? '0' + fechaTo.getHours() : fechaTo.getHours()) + ":" + (fechaTo.getUTCMinutes() < 10 ? '0' + fechaTo.getUTCMinutes() : fechaTo.getUTCMinutes());

    this.currentDayTo = fechaTo.getFullYear() + "-"
      + (fechaTo.getMonth() + 1 < 10 ? '0' + (fechaTo.getMonth() + 1) : fechaTo.getMonth() + 1) + "-"
      + (fechaTo.getDate() < 10 ? '0' + fechaTo.getDate() : fechaTo.getDate());
  }

  balanceDate(type) {
    let dateFrom = new Date(+this.currentDayFrom.substr(0, 4), +(Number(this.currentDayFrom.substr(5, 2))-1), +this.currentDayFrom.substr(8, 2), +this.currentTimeFrom.substr(0, 2), +this.currentTimeFrom.substr(3, 2));
    let dateTo = new Date(+this.currentDayTo.substr(0, 4), +(Number(this.currentDayTo.substr(5, 2))-1), +this.currentDayTo.substr(8, 2), +this.currentTimeTo.substr(0, 2), +this.currentTimeTo.substr(3, 2));
    let lastDateFrom;
    let lastDateTo;
    let difference;

    switch(type) {
      case "from":
        if (dateFrom.getTime() > dateTo.getTime()) { //La fecha de inicio es superior
    
          lastDateFrom = new Date(+this.lastDayFrom.substr(0, 4), +(Number(this.lastDayFrom.substr(5, 2))-1), +this.lastDayFrom.substr(8, 2), +this.lastTimeFrom.substr(0, 2), +this.lastTimeFrom.substr(3, 2));
          difference = dateTo.getTime() - lastDateFrom.getTime();
          dateTo.setTime(dateFrom.getTime() + difference);
          this.toMillisecondsToDate(dateTo);
        }
        break;
      case "to":
        if (dateTo.getTime() < dateFrom.getTime()) { //La fecha de fin es inferior
    
          lastDateTo = new Date(+this.lastDayTo.substr(0, 4), +(Number(this.lastDayTo.substr(5, 2))-1), +this.lastDayTo.substr(8, 2), +this.lastTimeTo.substr(0, 2), +this.lastTimeTo.substr(3, 2));
          difference = lastDateTo.getTime() - dateFrom.getTime();
          dateFrom.setTime(dateTo.getTime() - difference);
          this.fromMillisecondsToDate(dateFrom);
        }
        break;
    }
  }

  setLastDate() {
    this.lastDayFrom = this.currentDayFrom;
    this.lastTimeFrom = this.currentTimeFrom;
    this.lastDayTo = this.currentDayTo;
    this.lastTimeTo = this.currentTimeTo;
  }

  loadOperationsClasses() {
    return this.sapcrmCacheProvider.getOperationClasses().then(
      (res: OperationsClass[]) => {
        this.operations = res;
      },
      (error) => {
        console.log(error);
      });
  }

  loadObjectives() {
    return this.sapcrmCacheProvider.getObjectives().then(
      (res: Objectives[]) => {
        this.objectives = res;

        this.objectives.sort(function (a, b) {
          if (a.DESCRIPTION != undefined) {
            return a.DESCRIPTION.localeCompare(b.DESCRIPTION, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadCategories() {
    return this.sapcrmCacheProvider.getCategories().then(
      (res: Category[]) => {
        this.categories = [];
        for (let category of res) {
          if (category.PROCESS_TYPE == this.activity.HEADER.PROCESS_TYPE) {
            this.categories.push(category);
          }
        }
        this.categories.sort(function (a, b) {
          if (a.DESCRIPTION != undefined) {
            return a.DESCRIPTION.localeCompare(b.DESCRIPTION, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadReasons() {
    return this.sapcrmCacheProvider.getReasons().then(
      (res: ActivityReason[]) => {
        this.reasons = [];
        for (let reason of res) {
          if (reason.PROCESS_TYPE == this.activity.HEADER.PROCESS_TYPE) {
            this.reasons.push(reason);
          }
        }
        this.reasons.sort(function (a, b) {
          if (a.TEXT != undefined) {
            return a.TEXT.localeCompare(b.TEXT, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadStatus() {
    return this.sapcrmCacheProvider.getStatus().then(
      (res: Status[]) => {
        this.states = [];
        for (let status of res) {
          if (status.PROCESS_TYPE == this.activity.HEADER.PROCESS_TYPE) {
            this.states.push(status);
          }
        }
        this.states.sort(function (a, b) {
          if (a.TXT30 != undefined) {
            return a.TXT30.localeCompare(b.TXT30, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadResult() {
    return this.sapcrmCacheProvider.getResult().then(
      (res: ActivityResult[]) => {
        this.results = [];
        for (let result of res) {
          if (result.PROCESS_TYPE == this.activity.HEADER.PROCESS_TYPE) {
            this.results.push(result);
          }
        }
        this.results.sort(function (a, b) {
          if (a.TEXT != undefined) {
            return a.TEXT.localeCompare(b.TEXT, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadTextActivities() {
    return this.sapcrmCacheProvider.getTextActClasses().then(
      (res: TextActClasses[]) => {
        this.textAct = [];
        for (let text of res) {
          if (text.PROCESS_TYPE == this.activity.HEADER.PROCESS_TYPE) {
            this.textAct.push(text);
          }
          this.textAct.sort(function (a, b) {
            if (a.TDTEXT != undefined) {
              return a.TDTEXT.localeCompare(b.TDTEXT, "ca-ES");
            }
          });
        }
      },
      (error) => {
        console.log(error);
      });
  }

  loadContactPerson(): Promise<any> {
    let promises = [];
    let partnerIds = [];
    for (let partner of this.activity.PARTNERS) {
      if (partner.PARTNER_FCT == '00000009' && partner.PARTNER_NO != "") {
        promises.push(this.sapcrmWebProvider.syncOptimizedPartner('', partner.PARTNER_NO, '').then(
          (contact) => {
            if (contact == null)
              return;
            for (let relation of contact.RELATIONS) {
              if (relation.RELATIONSHIPCATEGORY == 'BUR001') {
                partnerIds.push(relation.PARTNER2);
              }
            }
          }, (error) => {
            console.log(error);
          }
        ));
      }
    }
    return Promise.all(promises).then(() => {
      //Ahora partnerIds está relleno
      let promises = [];
      let res = [];
      for (let partnerId of partnerIds) {
        promises.push(this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', partnerId, '').then(
          (contactPartner: PartnerAbstract) => {
            if (contactPartner) {
              res.push(contactPartner);
            }
          }, console.error)
        );
      }
      return Promise.all(promises).then(() => {
        this.contactsPartners = res;
      }, console.error);
    });
  }

  editVendorsResponsible(actualVendor?) {

    if (this.isBusy)
      return;
    this.isBusy = true;



    this.isBusy = false;

  }

  editContactInterlocutor(actualInterlocutor?) {

    if (this.isBusy)
      return;
    this.isBusy = true;

    this.loadingContactInterlocutors = true;
    this.loadingOption = true;
    this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_NO_YE_NO_CONTACT_PERSON_NO_PRESCRIPTOR, '').then((partners) => {
      partners.PARTNERS.sort(function (a, b) {
        if (a.NAME != undefined && b.NAME != undefined) {
          return a.NAME.localeCompare(b.NAME, "ca-ES");
        }
      });
      this.loadingContactInterlocutors = false;
      this.loadingOption = false;

      this.translate.get("SelectPartner").toPromise().then(translatedTitle => {
        let partnerModal = this.modalCtrl.create(SelectSearchModalWeb, {
          val: actualInterlocutor != null ? actualInterlocutor.PARTNER_NO : null,
          options: partners.PARTNERS,
          maxOptions: Number(partners.MAX_PARTNERS),
          typeOption: PartnersWebProvider.PARTNERS_NO_YE_NO_CONTACT_PERSON_NO_PRESCRIPTOR,
          key: "PARTNER",
          label: "NAME",
          showKey: false,
          title: translatedTitle
        }, {
            enableBackdropDismiss: false
          });

        partnerModal.onDidDismiss(partnerSelected => {
          if (partnerSelected != null)
            for (let partner of partners.PARTNERS) {
              if (partner.PARTNER == partnerSelected.PARTNER) {
                if (actualInterlocutor != null) {
                  actualInterlocutor.PARTNER_NO = partner.PARTNER;
                  actualInterlocutor.FULLNAME = partner.NAME;
                  actualInterlocutor.RELATIONS = partner.RELATIONS;
                } else {
                  let objectPartner = {
                    PARTNER_FCT: "00000009",
                    PARTNER_NO: partner.PARTNER,
                    FULLNAME: partner.NAME
                  }
                  objectPartner["RELATIONS"] = partner.RELATIONS;
                  this.activity.PARTNERS.push(objectPartner);
                }

                this.addTheSingleContactPerson(partner.RELATIONS);
                break;
              }
            }
        });
        partnerModal.present();
      });
    });

    this.isBusy = false;

  }


  editEmployeeResponsible(employeeResponsible?) {

    if (this.isBusy)
      return;
    this.isBusy = true;

    this.loadingEmployeeResponsibles = true;
    this.loadingOption = true;
    this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_YE, '').then((partners) => {
        partners.PARTNERS.sort(function (a, b) {
          if (a.NAME != undefined && b.NAME != undefined) {
            return a.NAME.localeCompare(b.NAME, "ca-ES");
          }
        });
        this.loadingEmployeeResponsibles = false;
        this.loadingOption = false;

        this.translate.get("SelectPartner").toPromise().then(translatedTitle => {
          let partnerModal = this.modalCtrl.create(SelectSearchModalWeb, {
            val: employeeResponsible != null ? employeeResponsible.PARTNER_NO : null,
            options: partners.PARTNERS,
            maxOptions: Number(partners.MAX_PARTNERS),
            typeOption: PartnersWebProvider.PARTNERS_YE,
            key: "PARTNER",
            label: "NAME",
            showKey: false,
            title: translatedTitle
          }, {
              enableBackdropDismiss: false
            });

          partnerModal.onDidDismiss(partnerSelected => {
            if (partnerSelected != null)
              for (let partner of partners.PARTNERS) {
                if (partner.PARTNER == partnerSelected.PARTNER) {
                  if (employeeResponsible != null) {
                    employeeResponsible.PARTNER_NO = partner.PARTNER;
                    employeeResponsible.FULLNAME = partner.NAME;
                    break;
                  } else {
                    this.activity.PARTNERS.push({
                      PARTNER_FCT: "00000014",
                      PARTNER_NO: partner.PARTNER,
                      FULLNAME: partner.NAME
                    });
                  }
                }
              }
          });
          partnerModal.present();
        })
      }
    );

    this.isBusy = false;

  }

  editContactPerson(actualContactPerson?) {

    if (this.isBusy)
      return;
    this.isBusy = true;

    this.isBusy = false;

  }

  hasContactInterlocutor() {
    for (let partner of this.activity.PARTNERS)
      if (partner.PARTNER_FCT == "00000009")
        return true;
    return false;
  }

  getTotalContactInterlocutor() {
    let counter = 0;
    for (let partner of this.activity.PARTNERS)
      if (partner.PARTNER_FCT == "00000009")
        counter++;
    return counter;
  }

  getSpeciesFromContactInterlocutors(): Promise<Array<number>> {
    let result = [];
    let total = this.getTotalContactInterlocutor();
    return new Promise((resolve, reject) => {
      let counter = 0;
      for (let partner of this.activity.PARTNERS) {
        if (partner.PARTNER_FCT == "00000009") {
            this.sapcrmWebProvider.syncOptimizedPartner('', partner.PARTNER_NO, '').then(
            fullPartner => {
              for (let specie of fullPartner.MKT_ATTR) {
                switch (specie.PROFILE_TEMPLATE_ID) {
                  case "ZZESP01": result.push(0); break;
                  case "ZZESP02": result.push(1); break;
                  case "ZZESP03": result.push(2); break;
                  case "ZZESP04": result.push(3); break;
                  case "ZZESP05": result.push(4); break;
                  case "ZZESP06": result.push(5); break;
                  case "ZZESP07": result.push(6); break;
                  case "ZZESP08": result.push(7); break;
                  case "ZZESP09": result.push(8); break;
                  case "ZZESP010": result.push(9); break;
                }
              }
              counter++;
              if (counter == total)
                resolve(result);
            }
          )
        }
      }
      if (counter == total)
        resolve(result);
    })
  }

  editProduct(myproduct?) {

    if (this.isBusy)
      return;
    this.isBusy = true;

    if (!this.hasContactInterlocutor()) {
      this.translate.get("NoContactInterlocutorErrorTitle").toPromise().then(
        title => {
          this.translate.get("NoContactInterlocutorErrorMessage").toPromise().then(
            message => {
              this.alertCtrl.create({
                title: title,
                message: message,
                buttons: ['OK']
              }).present();
            }
          );
        }
      );

    } else {

      let whereClause = "";
      let whereValues = [];

      this.loadingProducts = true;
      this.loadingOption = true;
      let possibleSpecies = this.getSpeciesFromContactInterlocutors().then(
        species => {

          this.sapcrmCacheProvider.getProductsDeterminedUser().then(
            products => {
              products = products.filter(x => {
                if (x.IDTIPOMATERIAL != "ZCOM")
                  return false;

                  for (let specie of species) {
                    if (specie < x.ATTRIBUTE.length && x.ATTRIBUTE[specie] == 'X')
                      return true;
                  }
                  return false;
              });

              products.sort((a, b) => {
                return a.MATERIAL.localeCompare(b.MATERIAL, "ca-ES");
              })
              this.loadingProducts = false;
              this.loadingOption = false;

              this.translate.get("SelectProducts").toPromise().then(translatedTitle => {
                if (myproduct != null) {
                  let partnerModal = this.modalCtrl.create(SelectSearchModal, {
                    val: myproduct.ORDERED_PROD,
                    options: products,
                    key: "IDMATERIAL",
                    label: "MATERIAL",
                    showKey: false,
                    title: translatedTitle
                  }, {
                      enableBackdropDismiss: false
                    });

                  partnerModal.onDidDismiss(selectedProductIndex => {
                    if (selectedProductIndex != null) {
                      for (let product of products) {
                        if (product.IDMATERIAL == products[selectedProductIndex].IDMATERIAL) {
                          myproduct.ORDERED_PROD = product.IDMATERIAL;
                          myproduct.DESCRIPTION = product.MATERIAL;
                          break;
                        }
                      }
                    }
                  });
                  partnerModal.present();
                } else {
                  let profileModal = this.modalCtrl.create(SelectMultipleModal, {
                    key: "IDMATERIAL",
                    label: "MATERIAL",
                    showKey: false,
                    title: translatedTitle,
                    data: products
                  }, {
                      enableBackdropDismiss: false
                    });
                  profileModal.onDidDismiss((values) => {
                    if (values) {
                      for (let val of values) {
                        this.activity.MATERIAL_TAB.push({
                          DESCRIPTION: val.MATERIAL,
                          ORDERED_PROD: val.IDMATERIAL
                        });
                      }
                    }
                  });
                  profileModal.present();
                }
              });
            });
        }
      );




    }
    this.isBusy = false;

  }


  filterContactPersons(partners, interlocutorPartner) {
    let filteredPartners = [];

    for (let relation of interlocutorPartner.RELATIONS) {
      for (let partner of partners) {
        if (partner.PARTNER_FCT == '00000015' && partner.PARTNER_NO == relation.PARTNER2 && relation.RELATIONSHIPCATEGORY == "BUR001")
          filteredPartners.push(partner);
      }
    }

    return filteredPartners;
  }

  filterContactInterlocutor(partners) {
    let filteredPartners = [];
    for (let partner of partners) {
      if (partner.PARTNER_FCT == '00000009')
        filteredPartners.push(partner);
    }
    return filteredPartners;
  }

  filterEmployeeResponsible(partners) {
    let filteredPartners = [];
    for (let partner of partners) {
      if (partner.PARTNER_FCT == '00000014')
        filteredPartners.push(partner);
    }
    return filteredPartners;
  }

  addTheSingleContactPerson(relations) {
    let idTheSingleContactPerson = this.getTheSingleContactPerson(relations);
    if (idTheSingleContactPerson != "" && !this.existContactPerson(idTheSingleContactPerson)) { //Si solo tiene una relacion y no existe ya, se aniade
      this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', idTheSingleContactPerson, '').then(
        contactPerson => {
          if (contactPerson && !this.existContactPerson(contactPerson.PARTNER)) {
            this.activity.PARTNERS.push({
              PARTNER_FCT: "00000015",
              PARTNER_NO: contactPerson.PARTNER,
              FULLNAME: contactPerson.NAME
            });
          }
        });
    }
  }

  getTheSingleContactPerson(relations): string {
    let contactsPersons = [];
    let id = "";

    for (let relationship of relations) {
      //WUR001 = es persona de contacto, BUR001 = tiene la persona de contacto
      if (relationship.RELATIONSHIPCATEGORY == "BUR001")
        contactsPersons.push(relationship);
    }

    if (contactsPersons.length == 1)
      id = contactsPersons[0].PARTNER2;

    return id;
  }

  existContactPerson(id: string): boolean {
    let existContactPerson = false;

    for (let partner of this.activity.PARTNERS) {
      if (partner.PARTNER_NO == id && partner.PARTNER_FCT == "00000015") {
        existContactPerson = true;
        break;
      }
    }

    return existContactPerson;
  }

  haveContactPerson(relations): boolean {
    let existContactPerson = false;

    for (let relationship of relations) {
      //WUR001 = es persona de contacto, BUR001 = tiene la persona de contacto
      if (relationship.RELATIONSHIPCATEGORY == "BUR001") {
        existContactPerson = true;
        break;
      }
    }

    return existContactPerson;
  }

  haveMoreContactPerson(partner): boolean {
    let existMoreContactPerson = false;
    let existContactPerson = false;

    for (let relationship of partner.RELATIONS) {
      //WUR001 = es persona de contacto, BUR001 = tiene la persona de contacto
      if (relationship.RELATIONSHIPCATEGORY == "BUR001") {
        existContactPerson = false;
        for (let partnerAux of this.activity.PARTNERS) {
          if (relationship.PARTNER2 == partnerAux.PARTNER_NO) {
            existContactPerson = true;
            break;
          }
        }

        if (!existContactPerson) {
          existMoreContactPerson = true;
          break;
        }
      }
    }

    return existMoreContactPerson;
  }

  addContactPerson(partner) {

    this.loaderProvider.pushLoadingProcess();
    let options = [];

    new Promise((resolve, reject) => {
      this.sapcrmWebProvider.syncOptimizedPartner('', partner.PARTNER_NO, '').then(
        res => {
          let count = 0;


          if (res.RELATIONS.length == 0)
            resolve();
          for (let relationship of res.RELATIONS) {
            //WUR001 = es persona de contacto, BUR001 = tiene la persona de contacto
            if (relationship.RELATIONSHIPCATEGORY == "BUR001") {
              this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', relationship.PARTNER2, '').then(             
                contactPerson => {
                  if (contactPerson == null) {
                    count++;
                    resolve();
                  }
                  else {
                    let add = true;
                    for (let partnerAux of this.activity.PARTNERS)
                      if (relationship.PARTNER2 == partnerAux.PARTNER_NO)
                        add = false;
                    if (add)
                      options.push({ PARTNER: contactPerson.PARTNER, NAME: contactPerson.NAME });
                    count++;
                    if (count == res.RELATIONS.length)
                      resolve()
                  }
                }
              )
            } else {
              count++;
              if (count == res.RELATIONS.length)
                resolve()
            }
          }
        })
    }).then(() => {
      this.loaderProvider.popLoadingProcess();

      this.translate.get("SelectPartner").toPromise().then(title => {
        let profileModal = this.modalCtrl.create(SelectSearchModal, {
          val: null,
          options: options,
          label: "NAME",
          key: "PARTNER",
          allowEmpty: true,
          title: title
        }, {
            enableBackdropDismiss: false
          });

        profileModal.onDidDismiss(selectedPartnerIndex => {
          if (selectedPartnerIndex != null)
            for (let partner of options) {
              if (partner.PARTNER == options[selectedPartnerIndex].PARTNER) {

                this.activity.PARTNERS.push({
                  PARTNER_FCT: "00000015",
                  PARTNER_NO: partner.PARTNER,
                  FULLNAME: partner.NAME
                });
              }
            }
        });
        profileModal.present();
      });
    })

  }

  //EVENTOS codes
  /*
  "Solicitud Pedido Hipra": "Z014"
  "Oportunidad de negocio": "Z007"


  ""Visita Instalaciones HIPRA"": "Z011"
  "Ruta/Tarea": "Z008"

  "Llamada telef�nica": "Z006"
  "Evento al que asiste HIPRA": "Z002"
  "Visita Comercial": "Z001"
  */

  //Interlocutor type codes:
  /*
  Activity Partner:     '00000009'
  Contact Person:       '00000015' 
  Person Responsible:   '00000022'
  Sales Representative: '00000012'
  Employee Responsible: '00000014'

  Competitor:           '00000023'
  Department:           '00000033'
  Attendee:             '00000032'

  */

  updateResultOutcome(evento, campo) {
    for (let result of this.results) {
      if (result.CODE == evento && result.PROCESS_TYPE == this.activity.HEADER.PROCESS_TYPE) {
        campo.CODE_GROUP = "Z0000001";//TODOresult.CODEGRUPPE;
        campo.CODE = result.CODE;
      }
    }
  }

  updateStatusOutcome(evento, campo) {//TODO VERIFICAR CUANDO HAY MAS ESTADOS
    for (let status of this.states) {
      if (status.STATUS == evento && status.PROCESS_TYPE == this.activity.HEADER.PROCESS_TYPE) {
        campo.REF_GUID = "";
        campo.REF_HANDLE = "0000000000";
        campo.REF_KIND = "";
        campo.STATUS = status.STATUS;
        campo.USER_STAT_PROC = status.USER_STAT_PROC;
        campo.ACTIVATE = "";
        campo.PROCESS = "";
      }
    }
  }

  deleteData(data, tipo) {
    this.translate.get('DeleteElement').subscribe(
      deleteElement => {
        this.translate.get('DeletePermanent').subscribe(
          deletePermanent => {
            this.translate.get('Cancel').subscribe(
              cancel => {
                this.translate.get('Agree').subscribe(
                  agree => {
                    let confirm = this.alertCtrl.create({
                      title: deleteElement,
                      message: deletePermanent,
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
                            let index;
                            switch (tipo) {
                              case 'product'://CASO PRODUCT
                                index = this.activity.MATERIAL_TAB.indexOf(data);
                                if (index > -1) {
                                  this.activity.MATERIAL_TAB.splice(index, 1);
                                }
                                break;
                              case 'partner'://CASO PARTNER
                                index = this.activity.PARTNERS.indexOf(data);
                                if (index > -1) {
                                  this.activity.PARTNERS.splice(index, 1);
                                }
                                break;
                              case 'note'://CASO NOTE
                                index = this.activity.TEXT.indexOf(data);
                                if (index > -1) {
                                  this.addNotesToDelete(this.activity.TEXT[index]);
                                  this.activity.TEXT.splice(index, 1);
                                }
                                break;
                            }
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

  editNota(actualNota?) {

    if (this.isBusy)
      return;
    this.isBusy = true;

    let nota;
    let profileModal;
    if (actualNota == null) {
      nota = {
        LANGU_ISO: "",
        MODE: "A",
        REF_GUID: "",
        REF_HANDLE: "",
        REF_KIND: "",
        TDFORM: "",
        TDFORMAT: "*",
        TDID: "",
        TDLINE: "",
        TDSPRAS: AppSettings.DEFAULT_LANGUAGE,
        TDSTYLE: "",
      };
      profileModal = this.modalCtrl.create(FillActivityNoteModal, {
        noteTypes: this.textClass
      }, {
          enableBackdropDismiss: false
        });
    } else {
      nota = actualNota;
      profileModal = this.modalCtrl.create(FillActivityNoteModal, {
        noteTypes: this.textClass,
        type: actualNota.TDID,
        content: actualNota.TDLINE
      }, {
          enableBackdropDismiss: false
        });
    }

    profileModal.onWillDismiss((note: { content: string, type: string }) => {
      if (note != null && note.type != "" && note.content != "") {
        if (nota.TDID != note.type || note.content != nota.TDLINE) {

          let crearUnoNuevo = false;
          if (nota.TDTITLE == "" || nota.TDLINE == "")
            crearUnoNuevo = true;

          nota.TDLINE = note.content;
          nota.TDID = note.type;
          if (crearUnoNuevo) {
            this.activity.TEXT.splice(this.activity.TEXT.length, 0, nota);
          }
          try {
            this.cdRef.detectChanges();
          } catch (err) {
            console.log("error en el detectChanges");
          }
        }
      }
    });
    profileModal.present();
    this.isBusy = false;

  }

  duplicateActivity() {
    this.existActivity = false;
    let copyEmpty: Activity;
    copyEmpty = this.utils.fixActivity({})
    copyEmpty.HEADER.OBJECT_ID = this.utils.generateGuid();

    //arreglamos header
    copyEmpty.HEADER.PROCESS_TYPE = this.activity.HEADER.PROCESS_TYPE;
    copyEmpty.HEADER.CATEGORY = this.activity.HEADER.CATEGORY;
    copyEmpty.HEADER.OBJECTIVE = this.activity.HEADER.OBJECTIVE;
    copyEmpty.HEADER.DESCRIPTION = this.activity.HEADER.DESCRIPTION;

    //arreglamos reason
    copyEmpty.REASON = this.activity.REASON;

    //arreglamos status_tab
    copyEmpty.STATUS_TAB.push({ STATUS: "E0001" });
    this.currentStatus = {STATUS: "E0001", TXT30: "Abierto"};

    //arreglamos partners
    let contacto = {};
    for (let partner of this.activity.PARTNERS) {
      contacto = {
        PARTNER_FCT: partner.PARTNER_FCT, 
        PARTNER_NO: partner.PARTNER_NO,
        FULLNAME: partner.FULLNAME,
        RELATIONS: partner["RELATIONS"] ? partner["RELATIONS"] : ""
      }
      copyEmpty.PARTNERS.push(contacto);
    }

    this.currentResult = {CODE: "", TEXT: ""};
    this.activity = copyEmpty;
    this.defaultDates();
  }

  delete() {
    this.translate.get('DeleteActivity').subscribe(
      deleteActivity => {
        this.translate.get('DeletePermanent').subscribe(
          deletePermanent => {
            this.translate.get('Cancel').subscribe(
              cancel => {
                this.translate.get('Agree').subscribe(
                  agree => {
                    let confirm = this.alertCtrl.create({
                      title: deleteActivity,
                      message: deletePermanent,
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
                            //Preparo y compruebo los campos
                            this.utils.showLoading();
                            this.queueProvider.pushDeleteActivity(this.activity, false).then((data) => {
                              this.utils.hideLoading();
                              this.ablePop = true;

                              this.paramsPop = "doSync";
                              this.ev.publish('eventSyncActivity', this.paramsPop);
                              this.navCtrl.pop();
                            }, (error) => {
                              this.utils.showToast(error);
                              this.utils.hideLoading();
                            });
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

  loadContact(partnerId: string) {
    this.navCtrl.push(ContactPage, {
      id: partnerId,
      isDeletable: false
    });
  }

  fillFields() {
    this.fillReason();
    this.fillOutcome();
    this.fillStatus();
    this.fillDates();
  }

  fillStatus() {
    this.activity.STATUS_TAB = [];
    this.activity.STATUS_TAB.push({ STATUS: this.currentStatus.STATUS });
  }

  fillReason() {
    this.activity.REASON = [];
    this.activity.REASON.push({ CODE: this.currentReason.CODE });
  }

  fillOutcome() {
    this.activity.OUTCOME = [];
    this.activity.OUTCOME.push({ CODE: this.currentResult.CODE });
  }

  fillDates() {
    let dateFrom = new Date(+this.currentDayFrom.substr(0, 4), +(Number(this.currentDayFrom.substr(5, 2))-1), +this.currentDayFrom.substr(8, 2), +this.currentTimeFrom.substr(0, 2), +this.currentTimeFrom.substr(3, 2));
    let dateTo = new Date(+this.currentDayTo.substr(0, 4), +(Number(this.currentDayTo.substr(5, 2))-1), +this.currentDayTo.substr(8, 2), +this.currentTimeTo.substr(0, 2), +this.currentTimeTo.substr(3, 2));
    for (let dateActivity of this.activity.DATE) {
      if (dateActivity.APPT_TYPE == 'ORDERPLANNED') {
        dateActivity.DATE_FROM = dateFrom.getFullYear() + "-" + ("0" + (dateFrom.getMonth()+1)).slice(-2) + "-" + ("0" + dateFrom.getDate()).slice(-2);
        dateActivity.DATE_TO = dateTo.getFullYear() + "-" + ("0" + (dateTo.getMonth()+1)).slice(-2) + "-" + ("0" + dateTo.getDate()).slice(-2);
        dateActivity.TIME_FROM = ("0" + dateFrom.getHours()).slice(-2) + ":" + ("00" + dateFrom.getMinutes()).slice(-2) + ":00";
        dateActivity.TIME_TO = ("0" + dateTo.getHours()).slice(-2) + ":" + ("00" + dateTo.getMinutes()).slice(-2) + ":00";
        dateActivity.TIMEZONE_FROM = "CET";
        dateActivity.TIMEZONE_TO = "CET";
      }
    }
  }

  fixActivityToSAP() {
    this.fixNotesToSAP(); //Arreglamos las Notas para que SAP las recoja bien
    this.printOrder(false);
  }

  fixNotesToSAP() {
    let copiaActivityNotes = [];
    
    for (let note of this.activity.TEXT) {
      copiaActivityNotes.push({
          TDID: note.TDID,
          TDLINE: note.TDLINE,
          REF_KIND: note.REF_KIND,
          MODE: note.MODE ? note.MODE : note.REF_KIND,
          TDFORMAT: note.TDFORMAT,
          TDSPRAS: note.TDSPRAS
        });
    };
    this.activity.TEXT = copiaActivityNotes;
  }

  cleanProducts() {
    for (let product of this.activity.MATERIAL_TAB) {
      product.ORDERED_PROD = product.ORDERED_PROD.replace(/^0+/, ''); //Quitamos los ceros de la izquierda
    }
  }

  fixNotes() {
    let typeNotes = {
      T_0001: [], //Nota de cabecera
      T_0002: [], //Nota interna
      T_0003: [], //Nota final
      T_1000: [], //Deseos cliente
      A002: [], //Nota
      A003: [], //Preparacion
      A004: [], //Informe
      A005: [], //Info interlocutor comercial
      A007: [], //Agenda
      AC01: [], //Nota a interlocutor
      Z001: [], //Causa
      Z002: [], //Resolucion
      Z003: [], //Descripcion
      Z004: [] //Observaciones
      // Z005: [] //Firma
    };
    let notes = this.activity.TEXT;
    this.activity.TEXT = [];

    notes.forEach((note, index) => {
      if (note.TDID == "0001") typeNotes.T_0001.push(index);
      if (note.TDID == "0002") typeNotes.T_0002.push(index);
      if (note.TDID == "0003") typeNotes.T_0003.push(index);
      if (note.TDID == "1000") typeNotes.T_1000.push(index);
      if (note.TDID == "A002") typeNotes.A002.push(index);
      if (note.TDID == "A003") typeNotes.A003.push(index);
      if (note.TDID == "A004") typeNotes.A004.push(index);
      if (note.TDID == "A005") typeNotes.A005.push(index);
      if (note.TDID == "A007") typeNotes.A007.push(index);
      if (note.TDID == "AC01") typeNotes.AC01.push(index);
      if (note.TDID == "Z001") typeNotes.Z001.push(index);
      if (note.TDID == "Z002") typeNotes.Z002.push(index);
      if (note.TDID == "Z003") typeNotes.Z003.push(index);
      if (note.TDID == "Z004") typeNotes.Z004.push(index);
    });

    if (typeNotes.T_0001.length > 1) this.joinLongNotes(typeNotes.T_0001, notes); 
    else if (typeNotes.T_0001.length == 1) this.activity.TEXT.push(notes[typeNotes.T_0001[0]]);
    if (typeNotes.T_0002.length > 1) this.joinLongNotes(typeNotes.T_0002, notes);
    else if (typeNotes.T_0002.length == 1) this.activity.TEXT.push(notes[typeNotes.T_0002[0]]);
    if (typeNotes.T_0003.length > 1) this.joinLongNotes(typeNotes.T_0003, notes);
    else if (typeNotes.T_0003.length == 1) this.activity.TEXT.push(notes[typeNotes.T_0003[0]]);
    if (typeNotes.T_1000.length > 1) this.joinLongNotes(typeNotes.T_1000, notes);
    else if (typeNotes.T_1000.length == 1) this.activity.TEXT.push(notes[typeNotes.T_1000[0]]);
    if (typeNotes.A002.length > 1) this.joinLongNotes(typeNotes.A002, notes); 
    else if (typeNotes.A002.length == 1) this.activity.TEXT.push(notes[typeNotes.A002[0]]);
    if (typeNotes.A003.length > 1) this.joinLongNotes(typeNotes.A003, notes);
    else if (typeNotes.A003.length == 1) this.activity.TEXT.push(notes[typeNotes.A003[0]]);
    if (typeNotes.A004.length > 1) this.joinLongNotes(typeNotes.A004, notes);
    else if (typeNotes.A004.length == 1) this.activity.TEXT.push(notes[typeNotes.A004[0]]);
    if (typeNotes.A005.length > 1) this.joinLongNotes(typeNotes.A005, notes);
    else if (typeNotes.A005.length == 1) this.activity.TEXT.push(notes[typeNotes.A005[0]]);
    if (typeNotes.A007.length > 1) this.joinLongNotes(typeNotes.A007, notes);
    else if (typeNotes.A007.length == 1) this.activity.TEXT.push(notes[typeNotes.A007[0]]);
    if (typeNotes.AC01.length > 1) this.joinLongNotes(typeNotes.AC01, notes);
    else if (typeNotes.AC01.length == 1) this.activity.TEXT.push(notes[typeNotes.AC01[0]]);
    if (typeNotes.Z001.length > 1) this.joinLongNotes(typeNotes.Z001, notes); 
    else if (typeNotes.Z001.length == 1) this.activity.TEXT.push(notes[typeNotes.Z001[0]]);
    if (typeNotes.Z002.length > 1) this.joinLongNotes(typeNotes.Z002, notes);
    else if (typeNotes.Z002.length == 1) this.activity.TEXT.push(notes[typeNotes.Z002[0]]);
    if (typeNotes.Z003.length > 1) this.joinLongNotes(typeNotes.Z003, notes);
    else if (typeNotes.Z003.length == 1) this.activity.TEXT.push(notes[typeNotes.Z003[0]]);
    if (typeNotes.Z004.length > 1) this.joinLongNotes(typeNotes.Z004, notes);
    else if (typeNotes.Z004.length == 1) this.activity.TEXT.push(notes[typeNotes.Z004[0]]);
  }

  joinLongNotes(typeNote, notes) {
    let note;

    typeNote.forEach((type, index) => {
      if (index == 0)
        note = notes[typeNote[index]];
      else if (index != 0)
        note.TDLINE = note.TDLINE + notes[typeNote[index]].TDLINE
    });

    this.activity.TEXT.push(note);
  }

  addNotesToDelete(note) {
    let exist = false;
    note.MODE = "D";
    note.TDLINE = "";
    
    for (let noteDelete of this.allNotesToDelete) {
      if (noteDelete.TDID == note.TDID) exist = true;
    }

    if(!exist) this.allNotesToDelete.push(note);
  }

  addNotesToDeleteToSAP() {
    let exist = false;

    for (let noteDelete of this.allNotesToDelete) {
      for (let note of this.activity.TEXT) {
        if (noteDelete.TDID == note.TDID) exist = true;
      }

      if (!exist) this.activity.TEXT.push(noteDelete);
    }
  }

  separateLongNote(note) {
    let descripcionNota = note.TDLINE;

    if (descripcionNota.length > 132) {
      note.TDLINE = descripcionNota.substring(0, 132);
      this.activity.TEXT.push(JSON.parse(JSON.stringify(note)));
      note.TDLINE = descripcionNota.substring(132, descripcionNota.length);
      this.separateLongNote(note);
    } else {
      this.activity.TEXT.push(note);
    }
  }

  separateLongNotes() {
    let notes = this.activity.TEXT;
    this.activity.TEXT = [];

    for (let note of notes) {
      this.separateLongNote(note);
    }
  }

  flush() {

    this.fillFields();
    this.fixActivityToSAP();
    this.cleanProducts();
    
    let errorsValidate = this.validateActivity();

    if (errorsValidate.length == 0) {
      this.addNotesToDeleteToSAP(); //Aniadimos las notas que queremos eliminar en SAP
      this.separateLongNotes(); //Separamos una nota en varias si la descripcion supera los 132 caracteres
      this.fixNotesToSAP(); //Arreglamos las Notas para que SAP las recoja bien

      this.utils.showLoading();
      (this.existActivity ? this.queueProvider.pushChangeActivity : this.queueProvider.pushCreateActivity)(this.activity, false).then(() => {
        this.utils.hideLoading();
        this.ablePop = true;
        this.paramsPop = "doSync";
        this.ev.publish('eventSyncActivity', this.paramsPop);
        this.ev.publish('eventSyncContactFromActivity', this.paramsPop);
        this.navCtrl.pop();
      }, (error) => {
        this.utils.showToast(error);
        this.utils.hideLoading();
      });
    } else {
      this.translate.get('form').subscribe(
        form => {
          this.translate.get('Agree').subscribe(
            agree => {
              let alert = this.alertCtrl.create({
                title: form,
                message: errorsValidate.join('<br/><hr>'),
                buttons: [agree]
              });
              alert.present();
            });
        });
    }
  }

  loadTextClass() {
    return this.sapcrmCacheProvider.getTextActClasses().then(
      (res: TextActClasses[]) => {
        this.textClass = [];
        for (let textClass of res) {
          if (textClass.PROCESS_TYPE == this.activity.HEADER.PROCESS_TYPE)
            this.textClass.push(textClass);
        }
        this.textClass.sort((a, b) => {
          return a.TDTEXT.localeCompare(b.TDTEXT, "ca-ES");
        })
      },
      (error) => {
        console.log(error);
      });
  }

  //Validates
  validateActivity() {
    let errors: Array<string> = [];

    this.submitAttempt = true;
    let hasInterlocutor = false;

    //activityForm
    if (!this.isValidActivityForm()) {
      this.translate.get('checkRedFields').subscribe(
        checkRedFields => {
          errors.push(checkRedFields);
        });
    }

    if (this.checkDates()) {
      this.translate.get('DateInvalid').subscribe(
        dateInvalid => {
          errors.push(dateInvalid);
        });
    }

    //Si tenemos notas
    let oneEmpty = false;
    if (this.activity.TEXT.length > 0) {
      for (let note of this.activity.TEXT) {
        if (note.TDID == "") {
          this.translate.get('EmptyTextClass').subscribe(
            EmptyTextClass => {
              errors.push(EmptyTextClass);
            });
        }

        if (note.TDLINE == "" && !oneEmpty) {
          oneEmpty = true;
          this.translate.get('EmptyTextNote').subscribe(
            EmptyTextNote => {
              errors.push(EmptyTextNote);
            });
        }
      }
    }

    //Notas del mismo tipo 
    let encontrado = false;
    for (let index = 0; index < this.activity.TEXT.length && !encontrado; index++) {
      for (let copyIndex = 0; copyIndex < this.activity.TEXT.length && !encontrado; copyIndex++) {
        if (index != copyIndex && this.activity.TEXT[index].TDID == this.activity.TEXT[copyIndex].TDID) {
          encontrado = true
        }
      }
    }
    if (encontrado) {
      this.translate.get('DuplicateTypeNote').subscribe(
        DuplicateTypeNote => {
          errors.push(DuplicateTypeNote);
        });
    }

    for (let partner of this.activity.PARTNERS) {
      if (partner.PARTNER_FCT == '00000009') {
        hasInterlocutor = true;
      }
    }

    if (!hasInterlocutor && this.isCheckedContacts()) {

      this.translate.get('InterlocutorNeed').subscribe(
        interlocutorNeed => {
          errors.push(interlocutorNeed);
        });
    }

    return errors;
  }

  // Valida los campos incluídos en activityForm 
  isValidActivityForm() {
    Object.keys(this.activityForm.controls).forEach(key => {
      this.activityForm.get(key).markAsTouched();
    });

    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("Error en el detectChanges");
    }
    return this.activityForm.valid;
  }

  checkDates() {
    AppSettings.STORE_CONFIG_ACTIVITIES.preInsert(this.activity);

    if (this.activity.DATETIME_FROM > this.activity.DATETIME_TO) {
      return true;
    } else {
      return false;
    }

  }

  changeOptionSelected(optionSelectedVal, propertyToChange, currentItemToChange, title, key, label, options, index?, whereClause?, whereValues?) {
    this.translate.get(title).toPromise().then(translatedTitle => {
      if (typeof options == "string") {
        this[options](whereClause, whereValues, 0).then((options) => {
          let profileModal = this.modalCtrl.create(SelectSearchModal, {
            val: optionSelectedVal,
            options: options,
            label: label,
            key: key,
            allowEmpty: true,
            title: translatedTitle
          }, {
              enableBackdropDismiss: false
            });

          profileModal.onWillDismiss(indexSelected => {
            if (indexSelected != null) {
              if (index != null) {
                this[currentItemToChange][index][label] = options[indexSelected][label];
                this[currentItemToChange][index][key] = options[indexSelected][key];
              }
              else {
                this[currentItemToChange][label] = options[indexSelected][label];
                this[currentItemToChange][key] = options[indexSelected][key];
              }

              var res = propertyToChange.split(".");
              let fullPathProperty = this[res[0]];
              console.log(fullPathProperty);
              for (let property of res.slice(1, res.length - 1)) {
                fullPathProperty = fullPathProperty[property];
                console.log(fullPathProperty);
              }
              console.log(fullPathProperty);
              fullPathProperty[res[res.length - 1]] = options[indexSelected][key];
              this.submitAttempt = true;
            }
          });
          profileModal.present();
        })
      }
      else {
        let profileModal = this.modalCtrl.create(SelectSearchModal, {
          val: optionSelectedVal,
          options: options,
          label: label,
          key: key,
          allowEmpty: true,
          title: translatedTitle
        }, {
            enableBackdropDismiss: false
          });

        profileModal.onWillDismiss(indexSelected => {
          if (indexSelected != null) {
            if (index != null) {
              this[currentItemToChange][index][label] = options[indexSelected][label];
              this[currentItemToChange][index][key] = options[indexSelected][key];
            }
            else {
              this[currentItemToChange][label] = options[indexSelected][label];
              this[currentItemToChange][key] = options[indexSelected][key];
            }

            var res = propertyToChange.split(".");
            let fullPathProperty = this[res[0]];
            console.log(fullPathProperty);
            for (let property of res.slice(1, res.length - 1)) {
              fullPathProperty = fullPathProperty[property];
              console.log(fullPathProperty);
            }
            console.log(fullPathProperty);
            fullPathProperty[res[res.length - 1]] = options[indexSelected][key];
            this.submitAttempt = true;

          }
        });
        profileModal.present();
      }
    });
  }

  createNewPartner(partnerSelected: any, tipo?: any): Promise<any> {
    let partner = {
      PARTNER_FCT: tipo,
      PARTNER_NO: partnerSelected.PARTNER,
      FULLNAME: partnerSelected.NAME
    }
    return new Promise<any>((resolve) => resolve(partner));
  }

  isCheckedContacts() {
    if (this.activity.HEADER.PROCESS_TYPE == "Z008") {
      return false;
    } else return true;
  }

  printOrder(formatoSAP) {
    // console.log("PRINT ACTIVITY: " + JSON.stringify(this.activity, null, 2));
    this.printDates(formatoSAP);
    this.printHeader(formatoSAP);
    this.printStatusTab(formatoSAP);
    this.printPartners(formatoSAP);
    this.printProducts(formatoSAP);
    this.printNotes(formatoSAP);
  }

  printDates(formatoSAP) {
    let datesToPrint = [];

    if (formatoSAP) {
      this.activity.DATE.forEach((date) => {
        if (date.APPT_TYPE == 'ORDERPLANNED') {
          datesToPrint.push({
            APPT_TYPE: date.APPT_TYPE,
            DATE_FROM: date.DATE_FROM,
            DATE_TO: date.DATE_TO,
            TIME_FROM: date.TIME_FROM,
            TIME_TO: date.TIME_TO,
            TIMEZONE_FROM: date.TIMEZONE_FROM,
            TIMEZONE_TO: date.TIMEZONE_TO
          });
        }
      });
    } else {
      datesToPrint = this.activity.DATE;
    }

    console.log("PRINT DATES: " + JSON.stringify(datesToPrint, null, 2));
  }

  printHeader(formatoSAP) {
    let headerToPrint = {};

    if (formatoSAP) {
      headerToPrint = {
        GUID: this.activity.HEADER.GUID,
        OBJECT_ID: this.activity.HEADER.OBJECT_ID,
        PROCESS_TYPE: this.activity.HEADER.PROCESS_TYPE,
        DESCRIPTION: this.activity.HEADER.DESCRIPTION,
        CATEGORY: this.activity.HEADER.CATEGORY,
        OBJECTIVE: this.activity.HEADER.OBJECTIVE,
        PRIVATE_FLAG: this.activity.HEADER.PRIVATE_FLAG,
        EXTERN_ACT_ID: this.activity.HEADER.EXTERN_ACT_ID,
        ACT_LOCATION: this.activity.HEADER.ACT_LOCATION
      };
    } else {
      headerToPrint = this.activity.HEADER;
    }

    console.log("PRINT HEADER: " + JSON.stringify(headerToPrint, null, 2));
  }

  printStatusTab(formatoSAP) {
    let statusTabToPrint = [];

    if (formatoSAP) {
      this.activity.STATUS_TAB.forEach((status) => {
        statusTabToPrint.push({
          STATUS: status.STATUS
        });
      });
    } else {
      statusTabToPrint = this.activity.STATUS_TAB;
    }

    console.log("PRINT STATUS TAB: " + JSON.stringify(statusTabToPrint, null, 2));
  }

  printPartners(formatoSAP) {
    let partnersToPrint = [];

    if (formatoSAP) {
      this.activity.PARTNERS.forEach((partner) => {
        partnersToPrint.push({
          PARTNER_FCT: partner.PARTNER_FCT, 
          PARTNER_NO: partner.PARTNER_NO
        });
      });
    } else {
      partnersToPrint = this.activity.PARTNERS;
    }

    console.log("PRINT PARTNERS: " + JSON.stringify(partnersToPrint, null, 2));
  }

  printProducts(formatoSAP) {
    let productsToPrint = [];

    if (formatoSAP) {
      this.activity.MATERIAL_TAB.forEach((product) => {
        productsToPrint.push({
          ORDERED_PROD: product.ORDERED_PROD,
          DESCRIPTION: product.DESCRIPTION
        });
      });
    } else {
      productsToPrint = this.activity.MATERIAL_TAB;
    }

    console.log("PRINT PRODUCTS: " + JSON.stringify(productsToPrint, null, 2));
  }

  printNotes(formatoSAP) {
    let notesToPrint = [];

    if (formatoSAP) {
      this.activity.TEXT.forEach((note) => {
        notesToPrint.push({
          TDID: note.TDID,
          TDLINE: note.TDLINE,
          REF_KIND: note.REF_KIND,
          MODE: note.MODE ? note.MODE : note.REF_KIND,
          TDFORMAT: note.TDFORMAT,
          TDSPRAS: note.TDSPRAS
        });
      });
    } else {
      notesToPrint = this.activity.TEXT;
    }

    console.log("PRINT NOTES: " + JSON.stringify(notesToPrint, null, 2));
  }
}
