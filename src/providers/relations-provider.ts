import { Injectable } from '@angular/core';
import { Partner } from "../models/partner";
import { SapcrmProvider } from "./sapcrm-provider";
import { PartnerAbstract } from "../models/partnerAbstract";
import { ReTypes } from "../models/reTypes";
import { SapcrmCacheProvider } from "./sapcrm-cache-provider";

@Injectable()
export class RelationsProvider {

    public RelationsForPrescriptor: Array<ReTypes>;
    public RelationsForContactPerson: Array<ReTypes>;
    public RelationsForOthers: Array<ReTypes>

    constructor(private sapcrmCacheProvider: SapcrmCacheProvider) {
        this.loadRelations();
    }

    private loadRelations() {
        this.sapcrmCacheProvider.getReTypes().then(
            (res: ReTypes[]) => {
                this.loadRelationsForContactPerson(res);
                this.loadRelationsForOthers(res);
                this.loadRelationsForPrescriptor(res);
            });
    }

    public loadRelationsForPrescriptor(relations: Array<ReTypes>): void {
        this.RelationsForPrescriptor = [];
        for (let relation of relations) {
            if (relation.RELTYP == "YVET01") {
                this.RelationsForPrescriptor.push(relation);
                break;
            }
        }
    }

    public loadRelationsForContactPerson(relations: Array<ReTypes>): void {
        this.RelationsForContactPerson = [];
        for (let relation of relations) {
            if (relation.RELTYP == "WUR001") {
                this.RelationsForContactPerson.push(relation);
                break;
            }
        }
    }

    public loadRelationsForOthers(relations: Array<ReTypes>): void {
        this.RelationsForOthers = [];
        for (let relation of relations) {
            if (relation.RELTYP != "YVET01" && relation.RELTYP != "WUR001") {
                this.RelationsForOthers.push(relation);
            }
        }
        this.RelationsForOthers.sort((a,b) => {
            return a.BEZ50.localeCompare(b.BEZ50,"ca-ES");
        });

    }



}
