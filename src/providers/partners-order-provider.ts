import { Injectable } from '@angular/core';
import { Partner } from "../models/partner";
import { SapcrmProvider } from "./sapcrm-provider";
import { PartnerAbstract } from "../models/partnerAbstract";

@Injectable()
export class PartnersOrderProvider {
    public PartnersNoYENoContactPerson: Array<Partner> = [];
    public PartnersYXYYYZ: Array<Partner> = [];
    public PartnersDistributor: Array<Partner> = [];

    constructor(private sapcrmProvider: SapcrmProvider) {

    }

    public loadPartnersOrderOrden() {
        this.sapcrmProvider.getPartners(null, null, null, null).then(
            res => {
                let sortedPartners = res.sort((a, b) => {
                    return a.CENTRAL_ORGAN.NAME1.localeCompare(b.CENTRAL_ORGAN.NAME1,"ca-ES");
                });
                this.loadPartnersYXYYYZ(sortedPartners);
            });
    }

    public loadPartnersYXYYYZ(partners: Array<Partner>) {
        this.PartnersYXYYYZ=[];
        for (let person of partners) {
            if (person.GROUP == "YX" || person.GROUP == "YY" || person.GROUP == "YZ") {
                person["NAME"] = person.CENTRAL_ORGAN.NAME1;
                this.PartnersYXYYYZ.push(person);
            }
        }
        // console.log("PartnersYXYYYZ: " + JSON.stringify(this.PartnersYXYYYZ));
    }



    public loadPartnersOrderOpportunity() {
        let whereClause = "GRP <> ?";
        let whereValues = ['YE'];
        this.sapcrmProvider.getPartners(whereClause, whereValues, null, null).then(
            res => {
                let sortedPartners = res.sort((a, b) => {
                    return a.CENTRAL_ORGAN.NAME1.localeCompare(b.CENTRAL_ORGAN.NAME1,"ca-ES");
                });
                this.loadPartnersNoYENoContactPerson(sortedPartners);
            });
    }

    public loadPartnersNoYENoContactPerson(partners: Array<Partner>) {
        this.PartnersNoYENoContactPerson=[];
        for (let person of partners) {
            if (person.CLASSIFIC.CLASSIFIC != '10') {
                person["NAME"] = person.CENTRAL_ORGAN.NAME1;
                this.PartnersNoYENoContactPerson.push(person);
            }
        }
        // console.log("PartnersNoYENoContactPerson: " + JSON.stringify(this.PartnersNoYENoContactPerson));
    }



    public loadPartnersOrder() {
        this.sapcrmProvider.getPartners(null, null, null, null).then(
            res => {
                let sortedPartners = res.sort((a, b) => {
                    return a.CENTRAL_ORGAN.NAME1.localeCompare(b.CENTRAL_ORGAN.NAME1,"ca-ES");
                });
                this.loadPartnersDistributor(sortedPartners);
            });
    }

    public loadPartnersDistributor(partners: Array<Partner>) {
        this.PartnersDistributor=[];
        for (let person of partners) {
            if (person.CLASSIFIC.CLASSIFIC == '01' || person.CLASSIFIC.CLASSIFIC == '02' || person.CLASSIFIC.CLASSIFIC == '11'){
                person["NAME"] = person.CENTRAL_ORGAN.NAME1;
                this.PartnersDistributor.push(person);
            }
        }
        // console.log("PartnersDistributor: " + JSON.stringify(this.PartnersDistributor));
    }
}