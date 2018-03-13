import { LoaderProvider } from '../../providers/loader-provider';
import { Subscription } from 'rxjs/Rx';
import { FormControl } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'select-search-modal',
  templateUrl: 'select-search-modal.html'
})
export class SelectSearchModal implements OnInit {
  val?: string = "";
  defaultOption?: string = "";
  options?: any[];
  filteredOptions: any[];
  shownFilteredOptions: any[] = [];
  key?: string = "key";
  label?: string = "label";
  showKey?: string = "true";
  allowEmpty?: string = "true";
  title?: string;
  index?: number;

  loaded = false;
  searchQuery: string = "";

  currentShownItems: number = 0;

  private searchField: FormControl;
  private subscription: Subscription;

  constructor(public cdRef: ChangeDetectorRef, public viewCtrl: ViewController, params: NavParams, private loaderProvider: LoaderProvider) {
    this.val = params.get("val");
    this.defaultOption = params.get("defaultOption");
    this.options = params.get("options");
    this.key = params.get("key");
    this.label = params.get("label");
    this.showKey = params.get("showKey");
    this.allowEmpty = params.get("allowEmpty");
    this.title = params.get("title");
    this.index = params.get("index");
    this.filteredOptions = this.options;
    this.pushShownItems();
  }

  pushShownItems(){
    let supposedEnd = this.currentShownItems + 14;
    while(this.currentShownItems < supposedEnd && this.currentShownItems < this.filteredOptions.length){
      this.shownFilteredOptions.push(this.filteredOptions[this.currentShownItems]);
      this.currentShownItems++;
    }
  }

  doInfinite(infiniteScroll) {

    setTimeout(() => {
      this.pushShownItems();

      infiniteScroll.complete();
    }, 10);
  }

  dismiss(indexSelected) {

    if(indexSelected != null){
      let correctIndex = 0;
      for (let option of this.options) {
        if (option[this.key] == this.filteredOptions[indexSelected][this.key]){
          break;
        }
        correctIndex++;
      }
      this.viewCtrl.dismiss(correctIndex);
    }
    else{
      this.viewCtrl.dismiss(indexSelected);
    }

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
  }

  search(term) {
    this.filteredOptions = [];
    this.shownFilteredOptions = [];
    this.currentShownItems = 0;
    for (let option of this.options) {
      if (this.getCleanedString(option[this.label]).includes(term.toLowerCase()))
        this.filteredOptions.push(option);
    }
    this.pushShownItems();
  }

  getCleanedString(cadena: string): string {
    // Definimos los caracteres que queremos eliminar
    var specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.";

    // Los eliminamos todos
    for (var i = 0; i < specialChars.length; i++) {
      cadena = cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
    }

    cadena = cadena.toLowerCase();

    // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
    cadena = cadena.replace(/á/gi, "a");
    cadena = cadena.replace(/é/gi, "e");
    cadena = cadena.replace(/í/gi, "i");
    cadena = cadena.replace(/ó/gi, "o");
    cadena = cadena.replace(/ú/gi, "u");
    cadena = cadena.replace(/à/gi, "a");
    cadena = cadena.replace(/è/gi, "e");
    cadena = cadena.replace(/ì/gi, "i");
    cadena = cadena.replace(/ò/gi, "o");
    cadena = cadena.replace(/ù/gi, "u");
    cadena = cadena.replace(/â/gi, "a");
    cadena = cadena.replace(/ê/gi, "e");
    cadena = cadena.replace(/î/gi, "i");
    cadena = cadena.replace(/ô/gi, "o");
    cadena = cadena.replace(/û/gi, "u");
    cadena = cadena.replace(/ã/gi, "a");
    cadena = cadena.replace(/õ/gi, "o");
    return cadena;
  }

}