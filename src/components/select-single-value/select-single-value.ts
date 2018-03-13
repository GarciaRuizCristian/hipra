import { LoaderProvider } from '../../providers/loader-provider';
import { Subscription } from 'rxjs/Rx';
import { FormControl } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'select-single-value',
  templateUrl: 'select-single-value.html'
})
export class SelectSingleValue implements OnInit {
  val: string = "";
  options: any[];
  filteredOptions: any[];
  key: string = "key";
  label: string = "label";
  showKey: string = "true";
  title: string;

  loaded = false;

  private searchField: FormControl;
  private subscription: Subscription;

  constructor(public cdRef: ChangeDetectorRef, public viewCtrl: ViewController, params: NavParams, private loaderProvider: LoaderProvider) {

    this.options = params.get("options");
    this.key = params.get("key");
    this.label = params.get("label");
    this.showKey = params.get("showKey");
    this.title = params.get("title");
    this.filteredOptions = this.options;
  }

  dismiss() {
    if (this.loaded) {
      this.viewCtrl.dismiss(this.val);
    }
  }

  ngOnInit() {

    setTimeout(() =>
      this.loaded = true
      , 300);

    this.searchField = new FormControl();
    this.subscription = this.searchField.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(term => this.search(term));

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  search(term) {
    this.loaderProvider.pushLoadingProcess();
    this.filteredOptions = [];
    for (let option of this.options) {
      if (this.getCleanedString(option[this.label]).includes(term.toLowerCase()))
        this.filteredOptions.push(option);
    }
    this.loaderProvider.popLoadingProcess();
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