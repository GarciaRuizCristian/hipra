import { Injectable } from '@angular/core';
import { PartnerAbstractWeb } from '../models/partnerAbstractWeb';
import { PartnersWebProvider } from './partners-web-provider';
import { SapcrmWebProvider } from './sapcrm-web-provider';

@Injectable()
export class ContactsScrollWebProvider {

    actualPage: Array<PartnerAbstractWeb> = [];

    totalOfContacts: number = 0;

    currentPage: number = 0;
    maxPage: number = 0;
    minPage: number = 0;

    fromPartner: number;
    toPartner: number;
    pageSize: number;

    loadingPartners: boolean = true;

    cdRef;

    constructor(public sapcrmWebProvider: SapcrmWebProvider) {

    }

    //Funcion que carga los contactos, mediante paginacion
    public loadPartners(from: number, to: number, typePartner: string, contactFilter: string) {
        this.loadingPartners = true;
        this.fromPartner = from;
        this.toPartner = to;

        this.sapcrmWebProvider.syncPageOptimizedPartnersList(from, to, typePartner, contactFilter).then((partners) => {
            this.totalOfContacts = Number(partners.MAX_PARTNERS);
            this.maxPage = this.totalOfContacts % this.pageSize == 0 ? this.totalOfContacts / this.pageSize - 1 : Math.floor(this.totalOfContacts / this.pageSize);
            this.actualPage = partners.PARTNERS;
            this.loadingPartners = false;

            if (this.cdRef != null) {
                try {
                    this.cdRef.detectChanges();
                } catch (e) { }
            }
        }, (error) => {
            this.loadingPartners = false;
            console.log("WEB - ContactsScrollWebProvider - loadPartners(): " + JSON.stringify(error, null, 2));
        });
    }

    //Funcion que calcula el numero de contactos que entran en cada pagina, segun el tamanio de la ventana
    public setMaxHeight(height: number, width: number, cdRef, contactFilter: string) {
        this.cdRef = cdRef;

        let rows = Math.floor(height / 107);
        let cols = width < 494 ? 1 : width < 705 ? 2 : width < 880 ? 3 : 4;
        this.pageSize = rows * cols;

        this.loadPartners(1, this.pageSize, PartnersWebProvider.PARTNERS_NO_YE, contactFilter);
    }

    //Funcion que carga la siguiente pagina de contactos
    public moveToNextSlide(contactFilter: string) {
        if (this.currentPage == this.maxPage)
            return;

        this.currentPage++;
        this.loadPartners((this.toPartner + 1), (this.toPartner + this.pageSize), PartnersWebProvider.PARTNERS_NO_YE, contactFilter);
    }

    //Funcion que carga la anterior pagina de contactos
    public moveToPreviousSlide(contactFilter: string) {
        if (this.currentPage == this.minPage)
            return;

        this.currentPage--;
        this.loadPartners((this.fromPartner - this.pageSize), (this.fromPartner - 1), PartnersWebProvider.PARTNERS_NO_YE, contactFilter);
    }


    //Funcion que carga una determinada pagina de contactos
    public movePageRange(page: number, contactFilter: string) {
        this.currentPage = page;
        this.loadPartners(((this.pageSize * page) + 1), ((this.pageSize * page) + this.pageSize), PartnersWebProvider.PARTNERS_NO_YE, contactFilter);
    }
}
