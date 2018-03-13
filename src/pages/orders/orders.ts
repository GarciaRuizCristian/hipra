import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, ViewController, PopoverController, AlertController } from 'ionic-angular';
import { OrderPage } from "../order/order";
import { UtilsProvider } from '../../providers/utils-provider';
import { Order } from '../../models/order';
import { OrderAbstract } from '../../models/orderAbstract';
import { SapcrmWebProvider } from '../../providers/sapcrm-web-provider';
import { AppSettings } from '../../config/app-settings';
import { OperationsClass } from '../../models/operations_class';
import { SyncProvider } from '../../providers/sync-provider';
import { ModalController } from 'ionic-angular';
import { SelectSingleValue } from '../../components/select-single-value/select-single-value';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { Status } from '../../models/status';
import { Partner } from '../../models/partner';
import { LoaderProvider } from '../../providers/loader-provider';
import { OrdersScrollWebProvider } from "../../providers/orders-scroll-web-provider";
import { LoginProvider } from '../../providers/login-provider';

/*
  Generated class for the Orders page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-orders',
  templateUrl: 'orders.html'
})
export class OrdersPage {

  userLogged: Partner;

  doingSync: boolean = false;
  pendingSync: boolean = false;

  filter: {
    search: string,
    stateOpen: boolean,
    stateProcessing: boolean,
    stateClose: boolean,
    has: boolean
  } = {
    search: "",
    stateOpen: false,
    stateProcessing: false,
    stateClose: false,
    has: false
  };
  eventSync: string;

  valueRangeOpportunities: number = 1;
  valueRangeSales: number = 1;

  constructor(private utils: UtilsProvider, 
              public navCtrl: NavController,
              public cdRef: ChangeDetectorRef, 
              public sapcrmWebProvider: SapcrmWebProvider,
              public syncProvider: SyncProvider, 
              private ev: Events, 
              private translate: TranslateService,
              public modalCtrl: ModalController, 
              private ordersScrollWebProvider: OrdersScrollWebProvider,
              private loaderProvider: LoaderProvider, 
              private loginProvider: LoginProvider) {

    this.syncProvider.pendingEmitter.subscribe((pending) => this.pendingSync = pending);
    this.syncProvider.doingEmitter.subscribe((doing) => this.doingSync = doing);

    this.ev.subscribe('eventSyncOrder', modificado => {
      this.eventSync = modificado;
    });
  }

  loadOrder(orderGuid: string) {
    this.loaderProvider.pushLoadingProcessCallback().then(
      () => {
        this.navCtrl.push(OrderPage, {
          guid: orderGuid
        });
        this.loaderProvider.popLoadingProcess();
      });
  }

  loadNewOrder() {
    this.translate.get('SelectTypeOrder').subscribe(
      SelectTypeOrder => {
        let profileModal = this.modalCtrl.create(SelectSingleValue, {
          options: this.ordersScrollWebProvider.operations,
          key: "PROCESS_TYPE",
          label: "P_DESCRIPTION_20",
          showKey: false,
          title: SelectTypeOrder
        }, {
          enableBackdropDismiss: false
        });
        profileModal.onDidDismiss((value: string) => {
          if (value) {
            this.navCtrl.push(OrderPage, {
              operacion: value
            });
          }
        });
        profileModal.present();
      });
  }

  loadUserLogged(): Promise<void> {
    if (!this.ordersScrollWebProvider.getUserLogged()) {
      return this.sapcrmWebProvider.syncOptimizedPartner('', this.loginProvider.user.idPartner, '').then((partner) => {
        this.userLogged = partner; //Usuario registrado
        this.ordersScrollWebProvider.setUserLogged(this.userLogged);
      },
      (error) => {
        console.log(error);
      });
    } else 
      return Promise.resolve();
  }

  refresh(): Promise<void> {
    if (this.doingSync)
      return Promise.resolve();

    let end = () => {
      this.valueRangeOpportunities = 1;
      this.valueRangeSales = 1;
      this.ordersScrollWebProvider.currentPageOpportunity = 0;
      this.ordersScrollWebProvider.currentPageSale = 0;
      this.ordersScrollWebProvider.loadOrders(1, this.ordersScrollWebProvider.pageSize, this.filter.search);
    };

    return this.syncProvider.sync(false, true)
      .then(end)
      .catch(end);
  }

  switchOrder(orderType:string) {
    this.valueRangeOpportunities = 1;
    this.valueRangeSales = 1;
    this.ordersScrollWebProvider.currentPageOpportunity = 0;
    this.ordersScrollWebProvider.currentPageSale = 0;
    this.ordersScrollWebProvider.actualOrderType = orderType;

    if (this.ordersScrollWebProvider.actualOrderType == "opportunity")
      this.ordersScrollWebProvider.loadOpportunityOrders(1, this.ordersScrollWebProvider.pageSize, this.filter.search);
    else if (this.ordersScrollWebProvider.actualOrderType == "sales")
      this.ordersScrollWebProvider.loadSalesOrders(1, this.ordersScrollWebProvider.pageSize, this.filter.search);
  }

  search(q) {
    console.log(q);
    this.filter.search = q.target.value;
    this.filterApply();
  }

  filterOpen(){
    this.filter.stateOpen = !this.filter.stateOpen;
    this.filterApply();
  }

  filterProcessing(){
    this.filter.stateProcessing = !this.filter.stateProcessing;
    this.filterApply();   
  }

  filterClosed(){
    this.filter.stateClose = !this.filter.stateClose;
    this.filterApply();     
  }

  filterApply() {  
    if (this.filter.search || this.filter.stateOpen || this.filter.stateProcessing || this.filter.stateClose) {
      this.filter.has = true;
    } else {
      this.filter.has = false;
    }

    this.valueRangeOpportunities = 1;
    this.valueRangeSales = 1;
    this.ordersScrollWebProvider.currentPageOpportunity = 0;
    this.ordersScrollWebProvider.currentPageSale = 0;

    if (this.ordersScrollWebProvider.actualOrderType == "opportunity")
      this.ordersScrollWebProvider.loadOpportunityOrders(1, this.ordersScrollWebProvider.pageSize, this.filter.search);
    else if (this.ordersScrollWebProvider.actualOrderType == "sales")
      this.ordersScrollWebProvider.loadSalesOrders(1, this.ordersScrollWebProvider.pageSize, this.filter.search);

    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges: " + err);
    }
  }

  filterClear() {
    this.filter.search = "";
    this.filter.stateClose = false;
    this.filter.stateOpen = false;
    this.filter.stateProcessing = false;
    this.filter.has = false;

    this.valueRangeOpportunities = 1;
    this.valueRangeSales = 1;
    this.ordersScrollWebProvider.currentPageOpportunity = 0;
    this.ordersScrollWebProvider.currentPageSale = 0;

    if (this.ordersScrollWebProvider.actualOrderType == "opportunity")
      this.ordersScrollWebProvider.loadOpportunityOrders(1, this.ordersScrollWebProvider.pageSize, this.filter.search);
    else if (this.ordersScrollWebProvider.actualOrderType == "sales")
      this.ordersScrollWebProvider.loadSalesOrders(1, this.ordersScrollWebProvider.pageSize, this.filter.search);

    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges: " + err);
    }
  }

  moveToPreviousSlideOpportunity(){
    if( this.valueRangeOpportunities > 1 )
      this.valueRangeOpportunities--;
    this.ordersScrollWebProvider.moveToPreviousSlideOpportunity(this.filter.search);
  }

  moveToNextSlideOpportunity(){
    if( this.valueRangeOpportunities < this.ordersScrollWebProvider.maxPageOpportunities + 1 )
      this.valueRangeOpportunities++;
    this.ordersScrollWebProvider.moveToNextSlideOpportunity(this.filter.search);
  }

  movePageRangeOpportunity(page:number) {
    this.ordersScrollWebProvider.movePageRangeOpportunity(page, this.filter.search);

    if (this.cdRef != null) {
      try {
        this.cdRef.detectChanges();
      } catch (e) { }
    }
  }

  moveToPreviousSlideSale(){
    if( this.valueRangeSales > 1 )
      this.valueRangeSales--;
    this.ordersScrollWebProvider.moveToPreviousSlideSale(this.filter.search);
  }

  moveToNextSlideSale(){
    if( this.valueRangeSales < this.ordersScrollWebProvider.maxPageSales + 1 )
      this.valueRangeSales++;
    this.ordersScrollWebProvider.moveToNextSlideSale(this.filter.search);
  }

  movePageRangeSale(page:number) {
    this.ordersScrollWebProvider.movePageRangeSale(page, this.filter.search);

    if (this.cdRef != null) {
      try {
        this.cdRef.detectChanges();
      } catch (e) { }
    }
  }

  getNameRequestor(order:any, elementHTML:HTMLDivElement):string {
    let nameRequestor:string;

    for (let partner of order.PARTNERS)
      if (partner.PARTNER_FCT == "00000001")
        nameRequestor = partner.FULLNAME;

    let sizeElementHTML:number = Math.ceil(elementHTML.getBoundingClientRect().width); //Ancho del elemento HTML que contiene el nombre
    let numLetters:number = Math.floor(sizeElementHTML/12); //12px por letra

    return (nameRequestor.length > numLetters) ? nameRequestor.slice(0, numLetters) + "..." : nameRequestor;
  }

  ionViewCanEnter() {
    console.log('1. ionViewCanEnter OrderPage');
  }

  ionViewDidLoad() {
    console.log('2. ionViewDidLoad OrderPage');
    this.ordersScrollWebProvider.currentPageSale = 0;
    this.ordersScrollWebProvider.currentPageOpportunity = 0;

    this.loadUserLogged().then(() => {
      let maxHeight;
      if (window.innerWidth <= 767)
        maxHeight = window.innerHeight - 253;
      else
        maxHeight = window.innerHeight - 191;
      let maxWidth = window.innerWidth - 32;

      this.ordersScrollWebProvider.setMaxHeight(maxHeight, maxWidth, this.cdRef, this.filter.search);
    });
  }

  ionViewWillEnter() {
    console.log('3. ionViewWillEnter OrderPage');
  }

  ionViewDidEnter() {
    console.log('4. ionViewDidEnter OrderPage');
    if (this.eventSync == "doSync") {//Intentamos sincronizar por si tenemos conexión
      this.refresh();
      this.eventSync = "";
    }
  }

  ionViewCanLeave() {
    console.log('5. ionViewCanLeave OrderPage');
  }

  ionViewWillLeave() {
    console.log('6. ionViewWillLeave OrderPage');
  }

  ionViewDidLeave() {
    console.log('7. ionViewDidLeave OrderPage');
  }

  ionViewWillUnload() {
    console.log('8. ionViewWillUnload OrderPage');
  }
}

@Component({
  template: `
    <ion-searchbar [(ngModel)]="filter.search"></ion-searchbar>

    <ion-item>
      <ion-label> {{'Opportunity' | translate}}</ion-label>
      <ion-toggle [(ngModel)]="filter.opportunity"></ion-toggle>
    </ion-item>
    <ion-item>
      <ion-label> {{'Sales' | translate}}</ion-label>
      <ion-toggle [(ngModel)]="filter.sales"></ion-toggle>
    </ion-item>
    
    <ion-item-group>
      <ion-item-divider color="light">{{'Filter' | translate}}</ion-item-divider>
      <ion-item>
        <ion-label>{{'StatesOpen' | translate}}</ion-label>
        <ion-toggle [(ngModel)]="filter.stateOpen"></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label>{{'StateProcessing' | translate}}</ion-label>
        <ion-toggle [(ngModel)]="filter.stateProcessing"></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label>{{'StatesClose' | translate}}</ion-label>
        <ion-toggle [(ngModel)]="filter.stateClose"></ion-toggle>
      </ion-item>
    </ion-item-group>
    
    <ion-toolbar>
      <ion-buttons left>
        <button ion-button icon-left outline color="primary" (click)="dismiss('clear')">
          <ion-icon name="trash"></ion-icon>
          {{ 'Cancel' | translate }}
        </button>
      </ion-buttons>
      <ion-buttons end>
        <button ion-button icon-left outline color="primary" (click)="dismiss()">
          <ion-icon name="checkmark"></ion-icon>
          {{ 'Apply' | translate }}
        </button>
      </ion-buttons>
    </ion-toolbar>`
})
export class OrdersFilterPage {
  filter: {
    search: string,
    stateOpen: boolean,
    stateProcessing: boolean,
    stateClose: boolean,
    has: boolean
  } = {
    search: "",
    stateOpen: false,
    stateProcessing: false,
    stateClose: false,
    has: false
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private utils: UtilsProvider
  ) {
  }

  ngOnInit() {
    if (this.navParams.data) {
      this.filter.search = this.navParams.data.filter.search;
      this.filter.stateOpen = this.navParams.data.filter.stateOpen;
      this.filter.stateProcessing = this.navParams.data.filter.stateProcessing;
      this.filter.stateClose = this.navParams.data.filter.stateClose;
      this.filter.has = this.navParams.data.filter.has;
    }
  }

  dismiss(clear) {
    if (clear == 'clear') {
      this.viewCtrl.dismiss(clear);
    } else {
      this.viewCtrl.dismiss(this.filter);
    }
  }
}