import { Injectable } from '@angular/core';
import { PartnerAbstract } from "../models/partnerAbstract";
import { SapcrmProvider } from './sapcrm-provider';
import { AppSettings } from '../config/app-settings';

@Injectable()
export class PartnersProvider {

    public PartnersNoYE: Array<{ PARTNER: string, NAME: string }> = [];
    public PartnersNoYENoContactPersonNoPre: Array<{ PARTNER: string, NAME: string, RELATIONS: Array<any> }> = [];
    public ContactPersons: Array<{ PARTNER: string, NAME: string }> = [];
    public Prescriptors: Array<{ PARTNER: string, NAME: string }> = [];
    public PartnersForMap: Array<any> = [];

    private totalOfPartners = 0;
    private totalOfPages = 0;
    private totalOfLoadedPartners = AppSettings.MAX_CONTACTS_LOADED;

    public PartnersLoaded: boolean = false;

    constructor(public sapcrmProvider: SapcrmProvider) {

    }

    public setPartners(sortedPartners: Array<PartnerAbstract>) {
        this.loadPartnersNoYE(sortedPartners);
        this.loadContactPersons(sortedPartners);
        this.loadPrescriptors(sortedPartners);
        this.loadPartnersNoYENoContactPersonNoPre(sortedPartners);
        this.preparePartnersForMap(sortedPartners);
    }

    public startLoadingPartners(totalOfPartners: number) {
        if(this.PartnersLoaded)
            return;

        this.PartnersLoaded = true;
        this.PartnersForMap = [];
        this.PartnersNoYE = [];
        this.PartnersNoYENoContactPersonNoPre = [];
        this.ContactPersons = [];
        this.Prescriptors = [];
        this.totalOfPartners = totalOfPartners;
        this.totalOfPages = Math.floor(this.totalOfPartners / this.totalOfLoadedPartners) + 1;
        this.loadPartners(0);
    }

    private loadPartners(page: number) {
        if (page < this.totalOfPages) {
            this.sapcrmProvider.getPartnerAbstracts("GRP <> ?", ["YE"], page, this.totalOfLoadedPartners).then(
                partners => {
                    for (let partner of partners) {
                        this.PartnersNoYE.push({ NAME: partner.NAME, PARTNER: partner.PARTNER });
                        this.PartnersForMap.push({
                            latitude: partner.LATITUDE,
                            longitude: partner.LONGITUDE,
                            partner_name: partner.NAME,
                            partner_address: partner.ADDRESS
                        });
                        if (partner.CLASSIFIC == '09')
                            this.Prescriptors.push({ NAME: partner.NAME, PARTNER: partner.PARTNER });
                        else if (partner.CLASSIFIC == '10')
                            this.ContactPersons.push({ NAME: partner.NAME, PARTNER: partner.PARTNER });
                        else //if(partner.CLASSIFIC != '10' && partner.CLASSIFIC != "09")
                            this.PartnersNoYENoContactPersonNoPre.push({ NAME: partner.NAME, PARTNER: partner.PARTNER, RELATIONS: partner.RELATIONS })
                    }
                    this.PartnersNoYE = this.PartnersNoYE.sort((a, b) => {
                        return a.NAME.localeCompare(b.NAME, "ca-ES");
                    });
                    this.Prescriptors = this.Prescriptors.sort((a, b) => {
                        return a.NAME.localeCompare(b.NAME, "ca-ES");
                    });
                    this.ContactPersons = this.ContactPersons.sort((a, b) => {
                        return a.NAME.localeCompare(b.NAME, "ca-ES");
                    });
                    this.PartnersNoYENoContactPersonNoPre = this.PartnersNoYENoContactPersonNoPre.sort((a, b) => {
                        return a.NAME.localeCompare(b.NAME, "ca-ES");
                    });
                    this.loadPartners(page + 1);
                }
            );
        }
    }

    private loadPartnersNoYENoContactPersonNoPre(sortedPartners: Array<PartnerAbstract>) {
        this.PartnersNoYENoContactPersonNoPre = [];
        for (let person of sortedPartners) {
            if (person.CLASSIFIC != '10' && person.CLASSIFIC != '09') {
                this.PartnersNoYENoContactPersonNoPre.push({ NAME: person.NAME, PARTNER: person.PARTNER, RELATIONS: person.RELATIONS });
            }
        }
    }

    private preparePartnersForMap(sortedPartners: Array<PartnerAbstract>) {
        this.PartnersForMap = [];
        for (let partner of sortedPartners) {
            if (partner.LATITUDE != null && partner.LONGITUDE != null) {
                this.PartnersForMap.push({
                    latitude: partner.LATITUDE,
                    longitude: partner.LONGITUDE,
                    partner_name: partner.NAME,
                    partner_address: partner.ADDRESS
                })
            }
        }
    }

    private loadPartnersNoYE(sortedPartners: Array<PartnerAbstract>): void {
        this.PartnersNoYE = [];
        for (let partner of sortedPartners) {
            this.PartnersNoYE.push({ NAME: partner.NAME, PARTNER: partner.PARTNER });
        }
    }

    private loadContactPersons(sortedPartners: Array<PartnerAbstract>) {
        this.ContactPersons = [];
        for (let person of sortedPartners) {
            if (person.CLASSIFIC == '10') {
                this.ContactPersons.push({ NAME: person.NAME, PARTNER: person.PARTNER });
            }
        }
    }

    private loadPrescriptors(sortedPartners: Array<PartnerAbstract>) {
        this.Prescriptors = [];
        for (let person of sortedPartners) {
            if (person.CLASSIFIC == '09') {
                this.Prescriptors.push({ NAME: person.NAME, PARTNER: person.PARTNER });
            }
        }
    }

}
