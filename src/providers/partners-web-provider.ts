import { Injectable } from '@angular/core';
import { PartnersWeb } from '../models/partnersWeb';
import { SapcrmWebProvider } from './sapcrm-web-provider';

@Injectable()
export class PartnersWebProvider {

    public static PARTNERS_NO_YE = 'P';
    public static PARTNERS_NO_YE_NO_CONTACT_PERSON_NO_PRESCRIPTOR = 'R';
    public static PARTNERS_NO_YE_CONTACT_PERSON = 'C';
    public static PARTNERS_NO_YE_PRESCRIPTOR = 'S';
    public static PARTNERS_YX_YY_YZ = 'T';
    public static PARTNERS_NO_YE_NO_CONTACT_PERSON = 'O';
    public static PARTNERS_DISTRIBUTOR = 'D';
    public static PARTNERS_YE = 'E';
    public static PAGE_SIZE = 300;

    constructor(public sapcrmWebProvider: SapcrmWebProvider) {

    }

    //Funcion que carga los contactos, mediante paginacion
    public loadPartners(from: number, to: number, typePartner: string, contactFilter: string): Promise<PartnersWeb> {
        return this.sapcrmWebProvider.syncPageOptimizedPartnersList(from, to, typePartner, contactFilter).then((partners) => {
            return partners;
        }, (error) => {
            console.log("WEB - PartnersWebProvider - loadPartners(): " + error);
            return {MAX_PARTNERS: "", PARTNERS: []};
        });
    }
}
