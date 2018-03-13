import { Component, Renderer, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar, Splashscreen, GoogleAnalytics } from 'ionic-native';
import { AppVersion } from 'ionic-native';
//import { AboutPage } from '../pages/about/about';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { ActivitiesPage } from '../pages/activities/activities';
import { ContactsPage } from '../pages/contacts/contacts';
import { ContactPage } from '../pages/contact/contact';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { HelpPage } from '../pages/help/help';
import { LoginPage } from '../pages/login/login';
import { OrdersPage } from '../pages/orders/orders';
import { SettingsPage } from '../pages/settings/settings';
import { LoadingPage } from '../pages/loading/loading';
import { Storage } from '@ionic/storage';
import { ENV } from '../config/environment.dev';
import { LoginUser, LoginProvider } from '../providers/login-provider';
import { AppSettings } from '../config/app-settings';
import { SapcrmProvider } from '../providers/sapcrm-provider';
import { UtilsProvider } from '../providers/utils-provider';
import { SyncProvider } from '../providers/sync-provider';
import { DBProvider } from '../providers/DB-provider';
import { QueueProvider } from '../providers/queue-provider';
import { QueuePage } from '../pages/queue/queue';

declare var cordova;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoadingPage;
  user: LoginUser;
  pages: Array<{ title: string, icon: string, section: number, component: any, authorizationGroup?: string }>;
  currentPage: string;
  pendingSync: boolean = false;
  mustSync: boolean = false;

  constructor(public platform: Platform, private storage: Storage, public renderer: Renderer
    , private syncProvider: SyncProvider
    , public googleAnalytics: GoogleAnalytics
    , public loginProvider: LoginProvider
    , public translate: TranslateService
    , private alertCtrl: AlertController
    , private sapcrmProvider: SapcrmProvider
    , private utils: UtilsProvider
    , private dbProvider: DBProvider
    , public cdRef: ChangeDetectorRef,
    public queueProvider: QueueProvider
  ) {
      

    this.initializeApp();  

    this.user = this.loginProvider.user;
    this.loginProvider.userChangeEmitter.subscribe((user: LoginUser) => {
      this.user = user;
    });

    this.syncProvider.pendingEmitter.subscribe((pending) => {
      this.pendingSync = pending;
    });

    // used for an example of ngFor and navigation
    this.pages = [
      //{ title: 'Dashboard', icon: 'apps', section: 0, component: DashboardPage },
      { title: 'Contacts', icon: 'contacts', section: 0, component: ContactsPage },
      { title: 'Activities', icon: 'calendar', section: 0, component: ActivitiesPage },
      { title: 'Orders', icon: 'paper', section: 0, component: OrdersPage, authorizationGroup: "VV" },
      { title: 'Settings', icon: 'settings', section: 1, component: SettingsPage },
      { title: 'Help', icon: 'help', section: 1, component: HelpPage }
    ];

  }

  initializeApp() {
     var mfpInitProperties = {
      'connectOnStartup': true,
      'mfpContextRoot': '/mfp', //http://localhost:9080/mfp' ,
      'applicationId': 'com.hipra.test' //'com.hipra.crm',    
    };
    
    WL.Client.init(mfpInitProperties);

    //TODO only 4 cordova mfp plugin: this.renderer.listenGlobal('document', 'mfpjsloaded', () => {
    this.whenWLReady(() => {
      this.platform.ready().then(() => {

        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        console.log(`Api environment is ${ENV.NAME}`);
        console.log("Browser Language: " + this.translate.getBrowserLang());
        this.translate.setDefaultLang(this.translate.getBrowserLang());
        this.translate.use(this.translate.getDefaultLang());
        this.utils.showLoading();

        StatusBar.styleDefault();
        if (ENV.DEBUG) {
          GoogleAnalytics.debugMode();
        }
        GoogleAnalytics.startTrackerWithId(AppSettings.GOOGLE_ANALYTICS_ID)
          .then(() => AppVersion.getVersionNumber())
          .then((version) => GoogleAnalytics.setAppVersion(version))
          .then(() => GoogleAnalytics.enableUncaughtExceptionReporting(true))
          .then(() => console.log('OK GoogleAnalytics'))
          .catch(e => console.log('Error GoogleAnalytics', e));

        return this.storage.ready();
      })
        .then(() =>
          this.dbProvider.createDB(AppSettings.DATABASE_NAME,AppSettings.STORES)
        )
        .then(() =>
          this.loginProvider.init()
        )
        .then((user: LoginUser) => {
          console.log("loginProvider.init resolved");
          this.user = user;
          console.log("Platform Language: " + navigator.language);
          let language = navigator.language.split('-');
          this.translate.use(language[0]);
          if (language[0] == "es" || language[0] == "ca" || language[0] == "eu" || language[0] == "gl") {
            this.loginProvider.setLang("S");
          } else if (language[0] == "en") {
            this.loginProvider.setLang("E");
          } else if (language[0] == "de") {
            this.loginProvider.setLang("D");
          } else if (language[0] == "pt") {
            this.loginProvider.setLang("P");
          }
          if (this.user.logged) {
            let lastUserId = localStorage.getItem("lastLoggedUser");
            console.log("Set last user = " + this.user.id);
            localStorage.setItem("lastLoggedUser", this.user.id);
            //Si no es el mismo usuario que el ultimo que se logo borramos la base de datos
            if (lastUserId != this.user.id) {
              this.mustSync = true;
              console.log("Last user is " + lastUserId + " and new user is " + this.user.id);
              return this.clearDataBase();
            }
          }
        })
        .then(() => {
          if (this.user.logged) {
            return this.syncProvider.sync(this.mustSync);
          }
        })
        .then(() =>
          this.finishInitializeApp()
        )
        .catch((error) => { //OnError
          this.utils.showToast(error);
          this.finishInitializeApp();
        });
    });
  }
 

  handlerOnSuccess(): Promise<any>{
    return new Promise((resolve, reject)  => {
        resolve(resolve);
    });

  }

  whenWLReady = (fn) => {
    if (eval("WL.AsyncDAO")) {
      console.log("WLReady");
      fn();
    } else {
      console.log("waiting whenWLReady...");
      setTimeout(() => this.whenWLReady(fn), 20);
    }

  }
  
  clearDataBase(): Promise<any> {
   
    return Promise.all([
       /*
      this.sapcrmProvider.removeDataBase(),
       */
      this.storage.clear()
    ]).then(() => this.loginProvider.setCurrentStoredUser());
   
  }

  finishInitializeApp() {
    this.utils.hideLoading();
    Splashscreen.hide();
    
    this.openPage(this.user.logged ? ContactsPage : LoginPage)
    
    
  }

  openPage(pageComponent) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(pageComponent);
    this.currentPage = pageComponent;
  }

  openQueuePage() {
    this.nav.setRoot(QueuePage);
    this.currentPage = "QueuePage";
  }


}
