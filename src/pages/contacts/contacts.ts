import { MapPage } from '../map/map';
import { LoaderProvider } from '../../providers/loader-provider';
import { Subscription } from 'rxjs/Rx';
import { FormControl } from '@angular/forms';
import { ContactPage } from '../contact/contact';
import { Component, ViewChild, ChangeDetectorRef, Inject, DoCheck, AfterContentChecked, ElementRef } from '@angular/core';
import {
  NavController,
  NavParams,
  PopoverController,
  ViewController,
  VirtualScroll,
  Content
} from 'ionic-angular';
import { Country } from '../../models/country';
import { TitleKey } from '../../models/titleKey';
import { Partner } from '../../models/partner';
import { PartnerAbstractWeb } from '../../models/partnerAbstractWeb';
import { SapcrmCacheProvider } from '../../providers/sapcrm-cache-provider';
import { SyncProvider } from '../../providers/sync-provider';
import { Searchbar, Events, ModalController, Card } from 'ionic-angular';
import { SelectSingleValue } from '../../components/select-single-value/select-single-value';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { PartnersProvider } from "../../providers/partners-provider";
import { PartnersWebProvider } from '../../providers/partners-web-provider';
import { ContactsScrollWebProvider } from "../../providers/contacts-scroll-web-provider";

