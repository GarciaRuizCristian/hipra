// TODO /// <reference path="../../plugins/cordova-plugin-mfp/typings/worklight.d.ts" />
/// <reference path="../../node_modules/ibm-mfp-web-sdk/lib/typings/ibmmfpf.d.ts" />




import { GeocoderProvider } from '../providers/geocoder-provider';
import { MapPage } from '../pages/map/map';
import { CalendarWebProvider } from '../providers/calendar-web-provider';
import { NgModule, ErrorHandler, LOCALE_ID } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ActivitiesPage } from '../pages/activities/activities';
import { ActivitiesFilterPage } from '../pages/activities/activities';
import { ActivityPage } from '../pages/activity/activity';
import { ContactPage } from '../pages/contact/contact';
import { AlertProvider } from '../providers/alert-provider';
import { CallView, ContactsPage } from '../pages/contacts/contacts';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { HelpPage } from '../pages/help/help';
import { LoginPage } from '../pages/login/login';
import { OrderPage } from '../pages/order/order';
import { showPartnerDataMinimizedPage } from '../pages/order/order';
import { OrdersPage } from '../pages/orders/orders';
import { OrdersFilterPage } from '../pages/orders/orders';
import { SettingsPage } from '../pages/settings/settings';
import { LoadingPage } from '../pages/loading/loading';
import { SapcrmCacheProvider } from '../providers/sapcrm-cache-provider';
import { SapcrmProvider } from '../providers/sapcrm-provider';
import { SapcrmWebProvider } from '../providers/sapcrm-web-provider';
import { LoginProvider } from '../providers/login-provider';
import { UtilsProvider } from '../providers/utils-provider';
import { EnumProvider } from '../providers/enum-provider';
import { QueueProvider } from '../providers/queue-provider';
import { IonicStorageModule } from '@ionic/storage';
import { GoogleAnalytics } from 'ionic-native';
import { Http } from '@angular/http';
import { SQLite } from '@ionic-native/sqlite';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { SelectSearchComponent } from '../components/select-search/select-search';
import { SelectSearchModal } from '../components/select-search/select-search-modal';
import { SelectSearchModalWeb } from '../components/select-search/select-search-modal-web';
import { SelectMultipleModal } from '../components/select-multiple-modal/select-multiple-modal';
import { SelectSingleValue } from '../components/select-single-value/select-single-value';
import { Autosize } from 'ionic2-autosize';
import { SyncProvider } from '../providers/sync-provider';
import { AngularSignaturePad } from '../components/angular-signature-pad/angular-signature-pad';
import { DBProvider } from '../providers/DB-provider';
import { clickOutsideZoneDirective } from  '../directives/clickOutsideZone.directive';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { pdfViewModal } from '../components/pdf-view-modal/pdf-view-modal';
import { pdfAlertModal } from '../components/pdf-alert-modal/pdf-alert-modal';
import { SocialSharing } from '@ionic-native/social-sharing';
import { LoaderProvider } from '../providers/loader-provider';
import { FillNoteModal } from '../components/fill-note-modal/fill-note-modal';
import { SelectRelationModal } from '../components/select-relation-modal/select-relation-modal';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { PartnersProvider } from "../providers/partners-provider";
import { PartnersWebProvider } from "../providers/partners-web-provider";
import { PartnersOrderProvider } from "../providers/partners-order-provider";
import { FillActivityNoteModal } from "../components/fill-activity-note-modal/fill-activity-note-modal";
import { RelationsProvider } from "../providers/relations-provider";
import { ContactsScrollProvider } from "../providers/contacts-scroll-provider";
import { ContactsScrollWebProvider } from "../providers/contacts-scroll-web-provider";
import { OrdersScrollProvider } from "../providers/orders-scroll-provider";
import { OrdersScrollWebProvider } from "../providers/orders-scroll-web-provider";
import { SwipeVerticalDirective } from "../directives/swipe-vertical-directive";
import { TimeZoneProvider } from "../providers/timeZone-provider";
import { QueuePage } from '../pages/queue/queue';



@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ActivitiesPage,
    ActivityPage,
    ActivitiesFilterPage,
    ContactPage,
    ContactsPage,
    DashboardPage,
    HelpPage,
    LoginPage,
    OrderPage,
    showPartnerDataMinimizedPage,
    OrdersPage,
    OrdersFilterPage,
    SettingsPage,
    LoadingPage,
    SelectSearchComponent,
    SelectSearchModal,
    SelectSearchModalWeb,
    AngularSignaturePad,
    SelectMultipleModal,
    SelectSingleValue,
    clickOutsideZoneDirective,
    PdfViewerComponent,
    pdfViewModal,
    pdfAlertModal,
    FillNoteModal,
    SelectRelationModal,
    MapPage,
    QueuePage,
    CallView,
    FillActivityNoteModal,
    SwipeVerticalDirective
  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      pageTransition: 'md-transition',
      mode: 'ios'
    }),
    //this is for the DB of ionic
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ActivitiesPage,
    ActivityPage,
    ActivitiesFilterPage,
    ContactPage,
    ContactsPage,
    DashboardPage,
    HelpPage,
    LoginPage,
    LoadingPage,
    OrderPage,
    showPartnerDataMinimizedPage,
    OrdersPage,
    OrdersFilterPage,
    SettingsPage,
    SelectSearchModal,
    SelectSearchModalWeb,
    AngularSignaturePad,
    SelectMultipleModal,
    SelectSingleValue,
    pdfViewModal,
    pdfAlertModal,
    FillNoteModal,
    SelectRelationModal,
    MapPage,
    CallView,
    QueuePage,
    FillActivityNoteModal
  ],


  providers: [SQLite, ContactsScrollProvider, OrdersScrollProvider, OrdersScrollWebProvider, CalendarWebProvider, RelationsProvider, PartnersProvider, PartnersOrderProvider, TimeZoneProvider, GoogleMaps,GoogleAnalytics, Geolocation, GeocoderProvider, UtilsProvider, LoginProvider, AlertProvider,
    SapcrmProvider, SapcrmWebProvider, SapcrmCacheProvider, SyncProvider, QueueProvider, ContactsScrollWebProvider, PartnersWebProvider,
    EnumProvider, DBProvider ,  SocialSharing, LoaderProvider , { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: LOCALE_ID, useValue: navigator.language }]

})
export class AppModule { }

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}