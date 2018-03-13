import { Injectable, Input } from '@angular/core';
import { PartnerAbstract } from "../models/partnerAbstract";
import { SapcrmProvider } from "./sapcrm-provider";
import { Platform } from 'ionic-angular';
import { PartnersProvider } from './partners-provider';
import { AppSettings } from '../config/app-settings';

@Injectable()
export class ContactsScrollProvider {

    actualPage: Array<PartnerAbstract> = [];

    TotalOfContactsUnchanged: number = 0;
    TotalOfContacts: number = 0;
    TotalOfFilteredContacts: number = 0;

    loadingPartners: boolean = true;
    currentPage: number = 0;

    TotalOfLoadedContacts: number = AppSettings.MAX_CONTACTS_LOADED;//144 1152;

    pageLoadedFrom: number;
    pageLoadedTo: number;
    pageDistanceCovered: number;

    pageFilteredLoadedFrom: number;
    pageFilteredLoadedTo: number;
    pageFilteredDistanceCovered: number;

    whereClause = "";
    whereValues = [];

    currentPaginationNumber: number = 0;
    currentFilteredPaginationNumber: number = 0;

    maxPage: number = 0;
    minPage: number = 0;

    pageSize: number = 12;

    allPartners: Array<PartnerAbstract> = [];
    allPartnersFiltered: Array<PartnerAbstract> = [];

    rangeFilter: {
        search: string,
        has: boolean
    } = {
            search: "",
            has: false
        }

    cdRef;

    constructor(
        private sapcrmProvider: SapcrmProvider,
        public platform: Platform,
        private partnersProvider: PartnersProvider
    ) {
        this.whereClause += "GRP <> ?";
        this.whereValues.push("YE");
    }

    setMaxHeight(height: number, width: number, filter, cdRef?) {
        let rows;
        if (this.platform.is('iphone'))
            rows = Math.floor(height / 86);
        else
            rows = Math.floor(height / 137);
        let cols = width < 494 ? 1 : width < 705 ? 2 : width < 880 ? 3 : 4;
        this.pageSize = rows * cols;

        if (cdRef != null)
            this.cdRef = cdRef;

        this.rangeFilter = filter;
        if (this.rangeFilter.has) {
            if (this.TotalOfFilteredContacts <= this.TotalOfLoadedContacts)
                this.setCurrentFilteredPartnersPages(this.rangeFilter, 0);
            else {
                if (this.currentFilteredPaginationNumber == 0)
                    this.setCurrentFilteredPartnersPages(this.rangeFilter, 0);
                else {
                    this.currentFilteredPaginationNumber = 0;
                    this.loadFilteredPartners(0).then(
                        () => this.setCurrentFilteredPartnersPages(this.rangeFilter, 0)
                    );
                }
            }
        }
        else if (this.allPartners.length <= 0) {
            this.loadTotalOfPartners();
            this.loadPartners(0).then(
                () => this.setCurrentPartnersPages(0)
            );
        } else {
            this.TotalOfContacts = this.TotalOfContactsUnchanged;
            if (this.currentPaginationNumber == 0)
                this.setCurrentPartnersPages(0);
            else {
                this.currentPaginationNumber = 0;
                this.loadPartners(0).then(
                    () => this.setCurrentPartnersPages(0)
                );
            }
        }
    }

    setCurrentPartnersPages(page?: number) {

        //this.TotalOfContacts = this.allPartners.length; 
        this.maxPage = this.TotalOfContacts % this.pageSize == 0 ? this.TotalOfContacts / this.pageSize - 1 : Math.floor(this.TotalOfContacts / this.pageSize);

        this.actualPage = [];

        if (page != null)
            this.currentPage = page;

        for (let i = this.currentPage % (this.TotalOfLoadedContacts / this.pageSize) * this.pageSize; i < (this.currentPage % (this.TotalOfLoadedContacts / this.pageSize) + 1) * this.pageSize; i++) {
            if (i >= this.allPartners.length) {
                this.loadingPartners = false;
                break;
            }
            this.actualPage.push(this.allPartners[i]);
        }

        this.loadingPartners = false;

        if (this.cdRef != null) {
            try {
                this.cdRef.detectChanges();
            } catch (e) { }
        }

    }

