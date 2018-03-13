import { LoaderProvider } from '../../providers/loader-provider';
import { Subscription } from 'rxjs/Rx';
import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { PartnersWebProvider } from "../../providers/partners-web-provider";

@Component({
    selector: 'select-search-modal-web',
    templateUrl: 'select-search-modal-web.html'
})
export class SelectSearchModalWeb implements OnInit {
    val?: string = "";
    defaultOption?: string = "";
    options?: any[];
    maxOptions?: number;
    maxFilteredOptions?: number;
    typeOption?: string;
    filteredOptions: any[];
    shownFilteredOptions: any[] = [];
    key?: string = "key";
    label?: string = "label";
    showKey?: string = "true";
    allowEmpty?: string = "true";
    title?: string;
    index?: number;

    filter: string = "";

    currentShownItems: number = 0;

    allOptionsLoaded: boolean = false;
    firstSearch: boolean = false;
    loadingSearchedOptions: boolean = false;
    loadingOptions: boolean = false;

    private searchField: FormControl;
    private subscription: Subscription;

    constructor(public viewCtrl: ViewController,
        params: NavParams,
        private loaderProvider: LoaderProvider,
        private partnersWebProvider: PartnersWebProvider) {
        this.val = params.get("val");
        this.defaultOption = params.get("defaultOption");
        this.options = params.get("options");
        this.maxOptions = params.get("maxOptions");
        this.maxFilteredOptions = this.maxOptions;
        this.typeOption = params.get("typeOption");
        this.key = params.get("key");
        this.label = params.get("label");
        this.showKey = params.get("showKey");
        this.allowEmpty = params.get("allowEmpty");
        this.title = params.get("title");
        this.index = params.get("index");
        this.filteredOptions = this.options;
        this.allOptionsLoaded = (this.options.length == this.maxOptions) ? true : false;
        this.pushShownItems();
    }

    pushShownItems() {
        return new Promise((resolve, reject) => {
            let supposedEnd = this.currentShownItems + 14;
            while (this.currentShownItems < supposedEnd && this.currentShownItems < this.filteredOptions.length) {
                this.shownFilteredOptions.push(this.filteredOptions[this.currentShownItems]);
                this.currentShownItems++;
            }

            if (this.firstSearch && this.maxFilteredOptions == 0) this.maxFilteredOptions++; //Caso 0: si se encontraron 0 opciones en la primera busqueda, se suma uno al total de encontrados para poder cargar las primeras opciones
            if (!this.loadingOptions && !this.allOptionsLoaded &&
                this.currentShownItems == this.filteredOptions.length && this.filteredOptions.length < this.maxFilteredOptions) {
                this.loadingOptions = true;
                this.partnersWebProvider.loadPartners((this.filteredOptions.length + 1), (this.filteredOptions.length + PartnersWebProvider.PAGE_SIZE), this.typeOption, this.filter).then((partners) => {
                    this.maxFilteredOptions = Number(partners.MAX_PARTNERS);
                    this.filteredOptions = this.filteredOptions.concat(partners.PARTNERS);
                    this.options = this.filteredOptions;
                    this.allOptionsLoaded = (this.options.length == this.maxOptions) ? true : false;
                    this.firstSearch = false;
                    this.loadingOptions = false;
                    this.pushShownItems();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    doInfinite(infiniteScroll) {
        setTimeout(() => {
            this.pushShownItems().then(() => {
                infiniteScroll.complete();
            });
        }, 10);
    }

    dismiss(indexSelected) {

        if (indexSelected != null) 
            this.viewCtrl.dismiss(this.filteredOptions[indexSelected]);
        else
            this.viewCtrl.dismiss(null);
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
        this.filter = term;
        this.filteredOptions = [];
        this.shownFilteredOptions = [];
        this.currentShownItems = 0;
        this.firstSearch = true;
        this.loadingSearchedOptions = true;

        if (this.allOptionsLoaded) {
            for (let option of this.options) {
                if (this.getCleanedString(option[this.label]).includes(term.toLowerCase()))
                    this.filteredOptions.push(option);
            }
        }
        this.pushShownItems().then(() => {
            this.loadingSearchedOptions = false;
        });
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