import { LoaderProvider } from '../../providers/loader-provider';
import { Day } from '../../models/day';
import { CalendarWebProvider } from '../../providers/calendar-web-provider';
import { Component, ChangeDetectorRef, Input, DoCheck, AfterContentChecked, HostListener  } from '@angular/core';
import { PopoverController, Events, ViewController, NavController, NavParams } from 'ionic-angular';
import { ActivityPage } from '../activity/activity';
import { AppSettings } from '../../config/app-settings';
import { SapcrmCacheProvider } from '../../providers/sapcrm-cache-provider';
import { SapcrmWebProvider } from '../../providers/sapcrm-web-provider';
import { UtilsProvider } from '../../providers/utils-provider';
import { SyncProvider } from '../../providers/sync-provider';
import { Partner } from '../../models/partner';
import { LoginProvider } from '../../providers/login-provider';
import { Activity } from '../../models/activity';
import { ActivityAbstract } from '../../models/activityAbstract';
import { OperationsClass } from '../../models/operations_class';
import { ModalController} from 'ionic-angular';
import { SelectSingleValue } from '../../components/select-single-value/select-single-value';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { FormControl } from '@angular/forms';
import { Subscription } from 'ionic-native/node_modules/rxjs/Subscription';
/*
  Generated class for the Activities page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-activities',
  templateUrl: 'activities.html'
})
export class ActivitiesPage {
  @HostListener('window:resize', ['$event'])
  onResize(event){
    console.log("ANCHO: " + event.target.innerWidth);
    if(event.target.innerWidth >= 576){ //ipad
      this.mondayOpened = true;
      this.tuesdayOpened = true;
      this.wednesdayOpened = true;
      this.thursdayOpened = true;
      this.fridayOpened = true;
      this.cdRef.detectChanges();
    }
  }
  
  @Input() formatDayHeader: string = 'E';
  @Input() formatDay: string = 'd';
  @Input() startingDayMonth: number = 1;
  @Input() startingDayWeek: number = 1;
  @Input() formatWeekViewDayHeader: string = 'E - d';

  userLogged: Partner;

  myDate: string;
  operations: Array<OperationsClass> = [];
  doingSync: boolean = false;
  pendingSync: boolean = false;

  isToday: boolean;
  viewTitle;
  calendar = {
    mode: 'week',
    queryMode: 'remote',
    currentDate: new Date()
  };

  activities: Array<ActivityAbstract>;
  filter: {
    startTime: any,
    endTime: any,
    search: string,
    abiertas: boolean,//status
    cerradas: boolean,//Status
    has: boolean
  } = {
    startTime: "",
    endTime: "",
    search: "",
    abiertas: false,
    cerradas: false,
    has: false
  };
  filterType: {
    tipoEvento: boolean,
    tipoLLamada: boolean,
    tipoRutaTarea: boolean,
    tipoVisitaComercial: boolean,
    tipoVisitaInstalaciones: boolean,
  } = {
    tipoEvento: false,
    tipoLLamada: false,
    tipoRutaTarea: false,
    tipoVisitaComercial: false,
    tipoVisitaInstalaciones: false,
  };
  eventSync: string;


  mondayOpened: boolean = false;
  tuesdayOpened: boolean = false;
  wednesdayOpened: boolean = false;
  thursdayOpened: boolean = false;
  fridayOpened: boolean = false;

  isMonthView = false;
  isWeekView = true;
  isDayView = false;

  loadingActivities = true;

  constructor(public cdRef: ChangeDetectorRef, 
              public navCtrl: NavController, 
              public navParams: NavParams,
              public sapcrmCacheProvider: SapcrmCacheProvider, 
              public syncProvider: SyncProvider, 
              public sapcrmWebProvider: SapcrmWebProvider, 
              private popoverCtrl: PopoverController, 
              private utils: UtilsProvider, 
              private translate: TranslateService, 
              private ev: Events, 
              public modalCtrl: ModalController,
              private calendarWebProvider: CalendarWebProvider,
              private loaderProvider: LoaderProvider, 
              private loginProvider: LoginProvider
  ) {

    
  }

  loadCacheData() {
    return Promise.all([
      this.loadOperationsClasses(),
    ]);
  }

  ionViewDidLoad() {
    this.calendarWebProvider.cdRef = this.cdRef;

    this.syncProvider.pendingEmitter.subscribe((pending) => this.pendingSync = pending);
    this.syncProvider.doingEmitter.subscribe((doing) => this.doingSync = doing);
    this.loadCacheData();

    if(window.innerWidth >= 576){ //ipad
      this.mondayOpened = true;
      this.tuesdayOpened = true;
      this.wednesdayOpened = true;
      this.thursdayOpened = true;
      this.fridayOpened = true;
    }

    this.ev.subscribe('eventSyncActivity', modificado => {
      this.eventSync = modificado;
    });

    this.ev.subscribe('filterUpdated', (filter, filterType) =>{     
      if (filter) {
        if (filter == 'clear') {
          this.filterClear();
        } else if (filterType) {
          this.filter.search = filter.search;
          this.filter.abiertas = filter.abiertas;
          this.filter.cerradas = filter.cerradas;
          this.filter.has = filter.has;

          this.filterType.tipoEvento = filterType.tipoEvento;
          this.filterType.tipoLLamada = filterType.tipoLLamada;
          this.filterType.tipoRutaTarea = filterType.tipoRutaTarea;
          this.filterType.tipoVisitaComercial = filterType.tipoVisitaComercial;
          this.filterType.tipoVisitaInstalaciones = filterType.tipoVisitaInstalaciones;
          this.filterApply();
        }
      }
    })

    this.loadUserLogged().then(() => {  
      this.calendarWebProvider.initializeWeekActivities();
      this.loadingActivities = false;
    });
  }

  ionViewDidEnter() {    

    if (this.eventSync == "doSync") {
      this.refresh();
      this.eventSync = "";
    }
  }

  ionViewWillLeave(){
    this.filterClear();
  }

  weekdayPressed(dayNumber: number){
    if(window.innerWidth >= 576){ //ipad
      switch (dayNumber){
        case 1: this.switchToDay(this.calendarWebProvider.CurrentWeek.Monday);
                break;
        case 2: this.switchToDay(this.calendarWebProvider.CurrentWeek.Tuesday);
                break;
        case 3: this.switchToDay(this.calendarWebProvider.CurrentWeek.Wednesday);
                break;
        case 4: this.switchToDay(this.calendarWebProvider.CurrentWeek.Thursday);
                break;
        case 5: this.switchToDay(this.calendarWebProvider.CurrentWeek.Friday);
                break;
      }
    }else if(window.innerWidth <= 575){ //iphone
      switch (dayNumber){
        case 1: this.mondayOpened = ! this.mondayOpened;
                break;
        case 2: this.tuesdayOpened = ! this.tuesdayOpened;
                break;
        case 3: this.wednesdayOpened = ! this.wednesdayOpened;
                break;
        case 4: this.thursdayOpened = ! this.thursdayOpened;
                break;
        case 5: this.fridayOpened = ! this.fridayOpened;
                break;
      }      
    }
  }

  switchToDay(day: Day){
    this.isMonthView = false;
    this.isWeekView = false;
    this.isDayView = true;

    this.calendarWebProvider.setCurrentDay(day);
    this.cdRef.detectChanges();
  }

  switchToWeek(){
    this.isMonthView = false;
    this.isWeekView = true;
    this.isDayView = false;

    this.calendarWebProvider.setCurrentWeek(this.calendarWebProvider.getCurrentDay());
    this.calendarWebProvider.initializeWeekActivities();
  }

  switchToMonth(){

    let wasWeekView = this.isWeekView;

    this.isMonthView = true;
    this.isWeekView = false;
    this.isDayView = false;

    if(wasWeekView)
      this.calendarWebProvider.setCurrentMonthFromWeek(this.calendarWebProvider.getCurrentWeek());
    else
      this.calendarWebProvider.setCurrentMonthFromDay(this.calendarWebProvider.getCurrentDay());

    this.calendarWebProvider.initializeMonthActivities();
  }

  goToToday(){
    this.calendarWebProvider.moveToCurrentDay();
    if(this.isDayView)
      this.calendarWebProvider.initializeDayActivities();    
    else if(this.isWeekView)
      this.calendarWebProvider.initializeWeekActivities(); 
    else if(this.isMonthView)
      this.calendarWebProvider.initializeMonthActivities(); 
  }

  refresh(): Promise<void> {
    if (this.doingSync)
      return Promise.resolve();

    let end = () => {
          if(this.isWeekView)
            this.calendarWebProvider.initializeWeekActivities();
          else if (this.isMonthView)
            this.calendarWebProvider.initializeMonthActivities();
          else this.calendarWebProvider.initializeDayActivities();
    };

    return this.syncProvider.sync(false, true)
      .then(end)
      .catch(end);
  }

  isInWeek(a: ActivityAbstract){

  }

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

  filterClear() {
    this.filter.search = "";
    this.filter.abiertas = false;
    this.filter.cerradas = false;
    this.filter.has = false;

    this.filterType.tipoEvento = false;
    this.filterType.tipoLLamada = false;
    this.filterType.tipoRutaTarea = false;
    this.filterType.tipoVisitaComercial = false;
    this.filterType.tipoVisitaInstalaciones = false;

    this.calendarWebProvider.removeFilter();
    if(this.isDayView){
      this.calendarWebProvider.initializeDayActivities();
    }
    else if(this.isWeekView){
      this.calendarWebProvider.initializeWeekActivities();
    }
    else{
      this.calendarWebProvider.initializeMonthActivities();
    }
  }

  filterApply() {
    if (this.filter.search || !this.filter.abiertas || !this.filter.cerradas
      || !this.filterType.tipoEvento || !this.filterType.tipoLLamada
      || !this.filterType.tipoRutaTarea || !this.filterType.tipoVisitaComercial
      || !this.filterType.tipoVisitaInstalaciones) {
      this.filter.has = true;
    } else {
      this.filter.has = false;
    }

    this.calendarWebProvider.setFilter(this.filter.search,this.filter.abiertas,this.filter.cerradas, this.filterType.tipoEvento, this.filterType.tipoLLamada, this.filterType.tipoRutaTarea, this.filterType.tipoVisitaComercial, this.filterType.tipoVisitaInstalaciones);
    if(this.isDayView){
      this.calendarWebProvider.initializeDayActivities();
    }
    else if(this.isWeekView){
      this.calendarWebProvider.initializeWeekActivities();
    }
    else{
      this.calendarWebProvider.initializeMonthActivities();
    }

  }

  loadActivity(activityGuid: string) {
    this.loaderProvider.pushLoadingProcessCallback().then(
      () => {
        this.navCtrl.push(ActivityPage, {
          guid: activityGuid
        });
        this.loaderProvider.popLoadingProcess();
      });
  }

  getActivityContact(activity: ActivityAbstract){
    for(let partner of activity.PARTNERS){
      if(partner.PARTNER_FCT == "00000009")
        {
          return partner.FULLNAME;
        }
    }
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
            this.navCtrl.push(ActivityPage, {
              operacion: value
            });
          }
        });
        profileModal.present();
      });

  }

  loadUserLogged(): Promise<void> {
    if (!this.calendarWebProvider.getUserLogged()) {
      return this.sapcrmWebProvider.syncOptimizedPartner('', this.loginProvider.user.idPartner, '').then((partner) => {
        this.userLogged = partner; //Usuario registrado
        this.calendarWebProvider.setUserLogged(this.userLogged);
      },
      (error) => {
        console.log(error);
      });
    } else 
      return Promise.resolve();
  }

  loadOperationsClasses() {
    return this.sapcrmCacheProvider.getOperationClasses().then(
      (res: OperationsClass[]) => {
        for (let operation of res) {
          if (operation.PROCESS_TYPE != AppSettings.ORDER_TYPE_OPPORTUNITY && operation.PROCESS_TYPE != AppSettings.ORDER_TYPE_SALES) {
            this.operations.push(operation);
          }
        }
        console.log("Test");
      },
      (error) => {
        console.log(error);
      });
  }

  /////////CALENDAR STUFFF

  updateActivitiesEventSources() {
    let events = [];

    for (let actividad of this.activities) {
      let startTime = new Date(actividad.DATETIME_FROM);
      let endTime = new Date(actividad.DATETIME_TO-1000);
      let allDays = false;
      let process = this.utils.getProcessType(actividad, this.operations);

      //Comparo el rango de fecha con el fin de mi actividad
      if (this.calendar.mode != 'day') {
        if (actividad.DATETIME_TO - actividad.DATETIME_FROM >= 86400000) {
          allDays = true;
        }
      } else {//Estoy en la vista del dia
        if (actividad.DATETIME_TO - this.filter.startTime >= 86400000) {
          allDays = true;
        }
      }

      events.push({
        title: actividad.DESCRIPTION,
        id: actividad.ACTIVITY_ID,
        created_by: actividad.CREATED_BY,
        state: actividad.STATE,
        processType: process,
        startTime: startTime,
        endTime: endTime,
        allDay: allDays
      });
    }

    return events;
  }

  onRangeChanged(ev: { startTime: Date, endTime: Date }) {

    let startTime = ev.startTime.getTime();
    let endTime = ev.endTime.getTime();
    this.filter.startTime = startTime;
    this.filter.endTime = endTime;
  };

  onViewTitleChanged(title) {
    this.viewTitle = title;

    //Need to refresh the date when the calendar mode is different from month
    if (this.calendar.mode != 'month') {
      let date = new Date(this.filter.startTime);
      this.myDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    }
  }

  onEventSelected(event) {
    this.loadActivity(event.id);
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  }

  changeMode(mode) {
    this.calendar.mode = mode;
    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }
  }

  today() {
    this.calendar.currentDate = new Date();
    try {
      this.cdRef.detectChanges();
    } catch (err) {
      console.log("error en el detectChanges");
    }
  }

  //No the same days for all the months
  changeDay(ev) {
    let today = new Date();
    today.setFullYear(ev.year.value);
    today.setMonth(ev.month.value - 1);
    today.setDate(ev.day.value);
    this.calendar.currentDate = new Date(today);
  }

  getStringDay(title) {
    let day = "";
    if (this.calendar.mode == 'day') {
      let dateDay = title.split(" ");
      day = dateDay[1];
      return day.substring(0, day.length - 1);
    } else {
      return day;
    }
  }

  //Método que indica en que fecha estamos
  onTimeSelected(ev) {
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);

    this.myDate = ev.selectedTime.getFullYear() + "-" + ("0" + (ev.selectedTime.getMonth() + 1)).slice(-2) + "-" + ("0" + ev.selectedTime.getDate()).slice(-2);

  }

  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }


  markDisabled = (date: Date) => {
    var current = new Date();
    current.setHours(0, 0, 0);
    return date < current;
  };

  getActivitiesCount(view, row, col, open) {
    let cont = 0;
    if (this.activities) {
      let statusMode;

      let fechaDia = view.dates[row * 7 + col].date;

      fechaDia.setHours(0);
      fechaDia.setMinutes(0);
      fechaDia.setSeconds(0);


      for (let activity of this.activities) {
        for (let status of activity.STATUS_TAB) {

          if (status.USER_STAT_PROC == 'CRMACTIV') {
            if (open) {//ACTIVIDADES ABIERTAS normales
              statusMode = AppSettings.ACTIVITY_OPEN_STATUSES;
            } else {//ACTIVIDADES CERRADAS normales
              statusMode = AppSettings.ACTIVITY_CLOSED_STATUSES;
            }
          } else if (status.USER_STAT_PROC == 'ZEVENTO2') {
            if (open) {//ACTIVIDADES ABIERTAS de evento
              statusMode = AppSettings.ACTIVITY_EVENT_OPEN_STATUSES;
            } else {//ACTIVIDADES CERRADAS de evento
              statusMode = AppSettings.ACTIVITY_EVENT_CLOSED_STATUSES;
            }
          }

          if ((status.USER_STAT_PROC != '') && statusMode.indexOf(status.STATUS) != -1) {
            if (activity.DATETIME_TO >= fechaDia.getTime() && activity.DATETIME_FROM <= fechaDia.getTime() + 86399999) {
              cont++;
            }
          }

        }
      }
      return cont;
    }

  }

  //FILTRO DE ACTIVIDADES
  activitiesFilter(ev) {

    let popover = this.popoverCtrl.create(ActivitiesFilterPage, {
      filter: this.filter,
      filterType: this.filterType
    });

    popover.present({
      ev: ev
    });

    popover.onDidDismiss((filter, filterType) => {
      if (filter) {
        if (filter == 'clear') {
          this.filterClear();
        } else if (filterType) {
          this.filter.search = filter.search;
          this.filter.abiertas = filter.abiertas;
          this.filter.cerradas = filter.cerradas;
          this.filter.has = filter.has;

          this.filterType.tipoEvento = filterType.tipoEvento;
          this.filterType.tipoLLamada = filterType.tipoLLamada;
          this.filterType.tipoRutaTarea = filterType.tipoRutaTarea;
          this.filterType.tipoVisitaComercial = filterType.tipoVisitaComercial;
          this.filterType.tipoVisitaInstalaciones = filterType.tipoVisitaInstalaciones;
          this.filterApply();
        }
      }
    })
  }

}

@Component({
  template: `
    <ion-item-group>
      <ion-item-divider color="verde" text-center>{{ 'Filter' | translate }}</ion-item-divider>
    </ion-item-group>

    <ion-searchbar [(ngModel)]="filter.search" [formControl]="searchField" style="padding-top:10px;padding-bottom:10px;"></ion-searchbar>

    <ion-item-group>
      <ion-item-divider color="light">{{ 'Status' | translate }}</ion-item-divider>
      <ion-item>
        <ion-label>{{ 'StatesOpen' | translate }}</ion-label>
        <ion-toggle [(ngModel)]="filter.abiertas" (ionChange) = changeOpenFilter($event)></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label>{{ 'StatesClose' | translate }}</ion-label>
        <ion-toggle [(ngModel)]="filter.cerradas" (ionChange) = changeClosedFilter($event)></ion-toggle>
      </ion-item>
    </ion-item-group>
    <ion-item-group>
      <ion-item-divider color="light">{{ 'Type' | translate }}</ion-item-divider>
      <ion-item>
        <ion-label>{{ 'Event' | translate }}</ion-label>
        <ion-toggle [(ngModel)]="filterType.tipoEvento" (ionChange) = updateFilter()></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label>{{ 'CallPhone' | translate }}</ion-label>
        <ion-toggle [(ngModel)]="filterType.tipoLLamada" (ionChange) = updateFilter()></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label>{{ 'TaskRoute' | translate }}</ion-label>
        <ion-toggle [(ngModel)]="filterType.tipoRutaTarea" (ionChange) = updateFilter()></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label>{{ 'CommercialVisit' | translate }}</ion-label>
        <ion-toggle [(ngModel)]="filterType.tipoVisitaComercial" (ionChange) = updateFilter()></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label>{{ 'InstallationVisit' | translate }}</ion-label>
        <ion-toggle [(ngModel)]="filterType.tipoVisitaInstalaciones" (ionChange) = updateFilter()></ion-toggle>
      </ion-item>
    </ion-item-group>
<!--
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
  </ion-toolbar>-->`
})
export class ActivitiesFilterPage {
  filter: {
    search: string,
    abiertas: boolean,//status
    cerradas: boolean,//Status
    has: boolean
  } = {
    search: "",
    abiertas: false,
    cerradas: false,
    has: false
  };
  filterType: {
    tipoEvento: boolean,
    tipoLLamada: boolean,
    tipoRutaTarea: boolean,
    tipoVisitaComercial: boolean,
    tipoVisitaInstalaciones: boolean,
  } = {
    tipoEvento: false,
    tipoLLamada: false,
    tipoRutaTarea: false,
    tipoVisitaComercial: false,
    tipoVisitaInstalaciones: false,
  };

  searchField: FormControl;
  subscription: Subscription;
  
  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public sapcrmCacheProvider: SapcrmCacheProvider,
              public viewCtrl: ViewController, 
              public ev: Events, 
              private utils: UtilsProvider) {

  }

  ngOnInit() {
    if (this.navParams.data) {
      this.filter.search = this.navParams.data.filter.search;
      this.filter.abiertas = this.navParams.data.filter.abiertas;
      this.filter.cerradas = this.navParams.data.filter.cerradas;
      this.filter.has = this.navParams.data.filter.has;


      this.filterType.tipoEvento = this.navParams.data.filterType.tipoEvento;
      this.filterType.tipoLLamada = this.navParams.data.filterType.tipoLLamada;
      this.filterType.tipoRutaTarea = this.navParams.data.filterType.tipoRutaTarea;
      this.filterType.tipoVisitaComercial = this.navParams.data.filterType.tipoVisitaComercial;
      this.filterType.tipoVisitaInstalaciones = this.navParams.data.filterType.tipoVisitaInstalaciones;
    }

    this.searchField = new FormControl();
    this.subscription = this.searchField.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .filter((term: string) => term.length != 1)
      .subscribe(term => this.updateFilter());
  }

  ionViewWillLeave(){
    this.subscription.unsubscribe();
    // if (!this.filter.abiertas && !this.filter.cerradas && !this.filterType.tipoEvento && !this.filterType.tipoLLamada && !this.filterType.tipoRutaTarea && !this.filterType.tipoVisitaComercial && !this.filterType.tipoVisitaInstalaciones && this.filter.search == "") {
    //   this.viewCtrl.dismiss('clear');
    // }
  }

  changeOpenFilter(){   
    this.updateFilter();
  }

  changeClosedFilter(){
    this.updateFilter();
  }


  updateFilter(){   
    this.ev.publish('filterUpdated',this.filter, this.filterType);
  }

  dismiss(clear) {
    
  }

}