    setFilter(filter) {
        this.allPartnersFiltered = [];

        if (filter.search == "") {
            this.TotalOfContacts = this.TotalOfContactsUnchanged;
            //this.maxPage = this.TotalOfContacts % this.pageSize == 0 ? this.TotalOfContacts / this.pageSize - 1 : Math.floor(this.TotalOfContacts / this.pageSize);
            if (this.currentPaginationNumber == 0) {
                this.TotalOfContacts = this.TotalOfContactsUnchanged;
                this.setCurrentPartnersPages(0);
            } else {
                this.TotalOfContacts = this.TotalOfContactsUnchanged;
                this.currentPaginationNumber = 0;
                this.loadPartners(0).then(
                    () => this.setCurrentPartnersPages(0)
                );
            }
            return;
        }

        if (this.TotalOfContactsUnchanged <= this.TotalOfLoadedContacts) {
            this.pageFilteredLoadedFrom = 0;
            this.pageFilteredDistanceCovered = this.pageDistanceCovered;
            this.pageFilteredLoadedTo = this.pageLoadedTo;

            if (filter.search != "") {
                for (let partner of this.allPartners) {
                    if (partner.NAME.toUpperCase().indexOf(filter.search.toUpperCase()) >= 0 || partner.ADDRESS.toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                        this.allPartnersFiltered.push(partner);
                }
                this.TotalOfFilteredContacts = this.allPartnersFiltered.length;
                this.setCurrentFilteredPartnersPages(filter, 0);
            }
        } else {
            this.currentFilteredPaginationNumber = 0;
            this.loadTotalOfFilteredPartners();
            this.loadFilteredPartners(0).then(
                () => this.setCurrentFilteredPartnersPages(filter, 0)
            );
        }
    }

    setCurrentFilteredPartnersPages(filter, page?: number) {

        this.TotalOfContacts = this.TotalOfFilteredContacts;
        this.maxPage = this.TotalOfContacts % this.pageSize == 0 ? this.TotalOfContacts / this.pageSize - 1 : Math.floor(this.TotalOfContacts / this.pageSize);

        this.actualPage = [];

        if (page != null)
            this.currentPage = page;

        for (let i = this.currentPage % (this.TotalOfLoadedContacts / this.pageSize) * this.pageSize; i < (this.currentPage % (this.TotalOfLoadedContacts / this.pageSize) + 1) * this.pageSize; i++) {
            if (i >= this.allPartnersFiltered.length) {
                this.loadingPartners = false;
                break;
            }
            this.actualPage.push(this.allPartnersFiltered[i]);
        }

        this.loadingPartners = false;

        if (this.cdRef != null) {
            try {
                this.cdRef.detectChanges();
            } catch (e) { }
        }

    }

    public moveToNextSlide() {
        if (this.currentPage == this.maxPage)
            return;
        if (this.rangeFilter.has) {
            if (this.TotalOfFilteredContacts <= this.TotalOfLoadedContacts)
                this.setCurrentFilteredPartnersPages(this.rangeFilter, this.currentPage + 1);
            else {
                if (this.currentPage + 1 <= this.pageFilteredLoadedTo)
                    this.setCurrentFilteredPartnersPages(this.rangeFilter, this.currentPage + 1);
                else {
                    this.currentFilteredPaginationNumber++;
                    this.loadFilteredPartners(this.currentFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredPartnersPages(this.rangeFilter, this.currentPage + 1)
                    );
                }
            }
        } else {
            if (this.currentPage + 1 <= this.pageLoadedTo)
                this.setCurrentPartnersPages(this.currentPage + 1);
            else {
                this.currentPaginationNumber++;
                this.loadPartners(this.currentPaginationNumber).then(
                    () => this.setCurrentPartnersPages(this.currentPage + 1)
                );
            }
        }
    }

    public moveToPreviousSlide() {
        if (this.currentPage == this.minPage)
            return;
        if (this.rangeFilter.has) {
            if (this.TotalOfFilteredContacts <= this.TotalOfLoadedContacts)
                this.setCurrentFilteredPartnersPages(this.rangeFilter, this.currentPage - 1);
            else {
                if (this.currentPage - 1 >= this.pageFilteredLoadedFrom)
                    this.setCurrentFilteredPartnersPages(this.rangeFilter, this.currentPage - 1);
                else {
                    this.currentFilteredPaginationNumber--;
                    this.loadFilteredPartners(this.currentFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredPartnersPages(this.rangeFilter, this.currentPage - 1)
                    );
                }
            }
        } else {
            if (this.currentPage - 1 >= this.pageLoadedFrom)
                this.setCurrentPartnersPages(this.currentPage - 1);
            else {
                this.currentPaginationNumber--;
                this.loadPartners(this.currentPaginationNumber).then(
                    () => this.setCurrentPartnersPages(this.currentPage - 1)
                );
            }
        }
    }

    public movePageRange(page: number) {
        if (this.rangeFilter.has) {
            if (this.TotalOfFilteredContacts <= this.TotalOfLoadedContacts)
                this.setCurrentFilteredPartnersPages(this.rangeFilter, page);
            else {
                if (page >= this.pageFilteredLoadedFrom && page <= this.pageFilteredLoadedTo)
                    this.setCurrentFilteredPartnersPages(this.rangeFilter, page);
                else {
                    this.currentFilteredPaginationNumber = Math.floor(page / this.pageFilteredDistanceCovered);
                    this.loadFilteredPartners(this.currentFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredPartnersPages(this.rangeFilter, page)
                    );
                }
            }
        } else {
            if (page >= this.pageLoadedFrom && page <= this.pageLoadedTo)
                this.setCurrentPartnersPages(page);
            else {
                this.currentPaginationNumber = Math.floor(page / this.pageDistanceCovered);
                this.loadPartners(this.currentPaginationNumber).then(
                    () => this.setCurrentPartnersPages(page)
                );
            }
        }
    }

    public loadTotalOfPartners() {
        return this.sapcrmProvider.getPartnersCount(AppSettings.STORE_CONFIG_PARTNERS, this.whereClause, this.whereValues).then(
            res => {
                this.TotalOfContacts = res;
                this.TotalOfContactsUnchanged = res;
            }
        );
    }

    public loadTotalOfFilteredPartners() {
        let whereClause = "GRP <> ? AND NAME LIKE ?";
        let whereValues = [];
        whereValues.push("YE");
        whereValues.push("%" + this.rangeFilter.search + "%");

        return this.sapcrmProvider.getPartnersCount(AppSettings.STORE_CONFIG_PARTNERS, whereClause, whereValues).then(
            res => {
                this.TotalOfFilteredContacts = res;
            }
        );
    }

    public loadPartners(page: number, filter?, refreshView?: boolean): Promise<void> {
        this.loadingPartners = true;
        return this.sapcrmProvider.getPartnerAbstracts(this.whereClause, this.whereValues, this.currentPaginationNumber, this.TotalOfLoadedContacts, "NAME", 'NOCASE').then(
            res => {
                res = res.sort((a, b) => {
                    return a.NAME.localeCompare(b.NAME, "ca-ES");
                });
                this.allPartners = res;
                this.pageLoadedFrom = page * this.TotalOfLoadedContacts / this.pageSize;
                this.pageLoadedTo = this.pageLoadedFrom + this.TotalOfLoadedContacts / this.pageSize - 1;
                this.pageDistanceCovered = this.pageLoadedTo - this.pageLoadedFrom + 1;

                // TODO this.partnersProvider.setPartners(res);
                if(this.TotalOfContactsUnchanged <= this.TotalOfLoadedContacts){
                    this.partnersProvider.setPartners(res);
                } else {
                    this.partnersProvider.startLoadingPartners(this.TotalOfContactsUnchanged);
                }
            }
        );
    }

    public loadFilteredPartners(page: number, filter?, refreshView?: boolean): Promise<void> {
        this.loadingPartners = true;

        let whereClause = "GRP <> ? AND NAME LIKE ?";
        let whereValues = [];
        whereValues.push("YE");
        whereValues.push("%" + this.rangeFilter.search + "%");

        return this.sapcrmProvider.getPartnerAbstracts(whereClause, whereValues, this.currentFilteredPaginationNumber, this.TotalOfLoadedContacts, "NAME", 'NOCASE').then(
            res => {
                res = res.sort((a, b) => {
                    return a.NAME.localeCompare(b.NAME, "ca-ES");
                });
                this.allPartnersFiltered = res;
                this.pageFilteredLoadedFrom = page * this.TotalOfLoadedContacts / this.pageSize;
                this.pageFilteredLoadedTo = this.pageFilteredLoadedFrom + this.TotalOfLoadedContacts / this.pageSize - 1;
                this.pageFilteredDistanceCovered = this.pageFilteredLoadedTo - this.pageFilteredLoadedFrom + 1;
            }
        );
    }




}