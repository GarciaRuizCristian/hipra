import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ViewController, NavParams, NavController, AlertController } from 'ionic-angular';
import { PartnerAbstract } from '../../models/partnerAbstract';
import { ProductAbstract } from '../../models/productAbstract';
import { SapcrmProvider } from '../../providers/sapcrm-provider';
import { Events } from 'ionic-angular';
import * as jsPDF from 'jspdf';

declare var window: any;

@Component({
  selector: 'pdf-alert-modal',
  templateUrl: 'pdf-alert-modal.html',
})
export class pdfAlertModal {
  pdfUrl : String;
  checks = {
    checkDatos: true,
    checkSolicitante: true,
    checkDestinatario: true,
    checkDistribuidor: true,
    checkResponsable: true,
    checkProductos: true,
    checkNotas: true,
    checkFirma: true
  }
  constructor(public navCtrl: NavController, public params: NavParams, public viewCtrl: ViewController, 
    private alertCtrl: AlertController,
    public ev: Events){
     
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResumeView');
    this.pdfUrl = this.params.get('pdfUrl');
   }

   dismiss(action) {
      this.viewCtrl.dismiss();   
  } 

  previewPDF(){
     this.ev.publish('previewPDF', this.checks);
     this.viewCtrl.dismiss();  
  }

  sendPDF(){     
    this.viewCtrl.dismiss();  
  }

}