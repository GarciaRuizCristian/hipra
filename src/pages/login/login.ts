import { TranslateService } from 'ng2-translate/src/translate.service';
import { AlertProvider } from '../../providers/alert-provider';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LoginProvider } from '../../providers/login-provider';
import { UtilsProvider } from '../../providers/utils-provider';
/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  errorMsg: string = ""; 
  username: string = "";
  password: string = "";
  rememberMe: boolean = true;

  constructor(public loginProvider: LoginProvider, public navCtrl: NavController, public navParams: NavParams
      , private utils: UtilsProvider,
      private alertProvider: AlertProvider,
      private translate: TranslateService
  ) {
    this.loginProvider.handleFailureEmitter.subscribe((error) => {
      //this.utils.setLoadingCount(0);
      this.utils.hideLoading();
      this.errorMsg = error ? error : "Unexpected error";
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    this.errorMsg = "";
  }

  login() {
    this.utils.showLoading();
    if(this.username != "" && this.password != ""){
      this.loginProvider.login(this.username, this.password, this.rememberMe);
    }else{
      this.translate.get("UserPasswordEmptyErrorTitle").toPromise().then(
        title => {
          this.translate.get("UserPasswordEmptyErrorMessage").toPromise().then(
            message => {
              this.utils.hideLoading();                    
              this.alertProvider.presentUserPasswordEmptyError(title, message);
            }
          )
        }
      )
    }
  }

  passwordForgotten(){
    alert("No implementado");
  }

}
