import { MapPage } from '../map/map';
import { SelectRelationModal } from '../../components/select-relation-modal/select-relation-modal';
import { FillNoteModal } from '../../components/fill-note-modal/fill-note-modal';
import { AlertProvider } from '../../providers/alert-provider';
import { LoaderProvider } from '../../providers/loader-provider';
import { AppSettings } from '../../config/app-settings';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { NavController, NavParams, Events } from 'ionic-angular';
import { ModalController, AlertController, Content } from 'ionic-angular';
import { PartnerAbstract } from '../../models/partnerAbstract';
import { QueueProvider } from '../../providers/queue-provider';
import { SapcrmProvider } from '../../providers/sapcrm-provider';
import { SapcrmCacheProvider } from '../../providers/sapcrm-cache-provider';
import { UtilsProvider } from '../../providers/utils-provider';
import { LoginProvider } from '../../providers/login-provider';
import { ActivityPage } from '../activity/activity';
import { Partner } from '../../models/partner';
import { Country } from '../../models/country';
import { Region } from '../../models/region';
import { TitleKey } from '../../models/titleKey';
import { TextActClasses } from '../../models/textActClasses';
import { Functions } from '../../models/function';
import { Department } from '../../models/department';
import { Language } from '../../models/language';
import { MarketingHeader } from '../../models/marketingHeader';
import { MarketingAttribute } from '../../models/marketingAttribute';
import { ReTypes } from '../../models/reTypes';
import { Zone } from '../../models/Zone';
import { OperationsClass } from '../../models/operations_class';
import { ActivityAbstract } from '../../models/activityAbstract';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { SelectSingleValue } from '../../components/select-single-value/select-single-value';
import { SelectSearchModal } from '../../components/select-search/select-search-modal';
import { RelationsProvider } from "../../providers/relations-provider";
import { SyncProvider } from '../../providers/sync-provider';
import { SapcrmWebProvider } from '../../providers/sapcrm-web-provider';

