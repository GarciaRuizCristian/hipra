import { Component, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { NavController, NavParams, Events, ModalController, AlertController, Content, ViewController, App } from 'ionic-angular';
import { FillNoteModal } from '../../components/fill-note-modal/fill-note-modal';
import { AppSettings } from '../../config/app-settings';
import { FormGroup } from '@angular/forms';
import { Partner } from '../../models/partner';
import { PartnerAbstract } from '../../models/partnerAbstract';
import { Product } from '../../models/product';
import { ProductAux } from '../../models/productAux';
import { SapcrmWebProvider } from '../../providers/sapcrm-web-provider';
import { QueueProvider } from '../../providers/queue-provider';
import { SapcrmCacheProvider } from '../../providers/sapcrm-cache-provider';
import { UtilsProvider } from '../../providers/utils-provider';
import { SelectMultipleModal } from '../../components/select-multiple-modal/select-multiple-modal';
import { Activity } from '../../models/activity';
import { Order } from '../../models/order';
import { Status } from '../../models/status';
import { TextActClasses } from '../../models/textActClasses';
import { OperationsClass } from '../../models/operations_class';
import { PaymentTerms } from '../../models/paymentTerms';
import { AngularSignaturePad } from '../../components/angular-signature-pad/angular-signature-pad';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { SelectSearchModal } from '../../components/select-search/select-search-modal';
import { SelectSearchModalWeb } from '../../components/select-search/select-search-modal-web';
import { pdfViewModal } from '../../components/pdf-view-modal/pdf-view-modal';
import { pdfAlertModal } from '../../components/pdf-alert-modal/pdf-alert-modal';
import { MarketingHeader } from '../../models/marketingHeader';
import { ContactPage } from '../contact/contact';
import { FillActivityNoteModal } from "../../components/fill-activity-note-modal/fill-activity-note-modal";
import { PartnersWebProvider } from "../../providers/partners-web-provider";
import { PriceList } from '../../models/priceList';
import { Country } from '../../models/country';
import { TimeZoneProvider } from "../../providers/timeZone-provider";
import { OrdersScrollWebProvider } from "../../providers/orders-scroll-web-provider";

import * as jsPDF from 'jspdf';

declare var window: any;

/*
  Generated class for the Order page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-order',
  templateUrl: 'order.html'
})
export class OrderPage {
  //////////////////////////////////////// ATRIBUTOS ////////////////////////////////////////
  @ViewChild(AngularSignaturePad) public signaturePad: AngularSignaturePad;
  @ViewChild(Content) content: Content;

  @HostListener('window:resize', ['$event'])
  onResize(event){
    console.log("ANCHO: " + event.target.innerWidth);
    if(event.target.innerWidth >= 768){ //ipad
      this.isIpad = true;
      this.cdRef.detectChanges();
    } else if(event.target.innerWidth <= 767){ //iphone
      this.isIpad = false;
      this.cdRef.detectChanges();
    }
  }

  isIpad = true;

  signaturePadOptions: Object = {
    'minWidth': 2,
    "canvasWidth": 300,
    "canvasHeight": 200
  };
  signatureImage: any[];

  signatureJsonString: string;

  loadingOrder = true; 
  loadingMakePDF = false;
  loadingEmployeeResponsibles = false;
  loadingOption = false;
  loadingDistributors = false;
  loadingRequestors = false;

  isDuplicateable = false;
  isDeleteable = false;
  isSaveable = false;

  isOrden: boolean = false;
  submitAttempt: boolean = false;
  operation: any;
  existOrder: boolean;

  order: Activity;
  copyOrder: any;
  ablePop: boolean = false;
  openingOtherPage = false;

  operations: Array<OperationsClass>;
  textAct: Array<TextActClasses>;
  allProducts: Array<ProductAux> = [];
  states: Array<Status>;
  paymentsTerms: Array<PaymentTerms>;
  currentPaymentTerm: PaymentTerms;
  defaultPaymentTerm: PaymentTerms;
  textClass: Array<TextActClasses>;
  marketingHeaders: Array<MarketingHeader>;
  pricesList: Array<PriceList>;
  countries: Array<Country>;
 
  userLoged: Partner;

  paramsPop: string;  
  
  generalOpened: boolean = true;
  sellToPartyOpened: boolean = true;
  shipToPartyOpened: boolean = true;
  distributorOpened: boolean = true;
  employeeResponsibleOpened: boolean = true;
  productsOpened: boolean = true;
  signatureOpened: boolean = true;
  notesOpened: boolean = true;

  showAddressee: boolean = false;

  priceTotalProducts: number = 0;
  requestor: any = {};
  requestorFull: any = {};
  distributor: any = {};
  addressee: any = {};
  addresseeFull: any = {};
  employeeResponsible: Array<any> = [];
  addresseesFromRequestor: Array<any> = [];
  productsFiltered: Array<any> = [];
  minimumProductPrices: Array<any> = [];
  allNotes: Array<any> = [];
  allNotesToDelete: Array<any> = [];

  pdf: jsPDF;
  //////////////////////////////////////// ATRIBUTOS ////////////////////////////////////////




  //////////////////////////////////////// CONSTRUCTOR ////////////////////////////////////////
  constructor(public navCtrl: NavController,
              private utils: UtilsProvider,
              public sapcrmWebProvider: SapcrmWebProvider,
              public sapcrmCacheProvider: SapcrmCacheProvider, 
              public navParams: NavParams,
              public modalCtrl: ModalController, 
              public queueProvider: QueueProvider,
              public cdRef: ChangeDetectorRef, 
              public alertCtrl: AlertController, 
              private ev: Events,
              public appCtrl: App,
              private translate: TranslateService,
              private partnersWebProvider: PartnersWebProvider,
              private timeZoneProvider: TimeZoneProvider,
              private ordersScrollWebProvider: OrdersScrollWebProvider) {

    this.ev.subscribe('previewPDF', (checks) => {
      this.openingOtherPage = true; //Pasamos a otra pagina
      this.createPDF(checks).then((pdf)=>{
          this.pdf = pdf;
          this.previewPDF();
      });        
    });

    this.ev.subscribe('sendPDF', () => {                 
                         
    });

    this.ev.subscribe('downloadPDF', (checks) => { 
      let currentOrdersDate;     
      for(let fecha of this.order.DATE){
          if(fecha.APPT_TYPE == 'ORDERACTUAL') currentOrdersDate = fecha;
      }

      this.translate.get('Date').subscribe(date => {
        let fileName = 'Cod. ' + this.order.HEADER.OBJECT_ID + " " + date + ". " + currentOrdersDate.DATE_FROM + '-' + currentOrdersDate.TIME_FROM;
        this.pdf.save(fileName+'.pdf');
      });
    });

    this.operation = new Object();
    this.existOrder = false;
    this.order = this.utils.fixActivity({});
    this.myNameOperation();

    let full_order = navParams.get('full');
    if (full_order) {
      this.isDuplicateable = false;
      this.isDeleteable = false;
      this.isSaveable = true;
      this.userLoged = this.ordersScrollWebProvider.getUserLogged();
      this.inicializeOrder(full_order);
    } else if (navParams.get('guid')) {
      this.isDuplicateable = true;
      this.isDeleteable = true;
      this.isSaveable = true;
      this.userLoged = this.ordersScrollWebProvider.getUserLogged();
      this.sapcrmWebProvider.syncOptimizedOrder(navParams.get('guid')).then(
        (res: Order) => {
          this.inicializeOrder(res);
        },
        (error) => {
          this.utils.showToast(error);
        });
    } else if (navParams.get('operacion')) {// es nuevo
      this.isDuplicateable = true;
      this.isDeleteable = false;
      this.isSaveable = true;

      this.order.HEADER.OBJECT_ID = this.utils.generateGuid();
      this.order.HEADER.PROCESS_TYPE = navParams.get('operacion');

      if (this.order.HEADER.PROCESS_TYPE == "Z014") {
        this.isOrden = true;
      }

      this.order.DATE[0].APPT_TYPE = "ORDERACTUAL"; // TODO
      this.order.STATUS_TAB[0].USER_STAT_PROC = "CRMORDER";
      this.order.STATUS_TAB[0].STATUS = "E0002";
      this.timeZoneProvider.defaultDate(this.order);
      this.userLoged = this.ordersScrollWebProvider.getUserLogged();
      this.loadCacheData().then(() => {
        this.loadUserLogedHowEmployeeResponsible().then(() => { //Se aniade por defecto al propio usuario como empleado responsable
          this.loadingOrder = false;

          try {
            this.cdRef.detectChanges();
          } catch (err) {
            console.log("error en el detectChanges");
          }
        });
      });
    }
  }
  //////////////////////////////////////// CONSTRUCTOR ////////////////////////////////////////



  //////////////////////////////////////// METODOS ////////////////////////////////////////
  inicializeOrder(orden: Order) {
    this.order = this.utils.fixActivity(orden);
    this.printOrder(true);
    this.existOrder = true;
    if (this.order.HEADER.PROCESS_TYPE == "Z014") {
      this.isOrden = true;
    }
    this.fixPartners();
    this.fixProducts();
    this.fixNotes();
    this.fixSignature();
    // this.timeZoneProvider.adjustTimeZone(this.order, false);
    this.copyOrder = JSON.parse(JSON.stringify(this.order));
    this.loadCacheData().then(() => {
      this.createPartnerTypeArray().then(() =>{
        this.loadingOrder = false;

        try {
          this.cdRef.detectChanges();
        } catch (err) {
          console.log("error en el detectChanges");
        }
      });
     
    });
  }

  myNameOperation() {
    this.loadOperationsClasses().then(() => {
      for (let op of this.operations) {
        this.operation[op.PROCESS_TYPE] = op.P_DESCRIPTION;
      }
    });
  }

  fixOrderToSAP() {
    this.fixDateToSAP(); //Arreglamos las Fechas para que SAP las recoja bien
    this.fixHeaderToSAP(); //Arreglamos la Cabecera para que SAP la recoja bien
    this.fixStatusTabToSAP(); //Arreglamos el Estado para que SAP lo recoja bien
    this.fixPartnersToSAP(); //Arreglamos los Partners para que SAP los recoja bien
    this.fixProductsToSAP(); //Arreglamos los Productos para que SAP los recoja bien
    this.fixSignatureAndNotesToSAP(); //Arreglamos la Firma y las Notas para que SAP las recoja bien
    this.printOrder(false);
  }

  fixDateToSAP() {
    let copiaOrderDates = [];

    for (let date of this.order.DATE) {
      if (date.APPT_TYPE == 'ORDERACTUAL') {
        if (!this.existOrder) {
          copiaOrderDates.push({
            APPT_TYPE: date.APPT_TYPE,
            DATE_FROM: date.DATE_FROM,
            DATE_TO: date.DATE_TO,
            TIME_FROM: date.TIME_FROM,
            TIME_TO: date.TIME_TO,
            TIMEZONE_FROM: "UTC",
            TIMEZONE_TO: "UTC"
          });
        } else {
          copiaOrderDates.push({
            APPT_TYPE: date.APPT_TYPE,
            DATE_FROM: date.DATE_FROM,
            DATE_TO: date.DATE_TO,
            TIME_FROM: date.TIME_FROM,
            TIME_TO: date.TIME_TO,
            TIMEZONE_FROM: date.TIMEZONE_FROM,
            TIMEZONE_TO: date.TIMEZONE_TO
          });
        }
        

        console.log("ENVIAMOS A SAP --> FECHA FROM: " + date.DATE_FROM + " | TIEMPO FROM: " + date.TIME_FROM + " | ZONA HORARIA FROM: " + copiaOrderDates[0].TIMEZONE_FROM +
                    " FECHA TO: " + date.DATE_TO + " | TIEMPO TO: " + date.TIME_TO + " | ZONA HORARIA TO: " + copiaOrderDates[0].TIMEZONE_TO);
      }
    };
    this.order.DATE = copiaOrderDates;
  }

  fixHeaderToSAP() {
    let copiaOrderHeader = {
      GUID: this.order.HEADER.GUID,
      OBJECT_ID: this.order.HEADER.OBJECT_ID,
      PROCESS_TYPE: this.order.HEADER.PROCESS_TYPE,
      DESCRIPTION: this.order.HEADER.DESCRIPTION,
      CATEGORY: this.order.HEADER.CATEGORY,
      OBJECTIVE: this.order.HEADER.OBJECTIVE,
      PRIVATE_FLAG: this.order.HEADER.PRIVATE_FLAG,
      EXTERN_ACT_ID: (this.userLoged.DATA_ADDRESS.COUNTRY == 'BR') ? this.order.HEADER.EXTERN_ACT_ID : "",
      ACT_LOCATION: this.order.HEADER.ACT_LOCATION
    };

    this.order.HEADER = copiaOrderHeader;
  }

  fixStatusTabToSAP() {
    let copiaOrderStatusTab = [];

    for (let status of this.order.STATUS_TAB) {
      copiaOrderStatusTab.push({
        STATUS: status.STATUS
      });
    };
    this.order.STATUS_TAB = copiaOrderStatusTab;
  }

  fixPartners() {
    for (let partner of this.order.PARTNERS) {
      partner.PARTNER_NO = ('0000' + partner.PARTNER_NO).slice(-10);
      partner.NAME = partner.FULLNAME;
    }
  }

  fixPartnersToSAP() {
    let copiaOrderPartners = [];

    for (let partner of this.order.PARTNERS) {
      copiaOrderPartners.push({
        PARTNER_FCT: partner.PARTNER_FCT, 
        PARTNER_NO: partner.PARTNER_NO,
        FULLNAME: partner.FULLNAME
      });
    };
    this.order.PARTNERS = copiaOrderPartners;
  }

  fixCopyProducts() {
    for (let product of this.order.MATERIAL_TAB) {
      this.allProducts.push({
        ORDERED_PROD: product.ORDERED_PROD,
        DESCRIPTION: product.DESCRIPTION,
        QUANTITY: product.QUANTITY,
        NET_PRICE: product.NET_PRICE,
        NET_VALUE: product.NET_VALUE,
        ITM_TYPE: product.ITM_TYPE,
        ERROR_MINIMUM_PRICE: false
      });
    }
  }

  fixProducts() {
    this.fixCopyProducts();

    for (let material of this.allProducts) {
      let productException = material.ORDERED_PROD.slice(0, 1);
      if (productException != "C" && productException != "K") {
        material.ORDERED_PROD = ('0000000000000' + material.ORDERED_PROD).slice(-18);
      }
      material.QUANTITY = String(Number(parseFloat(material.QUANTITY).toFixed(0)));
      material.NET_PRICE = String(Number(parseFloat(material.NET_PRICE).toFixed(2)));
      if (material.ITM_TYPE != 'ZBON') {
        material.NET_VALUE = parseFloat(material.NET_VALUE).toFixed(2);
      } else if (material.ITM_TYPE == 'ZBON') {
        material.NET_VALUE = "0";
      }
      this.calculatePriceTotalProducts(Number(material.NET_VALUE), true); //Suma el precio al total
    }
  }

  fixProductsToSAP() {
    let copiaOrderProducts = [];
    
    for (let product of this.allProducts) {
      copiaOrderProducts.push({
          ORDERED_PROD: product.ORDERED_PROD,
          DESCRIPTION: product.DESCRIPTION,
          ITM_TYPE: product.ITM_TYPE,
          QUANTITY: (isNaN(Number(product.QUANTITY)) || product.QUANTITY == "") ? "0.00" : parseFloat(product.QUANTITY).toFixed(0),
          NET_PRICE: (isNaN(Number(product.NET_PRICE)) || product.NET_PRICE == "") ? "0.00" : parseFloat(product.NET_PRICE).toFixed(2),
          NET_VALUE: parseFloat(product.NET_VALUE).toFixed(2)          
        });
    };
    this.order.MATERIAL_TAB = copiaOrderProducts;
  }

  getNotes() {
    let notes = [];

    for (let note of this.order.TEXT) {
      if (note.TDID != "Z005") notes.push(note);
    }

    return notes;
  }

  getSignature() {
    let signature = [];

    for (let signaturePart of this.order.TEXT) {
      if (signaturePart.TDID == "Z005") signature.push(signaturePart);
    }

    return signature;
  }

  addSignature(signature) {
    for (let signaturePart of signature) this.order.TEXT.push(signaturePart);
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
    let notes = this.getNotes();
    let signature = this.getSignature();
    this.order.TEXT = [];

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
    else if (typeNotes.T_0001.length == 1) this.order.TEXT.push(notes[typeNotes.T_0001[0]]);
    if (typeNotes.T_0002.length > 1) this.joinLongNotes(typeNotes.T_0002, notes);
    else if (typeNotes.T_0002.length == 1) this.order.TEXT.push(notes[typeNotes.T_0002[0]]);
    if (typeNotes.T_0003.length > 1) this.joinLongNotes(typeNotes.T_0003, notes);
    else if (typeNotes.T_0003.length == 1) this.order.TEXT.push(notes[typeNotes.T_0003[0]]);
    if (typeNotes.T_1000.length > 1) this.joinLongNotes(typeNotes.T_1000, notes);
    else if (typeNotes.T_1000.length == 1) this.order.TEXT.push(notes[typeNotes.T_1000[0]]);
    if (typeNotes.A002.length > 1) this.joinLongNotes(typeNotes.A002, notes); 
    else if (typeNotes.A002.length == 1) this.order.TEXT.push(notes[typeNotes.A002[0]]);
    if (typeNotes.A003.length > 1) this.joinLongNotes(typeNotes.A003, notes);
    else if (typeNotes.A003.length == 1) this.order.TEXT.push(notes[typeNotes.A003[0]]);
    if (typeNotes.A004.length > 1) this.joinLongNotes(typeNotes.A004, notes);
    else if (typeNotes.A004.length == 1) this.order.TEXT.push(notes[typeNotes.A004[0]]);
    if (typeNotes.A005.length > 1) this.joinLongNotes(typeNotes.A005, notes);
    else if (typeNotes.A005.length == 1) this.order.TEXT.push(notes[typeNotes.A005[0]]);
    if (typeNotes.A007.length > 1) this.joinLongNotes(typeNotes.A007, notes);
    else if (typeNotes.A007.length == 1) this.order.TEXT.push(notes[typeNotes.A007[0]]);
    if (typeNotes.AC01.length > 1) this.joinLongNotes(typeNotes.AC01, notes);
    else if (typeNotes.AC01.length == 1) this.order.TEXT.push(notes[typeNotes.AC01[0]]);
    if (typeNotes.Z001.length > 1) this.joinLongNotes(typeNotes.Z001, notes); 
    else if (typeNotes.Z001.length == 1) this.order.TEXT.push(notes[typeNotes.Z001[0]]);
    if (typeNotes.Z002.length > 1) this.joinLongNotes(typeNotes.Z002, notes);
    else if (typeNotes.Z002.length == 1) this.order.TEXT.push(notes[typeNotes.Z002[0]]);
    if (typeNotes.Z003.length > 1) this.joinLongNotes(typeNotes.Z003, notes);
    else if (typeNotes.Z003.length == 1) this.order.TEXT.push(notes[typeNotes.Z003[0]]);
    if (typeNotes.Z004.length > 1) this.joinLongNotes(typeNotes.Z004, notes);
    else if (typeNotes.Z004.length == 1) this.order.TEXT.push(notes[typeNotes.Z004[0]]);

    this.addSignature(signature);
  }

  joinLongNotes(typeNote, notes) {
    let note;

    typeNote.forEach((type, index) => {
      if (index == 0)
        note = notes[typeNote[index]];
      else if (index != 0)
        note.TDLINE = note.TDLINE + notes[typeNote[index]].TDLINE
    });

    this.order.TEXT.push(note);
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
      for (let note of this.order.TEXT) {
        if (noteDelete.TDID == note.TDID) exist = true;
      }

      if (!exist) this.order.TEXT.push(noteDelete);
    }
  }

  separateLongNote(note) {
    let descripcionNota = note.TDLINE;

    if (descripcionNota.length > 132) {
      note.TDLINE = descripcionNota.substring(0, 132);
      this.order.TEXT.push(JSON.parse(JSON.stringify(note)));
      note.TDLINE = descripcionNota.substring(132, descripcionNota.length);
      this.separateLongNote(note);
    } else {
      this.order.TEXT.push(note);
    }
  }

  separateLongNotes() {
    let notes = this.getNotes();
    let signature = this.getSignature();
    this.order.TEXT = [];

    for (let note of notes) {
      this.separateLongNote(note);
    }

    this.addSignature(signature);
  }

  //Pintamos la firma que nos llega del servidor
  fixSignature() {
    let stringFirma = "";
    for (let firma of this.order.TEXT) {
      if (firma.TDID == "Z005" && firma.TDLINE != "[]") {
        stringFirma = stringFirma + firma.TDLINE;
      }
    }

    if (stringFirma != "[]" && stringFirma != "") {
      let jsonFirma = JSON.parse(stringFirma);
      let jsonCopy = jsonFirma.slice();
      let chekedFirma = [];
      let data = [];

      //Comprobamos si levanto el dedo al hacer la firma y añadimos nuevo array de puntos
      for (let point = 0, index = 0; point < jsonFirma.length - 1; point++) {
        if (jsonFirma[point].lx != jsonFirma[point + 1].mx && jsonFirma[point].ly != jsonFirma[point + 1].my) {
          chekedFirma.push(jsonCopy.slice(index, point + 1));
          index = point + 1;
        }
        if (point == jsonFirma.length - 2) {
          chekedFirma.push(jsonCopy.slice(index, point + 1))
        }
      }

      //Adaptamos el array de puntos para que lo lea el servidor
      for (let arrayIndex = 0; arrayIndex < chekedFirma.length; arrayIndex++) {
        data.push([]);
        for (let point of chekedFirma[arrayIndex]) {
          data[arrayIndex].push({
            'time': AppSettings.SIGNATURE_TIME_TRACE,
            'x': point.mx,
            'y': point.my
          });
          //para pintar el ultimo punto
          if (jsonFirma.lastIndexOf(point) == (jsonFirma.length - 1)) {
            data[arrayIndex].push({
              'time': AppSettings.SIGNATURE_TIME_TRACE,
              'x': point.lx,
              'y': point.ly
            });
          }
        }
      }

      //Si algun dato vacio se ha almacenado, se elimina
      for (let dato of data) {
        if (dato.length <= 0) {
          let index = data.indexOf(dato);
          (index >= 0) ? data.splice(index, 1) : false;
        }
      }

      this.signaturePad.fromData(data);
    }
  }

  fixSignatureAndNotesToSAP() {
    let copiaOrderSignatureAndNotes = [];
    this.addNotesToDeleteToSAP(); //Aniadimos las notas que queremos eliminar en SAP
    this.separateLongNotes(); //Separamos una nota en varias si la descripcion supera los 132 caracteres
    
    for (let signatureOrNotes of this.order.TEXT) {
      copiaOrderSignatureAndNotes.push({
          TDID: signatureOrNotes.TDID,
          TDLINE: signatureOrNotes.TDLINE,
          REF_KIND: signatureOrNotes.REF_KIND,
          MODE: signatureOrNotes.MODE ? signatureOrNotes.MODE : signatureOrNotes.REF_KIND,
          TDFORMAT: signatureOrNotes.TDFORMAT,
          TDSPRAS: signatureOrNotes.TDSPRAS
        });
    };
    this.order.TEXT = copiaOrderSignatureAndNotes;
  }


  loadCacheData() {
    return Promise.all([
      this.loadCountries(),
      this.loadStatus(),
      this.loadTextActivities(),
      this.loadPaymentTerms(),
      this.loadTextClass(),
      this.loadMarketingHeaders(),
      this.loadPriceList()
    ]);
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

  loadOperationsClasses() {
    return this.sapcrmCacheProvider.getOperationClasses().then(
      (res: OperationsClass[]) => {
        this.operations = res;
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
          if (status.PROCESS_TYPE == this.order.HEADER.PROCESS_TYPE) {
            this.states.push(status);
          }
        }
        this.states.sort(function (a, b) {
          if (a.TXT30 != undefined) {
            return a.TXT30.localeCompare(b.TXT30,"ca-ES");
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
          if (text.PROCESS_TYPE == this.order.HEADER.PROCESS_TYPE && text.TDID != "Z005") {
            this.textAct.push(text);
          }
        }
        this.textAct.sort(function (a, b) {
          if (a.TDTEXT != undefined) {
            return a.TDTEXT.localeCompare(b.TDTEXT,"ca-ES");
          }
        });
        for(let note of this.order.TEXT){          
          if (note.TDID != "Z005") this.allNotes.push(note);
        }    
      },
      (error) => {
        console.log(error);
      });
  }

  loadPaymentTerms() {
    return this.sapcrmCacheProvider.getPaymentTerms().then(
      (res: PaymentTerms[]) => {
        this.paymentsTerms = res;
        this.paymentsTerms.sort(function (a, b) {
          if (a.DESCRIPTION != undefined) {
            return a.DESCRIPTION.localeCompare(b.DESCRIPTION,"ca-ES");
          }
        });

        for(let paymentTerm of this.paymentsTerms){
          if(paymentTerm.PAYMENT_TERMS == this.order.HEADER.EXTERN_ACT_ID){
              this.currentPaymentTerm = paymentTerm;
              break;
          }
        }
      },
      (error) => {
        console.log(error);
      });
  }

  loadTextClass() {
    return this.sapcrmCacheProvider.getTextActClasses().then(
      (notesAct: TextActClasses[]) => {
        let notesTypeOrder = [];
        
        for (let noteAct of notesAct)
          if (noteAct.TDID != 'Z005' && noteAct.PROCESS_TYPE == this.order.HEADER.PROCESS_TYPE) notesTypeOrder.push(noteAct);
        
        notesTypeOrder.sort((a,b)=>{
          return a.TDTEXT.localeCompare(b.TDTEXT,"ca-ES");
        })

        this.textClass = notesTypeOrder;
      },
      (error) => {
        console.log(error);
      });
  }

  loadMarketingHeaders() {
    return this.sapcrmCacheProvider.getMarketingHeaders().then(
      (res: MarketingHeader[]) => {
        this.marketingHeaders = res;
      },
      (error) => {
        console.log(error);
      });
  }

  loadPriceList() {
    return this.sapcrmCacheProvider.getPriceList().then(
      (res: PriceList[]) => {
        this.pricesList = res;
      },
      (error) => {
        console.log(error);
      });
  }

  loadUserLogedHowEmployeeResponsible() {
    this.createNewPartner({PARTNER: this.userLoged.PARTNER, NAME: this.userLoged.CENTRAL_ORGAN.NAME1},"00000014").then((inChargeOf)=>{
      this.employeeResponsible.push(inChargeOf);
      this.order.PARTNERS.splice(this.order.PARTNERS.length, 0, inChargeOf);
    });

    return new Promise<any>((resolve) => resolve());
  }

  checkDates() {
    // this.timeZoneProvider.adjustTimeZone(this.order, true);

    if (!this.existOrder) {
      this.timeZoneProvider.adjustTimeZone(this.order, true);
    }

    for (let dateActivity of this.order.DATE) {
      if (dateActivity.APPT_TYPE == 'ORDERACTUAL') {
        dateActivity.DATE_TO = dateActivity.DATE_FROM;
        dateActivity.TIME_TO = dateActivity.TIME_FROM;
      }
    }
  }

  createPartnerTypeArray(): Promise<void>{
    for(let partner of this.order.PARTNERS){
      switch(partner.PARTNER_FCT){
        case "00000001": this.requestor = partner; console.log("Nuevo solicitante: " + partner.FULLNAME + " | " + partner.PARTNER_NO); 
          //Cargamos los destinatarios que tienen relacion "tiene destinatario de mercancia" con el solicitante
          this.sapcrmWebProvider.syncOptimizedPartner('', partner.PARTNER_NO, '').then((contacto)=>{
            if(contacto != undefined) {
              this.requestorFull = contacto; //Almacenamos nuestro contacto FULL
              //Cargamos el termino de pago que tenga asociado el solicitante
              this.checkPaymentTerm(contacto.SALES.PAYMENT_TERMS);
              //Cargamos los destinatarios que tienen relacion "tiene destinatario de mercancia" con el solicitante
              this.getAddresseesFromRequestor(contacto).then((addressee) =>{
                this.addresseesFromRequestor = addressee;
                this.checkIfShowAddressee(); //Comprobamos si se puede mostrar el campo "destinatario"
              });
              //Cargamos los productos asociados al solicitante
              this.filterProducts(contacto);
              for (let product of this.allProducts) {
                //Comprobamos si el solicitante tiene un precio predeterminado para ese producto
                this.checkPriceProductFromRequestor(product);
              }
            }
          }); 
          break;
        case "00000035": this.distributor = partner; console.log("Nuevo distribuidor: " + partner.FULLNAME + " | " + partner.PARTNER_NO); break;
        case "00000002": this.addressee = partner; console.log("Nuevo destinatario: " + partner.FULLNAME + " | " + partner.PARTNER_NO); 
          this.loadingMakePDF = true;
          this.sapcrmWebProvider.syncOptimizedPartner('', partner.PARTNER_NO, '').then((contacto)=>{
            if(contacto != undefined)
              this.addresseeFull = contacto; //Almacenamos nuestro contacto FULL
            else
              this.addresseeFull = {};

            this.loadingMakePDF = false;
          });
          break;
        case "00000014": this.employeeResponsible.push(partner); console.log("Responsable " + this.employeeResponsible.length +  ": " + partner.FULLNAME + " | " + partner.PARTNER_NO); break;
      }
    }

    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }

    return new Promise<void>((resolve) => resolve());
  }

  duplicateOrder() {
    this.existOrder = false;
    let copyEmpty: Activity;
    copyEmpty = this.utils.fixActivity({})
    copyEmpty.HEADER.OBJECT_ID = this.utils.generateGuid();

    //arreglamos header
    copyEmpty.HEADER.PROCESS_TYPE = this.order.HEADER.PROCESS_TYPE;

    //arreglamos partners
    for (let partner of this.order.PARTNERS) {
      copyEmpty.PARTNERS.push({
        PARTNER_FCT: partner.PARTNER_FCT,
        PARTNER_NO: partner.PARTNER_NO,
      });
    }

    //arreglamos status
    copyEmpty.STATUS_TAB = [];
    copyEmpty.STATUS_TAB.push({
      REF_GUID: "",
      REF_HANDLE: "0000000000",
      REF_KIND: "",
      STATUS: "E0002",
      USER_STAT_PROC: 'CRMORDER',
      ACTIVATE: "",
      PROCESS: ""
    });

    //arreglamos date
    copyEmpty.DATE.push({
      REF_HANDLE: "0000000000",
      APPT_TYPE: 'ORDERACTUAL',
      TIMEZONE_FROM: "",
      TIMEZONE_TO: "",
      DATE_FROM: "",
      DATE_TO: "",
      TIME_FROM: "",
      TIME_TO: "",
    });
    this.timeZoneProvider.defaultDate(copyEmpty);

    //arreglamos firma
    for (let parteFirma of this.order.TEXT) {
      if (parteFirma.TDID == "Z005") {
        copyEmpty.TEXT.push(parteFirma);
      }
    }
    //eliminamos las notas
    this.allNotes = [];

    //arreglamos material_tab
    for (let producto of this.allProducts) {
      copyEmpty.MATERIAL_TAB.push({
        ORDERED_PROD: producto.ORDERED_PROD,
        DESCRIPTION: producto.DESCRIPTION,
        QUANTITY: producto.QUANTITY,
        NET_PRICE: producto.NET_PRICE,
        NET_VALUE: producto.NET_VALUE,
        ITM_TYPE: producto.ITM_TYPE,
      });
    }
    this.order = copyEmpty;
    this.fixSignature();//Meter firma
  }

  delete() {
    this.translate.get('DeleteOrder').subscribe(
      deleteOrder => {
        this.translate.get('DeletePermanent').subscribe(
          deletePermanent => {
            this.translate.get('Cancel').subscribe(
              cancel => {
                this.translate.get('Agree').subscribe(
                  agree => {

                    let confirm = this.alertCtrl.create({
                      title: deleteOrder,
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
                            this.fixOrderToSAP(); //Arreglamos la Orden para que SAP la recoja bien
                            this.queueProvider.pushDeleteActivity(this.order, true).then((data) => {
                              this.utils.hideLoading();
                              this.ablePop = true;

                              this.paramsPop = "doSync";
                              this.ev.publish('eventSyncOrder', this.paramsPop);
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

  flush() {
    //(Si no hay destinatario y no se muestra el campo) y (Si estamos en brasil o es una oportunidad, el solicitante y el destinatario es el mismo)
    if ((Object.keys(this.addressee).length == 0 && !this.showAddressee) && (this.userLoged.DATA_ADDRESS.COUNTRY == 'BR' || !this.isOrden)) {
      this.addressee.PARTNER_NO = this.requestor.PARTNER_NO;
      this.addressee.FULLNAME = this.requestor.FULLNAME;
      this.addressee.PARTNER_FCT = '00000002';
      this.order.PARTNERS.splice(this.order.PARTNERS.length, 0, this.addressee);
    }

    let errorsValidate = this.validateOrder();

    if (errorsValidate.length == 0) {

      this.alertRequestorNotBillingCustomer().then((res) => {
        if(res) {
          //Fix the dates before push
          this.checkDates();       
          
          let index;
          for (let firma of this.order.TEXT) {
            if (firma.TDID == "Z005") {
              if (firma.TDLINE == "[]" || firma.TDLINE == "") {
                index = this.order.TEXT.indexOf(firma);
              }
            }
          }
          if (index > -1) {
            this.order.TEXT.splice(index, 1);
          }

          let prevSignature = false;
          for (let firma of this.order.TEXT) {
            if (firma.TDID == "Z005") {
              if (firma.TDLINE != "[]" && firma.TDLINE != "") {
                prevSignature = true;
              }
            }
          }

          if(!prevSignature) {
            let copyNote = this.order.TEXT.slice();
            let index;
            for (let firma of this.order.TEXT) {
              if (firma.TDID == "Z005") {
                index = copyNote.indexOf(firma);
                if (index > -1) {
                  copyNote.splice(index, 1);
                }
              }
            }
            this.order.TEXT = copyNote;
          }   

          this.drawComplete();//Guardamos la firma

          this.utils.showLoading();

          this.fixOrderToSAP(); //Arreglamos la Orden para que SAP la recoja bien
          
          (this.existOrder ? this.queueProvider.pushChangeActivity : this.queueProvider.pushCreateActivity)(this.order, true).then(() => {
            this.utils.hideLoading();
            this.ablePop = true;

            this.paramsPop = "doSync";
            this.ev.publish('eventSyncOrder', this.paramsPop);
            this.navCtrl.pop();
          }, (error) => {
            this.utils.showToast(error);
            this.utils.hideLoading();
          });
        }
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

  //Validates
  validateOrder(): Array<string> {
    let errors: Array<string> = [];
    this.submitAttempt = true;

    //Al menos un solicitante, un destinatario y un empleado responsable
    let findSellToParty: boolean = false; //Solicitante
    let findShipToParty: boolean = false; //Destinatario
    let findEmployeeResponsible: boolean = false; //Empleado responsable
    for (let partner of this.order.PARTNERS) {
      if (!findSellToParty && partner.PARTNER_FCT == '00000001') findSellToParty = true;
      if (!findShipToParty && partner.PARTNER_FCT == '00000002') findShipToParty = true;
      if (!findEmployeeResponsible && partner.PARTNER_FCT == '00000014') findEmployeeResponsible = true;
    }
    if (!findSellToParty) {
      this.translate.get('SellToPartyNeed').subscribe(
        sellToPartyNeed => {
          errors.push(sellToPartyNeed);
        });
    }
    if (!findShipToParty) {
    this.translate.get('ShipToPartyNeed').subscribe(
      shipToPartyNeed => {
        errors.push(shipToPartyNeed);
      });
    }
    if (!findEmployeeResponsible) {
    this.translate.get('EmployeeResponsibleNeed').subscribe(
      employeeResponsibleNeed => {
        errors.push(employeeResponsibleNeed);
      });
    }

    //Si tenemos notas
    let oneEmpty = false;
    if (this.order.TEXT.length > 0) {
      for (let note of this.order.TEXT) {
        if (note.TDID != "Z005") {
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
    }

    //Notas del mismo tipo 
    let encontrado = false;
    for (let index = 0; index < this.order.TEXT.length && !encontrado; index++) {
      if (this.order.TEXT[index].TDID != 'Z005') {
        for (let copyIndex = 0; copyIndex < this.order.TEXT.length && !encontrado; copyIndex++) {
          if (this.order.TEXT[copyIndex].TDID != 'Z005') {
            if (index != copyIndex && this.order.TEXT[index].TDID == this.order.TEXT[copyIndex].TDID) {
              encontrado = true
            }
          }
        }
      }
    }
    if (encontrado) {
      this.translate.get('DuplicateTypeNote').subscribe(
        DuplicateTypeNote => {
          errors.push(DuplicateTypeNote);
        });
    }

    //Al menos un producto con UN > 0
    let find = false;
    for (let product of this.allProducts) {
      if (Number(product.QUANTITY) > 0) {
        find = true;
        break;
      }
    }
    if (!find) {

      this.translate.get('PositiveUnitsNeed').subscribe(
        positiveUnitsNeed => {
          errors.push(positiveUnitsNeed);
        });
    }

    //Si el usuario es de Brasil, debe seleccionar un termino de pago
    if (this.userLoged.DATA_ADDRESS.COUNTRY == 'BR') {
      this.translate.get('PaymentTermNeed').subscribe(
        paymentTermNeed => {
          if (this.order.HEADER.EXTERN_ACT_ID == "") errors.push(paymentTermNeed);
        });
    }

    //Si existe algun producto que tenga un precio minimo, se comprueba que el precio marcado es superior a este
    if (this.minimumProductPrices.length > 0) {
      this.translate.get('MinimumProductPricesNeed').subscribe(
        minimumProductPricesNeed => {
          this.deleteMinimumProductPrices();
          if (this.checkMinimumProductPrices()) errors.push(minimumProductPricesNeed);
        });
    }

    return errors;
  }

  //Alert para preguntar al usuario que no sea cliente de facturacion ( !(grupo YX, YY o YZ) ), 
  //si quiere continuar con el guardado ya que la orden puede que no sea procesada de forma correcta
  alertRequestorNotBillingCustomer(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!(this.requestorFull.GROUP == 'YX' || this.requestorFull.GROUP == 'YY' || this.requestorFull.GROUP == 'YZ')) {
      this.translate.get('RequestorNotBillingCustomer').subscribe(
        requestorNotBillingCustomer => {
          this.translate.get('RequestorNotBillingCustomerInfo').subscribe(
            requestorNotBillingCustomerInfo => {
              this.translate.get('Continue').subscribe(
                continuar => {
                  this.translate.get('Cancel').subscribe(
                    cancelar => {
                      let confirm = this.alertCtrl.create({
                        title: requestorNotBillingCustomer,
                        message: requestorNotBillingCustomerInfo,
                        buttons: [
                          {
                            text: continuar,
                            handler: () => {
                              console.log('Continue clicked');
                              this.alertChangeStatus().then((res) => {
                                if(res)
                                  confirm.dismiss().then(() => { resolve(true); });
                                else
                                  confirm.dismiss().then(() => { resolve(false); });
                              });
                            }
                          },
                          {
                            text: cancelar,
                            handler: () => {
                              console.log('Canceled clicked');
                              confirm.dismiss().then(() => { resolve(false); });
                            }
                          }
                        ]
                      });
                      confirm.present();
                    });
                });
            });
        });
      } else {
        this.alertChangeStatus().then((res) => {
          if (res)
            resolve(true);
          else
            resolve(false);
        });
      }
    });
  }

  //Alert para preguntar al usuario si desea cambiar la order a estado 'En Tratamiento'
  alertChangeStatus(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.translate.get('ChangeStatusToInProcess').subscribe(
        changeStatus => {
          this.translate.get('ChangeStatusToInProcessPermanent').subscribe(
            changeStatusPermanent => {
              this.translate.get('Save').subscribe(
                save => {
                  this.translate.get('SaveAndSend').subscribe(
                    saveAndSend => {
                      let confirm = this.alertCtrl.create({
                        title: changeStatus,
                        message: changeStatusPermanent,
                        buttons: [
                          {
                            text: save,
                            handler: () => {
                              console.log('Saved clicked');
                              confirm.dismiss().then(() => { resolve(true); });
                            }
                          },
                          {
                            text: saveAndSend,
                            handler: () => {
                              console.log('Saved and Sended clicked');
                              this.order.STATUS_TAB['0'].STATUS = "E0003"; //Cambiamos la orden a 'En Tratamiento'
                              confirm.dismiss().then(() => { resolve(true); });
                            }
                          }
                        ]
                      });
                      confirm.present();
                    });
                });
            });
        });
    });
  }

  createPDF(checks): Promise<jsPDF>{
    var doc = new jsPDF();
    let logoBlue = "data:image/png;base64,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";
    doc.addImage(logoBlue,'PNG', 25, 25, 30, 30);     	
    doc.setFontSize(22);
    doc.setTextColor(13,45,132);
    this.translate.get('Code').subscribe(code => {
      doc.text(80, 55, code + ": "+ this.order.HEADER.OBJECT_ID );
    });
    var marginOrder = 0;
    var marginPartner = 0;
    var marginFinal = 0;
    var marginSolicitante = 0;
    let y = 55;
    doc.setTextColor(13,45,132);	

    if (checks.checkDatos) {
      doc.setFontSize(10);
      doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('Operation').subscribe(operation => {
        doc.text(30, 65, operation);
      });
      doc.setFontSize(10);
      doc.setTextColor(0,0,0);
      doc.setFontType('normal');
      doc.text(30, 70, this.operation[this.order.HEADER.PROCESS_TYPE]);
    
      let currentOrdersDate;
      for(let fecha of this.order.DATE){
          if(fecha.APPT_TYPE == 'ORDERACTUAL') currentOrdersDate = fecha;
      }

      doc.setFontSize(10);
      doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('Date').subscribe(date => {
        doc.text(110, 65, date);
      });
      doc.setFontSize(10);
      doc.setTextColor(0,0,0);
      doc.setFontType('normal');
      doc.text(110, 70, currentOrdersDate.DATE_FROM);
      doc.setFontSize(10);
      doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('Time').subscribe(time => {
        doc.text(140, 65, time);
      });
      doc.setFontSize(10);
      doc.setTextColor(0,0,0);
      doc.setFontType('normal');
      doc.text(140, 70, currentOrdersDate.TIME_FROM);
      doc.setFontSize(10);
      doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('Status').subscribe(status => {
        doc.text(30, 65+15, status);
      });
      doc.setFontSize(10);
      doc.setTextColor(0,0,0);
      doc.setFontType('normal');
      doc.text(30, 70+15, this.getStatusTxt30(this.order.STATUS_TAB[0].STATUS));
    
      if (this.currentPaymentTerm && this.currentPaymentTerm.DESCRIPTION != "" && this.userLoged.DATA_ADDRESS.COUNTRY == 'BR') {
        doc.setFontSize(10);
        doc.setTextColor(13,45,132);
        doc.setFontType('bold');
        this.translate.get('PaymentsTerms').subscribe(paymentsTerms => {
          doc.text(110, 65+15, paymentsTerms);
        });
        doc.setFontSize(10);
        doc.setTextColor(0,0,0);
        doc.setFontType('normal');
        doc.text(110, 70+15, this.currentPaymentTerm.DESCRIPTION);
      }
      marginOrder = 30;
    }
    marginPartner = marginOrder;
		
		if (checks.checkDestinatario && Object.keys(this.addressee).length > 0) {		
			doc.setFontSize(10);
			doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('Ship').subscribe(ship => {
        doc.text(30, 65+marginOrder, ship);
      });
			doc.setFontSize(10);
			doc.setTextColor(0,0,0);
			doc.setFontType('normal');
      doc.text(30, 70+marginOrder, this.addressee.FULLNAME);
      
      if (Object.keys(this.addresseeFull).length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(13,45,132);
        doc.setFontType('bold');
        this.translate.get('Address').subscribe(address => {
          doc.text(110, 65+marginOrder, address);
        });
        doc.setFontSize(10);
        doc.setTextColor(0,0,0);
        doc.setFontType('normal');
        if (this.addresseeFull.DATA_ADDRESS.STR_SUPPL1) {
          doc.text(110, 70+marginPartner, this.addresseeFull.DATA_ADDRESS.STR_SUPPL1);
          marginPartner += 5;
        }
        if (this.addresseeFull.DATA_ADDRESS.POSTL_COD1) {
          doc.text(110, 70+marginPartner, this.addresseeFull.DATA_ADDRESS.POSTL_COD1);
          marginPartner += 5;
        }
        if (this.addresseeFull.DATA_ADDRESS.CITY && this.addresseeFull.DATA_ADDRESS.COUNTRY) {
          doc.text(110, 70+marginPartner, this.addresseeFull.DATA_ADDRESS.CITY + " - " + this.getCountryText(this.addresseeFull.DATA_ADDRESS.COUNTRY));
        } else if (this.addresseeFull.DATA_ADDRESS.CITY) {
          doc.text(110, 70+marginPartner, this.addresseeFull.DATA_ADDRESS.CITY);
        } else if (this.addresseeFull.DATA_ADDRESS.COUNTRY) {
          doc.text(110, 70+marginPartner, this.getCountryText(this.addresseeFull.DATA_ADDRESS.COUNTRY));
        }
      }
    }

    if ((checks.checkDestinatario && Object.keys(this.addressee).length > 0) && (checks.checkDistribuidor && Object.keys(this.distributor).length > 0)) {
      marginPartner +=  15;	
    }
    
    if (checks.checkDistribuidor && Object.keys(this.distributor).length > 0) {	
			doc.setFontSize(10);
			doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('Distributor').subscribe(distributor => {
        doc.text(30, 65+marginPartner, distributor);
      });
			doc.setFontSize(10);
			doc.setTextColor(0,0,0);
			doc.setFontType('normal');
			doc.text(30, 70+marginPartner, this.distributor.FULLNAME);					
    }
    
    if ((checks.checkDestinatario && Object.keys(this.addressee).length > 0) || (checks.checkDistribuidor && Object.keys(this.distributor).length > 0)) {
      marginPartner +=  15;	
    }
		marginFinal = marginPartner;
		
		if (checks.checkSolicitante && this.requestor!= undefined) {
			marginSolicitante = 80;
			marginFinal += 15;
		
			doc.setFontSize(10);
			doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('SellToParty').subscribe(sellToParty => {
        doc.text(30, 65+marginPartner, sellToParty);
      });
			doc.setFontSize(10);
			doc.setTextColor(0,0,0);
			doc.setFontType('normal');
			doc.text(30, 70+marginPartner, this.requestor.FULLNAME);
		}
        
		if (checks.checkResponsable && this.employeeResponsible.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('Responsibles').subscribe(responsibles => {
        doc.text(30+marginSolicitante, 65+marginPartner, responsibles);
      });
      
      let margenAlto=0;
      for(let employee of this.employeeResponsible) {
        doc.setFontSize(10);
        doc.setTextColor(0,0,0);
        doc.setFontType('normal');
        doc.text(30+marginSolicitante, 70+marginPartner+margenAlto, employee.FULLNAME);
        margenAlto += 5;
      }
      marginFinal += margenAlto - 5;
		}
						
		if (marginFinal > 0) {
			doc.setTextColor(13,45,132);
			doc.rect(25, 60, 160, marginFinal);
    }
    
		var marginMax = 272;
		var marginInicioTabla = 60+marginFinal+10;
      
    if (checks.checkProductos) {		
			marginFinal += 10;
						
			doc.setLineWidth(0.5);
			doc.line(25, 61+marginFinal, 185, 61+marginFinal);
			doc.setFontSize(10);
			doc.setTextColor(13,45,132);
			doc.setFontType('bold');
			
		  var marginProd = 30;
			var marginUds = 30 + 70;
			var marginPrecio = 30 + 70 + 20;
			var marginBon = 30 + 70 + 20 + 25;
			var marginTotal = 30 + 70 + 20 + 25 + 15;
      
      this.translate.get('Product').subscribe(product => {
        doc.text(marginProd, marginInicioTabla, product.toUpperCase() );
      });
      this.translate.get('Units').subscribe(units => {
        doc.text(marginUds, marginInicioTabla, units.toUpperCase() );
      });
      this.translate.get('Price').subscribe(price => {
        doc.text(marginPrecio, marginInicioTabla, price.toUpperCase() );
      });
      this.translate.get('Bonification').subscribe(bonification => {
        doc.text(marginBon, marginInicioTabla, bonification.toUpperCase() );
      });
      this.translate.get('Total').subscribe(total => {
        doc.text(marginTotal, marginInicioTabla, total.toUpperCase() );
      });
      
			marginInicioTabla += 7;
      var totalPedido = 0.00;
			
			doc.setTextColor(0,0,0);
      doc.setFontType('normal');
      
			 for(let product of this.allProducts){			
				if (marginInicioTabla > marginMax) {
					marginInicioTabla = 25;
					doc.addPage();
        }
        
        let productDescription = product.DESCRIPTION.toUpperCase();
        let numLetters:number = 32;
        if (productDescription.length >= numLetters) productDescription = productDescription.slice(0, (numLetters - 3)) + "...";

				doc.text(marginProd, marginInicioTabla, (productDescription+""));
				doc.text(marginUds, marginInicioTabla, (product.QUANTITY+""));
        doc.text(marginPrecio, marginInicioTabla, (product.NET_PRICE+""));
			  if (product.ITM_TYPE=='ZBON') doc.setTextColor(108,193,74);
        doc.text(marginBon, marginInicioTabla, "V");
        doc.setTextColor(0,0,0);
				doc.text(marginTotal, marginInicioTabla, (product.NET_VALUE+""));
				
        marginInicioTabla += 7;	
        totalPedido += Number(parseFloat(product.NET_VALUE).toFixed(2));
      }	
      marginInicioTabla -= 4;

			doc.setLineWidth(0.5);
			doc.line(25, marginInicioTabla, 185, marginInicioTabla);
			marginInicioTabla += 6;
			doc.setTextColor(13,45,132);
      doc.setFontType('bold');
      this.translate.get('TotalOrder').subscribe(totalOrder => {
        doc.text(marginProd, marginInicioTabla, totalOrder.toUpperCase());
      });
			doc.text(marginTotal, marginInicioTabla, Number.isInteger(totalPedido)? totalPedido.toString()+".00": parseFloat(totalPedido.toString()).toFixed(2).toString());
			marginInicioTabla += 10;
    }
    
    if (checks.checkFirma) {
			if (marginInicioTabla+40 > marginMax) {
				marginInicioTabla = 25;
				doc.addPage();
      }
      
      this.translate.get('Firm').subscribe(firm => {
        doc.text(30, marginInicioTabla, firm);
      });
      var canvas = this.signaturePad.toDataURL();
			doc.addImage(canvas,'PNG', 25, marginInicioTabla+10, 90, 30);
			var marginNotas = marginInicioTabla + 40;
    }
    
    if (checks.checkNotas) {
			doc.setFontSize(10);
			doc.setTextColor(0,0,0);
			doc.setFontType('normal');
			var titulo = "";
			var nota = "";
			for (let order of this.order.TEXT) {
				if (order.TDID == "1000") {
          this.translate.get('WishesClient').subscribe(wishesClient => {
            titulo = wishesClient;
          });
					nota += order.TDLINE;
				}
			}
			
			if (titulo != "") {
				let lines = doc.splitTextToSize(nota, 160);

				if ((marginNotas + 20 + lines.length * 5) > marginMax) {
					marginNotas = 25;
					doc.addPage();
        }
        
				doc.setFontSize(10);
				doc.setTextColor(13,45,132);
				doc.setFontType('bold');
				doc.text(30, marginNotas, titulo);
				doc.setFontSize(10);
				doc.setTextColor(0,0,0);
				doc.setFontType('normal');
				doc.text(30, marginNotas + 10, lines);
				marginNotas += 20 + lines.length * 5;
      }
      
			titulo = "";
			nota = "";
			for (let order of this.order.TEXT) {
				if (order.TDID == "0002") {
          this.translate.get('InternalNote').subscribe(internalNote => {
            titulo = internalNote;
            nota += order.TDLINE;
          });
				}
			}
			
			if (titulo != "") {
        let lines = doc.splitTextToSize(nota, 160);
        
				if ((marginNotas + 20 + lines.length * 5) > marginMax) {
					marginNotas = 25;
					doc.addPage();
				}
				doc.setFontSize(10);
				doc.setTextColor(13,45,132);
				doc.setFontType('bold');
				doc.text(30, marginNotas, titulo);
				doc.setFontSize(10);
				doc.setTextColor(0,0,0);
				doc.setFontType('normal');
				doc.text(30, marginNotas + 10, lines);
				marginNotas += 20 + lines.length * 5;
			}
			
			titulo = "";
			nota = "";
			for (let order of this.order.TEXT) {
				if (order.TDID == "0001") {
          this.translate.get('HeaderNote').subscribe(headerNote => {
            titulo =headerNote;
            nota += order.TDLINE;
          });
				}
			}
			
			if (titulo != "") {
				let lines = doc.splitTextToSize(nota, 160);

				if ((marginNotas + 20 + lines.length * 5) > marginMax) {
					marginNotas = 25;
					doc.addPage();
        }
        
				doc.setFontSize(10);
				doc.setTextColor(13,45,132);
				doc.setFontType('bold');
				doc.text(30, marginNotas, titulo);
				doc.setFontSize(10);
				doc.setTextColor(0,0,0);
				doc.setFontType('normal');
				doc.text(30, marginNotas + 10, lines);
				marginNotas += 20 + lines.length * 5;
			}
			
			titulo = "";
			nota = "";
			for (let order of this.order.TEXT) {
				if (order.TDID == "0003") {
          this.translate.get('FinalNote').subscribe(finalNote => {
            titulo = finalNote;
            nota += order.TDLINE;
          });
				}
			}
			
			if (titulo != "") {
				let lines = doc.splitTextToSize(nota, 160);
				if ((marginNotas + 20 + lines.length * 5) > marginMax) {
					marginNotas = 25;
					doc.addPage();
        }
        
				doc.setFontSize(10);
				doc.setTextColor(13,45,132);
				doc.setFontType('bold');
				doc.text(30, marginNotas, titulo);
				doc.setFontSize(10);
				doc.setTextColor(0,0,0);
				doc.setFontType('normal');
				doc.text(30, marginNotas + 10, lines);
				marginNotas += 20 + lines.length * 5;
      }
      
			titulo = "";
			nota = "";
    } 
    
    return new Promise<jsPDF>((resolve, reject) => { 
        resolve(doc);
    }); 			 
  }

  getCountryText(countryCode: any): string {
    for (let country of this.countries) {
      if (country.LAND1 == countryCode) return country.LANDX;
    }
  }

  getStatusTxt30(statusId) {
    if (this.states) {
      for (let state of this.states) {
          if (state.STATUS == statusId) {
            return state.TXT30;
          }
      }
    }
    return "-";
  }

  previewPDF(){
      var blob = this.pdf.output('blob', {type: 'application/pdf'});
      let pdfUrl = {pdfUrl: URL.createObjectURL(blob)};
      let modal = this.appCtrl.getRootNav().push(pdfViewModal, pdfUrl);     
  }

  showPdfAlert(){
    let profileModal = this.modalCtrl.create(
      pdfAlertModal
    , {
      enableBackdropDismiss: false
    }); 
    profileModal.present();      
  }

  changeSelectedRequestor(){
      let typePartner = this.isOrden ? PartnersWebProvider.PARTNERS_YX_YY_YZ : PartnersWebProvider.PARTNERS_NO_YE_NO_CONTACT_PERSON;
      this.loadingRequestors = true;
      this.loadingOption = true;
      this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, typePartner, '').then((partners) => {
        partners.PARTNERS.sort(function (a, b) {
          if (a.NAME != undefined && b.NAME != undefined) {
            return a.NAME.localeCompare(b.NAME, "ca-ES");
          }
        });
        this.loadingRequestors = false;
        this.loadingOption = false;
      
        this.translate.get('SelectRequestor').subscribe(
        selectRequestor => {
          let profileModal = this.modalCtrl.create(SelectSearchModalWeb, {
            val: this.requestor.PARTNER_NO,
            options: partners.PARTNERS,   
            maxOptions: Number(partners.MAX_PARTNERS),
            typeOption: typePartner,       
            label: "NAME",
            key: "PARTNER",
            allowEmpty: true,
            title: selectRequestor
          }, {
            enableBackdropDismiss: false
          });
          profileModal.onDidDismiss(partnerSelected => {
            if (partnerSelected!=null) {
              //Eliminamos al destinatario
              let indice = this.order.PARTNERS.indexOf(this.addressee);
              (indice >= 0) ? this.order.PARTNERS.splice(indice, 1) : false;
              this.addressee = {}; //Eliminamos al destinatario
              this.addresseeFull = {}; //Eliminamos al destinatario full
              this.allProducts = []; //Eliminamos los productos
              this.priceTotalProducts = 0; //Eliminamos el precio del total de productos
              this.createNewPartner(partnerSelected, this.requestor.PARTNER_FCT).then((requestor)=>{
                requestor.PARTNER_FCT = '00000001';
                //Eliminamos al solicitante y aniadimos el nuevo
                let index = this.order.PARTNERS.indexOf(this.requestor);
                (index >= 0) ? this.order.PARTNERS.splice(index, 1, requestor) : this.order.PARTNERS.splice(this.order.PARTNERS.length, 0, requestor);
                //Nos quedamos con el nuevo solicitante
                this.requestor = requestor;
              });              
              this.submitAttempt = true;
              
              this.sapcrmWebProvider.syncOptimizedPartner('', partnerSelected.PARTNER, '').then((contacto)=>{
                if(contacto != undefined) {
                  this.requestorFull = contacto; //Almacenamos nuestro contacto FULL
                  //Cargamos el termino de pago que tenga asociado el solicitante
                  this.checkPaymentTerm(contacto.SALES.PAYMENT_TERMS);
                  //Cargamos los destinatarios que tienen relacion "tiene destinatario de mercancia" con el solicitante
                  this.getAddresseesFromRequestor(contacto).then((addressee) =>{
                    this.addresseesFromRequestor = addressee;
                    this.checkIfShowAddressee(); //Comprobamos si se puede mostrar el campo "destinatario"
                    this.autoCompleteAddresseeFromRequestor(contacto); //Autocompletamos el campo "destinatario" si es posible
                  }); 
                  //Cargamos los productos asociados al solicitante
                  this.filterProducts(contacto);
                }
              }); 
            }
          });
          profileModal.present();
        });
      });
  }

  checkPaymentTerm(salesPaymentTerm){
    if (salesPaymentTerm != "") {
      for(let paymentTerm of this.paymentsTerms){
        if(paymentTerm.PAYMENT_TERMS == salesPaymentTerm){
          this.defaultPaymentTerm = paymentTerm; //Se almacena el termino de pago por defecto
          break;
        }
      }      
    }
  }

  checkIfShowAddressee() {
    this.showAddressee = ((this.requestorFull && this.requestorFull.GROUP == 'YX' && this.addresseesFromRequestor.length > 1 && this.isOrden) || (this.userLoged && this.userLoged.DATA_ADDRESS.COUNTRY != 'BR' && this.isOrden)) ? true : false;
  }

  getAddresseesFromRequestor(contacto): Promise<PartnerAbstract[]>{
    let partners = [];
    return new Promise((resolve,reject) => {
      this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', contacto.PARTNER, '').then((requestor)=>{
        if (contacto.GROUP != 'YX')
          partners.push(requestor); //Se aniade al propio solicitante como destinatario si no es del grupo 'YX'
          
        let counter1 = 0;
        let counter2 = 0;
        for(let relation of contacto.RELATIONS){ //Recorremos las relaciones del solicitante
          if(relation.RELATIONSHIPCATEGORY=="CRMH02"/* "XRMH02" */) { //Contacto encontrado que es destinatario del solicitante
            counter1++;
            this.sapcrmWebProvider.syncOptimizedPartnerAbstractWeb('', relation.PARTNER2, '').then((addressee)=>{ //Obtenemos el contacto
              counter2++;
              if(addressee!=undefined) partners.push(addressee); //Lo agregamos
              if(counter2 == counter1) resolve(partners); //Ya no quedan mas contactos
            });
          }
        }
        if(counter1 == 0) resolve(partners); //No existen contactos que sean destinatarios del solicitante
      });
    });    
  }

  autoCompleteAddresseeFromRequestor(contacto) {
    if (this.isOrden && contacto.GROUP == 'YX') {
      if (this.addresseesFromRequestor.length == 1) {
        this.createNewPartner(this.addresseesFromRequestor[0], "00000002").then((inChargeOf)=>{
          //Eliminamos al destinatario y aniadimos el nuevo
          let index = this.order.PARTNERS.indexOf(this.addressee);
          (index >= 0) ? this.order.PARTNERS.splice(index, 1, inChargeOf) : this.order.PARTNERS.splice(this.order.PARTNERS.length, 0, inChargeOf);
          //Nos quedamos con el nuevo destinatario
          this.addressee = inChargeOf;
        });
      }
    }
  }

  filterProducts_Z8AC_ZBOM(products) {
    let productsFiltered_Z8AC_ZBOM = [];

    for (let product of products) {
      if (product.IDTIPOMATERIAL == 'Z8AC' || product.IDTIPOMATERIAL == 'ZBOM') {
        productsFiltered_Z8AC_ZBOM.push(product);
      }
    }

    return productsFiltered_Z8AC_ZBOM;
  }

  filterProducts_marketingHeaders(productTypes, products) {
    let productsFiltered_marketingHeaders = [];


    for (let product of products) {
      for (let i = 0; i < product.ATTRIBUTE.length; i++) {
        if (product.ATTRIBUTE[i] == 'X' && productTypes[i] == 'X') {
          productsFiltered_marketingHeaders.push(product);
          break;
        }
      }
    }

    return productsFiltered_marketingHeaders;
  }

  filterProducts(partner) {
    this.getRequestorProductTypes(partner).then((productTypes)=>{ //Recuperamos las especies que acepta el solicitante, para filtrar los productos
      this.sapcrmCacheProvider.getProductsDeterminedUser().then((productsCache) => { //Filtrado 1 de productos (Productos cuyo estado es distinto de 3 y es aceptado por el solicitante)
        //Filtrado 2 de productos (Productos cuyo IDTIPOMATERIAL = Z8AC || ZBOM)
        let productsFiltered_Z8AC_ZBOM = this.filterProducts_Z8AC_ZBOM(productsCache);
        //Filtrado 3 de productos (Productos cuya especie es aceptada por el solicitante)
        let productsFiltered_marketingHeaders = this.filterProducts_marketingHeaders(productTypes, productsFiltered_Z8AC_ZBOM);

        //Ordenamos los productos
        productsFiltered_marketingHeaders.sort((a:{MATERIAL:string},b:{MATERIAL:string}) => { //'productsFiltered_marketingHeaders' contiene todos los productos, asi que los ordenamos alfabeticamente
          return a.MATERIAL.localeCompare(b.MATERIAL,"ca-ES");
        });

        this.productsFiltered = productsFiltered_marketingHeaders; //Almacenamos los productos filtrados
      });
    });
  }

  getRequestorProductTypes(requestor): Promise<string>{ 
    let productTypes = "";
    if(requestor) {
      for(let marketingHeader of this.marketingHeaders){ //Recorremos todas las especies
        //Si una especie del solicitante tiene una 'X', se aniade como especie aceptada por el solicitante
        if(requestor.CENTRAL_CUSTOMER_EXT[marketingHeader.CLASS_NUM]=="X") productTypes = productTypes + 'X';
        else productTypes = productTypes + ' ';
      }
    }
    return new Promise<string>((resolve) => resolve(productTypes));
  }

  changeSelectedAddressees(){
    let options = this.addresseesFromRequestor;

    options.sort((a:{NAME:string},b:{NAME:string}) => { //'options' contiene todos los contactos, asi que los ordenamos alfabeticamente
      return a.NAME.localeCompare(b.NAME,"ca-ES");
    });

    this.translate.get('SelectAddressee').subscribe(
    selectAddressee => {
      let profileModal = this.modalCtrl.create(SelectSearchModal, {
        val: this.addressee.PARTNER_NO,
        options: options,         
        label: "NAME",
        key: "PARTNER",
        allowEmpty: true,
        title: selectAddressee
      }, {
        enableBackdropDismiss: false
      });
      profileModal.onDidDismiss(indexSelectedSelect => {
        if (indexSelectedSelect!=null) {
          this.sapcrmWebProvider.syncOptimizedPartner('', this.addresseesFromRequestor[indexSelectedSelect].PARTNER, '').then((contacto)=>{
            if(contacto != undefined)
              this.addresseeFull = contacto; //Almacenamos nuestro contacto FULL
            else
              this.addresseeFull = {};
                        
            this.createNewPartner(this.addresseesFromRequestor[indexSelectedSelect], this.addressee.PARTNER_FCT).then((inChargeOf)=>{
              //Indicamos que es destinatario
              inChargeOf.PARTNER_FCT = "00000002";
              //Eliminamos al destinatario y aniadimos el nuevo
              let index = this.order.PARTNERS.indexOf(this.addressee);
              (index >= 0) ? this.order.PARTNERS.splice(index, 1, inChargeOf) : this.order.PARTNERS.splice(this.order.PARTNERS.length, 0, inChargeOf);
              //Nos quedamos con el nuevo destinatario
              this.addressee = inChargeOf;
            });
          }); 
          this.submitAttempt = true;
        }
      });
      profileModal.present();
    });
  }

  changeSelectedDistributor(){
    this.loadingDistributors = true;
    this.loadingOption = true;
    this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_DISTRIBUTOR, '').then((partners) => {
      partners.PARTNERS.sort(function (a, b) {
        if (a.NAME != undefined && b.NAME != undefined) {
          return a.NAME.localeCompare(b.NAME, "ca-ES");
        }
      });
      this.loadingDistributors = false;
      this.loadingOption = false;

      this.translate.get('SelectDistributor').subscribe(
      selectDistributor => {
        let profileModal = this.modalCtrl.create(SelectSearchModalWeb, {
          val: this.distributor.PARTNER_NO,
          options: partners.PARTNERS,   
          maxOptions: Number(partners.MAX_PARTNERS),
          typeOption: PartnersWebProvider.PARTNERS_DISTRIBUTOR,         
          label: "NAME",
          key: "PARTNER",
          allowEmpty: true,
          title: selectDistributor
        }, {
          enableBackdropDismiss: false
        });
        profileModal.onDidDismiss(partnerSelected => {
          if (partnerSelected!=null) {               
            this.createNewPartner(partnerSelected, this.distributor.PARTNER_FCT).then((inChargeOf)=>{
              //Indicamos que es distribuidor
              inChargeOf.PARTNER_FCT = "00000035";
              //Eliminamos al distribuidor y aniadimos el nuevo
              let index = this.order.PARTNERS.indexOf(this.distributor);
              (index >= 0) ? this.order.PARTNERS.splice(index, 1, inChargeOf) : this.order.PARTNERS.splice(this.order.PARTNERS.length, 0, inChargeOf);
              //Nos quedamos con el nuevo distribuidor
              this.distributor = inChargeOf;
            });
            this.submitAttempt = true;
          }
        });
        profileModal.present(); 
      });
    });
  }

  addEmployeeResponsible(indexSelected?, employee?){
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

      this.translate.get('SelectEmployeesResponsibles').subscribe(
        selectEmployeesResponsibles => {
          let profileModal = this.modalCtrl.create(SelectSearchModalWeb, {
            val: employee != null ? employee.PARTNER_NO : null,
            options: partners.PARTNERS,   
            maxOptions: Number(partners.MAX_PARTNERS),
            typeOption: PartnersWebProvider.PARTNERS_YE,      
            label: "NAME",
            key: "PARTNER",
            allowEmpty: true,
            title: selectEmployeesResponsibles
          }, {
            enableBackdropDismiss: false
          });
          profileModal.onDidDismiss(partnerSelected => {
            if (partnerSelected!=null) {               
              this.createNewPartner(partnerSelected,"00000014").then((inChargeOf)=>{
                if(indexSelected != null){ //Si se modifica un empleado ya creado anteriormente
                  //Eliminamos al empleado responsable
                  let indice = this.order.PARTNERS.indexOf(this.employeeResponsible[indexSelected]);
                  (indice >= 0) ? this.order.PARTNERS.splice(indice, 1, inChargeOf) : false;
                  this.employeeResponsible.splice(indexSelected, 1, inChargeOf);
                } else{ //Si se aniade un empleado nuevo
                  this.employeeResponsible.push(inChargeOf);
                  this.order.PARTNERS.splice(this.order.PARTNERS.length, 0, inChargeOf);
                }
              });
              this.submitAttempt = true;
            }
          });
          profileModal.present();  
        });
      });
  }

  newProduct(product) {
    let newProduct = {
      ORDERED_PROD: product.IDMATERIAL,
      DESCRIPTION: product.MATERIAL,
      QUANTITY: "",
      NET_PRICE: "",
      NET_VALUE: "0",
      ITM_TYPE: "ZTAN",
      ERROR_MINIMUM_PRICE: false
    };
    
    return newProduct;
  }

  addProduct() {
    //Mostramos la lista de productos
    this.translate.get('SelectProducts').subscribe(
    selectProducts => {
      let profileModal = this.modalCtrl.create(SelectMultipleModal, {
        optionsByQueryFn: this.productsFiltered,
        key: "IDMATERIAL",
        label: "MATERIAL",
        showKey: false,
        title: selectProducts,
        data:  this.productsFiltered
      }, {
        enableBackdropDismiss: false
      });
      profileModal.onDidDismiss((values) => {
        if (values) {
          for (let val of values) {
            let product = {
              ORDERED_PROD: val.IDMATERIAL,
              DESCRIPTION: val.MATERIAL,
              QUANTITY: "",
              NET_PRICE: "",
              NET_VALUE: "0",
              ITM_TYPE: "ZTAN",
              ERROR_MINIMUM_PRICE: false
            };
            this.allProducts.splice(this.allProducts.length, 0, product);
            //Comprobamos si el solicitante tiene un precio predeterminado para ese producto
            this.checkPriceProductFromRequestor(product);
            try {
              this.cdRef.detectChanges();
            } catch (err) {
              console.log("error en el detectChanges");
            }
          }
        }
      });
      profileModal.present();
    });
  }

  changeSelectedProduct(productsToChange, indexSelected){
    let options = this.productsFiltered;  
    this.translate.get('SelectProducts').subscribe(
      selectProducts => {
        let profileModal = this.modalCtrl.create(SelectSearchModal, {
          val: productsToChange.length>0 ? productsToChange[indexSelected].ORDERED_PROD: "",
          options: options,         
          label: "MATERIAL",
          key: "IDMATERIAL",
          allowEmpty: true,
          title: selectProducts
        }, {
          enableBackdropDismiss: false
        });
        profileModal.onDidDismiss(indexSelectedSelect => {
          if (indexSelectedSelect!=null) {
            this.calculatePriceTotalProducts(Number(this.allProducts[indexSelected].NET_VALUE), false); //Resta el precio al total
            //Inicializamos el producto
            this.allProducts[indexSelected] = this.newProduct(options[indexSelectedSelect]);
            //Comprobamos si el solicitante tiene un precio predeterminado para ese producto
            this.checkPriceProductFromRequestor(this.allProducts[indexSelected]);
            this.submitAttempt = true;
          }
        });
        profileModal.present();      
    });   
  }

  //Recibe el precio total de un producto, y lo suma (true) o lo resta (false)
  calculatePriceTotalProducts(price:number, operacion:boolean) {
    operacion ? this.priceTotalProducts += price : this.priceTotalProducts -= price;
    this.priceTotalProducts = Number(this.priceTotalProducts.toFixed(2));
  }

  existMinimumProductPrices(productID: string): boolean {
    let exist = false;

    for (let minimumProductPrice of this.minimumProductPrices) {
      if (minimumProductPrice.IDMATERIAL == productID) {
        exist = true; 
        break;
      }
    }

    return exist;
  }

  checkPriceProductFromRequestor(product) {
    if (this.requestorFull!=null) {
      let priceListFromRequestor = this.requestorFull.SALES.PRICE_LIST_TYPE; //Obtenemos el ID del tipo de precio asignado a ese solicitante
      let productID = product.ORDERED_PROD; //Obtenemos el ID del producto

      for (let priceList of this.pricesList){
        if (priceListFromRequestor == priceList.PLTYP && productID == priceList.MATNR){ //Si en la lista de precios coincide el ID del producto y el ID del tipo de precio
          if (!this.existMinimumProductPrices(productID)) {
            //Lo aniadimos como precio minimo del producto
            this.minimumProductPrices.push({
              IDMATERIAL: productID,
              MINIMUMPRICE: priceList.KBETR
            });
          }
        }
      }
    }
  }

  //Funcion que comprueba si los productos superan su precio minimo
  checkMinimumProductPrices() {
    let incorrectProductPrices:boolean = false;
    
    for (let minimumProductPrice of this.minimumProductPrices) {
      let unidades:number = 0;
      let total:number = 0;
      let precioMedio:number = 0;
      let idPosibleErroneousProduct = "";

      for (let product of this.allProducts) {
        if (minimumProductPrice.IDMATERIAL == product.ORDERED_PROD) {
          unidades += isNaN(Number(product.QUANTITY)) ? 0 : Number(product.QUANTITY);
          total += Number(parseFloat(product.NET_VALUE).toFixed(2));

          idPosibleErroneousProduct = product.ORDERED_PROD;
        }
      }

      if (idPosibleErroneousProduct != "") {
        precioMedio = (total == 0 || unidades == 0) ? 0 : Number((total / unidades).toFixed(2));
        if (precioMedio < minimumProductPrice.MINIMUMPRICE) {
          incorrectProductPrices = true;
          for (let product of this.allProducts) {
            if (product.ORDERED_PROD == idPosibleErroneousProduct)
              product.ERROR_MINIMUM_PRICE = true;
          }
        }
      }
    }

    return incorrectProductPrices;
  }

  //Funcion que resetea el error del precio minimo de todos los productos
  deleteMinimumProductPrices() {
    for (let product of this.allProducts) {
      product.ERROR_MINIMUM_PRICE = false;
    }
  }

  calculateNetPrice(product) {
    product.QUANTITY = isNaN(product.QUANTITY) ? "" : Number(parseFloat(product.QUANTITY).toFixed(0));
    product.NET_PRICE = isNaN(product.NET_PRICE) ? "" : Number(parseFloat(product.NET_PRICE).toFixed(2));

    if (product.ITM_TYPE != 'ZBON') {
      this.calculatePriceTotalProducts(Number(product.NET_VALUE), false); //Resta el precio al total
      product.NET_VALUE = (isNaN(product.QUANTITY) || isNaN(product.NET_PRICE)) ? 0 : product.NET_PRICE * product.QUANTITY;
      product.NET_VALUE = parseFloat(product.NET_VALUE).toFixed(2);
      this.calculatePriceTotalProducts(Number(product.NET_VALUE), true); //Suma el precio al total
    }
  }

  //Comprueba si la bonificacion esta activa o no, para darle un color u otro
  isChecked(product:any):boolean {
    return (product.ITM_TYPE=='ZBON');
  }

  applyDiscount(product, event) {//TODO
    product.ITM_TYPE = (product.ITM_TYPE=='ZBON') ? 'ZTAN' : 'ZBON';
    product.NET_VALUE = (product.ITM_TYPE=='ZBON') ? "0" : (isNaN(product.QUANTITY) || isNaN(product.NET_PRICE)) ? 0 : product.NET_PRICE * product.QUANTITY;
    product.NET_VALUE = parseFloat(product.NET_VALUE).toFixed(2);
    if (!isNaN(product.QUANTITY) && !isNaN(product.NET_PRICE)) 
      (product.ITM_TYPE=='ZBON') ? this.calculatePriceTotalProducts(Number(product.NET_PRICE * product.QUANTITY), false)/*Resta el precio al total*/ : this.calculatePriceTotalProducts(Number(product.NET_PRICE * product.QUANTITY), true);/*Suma el precio al total*/
    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }
  }

  changeSelectedPaymentTerm(){
    this.translate.get('SelectPaymentTerm').subscribe(
      selectPaymentTerm => {
        let profileModal = this.modalCtrl.create(SelectSearchModal, {
          val: this.currentPaymentTerm ? this.currentPaymentTerm.PAYMENT_TERMS : "",
          defaultOption: this.defaultPaymentTerm ? this.defaultPaymentTerm.PAYMENT_TERMS : null,
          options: this.paymentsTerms,         
          label: "DESCRIPTION",
          key: "PAYMENT_TERMS",
          allowEmpty: true,
          title: selectPaymentTerm
        }, {
          enableBackdropDismiss: false
        });
        profileModal.onWillDismiss(indexSelectedSelect => {
          if (indexSelectedSelect!=null) {
            this.order.HEADER.EXTERN_ACT_ID = this.paymentsTerms[indexSelectedSelect].PAYMENT_TERMS;
            this.currentPaymentTerm = this.paymentsTerms[indexSelectedSelect];
            this.submitAttempt = true;
          }
        });
        profileModal.present(); 
      });            
  }

  editNota(actualNota?) {
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
            this.order.TEXT.splice(this.order.TEXT.length, 0, nota);
            this.allNotes.splice(this.allNotes.length, 0, nota);
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
  }

  //Limpiamos el canvas de la firma 
  drawClear() {
    this.signaturePad.clear();

    let copyNote = this.order.TEXT.slice();
    let index;
    for (let firma of this.order.TEXT) {
      if (firma.TDID == "Z005") {
        index = copyNote.indexOf(firma);
        if (index > -1) {
          copyNote.splice(index, 1);
        }
      }
    }
    this.order.TEXT = copyNote;
  }

  //Método para guardar la firma en la orden, dentro del campo TEXT
  drawComplete() {
    let signature = [];
    this.signatureImage = this.signaturePad.toData();

    //Formato para el servidor
    for (let section = 0; section < this.signatureImage.length; section++) {
      for (let punto = 0; punto < this.signatureImage[section].length - 1; punto++) {
        signature.push({
          'lx': this.signatureImage[section][punto + 1].x
          , 'ly': this.signatureImage[section][punto + 1].y
          , 'mx': this.signatureImage[section][punto].x
          , 'my': this.signatureImage[section][punto].y
        })
      }
    }
    //guardamos este formato en TEXT
    this.signatureJsonString = JSON.stringify(signature);
    let sentence = "";
    for (let i = 0, last = false; i < this.signatureJsonString.length && !last; i = i + 130) {
      sentence = this.signatureJsonString.substring(i, i + 130);
      if (sentence == "") {// hay menos de 130
        last = true
        sentence = this.signatureJsonString.substring(i);
      }
      let note = {
        MODE: "A",//TODO
        TDFORMAT: "*",
        TDID: AppSettings.SIGNATURE_NOTE_TYPE,
        TDLINE: sentence,
        TDSPRAS: AppSettings.DEFAULT_LANGUAGE,
      };
      this.order.TEXT.splice(this.order.TEXT.length, 0, note);
    }

    //Si se firma pero ya habia antes una firma, cada una se mete entre '[]', y eso esta mal,
    //las dos deben estar dentro de una unica '[]', por lo que eliminamos los '[' y ']' de entre medias
    let firstTimeLeftBracket = true;
    for (let i = 0; i < this.order.TEXT.length; i++) {
      if (this.order.TEXT[i].TDID == "Z005" && this.order.TEXT[i].TDLINE.indexOf('[]') < 0 && this.order.TEXT[i].TDLINE.indexOf('[') >= 0) {
        if (firstTimeLeftBracket)
          firstTimeLeftBracket = false;
        else
        this.order.TEXT[i].TDLINE = this.order.TEXT[i].TDLINE.replace("[", "");
      }
    }
    let firstTimeRigthBracket = true;
    for (let j = (this.order.TEXT.length - 1); j >= 0; j--) {
      if (this.order.TEXT[j].TDID == "Z005" && this.order.TEXT[j].TDLINE.indexOf('[]') < 0 && this.order.TEXT[j].TDLINE.indexOf(']') >= 0) {
        if (firstTimeRigthBracket)
          firstTimeRigthBracket = false;
        else
        this.order.TEXT[j].TDLINE = this.order.TEXT[j].TDLINE.replace("]", ",");
      }
    }
  }

  createNewPartner(partnerSelected: any, tipo?: any): Promise<any>{
    let partner = {
        PARTNER_FCT: tipo,
        PARTNER_NO: partnerSelected.PARTNER,
        FULLNAME: partnerSelected.NAME
    }
    return new Promise<any>((resolve) => resolve(partner));
  }

  watchPartner(partnerId: string){
    this.openingOtherPage = true; //Pasamos a otra pagina
    this.navCtrl.push(ContactPage, {
      id: partnerId,
      isDeleteable: false
    });
  }

  deleteData(data, tipo, index) {
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
                              case 'product'://CASO PRODUCTO
                                index = this.allProducts.indexOf(data);
                                if (index > -1) {
                                  this.calculatePriceTotalProducts(Number(this.allProducts[index].NET_VALUE), false); //Resta el precio al total
                                  this.allProducts.splice(index, 1);
                                }
                                break;
                              case 'employeeResponsible'://CASO EMPLEADO RESPONSABLE
                                  index = this.employeeResponsible.indexOf(data);

                                  //Eliminamos al empleado responsable
                                  let indice = this.order.PARTNERS.indexOf(this.employeeResponsible[index]);
                                  (indice >= 0) ? this.order.PARTNERS.splice(indice, 1) : false;

                                  if (index > -1) {
                                    this.employeeResponsible.splice(index, 1);
                                  }
                                break;
                              case 'sellToParty'://CASO SOLICITANTE
                                  this.requestor = {};        
                                break;
                              case 'shipToParty'://CASO DESTINO
                                  this.addressee = {};                             
                                break; 
                              case 'distributor'://CASO DISTRIBUIDOR
                                  //Eliminamos al distribuidor
                                  let ind = this.order.PARTNERS.indexOf(this.distributor);
                                  (ind >= 0) ? this.order.PARTNERS.splice(ind, 1) : false;

                                  this.distributor = {};                                
                                break;   
                              case 'note'://CASO NOTA
                                index = this.order.TEXT.indexOf(data);
                                if (index > -1) {
                                  this.addNotesToDelete(this.order.TEXT[index]);
                                  this.order.TEXT.splice(index, 1);
                                }
                                index = this.allNotes.indexOf(data);
                                if (index > -1) {
                                  this.allNotes.splice(index, 1);
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

  printOrder(formatoSAP) {
    // console.log("PRINT ORDER: " + JSON.stringify(this.order, null, 2));
    this.printUserLoged(formatoSAP);
    this.printDates(formatoSAP);
    this.printHeader(formatoSAP);
    this.printStatusTab(formatoSAP);
    this.printPartners(formatoSAP);
    this.printProducts(formatoSAP);
    this.printNotes(formatoSAP);
    this.printSignature(formatoSAP);
  }

  printUserLoged(formatoSAP) {
    let userLogedToPrint = {};

    if (formatoSAP) {
      userLogedToPrint = {
        COUNTRY: this.userLoged.DATA_ADDRESS.COUNTRY
      };
    } else {
      userLogedToPrint = this.userLoged;
    }

    console.log("PRINT USER LOGED: " + JSON.stringify(userLogedToPrint, null, 2));
  }

  printDates(formatoSAP) {
    let datesToPrint = [];

    if (formatoSAP) {
      this.order.DATE.forEach((date) => {
        if (date.APPT_TYPE == 'ORDERACTUAL') {
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
      datesToPrint = this.order.DATE;
    }

    console.log("PRINT DATES: " + JSON.stringify(datesToPrint, null, 2));
  }

  printHeader(formatoSAP) {
    let headerToPrint = {};

    if (formatoSAP) {
      headerToPrint = {
        GUID: this.order.HEADER.GUID,
        OBJECT_ID: this.order.HEADER.OBJECT_ID,
        PROCESS_TYPE: this.order.HEADER.PROCESS_TYPE,
        DESCRIPTION: this.order.HEADER.DESCRIPTION,
        CATEGORY: this.order.HEADER.CATEGORY,
        OBJECTIVE: this.order.HEADER.OBJECTIVE,
        PRIVATE_FLAG: this.order.HEADER.PRIVATE_FLAG,
        EXTERN_ACT_ID: (this.userLoged.DATA_ADDRESS.COUNTRY == 'BR') ? this.order.HEADER.EXTERN_ACT_ID : "",
        ACT_LOCATION: this.order.HEADER.ACT_LOCATION
      };
    } else {
      headerToPrint = this.order.HEADER;
    }

    console.log("PRINT HEADER: " + JSON.stringify(headerToPrint, null, 2));
  }

  printStatusTab(formatoSAP) {
    let statusTabToPrint = [];

    if (formatoSAP) {
      this.order.STATUS_TAB.forEach((status) => {
        statusTabToPrint.push({
          STATUS: status.STATUS
        });
      });
    } else {
      statusTabToPrint = this.order.STATUS_TAB;
    }

    console.log("PRINT STATUS TAB: " + JSON.stringify(statusTabToPrint, null, 2));
  }

  printPartners(formatoSAP) {
    let partnersToPrint = [];

    if (formatoSAP) {
      this.order.PARTNERS.forEach((partner) => {
        partnersToPrint.push({
          PARTNER_FCT: partner.PARTNER_FCT, 
          PARTNER_NO: partner.PARTNER_NO
        });
      });
    } else {
      partnersToPrint = this.order.PARTNERS;
    }

    console.log("PRINT PARTNERS: " + JSON.stringify(partnersToPrint, null, 2));
  }

  printProducts(formatoSAP) {
    let productsToPrint = [];

    if (formatoSAP) {
      this.order.MATERIAL_TAB.forEach((product) => {
        productsToPrint.push({
          ORDERED_PROD: product.ORDERED_PROD,
          ITM_TYPE: product.ITM_TYPE,
          QUANTITY: isNaN(Number(product.QUANTITY)) ? "0.00" : parseFloat(product.QUANTITY).toFixed(0),
          NET_PRICE:isNaN(Number(product.NET_PRICE)) ? "0.00" : parseFloat(product.NET_PRICE).toFixed(2),
          NET_VALUE: parseFloat(product.NET_VALUE).toFixed(2)
        });
      });
    } else {
      productsToPrint = this.order.MATERIAL_TAB;
    }

    console.log("PRINT PRODUCTS: " + JSON.stringify(productsToPrint, null, 2));
  }

  printNotes(formatoSAP) {
    let notesToPrint = [];

    if (formatoSAP) {
      this.order.TEXT.forEach((note) => {
        if (note.TDID != "Z005") {
          notesToPrint.push({
            TDID: note.TDID,
            TDLINE: note.TDLINE,
            REF_KIND: note.REF_KIND,
            MODE: note.MODE ? note.MODE : note.REF_KIND,
            TDFORMAT: note.TDFORMAT,
            TDSPRAS: note.TDSPRAS
          });
        }
      });
    } else {
      this.order.TEXT.forEach((note) => {
        if (note.TDID != "Z005") {
          notesToPrint.push(note);
        }
      });
    }

    console.log("PRINT NOTES: " + JSON.stringify(notesToPrint, null, 2));
  }

  printSignature(formatoSAP) {
    let signatureToPrint = [];

    if (formatoSAP) {
      this.order.TEXT.forEach((signature) => {
        if (signature.TDID == "Z005") {
          signatureToPrint.push({
            TDID: signature.TDID,
            TDLINE: signature.TDLINE,
            REF_KIND: signature.REF_KIND,
            MODE: signature.MODE ? signature.MODE : signature.REF_KIND,
            TDFORMAT: signature.TDFORMAT,
            TDSPRAS: signature.TDSPRAS
          });
        }
      });
    } else {
      this.order.TEXT.forEach((signature) => {
        if (signature.TDID == "Z005") {
          signatureToPrint.push(signature);
        }
      });
    }

    console.log("PRINT SIGNATURE: " + JSON.stringify(signatureToPrint, null, 2));
  }

  ionViewCanEnter() {
    console.log('1. ionViewCanEnter OrderPage');
  }

  ionViewDidLoad() {
    console.log('2. ionViewDidLoad OrderPage');
  }

  ionViewWillEnter() {
    console.log('3. ionViewWillEnter OrderPage');
  }

  ionViewDidEnter() {
    this.openingOtherPage = false; //Estamos en la pagina principal
    console.log('4. ionViewDidEnter OrderPage');
  }

  ionViewCanLeave() {
    console.log('5. ionViewCanLeave OrderPage');
    // here we can either return true or false
    // depending on if we want to leave this view

    //Si pasamos a otra pagina, no comprobamos los cambios
    if(this.openingOtherPage)
      return Promise.resolve();

    return new Promise((resolve, reject) => {
      let changes = JSON.stringify(this.order) === JSON.stringify(this.copyOrder);     
      console.log("Comprobamos si son iguales = " + changes);
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

  ionViewWillLeave() {
    console.log('6. ionViewWillLeave OrderPage');
  }

  ionViewDidLeave() {
    console.log('7. ionViewDidLeave OrderPage');
  }

  ionViewWillUnload() {
    console.log('8. ionViewWillUnload OrderPage');
    this.ev.unsubscribe('previewPDF'); //Nos desuscribimos de la clase que genera/visualiza el PDF
    this.ev.unsubscribe('sendPDF'); //Nos desuscribimos de la clase que envia el PDF
    this.ev.unsubscribe('downloadPDF'); //Nos desuscribimos de la clase que descarga el PDF
  }
}


@Component({ 
 
  template:  
  `<ion-header text-center>
  <ion-navbar color="primary"> 
    <ion-title>
       Informacion
    </ion-title>   
  </ion-navbar>
</ion-header>
    <ion-content padding text-center>
    <ion-list>
    <ion-item>
      <ion-label><span style="font-weight: bold">Partner:</span> {{partner.NAME}} </ion-label>
    </ion-item>
    <ion-item>
      <ion-label><span style="font-weight: bold">ID:</span> {{partner.PARTNER}} </ion-label>
    </ion-item>
    <ion-item>
      <ion-label><span style="font-weight: bold">Direccion:</span> {{partner.ADDRESS}} </ion-label>
    </ion-item>
    </ion-list>
    </ion-content>
    <ion-footer>
  <ion-toolbar>
     <div style="text-align: center;">
      <ion-buttons class="ipadButtons">    
      <button color="primary" outline class="ok-button" (click)="dismiss()" ion-button>       
        {{ 'OK' | translate}}
      </button>   
    </ion-buttons>  
   </div> 
  </ion-toolbar>
</ion-footer>
  
    `,
     selector: 'page-dataMinimizedPartner'
})
export class showPartnerDataMinimizedPage {
  partner: Partner;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
  ) {
  }

  ngOnInit() {   
      this.partner = this.navParams.get("partner");    
  }
  
  dismiss() {
    this.viewCtrl.dismiss();
  }

}


