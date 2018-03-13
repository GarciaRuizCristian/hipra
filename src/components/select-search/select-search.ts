import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController, AlertController } from 'ionic-angular';
import { SelectSearchModal } from './select-search-modal';

@Component({
  selector: 'select-search',
  templateUrl: 'select-search.html'
})
export class SelectSearchComponent implements OnChanges, OnInit {
  @Input() val: any;
  @Output() valChange = new EventEmitter<string>();
  @Output() onChange = new EventEmitter<string>();

  //O se indican todas las opciones
  @Input() options?:any[];

  //O se indican el metodo para otbenerlas por query y por key
  @Input() optionsByQueryFn?: Function;
  @Input() optionByKeyFn?: Function;

  @Input() key: string = "key";
  @Input() label: string = "label";
  @Input() showKey: string = "true";
  @Input() allowEmpty: string = "true";
  @Input() title: string = "Seleccione...";
  @Input() required: boolean = false;
  @Input() submitAttempt: boolean = false;
  @Input() alertMessage: string = "";

  optionSelected: any = {};

  constructor(
    public modalCtrl: ModalController,
    public alertCtrl: AlertController) {
  }

  ngOnInit() {
    this.updateOptionSelected();
  }

  ngOnChanges(changes: SimpleChanges) {
    
    for (let propName in changes) {
      if (propName == "options") {
        if (!Array.isArray(changes[propName].currentValue)) {
          let newOptions = [];
          for (let key in changes[propName].currentValue) {
            let option = {};
            option[this.key] = key;
            option[this.label] = changes[propName].currentValue[key];
            newOptions.push(option);
          }
          this.options = newOptions;
        }
        //console.log("SelectSearchComponent ngOnChanges options: "+JSON.stringify(this.options));     
        this.updateOptionSelected();     
      } else if (propName == "val") {
        this.updateOptionSelected();
      }
     
    }
    
  }

  openModal() {
    if (this.alertMessage) {
      let alert = this.alertCtrl.create({
        title: 'Aviso',
        message: this.alertMessage,
        buttons: ['Aceptar']
      });
      alert.present();
    } else {
      let profileModal = this.modalCtrl.create(SelectSearchModal, {
        val: this.val,
        options: this.options,
        optionsByQueryFn: this.optionsByQueryFn,
        key: this.key,
        label: this.label,
        showKey: this.showKey,
        allowEmpty: this.allowEmpty,
        title: this.title
      }, {
        enableBackdropDismiss: false
      });
      profileModal.onDidDismiss(indexSelected => {
        if (indexSelected) {
          this.updateVal(indexSelected);
          this.submitAttempt = true;
        }
      });
      profileModal.present();
    }
  }

  updateVal(indexSelected) {   
    if(this.optionSelected.PARTNER_FCT){
      this.val.PARTNER_FCT = this.optionSelected.PARTNER_FCT;
    }   
    this.optionSelected = {};
    this.optionSelected[this.key] = "";
    this.optionSelected[this.label] = "";
    if (this.options && this.options.length) this.optionSelected = this.options[indexSelected];         
  
    this.valChange.emit(this.options[indexSelected]);
    this.onChange.emit(this.options[indexSelected]);
    this.updateOptionSelected();
  }

  updateOptionSelected() {
    if(this.optionSelected.PARTNER_FCT){
      this.val.PARTNER_FCT = this.optionSelected.PARTNER_FCT;
    }
    if (this.options) {
      this.optionSelected = {};
      this.optionSelected[this.key] = "";
      this.optionSelected[this.label] = "";
      if (this.options && this.options.length) {
        for (let i = 0; i < this.options.length; i++) {
          if (this.options[i][this.key] == this.val) {
            this.optionSelected = this.options[i];
            break;
          }
        }
      }
    } else if (this.optionsByQueryFn) {
      console.log("updateOptionSelected");
      
      this.optionSelected = {};
      this.optionSelected[this.key] = "";
      this.optionSelected[this.label] = "";
      if (this.val) {      
         this.optionSelected = this.val;        
      }
    }
  }

}