/*
  Generated class for the Contacts page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html'
})
export class ContactsPage {
    
  titles: Array<TitleKey>;
  doingSync: boolean = false;
  pendingSync: boolean = false;
  filter: {
    search: string,
    has: boolean
  } = {
    search: "",
    has: false
  };
  eventSync: string;

  private searchField: FormControl;
  private subscription: Subscription;

  functionOnOrientation;

  valueRange: number = 1;

  @ViewChild("content") scroll_content: Content;
  
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public sapcrmCacheProvider: SapcrmCacheProvider,
              public syncProvider: SyncProvider, 
              private popoverCtrl: PopoverController,
              private ev: Events,
              public cdRef: ChangeDetectorRef, 
              private translate: TranslateService,
              public modalCtrl: ModalController,
              private partnersProvider: PartnersProvider,
              private loaderProvider: LoaderProvider,
              private contactsScrollWebProvider: ContactsScrollWebProvider,
  ) {
    this.syncProvider.pendingEmitter.subscribe((pending) => this.pendingSync = pending);
    this.syncProvider.doingEmitter.subscribe((doing) => this.doingSync = doing);
    this.ev.subscribe('eventSyncContact', modificado => {
      this.eventSync = modificado;
    });

    this.ev.subscribe('inputUpdated', (input) => {
      console.log(input);
      // user and time are the same arguments passed in `events.publish(user, time)`
      this.filter.search = input;
      this.filterApply();
    });

    this.ev.subscribe('popoverClosed', () => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      this.filterClear();
    });
  }

  ngOnInit() {
    this.searchField = new FormControl();
    this.subscription = this.searchField.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .filter((term: string) => term.length != 1)
      .subscribe(term => this.search(term));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    window.removeEventListener('orientationchange',this.functionOnOrientation);
  }

  ionViewDidLoad() {
    this.contactsScrollWebProvider.currentPage = 0;
    let maxHeight = window.innerHeight - 191;
    let maxWidth = window.innerWidth - 32;
    this.contactsScrollWebProvider.setMaxHeight(maxHeight, maxWidth, this.cdRef, this.filter.search);
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter ContactsPage');
    if (this.eventSync == "doSync") {//Intentamos sincronizar por si tenemos conexión
      this.refresh();
      this.eventSync = "";
    }
    this.loadPartnerTitles();

  }

  openMap() {
    this.loaderProvider.pushLoadingProcessCallback().then(() => {
      this.loaderProvider.popLoadingProcess();
      this.navCtrl.push(MapPage, {
        partner_markers: this.partnersProvider.PartnersForMap,
        location: true
      });
    });

  }

  loadContact(partnerId: string, partnerGuid: string) {
    this.loaderProvider.pushLoadingProcessCallback().then(
      () => {
    
        this.navCtrl.push(ContactPage, {
          id: partnerId,
          guid: partnerGuid
        });
        this.loaderProvider.popLoadingProcess();
      }
    );
    
  }

  loadNewContact() {
    this.translate.get('SelectTypePartner').subscribe(
      selectPartner => {
        let profileModal = this.modalCtrl.create(SelectSingleValue, {
          options: this.titles,
          key: "CLASSIFIC",
          label: "TEXT",
          showKey: false,
          title: selectPartner
        }, {
          enableBackdropDismiss: false
        });
        profileModal.onDidDismiss((value: string) => {
          if (value) {
            this.navCtrl.push(ContactPage, {
              operacion: value
            });
          }
        });
        profileModal.present();
      });
  }

  loadPartnerTitles() {
    return this.sapcrmCacheProvider.getFICClasses().then(
      (res: TitleKey[]) => {
        this.titles = res;
        this.titles.sort(function (a, b) {
          if (a.TEXT != undefined) {
            return a.TEXT.localeCompare(b.TEXT,"ca-ES");
          }
        });
      },
      (error) => {
        console.log(error);
      });
  }

  callPhone(partner: PartnerAbstractWeb, e) {
    this.translate.get('Cancel').subscribe(
      cancel => {
        this.translate.get('Agree').subscribe(
          agree => {
            this.translate.get('SelectNumberToCall').subscribe(
              selectNumberToCall => {
                let popover = this.popoverCtrl.create(CallView, {
                  numbers: partner.PHONE,
                }).present({
                  ev: e
                });
              }
            );
          }
        );
      }
    );
  }

  filterClear() {
    this.filter.search = "";
    this.filter.has = false;
    this.valueRange = 1;
    this.contactsScrollWebProvider.currentPage = 0;
    this.contactsScrollWebProvider.loadPartners(1, (this.contactsScrollWebProvider.pageSize), PartnersWebProvider.PARTNERS_NO_YE, this.filter.search);
  }

  filterApply() {
    if (this.filter.search) {
      this.filter.has = true;
    } else {
      this.filter.has = false;
    }
    this.valueRange = 1;
    this.contactsScrollWebProvider.currentPage = 0;
    this.contactsScrollWebProvider.loadPartners(1, (this.contactsScrollWebProvider.pageSize), PartnersWebProvider.PARTNERS_NO_YE, this.filter.search);
  }

  refresh(): Promise<void> {
    if (this.doingSync)
      return Promise.resolve();

    let end = () => {
      this.valueRange = 1;
      this.contactsScrollWebProvider.currentPage = 0;
      this.contactsScrollWebProvider.loadPartners(1, (this.contactsScrollWebProvider.pageSize), PartnersWebProvider.PARTNERS_NO_YE, this.filter.search);
    };

    return this.syncProvider.sync(false, true)
      .then(end)
      .catch(end);


  }

  search(term) {
    this.ev.publish('inputUpdated', term);
  }

  moveToPreviousSlide(){
    if( this.valueRange > 1 )
      this.valueRange--;
    this.contactsScrollWebProvider.moveToPreviousSlide(this.filter.search);
  }

  moveToNextSlide(){
    if( this.valueRange < this.contactsScrollWebProvider.maxPage + 1 )
      this.valueRange++;
    this.contactsScrollWebProvider.moveToNextSlide(this.filter.search);
  }

  movePageRange(page:number) {
    this.contactsScrollWebProvider.movePageRange(page, this.filter.search);

    if (this.cdRef != null) {
      try {
        this.cdRef.detectChanges();
      } catch (e) { }
    }
  }

}


@Component({
  template: `
  <div style="text-align:center">
    <a ion-button ion-button round *ngFor="let number of numbers" href="tel:{{number.TEL_NO}}">{{number.TEL_NO}}</a>
  </div>
  `

})
export class CallView {

  numbers: Array<String> = [];

  constructor(public navParams: NavParams) {
    this.numbers = this.navParams.get('numbers');
  }

}