/*
  Generated class for the Contact page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
})
export class ContactPage {

  @ViewChild(Content) content: Content;
  activities: Array<LastActivity>

  existPartner: boolean;
  firstLoad: boolean = true;
  submitAttempt: boolean = false;
  zones: Array<Zone>;
  countries: Array<Country>;
  regions: Array<Region>;
  titles: Array<TitleKey>;
  functions: Array<Functions>;
  partners: Array<{ NAME: string, PARTNER: string }>;
  textClass: Array<TextActClasses>;
  languages: Array<Language>;
  marketingHeaders: Array<MarketingHeader>;
  marketingAttributes: Array<MarketingAttribute>;
  reTypes: Array<ReTypes>;
  operations: Array<OperationsClass>;

  partner: Partner;
  copyPartner: any;
  ablePop: boolean = false;
  ableDelete: boolean = false;
  currentTitleTreatment = {
    value: "",
    text: "",
  };

  currentClientType = {
    CLASSIFIC: "",
    TEXT: ""
  };

  currentCountry = {
    LAND1: "",
    LANDX: ""
  }

  currentRegion = {
    BLAND: "",
    BEZEI: ""
  }

  currentLanguage = {
    SPRSL: "",
    SPTXT: ""
  }

  currentPotencial = {
    value: ""
  }

  currentZone = {
    DISTRICT: "",
    DESCRIPTION: ""
  }

  currentFunction = {
    PAFKT: "",
    BEZ30: ""
  }

  currentPermit = {
    value: "",
    text: ""
  }

  currentRelations: {
    BEZ50: string,
    NAME: string,
    PARTNER2: string,
    RELATIONSHIPCATEGORY: string

  }[] = [];

  currentSpecies: MarketingHeader[] = [];

  possibleSpecies: MarketingHeader[] = [];

  contactForm: FormGroup;

  paramsPop: string;

  potencials: Array<any>;
  titleTreatment: Array<any>;
  permisos: Array<any>;

  current_page_title: string = "";
  current_latest_activity = "";

  accountClassificationOpened: boolean = true;
  accountsOpened: boolean = true;
  addressOpened: boolean = true;
  communicationOpened: boolean = true;
  speciesOpened: boolean = true;
  diagnosticOpened: boolean = true;
  webOpened: boolean = true;
  personContactSpecificFieldsOpened: boolean = true;
  relationsOpened: boolean = true;
  notesOpened: boolean = true;
  latestActivitiesOpened: boolean = true;
  hipraSpecificFieldsOpened: boolean = true;

  isBusy = false;
  openingOtherPage = false;

  loadingPartner = true;
  loadingRelations = 0;

  isDeleteable = false;
  isSaveable = true;

  eventSync: string;

  constructor(public cdRef: ChangeDetectorRef, 
              public navCtrl: NavController, 
              private utils: UtilsProvider,
              public queueProvider: QueueProvider, 
              public sapcrmProvider: SapcrmProvider,
              public sapcrmCacheProvider: SapcrmCacheProvider,
              public navParams: NavParams, 
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              private translate: TranslateService, 
              private ev: Events,
              public loginProvider: LoginProvider,
              private loaderProvider: LoaderProvider,
              private alertProvider: AlertProvider,
              private relationsProvider: RelationsProvider,
              public syncProvider: SyncProvider,
              public sapcrmWebProvider: SapcrmWebProvider
  ) {

    this.potencials = this.utils.getPotencials();
    this.titleTreatment = this.utils.getTitlesTreatment();
    this.permisos = this.utils.getPermisos();

    this.navParams.get("isDeleteable") == null ? this.isDeleteable = true : this.isDeleteable = false;

    this.paramsPop = "";
    this.existPartner = false;
    this.partner = this.utils.fixPartner({});
    this.loadCacheData().then(() => {


      let full_partner = navParams.get('full');
      if (full_partner != null) {
        this.current_page_title = "Edit Partner";
        //Compruebo si lo he creado yo y puedo eliminarlo
        if (this.loginProvider.user.id.toUpperCase() == full_partner.CENTRAL_CUSTOMER_EXT.ZZCREATED_BY || full_partner.GROUP == "YP") {
          this.ableDelete = true;
        }
        this.isDeleteable = false;
        this.isSaveable = true;
        this.partner = this.utils.fixPartner(full_partner);
        this.copyPartner = JSON.parse(JSON.stringify(this.partner));
        this.existPartner = true;
        this.firstLoad = false;

        this.setTitleTreatment(this.partner.CENTRAL.TITLE_KEY);
        this.setCurrentClientType(this.partner.CLASSIFIC.CLASSIFIC);
        this.setCurrentCountry(this.partner.DATA_ADDRESS.COUNTRY);
        this.load10Activities();
        this.loadRegions().then(() => {
          this.loadingPartner = false;
          this.setCurrentRegion(this.partner.DATA_ADDRESS.REGION);
        });
        this.setCurrentRelations(this.partner.RELATIONS);
        this.setCurrentLanguage(this.partner.CENTRAL.PARTNERLANGUAGE);
        this.setCurrentZone(this.partner.CENTRAL_CUSTOMER_EXT.ZZZONA);
        this.setCurrentPotencial(this.partner.CENTRAL_CUSTOMER_EXT.ZZVIC);
        this.setCurrentFunction(this.partner.CENTRAL_CUSTOMER_EXT.ZZFUNCTION);
        this.setCurrentPermission(this.partner.CENTRAL.CONTACTALLOWANCE);
        this.setCurrentSpecies();
      }
      //Si me han pasado el id del partner como parámetro
      else if (navParams.get('id')) {

        this.current_page_title = "Edit Partner";

        this.sapcrmWebProvider.syncOptimizedPartner('X', navParams.get('id'), navParams.get('guid')).then((res) => {
            this.partner = this.utils.fixPartner(res);
            this.copyPartner = JSON.parse(JSON.stringify(this.partner));
            this.existPartner = true;
            this.firstLoad = false;

            //Compruebo si lo he creado yo y puedo eliminarlo
            if (this.loginProvider.user.id.toUpperCase() == this.partner.CENTRAL_CUSTOMER_EXT.ZZCREATED_BY || this.partner.GROUP == "YP"
            ) {
              this.ableDelete = true;
            }
            this.isDeleteable = true;
            this.isSaveable = true;

            this.setTitleTreatment(this.partner.CENTRAL.TITLE_KEY);
            this.setCurrentClientType(this.partner.CLASSIFIC.CLASSIFIC);
            this.setCurrentCountry(this.partner.DATA_ADDRESS.COUNTRY);
            this.load10Activities();
            this.loadRegions().then(() => {
              this.loadingPartner = false;
              this.setCurrentRegion(this.partner.DATA_ADDRESS.REGION);
            });
            this.setCurrentRelations(this.partner.RELATIONS);
            this.setCurrentLanguage(this.partner.CENTRAL.PARTNERLANGUAGE);
            this.setCurrentZone(this.partner.CENTRAL_CUSTOMER_EXT.ZZZONA);
            this.setCurrentPotencial(this.partner.CENTRAL_CUSTOMER_EXT.ZZVIC);
            this.setCurrentFunction(this.partner.CENTRAL_CUSTOMER_EXT.ZZFUNCTION);
            this.setCurrentPermission(this.partner.CENTRAL.CONTACTALLOWANCE);
            this.setCurrentSpecies();
          },
          (error) => {
            this.utils.showToast(error);
          });
      } else if (navParams.get('operacion')) {

        this.current_page_title = "New Partner";

        this.firstLoad = false;
        this.partner.PARTNER = this.utils.generateGuid();
        this.partner.CLASSIFIC.CLASSIFIC = navParams.get('operacion');
        this.setCurrentClientType(this.partner.CLASSIFIC.CLASSIFIC);
        this.partner.CENTRAL.PARTNERLANGUAGE = this.loginProvider.user.lang;
        this.setCurrentLanguage(this.partner.CENTRAL.PARTNERLANGUAGE);
        this.setCurrentSpecies();
        this.loadingPartner = false;
      }
    });


    this.contactForm = new FormGroup({
      NAME1: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      NAME2: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      TITLETREATMENT: new FormControl({ value: '' }),
      CLIENTTYPE: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      COUNTRY: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      REGION: new FormControl({ value: '' }),
      POSTALCODE: new FormControl({ value: '' }),
      LANGUAGE: new FormControl({ value: '' }),
      ZONE: new FormControl({ value: '' }, Validators.compose([Validators.required]))
    });
  }

  loadCacheData() {
    return Promise.all([
      this.loadCountries(),
      this.loadPartnerTitles(),
      this.loadFunctions(),
      this.loadLanguages(),
      this.loadMarketingAttributes(),
      this.loadMarketingHeaders(),
      this.loadReTypes(),
      this.loadZonesUser(),
      this.loadOperationsClasses(),
      this.loadTextClass()
    ]);
  }

  ionViewDidLoad() {
    this.ev.subscribe('eventSyncContactFromActivity', modificado => {
      this.eventSync = modificado;
    });
  }

  ionViewDidEnter() {
    this.openingOtherPage = false; //Estamos en la pagina principal
    console.log('ionViewDidEnter ContactPage');

    if (this.eventSync == "doSync") {
      this.refresh();
      this.eventSync = "";
    }
  }

  refresh(): Promise<void> {
    let end = () => {
      this.reload10Activities();
    };

    return this.syncProvider.sync()
      .then(end)
      .catch(end);
  }

  ionViewCanLeave() {
    // here we can either return true or false
    // depending on if we want to leave this view

    //Si pasamos a otra pagina, no comprobamos los cambios
    if (this.openingOtherPage)
      return Promise.resolve();

    return new Promise((resolve, reject) => {

      let changes = JSON.stringify(this.partner) === JSON.stringify(this.copyPartner);
      console.log("Comprobamos si son iguales  =" + changes);
      this.translate.get('LostChanges').subscribe(
        lostChanges => {
          this.translate.get('LostChangesAccepted').subscribe(
            lostChangesAccepted => {
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

  watchPartner(partnerId: string) {
    this.openingOtherPage = true; //Pasamos a otra pagina
    this.navCtrl.push(ContactPage, {
      id: partnerId,
      isDeleteable: false
    });
  }

  getActivityResponsible(activity: ActivityAbstract) {
    for (let partner of activity.PARTNERS) {
      if (partner.PARTNER_FCT == "00000014") {
        return partner.FULLNAME;
      }
    }
  }

  presentAlert(partner) {

    let alertText = "";
    if (partner.DATA_ADDRESS.COUNTRY.length != 2) {
      this.translate.get('SelectCountry').subscribe(
        titleTranslate => {

          alertText = titleTranslate
        });
    }
    return alertText

  }

  generarPassw() {
    if (this.partner.ADSMTP && this.partner.ADSMTP[0] && this.partner.ADSMTP[0].E_MAIL && this.checkEmail()) {

      var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
      var capsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      var randomstring = '';

      for (var i = 0; i < 2; i++) {
        var rlet = Math.floor(Math.random() * letters.length);
        randomstring += letters[rlet];
      }
      for (var i = 0; i < 2; i++) {
        var rnum = Math.floor(Math.random() * numbers.length);
        randomstring += numbers[rnum];
      }

      for (var i = 0; i < 2; i++) {
        var rletCaps = Math.floor(Math.random() * capsLetters.length);
        randomstring += capsLetters[rletCaps];
      }
      //shuffle da string gerada
      var finalpass = randomstring.split('').sort(function () {
        return 0.5 - Math.random();
      }).join('');

      this.partner.CENTRAL_CUSTOMER_EXT.ZZWEBPWD = finalpass;

      try {
        this.cdRef.detectChanges();
      } catch (err) {
        console.log("error en el detectChanges");
      }

    }

  }

  generarUserPassw() {

    if (this.partner.ADSMTP && this.partner.ADSMTP[0] && this.partner.ADSMTP[0].E_MAIL && this.checkEmail()) {

      var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
      var capsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      var randomstring = '';

      for (var i = 0; i < 2; i++) {
        var rlet = Math.floor(Math.random() * letters.length);
        randomstring += letters[rlet];
      }
      for (var i = 0; i < 2; i++) {
        var rnum = Math.floor(Math.random() * numbers.length);
        randomstring += numbers[rnum];
      }

      for (var i = 0; i < 2; i++) {
        var rletCaps = Math.floor(Math.random() * capsLetters.length);
        randomstring += capsLetters[rletCaps];
      }
      //shuffle da string gerada
      var finalpass = randomstring.split('').sort(function () {
        return 0.5 - Math.random();
      }).join('');

      this.partner.CENTRAL_CUSTOMER_EXT.ZZWEBPWD = finalpass;

      let username = this.partner.ADSMTP[0].E_MAIL;
      //username = username.slice(0, username.indexOf("@"));
      this.partner.CENTRAL_CUSTOMER_EXT.ZZWEBUSR = username;
      try {
        this.cdRef.detectChanges();
      } catch (err) {
        console.log("error en el detectChanges");
      }
    } else {

      if (!this.partner.ADSMTP || !this.partner.ADSMTP[0] || !this.partner.ADSMTP[0].E_MAIL) {
        this.translate.get('EmailFirst').subscribe(
          emailFirst => {
            let alert = this.alertCtrl.create({
              //title: 'No hay ningún correo',
              title: emailFirst,
              message: emailFirst,
              buttons: ['OK']
            });
            alert.present();
          });
      }
    }

  }

  openMap() {
    this.openingOtherPage = true; //Pasamos a otra pagina
    let partner_markers = [];
    this.loaderProvider.pushLoadingProcessCallback().then(() => {
      partner_markers.push({
        latitude: this.partner.GEODATA.LATITUDE,
        longitude: this.partner.GEODATA.LONGITUDE,
        partner_name: this.partner.CENTRAL_ORGAN.NAME1,
        partner_address: this.partner.DATA_ADDRESS.STR_SUPPL1
      })
      this.navCtrl.push(MapPage, {
        partner_markers: partner_markers,
        location: false
      });
      this.loaderProvider.popLoadingProcess();
    });
  }

  un2Number(unString) {
    if (unString) {
      let res = unString && unString.endsWith("UN") ? unString.substring(0, unString.length - 3) : unString;
      return res ? parseInt(res) : 0;
    }
  }

  focusNextInput(event, next) {
    // if (event.keyCode == 13) {
    //   this[next].setFocus();
    // }
  }

  createPartnerMarketingHeader(marketingHeader: MarketingHeader, marketingHeaderClassNum: MarketingAttribute) {

    let items = [];
    var date = new Date();

    let dateFormat = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) + ("0" + date.getHours() + 1).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);

    for (let x of this.marketingAttributes) {
      if (x.CLASS_NUM == marketingHeader.CLASS_NUM) {
        let animal = {
          ANZDZ: "0",
          ANZST: "10",
          ATDESCR: x.DESCR,
          ATNAME: x.NAME_CHAR,
          ATVALUE: "",
          DATATYPE: "NUM",
          SINGLE_VALUE: "X",
          ATVALUEDESCR: "",
          CHANGED_AT: dateFormat,
          CHANGED_BY: ""
        }
        items.push(animal);
      }
    }

    let especie = {
      ALLOCVALUES: items,
      PARTNER_GUID: "",
      PROFILE_TEMPLATE_DESCR: marketingHeader.CATCHWORD,
      PROFILE_TEMPLATE_ID: marketingHeader.CLASS_NUM

    }
    return especie;
  }

  getPartnerMarketingAttributeGood(marketingHeader: MarketingHeader, marketingAttribute: MarketingAttribute): any {
    if (!this.partner.MKT_ATTR) {
      this.partner.MKT_ATTR = [];
    }
    for (let animal of this.partner.MKT_ATTR) {
      if (animal.PROFILE_TEMPLATE_ID == marketingAttribute.CLASS_NUM) {
        for (let numero of animal.ALLOCVALUES) {
          if (numero.ATNAME == marketingAttribute.NAME_CHAR) {
            return numero;
          }
        }
      }
    }

    let animal = {
      ANZDZ: "0",
      ANZST: "10",
      ATDESCR: "",
      ATNAME: "",
      ATVALUE: "",
      DATATYPE: "NUM",
      SINGLE_VALUE: "X",
      ATVALUEDEESCR: "",
      CHANGET_AT: "",
      CHANGED_BY: ""
    }

    return animal;
  }

  getPartnerMarketingAttribute(marketingHeader: MarketingHeader, marketingAttribute: MarketingAttribute) {
    if (!this.partner.MKT_ATTR) {
      this.partner.MKT_ATTR = [];
    }
    for (let especie of this.partner.MKT_ATTR) {
      if (especie.PROFILE_TEMPLATE_ID == marketingAttribute.CLASS_NUM) {
        for (let animal of especie.ALLOCVALUES) {
          if (animal.ATNAME == marketingAttribute.NAME_CHAR) {
            return animal;
          }
        }
      }
    }

    this.partner.MKT_ATTR.push(this.createPartnerMarketingHeader(marketingHeader, marketingAttribute));
    return this.getPartnerMarketingAttribute(marketingHeader, marketingAttribute);
  }
  ///////////////EDIT LINE NOTES
  getLines(nota) {

    if (nota.LINES.length != 1) {
      let textNota = "";
      for (let linea of nota.LINES) {
        textNota += linea.TDLINE + "\n";
      }
      return textNota;
    } else {
      return nota.LINES[0].TDLINE;
    }

  }

  setLinesGood(nota, content: string) {
    let lineas = content.split("\n");
    nota.LINES = [];
    for (let i = 0; i < lineas.length; i++) {
      nota.LINES.push({
        TDFORMAT: "*",
        TDLINE: lineas[i],
      });
    }
  }

  setLines(nota, event) {
    let lineas = event.target.value.split("\n");
    nota.LINES = [];
    for (let i = 0; i < lineas.length; i++) {
      nota.LINES.push({
        TDFORMAT: "*",
        TDLINE: lineas[i],
      });
    }
  }

  indexIfExistRelation(relacion) {
    let index = -1;

    this.partner.RELATIONS.forEach((relation, indice) => {
      if (relation.PARTNER2 == relacion.PARTNER2 && relation.RELATIONSHIPCATEGORY == relacion.RELATIONSHIPCATEGORY)
        index = indice;
    });

    return index;
  }

  indexCurrentIfExistRelation(relacion) {
    let index = -1;

    this.currentRelations.forEach((relation, indice) => {
      if (relation.PARTNER2 == relacion.PARTNER2 && relation.RELATIONSHIPCATEGORY == relacion.RELATIONSHIPCATEGORY)
        index = indice;
    });

    return index;
  }

  //////////////Delete data partner
  deleteData(data, tipo) {
    this.translate.get('Cancel').subscribe(
      cancel => {
        this.translate.get('Agree').subscribe(
          agree => {
            this.translate.get('DeleteElement').subscribe(
              titleTranslate => {
                this.translate.get('DeletePermanent').subscribe(
                  messageTranslate => {

                    let confirm = this.alertCtrl.create({
                      title: titleTranslate,
                      message: messageTranslate,
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
                              case 'note'://CASO NOTE
                                index = this.partner.TEXT.indexOf(data);
                                if (index > -1) {
                                  this.partner.TEXT.splice(index, 1);
                                }
                                break;
                              case 'phone'://CASO PHONE
                                index = this.partner.ADTEL.indexOf(data);
                                if (index > -1) {
                                  this.partner.ADTEL.splice(index, 1);
                                }
                                break;
                              case 'email'://Caso Email
                                index = this.partner.ADSMTP.indexOf(data);
                                if (index > -1) {
                                  this.partner.ADSMTP.splice(index, 1);
                                }
                                break;
                              case 'fax'://CASO FAX
                                index = this.partner.ADFAX.indexOf(data);
                                if (index > -1) {
                                  this.partner.ADFAX.splice(index, 1);
                                }
                                break;
                              case 'relation'://CASO RELATION
                                index = this.indexIfExistRelation(data);
                                let index_current = this.indexCurrentIfExistRelation(data);
                                if (index > -1 && index_current > -1) {
                                  this.partner.RELATIONS.splice(index, 1);
                                  this.currentRelations.splice(index_current, 1);
                                }
                                break;
                              case 'web'://CASO WEB
                                index = this.partner.ADURI.indexOf(data);
                                if (index > -1) {
                                  this.partner.ADURI.splice(index, 1);
                                }
                                break;
                            }
                          }
                        }
                      ]
                    });
                    confirm.present();
                  }
                );
              }
            );
          });
      });
  }

  deleteEspecie(exist, especie) {
    if (exist != 'X') {
      for (let animal of this.partner.MKT_ATTR) {
        if (animal.PROFILE_TEMPLATE_ID == especie) {
          let index = this.partner.MKT_ATTR.indexOf(animal);
          if (index > -1) {
            this.partner.MKT_ATTR.splice(index, 1);
          }
        }
      }
    }
  }
  //////////////Add data partner
  editNota(actualNota?) {

    if (this.isBusy)
      return;
    this.isBusy = true;

    let nota;
    let profileModal;
    if (actualNota == null) {
      nota = {
        STXH: {
          TDID: "",
          TDSPRAS: this.partner.CENTRAL.PARTNERLANGUAGE,
          TDTITLE: ""
          //TDLUSER: "",
        },
        LINES: [{
          TDFORMAT: "*",
          TDLINE: "",
        }]
      };
      profileModal = this.modalCtrl.create(FillNoteModal, {
        noteTypes: this.textClass
      }, {
          enableBackdropDismiss: false
        });
    } else {
      nota = actualNota;
      profileModal = this.modalCtrl.create(FillNoteModal, {
        noteTypes: this.textClass,
        title: nota.STXH.TDTITLE,
        type: nota.STXH.TDID,
        content: this.getLines(nota)
      }, {
          enableBackdropDismiss: false
        });
    }

    profileModal.onWillDismiss((note: { title: string, content: string, type: string }) => {
      if (note != null && note.title != "" && note.content != "" && note.type != "") {
        if (nota.STXH.TDTITLE != note.title || nota.STXH.TDID != note.type || note.content != this.getLines(nota)) {

          let crearUnoNuevo = false;
          if (nota.STXH.TDTITLE == "" || nota.STXH.TDID == "" || this.getLines(nota) == "")
            crearUnoNuevo = true;

          nota.STXH.TDTITLE = note.title;
          this.setLinesGood(nota, note.content);
          nota.STXH.TDID = note.type;
          if (crearUnoNuevo) {
            this.partner.TEXT.splice(this.partner.TEXT.length, 0, nota);
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

  addPhone() {

    let phone = {
      COUNTRY: "",
      COUNTRYISO: "",
      STD_NO: "X",
      TELEPHONE: "",
      EXTENSION: "",
      TEL_NO: "",
      CALLER_NO: "",
      STD_RECIP: "",
      R_3_USER: "1",
      HOME_FLAG: "X",
      CONSNUMBER: "",
      ERRORFLAG: "",
      FLG_NOUSE: "",
      VALID_FROM: "",
      VALID_TO: ""
    };
    this.partner.ADTEL.splice(this.partner.ADTEL.length, 0, phone);
    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }
    var objDiv = document.getElementById("addPhone");
    objDiv.scrollHeight;
    let position = this.content.getContentDimensions()
    this.content.scrollTo(0, position.scrollTop + objDiv.scrollHeight, 700);
  }

  callPhone(phone) {
    window.location.href = "tel:" + phone;
  }

  addEmail() {

    let email = {
      EMAIL_SRCH: "",
      STD_RECIP: "",
      E_MAIL: "",
      ERRORFLAG: "",
      VALID_TO: "",
      HOME_FLAG: "",
      CONSNUMBER: "",
      TNEF: "",
      VALID_FROM: "",
      R_3_USER: "",
      FLG_NOUSE: "",
      STD_NO: "X",
      ENCODE: ""
    };
    this.partner.ADSMTP.splice(this.partner.ADSMTP.length, 0, email);
    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }
    var objDiv = document.getElementById("addEmail");
    objDiv.scrollHeight;
    let position = this.content.getContentDimensions()
    this.content.scrollTo(0, position.scrollTop + objDiv.scrollHeight, 700);
  }

  addFax() {

    let fax = {
      CONSNUMBER: "",
      COUNTRY: "",
      COUNTRYISO: "",
      ERRORFLAG: "",
      EXTENSION: "",
      FAX: "",
      FAX_GROUP: "",
      FAX_NO: "",
      FLG_NOUSE: "",
      R_3_USER: "",
      SENDER_NO: "",
      STD_NO: "",
      STD_RECIP: "",
      VALID_FROM: "",
      VALID_TO: "",
      HOME_FLAG: ""
    };
    this.partner.ADFAX.splice(this.partner.ADFAX.length, 0, fax);
    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }
    var objDiv = document.getElementById("addFax");
    objDiv.scrollHeight;
    let position = this.content.getContentDimensions()
    this.content.scrollTo(0, position.scrollTop + objDiv.scrollHeight, 700);
  }

  addWeb() {

    let web = {
      STD_NO: "X",
      URI_TYPE: "INT",
      URI: "",
      STD_RECIP: "",
      HOME_FLAG: "X",
      CONSNUMBER: "",
      URI_PART1: "",
      URI_PART2: "",
      URI_PART3: "",
      URI_PART4: "",
      URI_PART5: "",
      URI_PART6: "",
      URI_PART7: "",
      URI_PART8: "",
      URI_PART9: "",
      ERRORFLAG: "",
      FLG_NOUSE: "",
      VALID_FROM: "",
      VALID_TO: ""
    };
    this.partner.ADURI.splice(this.partner.ADURI.length, 0, web);
    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }
    var objDiv = document.getElementById("addWeb");
    objDiv.scrollHeight;
    let position = this.content.getContentDimensions()
    this.content.scrollTo(0, position.scrollTop + objDiv.scrollHeight, 700);
  }

  editRelation(previousRelation?) {
    if (this.isBusy)
      return;
    this.isBusy = true;
    this.translate.get('SelectPartner').subscribe(
      titleMessage => {
        this.translate.get('SelectRelation').subscribe(
          selectRelation => {
            this.translate.get('Cancel').subscribe(
              cancel => {
                this.translate.get('Agree').subscribe(
                  agree => {
                    let relationsForThisPerson;
                    if (this.partner.CLASSIFIC.CLASSIFIC == null) {
                      console.log("Seleccione un CLASSIFIC");
                    } else if (this.partner.CLASSIFIC.CLASSIFIC == "10") {
                      relationsForThisPerson = this.relationsProvider.RelationsForContactPerson;
                    } else if (this.partner.CLASSIFIC.CLASSIFIC == "09") {
                      relationsForThisPerson = this.relationsProvider.RelationsForPrescriptor;
                    } else {
                      relationsForThisPerson = this.relationsProvider.RelationsForOthers;
                    }

                    let profileModal = this.modalCtrl.create(SelectRelationModal, {
                      previousRelation: previousRelation,
                      relationTypes: relationsForThisPerson,
                    }, {
                        enableBackdropDismiss: false
                      });
                    profileModal.present();

                    profileModal.onDidDismiss((completedRelation: { partner: Partner, relation: ReTypes }) => {


                      if (completedRelation != null) {
                        let relacion;
                        if (this.partner.PARTNER.indexOf("-") != -1) {
                          relacion = {
                            DEFAULTRELATIONSHIP: "",
                            PARTNER1: "-1",
                            PARTNER2: completedRelation.partner.PARTNER,
                            RELATIONSHIPCATEGORY: completedRelation.relation.RELTYP,
                            RELATIONSHIPTYPE: "",
                            VALIDFROMDATE: "",
                            VALIDUNTILDATE: ""
                          };
                        } else {
                          relacion = {
                            DEFAULTRELATIONSHIP: "",
                            PARTNER1: this.partner.PARTNER,
                            PARTNER2: completedRelation.partner.PARTNER,
                            RELATIONSHIPCATEGORY: completedRelation.relation.RELTYP,
                            RELATIONSHIPTYPE: "",
                            VALIDFROMDATE: "",
                            VALIDUNTILDATE: ""
                          };
                        }

                        if (previousRelation == null) {
                          this.partner.RELATIONS.splice(this.partner.RELATIONS.length, 0, relacion);
                        } else {
                          let index = this.indexIfExistRelation(previousRelation);
                          if (index > -1) {
                            this.partner.RELATIONS.splice(index, 1, relacion);
                          }
                        }

                        this.setCurrentRelations(this.partner.RELATIONS);
                        try {
                          this.cdRef.detectChanges();
                        } catch (err) {
                          console.log("error en el detectChanges");
                        }

                      }
                    });
                    profileModal.present();
                    this.isBusy = false;
                  })

              }
            );
          });
      });

  }

  /////////Cargamos datos de DB

  loadMarketingHeaders() {
    return this.sapcrmCacheProvider.getMarketingHeaders().then(
      (res: MarketingHeader[]) => {
        this.marketingHeaders = res;
      },
      (error) => {
        console.log(error);
      });
  }
  loadMarketingAttributes() {
    return this.sapcrmCacheProvider.getMarketingAttributes().then(
      (res: MarketingAttribute[]) => {
        this.marketingAttributes = res;
      },
      (error) => {
        console.log(error);
      });
  }

  loadCountries() {
    return this.sapcrmCacheProvider.getCountries().then(
      (res: Country[]) => {
        this.countries = res;
        this.countries.sort(
          (a, b) => {
            return a.LANDX.localeCompare(b.LANDX, "ca-ES");
          }
        );
      },
      (error) => {
        console.log(error);
      });

  }

  loadRegions() {
    return this.sapcrmCacheProvider.getRegions().then(
      (res: Region[]) => {
        this.regions = [];
        for (let region of res) {
          if (region.LAND1 == this.partner.DATA_ADDRESS.COUNTRY) {
            this.regions.push(region);
          }
        }
        this.regions.sort(function (a, b) {
          if (a.BEZEI != undefined) {
            return a.BEZEI.localeCompare(b.BEZEI, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });

  }

  loadPartnerTitles() {
    return this.sapcrmCacheProvider.getFICClasses().then(
      (res: TitleKey[]) => {
        this.titles = res;
        this.titles.sort(function (a, b) {
          if (a.TEXT != undefined) {
            return a.TEXT.localeCompare(b.TEXT, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadFunctions() {
    return this.sapcrmCacheProvider.getFunctions().then(
      (res: Functions[]) => {
        this.functions = res;
        this.functions.sort(function (a, b) {
          if (a.BEZ30 != undefined) {
            return a.BEZ30.localeCompare(b.BEZ30, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadLanguages() {
    return this.sapcrmCacheProvider.getLanguages().then(
      (res: Language[]) => {
        this.languages = res;
        this.languages.sort(function (a, b) {
          if (a.SPTXT != undefined) {
            return a.SPTXT.localeCompare(b.SPTXT, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadReTypes() {
    return this.sapcrmCacheProvider.getReTypes().then(
      (res: ReTypes[]) => {
        this.reTypes = res;
        this.reTypes.sort(function (a, b) {
          if (a.BEZ50 != undefined) {
            return a.BEZ50.localeCompare(b.BEZ50, "ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  loadZonesUser() {
    return this.sapcrmProvider.getRUser().then(
      (res) => {
        if (Array.isArray(res)) {
          res.sort(function (a, b) {
            if (a.DESCRIPTION != undefined) {
              return a.DESCRIPTION.localeCompare(b.DESCRIPTION, "ca-ES");
            }
          });
          this.zones = res;
        } else {
          this.zones = [res];
        }
      },
      (error) => {
        console.log(error);
      });
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

  loadTextClass() {
    return this.sapcrmCacheProvider.getTextClasses().then(
      (res: TextActClasses[]) => {
        this.textClass = res;
        this.textClass.sort((a, b) => {
          return a.TDTEXT.localeCompare(b.TDTEXT, "ca-ES");
        })
      },
      (error) => {
        console.log(error);
      });
  }

  load10Activities() {
    this.activities = this.partner.ACT_LIST;

    if (this.activities.length > 0)
      this.current_latest_activity = this.activities[0].DATE_1;
  }

  reload10Activities(): Promise<void> {
    return this.sapcrmWebProvider.syncOptimizedPartner('X', this.partner.PARTNER, this.partner.PARTNER_GUID).then((res) => {
        this.partner = res;
        this.load10Activities();
    });
  }

  loadActivity(activityId: string) {
    this.openingOtherPage = true; //Pasamos a otra pagina
    this.navCtrl.push(ActivityPage, {
      id: activityId,
      isDeleteable: false
    });
  }

  loadNewActivity() {
    this.translate.get('SelectTypeActivity').subscribe(
      SelectTypeActivity => {
        let profileModal = this.modalCtrl.create(SelectSingleValue, {
          options: this.operations,
          key: "PROCESS_TYPE",
          label: "P_DESCRIPTION_20",
          showKey: false,
          title: SelectTypeActivity
        }, {
            enableBackdropDismiss: false
          });
        profileModal.onDidDismiss((value: string) => {
          if (value) {
            this.openingOtherPage = true; //Pasamos a otra pagina
            this.navCtrl.push(ActivityPage, {
              operacion: value,
              partnerFromContactPage: this.partner
            });
          }
        });
        profileModal.present();
      });
  }

  onBlur(event) {
    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }
  }

  checkEmail(): boolean {
    if (this.partner.ADSMTP.length > 0) {
      let res = true;
      for (let email of this.partner.ADSMTP) {
        let regex = /^[_a-zA-Z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/g;
        res = regex.test(email.E_MAIL);
        if (!res) {
          break;
        }
      }

      if (!res) {
        this.translate.get('CheckEmail').subscribe(
          checkEmail => {
            let alert = this.alertCtrl.create({
              title: checkEmail,
              buttons: ['OK']
            });
            alert.present();
          });
        return false;
      }
      return true;

    } else {
      return true;
    }
  }

  checkPhone() {
    if (this.partner.ADTEL.length > 0) {

      let res = true;
      for (let phone of this.partner.ADTEL) {
        let regex = /^\+?\d{1,3}?[- .]?\(?(?:\d{0,3})\)?[- .]?\d\d\d[- .]?\d\d[- .]?\d\d$/g;
        res = regex.test(phone.TELEPHONE);

        if (!res) {
          break;
        }
      }

      if (!res) {
        this.translate.get('CheckPhone').subscribe(
          checkPhone => {
            let alert = this.alertCtrl.create({
              title: checkPhone,
              buttons: ['OK']
            });
            alert.present();
          });
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  checkFax() {
    if (this.partner.ADFAX.length > 0) {

      let res = true;
      for (let fax of this.partner.ADFAX) {
        let regex = /^\+?\d{1,3}?[- .]?\(?(?:\d{0,3})\)?[- .]?\d\d\d[- .]?\d\d[- .]?\d\d$/g;
        res = regex.test(fax.FAX);

        if (!res) {
          break;
        }
      }

      if (!res) {
        this.translate.get('CheckFax').subscribe(
          checkFax => {
            let alert = this.alertCtrl.create({
              title: checkFax,
              buttons: ['OK']
            });
            alert.present();
          });
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  /*checkWeb(){
   
  }*/

  // UPDATE USER
  flush() {
    //Errors of validate Form
    let errorsValidate: Array<string> = this.validateContact();
    if (this.checkEmail() && this.checkFax() && this.checkPhone()) {
      if (errorsValidate.length == 0) {
        this.utils.showLoading();

        //Marcamos que se va a enviar, si falla el envio: este atributo permanece, si se envia: este atributo desaparece
        this.partner.SENDING = true;

        //Create copy and fix the partner to push
        this.queueProvider.pushPartner(this.partner).then(() => {
          this.utils.hideLoading();
          this.ablePop = true;

          this.paramsPop = "doSync";
          this.ev.publish('eventSyncContact', this.paramsPop);

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
  }

  deletePartner() {
    this.translate.get('DeletePartner').subscribe(
      deletePartner => {
        this.translate.get('DeletePartnerAccepted').subscribe(
          deletePartnerAccepted => {
            this.translate.get('Cancel').subscribe(
              cancel => {
                this.translate.get('Agree').subscribe(
                  agree => {
                    let alert = this.alertCtrl.create({
                      title: deletePartner,
                      message: deletePartnerAccepted,
                      buttons: [
                        {
                          text: cancel,
                          role: 'cancel',
                          handler: () => {
                            console.log('Cancel clicked');
                          }
                        },
                        {
                          text: agree,
                          handler: () => {
                            console.log('Aceptar clicked');
                            //Recupero la copia del contacto por si se ha editado algo.
                            this.partner = JSON.parse(JSON.stringify(this.copyPartner));

                            // Marco la X en CENTRAL.CENTRALARCHIVINGFLAG para eliminar el contacto
                            this.partner.CENTRAL.CENTRALARCHIVINGFLAG = 'X';

                            this.queueProvider.pushDeletePartner(this.partner).then(() => {
                              this.ablePop = true;

                              this.paramsPop = "doSync";
                              this.ev.publish('eventSyncContact', this.paramsPop);

                              this.navCtrl.pop();
                            }, (error) => {
                              this.utils.showToast(error);
                            });

                          }
                        }
                      ]
                    });
                    alert.present();
                  });
              });
          });
      });
  }

  //Validates
  validateContact() {
    let errors: Array<string> = [];
    this.translate.get('checkRedFields').subscribe(
      checkRedFields => {
        this.translate.get('checkSpecies').subscribe(
          checkSpecies => {
            this.translate.get('CheckPostal').subscribe(
              checkPostal => {

                this.submitAttempt = true;

                //contactForm y select-search
                if (!this.isValidContactForm() || !this.partner.CLASSIFIC.CLASSIFIC
                  || !this.partner.DATA_ADDRESS.COUNTRY || !this.partner.CENTRAL_CUSTOMER_EXT.ZZZONA) {
                  errors.push(checkRedFields);
                }

                // if ((!this.partner.DATA_ADDRESS.POSTL_COD1 && this.partner.CLASSIFIC.CLASSIFIC != "10")
                //   || (this.partner.DATA_ADDRESS.POSTL_COD1 && this.partner.DATA_ADDRESS.POSTL_COD1.length < 5)) {
                //   errors.push(checkPostal);
                // }

                //Si tenemos notas
                if (this.partner.TEXT.length > 0) {

                  for (let note of this.partner.TEXT) {
                    if (note.STXH.TDID == "") {
                      this.translate.get('EmptyTextClass').subscribe(
                        EmptyTextClass => {
                          errors.push(EmptyTextClass);
                        });
                    }
                  }

                  for (let note of this.partner.TEXT) {
                    let emptyText = true;
                    for (let linea of note.LINES) {
                      if (linea.TDLINE != "") {
                        emptyText = false;
                      }
                    }

                    if (emptyText) {
                      this.translate.get('EmptyTextNote').subscribe(
                        EmptyTextNote => {
                          errors.push(EmptyTextNote);
                        });
                    }
                  }

                }

                //Notas del mismo tipo 
                let encontrado = false;
                for (let index = 0; index < this.partner.TEXT.length && !encontrado; index++) {
                  for (let copyIndex = 0; copyIndex < this.partner.TEXT.length && !encontrado; copyIndex++) {
                    if (index != copyIndex && this.partner.TEXT[index].STXH.TDID == this.partner.TEXT[copyIndex].STXH.TDID) {
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

                if (this.currentSpecies.length < 1)
                  errors.push(checkSpecies)
              });
          });
      });
    return errors;
  }

  // Valida los campos incluídos en contactForm 
  isValidContactForm() {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key).markAsTouched();
    });

    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("Error en el detectChanges");
    }
    return this.contactForm.valid;
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

  getEvento(codigo: string) {
    switch (codigo) {
      case "Z011":
        return "InstallationVisit";
      case "Z008":
        return "TaskRoute";
      case "Z006":
        return "CallPhone";
      case "Z002":
        return "Event";
      case "Z001":
        return "CommercialVisit";
      default:
        return "-";
    }
  }

  getLastActivity(index: number) {
    return this.activities[index].DESCRIPTION;
  }


  changeOptionSelected(optionSelectedVal, propertyToChange, currentItemToChange, title, key, label, options, index?, whereClause?, whereValues?) {
    let myCurrentCountry = this.currentCountry.LAND1;
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

              if (this.currentCountry.LAND1 != myCurrentCountry) {
                this.loaderProvider.pushLoadingProcess();
                this.currentRegion.BEZEI = "";
                this.currentRegion.BLAND = "";
                this.removeSelectedRegion();
                this.loadRegions().then(
                  () => this.loaderProvider.popLoadingProcess(),
                  msg => this.loaderProvider.popLoadingProcess()
                );
              }

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


            if (this.currentCountry.LAND1 != myCurrentCountry) {
              this.loaderProvider.pushLoadingProcess();
              this.currentRegion.BEZEI = "";
              this.currentRegion.BLAND = "";
              this.removeSelectedRegion();
              this.loadRegions().then(
                () => this.loaderProvider.popLoadingProcess(),
                msg => this.loaderProvider.popLoadingProcess()
              );
            }
          }
        });
        profileModal.present();
      }
    });



  }

  removeSelectedRegion() {
    this.currentRegion = { BEZEI: "", BLAND: "" };
    this.partner.DATA_ADDRESS.REGION = "";
  }

  getLanguageText(languageCode: any): string {
    for (let language of this.languages) {
      if (language.SPRSL == languageCode) return language.SPTXT;
    }

  }

  getCountryText(countryCode: any): string {
    for (let country of this.countries) {
      if (country.LAND1 == countryCode) return country.LANDX;
    }

  }

  getRegionText(regionCode: any): string {
    for (let region of this.regions) {
      if (region.BLAND == regionCode) return region.BEZEI;
    }

  }

  getZoneText(zoneCode: any): string {
    for (let zone of this.zones) {
      if (zone.DISTRICT == zoneCode) return zone.DESCRIPTION;
    }

  }

  getTitleTreatment(titleCode): string {
    for (let title of this.titleTreatment) {
      if (title.value == titleCode) return title.text;
    }
  }

  setTitleTreatment(titleCode) {
    for (let title of this.titleTreatment) {
      if (title.value == titleCode) {
        this.currentTitleTreatment.value = title.value;
        this.currentTitleTreatment.text = title.text;
        break;
      }
    }
  }

  setCurrentClientType(clientTypeCode) {
    for (let clientType of this.titles) {
      if (clientType.CLASSIFIC == clientTypeCode) {
        this.currentClientType.CLASSIFIC = clientType.CLASSIFIC;
        this.currentClientType.TEXT = clientType.TEXT;
        break;
      }
    }
  }

  setCurrentCountry(countryCode) {
    for (let country of this.countries) {
      if (country.LAND1 == countryCode) {
        this.currentCountry.LAND1 = country.LAND1;
        this.currentCountry.LANDX = country.LANDX;
        break;
      }
    }
  }

  setCurrentRegion(regionCode) {
    if (regionCode == null)
      return;
    for (let region of this.regions) {
      if (region.BLAND == regionCode) {
        this.currentRegion.BLAND = region.BLAND;
        this.currentRegion.BEZEI = region.BEZEI;
        break;
      }
    }
  }

  setCurrentLanguage(languageCode) {
    for (let language of this.languages) {
      if (language.SPRSL == languageCode) {
        this.currentLanguage.SPRSL = language.SPRSL;
        this.currentLanguage.SPTXT = language.SPTXT;
        break;
      }
    }
  }

  setCurrentZone(zoneCode) {
    for (let zone of this.zones) {
      if (zone.DISTRICT == zoneCode) {
        this.currentZone.DESCRIPTION = zone.DESCRIPTION;
        this.currentZone.DISTRICT = zone.DISTRICT;
        break;
      }
    }
  }

  setCurrentPotencial(potencialCode) {
    for (let potencial of this.potencials) {
      if (potencial.value == potencialCode) {
        this.currentPotencial.value = potencial.value;
        break;
      }
    }
  }

  setCurrentFunction(functionCode) {
    for (let myfunction of this.functions) {
      if (myfunction.PAFKT == functionCode) {
        this.currentFunction.BEZ30 = myfunction.BEZ30;
        this.currentFunction.PAFKT = myfunction.PAFKT;
        break;
      }
    }
  }

  setCurrentPermission(permissionCode) {
    for (let permission of this.permisos) {
      if (permission.value == permissionCode) {
        this.currentPermit.value = permission.value;
        this.currentPermit.text = permission.text;
        break;
      }
    }
  }

  getRelationshipCategory(relationshipCategoryCode): string {
    for (let relationType of this.reTypes) {
      if (relationType.RELTYP == relationshipCategoryCode) {
        return relationType.BEZ50;
      }
    }
  }

  setCurrentRelations(relations) {
    this.currentRelations = [];
    for (let relation of relations) {
      this.loadingRelations++;
      this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', relation.PARTNER2, '').then((partner) => {
        this.loadingRelations--;

        if (partner != null) {
          let myrelation = {
            NAME: partner.NAME,
            BEZ50: this.getRelationshipCategory(relation.RELATIONSHIPCATEGORY),
            PARTNER2: relation.PARTNER2,
            RELATIONSHIPCATEGORY: relation.RELATIONSHIPCATEGORY
          };
          this.currentRelations.push(myrelation);
        }
      });
    }
  }

  setCurrentSpecies() {
    for (let marketingHeader of this.marketingHeaders) {
      if (this.partner.CENTRAL_CUSTOMER_EXT[marketingHeader.CLASS_NUM] == 'X')
        this.currentSpecies.push(marketingHeader);
      else
        this.possibleSpecies.push(marketingHeader);
    }
  }

  addSpecie() {
    if (this.isBusy)
      return;
    this.isBusy = true;
    this.translate.get("SelectSpecie").toPromise().then(
      title => {
        this.possibleSpecies.sort((a, b) => {
          return a.CATCHWORD.localeCompare(b.CATCHWORD, "ca-ES");
        });
        let profileModal = this.modalCtrl.create(SelectSearchModal, {
          val: 'NoValue',
          options: this.possibleSpecies,
          label: 'CATCHWORD',
          key: 'CATCHWORD',
          allowEmpty: true,
          title: title
        }, {
            enableBackdropDismiss: false
          });

        profileModal.onWillDismiss(indexSelected => {
          if (indexSelected != null) {
            this.partner.CENTRAL_CUSTOMER_EXT[this.possibleSpecies[indexSelected].CLASS_NUM] = 'X'
            this.currentSpecies.push(this.possibleSpecies[indexSelected]);
            this.possibleSpecies.splice(indexSelected, 1);
          }
        });
        profileModal.present();
        this.isBusy = false;
      }
    );
  }

  removeAllDataFromSpecie(marketingHeader: MarketingHeader) {
    for (let marketingAttribute of this.marketingAttributes) {
      if (marketingAttribute.CLASS_NUM == marketingHeader.CLASS_NUM) {

        for (let animal of this.partner.MKT_ATTR) {
          if (animal.PROFILE_TEMPLATE_ID == marketingAttribute.CLASS_NUM) {
            for (let numero of animal.ALLOCVALUES) {
              if (numero.ATNAME == marketingAttribute.NAME_CHAR) {
                numero.ATVALUE = " UN";
              }
            }
          }
        }
      }
    }
  }

  deleteSpecie(marketingHeader: MarketingHeader) {

    this.translate.get("DeleteSpecieTitle").toPromise().then(deleteSpecieTitle => {
      this.translate.get("DeleteSpecieMessage").toPromise().then(deleteSpecieMessage => {
        this.translate.get("AffirmativeAnswer").toPromise().then(affirmativeAnswer => {
          this.translate.get("NegativeAnswer").toPromise().then(negativeAnswer => {
            this.alertProvider.presentDeleteSpecieMessage(deleteSpecieTitle, deleteSpecieMessage, affirmativeAnswer, negativeAnswer).then(
              result => {
                if (result) {
                  this.partner.CENTRAL_CUSTOMER_EXT[marketingHeader.CLASS_NUM] = '';
                  this.possibleSpecies.push(marketingHeader);
                  this.currentSpecies.splice(this.currentSpecies.indexOf(marketingHeader), 1);
                  this.possibleSpecies.sort((a, b) => {
                    return a.CATCHWORD.localeCompare(b.CATCHWORD, "ca-ES");
                  });
                }
              }
            )
          })
        })
      })
    });


  }

  deleteRelation(relacion) {
    this.deleteData(relacion, 'relation');
  }

}

export class LastActivity {
  OBJECT_ID: string;
  PROCESS_TYPE: string;
  STATE: string;
  DESCRIPTION: string;
  DATE_1: string;
  DATE_2: string;
  NAME_ORG1: string;
  NAME_ORG2: string;
  NAME_LAST: string;
  NAME_FIRST: string;
}
