import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ViewController, NavParams, NavController } from 'ionic-angular';
import { PartnerAbstract } from '../../models/partnerAbstract';
import { ProductAbstract } from '../../models/productAbstract';
import { SapcrmProvider } from '../../providers/sapcrm-provider';
import { Events } from 'ionic-angular';

declare var window: any;

@Component({
  selector: 'pdf-view-modal',
  templateUrl: 'pdf-view-modal.html',
})
export class pdfViewModal {
  pdfUrl : String;
  deviceInformation: any;
  constructor(public navCtrl: NavController, public params: NavParams, public viewCtrl: ViewController, public ev: Events){
     this.deviceInformation = window.cordova.platformId;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResumeView');
    this.pdfUrl = this.params.get('pdfUrl');
   }

   dismiss(action) {
      this.viewCtrl.dismiss();   
  } 

  download(){
      this.ev.publish('downloadPDF');
  }

  sendPDF(){    
      this.ev.publish('sendPDF');          
  }

}