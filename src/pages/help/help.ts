import { Component } from '@angular/core';
import { UtilsProvider } from '../../providers/utils-provider';
import { SapcrmProvider } from '../../providers/sapcrm-provider';
import { LoginProvider } from '../../providers/login-provider';
import { Partner } from '../../models/partner';

/*
  Generated class for the Help page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-help',
  templateUrl: 'help.html'
})
export class HelpPage {
  userLoged: Partner;

  constructor(public loginProvider: LoginProvider, public sapcrmProvider: SapcrmProvider,
    private utils: UtilsProvider) {
    this.sapcrmProvider.getPartners("USER=?", [this.loginProvider.user.id.toUpperCase()], undefined).then((partners: Partner[]) => {
      if (partners.length) {
        this.userLoged = partners[0]; //Usuario registrado
      }
    },
      (error) => {
        this.utils.showToast(error);
      }
    );
   }

   goToWiki() {
    if (this.userLoged.DATA_ADDRESS.COUNTRY == 'BR')
      window.location.href="https://apps.ce.collabserv.com/communities/service/html/communityview?communityUuid=23e8bef2-2d9b-4c21-8ac2-426b067faeaf#fullpageWidgetId=Wf2f0a28c7f25_4ded_adb9_b895e57a6887&file=8e341ce0-97eb-4f03-acb8-1c231331d525";
    else
      window.location.href="https://apps.ce.collabserv.com/wikis/home?lang=es-es#!/wiki/We0e8309b40d1_4359_9242_ba49e226e45f";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelpPage');
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter HelpPage');
  }
}
